import { products as seedProducts } from "@/data/products";
import { readProductCategories, saveProductCategories } from "@/constants/productCategories";

export const PRODUCTS_STORAGE_KEY = "flower-shop-products";
export const CATALOG_VERSION = 1;

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeProduct = (product) => ({
  ...product,
  id: product?.id ?? `product-${Date.now()}`,
  name: String(product?.name || "").trim(),
  category: String(product?.category || "").trim(),
  price: Number(product?.price || 0),
  oldPrice: product?.oldPrice === "" || product?.oldPrice == null ? null : Number(product.oldPrice),
  badge: product?.badge || "",
  description: product?.description || "",
  image: product?.image || "",
  salesCount: Number(product?.salesCount ?? product?.sold ?? 0),
  isNew: Boolean(product?.isNew),
});

const seed = () => (Array.isArray(seedProducts) ? seedProducts : []).map(normalizeProduct);

export const readCatalogProducts = () => {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    const parsed = safeParse(raw, null);
    if (Array.isArray(parsed)) return parsed.map(normalizeProduct);
  } catch (error) {
    console.error("Không thể đọc catalog sản phẩm:", error);
  }

  const initial = seed();
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initial));
  } catch (error) {
    console.error("Không thể khởi tạo catalog sản phẩm:", error);
  }
  return initial;
};

export const saveCatalogProducts = (products) => {
  const normalized = (Array.isArray(products) ? products : []).map(normalizeProduct);
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event("flower-shop-products-updated"));
  return normalized;
};

export const readCatalogCategories = () => readProductCategories();

export const saveCatalogCategories = (categories) => saveProductCategories(categories);

export const findCatalogProduct = (productId) => {
  const products = readCatalogProducts();
  return products.find((item) => String(item.id) === String(productId)) || null;
};

export const getCategoryBySlug = (slug) => {
  const categories = readCatalogCategories();
  return categories.find((item) => item.query === slug || item.id === slug) || null;
};

export const getProductsByCategory = (slug) => {
  if (!slug || slug === "all") return readCatalogProducts();
  return readCatalogProducts().filter((item) => item.category === slug);
};

export const resetCatalogToSeed = () => saveCatalogProducts(seed());

export const getCatalogSnapshot = () => ({
  version: CATALOG_VERSION,
  products: readCatalogProducts(),
  categories: readCatalogCategories(),
});
