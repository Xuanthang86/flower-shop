/*
============================================================
FLOWER SHOP — CATALOG SERVICE
============================================================

Quản lý tập trung:
- Products
- Categories
- Đồng bộ Home / Products / Product Detail / Admin
- Bảo vệ dữ liệu seed
- Chuẩn hóa Product
- IndexedDB là nguồn lưu trữ chính cho catalog sản phẩm
- External store để React đồng bộ dữ liệu catalog

KIẾN TRÚC PRODUCT:
- IndexedDB = frontend source of truth.
- localStorage Product chỉ còn được dùng một lần cho migration legacy.
- Remote snapshot phải đi qua Catalog, không ghi Product trực tiếp vào localStorage.
============================================================
*/

import { products as defaultProducts } from "@/data/products";

import {
  readProductsFromIndexedDB,
  saveProductsToIndexedDB,
} from "@/services/catalogStorage";

import {
  DEFAULT_PRODUCT_CATEGORIES,
  PRODUCT_CATEGORIES_STORAGE_KEY,
  CATEGORY_UPDATED_EVENT,
  normalizeCategories,
  slugifyCategory,
} from "@/constants/productCategories";

/*
 * Legacy key chỉ được giữ để migrate dữ liệu Product cũ một lần.
 * Không được dùng làm Product database sau khi IndexedDB đã có dữ liệu.
 */
export const PRODUCT_STORAGE_KEY = "flower-shop-products";

export const PRODUCT_UPDATED_EVENT = "flower-shop-products-updated";

let productsCache = null;
let productsPersistencePromise = Promise.resolve();
let productsHydrationPromise = null;
let productsMutationVersion = 0;

const productsSubscribers = new Set();

const EMPTY_PRODUCTS_SNAPSHOT = [];

export { CATEGORY_UPDATED_EVENT };

const nowIso = () => new Date().toISOString();

const parseTimestamp = (value) => {
  const timestamp = value ? new Date(value).getTime() : NaN;

  return Number.isFinite(timestamp) ? timestamp : 0;
};

const dispatchProductUpdated = (source = "local") => {
  const event = new CustomEvent(PRODUCT_UPDATED_EVENT, {
    detail: {
      source,
      changedAt: nowIso(),
      mutationVersion: productsMutationVersion,
    },
  });

  window.dispatchEvent(event);
};

const notifyProductsSubscribers = () => {
  productsSubscribers.forEach((subscriber) => {
    subscriber();
  });
};

export const subscribeProducts = (subscriber) => {
  productsSubscribers.add(subscriber);

  return () => {
    productsSubscribers.delete(subscriber);
  };
};

export const getProductsSnapshot = () =>
  Array.isArray(productsCache) ? productsCache : EMPTY_PRODUCTS_SNAPSHOT;

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const normalizeProductId = (product = {}, fallback = {}) => {
  const rawId =
    product.id ??
    product._id ??
    product.productId ??
    fallback.id ??
    fallback._id ??
    fallback.productId;

  if (rawId === null || rawId === undefined || String(rawId).trim() === "") {
    return "";
  }

  return String(rawId).trim();
};

const normalizeCategoryValue = (value, fallback = "") => {
  if (value && typeof value === "object") {
    const objectValue =
      value.slug ??
      value.query ??
      value.categorySlug ??
      value.id ??
      value.name ??
      value.label;

    return normalizeCategoryValue(objectValue, fallback);
  }

  const raw = String(value ?? fallback ?? "").trim();

  if (!raw) {
    return "";
  }

  return slugifyCategory(raw);
};

const normalizeImages = (merged, image) => {
  const source = Array.isArray(merged.images)
    ? merged.images
    : [merged.image, merged.imageUrl, merged.thumbnail];

  const normalized = source
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean);

  if (image && !normalized.includes(image)) {
    normalized.unshift(image);
  }

  return [...new Set(normalized)];
};

