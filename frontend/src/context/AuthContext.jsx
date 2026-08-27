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
  VIEW_REPORTS: "view_reports",
});

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider.");
  }

  return context;
};
