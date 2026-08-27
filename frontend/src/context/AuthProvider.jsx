// import { useCallback, useEffect, useMemo, useState } from "react";
// import { AuthContext, PERMISSIONS, ROLE_LABELS, ROLES } from "./AuthContext";

// const AUTH_STORAGE_KEY = "flower-shop-auth";
// const USERS_STORAGE_KEY = "flower-shop-users";
// const ADMIN_EMAIL = "admin@flowershop.vn";
// const ADMIN_BOOTSTRAP_PASSWORD = "admin123";

// const ROLE_PERMISSIONS = {
//   admin: [
//     "view_admin",
//     "manage_users",
//     "manage_products",
//     "create_products",
//     "update_products",
//     "delete_products",
//     "manage_orders",
//     "view_reports",
//   ],
//   manager: ["view_admin", "manage_orders", "view_reports"],
//   product_manager: [
//     "view_admin",
//     "manage_products",
//     "create_products",
//     "update_products",
//   ],
//   customer: [],
// };

// const safeParse = (value, fallback) => {
//   try {
//     return value ? JSON.parse(value) : fallback;
//   } catch {
//     return fallback;
//   }
// };

// const sanitizeUser = (user) => {
//   if (!user) return null;
//   const { password, passwordHash, passwordSalt, ...safeUser } = user;
//   return {
//     ...safeUser,
//     role: safeUser.role || ROLES.CUSTOMER,
//   };
// };

// const readUsers = () => {
//   const parsed = safeParse(localStorage.getItem(USERS_STORAGE_KEY), []);
//   return Array.isArray(parsed) ? parsed : [];
// };

// const readSession = () => {
//   const parsed = safeParse(sessionStorage.getItem(AUTH_STORAGE_KEY), null);
//   return parsed?.user ? sanitizeUser(parsed.user) : null;
// };

// const clearAuthStorage = () => {
//   sessionStorage.removeItem(AUTH_STORAGE_KEY);
//   localStorage.removeItem(AUTH_STORAGE_KEY);
// };

// const saveSession = (user) => {
//   sessionStorage.setItem(
//     AUTH_STORAGE_KEY,
//     JSON.stringify({
//       user: sanitizeUser(user),
//       loginAt: new Date().toISOString(),
//     })
//   );
// };

// const generateId = (prefix = "user") =>
//   `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// const normalizeUser = (user) => {
//   if (!user) return null;

//   const email = String(user.email || "")
//     .trim()
//     .toLowerCase();

//   return {
//     ...user,
//     id: String(user.id || generateId("user")),
//     name: String(user.name || user.fullName || "").trim(),
//     email,
//     phone: String(user.phone || "").trim(),
//     role: Object.values(ROLES).includes(user.role) ? user.role : ROLES.CUSTOMER,
//     avatar: user.avatar || "",
//     disabled: Boolean(user.disabled),
//     createdAt: user.createdAt || new Date().toISOString(),
//   };
// };

// const ensureBootstrapAdmin = () => {
//   const users = readUsers().map(normalizeUser).filter(Boolean);
//   const index = users.findIndex((item) => item.email === ADMIN_EMAIL);

//   if (index === -1) {
//     users.unshift({
//       id: "admin-001",
//       name: "Quản trị viên",
//       email: ADMIN_EMAIL,
//       phone: "0900000000",
//       password: ADMIN_BOOTSTRAP_PASSWORD,
//       role: ROLES.ADMIN,
//       avatar: "",
//       disabled: false,
//       createdAt: "2026-01-01T00:00:00.000Z",
//     });
//   } else {
//     users[index] = {
//       ...users[index],
//       id: "admin-001",
//       email: ADMIN_EMAIL,
//       role: ROLES.ADMIN,
//       name: users[index].name || "Quản trị viên",
//       disabled: false,
//     };
//   }

//   localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
//   return users;
// };

// const passwordCheck = (password) => {
//   const value = String(password || "");
//   const errors = [];

//   if (value.length < 12) errors.push("Mật khẩu phải có ít nhất 12 ký tự.");
//   if (value.length > 64) errors.push("Mật khẩu không được vượt quá 64 ký tự.");
//   if (!/[A-Z]/.test(value))
//     errors.push("Mật khẩu phải có ít nhất 1 chữ cái viết hoa.");
//   if (!/[a-z]/.test(value))
//     errors.push("Mật khẩu phải có ít nhất 1 chữ cái viết thường.");
//   if (!/[0-9]/.test(value)) errors.push("Mật khẩu phải có ít nhất 1 chữ số.");
//   if (!/[^A-Za-z0-9]/.test(value))
//     errors.push("Mật khẩu phải có ít nhất 1 ký tự đặc biệt.");