const normalizeDiscount = (price, oldPrice, value) => {
  const explicit = safeNumber(value, NaN);

  if (Number.isFinite(explicit) && explicit >= 0) {
    return explicit;
  }

  if (oldPrice > price && oldPrice > 0) {
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  return 0;
};

export const normalizeProduct = (product = {}, fallback = {}) => {
  const merged = {
    ...fallback,
    ...product,
  };

  const id = normalizeProductId(product, fallback);

  const image = String(
    merged.image ||
      merged.images?.[0] ||
      merged.imageUrl ||
      merged.thumbnail ||
      fallback.image ||
      fallback.images?.[0] ||
      fallback.imageUrl ||
      fallback.thumbnail ||
      ""
  ).trim();

  const price = safeNumber(merged.price ?? fallback.price, 0);

  const oldPrice =
    merged.oldPrice === null ||
    merged.oldPrice === undefined ||
    merged.oldPrice === ""
      ? null
      : safeNumber(merged.oldPrice, 0);

  const createdAt =
    merged.createdAt || merged.created_at || fallback.createdAt || null;

  const updatedAt =
    merged.updatedAt || merged.updated_at || fallback.updatedAt || null;

  return {
    ...merged,

    id,

    name: String(merged.name || fallback.name || "").trim(),

    category: normalizeCategoryValue(
      merged.category ??
        merged.categorySlug ??
        merged.categoryId ??
        merged.categoryName,
      fallback.category
    ),

    price,

    oldPrice,

    discount: normalizeDiscount(price, oldPrice, merged.discount),

    badge: String(merged.badge || fallback.badge || "").trim(),

    image,

    images: normalizeImages(merged, image),

    description: String(
      merged.description || fallback.description || ""
    ).trim(),

    salesCount: safeNumber(
      merged.salesCount ??
        merged.sold ??
        merged.sales ??
        fallback.salesCount ??
        fallback.sold,
      0
    ),

    isNew: Boolean(merged.isNew ?? fallback.isNew ?? false),

    createdAt,

    updatedAt,
  };
};

export const normalizeProducts = (items, seedProducts = defaultProducts) => {
  if (!Array.isArray(items)) {
    return [];
  }

  const seedById = new Map(
    seedProducts.map((product) => [String(product.id), product])
  );

  const seedByName = new Map(
    seedProducts.map((product) => [
      String(product.name || "")
        .trim()
        .toLowerCase(),
      product,
    ])
  );

  const seen = new Set();

  return items
    .map((product) => {
      const idFallback = seedById.get(String(product?.id)) || {};

      const nameFallback =
        seedByName.get(
          String(product?.name || "")
            .trim()
            .toLowerCase()
        ) || {};

      const fallback = {
        ...nameFallback,
        ...idFallback,
      };

      return normalizeProduct(product, fallback);
    })
    .filter((product) => {
      if (!product.id || seen.has(product.id)) {
        return false;
      }

      seen.add(product.id);

      return true;
    });
};

const readJson = (key) => {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error(`Không thể đọc dữ liệu ${key}:`, error);

    return null;
  }
};

const isQuotaExceededError = (error) => {
  if (!error) {
    return false;
  }

  const name = String(error.name || "").toLowerCase();
  const message = String(error.message || "").toLowerCase();

  return (
    name === "quotaexceedederror" ||
    name === "ns_error_dom_quota_reached" ||
    Number(error.code) === 22 ||
    Number(error.code) === 1014 ||
    message.includes("quota") ||
    message.includes("storage") ||
    message.includes("exceeded") ||
    message.includes("full") ||
    message.includes("maximum size")
  );
};

