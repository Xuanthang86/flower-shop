export const SITE_SETTINGS_STORAGE_KEY = "flower-shop-site-settings";

export const SITE_SETTINGS_UPDATED_EVENT = "flower-shop-site-settings-updated";

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

/*
 * NỘI DUNG mặc định của Shop trong bài viết.
 *
 * File này chỉ quản lý nội dung và cấu trúc HTML cơ bản.
 * Không đặt CSS giao diện ở đây.
 *
 * Giao diện được quản lý riêng bằng:
 * blog.defaultShopInfoStyle
 *
 * Có thể sử dụng:
 * {{siteName}}
 * {{tagline}}
 * {{address}}
 * {{phone}}
 * {{email}}
 * {{workingHours}}
 */
export const DEFAULT_BLOG_SHOP_INFO_HTML = `
<section data-flower-shop-default-info="true">
  <header>
    <p>Thông tin Shop</p>

    <h2>Về {{siteName}}</h2>

    <p>{{tagline}}</p>
  </header>

  <div>
    <p>
      <strong>{{siteName}}</strong> là cửa hàng hoa tươi hướng tới những sản phẩm
      được tuyển chọn kỹ lưỡng, cách trình bày tinh tế và trải nghiệm mua sắm
      thuận tiện cho khách hàng.
    </p>

    <p>
      Shop cung cấp các sản phẩm hoa phù hợp cho nhiều dịp đặc biệt như sinh nhật,
      khai trương, cưới hỏi, chúc mừng, tri ân, kỷ niệm và các sự kiện quan trọng.
    </p>

    <p>
      Chúng tôi chú trọng chất lượng hoa, hình thức trình bày, khả năng tư vấn
      và hỗ trợ khách hàng trong suốt quá trình lựa chọn sản phẩm.
    </p>
  </div>

  <section>
    <h3>Thông tin liên hệ</h3>

    <p>
      <strong>Địa chỉ:</strong>
      {{address}}
    </p>

    <p>
      <strong>Điện thoại:</strong>
      <a href="tel:{{phone}}">{{phone}}</a>
    </p>

    <p>
      <strong>Email:</strong>
      <a href="mailto:{{email}}">{{email}}</a>
    </p>

    <p>
      <strong>Thời gian làm việc:</strong>
      {{workingHours}}
    </p>
  </section>

  <section>
    <h3>Khám phá thêm</h3>

    <p>
      Khám phá thêm các sản phẩm hoa tại
      <a href="/products">danh mục sản phẩm</a>
      hoặc tìm hiểu thêm thông tin và kết nối với
      <a href="/contact">Flower Shop</a>.
    </p>
  </section>
</section>
`;

export const DEFAULT_BLOG_SHOP_INFO_STYLE = {
  backgroundColor: "#fff7fb",
  borderColor: "#fce7f3",
  accentColor: "#db2777",
  headingColor: "#1f2937",
  textColor: "#4b5563",
  borderRadius: 14,
  padding: 14,
  headingFontSize: 19,
  subHeadingFontSize: 15,
  bodyFontSize: 14,
  lineHeight: 1.5,
};

