import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { CartContext } from "./CartContext";
import { AuthContext } from "./AuthContext";

import {
  getProductsSnapshot,
  subscribeProducts,
  getProductById,
} from "@/services/catalog";

import {
  validateProductQuantity,
  getStockStatusLabel,
  isProductSellable,
} from "@/services/inventory";

/* =========================================================
   PREFIX STORAGE
========================================================= */

const CART_STORAGE_PREFIX = "flower-shop-cart-user-";

/* =========================================================
   KEY USER
========================================================= */

const getCartStorageKey = (userId) => {
  if (!userId) {
    return null;
  }

  return `${CART_STORAGE_PREFIX}${String(userId)}`;
};

/* =========================================================
   READ CART
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
   NORMALIZE CART ITEM
========================================================= */

const normalizeCartItem = (item) => {
  return {
    ...item,

    id: item.id,

    name: item.name || "Sản phẩm",

    price: Number(item.price) || 0,

    quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),

    image: item.image || "",

    stock: Number.isFinite(Number(item.stock))
      ? Math.max(0, Math.floor(Number(item.stock)))
      : 0,

    stockStatus: item.stockStatus || "",

    lowStockThreshold: Number.isFinite(Number(item.lowStockThreshold))
      ? Math.max(0, Math.floor(Number(item.lowStockThreshold)))
      : 3,
  };
};

/* =========================================================
   SYNC CART WITH CURRENT CATALOG
========================================================= */

const syncCartWithProducts = (cartItems, products) => {
  if (!Array.isArray(cartItems)) {
    return [];
  }

  const nextItems = [];

  for (const item of cartItems) {
    const product = getProductById(item.id, products);

    if (!product || !isProductSellable(product)) {
      continue;
    }

    const stock = Math.max(0, Math.floor(Number(product.stock) || 0));

    if (stock <= 0) {
      continue;
    }

    const quantity = Math.min(
      Math.max(1, Math.floor(Number(item.quantity) || 1)),
      stock
    );

    nextItems.push(
      normalizeCartItem({
        ...item,

        name: product.name || item.name,

        price: Number(product.price) || 0,

        image: product.image || product.images?.[0] || item.image || "",

        stock,

        stockStatus: product.stockStatus || "",

        lowStockThreshold: product.lowStockThreshold ?? 3,

        quantity,
      })
    );
  }

  return nextItems;
};

/* =========================================================
   PROVIDER
========================================================= */