const getStorageWriteErrorMessage = (error, entityLabel = "dữ liệu") => {
  if (isQuotaExceededError(error)) {
    return (
      `Không thể lưu ${entityLabel} vì bộ nhớ trình duyệt đã đạt giới hạn ` +
      `hoặc không còn đủ dung lượng. Hãy kiểm tra/xóa dữ liệu website ` +
      `không cần thiết trong trình duyệt rồi thực hiện lại thao tác.`
    );
  }

  const name = String(error?.name || "").toLowerCase();

  if (name === "securityerror" || name === "notallowederror") {
    return (
      `Trình duyệt hiện không cho phép website ghi vào bộ nhớ. ` +
      `Hãy kiểm tra chế độ riêng tư hoặc quyền lưu dữ liệu website.`
    );
  }

  return (
    `Không thể lưu ${entityLabel}. ` +
    `Nguyên nhân kỹ thuật: ${error?.message || "không xác định"}`
  );
};

const createStorageWriteError = (error, entityLabel) =>
  new Error(getStorageWriteErrorMessage(error, entityLabel), {
    cause: error,
  });

const writeJson = (key, value, entityLabel = "dữ liệu") => {
  let serialized;

  try {
    serialized = JSON.stringify(value);
  } catch (error) {
    throw createStorageWriteError(error, entityLabel);
  }

  try {
    localStorage.setItem(key, serialized);

    return true;
  } catch (error) {
    throw createStorageWriteError(error, entityLabel);
  }
};

const writeJsonSafely = (key, value, entityLabel = "dữ liệu") => {
  try {
    return writeJson(key, value, entityLabel);
  } catch (error) {
    console.error(`Không thể ghi dữ liệu phụ trợ ${key}:`, error);

    return false;
  }
};

const getLegacyProductsForMigration = () => {
  const stored = readJson(PRODUCT_STORAGE_KEY);

  if (!Array.isArray(stored)) {
    return normalizeProducts(defaultProducts);
  }

  return normalizeProducts(stored, defaultProducts);
};

const createProductPersistenceError = (error) =>
  new Error(
    `Không thể lưu danh sách sản phẩm vào IndexedDB. ${
      error?.message || "Nguyên nhân không xác định."
    }`,
    { cause: error }
  );

const removeLegacyProductStorage = () => {
  try {
    localStorage.removeItem(PRODUCT_STORAGE_KEY);
  } catch (removeError) {
    console.warn(
      "Không thể xóa dữ liệu sản phẩm cũ khỏi localStorage:",
      removeError
    );
  }
};

const persistProducts = async (products) => {
  try {
    await saveProductsToIndexedDB(products);

    /* Chỉ xóa Product legacy sau khi IndexedDB đã ghi thành công. */
    removeLegacyProductStorage();

    return products;
  } catch (error) {
    throw createProductPersistenceError(error);
  }
};

const productComparable = (product) => {
  const comparable = { ...product };

  delete comparable.updatedAt;

  return JSON.stringify(comparable);
};

const prepareProductsForLocalMutation = (products, previousProducts) => {
  const previousById = new Map(
    previousProducts.map((product) => [String(product.id), product])
  );

  const timestamp = nowIso();

  return products.map((product) => {
    const previous = previousById.get(String(product.id));

    if (!previous) {
      return {
        ...product,
        createdAt: product.createdAt || timestamp,
        updatedAt: timestamp,
      };
    }

    if (productComparable(previous) !== productComparable(product)) {
      return {
        ...product,
        createdAt: product.createdAt || previous.createdAt || timestamp,
        updatedAt: timestamp,
      };
    }

    return {
      ...product,
      createdAt: product.createdAt || previous.createdAt || null,
      updatedAt: product.updatedAt || previous.updatedAt || null,
    };
  });
};

