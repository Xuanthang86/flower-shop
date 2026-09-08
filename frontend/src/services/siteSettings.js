/*
============================================================
FLOWER SHOP — SITE SETTINGS
============================================================
*/

export const SITE_SETTINGS_STORAGE_KEY = "flower-shop-site-settings";

export const SITE_SETTINGS_UPDATED_EVENT = "flower-shop-site-settings-updated";

const DEFAULT_SITE_SETTINGS = {
  announcementMessages: [
    "🌸 Miễn phí giao hàng cho đơn từ 500.000đ",
    "🚚 Đặt trước 14h — giao hoa trong ngày",
    "💐 Hoa tươi được tuyển chọn mỗi ngày",
    "🎁 Tặng thiệp miễn phí cho mọi đơn hàng",
  ],

  branding: {
    logoImage: "",
    logoAlt: "Flower Shop",
  },

  hero: {
    eyebrow: "",
    titleBefore: "",
    titleHighlight: "",
    description: "",
    primaryButtonText: "",
    secondaryButtonText: "",
    primaryButtonLink: "/products",
    secondaryButtonLink: "/products",

    bannerHeightDesktop: 240,
    bannerHeightMobile: 125,
    bannerRadius: 14,

    bannerInterval: 8,

    banners: [],
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

  blog: {
    columns: 3,
    borderRadius: 16,
  },

  theme: {
    primaryColor: "#db2777",
    secondaryColor: "#fce7f3",
    textColor: "#1f2937",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    baseFontSize: 16,
    headerFontSize: 15,
    borderRadius: 12,
  },
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const normalizeBanner = (banner, index, defaultInterval = 8) => {
  const duration = Number(banner?.duration || defaultInterval || 8);

  const priority = Number(banner?.priority || index + 1);

  return {
    ...banner,

    id: banner?.id || `banner-${Date.now()}-${index}`,

    image: String(banner?.image || ""),

    mobileImage: String(banner?.mobileImage || ""),

    alt: String(banner?.alt || `Banner ${index + 1}`),

    priority: Math.max(1, Number.isFinite(priority) ? priority : index + 1),

    duration: Math.min(
      15,
      Math.max(5, Number.isFinite(duration) ? duration : defaultInterval)
    ),

    createdAt: banner?.createdAt || new Date().toISOString(),
  };
};

const normalizeBanners = (banners, defaultInterval = 8) => {
  if (!Array.isArray(banners)) {
    return [];
  }

  return banners
    .filter(
      (banner) =>
        banner && typeof banner.image === "string" && banner.image.trim()
    )
    .map((banner, index) => normalizeBanner(banner, index, defaultInterval))
    .sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0));
};

const mergeSettings = (input = {}) => {
  const source = input && typeof input === "object" ? input : {};

  const defaults = clone(DEFAULT_SITE_SETTINGS);

  const rawInterval = Number(
    source.hero?.bannerInterval ?? defaults.hero.bannerInterval
  );

  const bannerInterval = Math.min(
    15,
    Math.max(5, Number.isFinite(rawInterval) ? rawInterval : 8)
  );

  return {
    ...defaults,
    ...source,

    branding: {
      ...defaults.branding,
      ...(source.branding || {}),
    },

    hero: {
      ...defaults.hero,
      ...(source.hero || {}),

      bannerHeightDesktop: Math.min(
        420,
        Math.max(
          160,
          Number(
            source.hero?.bannerHeightDesktop ??
              defaults.hero.bannerHeightDesktop
          )
        )
      ),

      bannerHeightMobile: Math.min(
        220,
        Math.max(
          90,
          Number(
            source.hero?.bannerHeightMobile ?? defaults.hero.bannerHeightMobile
          )
        )
      ),

      bannerRadius: Math.min(
        32,
        Math.max(
          0,
          Number(source.hero?.bannerRadius ?? defaults.hero.bannerRadius)
        )
      ),

      bannerInterval,

      banners: normalizeBanners(source.hero?.banners, bannerInterval),
    },

    sections: {
      ...defaults.sections,
      ...(source.sections || {}),
    },

    footer: {
      ...defaults.footer,
      ...(source.footer || {}),
    },

    contact: {
      ...defaults.contact,
      ...(source.contact || {}),
    },

    blog: {
      ...defaults.blog,
      ...(source.blog || {}),
    },

    theme: {
      ...defaults.theme,
      ...(source.theme || {}),
    },

    announcementMessages: Array.isArray(source.announcementMessages)
      ? source.announcementMessages
      : clone(defaults.announcementMessages),

    customerLogos: Array.isArray(source.customerLogos)
      ? source.customerLogos
      : [],

    blogPosts: Array.isArray(source.blogPosts) ? source.blogPosts : [],
  };
};

export const readSiteSettings = () => {
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);

    if (!raw) {
      return clone(DEFAULT_SITE_SETTINGS);
    }

    const parsed = JSON.parse(raw);

    return mergeSettings(parsed);
  } catch (error) {
    console.error("Không thể đọc site settings:", error);

    return clone(DEFAULT_SITE_SETTINGS);
  }
};

export const saveSiteSettings = (settings) => {
  const normalized = mergeSettings(settings);

  try {
    const serialized = JSON.stringify(normalized);

    localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, serialized);
  } catch (error) {
    console.error("Không thể lưu site settings:", error);

    const message =
      "Không thể lưu cấu hình website. " +
      "Bộ nhớ trình duyệt có thể đã đầy. " +
      "Hãy giảm dung lượng ảnh hoặc xóa dữ liệu banner cũ.";

    throw new Error(message);
  }

  window.dispatchEvent(new Event(SITE_SETTINGS_UPDATED_EVENT));

  return normalized;
};

export const updateSiteSettings = (updates) => {
  const current = readSiteSettings();

  return saveSiteSettings({
    ...current,
    ...(updates || {}),
  });
};

export const resetSiteSettings = () =>
  saveSiteSettings(clone(DEFAULT_SITE_SETTINGS));

export { DEFAULT_SITE_SETTINGS };
