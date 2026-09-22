import { getSiteName, readSiteSettings } from "@/services/siteSettings";

export const DEFAULT_PAGE_TITLES = {
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
};

export const getPageTitle = (pageKey, settings = readSiteSettings()) => {
  const siteName = getSiteName(settings);

  const configuredTitle = settings?.seo?.pageTitles?.[pageKey];

  const baseTitle =
    String(configuredTitle || "").trim() ||
    DEFAULT_PAGE_TITLES[pageKey] ||
    DEFAULT_PAGE_TITLES.admin;

  return `${baseTitle} | ${siteName}`;
};
