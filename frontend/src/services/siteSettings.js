export const getSiteName = (settings) =>
  String(settings?.branding?.siteName || "HTH Flower Shop").trim();

export const getPageTitle = (settings, title) => {
  const siteName = getSiteName(settings);
  const pageTitle = String(title || "").trim();

  if (!pageTitle) {
    return siteName;
  }

  return `${pageTitle} | ${siteName}`;
};

export const getSiteTagline = (settings) =>
  String(settings?.branding?.tagline || "Fresh Flower Everyday").trim();

export const getEmailDomain = (settings) =>
  String(settings?.branding?.emailDomain || "hth.flowershop.vn")
    .trim()
    .replace(/^@+/, "");

export const buildBrandEmail = (localPart, settings) => {
  const local = String(localPart || "")
    .trim()
    .replace(/@.*$/, "");

  const domain = getEmailDomain(settings);

  if (!local || !domain) {
    return "";
  }

  return `${local}@${domain}`;
};

export const getSeoTitle = (settings, key, fallback = "") => {
  const title = String(settings?.seo?.[key] || "").trim();

  return title || fallback;
};

export const SITE_SETTINGS_STORAGE_KEY = "flower-shop-site-settings";

export const BLOG_POSTS_STORAGE_KEY = "flower-shop-blog-posts";

export const BLOG_POSTS_UPDATED_EVENT = "flower-shop-blog-posts-updated";

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
  <a href="/contact">{{siteName}}</a>.
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
<h2>Về HTH Flower Shop</h2>
<p>
  HTH Flower Shop là cửa hàng hoa tươi chuyên cung cấp những sản phẩm hoa đẹp,
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
    normalized.includes("Về HTH Flower Shop") &&
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
      escapeHtml(branding.siteName || "HTH Flower Shop")
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