//   return {
//     valid: errors.length === 0,
//     message: errors.join(" "),
//     errors,
//   };
// };

// const AuthProvider = ({ children }) => {
//   const [users, setUsers] = useState(() => ensureBootstrapAdmin());
//   const [user, setUser] = useState(() => readSession());
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
//   }, [users]);

//   /*
//    * Quan trọng: kiểm tra lại session với localStorage.
//    * Nếu Admin khóa tài khoản đang đăng nhập ở tab khác,
//    * session hiện tại cũng bị đăng xuất.
//    */
//   useEffect(() => {
//     if (!user) return undefined;

//     const verifyCurrentAccount = () => {
//       const current = readUsers()
//         .map(normalizeUser)
//         .find((item) => String(item.id) === String(user.id));

//       if (!current || current.disabled) {
//         setUser(null);
//         clearAuthStorage();
//         return;
//       }

//       const safe = sanitizeUser(current);
//       setUser((previous) => {
//         const previousJson = JSON.stringify(previous);
//         const nextJson = JSON.stringify(safe);
//         return previousJson === nextJson ? previous : safe;
//       });
//       saveSession(safe);
//     };

//     verifyCurrentAccount();

//     const handleStorage = (event) => {
//       if (event.key === USERS_STORAGE_KEY) {
//         verifyCurrentAccount();
//       }
//     };

//     window.addEventListener("storage", handleStorage);
//     const timer = window.setInterval(verifyCurrentAccount, 1000);

//     return () => {
//       window.removeEventListener("storage", handleStorage);
//       window.clearInterval(timer);
//     };
//   }, [user?.id]);

//   const login = useCallback(async (email, password) => {
//     setLoading(true);

//     try {
//       const normalizedEmail = String(email || "")
//         .trim()
//         .toLowerCase();
//       const currentUsers = readUsers().map(normalizeUser);
//       const found = currentUsers.find((item) => item.email === normalizedEmail);

//       if (!found) {
//         return { success: false, message: "Tài khoản không tồn tại." };
//       }

//       // Đây là kiểm tra bắt buộc trước mật khẩu.
//       if (found.disabled) {
//         clearAuthStorage();
//         return {
//           success: false,
//           message:
//             "Tài khoản này đã bị khóa/vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
//         };
//       }

//       if (String(found.password || "") !== String(password || "")) {
//         return {
//           success: false,
//           message: "Mật khẩu không chính xác. Vui lòng thử lại.",
//         };
//       }

//       const safeUser = sanitizeUser(found);
//       setUser(safeUser);
//       saveSession(safeUser);

