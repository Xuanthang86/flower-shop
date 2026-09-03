/*
============================================================
FLOWER SHOP — SITE SETTINGS SERVICE
============================================================

MỤC ĐÍCH:
- Quản lý nội dung giao diện website.
- Không để JSX chứa các nội dung có thể thay đổi.
- Admin có thể cập nhật mà không sửa code.

QUẢN LÝ:
- Announcement
- Hero
- Banner
- Tiêu đề danh mục
- Tiêu đề sản phẩm
- Logo khách hàng tiêu biểu
- Footer
- Blog
- Contact

DỮ LIỆU LƯU:
localStorage

SAU NÀY:
Có thể thay localStorage bằng API/database mà không
phải thay đổi toàn bộ component giao diện.
============================================================
*/

export const SITE_SETTINGS_STORAGE_KEY = "flower-shop-site-settings";

export const SITE_SETTINGS_UPDATED_EVENT = "flower-shop-site-settings-updated";

const DEFAULT_SETTINGS = {
  announcementMessages: [
    "🌸 Miễn phí giao hàng cho đơn từ 500.000đ",
    "🚚 Đặt trước 14h — giao hoa trong ngày",
    "💐 Hoa tươi được tuyển chọn mỗi ngày",
    "🎁 Tặng thiệp miễn phí cho mọi đơn hàng",
  ],

  hero: {
    eyebrow: "FLOWER SHOP",
    titleBefore: "Gửi yêu thương qua",
    titleHighlight: "từng bó hoa",
    description:
      "Hàng trăm mẫu hoa tươi được thiết kế bởi florist chuyên nghiệp, giao nhanh trong ngày.",
    primaryButtonText: "Mua ngay",
    secondaryButtonText: "Xem bộ sưu tập",
    primaryButtonLink: "/products",
    secondaryButtonLink: "/products",
    bannerImage: "",
  },

  sections: {
    categoriesTitle: "Danh mục nổi bật",
    categoriesSubtitle: "Lựa chọn hoa phù hợp với từng dịp đặc biệt",
    featuredTitle: "Sản phẩm nổi bật",
    featuredSubtitle: "Những sản phẩm mới và được yêu thích nhất.",
    customerTitle: "KHÁCH HÀNG TIÊU BIỂU",
  },

  customerLogos: [],

  footer: {
    copyright: "© 2026 Flower Shop. All Rights Reserved.",
  },

  contact: {
    title: "Liên hệ",
    description:
      "Flower Shop luôn sẵn sàng tư vấn và hỗ trợ bạn lựa chọn những bó hoa phù hợp.",
    phone: "",
    email: "",
    address: "",
    workingHours: "",
  },

  blogPosts: [],
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const mergeSettings = (stored) => ({
  ...clone(DEFAULT_SETTINGS),
  ...(stored || {}),
  hero: {
    ...clone(DEFAULT_SETTINGS.hero),
    ...(stored?.hero || {}),
  },
  sections: {
    ...clone(DEFAULT_SETTINGS.sections),
    ...(stored?.sections || {}),
  },
  footer: {
    ...clone(DEFAULT_SETTINGS.footer),
    ...(stored?.footer || {}),
  },
  contact: {
    ...clone(DEFAULT_SETTINGS.contact),
    ...(stored?.contact || {}),
  },
  announcementMessages: Array.isArray(stored?.announcementMessages)
    ? stored.announcementMessages
    : clone(DEFAULT_SETTINGS.announcementMessages),
  customerLogos: Array.isArray(stored?.customerLogos)
    ? stored.customerLogos
    : [],
  blogPosts: Array.isArray(stored?.blogPosts) ? stored.blogPosts : [],
});

const safeRead = () => {
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);

    if (!raw) {
      return clone(DEFAULT_SETTINGS);
    }

    return mergeSettings(JSON.parse(raw));
  } catch (error) {
    console.error("Không thể đọc cấu hình website:", error);

    return clone(DEFAULT_SETTINGS);
  }
};

export const readSiteSettings = () => {
  const settings = safeRead();

  try {
    localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Không thể đồng bộ cấu hình website:", error);
  }

  return settings;
};

export const saveSiteSettings = (settings) => {
  const normalized = mergeSettings(settings);

  try {
    localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));

    window.dispatchEvent(new Event(SITE_SETTINGS_UPDATED_EVENT));

    return normalized;
  } catch (error) {
    console.error("Không thể lưu cấu hình website:", error);

    throw error;
  }
};

export const updateSiteSettings = (updates) => {
  const current = readSiteSettings();

  return saveSiteSettings({
    ...current,
    ...updates,
  });
};

export const resetSiteSettings = () => {
  return saveSiteSettings(clone(DEFAULT_SETTINGS));
};

export const DEFAULT_SITE_SETTINGS = clone(DEFAULT_SETTINGS);
