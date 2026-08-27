import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { CartContext } from "./CartContext";
import { AuthContext } from "./AuthContext";

/* =========================================================
   PREFIX STORAGE
========================================================= */

const CART_STORAGE_PREFIX = "flower-shop-cart-user-";

/* =========================================================
   TẠO KEY THEO USER
========================================================= */

const getCartStorageKey = (userId) => {
  if (!userId) {
    return null;
  }

  return `${CART_STORAGE_PREFIX}${String(userId)}`;
};

/* =========================================================
   ĐỌC CART
========================================================= */

const readCart = (userId) => {
  const storageKey = getCartStorageKey(userId);

  if (!storageKey) {
    return [];
  }

  try {
    const savedCart = localStorage.getItem(storageKey);

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart;
  } catch (error) {
    console.error("Lỗi đọc giỏ hàng:", error);

    return [];
  }
};

/* =========================================================
   CHUẨN HÓA SẢN PHẨM
========================================================= */

const normalizeCartItem = (item) => {
  return {
    ...item,

    id: item.id,

    name: item.name || "Sản phẩm",

    price: Number(item.price) || 0,

    quantity: Math.max(1, Number(item.quantity) || 1),

    image: item.image || "",
  };
};

/* =========================================================
   CART PROVIDER
========================================================= */

const CartProvider = ({ children }) => {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("CartProvider phải được đặt bên trong AuthProvider.");
  }

  const { user } = auth;

  /* =======================================================
     CART HIỆN TẠI
  ======================================================= */

  const [cartItems, setCartItems] = useState([]);

  /* =======================================================
     USER ĐANG ĐƯỢC LOAD CART
     
     Biến này rất quan trọng.
     
     Nó ngăn effect lưu [] vào nhầm cart của user cũ
     trong thời điểm chuyển tài khoản.
  ======================================================= */

  const [loadedUserId, setLoadedUserId] = useState(null);

  /* =======================================================
     KHI USER THAY ĐỔI
     
     - Logout → cart = []
     - Login user mới → đọc cart riêng
     - User mới chưa có cart → []
  ======================================================= */

  useEffect(() => {
    if (!user?.id) {
      setCartItems([]);
      setLoadedUserId(null);
      return;
    }

    const userId = String(user.id);

    const savedCart = readCart(userId);

    setCartItems(savedCart.map(normalizeCartItem));

    setLoadedUserId(userId);
  }, [user?.id]);

  /* =======================================================
     LƯU CART THEO USER
  ======================================================= */

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const userId = String(user.id);

    /*
      Chỉ lưu khi cart thực sự thuộc user hiện tại.
    */

    if (loadedUserId !== userId) {
      return;
    }

    const storageKey = getCartStorageKey(userId);

    if (!storageKey) {
      return;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Lỗi lưu giỏ hàng:", error);
    }
  }, [cartItems, user?.id, loadedUserId]);

  /* =======================================================
     THÊM VÀO GIỎ
  ======================================================= */

  const addToCart = useCallback(
    (product, quantity = 1) => {
      if (!user?.id) {
        return {
          success: false,
          message: "Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng.",
        };
      }

      const normalizedProduct = normalizeCartItem({
        ...product,
        quantity,
      });

      setCartItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => String(item.id) === String(normalizedProduct.id)
        );

        if (existingItem) {
          return currentItems.map((item) => {
            if (String(item.id) !== String(normalizedProduct.id)) {
              return item;
            }

            return {
              ...item,
              quantity: item.quantity + normalizedProduct.quantity,
            };
          });
        }

        return [...currentItems, normalizedProduct];
      });

      return {
        success: true,
      };
    },
    [user?.id]
  );

  /* =======================================================
     XÓA SẢN PHẨM
  ======================================================= */

  const removeFromCart = useCallback((productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => String(item.id) !== String(productId))
    );
  }, []);

  /* =======================================================
     CẬP NHẬT SỐ LƯỢNG
  ======================================================= */

  const updateQuantity = useCallback(
    (productId, quantity) => {
      const newQuantity = Number(quantity);

      if (!Number.isFinite(newQuantity) || newQuantity <= 0) {
        removeFromCart(productId);
        return;
      }

      setCartItems((currentItems) =>
        currentItems.map((item) => {
          if (String(item.id) !== String(productId)) {
            return item;
          }

          return {
            ...item,
            quantity: Math.floor(newQuantity),
          };
        })
      );
    },
    [removeFromCart]
  );

  /* =======================================================
     TĂNG SỐ LƯỢNG
  ======================================================= */

  const increaseQuantity = useCallback((productId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (String(item.id) !== String(productId)) {
          return item;
        }

        return {
          ...item,
          quantity: Number(item.quantity || 0) + 1,
        };
      })
    );
  }, []);

  /* =======================================================
     GIẢM SỐ LƯỢNG
  ======================================================= */

  const decreaseQuantity = useCallback((productId) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => {
          if (String(item.id) !== String(productId)) {
            return item;
          }

          return {
            ...item,
            quantity: Number(item.quantity || 0) - 1,
          };
        })
        .filter((item) => Number(item.quantity) > 0)
    );
  }, []);

  /* =======================================================
     XÓA TOÀN BỘ CART
  ======================================================= */

  const clearCart = useCallback(() => {
    setCartItems([]);

    if (!user?.id) {
      return;
    }

    const storageKey = getCartStorageKey(user.id);

    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Lỗi xóa giỏ hàng:", error);
    }
  }, [user?.id]);

  /* =======================================================
     TỔNG SỐ LƯỢNG
  ======================================================= */

  const cartCount = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0
    );
  }, [cartItems]);

  /* =======================================================
     TỔNG TIỀN
  ======================================================= */

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;

      const quantity = Number(item.quantity) || 0;

      return total + price * quantity;
    }, 0);
  }, [cartItems]);

  /* =======================================================
     VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      cartItems,

      cartCount,

      cartTotal,

      addToCart,

      removeFromCart,

      updateQuantity,

      increaseQuantity,

      decreaseQuantity,

      clearCart,
    }),
    [
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