const LEGACY_DEFAULT_BLOG_SHOP_INFO_HTML = `
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

const clone = (value) => JSON.parse(JSON.stringify(value));

const normalizeHtmlForComparison = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const isLegacyDefaultBlogShopInfo = (value) => {
  const normalized = normalizeHtmlForComparison(value);

  if (!normalized) {
    return true;
  }

  const legacyTemplate = normalizeHtmlForComparison(
    LEGACY_DEFAULT_BLOG_SHOP_INFO_HTML
  );

  if (normalized === legacyTemplate) {
    return true;
  }

  if (
    normalized.includes("Về Flower Shop") &&
    normalized.includes("Thông tin liên hệ") &&
    normalized.includes("Danh mục sản phẩm") &&
    normalized.includes("/contact")
  ) {
    return true;
  }

  return false;
};

const isBuiltInDefaultBlogShopInfo = (value) => {
  const normalized = normalizeHtmlForComparison(value);

  if (!normalized) {
    return false;
  }

  return (
    normalized.includes('data-flower-shop-default-info="true"') &&
    normalized.includes("Về {{siteName}}") &&
    normalized.includes("Thông tin liên hệ") &&
    normalized.includes("Khám phá thêm")
  );
};

const sanitizeDefaultShopInfoTemplate = (value) => {
  const source = String(value || "").trim();

  if (!source) {
    return DEFAULT_BLOG_SHOP_INFO_HTML;
  }

  if (
    isLegacyDefaultBlogShopInfo(source) ||
    isBuiltInDefaultBlogShopInfo(source)
  ) {
    return DEFAULT_BLOG_SHOP_INFO_HTML;
  }

  try {
    const parser = new DOMParser();

    const document = parser.parseFromString(
      `<div id="blog-template-root">${source}</div>`,
      "text/html"
    );

    const root = document.getElementById("blog-template-root");

    if (!root) {
      return DEFAULT_BLOG_SHOP_INFO_HTML;
    }

    const defaultBlock =
      root.querySelector('[data-flower-shop-default-info="true"]') || root;

    defaultBlock.setAttribute("data-flower-shop-default-info", "true");

    defaultBlock.querySelectorAll("[style]").forEach((element) => {
      element.removeAttribute("style");
    });

    return defaultBlock.outerHTML.trim();
  } catch {
    return DEFAULT_BLOG_SHOP_INFO_HTML;
  }
};

export const buildDefaultBlogShopInfoHtml = (settings) => {
  const template =
    String(settings?.blog?.defaultShopInfoHtml || "").trim() ||
    DEFAULT_BLOG_SHOP_INFO_HTML;

  const branding = settings?.branding || {};
  const contact = settings?.contact || {};

  return template
    .replace(
      /\{\{siteName\}\}/g,
      escapeHtml(branding.siteName || "Flower Shop")
    )
    .replace(/\{\{tagline\}\}/g, escapeHtml(branding.tagline || ""))
    .replace(/\{\{address\}\}/g, escapeHtml(contact.address || "Đang cập nhật"))
    .replace(/\{\{phone\}\}/g, escapeHtml(contact.phone || "Đang cập nhật"))
    .replace(/\{\{email\}\}/g, escapeHtml(contact.email || "Đang cập nhật"))
    .replace(
      /\{\{workingHours\}\}/g,
      escapeHtml(contact.workingHours || "Đang cập nhật")
    );
};

const convertLegacyTextContentToHtml = (content) => {
  const value = String(content || "").trim();

  if (!value) {
    return "";
  }

  const hasBlockElement =
    /<\s*(p|div|section|article|header|h1|h2|h3|h4|h5|h6|ul|ol|li|blockquote|table|tr|td|th)\b/i.test(
      value
    );

  if (hasBlockElement) {
    return value;
  }

  const hasBreak = /<\s*br\s*\/?>/i.test(value);

  if (hasBreak) {
    const normalized = value
      .replace(/(?:\s*<br\s*\/?>\s*){2,}/gi, "</p><p>")
      .replace(/<br\s*\/?>/gi, "<br />");

    return `<p>${normalized}</p>`;
  }

  if (/<[^>]+>/.test(value)) {
    return `<p>${value}</p>`;
  }

  const paragraphs = value
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length > 1) {
    return paragraphs
      .map((paragraph) => {
        const text = paragraph
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br />");

        return `<p>${text}</p>`;
      })
      .join("");
  }

  return `<p>${value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />")}</p>`;
};

export const removeDefaultShopInfoFromContent = (content = "") => {
  const value = String(content || "").trim();

  if (!value) {
    return "";
  }

  try {
    if (isLegacyDefaultBlogShopInfo(value)) {
      return "";
    }

    const parser = new DOMParser();

    const document = parser.parseFromString(
      `<div id="blog-storage-root">${value}</div>`,
      "text/html"
    );

    const root = document.getElementById("blog-storage-root");

    if (!root) {
      return value;
    }

    root
      .querySelectorAll('[data-flower-shop-default-info="true"]')
      .forEach((element) => element.remove());

    const cleaned = root.innerHTML
      .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, "")
      .trim();

    return convertLegacyTextContentToHtml(cleaned);
  } catch {
    return value;
  }
};

export const normalizeBlogPostContent = (content = "") =>
  removeDefaultShopInfoFromContent(content);

export const composeBlogPostContent = (content, settings) => {
  const articleContent = normalizeBlogPostContent(content);
  const defaultShopInfo = buildDefaultBlogShopInfoHtml(settings);

  if (!defaultShopInfo) {
    return articleContent;
  }

  if (!articleContent) {
    return defaultShopInfo;
  }

  return `${articleContent}${defaultShopInfo}`;
};

