import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AuthContext,
  AUTH_STORAGE_KEY,
  PERMISSIONS,
  ROLE_LABELS,
  ROLES,
  USERS_STORAGE_KEY,
} from "./AuthContext";
import { validatePassword as validatePasswordRules } from "@/utils/passwordValidation";

const ADMIN_EMAIL = "admin@flowershop.vn";
const ADMIN_BOOTSTRAP_PASSWORD = "Admin@12345";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MANAGER]: [PERMISSIONS.VIEW_ADMIN, PERMISSIONS.MANAGE_ORDERS, PERMISSIONS.VIEW_REPORTS],
  [ROLES.PRODUCT_MANAGER]: [PERMISSIONS.VIEW_ADMIN, PERMISSIONS.MANAGE_PRODUCTS, PERMISSIONS.CREATE_PRODUCTS, PERMISSIONS.UPDATE_PRODUCTS],
  [ROLES.CUSTOMER]: [],
});

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const normalizePhone = (phone) => String(phone || "").trim();
const generateId = (prefix = "user") => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    id: String(user.id || generateId()),
    name: String(user.name || user.fullName || "").trim(),
    email: normalizeEmail(user.email),
    phone: normalizePhone(user.phone),
    role: Object.values(ROLES).includes(user.role) ? user.role : ROLES.CUSTOMER,
    avatar: user.avatar || "",
    disabled: Boolean(user.disabled),
    createdAt: user.createdAt || new Date().toISOString(),
  };
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password: _password, passwordHash: _passwordHash, passwordSalt: _passwordSalt, ...safeUser } = user;
  return safeUser;
};

const readUsers = () => {
  const parsed = safeParse(localStorage.getItem(USERS_STORAGE_KEY), []);
  return Array.isArray(parsed) ? parsed.map(normalizeUser).filter(Boolean) : [];
};

const writeUsers = (users) => localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

const readSession = () => {
  const parsed = safeParse(sessionStorage.getItem(AUTH_STORAGE_KEY), null);
  return parsed?.user ? sanitizeUser(normalizeUser(parsed.user)) : null;
};

const saveSession = (user) => {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: sanitizeUser(user), loginAt: new Date().toISOString() }));
};

