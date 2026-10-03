import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AuthContext,
  AUTH_STORAGE_KEY,
  MANAGEMENT_PERMISSIONS,
  PERMISSIONS,
  PERMISSION_LABELS,
  ROLE_LABELS,
  ROLES,
} from "./AuthContext";

import { validatePassword as validatePasswordRules } from "@/utils/passwordValidation";

import {
  readSiteSettings,
  saveSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
  DEFAULT_ROLE_PERMISSIONS,
} from "@/services/siteSettings";

import {
  loginApi,
  registerApi,
  googleLoginApi,
  getCurrentAuthUserApi,
  logoutApi,
  changePasswordApi,
  listUsersApi,
  createStaffApi,
  updateUserApi,
  deleteUserApi,
  resetUserPasswordApi,
} from "@/services/authApi";

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,

    id: String(user.id || user._id || ""),

    name: String(user.name || user.fullName || "").trim(),

    email: String(user.email || "")
      .trim()
      .toLowerCase(),

    phone: String(user.phone || "").trim(),

    role: Object.values(ROLES).includes(user.role) ? user.role : ROLES.CUSTOMER,

    avatar: String(user.avatar || ""),

    disabled: Boolean(user.disabled),

    createdAt: user.createdAt || null,

    updatedAt: user.updatedAt || null,

    lastLoginAt: user.lastLoginAt || null,
  };
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const safeUser = { ...user };

  delete safeUser.password;
  delete safeUser.passwordHash;
  delete safeUser.passwordSalt;

  return safeUser;
};

const saveSession = (user) => {
  if (!user) {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      user: sanitizeUser(user),
      loginAt: new Date().toISOString(),
    })
  );
};

const readSession = () => {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    return parsed?.user ? sanitizeUser(normalizeUser(parsed.user)) : null;
  } catch {
    return null;
  }
};

const clearSession = () => {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
};

const getPasswordValidation = (password) => {
  const result = validatePasswordRules(password);

  return {
    ...result,
    message: result.errors.join(" "),
  };
};

const getDefaultRolePermissions = (role) => {
  if (role === ROLES.ADMIN) {
    return Object.values(PERMISSIONS);
  }

  return DEFAULT_ROLE_PERMISSIONS?.[role] || [];
};

