/*
============================================================
FLOWER SHOP — CATALOG SERVICE
============================================================

Mục đích:
- Quản lý Products + Categories tập trung.
- Không để UI đọc localStorage trực tiếp.
- Đồng bộ dữ liệu giữa:
    Home
    Products
    Product Detail
    Admin

- Bảo vệ dữ liệu seed.
- Tự phục hồi các field bị thiếu trong localStorage.
- Đặc biệt bảo vệ đường dẫn hình ảnh sản phẩm.

Kiến trúc:

products.js
     │
     ▼
catalog.js
     │
     ├── Home
     ├── Products
     ├── Product Detail
     └── Admin

Sau này có thể thay localStorage bằng API/database
mà không phải viết lại toàn bộ UI.
============================================================
*/

import { products as defaultProducts } from "@/data/products";

import {
  DEFAULT_PRODUCT_CATEGORIES,
  PRODUCT_CATEGORIES_STORAGE_KEY,
  CATEGORY_UPDATED_EVENT,
  normalizeCategories,
} from "@/constants/productCategories";

/*
============================================================
STORAGE KEYS
============================================================
*/

export const PRODUCT_STORAGE_KEY = "flower-shop-products";

/*
============================================================
EVENT NAMES
============================================================
*/

export const PRODUCT_UPDATED_EVENT = "flower-shop-products-updated";

/*
QUAN TRỌNG:
CATEGORY_UPDATED_EVENT được định nghĩa tại
productCategories.js.

Tại đây export lại để các component chỉ cần import
từ catalog.js thay vì phải biết cấu trúc bên trong
productCategories.js.
*/

export { CATEGORY_UPDATED_EVENT };

/*
============================================================
PRODUCT NORMALIZER
============================================================
*/

const normalizeProduct = (product = {}, fallback = {}) => {
  const merged = {
    ...fallback,
    ...product,
  };

  return {
    ...merged,

    id: merged.id ?? fallback.id,

    name: String(merged.name || fallback.name || "").trim(),

    category: String(merged.category || fallback.category || "").trim(),

    price: Number(merged.price ?? fallback.price ?? 0),

    oldPrice:
      merged.oldPrice === null ||
      merged.oldPrice === undefined ||
      merged.oldPrice === ""
        ? null
        : Number(merged.oldPrice),

    badge: String(merged.badge || fallback.badge || "").trim(),

    /*
    --------------------------------------------------------
    QUAN TRỌNG:
    Nếu dữ liệu localStorage không có image,
    sử dụng image từ products.js.
    --------------------------------------------------------
    */

    image: merged.image || fallback.image || "",

    description: String(
      merged.description || fallback.description || ""
    ).trim(),

    salesCount: Number(
      merged.salesCount ??
        merged.sold ??
        fallback.salesCount ??
        fallback.sold ??
        0
    ),

    isNew: Boolean(merged.isNew ?? fallback.isNew ?? false),
  };
};

/*
============================================================
NORMALIZE PRODUCTS
============================================================
*/

const normalizeProducts = (items, seedProducts = defaultProducts) => {
  if (!Array.isArray(items)) {
    return [];
  }

  const seedMap = new Map(
    seedProducts.map((product) => [String(product.id), product])
  );

  const seen = new Set();

  return items
    .map((product) => {
      const fallback = seedMap.get(String(product?.id)) || {};

      return normalizeProduct(product, fallback);
    })
    .filter((product) => {
      const id = String(product.id ?? "");

      if (!id || seen.has(id)) {
        return false;
      }

      seen.add(id);

      return true;
    });
};

/*
============================================================
SAFE JSON READ
============================================================
*/

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

/*
============================================================
SAFE JSON WRITE
============================================================
*/

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));

    return true;
  } catch (error) {
    console.error(`Không thể lưu dữ liệu ${key}:`, error);

    return false;
  }
};

/*
============================================================
READ PRODUCTS
============================================================
*/

export const readProducts = () => {
  const stored = readJson(PRODUCT_STORAGE_KEY);

  /*
  ----------------------------------------------------------
  Chưa có dữ liệu localStorage
  → tạo từ products.js
  ----------------------------------------------------------
  */

  if (!Array.isArray(stored)) {
    const seeded = normalizeProducts(defaultProducts);

    writeJson(PRODUCT_STORAGE_KEY, seeded);

    return seeded;
  }

  /*
  ----------------------------------------------------------
  Đã có dữ liệu localStorage
  → merge với seed để phục hồi field bị thiếu.
  ----------------------------------------------------------
  */

  const normalized = normalizeProducts(stored, defaultProducts);

  /*
  ----------------------------------------------------------
  Lưu lại phiên bản đã normalize.
  ----------------------------------------------------------
  */

  writeJson(PRODUCT_STORAGE_KEY, normalized);

  return normalized;
};

/*
============================================================
SAVE PRODUCTS
============================================================
*/

export const saveProducts = (products) => {
  const normalized = normalizeProducts(products, defaultProducts);

  writeJson(PRODUCT_STORAGE_KEY, normalized);

  window.dispatchEvent(new Event(PRODUCT_UPDATED_EVENT));

  return normalized;
};

/*
============================================================
GET PRODUCT BY ID
============================================================
*/

export const getProductById = (productId, products = readProducts()) =>
  products.find((product) => String(product.id) === String(productId)) || null;

/*
============================================================
GET PRODUCTS BY CATEGORY
============================================================
*/

export const getProductsByCategory = (
  categorySlug,
  products = readProducts()
) =>
  products.filter(
    (product) => String(product.category) === String(categorySlug)
  );

/*
============================================================
SEARCH PRODUCTS
============================================================
*/

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

/*
============================================================
FEATURED PRODUCTS
============================================================
*/

export const getFeaturedProducts = (
  categorySlug,
  limit = 4,
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

/*
============================================================
READ CATEGORIES
============================================================
*/

export const readCategories = () => {
  const stored = readJson(PRODUCT_CATEGORIES_STORAGE_KEY);

  if (Array.isArray(stored) && stored.length > 0) {
    return normalizeCategories(stored);
  }

  const seeded = normalizeCategories(DEFAULT_PRODUCT_CATEGORIES);

  writeJson(PRODUCT_CATEGORIES_STORAGE_KEY, seeded);

  return seeded;
};

/*
============================================================
SAVE CATEGORIES
============================================================
*/

export const saveCategories = (categories) => {
  const normalized = normalizeCategories(categories);

  writeJson(PRODUCT_CATEGORIES_STORAGE_KEY, normalized);

  window.dispatchEvent(new Event(CATEGORY_UPDATED_EVENT));

  return normalized;
};

/*
============================================================
GET CATEGORY BY SLUG
============================================================
*/

export const getCategoryBySlug = (slug, categories = readCategories()) =>
  categories.find((category) => String(category.slug) === String(slug)) || null;

/*
============================================================
ACTIVE CATEGORIES
============================================================
*/

export const getActiveCategories = (categories = readCategories()) =>
  categories
    .filter((category) => category.active !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

/*
============================================================
CATALOG SNAPSHOT
============================================================
*/

export const getCatalogSnapshot = () => ({
  products: readProducts(),
  categories: readCategories(),
});