const clearSession = () => {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

const ensureBootstrapAdmin = () => {
  const users = readUsers();
  const index = users.findIndex((item) => item.email === ADMIN_EMAIL);

  if (index === -1) {
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
  } else {
    const existing = users[index];
    users[index] = {
      ...existing,
      id: "admin-001",
      email: ADMIN_EMAIL,
      role: ROLES.ADMIN,
      disabled: false,
      name: existing.name || "Quản trị viên",
      password: existing.password === "admin123" || !existing.password ? ADMIN_BOOTSTRAP_PASSWORD : existing.password,
    };
  }

  writeUsers(users);
  return users;
};

const getPasswordValidation = (password) => {
  const result = validatePasswordRules(password);
  return { ...result, message: result.errors.join(" ") };
};

const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => ensureBootstrapAdmin());
  const [user, setUser] = useState(() => readSession());
  const [loading, setLoading] = useState(false);

  const persistUsers = useCallback((nextUsers) => {
    setUsers(nextUsers);
    writeUsers(nextUsers);
  }, []);

  useEffect(() => {
    if (!user) {
      clearSession();
      return undefined;
    }

    const verifyCurrentAccount = () => {
      const current = readUsers().find((item) => String(item.id) === String(user.id));
      if (!current || current.disabled) {
        setUser(null);
        clearSession();
        return;
      }

      const safeUser = sanitizeUser(current);
      setUser((previous) => {
        if (JSON.stringify(previous) === JSON.stringify(safeUser)) return previous;
        saveSession(safeUser);
        return safeUser;
      });
    };

    verifyCurrentAccount();
    const handleStorage = (event) => {
      if (event.key === USERS_STORAGE_KEY) verifyCurrentAccount();
    };
    window.addEventListener("storage", handleStorage);
    const timer = window.setInterval(verifyCurrentAccount, 1000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.clearInterval(timer);
    };
  }, [user?.id]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const foundUser = readUsers().find((item) => item.email === normalizeEmail(email));
      if (!foundUser) return { success: false, message: "Tài khoản không tồn tại." };
      if (foundUser.disabled) return { success: false, message: "Tài khoản này đã bị khóa/vô hiệu hóa." };
      if (String(foundUser.password || "") !== String(password || "")) {
        return { success: false, message: "Mật khẩu không chính xác. Vui lòng thử lại." };
      }
      const safeUser = sanitizeUser(foundUser);
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

  const createAccount = useCallback((userData = {}, role = ROLES.CUSTOMER) => {
    const name = String(userData.name || "").trim();
    const email = normalizeEmail(userData.email);
    const phone = normalizePhone(userData.phone);
    const password = String(userData.password || "");

    if (!name) return { success: false, message: "Vui lòng nhập họ và tên." };
    if (!emailPattern.test(email)) return { success: false, message: "Email không đúng định dạng." };
    if (!phone) return { success: false, message: "Vui lòng nhập số điện thoại." };
    if (email === ADMIN_EMAIL) return { success: false, message: "Email này được dành riêng cho tài khoản quản trị." };

    const passwordResult = getPasswordValidation(password);
    if (!passwordResult.valid) return { success: false, message: passwordResult.message };

    const currentUsers = readUsers();
    if (currentUsers.some((item) => item.email === email)) return { success: false, message: "Email này đã được đăng ký." };
    if (currentUsers.some((item) => item.phone === phone)) return { success: false, message: "Số điện thoại này đã được đăng ký." };

    const newUser = normalizeUser({
      id: generateId(role === ROLES.CUSTOMER ? "customer" : "staff"),
      name,
      email,
      phone,
      password,
      role,
      avatar: userData.avatar || "",
      disabled: false,
    });

    persistUsers([...currentUsers, newUser]);
    return { success: true, user: sanitizeUser(newUser), message: "Tạo tài khoản thành công." };
  }, [persistUsers]);

  const register = useCallback((userData = {}) => createAccount(userData, ROLES.CUSTOMER), [createAccount]);

  const createStaffAccount = useCallback((userData = {}) => {
    if (user?.role !== ROLES.ADMIN) return { success: false, message: "Chỉ quản trị viên cấp cao mới có quyền tạo tài khoản quản trị." };
    if (![ROLES.MANAGER, ROLES.PRODUCT_MANAGER].includes(userData.role)) {
      return { success: false, message: "Quyền tài khoản không hợp lệ." };
    }
    return createAccount(userData, userData.role);
  }, [createAccount, user?.role]);

  const createUser = useCallback((userData = {}) => createStaffAccount(userData), [createStaffAccount]);

  const updateProfile = useCallback((updates = {}) => {
    if (!user) return { success: false, message: "Bạn chưa đăng nhập." };
    const currentUsers = readUsers();
    const index = currentUsers.findIndex((item) => String(item.id) === String(user.id));
    if (index === -1) return { success: false, message: "Không tìm thấy tài khoản." };

    const current = currentUsers[index];
    const updated = normalizeUser({ ...current, name: updates.name ?? current.name, phone: updates.phone ?? current.phone, avatar: updates.avatar ?? current.avatar });
    if (!updated.name) return { success: false, message: "Họ và tên không được để trống." };
    if (currentUsers.some((item, itemIndex) => itemIndex !== index && item.phone && item.phone === updated.phone)) {
      return { success: false, message: "Số điện thoại này đã được tài khoản khác sử dụng." };
    }

    const nextUsers = [...currentUsers];
    nextUsers[index] = updated;
    persistUsers(nextUsers);
    const safeUser = sanitizeUser(updated);
    setUser(safeUser);
    saveSession(safeUser);
    return { success: true, user: safeUser, message: "Cập nhật thông tin thành công." };
  }, [persistUsers, user]);

  const changePassword = useCallback((currentPassword, newPassword) => {
    if (!user) return { success: false, message: "Bạn chưa đăng nhập." };
    if (String(currentPassword || "") === String(newPassword || "")) return { success: false, message: "Mật khẩu mới phải khác mật khẩu hiện tại." };

    const passwordResult = getPasswordValidation(newPassword);
    if (!passwordResult.valid) return { success: false, message: passwordResult.message };

    const currentUsers = readUsers();
    const index = currentUsers.findIndex((item) => String(item.id) === String(user.id));
    if (index === -1) return { success: false, message: "Không tìm thấy tài khoản." };
    if (String(currentUsers[index].password || "") !== String(currentPassword || "")) {
      return { success: false, message: "Mật khẩu hiện tại không chính xác." };
    }

    const updated = { ...currentUsers[index], password: String(newPassword) };
    const nextUsers = [...currentUsers];
    nextUsers[index] = updated;
    persistUsers(nextUsers);
    const safeUser = sanitizeUser(updated);
    setUser(safeUser);
    saveSession(safeUser);
    return { success: true, user: safeUser, message: "Đổi mật khẩu thành công." };
  }, [persistUsers, user]);

  const updateUser = useCallback((userId, updates = {}) => {
    if (user?.role !== ROLES.ADMIN) return { success: false, message: "Bạn không có quyền cập nhật tài khoản." };
    const currentUsers = readUsers();
    const index = currentUsers.findIndex((item) => String(item.id) === String(userId));
    if (index === -1) return { success: false, message: "Không tìm thấy tài khoản." };

    const target = currentUsers[index];
    const nextUser = normalizeUser({ ...target, ...updates, id: target.id, email: target.email });
    if (target.email === ADMIN_EMAIL) {
      nextUser.email = ADMIN_EMAIL;
      nextUser.role = ROLES.ADMIN;
      nextUser.disabled = false;
    }

    const nextUsers = [...currentUsers];
    nextUsers[index] = nextUser;
    persistUsers(nextUsers);
    if (String(user.id) === String(userId)) {
      const safeUser = sanitizeUser(nextUser);
      setUser(safeUser);
      saveSession(safeUser);
    }
    return { success: true, user: sanitizeUser(nextUser), message: "Cập nhật tài khoản thành công." };
  }, [persistUsers, user]);

  const deleteUser = useCallback((userId) => {
    if (user?.role !== ROLES.ADMIN) return { success: false, message: "Bạn không có quyền xóa tài khoản." };
    if (String(userId) === String(user.id)) return { success: false, message: "Không thể tự xóa tài khoản đang đăng nhập." };
    const currentUsers = readUsers();
    const target = currentUsers.find((item) => String(item.id) === String(userId));
    if (!target) return { success: false, message: "Không tìm thấy tài khoản." };
    if (target.email === ADMIN_EMAIL) return { success: false, message: "Không thể xóa tài khoản quản trị gốc." };
    persistUsers(currentUsers.filter((item) => String(item.id) !== String(userId)));
    return { success: true, message: "Đã xóa tài khoản." };
  }, [persistUsers, user]);

  const toggleUserDisabled = useCallback((userId) => {
    if (user?.role !== ROLES.ADMIN) return { success: false, message: "Bạn không có quyền khóa tài khoản." };
    const currentUsers = readUsers();
    const index = currentUsers.findIndex((item) => String(item.id) === String(userId));
    if (index === -1) return { success: false, message: "Không tìm thấy tài khoản." };
    if (currentUsers[index].email === ADMIN_EMAIL) return { success: false, message: "Không thể khóa tài khoản quản trị gốc." };

    const nextUsers = [...currentUsers];
    nextUsers[index] = { ...nextUsers[index], disabled: !nextUsers[index].disabled };
    persistUsers(nextUsers);
    return { success: true, user: sanitizeUser(nextUsers[index]) };
  }, [persistUsers, user]);

  const resetUserPassword = useCallback((userId, newPassword) => {
    if (user?.role !== ROLES.ADMIN) return { success: false, message: "Bạn không có quyền đổi mật khẩu tài khoản." };
    const passwordResult = getPasswordValidation(newPassword);
    if (!passwordResult.valid) return { success: false, message: passwordResult.message };

    const currentUsers = readUsers();
    const index = currentUsers.findIndex((item) => String(item.id) === String(userId));
    if (index === -1) return { success: false, message: "Không tìm thấy tài khoản." };

    const nextUsers = [...currentUsers];
    nextUsers[index] = { ...nextUsers[index], password: String(newPassword) };
    persistUsers(nextUsers);
    return { success: true, message: "Đã đặt lại mật khẩu tài khoản." };
  }, [persistUsers, user]);

  const hasPermission = useCallback((permission) => Boolean(user && !user.disabled && ROLE_PERMISSIONS[user.role]?.includes(permission)), [user]);
  const hasRole = useCallback((role) => Boolean(user && !user.disabled && user.role === role), [user]);
  const permissions = useMemo(() => ROLE_PERMISSIONS[user?.role] || [], [user?.role]);

  const value = useMemo(() => ({
    user,
    users,
    loading,
    login,
    logout,
    register,
    createStaffAccount,
    createUser,
    updateProfile,
    changePassword,
    updateUser,
    deleteUser,
    toggleUserDisabled,
    resetUserPassword,
    validatePassword: getPasswordValidation,
    hasPermission,
    hasRole,
    isAdmin: user?.role === ROLES.ADMIN,
    isManager: user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER,
    isProductManager: user?.role === ROLES.ADMIN || user?.role === ROLES.PRODUCT_MANAGER,
    permissions,
    roles: ROLES,
    roleLabels: ROLE_LABELS,
    ROLE_LABELS,
  }), [
    user, users, loading, login, logout, register, createStaffAccount, createUser,
    updateProfile, changePassword, updateUser, deleteUser, toggleUserDisabled,
    resetUserPassword, hasPermission, hasRole, permissions,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
