import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AuthContext,
  PERMISSIONS,
  ROLE_LABELS,
  ROLES,
  USERS_STORAGE_KEY,
  AUTH_STORAGE_KEY,
} from "./AuthContext";
import { validatePassword } from "../utils/passwordValidation";

const ADMIN_EMAIL = "admin@flowershop.vn";
const ADMIN_BOOTSTRAP_PASSWORD = "Admin@123456";

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MANAGER]: [PERMISSIONS.VIEW_ADMIN, PERMISSIONS.MANAGE_ORDERS, PERMISSIONS.VIEW_REPORTS],
  [ROLES.PRODUCT_MANAGER]: [
    PERMISSIONS.VIEW_ADMIN,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCTS,
    PERMISSIONS.UPDATE_PRODUCTS,
  ],
  [ROLES.CUSTOMER]: [],
};

const safeParse = (value, fallback) => {
  try {
    const parsed = value ? JSON.parse(value) : fallback;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const generateId = (prefix = "user") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeUser = (user) => {
  if (!user) return null;
  const email = String(user.email || "").trim().toLowerCase();
  return {
    ...user,
    id: String(user.id || generateId("user")),
    name: String(user.name || user.fullName || "").trim(),
    email,
    phone: String(user.phone || "").trim(),
    role: Object.values(ROLES).includes(user.role) ? user.role : ROLES.CUSTOMER,
    avatar: user.avatar || "",
    disabled: Boolean(user.disabled),
    createdAt: user.createdAt || new Date().toISOString(),
  };
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, passwordHash, passwordSalt, ...safeUser } = user;
  return { ...safeUser, role: safeUser.role || ROLES.CUSTOMER };
};

const readUsers = () => {
  const parsed = safeParse(localStorage.getItem(USERS_STORAGE_KEY), []);
  return Array.isArray(parsed) ? parsed.map(normalizeUser).filter(Boolean) : [];
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users.map(normalizeUser)));
};

const bootstrapAdmin = () => {
  const users = readUsers();
  const index = users.findIndex((item) => item.email === ADMIN_EMAIL);
  if (index >= 0) {
    users[index] = {
      ...users[index],
      id: "admin-001",
      email: ADMIN_EMAIL,
      role: ROLES.ADMIN,
      name: users[index].name || "Quản trị viên",
      disabled: false,
    };
  } else {
    users.unshift({
      id: "admin-001",
      name: "Quản trị viên",
      email: ADMIN_EMAIL,
      phone: "0900000000",
      password: ADMIN_BOOTSTRAP_PASSWORD,
      role: ROLES.ADMIN,
      avatar: "",
      disabled: false,
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  }
  saveUsers(users);
  return users;
};

const readSession = () => {
  const parsed = safeParse(sessionStorage.getItem(AUTH_STORAGE_KEY), null);
  return parsed?.user ? sanitizeUser(normalizeUser(parsed.user)) : null;
};

const saveSession = (user) => {
  sessionStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ user: sanitizeUser(user), loginAt: new Date().toISOString() })
  );
};

