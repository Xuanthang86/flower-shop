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
  MANAGE_APPEARANCE: "manage_appearance",

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

export const MANAGEMENT_PERMISSIONS = [
  PERMISSIONS.MANAGE_ORDERS,
  PERMISSIONS.MANAGE_PRODUCTS,
  PERMISSIONS.MANAGE_BLOG,
  PERMISSIONS.MANAGE_IMAGES,
  PERMISSIONS.MANAGE_CONTACT,
  PERMISSIONS.MANAGE_CONTENT,
  PERMISSIONS.MANAGE_APPEARANCE,
  PERMISSIONS.VIEW_REPORTS,
];

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider.");
  }

  return context;
};