//       return { success: true, user: safeUser };
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const logout = useCallback(() => {
//     setUser(null);
//     clearAuthStorage();
//   }, []);

//   const register = useCallback((userData) => {
//     const name = String(userData?.name || "").trim();
//     const email = String(userData?.email || "")
//       .trim()
//       .toLowerCase();
//     const phone = String(userData?.phone || "").trim();
//     const password = String(userData?.password || "");

//     if (!name) return { success: false, message: "Vui lòng nhập họ và tên." };

//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       return { success: false, message: "Email không đúng định dạng." };
//     }

//     if (!phone) {
//       return { success: false, message: "Vui lòng nhập số điện thoại." };
//     }

//     const checked = passwordCheck(password);
//     if (!checked.valid) {
//       return { success: false, message: checked.message };
//     }

//     if (email === ADMIN_EMAIL) {
//       return {
//         success: false,
//         message: "Email này được dành riêng cho tài khoản quản trị.",
//       };
//     }

//     const currentUsers = readUsers().map(normalizeUser);

//     if (
//       currentUsers.some(
//         (item) => String(item.email || "").toLowerCase() === email
//       )
//     ) {
//       return { success: false, message: "Email này đã được đăng ký." };
//     }

//     if (
//       currentUsers.some((item) => String(item.phone || "").trim() === phone)
//     ) {
//       return {
//         success: false,
//         message: "Số điện thoại này đã được đăng ký.",
//       };
//     }

//     const newUser = {
//       id: generateId("customer"),
//       name,
//       email,
//       phone,
//       password,
//       role: ROLES.CUSTOMER,
//       avatar: "",
//       disabled: false,
//       createdAt: new Date().toISOString(),
//     };

//     const nextUsers = [...currentUsers, newUser];
//     setUsers(nextUsers);
//     localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));

//     return { success: true, user: sanitizeUser(newUser) };
//   }, []);

//   const hasPermission = useCallback(
//     (permission) =>
//       Boolean(
//         user &&
//         !user.disabled &&
//         (ROLE_PERMISSIONS[user.role] || []).includes(permission)
//       ),
//     [user]
//   );

//   const hasRole = useCallback(
//     (role) => Boolean(user && !user.disabled && user.role === role),
//     [user]
//   );

//   const createUser = useCallback(
//     (userData) => {
//       if (user?.role !== ROLES.ADMIN) {
//         return {
//           success: false,
//           message:
//             "Chỉ quản trị viên cấp cao mới có quyền tạo tài khoản quản trị.",
//         };
//       }

//       const allowedRoles = [ROLES.ADMIN, ROLES.MANAGER, ROLES.PRODUCT_MANAGER];

//       if (!allowedRoles.includes(userData?.role)) {
//         return {
//           success: false,
//           message: "Quyền tài khoản không hợp lệ.",
//         };
//       }

//       const checked = passwordCheck(userData?.password);
//       if (!checked.valid) {
//         return { success: false, message: checked.message };
//       }

//       const name = String(userData?.name || "").trim();
//       const email = String(userData?.email || "")
//         .trim()
//         .toLowerCase();
//       const phone = String(userData?.phone || "").trim();

//       if (!name || !email || !phone) {
//         return {
//           success: false,
//           message: "Vui lòng nhập đầy đủ họ tên, email và số điện thoại.",
//         };
//       }

//       const currentUsers = readUsers().map(normalizeUser);

//       if (currentUsers.some((item) => item.email === email)) {
//         return {
//           success: false,
//           message: "Email này đã được đăng ký.",
//         };
//       }

//       if (currentUsers.some((item) => item.phone === phone)) {
//         return {
//           success: false,
//           message: "Số điện thoại này đã được đăng ký.",
//         };
//       }

//       const newUser = {
//         id: generateId("staff"),
//         name,
//         email,
//         phone,
//         password: String(userData.password),
//         role: userData.role,
//         avatar: "",
//         disabled: false,
//         createdAt: new Date().toISOString(),
//       };

//       const nextUsers = [...currentUsers, newUser];
//       setUsers(nextUsers);
//       localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));

//       return {
//         success: true,
//         user: sanitizeUser(newUser),
//         message: `Đã tạo ${ROLE_LABELS[newUser.role] || newUser.role} thành công.`,
//       };
//     },
//     [user]
//   );

//   const createStaffAccount = createUser;

//   const updateUser = useCallback(
//     (userId, updates = {}) => {
//       if (user?.role !== ROLES.ADMIN) {
//         return {
//           success: false,
//           message: "Bạn không có quyền cập nhật tài khoản.",
//         };
//       }

//       const currentUsers = readUsers().map(normalizeUser);
//       const index = currentUsers.findIndex(
//         (item) => String(item.id) === String(userId)
//       );

//       if (index === -1) {
//         return { success: false, message: "Không tìm thấy tài khoản." };
//       }

//       const target = currentUsers[index];

//       if (target.email === ADMIN_EMAIL) {
//         updates = {
//           ...updates,
//           email: ADMIN_EMAIL,
//           role: ROLES.ADMIN,
//           disabled: false,
//         };
//       }

//       const next = {
//         ...target,
//         ...updates,
//         id: target.id,
//         email: target.email,
//         role:
//           target.email === ADMIN_EMAIL
//             ? ROLES.ADMIN
//             : updates.role || target.role,
//         disabled:
//           target.email === ADMIN_EMAIL
//             ? false
//             : Boolean(
//                 updates.disabled !== undefined
//                   ? updates.disabled
//                   : target.disabled
//               ),
//       };

//       if (next.password) {
//         const checked = passwordCheck(next.password);
//         if (!checked.valid) {
//           return { success: false, message: checked.message };
//         }
//       }

//       currentUsers[index] = next;
//       setUsers(currentUsers);
//       localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(currentUsers));

//       if (String(user?.id) === String(userId)) {
//         if (next.disabled) {
//           setUser(null);
//           clearAuthStorage();
//         } else {
//           const safe = sanitizeUser(next);
//           setUser(safe);
//           saveSession(safe);
//         }
//       }

//       return {
//         success: true,
//         user: sanitizeUser(next),
//         message: "Cập nhật tài khoản thành công.",
//       };
//     },
//     [user]
//   );

//   const resetUserPassword = useCallback(
//     (userId, newPassword) => {
//       if (user?.role !== ROLES.ADMIN) {
//         return {
//           success: false,
//           message: "Bạn không có quyền đổi mật khẩu tài khoản.",
//         };
//       }

//       const checked = passwordCheck(newPassword);
//       if (!checked.valid) {
//         return { success: false, message: checked.message };
//       }

//       return updateUser(userId, { password: String(newPassword) });
//     },
//     [updateUser, user]
//   );

//   const toggleUserDisabled = useCallback(
//     (userId) => {
//       if (user?.role !== ROLES.ADMIN) {
//         return {
//           success: false,
//           message: "Bạn không có quyền khóa tài khoản.",
//         };
//       }

//       const currentUsers = readUsers().map(normalizeUser);
//       const target = currentUsers.find(
//         (item) => String(item.id) === String(userId)
//       );

//       if (!target) {
//         return { success: false, message: "Không tìm thấy tài khoản." };
//       }

//       if (target.email === ADMIN_EMAIL) {
//         return {
//           success: false,
//           message: "Không thể khóa tài khoản Admin gốc.",
//         };
//       }

//       if (String(target.id) === String(user.id)) {
//         return {
//           success: false,
//           message: "Không thể tự khóa tài khoản đang đăng nhập.",
//         };
//       }

//       return updateUser(userId, { disabled: !target.disabled });
//     },
//     [updateUser, user]
//   );

//   const deleteUser = useCallback(
//     (userId) => {
//       if (user?.role !== ROLES.ADMIN) {
//         return {
//           success: false,
//           message: "Bạn không có quyền xóa tài khoản.",
//         };
//       }

//       if (String(userId) === String(user?.id)) {
//         return {
//           success: false,
//           message: "Không thể tự xóa tài khoản đang đăng nhập.",
//         };
//       }

//       const currentUsers = readUsers().map(normalizeUser);
//       const target = currentUsers.find(
//         (item) => String(item.id) === String(userId)
//       );

//       if (target?.email === ADMIN_EMAIL) {
//         return {
//           success: false,
//           message: "Không thể xóa tài khoản Admin gốc.",
//         };
//       }

//       const next = currentUsers.filter(
//         (item) => String(item.id) !== String(userId)
//       );

//       setUsers(next);
//       localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));

//       return {
//         success: true,
//         message: "Đã xóa tài khoản.",
//       };
//     },
//     [user]
//   );

//   const value = useMemo(
//     () => ({
//       user,
//       users,
//       loading,
//       login,
//       logout,
//       register,

//       // Hai tên đều được giữ để không làm hỏng component cũ.
//       createUser,
//       createStaffAccount,

//       updateUser,
//       resetUserPassword,
//       toggleUserDisabled,
//       deleteUser,

//       hasPermission,
//       hasRole,

//       isAdmin: user?.role === ROLES.ADMIN && !user?.disabled,
//       isManager:
//         !user?.disabled &&
//         (user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER),
//       isProductManager:
//         !user?.disabled &&
//         (user?.role === ROLES.ADMIN || user?.role === ROLES.PRODUCT_MANAGER),

//       permissions: user ? ROLE_PERMISSIONS[user.role] || [] : [],

//       roles: ROLES,

//       // Giữ cả hai tên để tương thích AdminUsersPage.
//       roleLabels: ROLE_LABELS,
//       ROLE_LABELS,

//       permissionConstants: PERMISSIONS,

//       // AdminUsersPage hiện tại đang gọi validatePassword().
//       validatePassword: passwordCheck,
//     }),
//     [
//       user,
//       users,
//       loading,
//       login,
//       logout,
//       register,
//       createUser,
//       createStaffAccount,
//       updateUser,
//       resetUserPassword,
//       toggleUserDisabled,
//       deleteUser,
//       hasPermission,
//       hasRole,
//     ]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export default AuthProvider;

import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext, PERMISSIONS, ROLE_LABELS, ROLES } from "./AuthContext";

const AUTH_STORAGE_KEY = "flower-shop-auth";

const USERS_STORAGE_KEY = "flower-shop-users";

const ADMIN_EMAIL = "admin@flowershop.vn";

const ADMIN_BOOTSTRAP_PASSWORD = "Admin@12345";

/* =========================================================
   QUYỀN
========================================================= */

const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.VIEW_ADMIN,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCTS,
    PERMISSIONS.UPDATE_PRODUCTS,
    PERMISSIONS.DELETE_PRODUCTS,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.VIEW_REPORTS,
  ],

  manager: [
    PERMISSIONS.VIEW_ADMIN,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.VIEW_REPORTS,
  ],

  product_manager: [
    PERMISSIONS.VIEW_ADMIN,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCTS,
    PERMISSIONS.UPDATE_PRODUCTS,
  ],

  customer: [],
};

