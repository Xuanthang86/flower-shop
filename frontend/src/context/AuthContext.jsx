import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export const AUTH_STORAGE_KEY = "flower-shop-auth";
export const USERS_STORAGE_KEY = "flower-shop-users";

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  PRODUCT_MANAGER: "product_manager",
  CUSTOMER: "customer",
};

export const ROLE_LABELS = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  product_manager: "Quản lý sản phẩm",
  customer: "Khách hàng",
};

export const PERMISSIONS = {
  VIEW_ADMIN: "view_admin",

  MANAGE_USERS: "manage_users",

  MANAGE_PRODUCTS: "manage_products",
  CREATE_PRODUCTS: "create_products",
  UPDATE_PRODUCTS: "update_products",
  DELETE_PRODUCTS: "delete_products",

  MANAGE_ORDERS: "manage_orders",

  VIEW_REPORTS: "view_reports",
};

const ROLE_PERMISSIONS = {
  admin: [
    "view_admin",
    "manage_users",

    "manage_products",
    "create_products",
    "update_products",
    "delete_products",

    "manage_orders",
    "view_reports",
  ],

  manager: ["view_admin", "manage_orders", "view_reports"],

  product_manager: [
    "view_admin",

    "manage_products",
    "create_products",
    "update_products",
  ],

  customer: [],
};

const readUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Không thể đọc danh sách tài khoản:", error);

    return [];
  }
};

const readSession = () => {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    return parsed?.user || null;
  } catch (error) {
    console.error("Không thể đọc phiên đăng nhập:", error);

    sessionStorage.removeItem(AUTH_STORAGE_KEY);

    return null;
  }
};

const saveSession = (user) => {
  sessionStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      user,
      loginAt: new Date().toISOString(),
    })
  );
};

const clearSession = () => {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);

  // Xóa key cũ nếu phiên trước đây từng dùng localStorage.
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

const getUserPermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, passwordHash, ...safeUser } = user;

  return {
    ...safeUser,
    role: safeUser.role || ROLES.CUSTOMER,
  };
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return readSession();
  });

  const [loading, setLoading] = useState(false);

  // ==========================================
  // ĐỒNG BỘ SESSION
  // ==========================================

  useEffect(() => {
    if (user) {
      saveSession(user);
    } else {
      clearSession();
    }
  }, [user]);

  // ==========================================
  // ĐĂNG NHẬP
  // ==========================================

  const login = async (email, password) => {
    setLoading(true);

    try {
      const normalizedEmail = String(email || "")
        .trim()
        .toLowerCase();

      const users = readUsers();

      const foundUser = users.find(
        (item) =>
          String(item.email || "")
            .trim()
            .toLowerCase() === normalizedEmail
      );

      if (!foundUser) {
        return {
          success: false,
          message: "Tài khoản không tồn tại.",
        };
      }

      if (String(foundUser.password || "") !== String(password || "")) {
        return {
          success: false,
          message: "Mật khẩu không chính xác. Vui lòng thử lại.",
        };
      }

      const safeUser = sanitizeUser(foundUser);

      setUser(safeUser);

      saveSession(safeUser);

      return {
        success: true,
        user: safeUser,
      };
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ĐĂNG XUẤT
  // ==========================================

  const logout = () => {
    setUser(null);

    clearSession();
  };

  // ==========================================
  // KIỂM TRA QUYỀN
  // ==========================================

  const hasPermission = (permission) => {
    if (!user) {
      return false;
    }

    const permissions = getUserPermissions(user.role);

    return permissions.includes(permission);
  };

  // ==========================================
  // KIỂM TRA ROLE
  // ==========================================

  const hasRole = (role) => {
    return Boolean(user && user.role === role);
  };

  const isAdmin = user?.role === ROLES.ADMIN;

  const isManager = user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN;

  const isProductManager =
    user?.role === ROLES.PRODUCT_MANAGER || user?.role === ROLES.ADMIN;

  // ==========================================
  // TẠO TÀI KHOẢN
  // ==========================================

  const register = (userData) => {
    const users = readUsers();

    const normalizedEmail = String(userData.email || "")
      .trim()
      .toLowerCase();

    const existingUser = users.find(
      (item) =>
        String(item.email || "")
          .trim()
          .toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      return {
        success: false,
        message: "Email này đã được sử dụng.",
      };
    }

    const newUser = {
      id: userData.id || `customer-${Date.now()}`,

      name: String(userData.name || "").trim(),

      email: normalizedEmail,

      phone: String(userData.phone || "").trim(),

      password: String(userData.password || ""),

      avatar: userData.avatar || "",

      role: userData.role || ROLES.CUSTOMER,

      createdAt: userData.createdAt || new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

    return {
      success: true,
      user: sanitizeUser(newUser),
    };
  };

  // ==========================================
  // TẠO TÀI KHOẢN QUẢN TRỊ
  // CHỈ ADMIN ĐƯỢC THỰC HIỆN
  // ==========================================

  const createStaffAccount = (userData) => {
    if (!isAdmin) {
      return {
        success: false,
        message:
          "Chỉ quản trị viên cấp cao mới có quyền tạo tài khoản quản trị.",
      };
    }

    if (
      ![ROLES.ADMIN, ROLES.MANAGER, ROLES.PRODUCT_MANAGER].includes(
        userData.role
      )
    ) {
      return {
        success: false,
        message: "Quyền tài khoản không hợp lệ.",
      };
    }

    return register({
      ...userData,
      role: userData.role,
    });
  };

  // ==========================================
  // CẬP NHẬT USER
  // ==========================================

  const updateUser = (userId, updates) => {
    if (!isAdmin) {
      return {
        success: false,
        message: "Bạn không có quyền cập nhật tài khoản.",
      };
    }

    const users = readUsers();

    const targetIndex = users.findIndex(
      (item) => String(item.id) === String(userId)
    );

    if (targetIndex === -1) {
      return {
        success: false,
        message: "Không tìm thấy tài khoản.",
      };
    }

    const updatedUsers = [...users];

    updatedUsers[targetIndex] = {
      ...updatedUsers[targetIndex],
      ...updates,

      // Không cho phép ghi đè ID.
      id: updatedUsers[targetIndex].id,

      email: updatedUsers[targetIndex].email,
    };

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

    if (user && String(user.id) === String(userId)) {
      setUser(sanitizeUser(updatedUsers[targetIndex]));
    }

    return {
      success: true,
      user: sanitizeUser(updatedUsers[targetIndex]),
    };
  };

  // ==========================================
  // XÓA USER
  // ==========================================

  const deleteUser = (userId) => {
    if (!isAdmin) {
      return {
        success: false,
        message: "Bạn không có quyền xóa tài khoản.",
      };
    }

    if (String(userId) === String(user?.id)) {
      return {
        success: false,
        message: "Không thể tự xóa tài khoản đang đăng nhập.",
      };
    }

    const users = readUsers();

    const updatedUsers = users.filter(
      (item) => String(item.id) !== String(userId)
    );

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

    return {
      success: true,
    };
  };

  // ==========================================
  // VALUE
  // ==========================================

  const value = {
    user,

    loading,

    login,

    logout,

    register,

    createStaffAccount,

    updateUser,

    deleteUser,

    hasPermission,

    hasRole,

    isAdmin,

    isManager,

    isProductManager,

    permissions: getUserPermissions(user?.role),

    roles: ROLES,

    roleLabels: ROLE_LABELS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider.");
  }

  return context;
};

export default AuthProvider;