const hydrateProductsFromIndexedDB = async () => {
  const hydrationVersion = productsMutationVersion;

  try {
    const indexedProducts = await readProductsFromIndexedDB();

    if (productsMutationVersion !== hydrationVersion) {
      return productsCache;
    }

    if (Array.isArray(indexedProducts)) {
      productsCache = normalizeProducts(indexedProducts, defaultProducts);

      removeLegacyProductStorage();

      notifyProductsSubscribers();
      dispatchProductUpdated("hydrate");

      return productsCache;
    }

    /*
     * IndexedDB chưa có dữ liệu: đây là migration legacy duy nhất.
     * Sau khi ghi thành công IndexedDB, Product legacy bị xóa.
     */
    const legacyProducts = getLegacyProductsForMigration();

    if (productsMutationVersion !== hydrationVersion) {
      return productsCache;
    }

    productsCache = legacyProducts;

    await saveProductsToIndexedDB(legacyProducts);

    removeLegacyProductStorage();

    notifyProductsSubscribers();
    dispatchProductUpdated("hydrate");

    return productsCache;
  } catch (error) {
    console.error("Không thể khởi tạo kho sản phẩm IndexedDB:", error);

    /*
     * Không quay lại localStorage như một Product database thứ hai.
     * Khi IndexedDB không khả dụng, chỉ dùng seed trong memory để UI
     * không blank; dữ liệu này không được coi là persisted Product data.
     */
    if (!Array.isArray(productsCache)) {
      productsCache = normalizeProducts(defaultProducts);
    }

    notifyProductsSubscribers();

    return productsCache;
  }
};

export const hydrateProducts = () => {
  if (!productsHydrationPromise) {
    productsHydrationPromise = hydrateProductsFromIndexedDB();
  }

  return productsHydrationPromise;
};

export const readProducts = () => {
  if (!Array.isArray(productsCache)) {
    productsCache = normalizeProducts(defaultProducts);
  }

  return productsCache;
};

export const saveProducts = (products) => {
  const previousProducts = Array.isArray(productsCache)
    ? productsCache
    : normalizeProducts(defaultProducts);

  const normalized = normalizeProducts(products, defaultProducts);
  const prepared = prepareProductsForLocalMutation(
    normalized,
    previousProducts
  );

  productsMutationVersion += 1;
  productsCache = prepared;

  const nextPersistence = productsPersistencePromise
    .catch(() => undefined)
    .then(() => hydrateProducts())
    .then(() => persistProducts(prepared));

  productsPersistencePromise = nextPersistence;

  nextPersistence.catch((error) => {
    console.error("Không thể lưu danh sách sản phẩm:", error);
  });

  notifyProductsSubscribers();
  dispatchProductUpdated("local");

  return prepared;
};

export const saveProductsAsync = async (products) => {
  await hydrateProducts();

  const previousProducts = Array.isArray(productsCache)
    ? productsCache
    : normalizeProducts(defaultProducts);

  const normalized = normalizeProducts(products, defaultProducts);
  const prepared = prepareProductsForLocalMutation(
    normalized,
    previousProducts
  );

  productsMutationVersion += 1;
  productsCache = prepared;

  const nextPersistence = productsPersistencePromise
    .catch(() => undefined)
    .then(() => persistProducts(prepared));

  productsPersistencePromise = nextPersistence;

  notifyProductsSubscribers();
  dispatchProductUpdated("local");

  await nextPersistence;

  return prepared;
};

const productsAreEqual = (left, right) => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every(
    (product, index) =>
      productComparable(product) === productComparable(right[index])
  );
};

const mergeRemoteProducts = (
  localProducts,
  remoteProducts,
  remoteUpdatedAt
) => {
  const localById = new Map(
    localProducts.map((product) => [String(product.id), product])
  );

  const remoteById = new Map(
    remoteProducts.map((product) => [String(product.id), product])
  );

  const merged = [];
  const seen = new Set();
  const remoteTimestamp = parseTimestamp(remoteUpdatedAt);

  for (const remoteProduct of remoteProducts) {
    const id = String(remoteProduct.id);
    const localProduct = localById.get(id);

    if (!localProduct) {
      merged.push(remoteProduct);
      seen.add(id);
      continue;
    }

    const localUpdatedAt = parseTimestamp(localProduct.updatedAt);
    const remoteProductUpdatedAt =
      parseTimestamp(remoteProduct.updatedAt) || remoteTimestamp;

    if (localUpdatedAt > remoteProductUpdatedAt) {
      merged.push(localProduct);
    } else {
      merged.push(remoteProduct);
    }

    seen.add(id);
  }

  /*
   * Sản phẩm chỉ có ở local được giữ lại nếu nó mới hơn snapshot remote.
   * Nếu local không có timestamp, remote snapshot được phép xác định việc
   * xóa sản phẩm cũ để tránh dữ liệu stale tồn tại mãi.
   */
  for (const localProduct of localProducts) {
    const id = String(localProduct.id);

    if (seen.has(id) || remoteById.has(id)) {
      continue;
    }

    const localUpdatedAt = parseTimestamp(localProduct.updatedAt);

    if (localUpdatedAt > remoteTimestamp || !remoteTimestamp) {
      merged.push(localProduct);
    }
  }

  return normalizeProducts(merged, defaultProducts);
};

