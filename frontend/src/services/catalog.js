/*
============================================================
FLOWER SHOP — CATALOG SERVICE
============================================================

Quản lý tập trung:
- Products
- Categories
- Đồng bộ Home / Products / Product Detail / Admin
- Bảo vệ dữ liệu seed
- Tự phục hồi image + description bị thiếu
============================================================
*/

import { products as defaultProducts } from "@/data/products";

import {
  DEFAULT_PRODUCT_CATEGORIES,
  PRODUCT_CATEGORIES_STORAGE_KEY,
  CATEGORY_UPDATED_EVENT,
  normalizeCategories,
} from "@/constants/productCategories";

export const PRODUCT_STORAGE_KEY = "flower-shop-products";

export const PRODUCT_UPDATED_EVENT = "flower-shop-products-updated";

export { CATEGORY_UPDATED_EVENT };

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const normalizeProduct = (product = {}, fallback = {}) => {
  const merged = {
    ...fallback,
    ...product,
  };

  const image =
    merged.image ||
    merged.images?.[0] ||
    merged.imageUrl ||
    merged.thumbnail ||
    fallback.image ||
    fallback.images?.[0] ||
    fallback.imageUrl ||
    fallback.thumbnail ||
    "";

  return {
    ...merged,

    id: merged.id ?? fallback.id,

    name: String(merged.name || fallback.name || "").trim(),

    category: String(merged.category || fallback.category || "").trim(),

    price: safeNumber(merged.price ?? fallback.price, 0),

    oldPrice:
      merged.oldPrice === null ||
      merged.oldPrice === undefined ||
      merged.oldPrice === ""
        ? null
        : safeNumber(merged.oldPrice, 0),

    badge: String(merged.badge || fallback.badge || "").trim(),

    image,

    description: String(
      merged.description || fallback.description || ""
    ).trim(),

    salesCount: safeNumber(
      merged.salesCount ?? merged.sold ?? fallback.salesCount ?? fallback.sold,
      0
    ),

    isNew: Boolean(merged.isNew ?? fallback.isNew ?? false),
  };
};

const normalizeProducts = (items, seedProducts = defaultProducts) => {
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
      const id = String(product.id ?? "");

      if (!id || seen.has(id)) {
        return false;
      }

      seen.add(id);

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

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));

    return true;
  } catch (error) {
    console.error(`Không thể lưu dữ liệu ${key}:`, error);

    return false;
  }
};

export const readProducts = () => {
  const stored = readJson(PRODUCT_STORAGE_KEY);

  if (!Array.isArray(stored)) {
    const seeded = normalizeProducts(defaultProducts);

    writeJson(PRODUCT_STORAGE_KEY, seeded);

    return seeded;
  }

  const normalized = normalizeProducts(stored, defaultProducts);

  /*
  Chỉ ghi lại khi normalize thành công.
  */
  writeJson(PRODUCT_STORAGE_KEY, normalized);

  return normalized;
};

export const saveProducts = (products) => {
  const normalized = normalizeProducts(products, defaultProducts);

  const saved = writeJson(PRODUCT_STORAGE_KEY, normalized);

  if (!saved) {
    throw new Error("Không thể lưu danh sách sản phẩm.");
  }

  window.dispatchEvent(new Event(PRODUCT_UPDATED_EVENT));

  return normalized;
};

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

  writeJson(PRODUCT_CATEGORIES_STORAGE_KEY, seeded);

  return seeded;
};

export const saveCategories = (categories) => {
  const normalized = normalizeCategories(categories);

  const saved = writeJson(PRODUCT_CATEGORIES_STORAGE_KEY, normalized);

  if (!saved) {
    throw new Error("Không thể lưu danh mục.");
  }

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
  products: readProducts(),
  categories: readCategories(),
});
