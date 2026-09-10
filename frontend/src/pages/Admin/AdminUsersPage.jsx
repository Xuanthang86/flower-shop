import { useMemo, useState } from "react";

import {
  FiChevronDown,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLock,
  FiPlus,
  FiTrash2,
  FiUnlock,
  FiX,
} from "react-icons/fi";

import {
  MANAGEMENT_PERMISSIONS,
  PERMISSION_LABELS,
  ROLES,
  useAuth,
} from "@/context/AuthContext";

const EMAIL_DOMAIN = "@flowershop.vn";

const EMPTY_FORM = {
  name: "",
  emailPrefix: "",
  phone: "",
  password: "",
  role: ROLES.MANAGER,
  permissions: [],
};

const ROLE_OPTIONS = [
  {
    value: ROLES.ADMIN,
    label: "Admin - Quản trị viên",
  },
  {
    value: ROLES.MANAGER,
    label: "Manager - Quản lý",
  },
  {
    value: ROLES.PRODUCT_MANAGER,
    label: "Product Manager - Quản lý sản phẩm",
  },
];

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-50";

const PermissionSelector = ({ role, permissions, onChange }) => {
  if (role === ROLES.ADMIN) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
        <strong>Admin:</strong> có toàn bộ quyền quản trị hệ thống. Không cần
        cấu hình từng checkbox.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="mb-3">
        <h3 className="font-semibold text-gray-800">Quyền được phép sử dụng</h3>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          Khi thay đổi bộ quyền này, toàn bộ tài khoản cùng loại quyền sẽ được
          cập nhật.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {MANAGEMENT_PERMISSIONS.map((permission) => {
          const checked = permissions.includes(permission);

          return (
            <label
              key={permission}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 transition hover:border-pink-200 hover:bg-pink-50"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => {
                  const next = checked
                    ? permissions.filter((item) => item !== permission)
                    : [...permissions, permission];

                  onChange([...new Set(next)]);
                }}
                className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />

              <span className="text-sm font-medium text-gray-700">
                {PERMISSION_LABELS[permission] || permission}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

const AdminUsersPage = () => {
  const {
    user,
    users,
    isAdmin,
    ROLE_LABELS,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    toggleUserDisabled,
    validatePassword,
    getRolePermissions,
    updateRolePermissions,
  } = useAuth();

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [createOpen, setCreateOpen] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const [resetPasswordUser, setResetPasswordUser] = useState(null);

  const [resetPassword, setResetPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showResetPassword, setShowResetPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const sortedUsers = useMemo(
    () =>
      (Array.isArray(users) ? users : [])
        .filter((account) => account.role !== ROLES.CUSTOMER)
        .sort((a, b) => {
          if (a.role === ROLES.ADMIN && b.role !== ROLES.ADMIN) {
            return -1;
          }

          if (a.role !== ROLES.ADMIN && b.role === ROLES.ADMIN) {
            return 1;
          }

          return String(a.name || "").localeCompare(String(b.name || ""), "vi");
        }),
    [users]
  );

  if (!user || !isAdmin) {
    return (
      <section className="min-h-[70vh] bg-gray-50 py-16">
        <div className="mx-auto max-w-xl px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Không có quyền truy cập
          </h1>

          <p className="mt-3 text-gray-500">
            Chỉ quản trị viên cấp cao mới được sử dụng chức năng này.
          </p>
        </div>
      </section>
    );
  }

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const updateField = (setter, field, value) => {
    setter((current) => ({
      ...current,
      [field]: value,
    }));

    clearMessages();
  };

  const handleCreate = (event) => {
    event.preventDefault();
    clearMessages();

    if (!formData.name.trim()) {
      setError("Vui lòng nhập họ tên.");
      return;
    }

    if (!formData.emailPrefix.trim()) {
      setError("Vui lòng nhập phần tên email.");
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(formData.emailPrefix.trim())) {
      setError(
        "Tên email chỉ được gồm chữ cái không dấu, số, dấu chấm, gạch ngang hoặc gạch dưới."
      );
      return;
    }

    if (!formData.phone.trim()) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }

    if (!formData.password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    const passwordCheck = validatePassword(formData.password);

    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }

    setSubmitting(true);

    try {
      const result = createUser({
        name: formData.name.trim(),
        email: `${formData.emailPrefix.trim().toLowerCase()}${EMAIL_DOMAIN}`,
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
        permissions: formData.permissions,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      if (formData.role !== ROLES.ADMIN) {
        updateRolePermissions(formData.role, formData.permissions);
      }

      setMessage(result.message || "Tạo tài khoản thành công.");

      setFormData(EMPTY_FORM);
      setShowPassword(false);
      setCreateOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (account) => {
    clearMessages();

    const role = account.role || ROLES.MANAGER;

    setEditingUser(account);

    setEditForm({
      name: account.name || "",
      emailPrefix: String(account.email || "").split("@")[0],
      phone: account.phone || "",
      password: "",
      role,
      permissions: getRolePermissions(role),
    });
  };

  const closeEdit = () => {
    setEditingUser(null);
    setEditForm(EMPTY_FORM);
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    clearMessages();

    if (!editingUser) return;

    if (!editForm.name.trim()) {
      setError("Vui lòng nhập họ tên.");
      return;
    }

    if (!editForm.phone.trim()) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }

    setSubmitting(true);

    try {
      const result = updateUser(editingUser.id, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        role: editingUser.role === ROLES.ADMIN ? ROLES.ADMIN : editForm.role,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      if (editingUser.role !== ROLES.ADMIN && editForm.role !== ROLES.ADMIN) {
        updateRolePermissions(editForm.role, editForm.permissions);
      }

      setMessage(result.message || "Cập nhật tài khoản thành công.");

      closeEdit();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (account) => {
    clearMessages();

    if (account.id === user.id) {
      setError("Không thể xóa tài khoản Admin đang đăng nhập.");
      return;
    }

    if (account.role === ROLES.ADMIN) {
      setError("Không thể xóa tài khoản Admin cấp cao.");
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc muốn xóa tài khoản "${account.name || account.email}"?`
      )
    ) {
      return;
    }

    const result = deleteUser(account.id);

    if (!result.success) {
      setError(result.message);
    } else {
      setMessage(result.message || "Đã xóa tài khoản.");
    }
  };

  const handleToggle = (account) => {
    clearMessages();

    if (account.id === user.id) {
      setError("Không thể khóa tài khoản Admin đang đăng nhập.");
      return;
    }

    if (account.role === ROLES.ADMIN) {
      setError("Không thể khóa tài khoản Admin cấp cao.");
      return;
    }

    const result = toggleUserDisabled(account.id);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage(
      account.disabled
        ? "Đã mở khóa tài khoản."
        : "Đã khóa/vô hiệu hóa tài khoản."
    );
  };

  const openReset = (account) => {
    clearMessages();

    setResetPasswordUser(account);

    setResetPassword("");
    setShowResetPassword(false);
  };

  const closeReset = () => {
    setResetPasswordUser(null);
    setResetPassword("");
    setShowResetPassword(false);
  };

  const handleReset = (event) => {
    event.preventDefault();
    clearMessages();

    if (!resetPasswordUser) {
      return;
    }

    const check = validatePassword(resetPassword);

    if (!check.valid) {
      setError(check.message);
      return;
    }

    const result = resetUserPassword(resetPasswordUser.id, resetPassword);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage(result.message || "Đã đổi mật khẩu.");

    closeReset();
  };

  const roleLabel = (role) =>
    ROLE_LABELS?.[role] ||
    {
      admin: "Quản trị viên",
      manager: "Quản lý",
      product_manager: "Quản lý sản phẩm",
    }[role] ||
    role;

  const roleBadge = (role) => {
    if (role === ROLES.ADMIN) {
      return "bg-red-50 text-red-700";
    }

    if (role === ROLES.MANAGER) {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-purple-50 text-purple-700";
  };

  return (
    <section className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
            Quản lý tài khoản
          </h1>

          <p className="mt-2 text-gray-500">
            Quản lý tài khoản và cấu hình quyền theo từng loại quản lý.
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-green-100 bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setCreateOpen((value) => !value)}
            className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                <FiPlus />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">Thêm tài khoản</h2>

                <p className="text-sm text-gray-500">
                  Tạo tài khoản Manager hoặc Product Manager và cấp quyền.
                </p>
              </div>
            </div>

            <FiChevronDown
              className={createOpen ? "rotate-180 transition" : "transition"}
            />
          </button>

          {createOpen && (
            <div className="border-t border-gray-100 p-6 md:p-8">
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Họ và tên *
                    </label>

                    <input
                      value={formData.name}
                      onChange={(event) =>
                        updateField(setFormData, "name", event.target.value)
                      }
                      className={fieldClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Email *
                    </label>

                    <div className="flex">
                      <input
                        value={formData.emailPrefix}
                        onChange={(event) =>
                          updateField(
                            setFormData,
                            "emailPrefix",
                            event.target.value
                          )
                        }
                        className={`${fieldClass} rounded-r-none`}
                        required
                      />

                      <span className="flex shrink-0 items-center rounded-r-lg border border-l-0 border-gray-200 bg-gray-50 px-4 text-sm text-gray-600">
                        {EMAIL_DOMAIN}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Số điện thoại *
                    </label>

                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(event) =>
                        updateField(setFormData, "phone", event.target.value)
                      }
                      className={fieldClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Mật khẩu *
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(event) =>
                          updateField(
                            setFormData,
                            "password",
                            event.target.value
                          )
                        }
                        className={`${fieldClass} pr-12`}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Quyền *
                    </label>

                    <select
                      value={formData.role}
                      onChange={(event) => {
                        const role = event.target.value;

                        setFormData((current) => ({
                          ...current,
                          role,
                          permissions: getRolePermissions(role),
                        }));

                        clearMessages();
                      }}
                      className={fieldClass}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <PermissionSelector
                  role={formData.role}
                  permissions={formData.permissions}
                  onChange={(permissions) =>
                    setFormData((current) => ({
                      ...current,
                      permissions,
                    }))
                  }
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white hover:bg-pink-700 disabled:opacity-60"
                  >
                    <FiPlus />

                    {submitting ? "Đang xử lý..." : "Tạo tài khoản"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-xl font-bold text-gray-800">
              Danh sách tài khoản
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Thay đổi quyền tại một tài khoản sẽ cập nhật toàn bộ tài khoản
              cùng loại quyền.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-4">Tài khoản</th>

                  <th className="px-6 py-4">Quyền</th>

                  <th className="px-6 py-4">Trạng thái</th>

                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {sortedUsers.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-gray-800">
                        {account.name}
                      </div>

                      <div className="mt-1 text-sm text-gray-500">
                        {account.email}
                      </div>

                      {account.phone && (
                        <div className="mt-1 text-xs text-gray-400">
                          {account.phone}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleBadge(
                          account.role
                        )}`}
                      >
                        {roleLabel(account.role)}
                      </span>

                      {account.role !== ROLES.ADMIN && (
                        <div className="mt-2 max-w-xs text-xs text-gray-500">
                          {getRolePermissions(account.role)
                            .map((permission) => PERMISSION_LABELS[permission])
                            .filter(Boolean)
                            .join(" · ") || "Chưa cấp quyền"}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      {account.disabled ? (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                          Đã khóa
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          Đang hoạt động
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(account)}
                          className="rounded-lg border border-blue-100 p-2 text-blue-600 hover:bg-blue-50"
                          title="Sửa thông tin và quyền"
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          type="button"
                          onClick={() => openReset(account)}
                          className="rounded-lg border border-amber-100 p-2 text-amber-600 hover:bg-amber-50"
                          title="Đổi mật khẩu"
                        >
                          <FiKey />
                        </button>

                        {account.role !== ROLES.ADMIN && (
                          <button
                            type="button"
                            onClick={() => handleToggle(account)}
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
                            title={
                              account.disabled ? "Mở khóa" : "Khóa tài khoản"
                            }
                          >
                            {account.disabled ? <FiUnlock /> : <FiLock />}
                          </button>
                        )}

                        {account.role !== ROLES.ADMIN && (
                          <button
                            type="button"
                            onClick={() => handleDelete(account)}
                            className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"
                            title="Xóa tài khoản"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Sửa tài khoản</h2>

              <button
                type="button"
                onClick={closeEdit}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Họ và tên
                  </label>

                  <input
                    value={editForm.name}
                    onChange={(event) =>
                      updateField(setEditForm, "name", event.target.value)
                    }
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>

                  <input
                    value={editForm.emailPrefix}
                    disabled
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Số điện thoại
                  </label>

                  <input
                    value={editForm.phone}
                    onChange={(event) =>
                      updateField(setEditForm, "phone", event.target.value)
                    }
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Quyền
                  </label>

                  <select
                    value={editForm.role}
                    disabled={editingUser.role === ROLES.ADMIN}
                    onChange={(event) => {
                      const role = event.target.value;

                      setEditForm((current) => ({
                        ...current,
                        role,
                        permissions: getRolePermissions(role),
                      }));
                    }}
                    className={fieldClass}
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <PermissionSelector
                role={editForm.role}
                permissions={editForm.permissions}
                onChange={(permissions) =>
                  setEditForm((current) => ({
                    ...current,
                    permissions,
                  }))
                }
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700 disabled:opacity-60"
                >
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resetPasswordUser && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Đổi mật khẩu</h2>

              <button
                type="button"
                onClick={closeReset}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {resetPasswordUser.name}
            </p>

            <form onSubmit={handleReset} className="mt-5">
              <div className="relative">
                <input
                  type={showResetPassword ? "text" : "password"}
                  value={resetPassword}
                  onChange={(event) => setResetPassword(event.target.value)}
                  className={`${fieldClass} pr-12`}
                  placeholder="Mật khẩu mới"
                />

                <button
                  type="button"
                  onClick={() => setShowResetPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showResetPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeReset}
                  className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
                >
                  Lưu mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminUsersPage;
