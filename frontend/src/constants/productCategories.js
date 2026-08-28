/*
============================================================
FLOWER SHOP — PRODUCT CATEGORIES
============================================================

Mục đích:
- Là nguồn dữ liệu chuẩn duy nhất cho danh mục sản phẩm.
- Không tạo danh mục riêng trong homeData.js.
- Hỗ trợ:
  + Tên danh mục
  + Slug
  + Tóm tắt
  + Hình ảnh
  + Trạng thái hoạt động
  + Thứ tự hiển thị

TƯƠNG THÍCH:
- name / slug: chuẩn mới.
- label / query: tương thích với các component hiện tại.

Dữ liệu quản trị sau này có thể được lưu vào localStorage
hoặc thay thế bằng API/database mà không phải thay đổi
cấu trúc component.
============================================================
*/

import birthdayImage from "@/assets/images/categories/category-birthday.jpg";
import openingImage from "@/assets/images/categories/category-opening.jpg";
import weddingImage from "@/assets/images/categories/category-wedding.jpg";
import graduationImage from "@/assets/images/categories/category-graduation.jpg";
import funeralImage from "@/assets/images/categories/category-funeral.jpg";

export const PRODUCT_CATEGORIES_STORAGE_KEY = "flower-shop-categories";

export const CATEGORY_UPDATED_EVENT = "flower-shop-categories-updated";

export const DEFAULT_PRODUCT_CATEGORIES = [
  {
    id: "hoa-khai-truong",
    name: "Hoa khai trương",
    slug: "hoa-khai-truong",

    // Tương thích code hiện tại
    label: "Hoa khai trương",
    query: "hoa-khai-truong",

    summary:
      "Những mẫu hoa khai trương sang trọng, mang ý nghĩa chúc mừng thành công và phát triển.",

    image: openingImage,

    active: true,
    sortOrder: 1,
  },

  {
    id: "hoa-sinh-nhat",
    name: "Hoa sinh nhật",
    slug: "hoa-sinh-nhat",

    label: "Hoa sinh nhật",
    query: "hoa-sinh-nhat",

    summary:
      "Những bó hoa tươi đẹp dành tặng người thân, bạn bè và những người bạn yêu thương.",

    image: birthdayImage,

    active: true,
    sortOrder: 2,
  },

  {
    id: "hoa-cuoi",
    name: "Hoa cưới",
    slug: "hoa-cuoi",

    label: "Hoa cưới",
    query: "hoa-cuoi",

    summary:
      "Hoa cưới tinh tế, lãng mạn dành cho cô dâu, chú rể và những khoảnh khắc trọng đại.",

    image: weddingImage,

    active: true,
    sortOrder: 3,
  },

  {
    id: "hoa-tot-nghiep",
    name: "Hoa tốt nghiệp",
    slug: "hoa-tot-nghiep",

    label: "Hoa tốt nghiệp",
    query: "hoa-tot-nghiep",

    summary:
      "Những mẫu hoa tươi trẻ, rực rỡ dành để chúc mừng thành quả học tập.",

    image: graduationImage,

    active: true,
    sortOrder: 4,
  },

  {
    id: "hoa-chia-buon",
    name: "Hoa chia buồn",
    slug: "hoa-chia-buon",

    label: "Hoa chia buồn",
    query: "hoa-chia-buon",

    summary:
      "Các kệ hoa trang trọng, thanh lịch thể hiện sự thành kính và chia sẻ.",

    image: funeralImage,

    active: true,
    sortOrder: 5,
  },
];

/*
============================================================
SLUG
============================================================
*/

export const slugifyCategory = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/*
============================================================
NORMALIZE CATEGORY
============================================================

Đảm bảo dữ liệu cũ và dữ liệu mới luôn có cùng cấu trúc.
============================================================
*/

export const normalizeCategory = (category = {}, index = 0) => {
  const name = String(
    category.name || category.label || "Danh mục sản phẩm"
  ).trim();

  const slug =
    String(category.slug || category.query || "").trim() ||
    slugifyCategory(name);

  return {
    id: String(category.id || slug || `category-${index + 1}`),

    name,

    slug,

    // Compatibility
    label: name,
    query: slug,

    summary: String(category.summary || "").trim(),

    image: category.image || "",

    active: category.active !== false,

    sortOrder: Number.isFinite(Number(category.sortOrder))
      ? Number(category.sortOrder)
      : index + 1,
  };
};

/*
============================================================
NORMALIZE ALL CATEGORIES
============================================================
*/

export const normalizeCategories = (categories) => {
  if (!Array.isArray(categories)) {
    return [];
  }

  const seen = new Set();

  return categories
    .map((category, index) => normalizeCategory(category, index))
    .filter((category) => {
      if (!category.slug || seen.has(category.slug)) {
        return false;
      }

      seen.add(category.slug);

      return true;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

/*
============================================================
READ
============================================================
*/

export const readProductCategories = () => {
  try {
    const raw = localStorage.getItem(PRODUCT_CATEGORIES_STORAGE_KEY);

    if (!raw) {
      const defaults = normalizeCategories(DEFAULT_PRODUCT_CATEGORIES);

      localStorage.setItem(
        PRODUCT_CATEGORIES_STORAGE_KEY,
        JSON.stringify(defaults)
      );

      return defaults;
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return normalizeCategories(DEFAULT_PRODUCT_CATEGORIES);
    }

    return normalizeCategories(parsed);
  } catch (error) {
    console.error("Không thể đọc danh mục sản phẩm:", error);

    return normalizeCategories(DEFAULT_PRODUCT_CATEGORIES);
  }
};

/*
============================================================
SAVE
============================================================
*/

export const saveProductCategories = (categories) => {
  const normalized = normalizeCategories(categories);

  localStorage.setItem(
    PRODUCT_CATEGORIES_STORAGE_KEY,
    JSON.stringify(normalized)
  );

  window.dispatchEvent(new Event(CATEGORY_UPDATED_EVENT));

  return normalized;
};

/*
============================================================
HELPERS
============================================================
*/

export const findCategoryBySlug = (
  slug,
  categories = readProductCategories()
) => categories.find((category) => category.slug === String(slug)) || null;

export const getActiveCategories = (categories = readProductCategories()) =>
  categories
    .filter((category) => category.active !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);
