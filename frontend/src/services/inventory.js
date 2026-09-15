import {
  getProductById,
  readProducts,
  saveProductsAsync,
} from "@/services/catalog";

/* =========================================================
   STOCK STATUS
========================================================= */

export const STOCK_STATUS = {
  IN_STOCK: "in_stock",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
  SOLD_OUT: "sold_out",
  DISABLED: "disabled",
};

/* =========================================================
   LABEL
========================================================= */

export const STOCK_STATUS_LABELS = {
  [STOCK_STATUS.IN_STOCK]: "Còn hàng",
  [STOCK_STATUS.LOW_STOCK]: "Sắp hết",
  [STOCK_STATUS.OUT_OF_STOCK]: "Hết hàng",
  [STOCK_STATUS.SOLD_OUT]: "Đã bán hết",
  [STOCK_STATUS.DISABLED]: "Ngừng bán",
};

/* =========================================================
   NUMBER
========================================================= */

export const normalizeQuantity = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.floor(number);
};

export const normalizeStock = (value) => {
  const stock = normalizeQuantity(value);

  return Math.max(0, stock);
};

export const normalizeLowStockThreshold = (value) => {
  const threshold = normalizeQuantity(value);

  return Math.max(0, threshold);
};

/* =========================================================
   STOCK STATUS
========================================================= */

export const getStockStatus = (product = {}) => {
  const disabled = Boolean(product.disabled);

  if (disabled) {
    return STOCK_STATUS.DISABLED;
  }

  const soldOut = Boolean(product.soldOut);

  if (soldOut) {
    return STOCK_STATUS.SOLD_OUT;
  }

  const stock = normalizeStock(product.stock);

  if (stock <= 0) {
    return STOCK_STATUS.OUT_OF_STOCK;
  }

  const threshold = normalizeLowStockThreshold(product.lowStockThreshold ?? 3);

  if (stock <= threshold) {
    return STOCK_STATUS.LOW_STOCK;
  }

  return STOCK_STATUS.IN_STOCK;
};

export const getStockStatusLabel = (product = {}) => {
  const status = getStockStatus(product);

  return STOCK_STATUS_LABELS[status] || "Không xác định";
};

/* =========================================================
   CÓ THỂ BÁN?
========================================================= */

export const isProductSellable = (product = {}) => {
  const status = getStockStatus(product);

  return status === STOCK_STATUS.IN_STOCK || status === STOCK_STATUS.LOW_STOCK;
};

/* =========================================================
   KIỂM TRA SỐ LƯỢNG
========================================================= */

export const validateProductQuantity = (product, quantity) => {
  const requestedQuantity = normalizeQuantity(quantity);

  if (requestedQuantity <= 0) {
    return {
      success: false,
      message: "Số lượng phải lớn hơn 0.",
    };
  }

  if (!product) {
    return {
      success: false,
      message: "Không tìm thấy sản phẩm.",
    };
  }

  if (product.disabled) {
    return {
      success: false,
      message: "Sản phẩm hiện đang ngừng bán.",
    };
  }

  if (product.soldOut) {
    return {
      success: false,
      message: "Sản phẩm đã bán hết.",
    };
  }

  const stock = normalizeStock(product.stock);

  if (stock <= 0) {
    return {
      success: false,
      message: "Sản phẩm hiện đã hết hàng.",
    };
  }

  if (requestedQuantity > stock) {
    return {
      success: false,
      message: `Sản phẩm chỉ còn ${stock} sản phẩm trong kho.`,
      stock,
      requestedQuantity,
    };
  }

  return {
    success: true,
    stock,
    requestedQuantity,
  };
};

/* =========================================================
   VALIDATE CART
========================================================= */

export const validateCartStock = (items = [], products = readProducts()) => {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      success: false,
      message: "Giỏ hàng đang trống.",
      items: [],
    };
  }

  const errors = [];
  const validatedItems = [];

  for (const item of items) {
    const product = getProductById(item?.id, products);

    if (!product) {
      errors.push({
        productId: item?.id,
        message: `Không tìm thấy sản phẩm "${item?.name || "Sản phẩm"}".`,
      });

      continue;
    }

    const result = validateProductQuantity(product, item?.quantity);

    if (!result.success) {
      errors.push({
        productId: product.id,
        name: product.name,
        message: result.message,
      });

      continue;
    }

    validatedItems.push({
      item,
      product,
      stock: result.stock,
      quantity: result.requestedQuantity,
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: errors[0].message,
      errors,
      items: validatedItems,
    };
  }

  return {
    success: true,
    items: validatedItems,
  };
};

/* =========================================================
   TRỪ TỒN KHI ĐẶT HÀNG
========================================================= */

