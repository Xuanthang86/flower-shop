export const SITE_SETTINGS_STORAGE_KEY = "flower-shop-site-settings";

export const SITE_SETTINGS_UPDATED_EVENT = "flower-shop-site-settings-updated";

/*
 * Phân quyền mặc định theo ROLE.
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

/*
 * Template mặc định mới.
 *
 * Đã giảm khoảng cách:
 * - padding ngoài
 * - margin giữa các block
 * - line-height
 * - khoảng cách heading
 *
 * Đồng thời vẫn giữ:
 * - heading
 * - giới thiệu
 * - thông tin liên hệ
 * - liên kết nội bộ
 * - semantic HTML
 */
export const DEFAULT_BLOG_SHOP_INFO_HTML = `
<section
  data-flower-shop-default-info="true"
  style="
    width:100%;
    max-width:100%;
    margin:20px 0 8px;
    padding:22px;
    border:1px solid #fce7f3;
    border-radius:18px;
    background:linear-gradient(
      135deg,
      #fff7fb 0%,
      #ffffff 55%,
      #fffafc 100%
    );
    box-sizing:border-box;
  "
>
  <header
    style="
      margin:0 0 16px;
      padding:0 0 14px;
      border-bottom:1px solid #fbcfe8;
    "
  >
    <p
      style="
        margin:0 0 6px;
        color:#db2777;
        font-size:12px;
        line-height:18px;
        font-weight:700;
        letter-spacing:.08em;
        text-transform:uppercase;
      "
    >
      Thông tin Shop
    </p>

    <h2
      style="
        margin:0;
        color:#1f2937;
        font-size:24px;
        line-height:31px;
        font-weight:800;
      "
    >
      Về {{siteName}}
    </h2>

    <p
      style="
        margin:7px 0 0;
        color:#6b7280;
        font-size:14px;
        line-height:21px;
      "
    >
      {{tagline}}
    </p>
  </header>

  <div
    style="
      color:#4b5563;
      font-size:15px;
      line-height:24px;
    "
  >
    <p style="margin:0 0 13px;">
      <strong style="color:#374151;">
        {{siteName}}
      </strong>
      là cửa hàng hoa tươi hướng tới những sản phẩm được
      tuyển chọn kỹ lưỡng, cách trình bày tinh tế và trải
      nghiệm mua sắm thuận tiện cho khách hàng.
    </p>

    <p style="margin:0 0 13px;">
      Shop cung cấp các sản phẩm hoa phù hợp cho nhiều dịp
      đặc biệt như sinh nhật, khai trương, cưới hỏi,
      chúc mừng, tri ân, kỷ niệm và các sự kiện quan trọng.
    </p>

    <p style="margin:0 0 17px;">
      Chúng tôi chú trọng chất lượng hoa, hình thức trình bày,
      khả năng tư vấn và hỗ trợ khách hàng trong suốt quá trình
      lựa chọn sản phẩm.
    </p>
  </div>

  <section
    style="
      margin:0 0 17px;
      padding:16px;
      border:1px solid #f3f4f6;
      border-radius:14px;
      background:#ffffff;
      box-sizing:border-box;
    "
  >
    <h3
      style="
        margin:0 0 10px;
        color:#374151;
        font-size:16px;
        line-height:24px;
        font-weight:700;
      "
    >
      Thông tin liên hệ
    </h3>

    <p
      style="
        margin:0 0 7px;
        color:#6b7280;
        font-size:14px;
        line-height:22px;
      "
    >
      <strong style="color:#374151;">
        Địa chỉ:
      </strong>
      {{address}}
    </p>

    <p
      style="
        margin:0 0 7px;
        color:#6b7280;
        font-size:14px;
        line-height:22px;
      "
    >
      <strong style="color:#374151;">
        Điện thoại:
      </strong>

      <a
        href="tel:{{phone}}"
        style="
          color:#db2777;
          text-decoration:none;
          font-weight:600;
        "
      >
        {{phone}}
      </a>
    </p>

    <p
      style="
        margin:0 0 7px;
        color:#6b7280;
        font-size:14px;
        line-height:22px;
      "
    >
      <strong style="color:#374151;">
        Email:
      </strong>

      <a
        href="mailto:{{email}}"
        style="
          color:#db2777;
          text-decoration:none;
          font-weight:600;
        "
      >
        {{email}}
      </a>
    </p>

    <p
      style="
        margin:0;
        color:#6b7280;
        font-size:14px;
        line-height:22px;
      "
    >
      <strong style="color:#374151;">
        Thời gian làm việc:
      </strong>
      {{workingHours}}
    </p>
  </section>

  <section
    style="
      margin:0;
      padding:14px 16px;
      border-radius:14px;
      background:#fff;
    "
  >
    <h3
      style="
        margin:0 0 8px;
        color:#374151;
        font-size:16px;
        line-height:23px;
        font-weight:700;
      "
    >
      Khám phá thêm
    </h3>

    <p
      style="
        margin:0;
        color:#6b7280;
        font-size:14px;
        line-height:23px;
      "
    >
      Khám phá thêm các sản phẩm hoa tại
      <a
        href="/products"
        style="
          color:#db2777;
          text-decoration:none;
          font-weight:700;
        "
      >
        danh mục sản phẩm
      </a>
      hoặc tìm hiểu thêm thông tin và kết nối với
      <a
        href="/contact"
        style="
          color:#db2777;
          text-decoration:none;
          font-weight:700;
        "
      >
        Flower Shop
      </a>.
    </p>
  </section>
</section>
`;

