// export const SITE_SETTINGS_STORAGE_KEY = "flower-shop-site-settings";

// export const SITE_SETTINGS_UPDATED_EVENT = "flower-shop-site-settings-updated";

// const DEFAULT_SETTINGS = {
//   announcementMessages: [
//     "🌸 Miễn phí giao hàng cho đơn từ 500.000đ",
//     "🚚 Đặt trước 14h — giao hoa trong ngày",
//     "💐 Hoa tươi được tuyển chọn mỗi ngày",
//     "🎁 Tặng thiệp miễn phí cho mọi đơn hàng",
//   ],

//   hero: {
//     eyebrow: "",
//     titleBefore: "",
//     titleHighlight: "",
//     description: "",
//     primaryButtonText: "",
//     secondaryButtonText: "",
//     primaryButtonLink: "/products",
//     secondaryButtonLink: "/products",

//     banners: [],
//   },

//   sections: {
//     categoriesTitle: "Danh mục nổi bật",
//     categoriesSubtitle: "Lựa chọn hoa phù hợp với từng dịp đặc biệt",
//     featuredTitle: "Sản phẩm nổi bật",
//     featuredSubtitle: "Những sản phẩm mới và được yêu thích nhất.",
//     customerTitle: "KHÁCH HÀNG TIÊU BIỂU",
//   },

//   customerLogos: [],

//   footer: {
//     copyright: "© 2026 Flower Shop. All Rights Reserved.",
//   },

//   contact: {
//     title: "Liên hệ",
//     description:
//       "Flower Shop luôn sẵn sàng tư vấn và hỗ trợ bạn lựa chọn những bó hoa phù hợp.",
//     phone: "",
//     email: "",
//     address: "",
//     workingHours: "",
//   },

//   blogPosts: [],
// };

// const clone = (value) => JSON.parse(JSON.stringify(value));

// const normalizeBanners = (stored) => {
//   if (Array.isArray(stored?.hero?.banners)) {
//     return stored.hero.banners.filter((banner) => banner && banner.image);
//   }

//   if (stored?.hero?.bannerImage) {
//     return [
//       {
//         id: `banner-migrated-${Date.now()}`,
//         image: stored.hero.bannerImage,
//         alt: "Banner Flower Shop",
//         createdAt: new Date().toISOString(),
//       },
//     ];
//   }

//   return [];
// };

// const mergeSettings = (stored) => {
//   const banners = normalizeBanners(stored);

//   return {
//     ...clone(DEFAULT_SETTINGS),
//     ...(stored || {}),

//     hero: {
//       ...clone(DEFAULT_SETTINGS.hero),
//       ...(stored?.hero || {}),
//       banners,
//     },

//     sections: {
//       ...clone(DEFAULT_SETTINGS.sections),
//       ...(stored?.sections || {}),
//     },

//     footer: {
//       ...clone(DEFAULT_SETTINGS.footer),
//       ...(stored?.footer || {}),
//     },

//     contact: {
//       ...clone(DEFAULT_SETTINGS.contact),
//       ...(stored?.contact || {}),
//     },

//     announcementMessages: Array.isArray(stored?.announcementMessages)
//       ? stored.announcementMessages
//       : clone(DEFAULT_SETTINGS.announcementMessages),

//     customerLogos: Array.isArray(stored?.customerLogos)
//       ? stored.customerLogos
//       : [],

//     blogPosts: Array.isArray(stored?.blogPosts) ? stored.blogPosts : [],
//   };
// };

// const safeRead = () => {
//   try {
//     const raw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);

//     if (!raw) {
//       return clone(DEFAULT_SETTINGS);
//     }

//     return mergeSettings(JSON.parse(raw));
//   } catch (error) {
//     console.error("Không thể đọc cấu hình website:", error);

//     return clone(DEFAULT_SETTINGS);
//   }
// };

// export const readSiteSettings = () => {
//   const settings = safeRead();

//   try {
//     localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
//   } catch (error) {
//     console.error("Không thể đồng bộ cấu hình website:", error);
//   }

//   return settings;
// };

// export const saveSiteSettings = (settings) => {
//   const normalized = mergeSettings(settings);

//   try {
//     localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));

//     window.dispatchEvent(new Event(SITE_SETTINGS_UPDATED_EVENT));

//     return normalized;
//   } catch (error) {
//     console.error("Không thể lưu cấu hình website:", error);

