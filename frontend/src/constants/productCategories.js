export const PRODUCT_CATEGORIES_STORAGE_KEY = "flower-shop-categories";

export const DEFAULT_PRODUCT_CATEGORIES = [
  {
    id: "hoa-khai-truong",
    label: "Hoa khai trương",
    query: "hoa-khai-truong",
  },
  {
    id: "hoa-sinh-nhat",
    label: "Hoa sinh nhật",
    query: "hoa-sinh-nhat",
  },
  {
    id: "hoa-cuoi",
    label: "Hoa cưới",
    query: "hoa-cuoi",
  },
  {
    id: "hoa-tot-nghiep",
    label: "Hoa tốt nghiệp",
    query: "hoa-tot-nghiep",
  },
  {
    id: "hoa-chia-buon",
    label: "Hoa chia buồn",
    query: "hoa-chia-buon",
  },
];

export const slugifyCategory = (value = "") => {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const readProductCategories = () => {
  try {
    const raw = localStorage.getItem(PRODUCT_CATEGORIES_STORAGE_KEY);

    if (!raw) {
      localStorage.setItem(
        PRODUCT_CATEGORIES_STORAGE_KEY,
        JSON.stringify(DEFAULT_PRODUCT_CATEGORIES)
      );

      return DEFAULT_PRODUCT_CATEGORIES;
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_PRODUCT_CATEGORIES;
    }

    return parsed;
  } catch (error) {
    console.error("Không thể đọc danh mục:", error);

    return DEFAULT_PRODUCT_CATEGORIES;
  }
};

export const saveProductCategories = (categories) => {
  localStorage.setItem(
    PRODUCT_CATEGORIES_STORAGE_KEY,
    JSON.stringify(categories)
  );

  window.dispatchEvent(new Event("flower-shop-categories-updated"));
};