export const consumeStockForItems = async (items = [], options = {}) => {
  const products = Array.isArray(options.products)
    ? options.products
    : readProducts();

  const validation = validateCartStock(items, products);

  if (!validation.success) {
    return {
      success: false,
      message: validation.message,
      errors: validation.errors || [],
    };
  }

  const snapshots = [];

  const nextProducts = products.map((product) => {
    const matched = validation.items.find(
      ({ product: validatedProduct }) =>
        String(validatedProduct.id) === String(product.id)
    );

    if (!matched) {
      return product;
    }

    const stockBefore = normalizeStock(product.stock);
    const stockAfter = stockBefore - matched.quantity;

    snapshots.push({
      productId: product.id,
      name: product.name,
      quantity: matched.quantity,
      stockBefore,
      stockAfter,
      stockStatusBefore: getStockStatus(product),
    });

    return {
      ...product,
      stock: stockAfter,
      soldOut: false,
      stockStatus: getStockStatus({
        ...product,
        stock: stockAfter,
        soldOut: false,
      }),
    };
  });

  try {
    const savedProducts = await saveProductsAsync(nextProducts);

    return {
      success: true,
      products: savedProducts,
      snapshots,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error?.message || "Không thể cập nhật tồn kho. Vui lòng thử lại.",
      error,
    };
  }
};

/* =========================================================
   HOÀN TỒN
========================================================= */

export const restockOrderItems = async (items = [], options = {}) => {
  const products = Array.isArray(options.products)
    ? options.products
    : readProducts();

  if (!Array.isArray(items) || items.length === 0) {
    return {
      success: true,
      products,
      snapshots: [],
    };
  }

  const snapshots = [];

  const nextProducts = products.map((product) => {
    const matched = items.find(
      (item) => String(item?.id ?? item?.productId) === String(product.id)
    );

    if (!matched) {
      return product;
    }

    const quantity = normalizeQuantity(matched.quantity);

    if (quantity <= 0) {
      return product;
    }

    const stockBefore = normalizeStock(product.stock);
    const stockAfter = stockBefore + quantity;

    snapshots.push({
      productId: product.id,
      name: product.name,
      quantity,
      stockBefore,
      stockAfter,
      stockStatusBefore: getStockStatus(product),
    });

    return {
      ...product,
      stock: stockAfter,
      soldOut: false,
      stockStatus: getStockStatus({
        ...product,
        stock: stockAfter,
        soldOut: false,
      }),
    };
  });

  try {
    const savedProducts = await saveProductsAsync(nextProducts);

    return {
      success: true,
      products: savedProducts,
      snapshots,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Không thể hoàn tồn kho. Vui lòng thử lại.",
      error,
    };
  }
};

/* =========================================================
   ĐIỀU CHỈNH TỒN ADMIN
========================================================= */

export const adjustProductStock = async (
  productId,
  nextStock,
  options = {}
) => {
  const products = Array.isArray(options.products)
    ? options.products
    : readProducts();

  const normalizedStock = normalizeStock(nextStock);

  const product = getProductById(productId, products);

  if (!product) {
    return {
      success: false,
      message: "Không tìm thấy sản phẩm.",
    };
  }

  const nextProducts = products.map((currentProduct) => {
    if (String(currentProduct.id) !== String(productId)) {
      return currentProduct;
    }

    const nextProduct = {
      ...currentProduct,
      stock: normalizedStock,
      soldOut:
        options.soldOut === undefined
          ? Boolean(currentProduct.soldOut)
          : Boolean(options.soldOut),
      disabled:
        options.disabled === undefined
          ? Boolean(currentProduct.disabled)
          : Boolean(options.disabled),
      lowStockThreshold:
        options.lowStockThreshold === undefined
          ? normalizeLowStockThreshold(currentProduct.lowStockThreshold ?? 3)
          : normalizeLowStockThreshold(options.lowStockThreshold),
    };

    return {
      ...nextProduct,
      stockStatus: getStockStatus(nextProduct),
    };
  });

  try {
    const savedProducts = await saveProductsAsync(nextProducts);

    const updatedProduct = getProductById(productId, savedProducts);

    return {
      success: true,
      product: updatedProduct,
      products: savedProducts,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Không thể cập nhật tồn kho.",
      error,
    };
  }
};

/* =========================================================
   NORMALIZE PRODUCT INVENTORY
========================================================= */

export const normalizeInventoryProduct = (product = {}) => {
  const stock = normalizeStock(product.stock);

  const lowStockThreshold = normalizeLowStockThreshold(
    product.lowStockThreshold ?? 3
  );

  const normalized = {
    ...product,
    stock,
    lowStockThreshold,
    disabled: Boolean(product.disabled),
    soldOut: Boolean(product.soldOut),
  };

  return {
    ...normalized,
    stockStatus: getStockStatus(normalized),
  };
};