/* =========================================================
   PASSWORD
========================================================= */

const passwordCheck = (password) => {
  const value = String(password || "");

  const errors = [];

  if (value.length < 8) {
    errors.push("Mật khẩu phải có ít nhất 8 ký tự.");
  }

  if (value.length > 64) {
    errors.push("Mật khẩu không được vượt quá 64 ký tự.");
  }

  if (!/[A-Z]/.test(value)) {
    errors.push("Mật khẩu phải có ít nhất 1 chữ cái viết hoa.");
  }

  if (!/[a-z]/.test(value)) {
    errors.push("Mật khẩu phải có ít nhất 1 chữ cái viết thường.");
  }

  if (!/[0-9]/.test(value)) {
    errors.push("Mật khẩu phải có ít nhất 1 chữ số.");
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    errors.push("Mật khẩu phải có ít nhất 1 ký tự đặc biệt.");
  }

  return {
    valid: errors.length === 0,

    message: errors.join(" "),

    errors,
  };
};

/* =========================================================
   SAFE PARSE
========================================================= */

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

/* =========================================================
   SANITIZE USER
========================================================= */

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, passwordHash, passwordSalt, ...safeUser } = user;

  return {
    ...safeUser,

    role: safeUser.role || ROLES.CUSTOMER,
  };
};