/*
 * Template mặc định cũ.
 */
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

/*
 * Chuẩn hóa HTML trước khi so sánh.
 */
const normalizeHtmlForComparison = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

/*
 * Nhận diện các template mặc định cũ.
 *
 * Không dùng việc "content có HTML" làm điều kiện,
 * mà chỉ migrate khi có dấu hiệu rõ ràng của template
 * mặc định do hệ thống sinh ra.
 */
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

  const isOldAdminBlogTemplate =
    normalized.includes('data-flower-shop-default-info="true"') &&
    normalized.includes("Hoa tươi tinh tế cho những khoảnh khắc đáng nhớ.") &&
    normalized.includes("Bạn có thể tham khảo thêm:") &&
    normalized.includes("Xem danh mục sản phẩm");

  if (isOldAdminBlogTemplate) {
    return true;
  }

  const isVeryOldSimpleTemplate =
    normalized.includes("<h2>Về Flower Shop</h2>") &&
    normalized.includes("Thông tin liên hệ") &&
    normalized.includes("Danh mục sản phẩm") &&
    normalized.includes("/contact");

  return isVeryOldSimpleTemplate;
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/*
 * Render template mặc định với dữ liệu shop hiện tại.
 */
const buildDefaultBlogShopInfoHtml = (template, settings) => {
  const branding = settings?.branding || {};
  const contact = settings?.contact || {};

  return String(template || "")
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

/*
 * Thay template cũ bên trong content bài viết.
 *
 * Chỉ tác động tới:
 * - toàn bộ content nếu content chính là template cũ;
 * - block có data-flower-shop-default-info="true"
 *   nếu block đó đúng là template cũ.
 *
 * Không tự ý thay đổi bài viết có nội dung riêng.
 */
const migrateLegacyBlogPostContent = (content, renderedDefaultTemplate) => {
  const value = String(content || "").trim();

  if (!value) {
    return value;
  }

  if (isLegacyDefaultBlogShopInfo(value)) {
    return renderedDefaultTemplate;
  }

  if (!value.includes('data-flower-shop-default-info="true"')) {
    return value;
  }

  try {
    const parser = new DOMParser();

    const document = parser.parseFromString(
      `<div id="flower-shop-migration-root">${value}</div>`,
      "text/html"
    );

    const root = document.getElementById("flower-shop-migration-root");

    const defaultBlock = root?.querySelector(
      '[data-flower-shop-default-info="true"]'
    );

    if (
      !root ||
      !defaultBlock ||
      !isLegacyDefaultBlogShopInfo(defaultBlock.outerHTML)
    ) {
      return value;
    }

    defaultBlock.outerHTML = renderedDefaultTemplate;

    return root.innerHTML;
  } catch {
    return value;
  }
};

const migrateLegacyBlogPosts = (posts, renderedDefaultTemplate) => {
  if (!Array.isArray(posts)) {
    return [];
  }

  return posts.map((post) => {
    if (!post || typeof post !== "object") {
      return post;
    }

    const content = String(post.content || "");

    const migratedContent = migrateLegacyBlogPostContent(
      content,
      renderedDefaultTemplate
    );

    if (migratedContent === content) {
      return post;
    }

    return {
      ...post,
      content: migratedContent,
      updatedAt: new Date().toISOString(),
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

  const sourceBlogHtml = String(source.blog?.defaultShopInfoHtml ?? "").trim();

  const defaultShopInfoHtml = isLegacyDefaultBlogShopInfo(sourceBlogHtml)
    ? defaults.blog.defaultShopInfoHtml
    : sourceBlogHtml;

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

  const renderedDefaultTemplate = buildDefaultBlogShopInfoHtml(
    defaultShopInfoHtml,
    {
      branding,
      contact,
    }
  );

  const migratedBlogPosts = migrateLegacyBlogPosts(
    Array.isArray(source.blogPosts) ? source.blogPosts : [],
    renderedDefaultTemplate
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

    /*
     * Đây là phần quan trọng:
     * các bài viết cũ được tạo từ template
     * mặc định sẽ được migrate ngay khi
     * siteSettings được đọc.
     */
    blogPosts: migratedBlogPosts,
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

    /*
     * Nếu mergeSettings đã migrate dữ liệu
     * hoặc bổ sung default mới, lưu lại ngay.
     *
     * Không dispatch event tại đây vì hàm read
     * có thể được gọi trong quá trình render.
     */
    const normalizedRaw = JSON.stringify(normalized);

    if (normalizedRaw !== raw) {
      try {
        localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, normalizedRaw);
      } catch (storageError) {
        console.warn(
          "Không thể lưu dữ liệu site settings sau migration:",
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
