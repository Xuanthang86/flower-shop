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

import { getServerCart, saveServerCart } from "@/services/cartApi";

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

  const slug = String(item.slug || item.productSlug || "").trim();

  return {
    ...item,

    id: item.id,

    slug,

    productSlug: slug,

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

  /*
   * Catalog chưa tải dữ liệu:
   * không được coi đây là giỏ rỗng.
   */
  if (!Array.isArray(products) || products.length === 0) {
    return cartItems.map(normalizeCartItem);
  }

  const nextItems = [];

  for (const item of cartItems) {
    const product = getProductById(item.id, products);

    /*
     * Nếu Catalog chưa tìm thấy sản phẩm,
     * giữ item cũ thay vì xóa ngay.
     *
     * Điều này tránh mất giỏ hàng trong
     * lúc Catalog đang đồng bộ.
     */
    if (!product) {
      nextItems.push(normalizeCartItem(item));

      continue;
    }

    if (!isProductSellable(product)) {
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
        slug:
          product.slug ||
          product.productSlug ||
          item.slug ||
          item.productSlug ||
          "",

        productSlug:
          product.slug ||
          product.productSlug ||
          item.productSlug ||
          item.slug ||
          "",

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

const CartSession = ({ user, products, children }) => {
  const userId = user?.id ? String(user.id) : "";

  const [cartItems, setCartItems] = useState(() => {
    if (!userId) {
      return [];
    }

    const saved = readCart(userId);

    /*
     * Không đồng bộ với Catalog ngay
     * nếu Catalog chưa sẵn sàng.
     */
    if (!Array.isArray(products) || products.length === 0) {
      return saved.map(normalizeCartItem);
    }

    return syncCartWithProducts(saved.map(normalizeCartItem), products);
  });

  /*
  ========================================================
  PERSIST
  ========================================================
  */

  const persistCart = useCallback(
    (items) => {
      if (!userId) {
        return;
      }

      const normalizedItems = Array.isArray(items)
        ? items.map(normalizeCartItem)
        : [];

      const storageKey = getCartStorageKey(userId);

      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(normalizedItems));
        } catch (error) {
          console.error("Lỗi lưu giỏ hàng local:", error);
        }
      }

      saveServerCart(normalizedItems).catch((error) => {
        console.error("Không thể đồng bộ giỏ hàng với máy chủ:", error);
      });
    },
    [userId]
  );

  /*
  ========================================================
  REHYDRATE KHI CATALOG ĐÃ LOAD
  ========================================================
  */

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (!Array.isArray(products) || products.length === 0) {
      return;
    }

    setCartItems((currentItems) =>
      syncCartWithProducts(
        Array.isArray(currentItems) ? currentItems.map(normalizeCartItem) : [],
        products
      )
    );
  }, [userId, products]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    const loadServerCart = async () => {
      try {
        const serverCart = await getServerCart();

        if (cancelled) {
          return;
        }

        if (serverCart.length > 0) {
          const normalizedServerCart = serverCart.map(normalizeCartItem);

          const nextItems =
            Array.isArray(products) && products.length > 0
              ? syncCartWithProducts(normalizedServerCart, products)
              : normalizedServerCart;

          setCartItems(nextItems);

          const storageKey = getCartStorageKey(userId);

          if (storageKey) {
            try {
              localStorage.setItem(storageKey, JSON.stringify(nextItems));
            } catch (error) {
              console.error("Không thể cập nhật cache giỏ hàng:", error);
            }
          }

          return;
        }

        /*
         * Server chưa có cart:
         * migration cart cũ của trình duyệt hiện tại
         * lên MongoDB.
         */
        const localCart = readCart(userId);

        if (localCart.length > 0) {
          const normalizedLocalCart = localCart.map(normalizeCartItem);

          const nextItems =
            Array.isArray(products) && products.length > 0
              ? syncCartWithProducts(normalizedLocalCart, products)
              : normalizedLocalCart;

          setCartItems(nextItems);

          await saveServerCart(nextItems);
        }
      } catch (error) {
        console.error("Không thể tải giỏ hàng từ máy chủ:", error);
      }
    };

    loadServerCart();

    return () => {
      cancelled = true;
    };
  }, [userId, products]);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    let cancelled = false;

    const refreshServerCart = async () => {
      try {
        const serverCart = await getServerCart();

        if (cancelled) {
          return;
        }

        const normalizedServerCart = Array.isArray(serverCart)
          ? serverCart.map(normalizeCartItem)
          : [];

        const nextItems =
          Array.isArray(products) && products.length > 0
            ? syncCartWithProducts(normalizedServerCart, products)
            : normalizedServerCart;

        setCartItems(nextItems);

        const storageKey = getCartStorageKey(userId);

        if (storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(nextItems));
          } catch (error) {
            console.error("Không thể cập nhật cache giỏ hàng:", error);
          }
        }
      } catch (error) {
        console.error("Không thể refresh giỏ hàng từ máy chủ:", error);
      }
    };

    const handleFocus = () => {
      refreshServerCart();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshServerCart();
      }
    };

    const timer = window.setInterval(refreshServerCart, 10000);

    window.addEventListener("focus", handleFocus);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;

      window.clearInterval(timer);

      window.removeEventListener("focus", handleFocus);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId, products]);

  /*
  ========================================================
  ADD
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

      if (!currentProduct) {
        return {
          success: false,

          message: "Không tìm thấy sản phẩm.",
        };
      }

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
              slug:
                currentProduct.slug ||
                currentProduct.productSlug ||
                item.slug ||
                item.productSlug ||
                "",

              productSlug:
                currentProduct.slug ||
                currentProduct.productSlug ||
                item.productSlug ||
                item.slug ||
                "",

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

            slug: currentProduct.slug || currentProduct.productSlug || "",

            productSlug:
              currentProduct.slug || currentProduct.productSlug || "",

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
  UPDATE
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
  CLEAR
  ========================================================
  */

  const clearCart = useCallback(() => {
    setCartItems([]);

    if (!userId) {
      return;
    }

    const storageKey = getCartStorageKey(userId);

    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error("Lỗi xóa giỏ hàng:", error);
      }
    }

    saveServerCart([]).catch((error) => {
      console.error("Không thể xóa giỏ hàng trên máy chủ:", error);
    });
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
      cartItems.reduce(
        (total, item) =>
          total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
      ),
    [cartItems]
  );

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

  const sessionKey = user?.id ? String(user.id) : "guest";

  return (
    <CartSession key={sessionKey} user={user} products={products}>
      {children}
    </CartSession>
  );
};

export default CartProvider;
