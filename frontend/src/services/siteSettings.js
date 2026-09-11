export const SITE_SETTINGS_STORAGE_KEY = "flower-shop-site-settings";

export const SITE_SETTINGS_UPDATED_EVENT = "flower-shop-site-settings-updated";

/*
 * Phân quyền mặc định theo ROLE.
 *
 * Manager:
 * - Đơn hàng
 * - Nội dung website
 * - Bài viết
 * - Hình ảnh
 * - Thông tin liên hệ
 *
 * Product Manager:
 * - Đơn hàng
 * - Sản phẩm
 *
 * Tùy chỉnh giao diện chỉ dành cho Admin.
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  manager: [
    "manage_orders",
    "manage_content",
    "manage_blog",
    "manage_images",
    "manage_contact",
  ],

  product_manager: ["manage_orders", "manage_products"],
};

const DEFAULT_BLOG_SHOP_INFO_HTML = `
<h2>Về Flower Shop</h2>
<p>
  Flower Shop là cửa hàng hoa tươi chuyên cung cấp những sản phẩm hoa đẹp,
  được tuyển chọn và chăm sóc kỹ lưỡng cho nhiều dịp đặc biệt như sinh nhật,
  khai trương, cưới hỏi, chúc mừng, tri ân và các sự kiện quan trọng.
</p>
<p>
  {{siteName}} luôn hướng tới những sản phẩm hoa tươi chất lượng,
  cách trình bày tinh tế và dịch vụ hỗ trợ tận tâm.
</p>
<p>
  <strong>Thông tin liên hệ:</strong><br />
  Địa chỉ: {{address}}<br />
  Điện thoại: {{phone}}<br />
  Email: {{email}}<br />
  Thời gian làm việc: {{workingHours}}
</p>
<p>
  Bạn có thể tham khảo thêm các sản phẩm hoa tại
  <a href="/products">Danh mục sản phẩm</a>
  hoặc liên hệ với shop qua trang
  <a href="/contact">Liên hệ</a>.
</p>
`;

const DEFAULT_SITE_SETTINGS = {
  announcementMessages: [
    "🌸 Miễn phí giao hàng cho đơn từ 500.000đ",
    "🚚 Đặt trước 14h — giao hoa trong ngày",
    "💐 Hoa tươi được tuyển chọn mỗi ngày",
    "🎁 Tặng thiệp miễn phí cho mọi đơn hàng",
  ],

  branding: {
    siteName: "Flower Shop",
    tagline: "Fresh Flower Everyday",
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
    extraItems: [],

    style: {
      columns: 2,
      cardRadius: 12,
      sectionRadius: 16,
    },
  },

  rolePermissions: DEFAULT_ROLE_PERMISSIONS,

  blogPosts: [],

  blog: {
    columns: 3,
    borderRadius: 16,
    defaultShopInfoHtml: DEFAULT_BLOG_SHOP_INFO_HTML,
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

    visible: banner?.visible !== false,

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

const normalizeRolePermissions = (input) => {
  const defaults = clone(DEFAULT_ROLE_PERMISSIONS);

  const source = input && typeof input === "object" ? input : {};

  return {
    manager: Array.isArray(source.manager)
      ? [...new Set(source.manager)]
      : defaults.manager,

    product_manager: Array.isArray(source.product_manager)
      ? [...new Set(source.product_manager)]
      : defaults.product_manager,
  };
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

  const defaultShopInfoHtml =
    String(
      source.blog?.defaultShopInfoHtml ?? defaults.blog.defaultShopInfoHtml
    ).trim() || defaults.blog.defaultShopInfoHtml;

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

      style: {
        ...defaults.contact.style,
        ...(source.contact?.style || {}),
      },

      extraItems: Array.isArray(source.contact?.extraItems)
        ? source.contact.extraItems
        : [],
    },

    blog: {
      ...defaults.blog,
      ...(source.blog || {}),
      defaultShopInfoHtml,
    },

    theme: {
      ...defaults.theme,
      ...(source.theme || {}),
    },

    rolePermissions: normalizeRolePermissions(source.rolePermissions),

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

    return mergeSettings(JSON.parse(raw));
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
    const storageError = new Error(
      "Không thể lưu cấu hình website. Bộ nhớ trình duyệt có thể đã đầy.",
      {
        cause: error,
      }
    );

    console.error("Không thể lưu site settings:", storageError);

    throw storageError;
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