const clearSession = () => {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => bootstrapAdmin());
  const [user, setUser] = useState(() => readSession());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    if (!user) return undefined;
    const verify = () => {
      const current = readUsers().find((item) => String(item.id) === String(user.id));
      if (!current || current.disabled) {
        setUser(null);
        clearSession();
        return;
      }
      const safe = sanitizeUser(current);
      setUser((previous) =>
        JSON.stringify(previous) === JSON.stringify(safe) ? previous : safe
      );
      saveSession(safe);
    };
    verify();
    const handleStorage = (event) => {
      if (event.key === USERS_STORAGE_KEY) verify();
    };
    window.addEventListener("storage", handleStorage);
    const timer = window.setInterval(verify, 1000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.clearInterval(timer);
    };
  }, [user?.id]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const found = readUsers().find((item) => item.email === normalizedEmail);
      if (!found) return { success: false, message: "Tài khoản không tồn tại." };
      if (found.disabled) {
        clearSession();
        return { success: false, message: "Tài khoản này đã bị khóa/vô hiệu hóa." };
      }
      if (String(found.password || "") !== String(password || "")) {
        return { success: false, message: "Mật khẩu không chính xác. Vui lòng thử lại." };
      }
      const safeUser = sanitizeUser(found);
      setUser(safeUser);
      saveSession(safeUser);
      return { success: true, user: safeUser };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearSession();
  }, []);

  const register = useCallback((userData = {}) => {
    const name = String(userData.name || "").trim();
    const email = String(userData.email || "").trim().toLowerCase();
    const phone = String(userData.phone || "").trim();
    const password = String(userData.password || "");
    if (!name) return { success: false, message: "Vui lòng nhập họ và tên." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: "Email không đúng định dạng." };
    }
    if (!phone) return { success: false, message: "Vui lòng nhập số điện thoại." };
    if (email === ADMIN_EMAIL) {
      return { success: false, message: "Email này được dành riêng cho tài khoản quản trị." };
    }
    const checked = validatePassword(password);
    if (!checked.valid) return { success: false, message: checked.errors.join(" ") };
    const currentUsers = readUsers();
    if (currentUsers.some((item) => item.email === email)) {
      return { success: false, message: "Email này đã được đăng ký." };
    }
    if (currentUsers.some((item) => item.phone === phone)) {
      return { success: false, message: "Số điện thoại này đã được đăng ký." };
    }
    const newUser = normalizeUser({
      id: generateId("customer"),
      name,
      email,
      phone,
      password,
      role: ROLES.CUSTOMER,
      avatar: "",
      disabled: false,
    });
    const nextUsers = [...currentUsers, newUser];
    setUsers(nextUsers);
    saveUsers(nextUsers);
    return { success: true, user: sanitizeUser(newUser) };
  }, []);

  const createStaffAccount = useCallback((userData = {}) => {
    if (user?.role !== ROLES.ADMIN) {
      return { success: false, message: "Chỉ quản trị viên cấp cao mới có quyền tạo tài khoản quản trị." };
    }
    const allowedRoles = [ROLES.ADMIN, ROLES.MANAGER, ROLES.PRODUCT_MANAGER];
    if (!allowedRoles.includes(userData.role)) {
      return { success: false, message: "Quyền tài khoản không hợp lệ." };
    }
    return register({ ...userData, role: userData.role });
  }, [register, user?.role]);

  const updateUser = useCallback((userId, updates = {}) => {
    if (user?.role !== ROLES.ADMIN) return { success: false, message: "Bạn không có quyền cập nhật tài khoản." };
    const currentUsers = readUsers();
    const index = currentUsers.findIndex((item) => String(item.id) === String(userId));
    if (index < 0) return { success: false, message: "Không tìm thấy tài khoản." };
    const target = currentUsers[index];
    const next = { ...target, ...updates, id: target.id, email: target.email };
    if (target.email === ADMIN_EMAIL) Object.assign(next, { email: ADMIN_EMAIL, role: ROLES.ADMIN, disabled: false });
    const updatedUsers = [...currentUsers];
    updatedUsers[index] = normalizeUser(next);
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    if (String(user.id) === String(userId)) setUser(sanitizeUser(updatedUsers[index]));
    return { success: true, user: sanitizeUser(updatedUsers[index]) };
  }, [user]);

  const deleteUser = useCallback((userId) => {
    if (user?.role !== ROLES.ADMIN) return { success: false, message: "Bạn không có quyền xóa tài khoản." };
    if (String(userId) === String(user?.id)) return { success: false, message: "Không thể tự xóa tài khoản đang đăng nhập." };
    const updatedUsers = readUsers().filter((item) => String(item.id) !== String(userId));
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    return { success: true };
  }, [user]);

  const hasPermission = useCallback(
    (permission) => Boolean(user && !user.disabled && (ROLE_PERMISSIONS[user.role] || []).includes(permission)),
    [user]
  );
  const hasRole = useCallback((role) => Boolean(user && !user.disabled && user.role === role), [user]);
  const permissions = useMemo(() => ROLE_PERMISSIONS[user?.role] || [], [user?.role]);

  const value = {
    user, users, loading, login, logout, register, createStaffAccount,
    updateUser, deleteUser, hasPermission, hasRole,
    isAdmin: user?.role === ROLES.ADMIN,
    isManager: user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN,
    isProductManager: user?.role === ROLES.PRODUCT_MANAGER || user?.role === ROLES.ADMIN,
    permissions, roles: ROLES, roleLabels: ROLE_LABELS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