export const applyRemoteProducts = async (
  remoteProducts,
  remoteUpdatedAt = null
) => {
  await hydrateProducts();

  const normalizedRemote = normalizeProducts(remoteProducts, defaultProducts);

  const localProducts = Array.isArray(productsCache)
    ? productsCache
    : normalizeProducts(defaultProducts);

  const merged = mergeRemoteProducts(
    localProducts,
    normalizedRemote,
    remoteUpdatedAt
  );

  if (productsAreEqual(localProducts, merged)) {
    return localProducts;
  }

  productsMutationVersion += 1;
  productsCache = merged;

  const nextPersistence = productsPersistencePromise
    .catch(() => undefined)
    .then(() => persistProducts(merged));

  productsPersistencePromise = nextPersistence;

  await nextPersistence;

  notifyProductsSubscribers();
  dispatchProductUpdated("remote");

  return merged;
};

export const waitForProductsPersistence = async () => {
  await productsPersistencePromise;
};

/* Khởi động hydrate khi catalog service được import lần đầu. */
hydrateProducts();

export const getProductById = (productId, products = readProducts()) =>
  products.find((product) => String(product.id) === String(productId)) || null;

export const getProductsByCategory = (
  categorySlug,
  products = readProducts()
) =>
  products.filter(
    (product) => String(product.category) === String(categorySlug)
  );

export const searchProducts = (keyword, products = readProducts()) => {
  const query = String(keyword || "")
    .trim()
    .toLowerCase();

  if (!query) {
    return products;
  }

  return products.filter((product) =>
    [product.name, product.category, product.badge, product.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query)
  );
};

export const getFeaturedProducts = (
  categorySlug,
  limit = 5,
  products = readProducts()
) =>
  getProductsByCategory(categorySlug, products)
    .sort((a, b) => {
      const newDifference = Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));

      if (newDifference !== 0) {
        return newDifference;
      }

      return Number(b.salesCount || 0) - Number(a.salesCount || 0);
    })
    .slice(0, limit);

export const readCategories = () => {
  const stored = readJson(PRODUCT_CATEGORIES_STORAGE_KEY);

  if (Array.isArray(stored) && stored.length > 0) {
    return normalizeCategories(stored);
  }

  const seeded = normalizeCategories(DEFAULT_PRODUCT_CATEGORIES);

  writeJsonSafely(PRODUCT_CATEGORIES_STORAGE_KEY, seeded, "danh mục mặc định");

  return seeded;
};

export const saveCategories = (categories) => {
  const normalized = normalizeCategories(categories);

  writeJson(PRODUCT_CATEGORIES_STORAGE_KEY, normalized, "danh mục");

  window.dispatchEvent(new Event(CATEGORY_UPDATED_EVENT));

  return normalized;
};

export const getCategoryBySlug = (slug, categories = readCategories()) =>
  categories.find((category) => String(category.slug) === String(slug)) || null;

export const getActiveCategories = (categories = readCategories()) =>
  categories
    .filter((category) => category.active !== false)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

export const getCatalogSnapshot = () => ({
  products: getProductsSnapshot(),
  categories: readCategories(),
});
