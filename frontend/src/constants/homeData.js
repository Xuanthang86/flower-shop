/*
 * LEGACY COMPATIBILITY LAYER
 * Dữ liệu sản phẩm/danh mục thật được quản lý tập trung tại data/catalog.js.
 * File này giữ nguyên các export cũ để các component chưa được chuyển đổi
 * không bị lỗi import trong quá trình nâng cấp.
 */
import { readCatalogCategories, readCatalogProducts } from "@/data/catalog";

export const categories = readCatalogCategories().map((category) => ({
  id: category.id,
  name: category.label,
  slug: category.query,
  summary: category.summary,
  image: category.image,
}));

export const featuredProducts = readCatalogProducts()
  .slice()
  .sort((a, b) => {
    const newScore = Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
    if (newScore !== 0) return newScore;
    return Number(b.salesCount || 0) - Number(a.salesCount || 0);
  })
  .slice(0, 4);
