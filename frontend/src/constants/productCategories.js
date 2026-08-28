import birthdayImage from "@/assets/images/categories/category-birthday.jpg";
import openingImage from "@/assets/images/categories/category-opening.jpg";
import weddingImage from "@/assets/images/categories/category-wedding.jpg";
import graduationImage from "@/assets/images/categories/category-graduation.jpg";
import funeralImage from "@/assets/images/categories/category-funeral.jpg";

export const PRODUCT_CATEGORIES_STORAGE_KEY = "flower-shop-categories";

export const DEFAULT_PRODUCT_CATEGORIES = [
  { id: "hoa-khai-truong", label: "Hoa khai trương", query: "hoa-khai-truong", summary: "Kệ hoa chúc mừng khai trương, phát tài và thành công.", image: openingImage },
  { id: "hoa-sinh-nhat", label: "Hoa sinh nhật", query: "hoa-sinh-nhat", summary: "Những mẫu hoa tươi đẹp dành tặng sinh nhật và ngày đặc biệt.", image: birthdayImage },
  { id: "hoa-cuoi", label: "Hoa cưới", query: "hoa-cuoi", summary: "Hoa cưới lãng mạn, tinh tế cho ngày trọng đại.", image: weddingImage },
  { id: "hoa-tot-nghiep", label: "Hoa tốt nghiệp", query: "hoa-tot-nghiep", summary: "Hoa chúc mừng tốt nghiệp trẻ trung và ý nghĩa.", image: graduationImage },
  { id: "hoa-chia-buon", label: "Hoa chia buồn", query: "hoa-chia-buon", summary: "Hoa chia buồn trang nghiêm, thanh lịch và thành kính.", image: funeralImage },
];

export const slugifyCategory = (value = "") => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const normalizeCategory = (item) => {
  const query = String(item?.query || item?.id || slugifyCategory(item?.label)).trim();
  const fallback = DEFAULT_PRODUCT_CATEGORIES.find((category) => category.query === query);
  return {
    id: String(item?.id || query),
    label: String(item?.label || item?.name || query),
    query,
    summary: String(item?.summary || fallback?.summary || ""),
    image: item?.image || fallback?.image || "",
  };
};

export const readProductCategories = () => {
  try {
    const raw = localStorage.getItem(PRODUCT_CATEGORIES_STORAGE_KEY);
    if (!raw) {
      const defaults = DEFAULT_PRODUCT_CATEGORIES.map(normalizeCategory);
      localStorage.setItem(PRODUCT_CATEGORIES_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PRODUCT_CATEGORIES.map(normalizeCategory);
    return parsed.map(normalizeCategory);
  } catch (error) {
    console.error("Không thể đọc danh mục:", error);
    return DEFAULT_PRODUCT_CATEGORIES.map(normalizeCategory);
  }
};

export const saveProductCategories = (categories) => {
  const normalized = (Array.isArray(categories) ? categories : []).map(normalizeCategory);
  localStorage.setItem(PRODUCT_CATEGORIES_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event("flower-shop-categories-updated"));
};