const normalizeStoredBlogPosts = (posts) => {
  if (!Array.isArray(posts)) {
    return [];
  }

  return posts.map((post) => {
    if (!post || typeof post !== "object") {
      return post;
    }

    const originalContent = String(post.content || "");
    const cleanedContent = normalizeBlogPostContent(originalContent);

    if (cleanedContent === originalContent) {
      return post;
    }

    return {
      ...post,
      content: cleanedContent,
    };
  });
};

export const DEFAULT_SITE_SETTINGS = {
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
    defaultShopInfoStyle: DEFAULT_BLOG_SHOP_INFO_STYLE,
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

const normalizeBlogStyle = (style) => {
  const source = style && typeof style === "object" ? style : {};

  const defaults = DEFAULT_BLOG_SHOP_INFO_STYLE;

  const number = (value, fallback, min, max) => {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return Math.min(max, Math.max(min, parsed));
  };

  return {
    backgroundColor:
      typeof source.backgroundColor === "string"
        ? source.backgroundColor
        : defaults.backgroundColor,

    borderColor:
      typeof source.borderColor === "string"
        ? source.borderColor
        : defaults.borderColor,

    accentColor:
      typeof source.accentColor === "string"
        ? source.accentColor
        : defaults.accentColor,

    headingColor:
      typeof source.headingColor === "string"
        ? source.headingColor
        : defaults.headingColor,

    textColor:
      typeof source.textColor === "string"
        ? source.textColor
        : defaults.textColor,

    borderRadius: number(source.borderRadius, defaults.borderRadius, 0, 32),

    padding: number(source.padding, defaults.padding, 8, 32),

    headingFontSize: number(
      source.headingFontSize,
      defaults.headingFontSize,
      14,
      32
    ),

    subHeadingFontSize: number(
      source.subHeadingFontSize,
      defaults.subHeadingFontSize,
      12,
      24
    ),

    bodyFontSize: number(source.bodyFontSize, defaults.bodyFontSize, 12, 20),

    lineHeight: number(source.lineHeight, defaults.lineHeight, 1.2, 2),
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
    Math.max(
      5,
      Number.isFinite(rawInterval) ? rawInterval : defaults.hero.bannerInterval
    )
  );

  const sourceBlogHtml = String(source.blog?.defaultShopInfoHtml ?? "").trim();

  const defaultShopInfoHtml =
    isLegacyDefaultBlogShopInfo(sourceBlogHtml) ||
    isBuiltInDefaultBlogShopInfo(sourceBlogHtml)
      ? defaults.blog.defaultShopInfoHtml
      : sanitizeDefaultShopInfoTemplate(sourceBlogHtml);

  const branding = {
    ...defaults.branding,
    ...(source.branding || {}),
  };

  const contact = {
    ...defaults.contact,
    ...(source.contact || {}),

    style: {
      ...defaults.contact.style,
      ...(source.contact?.style || {}),
    },

    extraItems: Array.isArray(source.contact?.extraItems)
      ? source.contact.extraItems
      : [],
  };

  const normalizedBlogPosts = normalizeStoredBlogPosts(
    Array.isArray(source.blogPosts) ? source.blogPosts : []
  );

  return {
    ...defaults,
    ...source,

    branding,

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

    contact,

    blog: {
      ...defaults.blog,
      ...(source.blog || {}),

      defaultShopInfoHtml,

      defaultShopInfoStyle: normalizeBlogStyle(
        source.blog?.defaultShopInfoStyle
      ),
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

    blogPosts: normalizedBlogPosts,
  };
};

export const readSiteSettings = () => {
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);

    if (!raw) {
      const defaults = clone(DEFAULT_SITE_SETTINGS);

      localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(defaults));

      return defaults;
    }

    const parsed = JSON.parse(raw);

    const normalized = mergeSettings(parsed);

    const normalizedRaw = JSON.stringify(normalized);

    if (normalizedRaw !== raw) {
      try {
        localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, normalizedRaw);
      } catch (storageError) {
        console.warn(
          "Không thể lưu dữ liệu site settings sau khi chuẩn hóa:",
          storageError
        );
      }
    }

    return normalized;
  } catch (error) {
    console.error("Không thể đọc site settings:", error);

    return clone(DEFAULT_SITE_SETTINGS);
  }
};

export const saveSiteSettings = (settings) => {
  const normalized = mergeSettings(settings);

  const serialized = JSON.stringify(normalized);

  try {
    const currentRaw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);

    if (currentRaw !== serialized) {
      localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, serialized);
    }
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