const normalizePermissionList = (permissions, role) => {
  if (role === ROLES.ADMIN) {
    return Object.values(PERMISSIONS);
  }

  const source = Array.isArray(permissions)
    ? permissions
    : getDefaultRolePermissions(role);

  return [
    ...new Set(
      source.filter((permission) => MANAGEMENT_PERMISSIONS.includes(permission))
    ),
  ];
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readSession());

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [rolePermissions, setRolePermissions] = useState(() => {
    const settings = readSiteSettings();

    return {
      manager: normalizePermissionList(
        settings.rolePermissions?.manager,
        ROLES.MANAGER
      ),

      product_manager: normalizePermissionList(
        settings.rolePermissions?.product_manager,
        ROLES.PRODUCT_MANAGER
      ),
    };
  });

  const refreshUsers = useCallback(async () => {
    try {
      const result = await listUsersApi();

      const nextUsers = Array.isArray(result?.items)
        ? result.items.map(normalizeUser)
        : [];

      setUsers(nextUsers);

      return {
        success: true,
        users: nextUsers,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách tài khoản.",
      };
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const existingSession = readSession();

      /*
       * Không còn sessionStorage:
       *
       * - Đây là phiên trình duyệt mới.
       * - Không được dùng accessToken cookie cũ để tự đăng nhập lại.
       */
      if (!existingSession) {
        clearSession();

        if (!cancelled) {
          setUser(null);
          setUsers([]);
          setLoading(false);
        }

        return;
      }

      try {
        const currentUser = await getCurrentAuthUserApi();

        if (cancelled) {
          return;
        }

        if (currentUser) {
          const normalized = normalizeUser(currentUser);

          setUser(normalized);
          saveSession(normalized);

          if (normalized.role === ROLES.ADMIN) {
            await refreshUsers();
          }
        } else {
          setUser(null);
          setUsers([]);
          clearSession();
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setUsers([]);
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [refreshUsers]);

  useEffect(() => {
    const refreshPermissions = () => {
      const settings = readSiteSettings();

      setRolePermissions({
        manager: normalizePermissionList(
          settings.rolePermissions?.manager,
          ROLES.MANAGER
        ),

        product_manager: normalizePermissionList(
          settings.rolePermissions?.product_manager,
          ROLES.PRODUCT_MANAGER
        ),
      });
    };

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refreshPermissions);

    window.addEventListener("storage", refreshPermissions);

    return () => {
      window.removeEventListener(
        SITE_SETTINGS_UPDATED_EVENT,
        refreshPermissions
      );

      window.removeEventListener("storage", refreshPermissions);
    };
  }, []);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);

      try {
        const result = await loginApi(email, password);

        if (!result?.success || !result?.user) {
          return {
            success: false,
            message: result?.message || "Đăng nhập thất bại.",
          };
        }

        const safeUser = normalizeUser(result.user);

        setUser(safeUser);
        saveSession(safeUser);

        if (safeUser.role === ROLES.ADMIN) {
          await refreshUsers();
        }

        return {
          success: true,
          user: safeUser,
        };
      } catch (error) {
        return {
          success: false,
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Đăng nhập thất bại.",
        };
      } finally {
        setLoading(false);
      }
    },
    [refreshUsers]
  );

  const loginWithGoogle = useCallback(
    async (credential) => {
      setLoading(true);

      try {
        const result = await googleLoginApi(credential);

        if (!result?.success || !result?.user) {
          return {
            success: false,
            message: result?.message || "Không thể đăng nhập bằng Google.",
          };
        }

        const safeUser = normalizeUser(result.user);

        setUser(safeUser);
        saveSession(safeUser);

        if (safeUser.role === ROLES.ADMIN) {
          await refreshUsers();
        }

        return {
          success: true,
          user: safeUser,
        };
      } catch (error) {
        return {
          success: false,
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Không thể đăng nhập bằng Google.",
        };
      } finally {
        setLoading(false);
      }
    },
    [refreshUsers]
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Session phía client vẫn phải được xóa.
    } finally {
      setUser(null);
      setUsers([]);
      clearSession();
    }
  }, []);

  const register = useCallback(async (userData = {}) => {
    const passwordResult = getPasswordValidation(userData.password);

    if (!passwordResult.valid) {
      return {
        success: false,
        message: passwordResult.message,
      };
    }

    try {
      const result = await registerApi(userData);

      return {
        success: Boolean(result?.success),
        user: result?.user ? normalizeUser(result.user) : null,
        message: result?.message || "Tạo tài khoản thành công.",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tạo tài khoản.",
      };
    }
  }, []);

  const createStaffAccount = useCallback(
    async (userData = {}) => {
      if (user?.role !== ROLES.ADMIN) {
        return {
          success: false,
          message:
            "Chỉ quản trị viên cấp cao mới có quyền tạo tài khoản quản trị.",
        };
      }

      if (![ROLES.MANAGER, ROLES.PRODUCT_MANAGER].includes(userData.role)) {
        return {
          success: false,
          message: "Quyền tài khoản không hợp lệ.",
        };
      }

      const passwordResult = getPasswordValidation(userData.password);

      if (!passwordResult.valid) {
        return {
          success: false,
          message: passwordResult.message,
        };
      }

      try {
        const result = await createStaffApi(userData);

        await refreshUsers();

        return {
          success: Boolean(result?.success),
          user: result?.user ? normalizeUser(result.user) : null,
          message: result?.message || "Tạo tài khoản thành công.",
        };
      } catch (error) {
        return {
          success: false,
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Không thể tạo tài khoản.",
        };
      }
    },
    [refreshUsers, user?.role]
  );

  const createUser = useCallback(
    (userData = {}) => createStaffAccount(userData),
    [createStaffAccount]
  );

  const updateProfile = useCallback(
    async (updates = {}) => {
      if (!user) {
        return {
          success: false,
          message: "Bạn chưa đăng nhập.",
        };
      }

      try {
        const response = await updateUserApi(user.id, {
          name: updates.name,
          phone: updates.phone,
          avatar: updates.avatar,
        });

        const updated = normalizeUser(response.user);

        setUser(updated);
        saveSession(updated);

        if (user.role === ROLES.ADMIN) {
          await refreshUsers();
        }

        return {
          success: true,
          user: updated,
          message: "Cập nhật thông tin thành công.",
        };
      } catch (error) {
        return {
          success: false,
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Không thể cập nhật thông tin.",
        };
      }
    },
    [refreshUsers, user]
  );

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!user) {
        return {
          success: false,
          message: "Bạn chưa đăng nhập.",
        };
      }

      if (String(currentPassword || "") === String(newPassword || "")) {
        return {
          success: false,
          message: "Mật khẩu mới phải khác mật khẩu hiện tại.",
        };
      }

      const check = getPasswordValidation(newPassword);

      if (!check.valid) {
        return {
          success: false,
          message: check.message,
        };
      }

      try {
        const result = await changePasswordApi(currentPassword, newPassword);

        return {
          success: Boolean(result?.success),
          message: result?.message || "Đổi mật khẩu thành công.",
        };
      } catch (error) {
        return {
          success: false,
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Không thể đổi mật khẩu.",
        };
      }
    },
    [user]
  );

  const updateUser = useCallback(
    async (userId, updates = {}) => {
      if (user?.role !== ROLES.ADMIN) {
        return {
          success: false,
          message: "Bạn không có quyền cập nhật tài khoản.",
        };
      }

      try {
        const result = await updateUserApi(userId, updates);

        await refreshUsers();

        if (String(user.id) === String(userId)) {
          const refreshed = await getCurrentAuthUserApi();

          const normalized = normalizeUser(refreshed);

          setUser(normalized);
          saveSession(normalized);
        }

        return {
          success: Boolean(result?.success),
          user: result?.user ? normalizeUser(result.user) : null,
          message: result?.message || "Cập nhật tài khoản thành công.",
        };
      } catch (error) {
        return {
          success: false,
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Không thể cập nhật tài khoản.",
        };
      }
    },
    [refreshUsers, user]
  );

  const deleteUser = useCallback(
    async (userId) => {
      if (user?.role !== ROLES.ADMIN) {
        return {
          success: false,
          message: "Bạn không có quyền xóa tài khoản.",
        };
      }

      if (String(userId) === String(user.id)) {
        return {
          success: false,
          message: "Không thể tự xóa tài khoản đang đăng nhập.",
        };
      }

      try {
        const result = await deleteUserApi(userId);

        await refreshUsers();

        return {
          success: Boolean(result?.success),
          message: result?.message || "Đã xóa tài khoản.",
        };
      } catch (error) {
        return {
          success: false,
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Không thể xóa tài khoản.",
        };
      }
    },
    [refreshUsers, user]
  );

  const toggleUserDisabled = useCallback(
    async (userId) => {
      if (user?.role !== ROLES.ADMIN) {
        return {
          success: false,
          message: "Bạn không có quyền khóa tài khoản.",
        };
      }

      const target = users.find((item) => String(item.id) === String(userId));

      if (!target) {
        return {
          success: false,
          message: "Không tìm thấy tài khoản.",
        };
      }

      return updateUser(userId, {
        disabled: !target.disabled,
      });
    },
    [updateUser, user, users]
  );

  const resetUserPassword = useCallback(
    async (userId, newPassword) => {
      if (user?.role !== ROLES.ADMIN) {
        return {
          success: false,
          message: "Bạn không có quyền đổi mật khẩu tài khoản.",
        };
      }

      const check = getPasswordValidation(newPassword);

      if (!check.valid) {
        return {
          success: false,
          message: check.message,
        };
      }

      try {
        const result = await resetUserPasswordApi(userId, newPassword);

        return {
          success: Boolean(result?.success),
          message: result?.message || "Đã đặt lại mật khẩu tài khoản.",
        };
      } catch (error) {
        return {
          success: false,
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Không thể đặt lại mật khẩu.",
        };
      }
    },
    [user]
  );

  const updateRolePermissions = useCallback(
    (role, permissions) => {
      if (user?.role !== ROLES.ADMIN) {
        return {
          success: false,
          message: "Chỉ Admin mới có quyền thay đổi phân quyền.",
        };
      }

      if (![ROLES.MANAGER, ROLES.PRODUCT_MANAGER].includes(role)) {
        return {
          success: false,
          message: "Chỉ có thể cấu hình quyền Manager và Product Manager.",
        };
      }

      const normalized = normalizePermissionList(permissions, role);

      const current = readSiteSettings();

      const saved = saveSiteSettings({
        ...current,

        rolePermissions: {
          ...(current.rolePermissions || {}),
          [role]: normalized,
        },
      });

      setRolePermissions({
        manager: normalizePermissionList(
          saved.rolePermissions?.manager,
          ROLES.MANAGER
        ),

        product_manager: normalizePermissionList(
          saved.rolePermissions?.product_manager,
          ROLES.PRODUCT_MANAGER
        ),
      });

      return {
        success: true,
        permissions: normalized,
        message: "Đã cập nhật quyền cho toàn bộ tài khoản thuộc quyền này.",
      };
    },
    [user?.role]
  );

  const getRolePermissions = useCallback(
    (role) => {
      if (role === ROLES.ADMIN) {
        return Object.values(PERMISSIONS);
      }

      return normalizePermissionList(rolePermissions?.[role], role);
    },
    [rolePermissions]
  );

  const hasPermission = useCallback(
    (permission) => {
      if (!user || user.disabled) {
        return false;
      }

      if (user.role === ROLES.ADMIN) {
        return true;
      }

      return getRolePermissions(user.role).includes(permission);
    },
    [getRolePermissions, user]
  );

  const hasRole = useCallback(
    (role) => Boolean(user && !user.disabled && user.role === role),
    [user]
  );

  const permissions = useMemo(
    () => (user ? getRolePermissions(user.role) : []),
    [getRolePermissions, user]
  );

  const value = useMemo(
    () => ({
      user,
      users,
      loading,

      login,
      logout,
      register,
      loginWithGoogle,

      createStaffAccount,
      createUser,

      updateProfile,
      changePassword,

      updateUser,
      deleteUser,
      toggleUserDisabled,
      resetUserPassword,

      updateRolePermissions,
      getRolePermissions,

      validatePassword: getPasswordValidation,

      hasPermission,
      hasRole,

      isAdmin: user?.role === ROLES.ADMIN,

      isManager: user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER,

      isProductManager:
        user?.role === ROLES.ADMIN || user?.role === ROLES.PRODUCT_MANAGER,

      permissions,

      permissionLabels: PERMISSION_LABELS,

      roles: ROLES,
      roleLabels: ROLE_LABELS,
      ROLE_LABELS,
    }),
    [
      user,
      users,
      loading,
      login,
      logout,
      register,
      loginWithGoogle,
      createStaffAccount,
      createUser,
      updateProfile,
      changePassword,
      updateUser,
      deleteUser,
      toggleUserDisabled,
      resetUserPassword,
      updateRolePermissions,
      getRolePermissions,
      hasPermission,
      hasRole,
      permissions,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
