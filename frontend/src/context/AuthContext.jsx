import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

export const AUTH_STORAGE_KEY = "flower-shop-auth";
export const USERS_STORAGE_KEY = "flower-shop-users";

export const ROLES = Object.freeze({
  ADMIN: "admin",
  MANAGER: "manager",
  PRODUCT_MANAGER: "product_manager",
  CUSTOMER: "customer",
});

export const ROLE_LABELS = Object.freeze({
  [ROLES.ADMIN]: "Quản trị viên",
  [ROLES.MANAGER]: "Quản lý",
  [ROLES.PRODUCT_MANAGER]: "Quản lý sản phẩm",
  [ROLES.CUSTOMER]: "Khách hàng",
});

export const PERMISSIONS = Object.freeze({
  VIEW_ADMIN: "view_admin",

  MANAGE_USERS: "manage_users",

  MANAGE_PRODUCTS: "manage_products",
  CREATE_PRODUCTS: "create_products",
  UPDATE_PRODUCTS: "update_products",
  DELETE_PRODUCTS: "delete_products",

  MANAGE_ORDERS: "manage_orders",

  MANAGE_BLOG: "manage_blog",
  MANAGE_IMAGES: "manage_images",
  MANAGE_CONTACT: "manage_contact",
  MANAGE_CONTENT: "manage_content",

  // Chỉ Admin, không đưa vào nhóm quyền Manager/Product Manager.
  MANAGE_APPEARANCE: "manage_appearance",

  // Có thể dùng cho module báo cáo trong tương lai.
  VIEW_REPORTS: "view_reports",
});

export const PERMISSION_LABELS = Object.freeze({
  [PERMISSIONS.MANAGE_ORDERS]: "Quản lý đơn hàng",
  [PERMISSIONS.MANAGE_PRODUCTS]: "Quản lý sản phẩm",

  [PERMISSIONS.CREATE_PRODUCTS]: "Thêm sản phẩm",
  [PERMISSIONS.UPDATE_PRODUCTS]: "Sửa sản phẩm",
  [PERMISSIONS.DELETE_PRODUCTS]: "Xóa sản phẩm",

  [PERMISSIONS.MANAGE_BLOG]: "Quản lý bài viết",
  [PERMISSIONS.MANAGE_IMAGES]: "Quản lý hình ảnh",
  [PERMISSIONS.MANAGE_CONTACT]: "Quản lý thông tin liên hệ",
  [PERMISSIONS.MANAGE_CONTENT]: "Quản lý nội dung website",

  [PERMISSIONS.MANAGE_APPEARANCE]: "Tùy chỉnh giao diện",

  [PERMISSIONS.VIEW_REPORTS]: "Xem báo cáo",
});

/*
 * Đây là các ROLE được phép cấu hình quyền nghiệp vụ tập trung.
 *
 * Khi thêm role mới trong tương lai:
 * 1. Thêm role vào ROLES.
 * 2. Thêm role vào ROLE_PERMISSION_ROLES.
 * 3. Thêm quyền mặc định vào siteSettings.js.
 * 4. Các checkbox trong AdminUsersPage sẽ tự hiển thị role mới.
 */
export const ROLE_PERMISSION_ROLES = Object.freeze([
  ROLES.MANAGER,
  ROLES.PRODUCT_MANAGER,
]);

export const ROLE_PERMISSION_GROUPS = Object.freeze([
  {
    role: ROLES.MANAGER,
    label: ROLE_LABELS[ROLES.MANAGER],
    description:
      "Quyền này áp dụng đồng thời cho tất cả tài khoản có vai trò Manager.",
  },
  {
    role: ROLES.PRODUCT_MANAGER,
    label: ROLE_LABELS[ROLES.PRODUCT_MANAGER],
    description:
      "Quyền này áp dụng đồng thời cho tất cả tài khoản có vai trò Product Manager.",
  },
]);

/*
 * Danh sách quyền nghiệp vụ có thể cấp cho Manager/Product Manager.
 *
 * KHÔNG đưa MANAGE_APPEARANCE vào đây vì:
 * - Tùy chỉnh giao diện chỉ dành cho Admin.
 * - Đây không phải quyền quản lý nghiệp vụ của Manager/Product Manager.
 *
 * Khi có module mới như "Xem báo cáo":
 * - Thêm PERMISSIONS.VIEW_REPORTS vào danh sách này.
 * - Thêm label trong PERMISSION_LABELS.
 * - Thêm module tương ứng vào AdminManagementPage/AppRoutes.
 */
export const MANAGEMENT_PERMISSIONS = [
  PERMISSIONS.MANAGE_ORDERS,
  PERMISSIONS.MANAGE_PRODUCTS,
  PERMISSIONS.MANAGE_BLOG,
  PERMISSIONS.MANAGE_IMAGES,
  PERMISSIONS.MANAGE_CONTENT,
  PERMISSIONS.MANAGE_CONTACT,
  // PERMISSIONS.VIEW_REPORTS,
];

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider.");
  }

  return context;
};