export const DEFAULT_SITE_SETTINGS = {
  announcementMessages: [
    "🌸 Miễn phí giao hàng cho đơn từ 500.000đ",
    "🚚 Đặt trước 14h — giao hoa trong ngày",
    "💐 Hoa tươi được tuyển chọn mỗi ngày",
    "🎁 Tặng thiệp miễn phí cho mọi đơn hàng",
  ],

  branding: {
    siteName: "HTH Flower Shop",
    tagline: "Fresh Flower Everyday",
    logoImage: "",
    logoAlt: "HTH Flower Shop",

    /*
     * Domain thương hiệu dùng chung.
     * Khi đổi domain/email thương hiệu,
     * chỉ thay tại đây.
     */
    emailDomain: "hth.flowershop.vn",
  },

  seo: {
    homeTitle: "HTH Flower Shop | Hoa tươi cho những khoảnh khắc đáng nhớ",

    contactTitle: "Quản lý thông tin liên hệ | HTH Flower Shop",

    blogTitle: "Bài viết | HTH Flower Shop",

    productsTitle: "Hoa tươi | HTH Flower Shop",

    defaultDescription:
      "HTH Flower Shop cung cấp hoa tươi cho sinh nhật, khai trương, cưới hỏi, chúc mừng và những dịp đặc biệt.",

    pageTitles: {
      admin: "Khu vực quản lý",
      orders: "Quản lý đơn hàng",
      products: "Quản lý sản phẩm",
      categories: "Quản lý danh mục hoa",
      content: "Quản lý nội dung website",
      blog: "Quản lý bài viết",
      blogCategories: "Danh mục bài viết",
      images: "Quản lý hình ảnh",
      contact: "Quản lý thông tin liên hệ",
      payment: "Cấu hình thanh toán",
      coupons: "Quản lý khuyến mãi",
      users: "Quản lý tài khoản",
      appearance: "Tùy chỉnh giao diện",
    },
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
    copyright: "© 2026 HTH Flower Shop. All Rights Reserved.",
  },

  shipping: {
    deliveryDateNextDayCutoffHour: 21,
  },

  contact: {
    title: "Liên hệ",

    description:
      "HTH Flower Shop luôn sẵn sàng tư vấn và hỗ trợ bạn lựa chọn những bó hoa phù hợp.",

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

  blogCategories: [],

  blogPosts: [],

  blog: {
    columns: 3,

    introTitle: "Bài viết",

    introDescription:
      "Những câu chuyện, kiến thức và cảm hứng từ {{siteName}}.",

    shopSummary:
      "{{siteName}} chia sẻ những câu chuyện, kiến thức về hoa và cảm hứng để bạn lựa chọn những sản phẩm phù hợp cho từng khoảnh khắc đặc biệt.",

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

const normalizeBlogCategory = (category, index = 0) => {
  const source = category && typeof category === "object" ? category : {};

  return {
    id:
      String(source.id || "").trim() || `blog-category-${Date.now()}-${index}`,

    name: String(source.name || "").trim(),

    slug: String(source.slug || "").trim(),

    description: String(source.description || "").trim(),

    image: String(source.image || "").trim(),

    active: source.active !== false,

    sortOrder: Number.isFinite(Number(source.sortOrder))
      ? Number(source.sortOrder)
      : index + 1,

    seoTitle: String(source.seoTitle || "").trim(),

    seoDescription: String(source.seoDescription || "").trim(),

    createdAt: source.createdAt || new Date().toISOString(),

    updatedAt: source.updatedAt || new Date().toISOString(),
  };
};

const normalizeBlogCategories = (categories) => {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories
    .map((category, index) => normalizeBlogCategory(category, index))
    .filter((category) => category.name)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
};

const createBlogSlug = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const stripHtml = (value = "") =>
  String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const createBlogExcerpt = (content, maxLength = 180) => {
  const text = stripHtml(content);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}…`;
};

const normalizeBlogPost = (post, index = 0) => {
  const source = post && typeof post === "object" ? post : {};

  const title = String(source.title || "").trim();

  const content = normalizeBlogPostContent(source.content || "");

  const slug = String(source.slug || "").trim() || createBlogSlug(title);

  return {
    id: String(source.id || "").trim() || `blog-post-${Date.now()}-${index}`,

    categoryId: String(source.categoryId || "").trim(),

    categorySlug: String(source.categorySlug || "").trim(),

    categoryName: String(source.categoryName || "").trim(),

    title,

    slug,

    excerpt: String(source.excerpt || "").trim() || createBlogExcerpt(content),

    content,

    image: String(source.image || "").trim(),

    author: String(source.author || "").trim() || "HTH Flower Shop",

    status: source.status === "draft" ? "draft" : "published",

    publishedAt: source.publishedAt || source.date || new Date().toISOString(),

    updatedAt: source.updatedAt || new Date().toISOString(),

    seoTitle: String(source.seoTitle || "").trim(),

    seoDescription: String(source.seoDescription || "").trim(),

    /*
     * Giữ lại dữ liệu cũ để tương thích.
     */
    date: source.date || "",

    time: source.time || "",
  };
};

const normalizeBlogPosts = (posts) => {
  if (!Array.isArray(posts)) {
    return [];
  }

  return posts.map((post, index) => normalizeBlogPost(post, index));
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

  const seo = {
    ...defaults.seo,
    ...(source.seo || {}),
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

  const normalizedBlogCategories = normalizeBlogCategories(
    Array.isArray(source.blogCategories) ? source.blogCategories : []
  );

  const normalizedBlogPosts = [];

  return {
    ...defaults,
    ...source,

    branding,

    seo,

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

    blogCategories: normalizedBlogCategories,

    blogPosts: normalizedBlogPosts,

    shipping: {
      ...defaults.shipping,

      ...(source.shipping || {}),

      deliveryDateNextDayCutoffHour: Math.min(
        23,
        Math.max(
          0,
          Number(
            source.shipping?.deliveryDateNextDayCutoffHour ??
              defaults.shipping.deliveryDateNextDayCutoffHour
          )
        )
      ),
    },
  };
};

export const readBlogPosts = () => {
  try {
    const raw = localStorage.getItem(BLOG_POSTS_STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);

      return normalizeBlogPosts(parsed);
    }

    /*
     * Migration một lần từ cấu trúc cũ:
     *
     * flower-shop-site-settings.blogPosts
     *
     * sang:
     *
     * flower-shop-blog-posts
     */
    const settingsRaw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);

    if (!settingsRaw) {
      return [];
    }

    const settings = JSON.parse(settingsRaw);

    const legacyPosts = Array.isArray(settings?.blogPosts)
      ? settings.blogPosts
      : [];

    const normalizedPosts = normalizeBlogPosts(legacyPosts);

    if (normalizedPosts.length > 0) {
      localStorage.setItem(
        BLOG_POSTS_STORAGE_KEY,
        JSON.stringify(normalizedPosts)
      );
    }

    return normalizedPosts;
  } catch (error) {
    console.error("Không thể đọc danh sách bài viết:", error);

    return [];
  }
};

export const saveBlogPosts = (posts) => {
  const normalizedPosts = normalizeBlogPosts(Array.isArray(posts) ? posts : []);

  const serialized = JSON.stringify(normalizedPosts);

  try {
    localStorage.setItem(BLOG_POSTS_STORAGE_KEY, serialized);
  } catch (error) {
    console.error("Không thể lưu danh sách bài viết:", error);

    if (error?.name === "QuotaExceededError") {
      throw new Error(
        "Không thể lưu bài viết vì bộ nhớ trình duyệt đã đạt giới hạn. Hãy kiểm tra lại hình ảnh trong bài viết."
      );
    }

    throw new Error(error?.message || "Không thể lưu bài viết.");
  }

  window.dispatchEvent(new Event(BLOG_POSTS_UPDATED_EVENT));

  return normalizedPosts;
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
