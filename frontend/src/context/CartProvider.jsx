import {
  useCallback,
  useContext,
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

const CART_STORAGE_PREFIX = "flower-shop-cart-user-";

const getCartStorageKey = (userId) => {
  if (!userId) {
    return null;
  }

  return `${CART_STORAGE_PREFIX}${String(userId)}`;
};

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

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.error("Lỗi đọc giỏ hàng:", error);

    return [];
  }
};

const normalizeCartItem = (item = {}) => {
  const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

  const stock = Number.isFinite(Number(item.stock))
    ? Math.max(0, Math.floor(Number(item.stock)))
    : 0;

  const lowStockThreshold = Number.isFinite(Number(item.lowStockThreshold))
    ? Math.max(0, Math.floor(Number(item.lowStockThreshold)))
    : 3;

  return {
    ...item,

    id: item.id,

    name: item.name || "Sản phẩm",

    price: Number(item.price) || 0,

    quantity,

    image: item.image || "",

    stock,

    stockStatus: item.stockStatus || "",

    lowStockThreshold,
  };
};

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

/*
=========================================================
CART SESSION

Mỗi user có một CartSession riêng.
Không dùng useEffect để reset state khi đổi user.
=========================================================
*/

const CartSession = ({ user, products, children }) => {
  const userId = user?.id ? String(user.id) : "";

  const [cartItems, setCartItems] = useState(() => {
    if (!userId) {
      return [];
    }

    return syncCartWithProducts(
      readCart(userId).map(normalizeCartItem),
      products
    );
  });

  /*
  ========================================================
  SAVE CART
  ========================================================
  */

  const persistCart = useCallback(
    (items) => {
      if (!userId) {
        return;
      }

      const storageKey = getCartStorageKey(userId);

      if (!storageKey) {
        return;
      }

      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
      } catch (error) {
        console.error("Lỗi lưu giỏ hàng:", error);
      }
    },
    [userId]
  );

  /*
  ========================================================
  ADD TO CART
  ========================================================
  */

  const addToCart = useCallback(
    (product, quantity = 1) => {
      if (!userId) {
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

          const nextItems = currentItems.map((item) => {
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

              lowStockThreshold: currentProduct.lowStockThreshold ?? 3,

              quantity: nextQuantity,
            });
          });

          persistCart(nextItems);

          return nextItems;
        }

        const nextItems = [
          ...currentItems,
          normalizeCartItem({
            ...currentProduct,
            quantity: requestedQuantity,
          }),
        ];

        persistCart(nextItems);

        return nextItems;
      });

      return result;
    },
    [products, userId, persistCart]
  );

  /*
  ========================================================
  REMOVE
  ========================================================
  */

  const removeFromCart = useCallback(
    (productId) => {
      setCartItems((currentItems) => {
        const nextItems = currentItems.filter(
          (item) => String(item.id) !== String(productId)
        );

        persistCart(nextItems);

        return nextItems;
      });
    },
    [persistCart]
  );

  /*
  ========================================================
  UPDATE QUANTITY
  ========================================================
  */

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

      setCartItems((currentItems) => {
        const nextItems = currentItems.map((item) => {
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

            lowStockThreshold: product.lowStockThreshold ?? 3,

            quantity: newQuantity,
          });
        });

        persistCart(nextItems);

        return nextItems;
      });

      return {
        success: true,
        message: "Đã cập nhật số lượng.",
      };
    },
    [products, removeFromCart, persistCart]
  );

  /*
  ========================================================
  INCREASE
  ========================================================
  */

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

  /*
  ========================================================
  DECREASE
  ========================================================
  */

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

  /*
  ========================================================
  CLEAR CART
  ========================================================
  */

  const clearCart = useCallback(() => {
    setCartItems([]);

    if (!userId) {
      return;
    }

    const storageKey = getCartStorageKey(userId);

    if (!storageKey) {
      return;
    }

    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Lỗi xóa giỏ hàng:", error);
    }
  }, [userId]);

  /*
  ========================================================
  COUNT
  ========================================================
  */

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + (Number(item.quantity) || 0),
        0
      ),
    [cartItems]
  );

  /*
  ========================================================
  TOTAL
  ========================================================
  */

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        const price = Number(item.price) || 0;

        const quantity = Number(item.quantity) || 0;

        return total + price * quantity;
      }, 0),
    [cartItems]
  );

  /*
  ========================================================
  CONTEXT VALUE
  ========================================================
  */

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

/*
=========================================================
PROVIDER
=========================================================
*/

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

  /*
   * key thay đổi khi user thay đổi.
   *
   * Vì vậy CartSession cũ bị unmount và CartSession
   * của user mới được khởi tạo từ đúng localStorage.
   *
   * Không cần useEffect + setCartItems để reset state.
   */

  const sessionKey = user?.id ? String(user.id) : "guest";

  return (
    <CartSession key={sessionKey} user={user} products={products}>
      {children}
    </CartSession>
  );
};

export default CartProvider;
