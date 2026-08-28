import { useMemo, useState } from "react";
import { FiEdit2, FiEye, FiEyeOff, FiKey, FiLock, FiPlus, FiTrash2, FiUnlock, FiX } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const EMAIL_DOMAIN = "@flowershop.vn";
const EMPTY_FORM = { name: "", emailPrefix: "", phone: "", password: "", role: "manager" };
const ROLE_OPTIONS = [
  { value: "manager", label: "Manager - Quản lý" },
  { value: "product_manager", label: "Product Manager - Quản lý sản phẩm" },
];
const fieldClass = "w-full border border-gray-200 rounded-lg px-4 py-3 bg-white outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-50";

const AdminUsersPage = () => {
  const { user, users, isAdmin, ROLE_LABELS, createUser, updateUser, deleteUser, resetUserPassword, toggleUserDisabled, validatePassword } = useAuth();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingUser, setEditingUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sortedUsers = useMemo(() => (Array.isArray(users) ? users : []).filter((account) => account.role !== "customer").sort((a, b) => {
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (a.role !== "admin" && b.role === "admin") return 1;
    return String(a.name || "").localeCompare(String(b.name || ""), "vi");
  }), [users]);

  if (!user || !isAdmin) return <section className="py-16 bg-gray-50 min-h-[70vh]"><div className="max-w-xl mx-auto px-4 text-center"><h1 className="text-2xl font-bold text-gray-800">Không có quyền truy cập</h1><p className="mt-3 text-gray-500">Chỉ quản trị viên cấp cao mới được sử dụng chức năng này.</p></div></section>;

  const clearMessages = () => { setMessage(""); setError(""); };
  const setField = (name, value) => { setFormData((current) => ({ ...current, [name]: value })); clearMessages(); };
  const closeEdit = () => { setEditingUser(null); setFormData(EMPTY_FORM); setShowPassword(false); clearMessages(); };

  const openCreate = () => { closeEdit(); clearMessages(); };
  const openEdit = (account) => {
    clearMessages();
    setEditingUser(account);
    setFormData({ name: account.name || "", emailPrefix: String(account.email || "").split("@")[0], phone: account.phone || "", password: "", role: account.role === "admin" ? "manager" : account.role || "manager" });
    setShowPassword(false);
  };

  const handleCreate = (event) => {
    event.preventDefault(); clearMessages(); setSubmitting(true);
    try {
      const name = formData.name.trim();
      const prefix = formData.emailPrefix.trim();
      if (!name) return setError("Vui lòng nhập họ tên.");
      if (!prefix || !/^[a-zA-Z0-9._-]+$/.test(prefix)) return setError("Tên email không hợp lệ.");
      if (!formData.phone.trim()) return setError("Vui lòng nhập số điện thoại.");
      const check = validatePassword(formData.password);
      if (!check.valid) return setError(check.message);
      const result = createUser({ name, email: `${prefix.toLowerCase()}${EMAIL_DOMAIN}`, phone: formData.phone.trim(), password: formData.password, role: formData.role });
      if (!result.success) return setError(result.message);
      setMessage(result.message || "Tạo tài khoản thành công.");
      setFormData(EMPTY_FORM); setShowPassword(false);
    } finally { setSubmitting(false); }
  };

  const handleUpdate = (event) => {
    event.preventDefault(); clearMessages();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      if (!formData.name.trim()) return setError("Vui lòng nhập họ tên.");
      if (!formData.phone.trim()) return setError("Vui lòng nhập số điện thoại.");
      const result = updateUser(editingUser.id, { name: formData.name.trim(), phone: formData.phone.trim(), role: editingUser.role === "admin" ? "admin" : formData.role });
      if (!result.success) return setError(result.message);
      setMessage(result.message || "Cập nhật tài khoản thành công.");
      closeEdit();
    } finally { setSubmitting(false); }
  };

  const handleDelete = (account) => {
    clearMessages();
    if (account.id === user.id) return setError("Không thể xóa tài khoản Admin đang đăng nhập.");
    if (account.role === "admin") return setError("Không thể xóa tài khoản Admin cấp cao.");
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản "${account.name || account.email}"?`)) return;
    const result = deleteUser(account.id);
    if (!result.success) setError(result.message); else setMessage(result.message || "Đã xóa tài khoản.");
  };

  const toggleDisabled = (account) => {
    clearMessages();
    const result = toggleUserDisabled(account.id);
    if (!result.success) return setError(result.message);
    setMessage(account.disabled ? "Đã mở khóa tài khoản." : "Đã khóa/vô hiệu hóa tài khoản.");
  };

  const handleResetPassword = (event) => {
    event.preventDefault(); clearMessages();
    if (!resetPasswordUser) return;
    const check = validatePassword(resetPassword);
    if (!check.valid) return setError(check.message);
    const result = resetUserPassword(resetPasswordUser.id, resetPassword);
    if (!result.success) return setError(result.message);
    setMessage(result.message || "Đã đặt lại mật khẩu tài khoản.");
    setResetPasswordUser(null); setResetPassword("");
  };

  const roleLabel = (role) => ROLE_LABELS?.[role] || role;
  const roleBadge = (role) => role === "admin" ? "bg-red-50 text-red-700" : role === "manager" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700";

  return (
    <section className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7">
          <div><h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý tài khoản</h1><p className="mt-2 text-gray-500">Quản lý tài khoản Admin, Manager và Quản lý sản phẩm.</p></div>
          <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700"><FiPlus />Thêm tài khoản</button>
        </div>

        {message && <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700">{message}</div>}
        {error && <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">{error}</div>}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[850px]"><thead className="bg-gray-50 border-b border-gray-100"><tr><th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Tài khoản</th><th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Liên hệ</th><th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Quyền</th><th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th><th className="text-right px-5 py-4 text-xs font-semibold text-gray-500 uppercase">Thao tác</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {sortedUsers.map((account) => <tr key={account.id} className="hover:bg-gray-50/70"><td className="px-5 py-4"><div className="font-semibold text-gray-800">{account.name || "Chưa cập nhật"}</div><div className="text-sm text-gray-500">{account.email}</div></td><td className="px-5 py-4 text-sm text-gray-600">{account.phone || "—"}</td><td className="px-5 py-4"><span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${roleBadge(account.role)}`}>{roleLabel(account.role)}</span></td><td className="px-5 py-4"><span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${account.disabled ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{account.disabled ? "Đã khóa" : "Đang hoạt động"}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEdit(account)} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-pink-600 hover:border-pink-300" title="Sửa"><FiEdit2 /></button><button type="button" onClick={() => setResetPasswordUser(account)} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-amber-600 hover:border-amber-300" title="Đổi mật khẩu"><FiKey /></button>{account.role !== "admin" && <button type="button" onClick={() => toggleDisabled(account)} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300" title={account.disabled ? "Mở khóa" : "Khóa"}>{account.disabled ? <FiUnlock /> : <FiLock />}</button>}{account.role !== "admin" && <button type="button" onClick={() => handleDelete(account)} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-red-600 hover:border-red-300" title="Xóa"><FiTrash2 /></button>}</div></td></tr>)}
            </tbody>
          </table></div>
          {!sortedUsers.length && <div className="p-12 text-center text-gray-500">Chưa có tài khoản quản trị.</div>}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {editingUser === null && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between"><div><h2 className="text-xl font-bold text-gray-800">Tạo tài khoản quản trị</h2><p className="text-sm text-gray-500 mt-1">Tạo Manager hoặc Product Manager.</p></div><button type="button" onClick={closeEdit} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"><FiX /></button></div>
            <form onSubmit={handleCreate} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-sm font-medium mb-2">Họ và tên *</label><input value={formData.name} onChange={(e) => setField("name", e.target.value)} className={fieldClass} required /></div><div><label className="block text-sm font-medium mb-2">Email *</label><div className="flex"><input value={formData.emailPrefix} onChange={(e) => setField("emailPrefix", e.target.value)} className={`${fieldClass} rounded-r-none`} placeholder="ten.nguoi.dung" required /><span className="shrink-0 flex items-center px-3 border border-l-0 border-gray-200 rounded-r-lg bg-gray-50 text-sm text-gray-500">{EMAIL_DOMAIN}</span></div></div><div><label className="block text-sm font-medium mb-2">Số điện thoại *</label><input value={formData.phone} onChange={(e) => setField("phone", e.target.value)} className={fieldClass} required /></div><div><label className="block text-sm font-medium mb-2">Mật khẩu *</label><div className="relative"><input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setField("password", e.target.value)} className={`${fieldClass} pr-12`} required autoComplete="new-password" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <FiEyeOff /> : <FiEye />}</button></div><p className="mt-2 text-xs text-gray-500">Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</p></div><div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Quyền *</label><select value={formData.role} onChange={(e) => setField("role", e.target.value)} className={fieldClass}>{ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div><div className="md:col-span-2 flex justify-end gap-3 pt-2"><button type="button" onClick={closeEdit} className="px-5 py-3 rounded-lg border border-gray-200 text-gray-700">Hủy</button><button type="submit" disabled={submitting} className="px-6 py-3 rounded-lg bg-pink-600 text-white font-semibold disabled:opacity-60">{submitting ? "Đang xử lý..." : "Tạo tài khoản"}</button></div></form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl"><div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between"><div><h2 className="text-xl font-bold text-gray-800">Chỉnh sửa tài khoản</h2><p className="text-sm text-gray-500 mt-1">{editingUser.email}</p></div><button type="button" onClick={closeEdit} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"><FiX /></button></div><form onSubmit={handleUpdate} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-sm font-medium mb-2">Họ và tên *</label><input value={formData.name} onChange={(e) => setField("name", e.target.value)} className={fieldClass} required /></div><div><label className="block text-sm font-medium mb-2">Email</label><input value={editingUser.email} disabled className={fieldClass} /></div><div><label className="block text-sm font-medium mb-2">Số điện thoại *</label><input value={formData.phone} onChange={(e) => setField("phone", e.target.value)} className={fieldClass} required /></div><div><label className="block text-sm font-medium mb-2">Quyền</label><select value={formData.role} onChange={(e) => setField("role", e.target.value)} disabled={editingUser.role === "admin"} className={fieldClass}>{ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{editingUser.role === "admin" && <p className="mt-2 text-xs text-red-600">Tài khoản Admin gốc không được hạ quyền.</p>}</div><div className="md:col-span-2 flex justify-end gap-3 pt-2"><button type="button" onClick={closeEdit} className="px-5 py-3 rounded-lg border border-gray-200">Hủy</button><button type="submit" disabled={submitting} className="px-6 py-3 rounded-lg bg-pink-600 text-white font-semibold disabled:opacity-60">{submitting ? "Đang lưu..." : "Lưu thay đổi"}</button></div></form></div>
        </div>
      )}

      {resetPasswordUser && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"><div className="w-full max-w-md bg-white rounded-2xl shadow-2xl"><div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between"><div><h2 className="text-xl font-bold text-gray-800">Đặt lại mật khẩu</h2><p className="text-sm text-gray-500 mt-1">{resetPasswordUser.email}</p></div><button type="button" onClick={() => setResetPasswordUser(null)} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"><FiX /></button></div><form onSubmit={handleResetPassword} className="p-6"><label className="block text-sm font-medium mb-2">Mật khẩu mới *</label><div className="relative"><input type={showResetPassword ? "text" : "password"} value={resetPassword} onChange={(e) => { setResetPassword(e.target.value); clearMessages(); }} className={`${fieldClass} pr-12`} required autoComplete="new-password" /><button type="button" onClick={() => setShowResetPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showResetPassword ? <FiEyeOff /> : <FiEye />}</button></div><p className="mt-2 text-xs text-gray-500">Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</p><div className="flex justify-end gap-3 mt-6"><button type="button" onClick={() => setResetPasswordUser(null)} className="px-5 py-3 rounded-lg border border-gray-200">Hủy</button><button type="submit" className="px-6 py-3 rounded-lg bg-pink-600 text-white font-semibold">Lưu mật khẩu</button></div></form></div></div>
      )}
    </section>
  );
};

export default AdminUsersPage;