//     throw error;
//   }
// };

// export const updateSiteSettings = (updates) => {
//   const current = readSiteSettings();

//   return saveSiteSettings({
//     ...current,
//     ...updates,
//   });
// };

// export const resetSiteSettings = () => {
//   return saveSiteSettings(clone(DEFAULT_SETTINGS));
// };

// export const DEFAULT_SITE_SETTINGS = clone(DEFAULT_SETTINGS);

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

    /*
    Kích thước hiển thị:
    Desktop: 240px
    Mobile: 125px
    */
    bannerHeightDesktop: 240,
    bannerHeightMobile: 125,

    bannerRadius: 14,

    /*
    Thời gian mặc định 8 giây.
    */
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

const normalizeBanner = (banner, index, defaultInterval = 8) => ({
  ...banner,

  id: banner?.id || `banner-${Date.now()}-${index}`,

  image: String(banner?.image || ""),

  mobileImage: String(banner?.mobileImage || ""),

  alt: banner?.alt || `Banner ${index + 1}`,

  priority: Math.max(1, Number(banner?.priority) || index + 1),

  duration: Math.min(
    15,
    Math.max(5, Number(banner?.duration || defaultInterval || 8))
  ),

  createdAt: banner?.createdAt || new Date().toISOString(),
});

const normalizeBanners = (banners, defaultInterval = 8) => {
  if (!Array.isArray(banners)) {
    return [];
  }

  return banners
    .filter(
      (banner) => banner && typeof banner.image === "string" && banner.image
    )
    .map((banner, index) => normalizeBanner(banner, index, defaultInterval))
    .sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0));
};

const mergeSettings = (input = {}) => {
  const source = input && typeof input === "object" ? input : {};

  const defaultSettings = clone(DEFAULT_SITE_SETTINGS);

  const bannerInterval = Number(
    source.hero?.bannerInterval || defaultSettings.hero.bannerInterval
  );

  return {
    ...defaultSettings,
    ...source,

    branding: {
      ...defaultSettings.branding,
      ...(source.branding || {}),
    },

    hero: {
      ...defaultSettings.hero,
      ...(source.hero || {}),

      bannerHeightDesktop: Math.min(
        420,
        Math.max(
          160,
          Number(
            source.hero?.bannerHeightDesktop ||
              defaultSettings.hero.bannerHeightDesktop
          )
        )
      ),

      bannerHeightMobile: Math.min(
        220,
        Math.max(
          90,
          Number(
            source.hero?.bannerHeightMobile ||
              defaultSettings.hero.bannerHeightMobile
          )
        )
      ),

      bannerRadius: Math.min(
        32,
        Math.max(
          0,
          Number(source.hero?.bannerRadius ?? defaultSettings.hero.bannerRadius)
        )
      ),

      bannerInterval: Math.min(15, Math.max(5, bannerInterval)),

      banners: normalizeBanners(source.hero?.banners, bannerInterval),
    },

    sections: {
      ...defaultSettings.sections,
      ...(source.sections || {}),
    },

    footer: {
      ...defaultSettings.footer,
      ...(source.footer || {}),
    },

    contact: {
      ...defaultSettings.contact,
      ...(source.contact || {}),
    },

    blog: {
      ...defaultSettings.blog,
      ...(source.blog || {}),
    },

    theme: {
      ...defaultSettings.theme,
      ...(source.theme || {}),
    },

    announcementMessages: Array.isArray(source.announcementMessages)
      ? source.announcementMessages
      : clone(defaultSettings.announcementMessages),

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

    const normalized = mergeSettings(parsed);

    /*
    Cố gắng migrate dữ liệu cũ.
    */
    try {
      localStorage.setItem(
        SITE_SETTINGS_STORAGE_KEY,
        JSON.stringify(normalized)
      );
    } catch {
      // Không làm hỏng giao diện nếu quota đã đầy.
    }

    return normalized;
  } catch (error) {
    console.error("Không thể đọc site settings:", error);

    return clone(DEFAULT_SITE_SETTINGS);
  }
};

export const saveSiteSettings = (settings) => {
  const normalized = mergeSettings(settings);

  try {
    localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.error("Không thể lưu site settings:", error);

    throw new Error(
      "Không thể lưu cấu hình website. Bộ nhớ trình duyệt có thể đã đầy. Hãy giảm dung lượng ảnh hoặc xóa dữ liệu banner cũ."
    );
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