/* =========================================================
   NORMALIZE USER
========================================================= */

const generateId = (prefix = "user") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  const email = String(user.email || "")
    .trim()
    .toLowerCase();

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

/* =========================================================
   USERS
========================================================= */

const readUsers = () => {
  const parsed = safeParse(localStorage.getItem(USERS_STORAGE_KEY), []);

  return Array.isArray(parsed) ? parsed.map(normalizeUser).filter(Boolean) : [];
};

/* =========================================================
   SESSION
========================================================= */

const readSession = () => {
  const parsed = safeParse(sessionStorage.getItem(AUTH_STORAGE_KEY), null);

  return parsed?.user ? sanitizeUser(parsed.user) : null;
};

const clearAuthStorage = () => {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);

  localStorage.removeItem(AUTH_STORAGE_KEY);
};

const saveSession = (user) => {
  sessionStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      user: sanitizeUser(user),

      loginAt: new Date().toISOString(),
    })
  );
};

/* =========================================================
   ADMIN GỐC
========================================================= */

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
    const oldAdmin = users[index];

    users[index] = {
      ...oldAdmin,

      id: "admin-001",

      email: ADMIN_EMAIL,

      role: ROLES.ADMIN,

      disabled: false,

      name: oldAdmin.name || "Quản trị viên",

      /*
       * MIGRATE TÀI KHOẢN ADMIN
       *
       * Nếu Admin gốc đang dùng
       * mật khẩu cũ admin123,
       * chuyển sang Admin@12345.
       */
      password:
        oldAdmin.password === "admin123" || !oldAdmin.password
          ? ADMIN_BOOTSTRAP_PASSWORD
          : oldAdmin.password,
    };
  }

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  return users;
};

/* =========================================================
   PROVIDER
========================================================= */

