import { useMemo, useState } from "react";
import { FiEdit2, FiEye, FiEyeOff, FiKey, FiLock, FiPlus, FiTrash2, FiUnlock, FiX } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const EMAIL_DOMAIN = "@flowershop.vn";
const EMPTY_FORM = { name: "", emailPrefix: "", phone: "", password: "", role: "manager" };
const ROLES = [
  { value: "manager", label: "Manager - Quản lý" },
  { value: "product_manager", label: "Product Manager - Quản lý sản phẩm" },
];
const field = "w-full border border-gray-200 rounded-lg px-4 py-3 bg-white outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-50";

const AdminUsersPage = () => {
  const auth = useAuth();
  const { user, users, isAdmin, ROLE_LABELS, createUser, updateUser, deleteUser, resetUserPassword, toggleUserDisabled, validatePassword } = auth;
  const [mode, setMode] = useState(null); // null | create | edit
  const [editing, setEditing] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const staffUsers = useMemo(() => (Array.isArray(users) ? users : []).filter((item) => item.role !== "customer").sort((a, b) => (a.role === "admin" ? -1 : b.role === "admin" ? 1 : String(a.name || "").localeCompare(String(b.name || ""), "vi"))), [users]);

  if (!user || !isAdmin) return <section className="min-h-[70vh] bg-gray-50 py-16 text-center"><h1 className="text-2xl font-bold text-gray-800">Không có quyền truy cập</h1><p className="mt-3 text-gray-500">Chỉ quản trị viên cấp cao mới được sử dụng chức năng này.</p></section>;

  const clear = () => { setMessage(""); setError(""); };
  const closeModal = () => { setMode(null); setEditing(null); setForm(EMPTY_FORM); setShowPassword(false); clear(); };
  const change = (name, value) => { setForm((current) => ({ ...current, [name]: value })); clear(); };

  const openCreate = () => { closeModal(); setMode("create"); };
  const openEdit = (account) => {
    clear();
    setEditing(account);
    setMode("edit");
    setForm({ name: account.name || "", emailPrefix: String(account.email || "").split("@")[0], phone: account.phone || "", password: "", role: account.role === "admin" ? "manager" : account.role || "manager" });
  };

  const submitCreate = (event) => {
    event.preventDefault(); clear(); setBusy(true);
    try {
      const prefix = form.emailPrefix.trim();
      if (!form.name.trim()) return setError("Vui lòng nhập họ tên.");
      if (!/^[a-zA-Z0-9._-]+$/.test(prefix)) return setError("Tên email không hợp lệ.");
      if (!form.phone.trim()) return setError("Vui lòng nhập số điện thoại.");
      const passwordCheck = validatePassword(form.password);
      if (!passwordCheck.valid) return setError(passwordCheck.message);
      const result = createUser({ name: form.name.trim(), email: `${prefix.toLowerCase()}${EMAIL_DOMAIN}`, phone: form.phone.trim(), password: form.password, role: form.role });
      if (!result.success) return setError(result.message);
      closeModal(); setMessage(result.message || "Tạo tài khoản thành công.");
    } finally { setBusy(false); }
  };

  const submitEdit = (event) => {
    event.preventDefault(); clear(); setBusy(true);
    try {
      if (!editing) return;
      if (!form.name.trim() || !form.phone.trim()) return setError("Họ tên và số điện thoại không được để trống.");
      const result = updateUser(editing.id, { name: form.name.trim(), phone: form.phone.trim(), role: editing.role === "admin" ? "admin" : form.role });
      if (!result.success) return setError(result.message);
      closeModal(); setMessage(result.message || "Cập nhật tài khoản thành công.");
    } finally { setBusy(false); }
  };

  const remove = (account) => {
    clear();
    if (account.id === user.id) return setError("Không thể xóa tài khoản đang đăng nhập.");
    if (account.role === "admin") return setError("Không thể xóa tài khoản Admin gốc.");
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản "${account.name || account.email}"?`)) return;
    const result = deleteUser(account.id);
    result.success ? setMessage(result.message || "Đã xóa tài khoản.") : setError(result.message);
  };

  const toggle = (account) => {
    clear();
    const result = toggleUserDisabled(account.id);
    result.success ? setMessage(account.disabled ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.") : setError(result.message);
  };

  const submitPassword = (event) => {
    event.preventDefault(); clear();
    if (!resetUser) return;
    const check = validatePassword(newPassword);
    if (!check.valid) return setError(check.message);
    const result = resetUserPassword(resetUser.id, newPassword);
    if (!result.success) return setError(result.message);
    setResetUser(null); setNewPassword(""); setMessage(result.message || "Đã đặt lại mật khẩu.");
  };

  return <section className="min-h-screen bg-gray-50 py-10"><div className="max-w-7xl mx-auto px-4">
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7"><div><h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý tài khoản</h1><p className="mt-2 text-gray-500">Quản lý Admin, Manager và Quản lý sản phẩm.</p></div><button onClick={openCreate} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700"><FiPlus />Thêm tài khoản</button></div>
    {message && <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700">{message}</div>}{error && <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">{error}</div>}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[850px]"><thead className="bg-gray-50"><tr>{["Tài khoản","Liên hệ","Quyền","Trạng thái","Thao tác"].map((title) => <th key={title} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">{title}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">
      {staffUsers.map((account) => <tr key={account.id} className="hover:bg-gray-50"><td className="px-5 py-4"><div className="font-semibold text-gray-800">{account.name || "Chưa cập nhật"}</div><div className="text-sm text-gray-500">{account.email}</div></td><td className="px-5 py-4 text-sm text-gray-600">{account.phone || "—"}</td><td className="px-5 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${account.role === "admin" ? "bg-red-50 text-red-700" : account.role === "manager" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>{ROLE_LABELS?.[account.role] || account.role}</span></td><td className="px-5 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${account.disabled ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{account.disabled ? "Đã khóa" : "Đang hoạt động"}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => openEdit(account)} className="w-9 h-9 rounded-lg border flex items-center justify-center hover:text-pink-600" title="Sửa"><FiEdit2 /></button><button onClick={() => { setResetUser(account); setNewPassword(""); clear(); }} className="w-9 h-9 rounded-lg border flex items-center justify-center hover:text-amber-600" title="Đổi mật khẩu"><FiKey /></button>{account.role !== "admin" && <><button onClick={() => toggle(account)} className="w-9 h-9 rounded-lg border flex items-center justify-center hover:text-blue-600" title={account.disabled ? "Mở khóa" : "Khóa"}>{account.disabled ? <FiUnlock /> : <FiLock />}</button><button onClick={() => remove(account)} className="w-9 h-9 rounded-lg border flex items-center justify-center hover:text-red-600" title="Xóa"><FiTrash2 /></button></>}</div></td></tr>)}
    </tbody></table></div>{!staffUsers.length && <div className="p-12 text-center text-gray-500">Chưa có tài khoản quản trị.</div>}</div>
  </div>

  {mode && <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"><div className="sticky top-0 z-10 bg-white border-b px-6 py-5 flex justify-between items-center"><div><h2 className="text-xl font-bold text-gray-800">{mode === "create" ? "Tạo tài khoản quản trị" : "Chỉnh sửa tài khoản"}</h2><p className="text-sm text-gray-500 mt-1">{mode === "edit" ? editing?.email : "Tạo Manager hoặc Product Manager"}</p></div><button onClick={closeModal} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"><FiX /></button></div>
    <form onSubmit={mode === "create" ? submitCreate : submitEdit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-sm font-medium mb-2">Họ và tên *</label><input value={form.name} onChange={(e) => change("name", e.target.value)} className={field} required /></div><div><label className="block text-sm font-medium mb-2">Email *</label>{mode === "create" ? <div className="flex"><input value={form.emailPrefix} onChange={(e) => change("emailPrefix", e.target.value)} className={`${field} rounded-r-none`} placeholder="ten.nguoi.dung" required /><span className="shrink-0 px-3 flex items-center border border-l-0 rounded-r-lg bg-gray-50 text-sm text-gray-500">{EMAIL_DOMAIN}</span></div> : <input value={editing?.email || ""} disabled className={field} />}</div><div><label className="block text-sm font-medium mb-2">Số điện thoại *</label><input value={form.phone} onChange={(e) => change("phone", e.target.value)} className={field} required /></div>{mode === "create" ? <div><label className="block text-sm font-medium mb-2">Mật khẩu *</label><div className="relative"><input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => change("password", e.target.value)} className={`${field} pr-12`} required autoComplete="new-password" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword ? <FiEyeOff /> : <FiEye />}</button></div></div> : <div><label className="block text-sm font-medium mb-2">Quyền *</label><select value={form.role} onChange={(e) => change("role", e.target.value)} disabled={editing?.role === "admin"} className={field}>{ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></div>}{mode === "create" && <div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Quyền *</label><select value={form.role} onChange={(e) => change("role", e.target.value)} className={field}>{ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></div>}<div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={closeModal} className="px-5 py-3 rounded-lg border">Hủy</button><button disabled={busy} className="px-6 py-3 rounded-lg bg-pink-600 text-white font-semibold disabled:opacity-60">{busy ? "Đang xử lý..." : mode === "create" ? "Tạo tài khoản" : "Lưu thay đổi"}</button></div></form>
  </div></div>}

  {resetUser && <div className="fixed inset-0 z-[130] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-md bg-white rounded-2xl shadow-2xl"><div className="px-6 py-5 border-b flex justify-between items-center"><div><h2 className="text-xl font-bold">Đặt lại mật khẩu</h2><p className="text-sm text-gray-500 mt-1">{resetUser.email}</p></div><button onClick={() => setResetUser(null)} className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"><FiX /></button></div><form onSubmit={submitPassword} className="p-6"><label className="block text-sm font-medium mb-2">Mật khẩu mới *</label><div className="relative"><input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => { setNewPassword(e.target.value); clear(); }} className={`${field} pr-12`} required /><button type="button" onClick={() => setShowNewPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2">{showNewPassword ? <FiEyeOff /> : <FiEye />}</button></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setResetUser(null)} className="px-5 py-3 rounded-lg border">Hủy</button><button className="px-6 py-3 rounded-lg bg-pink-600 text-white font-semibold">Lưu mật khẩu</button></div></form></div></div>}
  </section>;
};

export default AdminUsersPage;
