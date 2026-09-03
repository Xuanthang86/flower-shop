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

import { useAuth } from "@/context/AuthContext";

const EMAIL_DOMAIN = "@flowershop.vn";

const EMPTY_FORM = {
  name: "",
  emailPrefix: "",
  phone: "",
  password: "",
  role: "manager",
};

const ROLE_OPTIONS = [
  {
    value: "admin",
    label: "Admin - Quản trị viên",
  },
  {
    value: "manager",
    label: "Manager - Quản lý",
  },
  {
    value: "product_manager",
    label: "Product Manager - Quản lý sản phẩm",
  },
];

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-50";

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
        .filter((account) => account.role !== "customer")
        .sort((a, b) => {
          if (a.role === "admin" && b.role !== "admin") {
            return -1;
          }

          if (a.role !== "admin" && b.role === "admin") {
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
      });

      if (!result.success) {
        setError(result.message);
        return;
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

    setEditingUser(account);

    setEditForm({
      name: account.name || "",
      emailPrefix: String(account.email || "").split("@")[0],
      phone: account.phone || "",
      password: "",
      role: account.role || "manager",
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
        role: editingUser.role === "admin" ? "admin" : editForm.role,
      });

      if (!result.success) {
        setError(result.message);
        return;
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

    if (account.role === "admin") {
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

    if (account.role === "admin") {
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
    if (role === "admin") {
      return "bg-red-50 text-red-700";
    }

    if (role === "manager") {
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
            Quản lý tài khoản Admin, Manager và Quản lý sản phẩm.
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

        {/* CREATE */}
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
                <h2 className="font-bold text-gray-800">
                  Tạo tài khoản quản trị
                </h2>

                <p className="text-sm text-gray-500">
                  {createOpen
                    ? "Thu gọn biểu mẫu khi không sử dụng."
                    : "Bấm để mở biểu mẫu tạo tài khoản."}
                </p>
              </div>
            </div>

            <FiChevronDown
              className={createOpen ? "rotate-180 transition" : "transition"}
            />
          </button>

          {createOpen && (
            <div className="border-t border-gray-100 p-6 md:p-8">
              <form
                onSubmit={handleCreate}
                className="grid grid-cols-1 gap-5 md:grid-cols-2"
              >
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
                        updateField(setFormData, "password", event.target.value)
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

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Quyền *
                  </label>

                  <select
                    value={formData.role}
                    onChange={(event) =>
                      updateField(setFormData, "role", event.target.value)
                    }
                    className={fieldClass}
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-pink-600 py-3 font-semibold text-white hover:bg-pink-700 disabled:opacity-60"
                  >
                    <FiPlus />

                    {submitting ? "Đang xử lý..." : "Tạo tài khoản"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-xl font-bold text-gray-800">
              Danh sách tài khoản
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Tổng số: {sortedUsers.length} tài khoản
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Tài khoản
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Liên hệ
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Quyền
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Trạng thái
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Ngày tạo
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold text-gray-600">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {sortedUsers.map((account) => (
                  <tr key={account.id} className="hover:bg-pink-50/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 font-bold text-pink-600">
                          {(account.name || account.email || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">
                            {account.name}

                            {account.id === user.id && (
                              <span className="ml-2 text-xs text-pink-600">
                                (Bạn)
                              </span>
                            )}
                          </p>

                          <p className="text-sm text-gray-500">
                            {account.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {account.phone || "Chưa cập nhật"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadge(
                          account.role
                        )}`}
                      >
                        {roleLabel(account.role)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          account.disabled
                            ? "bg-red-50 text-red-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {account.disabled ? "Đã khóa" : "Đang hoạt động"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {account.createdAt
                        ? new Date(account.createdAt).toLocaleDateString(
                            "vi-VN"
                          )
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(account)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
                          title="Chỉnh sửa"
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          type="button"
                          onClick={() => openReset(account)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          title="Đổi mật khẩu"
                        >
                          <FiKey />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggle(account)}
                          disabled={
                            account.id === user.id || account.role === "admin"
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-100 text-orange-600 disabled:cursor-not-allowed disabled:opacity-30"
                          title={account.disabled ? "Mở khóa" : "Khóa"}
                        >
                          {account.disabled ? <FiUnlock /> : <FiLock />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(account)}
                          disabled={
                            account.id === user.id || account.role === "admin"
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                          title="Xóa"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EDIT */}
      {editingUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeEdit}
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold">Chỉnh sửa tài khoản</h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingUser.email}
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Họ và tên *
                </label>

                <input
                  value={editForm.name}
                  onChange={(event) =>
                    updateField(setEditForm, "name", event.target.value)
                  }
                  className={fieldClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>

                <input
                  value={editingUser.email || ""}
                  disabled
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Số điện thoại *
                </label>

                <input
                  value={editForm.phone}
                  onChange={(event) =>
                    updateField(setEditForm, "phone", event.target.value)
                  }
                  className={fieldClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Quyền tài khoản
                </label>

                <select
                  value={editForm.role}
                  disabled={editingUser.role === "admin"}
                  onChange={(event) =>
                    updateField(setEditForm, "role", event.target.value)
                  }
                  className={fieldClass}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-lg border border-gray-200 px-5 py-3"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeReset}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Đổi mật khẩu</h2>

                <p className="mt-1 text-sm text-gray-500">
                  {resetPasswordUser.name || resetPasswordUser.email}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReset}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleReset}>
              <label className="mb-2 block text-sm font-medium">
                Mật khẩu mới *
              </label>

              <div className="relative">
                <input
                  type={showResetPassword ? "text" : "password"}
                  value={resetPassword}
                  onChange={(event) => {
                    setResetPassword(event.target.value);
                    clearMessages();
                  }}
                  className={`${fieldClass} pr-12`}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowResetPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showResetPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc
                biệt.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeReset}
                  className="flex-1 rounded-lg border border-gray-200 py-3"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-pink-600 py-3 font-semibold text-white"
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