const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => ensureBootstrapAdmin());

  const [user, setUser] = useState(() => readSession());

  const [loading, setLoading] = useState(false);

  /* =======================================================
     LƯU USERS
  ======================================================= */

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  /* =======================================================
     KIỂM TRA SESSION
  ======================================================= */

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const verifyCurrentAccount = () => {
      const current = readUsers().find(
        (item) => String(item.id) === String(user.id)
      );

      if (!current || current.disabled) {
        setUser(null);
        clearAuthStorage();
        return;
      }

      const safe = sanitizeUser(current);

      setUser((previous) =>
        JSON.stringify(previous) === JSON.stringify(safe) ? previous : safe
      );

      saveSession(safe);
    };

    verifyCurrentAccount();

    const handleStorage = (event) => {
      if (event.key === USERS_STORAGE_KEY) {
        verifyCurrentAccount();
      }
    };

    window.addEventListener("storage", handleStorage);

    const timer = window.setInterval(verifyCurrentAccount, 1000);

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.clearInterval(timer);
    };
  }, [user?.id]);

  /* =======================================================
     LOGIN
  ======================================================= */

  const login = useCallback(async (email, password) => {
    setLoading(true);

    try {
      const normalizedEmail = String(email || "")
        .trim()
        .toLowerCase();

      const currentUsers = readUsers();

      const found = currentUsers.find((item) => item.email === normalizedEmail);

      if (!found) {
        return {
          success: false,
          message: "Tài khoản không tồn tại.",
        };
      }

      if (found.disabled) {
        clearAuthStorage();

        return {
          success: false,
          message: "Tài khoản này đã bị khóa/vô hiệu hóa.",
        };
      }

      if (String(found.password || "") !== String(password || "")) {
        return {
          success: false,
          message: "Mật khẩu không chính xác. Vui lòng thử lại.",
        };
      }

      const safeUser = sanitizeUser(found);

      setUser(safeUser);

      saveSession(safeUser);

      return {
        success: true,
        user: safeUser,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = useCallback(() => {
    setUser(null);
    clearAuthStorage();
  }, []);

  /* =======================================================
     REGISTER
  ======================================================= */

  const register = useCallback((userData) => {
    const name = String(userData?.name || "").trim();

    const email = String(userData?.email || "")
      .trim()
      .toLowerCase();

    const phone = String(userData?.phone || "").trim();

    const password = String(userData?.password || "");

    if (!name) {
      return {
        success: false,
        message: "Vui lòng nhập họ và tên.",
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        message: "Email không đúng định dạng.",
      };
    }

    if (!phone) {
      return {
        success: false,
        message: "Vui lòng nhập số điện thoại.",
      };
    }

    const checked = passwordCheck(password);

    if (!checked.valid) {
      return {
        success: false,
        message: checked.message,
      };
    }

    if (email === ADMIN_EMAIL) {
      return {
        success: false,
        message: "Email này được dành riêng cho tài khoản quản trị.",
      };
    }

    const currentUsers = readUsers();

    if (currentUsers.some((item) => item.email === email)) {
      return {
        success: false,
        message: "Email này đã được đăng ký.",
      };
    }

    if (currentUsers.some((item) => item.phone === phone)) {
      return {
        success: false,
        message: "Số điện thoại này đã được đăng ký.",
      };
    }

    const newUser = {
      id: generateId("customer"),

      name,

      email,

      phone,

      password,

      role: ROLES.CUSTOMER,

      avatar: "",

      disabled: false,

      createdAt: new Date().toISOString(),
    };

    const nextUsers = [...currentUsers, newUser];

    setUsers(nextUsers);

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));

    return {
      success: true,
      user: sanitizeUser(newUser),
    };
  }, []);

  /* =======================================================
     UPDATE PROFILE
  ======================================================= */

  const updateProfile = useCallback(
    (updates = {}) => {
      if (!user) {
        return {
          success: false,
          message: "Bạn chưa đăng nhập.",
        };
      }

      const currentUsers = readUsers();

      const index = currentUsers.findIndex(
        (item) => String(item.id) === String(user.id)
      );

      if (index === -1) {
        return {
          success: false,
          message: "Không tìm thấy tài khoản.",
        };
      }

      const updatedUser = {
        ...currentUsers[index],

        name: updates.name ?? currentUsers[index].name,

        phone: updates.phone ?? currentUsers[index].phone,

        avatar: updates.avatar ?? currentUsers[index].avatar,
      };

      currentUsers[index] = updatedUser;

      setUsers(currentUsers);

      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(currentUsers));

      const safeUser = sanitizeUser(updatedUser);

      setUser(safeUser);

      saveSession(safeUser);

      return {
        success: true,
        user: safeUser,
      };
    },
    [user]
  );

  /* =======================================================
     CHANGE PASSWORD
  ======================================================= */

  const changePassword = useCallback(
    (currentPassword, newPassword) => {
      if (!user) {
        return {
          success: false,
          message: "Bạn chưa đăng nhập.",
        };
      }

      const checked = passwordCheck(newPassword);

      if (!checked.valid) {
        return {
          success: false,
          message: checked.message,
        };
      }

      const currentUsers = readUsers();

      const index = currentUsers.findIndex(
        (item) => String(item.id) === String(user.id)
      );

      if (index === -1) {
        return {
          success: false,
          message: "Không tìm thấy tài khoản.",
        };
      }

      const target = currentUsers[index];

      if (String(target.password || "") !== String(currentPassword || "")) {
        return {
          success: false,
          message: "Mật khẩu hiện tại không chính xác.",
        };
      }

      if (String(currentPassword) === String(newPassword)) {
        return {
          success: false,
          message: "Mật khẩu mới phải khác mật khẩu hiện tại.",
        };
      }

      const updatedUser = {
        ...target,
        password: String(newPassword),
      };

      currentUsers[index] = updatedUser;

      setUsers(currentUsers);

      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(currentUsers));

      const safeUser = sanitizeUser(updatedUser);

      setUser(safeUser);

      saveSession(safeUser);

      return {
        success: true,
        user: safeUser,
        message: "Đổi mật khẩu thành công.",
      };
    },
    [user]
  );

  /* =======================================================
     PERMISSION
  ======================================================= */

  const hasPermission = useCallback(
    (permission) =>
      Boolean(
        user &&
        !user.disabled &&
        (ROLE_PERMISSIONS[user.role] || []).includes(permission)
      ),
    [user]
  );

  const hasRole = useCallback(
    (role) => Boolean(user && !user.disabled && user.role === role),
    [user]
  );

  /* =======================================================
     CREATE STAFF
  ======================================================= */

  const createUser = useCallback(
    (userData) => {
      if (user?.role !== ROLES.ADMIN) {
        return {
          success: false,
          message:
            "Chỉ quản trị viên cấp cao mới có quyền tạo tài khoản quản trị.",
        };
      }

      const allowedRoles = [ROLES.ADMIN, ROLES.MANAGER, ROLES.PRODUCT_MANAGER];

      if (!allowedRoles.includes(userData?.role)) {
        return {
          success: false,
          message: "Quyền tài khoản không hợp lệ.",
        };
      }

      const checked = passwordCheck(userData?.password);

      if (!checked.valid) {
        return {
          success: false,
          message: checked.message,
        };
      }

      const name = String(userData?.name || "").trim();

      const email = String(userData?.email || "")
        .trim()
        .toLowerCase();

      const phone = String(userData?.phone || "").trim();

      if (!name || !email || !phone) {
        return {
          success: false,
          message: "Vui lòng nhập đầy đủ họ tên, email và số điện thoại.",
        };
      }

      const currentUsers = readUsers();

      if (currentUsers.some((item) => item.email === email)) {
        return {
          success: false,
          message: "Email này đã được đăng ký.",
        };
      }

      if (currentUsers.some((item) => item.phone === phone)) {
        return {
          success: false,
          message: "Số điện thoại này đã được đăng ký.",
        };
      }

      const newUser = {
        id: generateId("staff"),

        name,

        email,

        phone,

        password: String(userData.password),

        role: userData.role,

        avatar: "",

        disabled: false,

        createdAt: new Date().toISOString(),
      };

      const nextUsers = [...currentUsers, newUser];

      setUsers(nextUsers);

      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));

      return {
        success: true,
        user: sanitizeUser(newUser),

        message: `Đã tạo ${
          ROLE_LABELS[newUser.role] || newUser.role
        } thành công.`,
      };
    },
    [user]
  );

  const createStaffAccount = createUser;

  /* =======================================================
     UPDATE USER
  ======================================================= */

  const updateUser = useCallback(
    (userId, updates = {}) => {
      if (user?.role !== ROLES.ADMIN) {
        return {
          success: false,
          message: "Bạn không có quyền cập nhật tài khoản.",
        };
      }

      const currentUsers = readUsers();

      const index = currentUsers.findIndex(
        (item) => String(item.id) === String(userId)
      );

      if (index === -1) {
        return {
          success: false,
          message: "Không tìm thấy tài khoản.",
        };
      }

      const target = currentUsers[index];

      let next = {
        ...target,
        ...updates,

        id: target.id,

        email: target.email,
      };

      if (target.email === ADMIN_EMAIL) {
        next = {
          ...next,

          email: ADMIN_EMAIL,

          role: ROLES.ADMIN,

          disabled: false,
        };
      }

      if (next.password) {
        const checked = passwordCheck(next.password);

        if (!checked.valid) {
          return {
            success: false,
            message: checked.message,
          };
        }
      }

      currentUsers[index] = next;

      setUsers(currentUsers);

      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(currentUsers));

      if (String(user.id) === String(userId)) {
        if (next.disabled) {
          setUser(null);
          clearAuthStorage();
        } else {
          const safe = sanitizeUser(next);

          setUser(safe);

          saveSession(safe);
        }
      }

      return {
        success: true,
        user: sanitizeUser(next),
        message: "Cập nhật tài khoản thành công.",
      };
    },
    [user]
  );

  /* =======================================================
     RESET PASSWORD ADMIN
  ======================================================= */

  const resetUserPassword = useCallback(
    (userId, newPassword) => {
      if (user?.role !== ROLES.ADMIN) {
        return {
          success: false,
          message: "Bạn không có quyền đổi mật khẩu tài khoản.",
        };
      }

      const checked = passwordCheck(newPassword);

      if (!checked.valid) {
        return {
          success: false,
          message: checked.message,
        };
      }

      return updateUser(userId, {
        password: String(newPassword),
      });
    },
    [updateUser, user]
  );

  /* =======================================================
     LOCK / UNLOCK
  ======================================================= */

  const toggleUserDisabled = useCallback(
    (userId) => {
      if (user?.role !== ROLES.ADMIN) {
        return {
          success: false,
          message: "Bạn không có quyền khóa tài khoản.",
        };
      }

      const currentUsers = readUsers();

      const target = currentUsers.find(
        (item) => String(item.id) === String(userId)
      );

      if (!target) {
        return {
          success: false,
          message: "Không tìm thấy tài khoản.",
        };
      }

      if (target.email === ADMIN_EMAIL) {
        return {
          success: false,
          message: "Không thể khóa tài khoản Admin gốc.",
        };
      }

      if (String(target.id) === String(user.id)) {
        return {
          success: false,
          message: "Không thể tự khóa tài khoản đang đăng nhập.",
        };
      }

      return updateUser(userId, {
        disabled: !target.disabled,
      });
    },
    [updateUser, user]
  );

  /* =======================================================
     DELETE USER
  ======================================================= */

  const deleteUser = useCallback(
    (userId) => {
      if (user?.role !== ROLES.ADMIN) {
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

      const currentUsers = readUsers();

      const target = currentUsers.find(
        (item) => String(item.id) === String(userId)
      );

      if (target?.email === ADMIN_EMAIL) {
        return {
          success: false,
          message: "Không thể xóa tài khoản Admin gốc.",
        };
      }

      const next = currentUsers.filter(
        (item) => String(item.id) !== String(userId)
      );

      setUsers(next);

      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(next));

      return {
        success: true,
        message: "Đã xóa tài khoản.",
      };
    },
    [user]
  );

  /* =======================================================
     VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      user,
      users,
      loading,

      login,
      logout,

      register,

      updateProfile,
      changePassword,

      createUser,
      createStaffAccount,

      updateUser,
      resetUserPassword,
      toggleUserDisabled,
      deleteUser,

      hasPermission,
      hasRole,

      isAdmin: user?.role === ROLES.ADMIN && !user?.disabled,

      isManager:
        !user?.disabled &&
        (user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER),

      isProductManager:
        !user?.disabled &&
        (user?.role === ROLES.ADMIN || user?.role === ROLES.PRODUCT_MANAGER),

      permissions: user ? ROLE_PERMISSIONS[user.role] || [] : [],

      roles: ROLES,

      roleLabels: ROLE_LABELS,

      ROLE_LABELS,

      permissionConstants: PERMISSIONS,

      validatePassword: passwordCheck,
    }),
    [
      user,
      users,
      loading,
      login,
      logout,
      register,
      updateProfile,
      changePassword,
      createUser,
      createStaffAccount,
      updateUser,
      resetUserPassword,
      toggleUserDisabled,
      deleteUser,
      hasPermission,
      hasRole,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