const CartProvider = ({ children }) => {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("CartProvider phải được đặt bên trong AuthProvider.");
  }

  const { user } = auth;

  const products = useSyncExternalStore(
    subscribeProducts,
    getProductsSnapshot,
    getProductsSnapshot
  );

  const [cartItems, setCartItems] = useState([]);

  const [loadedUserId, setLoadedUserId] = useState(null);

  /* =======================================================
     LOAD CART
  ======================================================= */

  useEffect(() => {
    if (!user?.id) {
      setCartItems([]);
      setLoadedUserId(null);
      return;
    }

    const userId = String(user.id);

    const savedCart = readCart(userId);

    const syncedCart = syncCartWithProducts(
      savedCart.map(normalizeCartItem),
      products
    );

    setCartItems(syncedCart);

    setLoadedUserId(userId);
  }, [user?.id, products]);

  /* =======================================================
     SAVE CART
  ======================================================= */

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const userId = String(user.id);

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
     ADD TO CART
  ======================================================= */

  const addToCart = useCallback(
    (product, quantity = 1) => {
      if (!user?.id) {
        return {
          success: false,
          message: "Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng.",
        };
      }

      const currentProduct = getProductById(product?.id, products);

      const requestedQuantity = Math.floor(Number(quantity));

      const validation = validateProductQuantity(
        currentProduct,
        requestedQuantity
      );

      if (!validation.success) {
        return validation;
      }

      let result = {
        success: true,
        message: "Đã thêm sản phẩm vào giỏ hàng.",
      };

      setCartItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => String(item.id) === String(currentProduct.id)
        );

        if (existingItem) {
          const nextQuantity =
            Number(existingItem.quantity || 0) + requestedQuantity;

          const quantityValidation = validateProductQuantity(
            currentProduct,
            nextQuantity
          );

          if (!quantityValidation.success) {
            result = quantityValidation;

            return currentItems;
          }

          return currentItems.map((item) => {
            if (String(item.id) !== String(currentProduct.id)) {
              return item;
            }

            return normalizeCartItem({
              ...item,

              name: currentProduct.name,

              price: currentProduct.price,

              image:
                currentProduct.image ||
                currentProduct.images?.[0] ||
                item.image ||
                "",

              stock: currentProduct.stock,

              stockStatus: currentProduct.stockStatus,

              lowStockThreshold: currentProduct.lowStockThreshold,

              quantity: nextQuantity,
            });
          });
        }

        return [
          ...currentItems,
          normalizeCartItem({
            ...currentProduct,

            quantity: requestedQuantity,
          }),
        ];
      });

      return result;
    },
    [products, user?.id]
  );

  /* =======================================================
     REMOVE
  ======================================================= */

  const removeFromCart = useCallback((productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => String(item.id) !== String(productId))
    );
  }, []);

  /* =======================================================
     UPDATE QUANTITY
  ======================================================= */

  const updateQuantity = useCallback(
    (productId, quantity) => {
      const newQuantity = Math.floor(Number(quantity));

      if (!Number.isFinite(newQuantity) || newQuantity <= 0) {
        removeFromCart(productId);

        return {
          success: false,
          message: "Số lượng không hợp lệ.",
        };
      }

      const product = getProductById(productId, products);

      const validation = validateProductQuantity(product, newQuantity);

      if (!validation.success) {
        return validation;
      }

      setCartItems((currentItems) =>
        currentItems.map((item) => {
          if (String(item.id) !== String(productId)) {
            return item;
          }

          return normalizeCartItem({
            ...item,

            name: product.name,

            price: product.price,

            image: product.image || product.images?.[0] || item.image || "",

            stock: product.stock,

            stockStatus: product.stockStatus,

            lowStockThreshold: product.lowStockThreshold,

            quantity: newQuantity,
          });
        })
      );

      return {
        success: true,
        message: "Đã cập nhật số lượng.",
      };
    },
    [products, removeFromCart]
  );

  /* =======================================================
     INCREASE
  ======================================================= */

  const increaseQuantity = useCallback(
    (productId) => {
      const item = cartItems.find(
        (currentItem) => String(currentItem.id) === String(productId)
      );

      if (!item) {
        return {
          success: false,
          message: "Không tìm thấy sản phẩm trong giỏ.",
        };
      }

      return updateQuantity(productId, Number(item.quantity || 0) + 1);
    },
    [cartItems, updateQuantity]
  );

  /* =======================================================
     DECREASE
  ======================================================= */

  const decreaseQuantity = useCallback(
    (productId) => {
      const item = cartItems.find(
        (currentItem) => String(currentItem.id) === String(productId)
      );

      if (!item) {
        return {
          success: false,
          message: "Không tìm thấy sản phẩm trong giỏ.",
        };
      }

      const nextQuantity = Number(item.quantity || 0) - 1;

      if (nextQuantity <= 0) {
        removeFromCart(productId);

        return {
          success: true,
          message: "Đã xóa sản phẩm khỏi giỏ hàng.",
        };
      }

      return updateQuantity(productId, nextQuantity);
    },
    [cartItems, removeFromCart, updateQuantity]
  );

  /* =======================================================
     CLEAR
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
     COUNT
  ======================================================= */

  const cartCount = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0
    );
  }, [cartItems]);

  /* =======================================================
     TOTAL
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

      getStockStatusLabel,
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
