// // import { useMemo, useState } from "react";
// // import {
// //   FiEdit2,
// //   FiEye,
// //   FiEyeOff,
// //   FiKey,
// //   FiLock,
// //   FiPlus,
// //   FiUnlock,
// //   FiX,
// // } from "react-icons/fi";
// // import { useAuth } from "@/context/AuthContext";

// // const EMPTY_FORM = {
// //   name: "",
// //   email: "",
// //   phone: "",
// //   password: "",
// //   role: "manager",
// // };
// // const ROLES = [
// //   { value: "admin", label: "Admin - Quản trị viên" },
// //   { value: "manager", label: "Manager - Quản lý" },
// //   { value: "product_manager", label: "Product Manager - Quản lý sản phẩm" },
// // ];
// // const STAFF_ROLES = new Set(ROLES.map((item) => item.value));
// // const ROOT_EMAIL = "admin@flowershop.vn";

// // const AdminUsersPage = () => {
// //   const {
// //     user,
// //     users = [],
// //     isAdmin,
// //     ROLE_LABELS = {},
// //     createUser,
// //     updateUser,
// //     resetUserPassword,
// //     validatePassword,
// //   } = useAuth();

// //   const [form, setForm] = useState(EMPTY_FORM);
// //   const [showCreatePassword, setShowCreatePassword] = useState(false);
// //   const [editing, setEditing] = useState(null);
// //   const [resetting, setResetting] = useState(null);
// //   const [resetPassword, setResetPassword] = useState("");
// //   const [showResetPassword, setShowResetPassword] = useState(false);
// //   const [message, setMessage] = useState("");
// //   const [error, setError] = useState("");

// //   const staffUsers = useMemo(() => {
// //     return (Array.isArray(users) ? users : [])
// //       .filter((account) => STAFF_ROLES.has(account?.role))
// //       .sort((a, b) => {
// //         if (a.email === ROOT_EMAIL) return -1;
// //         if (b.email === ROOT_EMAIL) return 1;
// //         return String(a.name || "").localeCompare(String(b.name || ""), "vi");
// //       });
// //   }, [users]);

// //   if (!user || !isAdmin) {
// //     return (
// //       <section className="py-16 bg-gray-50 min-h-[70vh]">
// //         <div className="max-w-xl mx-auto px-4 text-center">
// //           <h1 className="text-2xl font-bold text-gray-800">
// //             Không có quyền truy cập
// //           </h1>
// //           <p className="mt-3 text-gray-500">
// //             Chỉ Admin cấp cao mới được sử dụng chức năng này.
// //           </p>
// //         </div>
// //       </section>
// //     );
// //   }

// //   const clearNotice = () => {
// //     setMessage("");
// //     setError("");
// //   };
// //   const roleLabel = (role) =>
// //     ROLE_LABELS[role] || ROLES.find((r) => r.value === role)?.label || role;

// //   const submitCreate = (event) => {
// //     event.preventDefault();
// //     clearNotice();
// //     const payload = {
// //       name: form.name.trim(),
// //       email: form.email.trim().toLowerCase(),
// //       phone: form.phone.trim(),
// //       password: form.password,
// //       role: form.role,
// //     };
// //     if (
// //       !payload.name ||
// //       !payload.email ||
// //       !payload.phone ||
// //       !payload.password
// //     ) {
// //       setError("Vui lòng nhập đầy đủ thông tin bắt buộc.");
// //       return;
// //     }
// //     const check = validatePassword(payload.password);
// //     if (!check.valid) {
// //       setError(check.message);
// //       return;
// //     }
// //     const result = createUser(payload);
// //     if (!result?.success) {
// //       setError(result?.message || "Không thể tạo tài khoản.");
// //       return;
// //     }
// //     setMessage(result.message || "Tạo tài khoản thành công.");
// //     setForm(EMPTY_FORM);
// //     setShowCreatePassword(false);
// //   };

// //   const saveEdit = (event) => {
// //     event.preventDefault();
// //     clearNotice();
// //     if (!editing?.name?.trim()) {
// //       setError("Họ và tên không được để trống.");
// //       return;
// //     }
// //     if (!editing?.phone?.trim()) {
// //       setError("Số điện thoại không được để trống.");
// //       return;
// //     }
// //     const result = updateUser(editing.id, {
// //       name: editing.name.trim(),
// //       phone: editing.phone.trim(),
// //       role: editing.role,
// //     });
// //     if (!result?.success) {
// //       setError(result?.message || "Không thể cập nhật tài khoản.");
// //       return;
// //     }
// //     setMessage("Đã cập nhật tài khoản thành công.");
// //     setEditing(null);
// //   };

// //   // Kept separate from the UI handlers above so there is only one path to reset a password.
// //   const handleResetPassword = (event) => {
// //     event.preventDefault();
// //     clearNotice();
// //     if (!resetting || !resetPassword) {
// //       setError("Vui lòng nhập mật khẩu mới.");
// //       return;
// //     }
// //     const check = validatePassword(resetPassword);
// //     if (!check.valid) {
// //       setError(check.message);
// //       return;
// //     }
// //     const result = resetUserPassword(resetting.id, resetPassword);
// //     if (!result?.success) {
// //       setError(result?.message || "Không thể đổi mật khẩu.");
// //       return;
// //     }
// //     setMessage("Đã thay đổi mật khẩu tài khoản thành công.");
// //     setResetting(null);
// //     setResetPassword("");
// //     setShowResetPassword(false);
// //   };

// //   const toggleDisabled = (account) => {
// //     clearNotice();
// //     if (account.email === ROOT_EMAIL) {
// //       setError("Không thể khóa tài khoản Admin gốc.");
// //       return;
// //     }
// //     if (String(account.id) === String(user.id)) {
// //       setError("Không thể khóa tài khoản đang đăng nhập.");
// //       return;
// //     }
// //     const result = updateUser(account.id, {
// //       disabled: !Boolean(account.disabled),
// //     });
// //     if (!result?.success) {
// //       setError(result?.message || "Không thể thay đổi trạng thái tài khoản.");
// //       return;
// //     }
// //     setMessage(
// //       account.disabled ? "Đã mở khóa tài khoản." : "Đã vô hiệu hóa tài khoản."
// //     );
// //   };

// //   return (
// //     <section className="py-10 bg-gray-50 min-h-[70vh]">
// //       <div className="max-w-7xl mx-auto px-4">
// //         <div className="mb-7">
// //           <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
// //             Quản lý tài khoản
// //           </h1>
// //           <p className="mt-2 text-gray-500">
// //             Quản lý Admin, Manager và Quản lý sản phẩm. Tài khoản khách hàng
// //             không hiển thị tại đây.
// //           </p>
// //         </div>

// //         {message && (
// //           <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
// //             {message}
// //           </div>
// //         )}
// //         {error && (
// //           <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
// //             {error}
// //           </div>
// //         )}

// //         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
// //           <h2 className="text-xl font-bold text-gray-800">
// //             Tạo tài khoản quản trị
// //           </h2>
// //           <p className="mt-1 text-sm text-gray-500">
// //             Chỉ Admin cấp cao được tạo tài khoản quản trị.
// //           </p>
// //           <form
// //             onSubmit={submitCreate}
// //             className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5"
// //           >
// //             <input
// //               required
// //               className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
// //               placeholder="Họ và tên *"
// //               value={form.name}
// //               onChange={(e) => setForm({ ...form, name: e.target.value })}
// //             />
// //             <input
// //               required
// //               type="email"
// //               className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
// //               placeholder="Email *"
// //               value={form.email}
// //               onChange={(e) => setForm({ ...form, email: e.target.value })}
// //             />
// //             <input
// //               required
// //               className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
// //               placeholder="Số điện thoại *"
// //               value={form.phone}
// //               onChange={(e) => setForm({ ...form, phone: e.target.value })}
// //             />
// //             <div className="relative">
// //               <input
// //                 required
// //                 type={showCreatePassword ? "text" : "password"}
// //                 className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
// //                 placeholder="Mật khẩu *"
// //                 value={form.password}
// //                 onChange={(e) => setForm({ ...form, password: e.target.value })}
// //               />
// //               <button
// //                 type="button"
// //                 onClick={() => setShowCreatePassword((v) => !v)}
// //                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
// //               >
// //                 {showCreatePassword ? <FiEyeOff /> : <FiEye />}
// //               </button>
// //             </div>
// //             <select
// //               className="md:col-span-2 border border-gray-300 rounded-lg px-4 py-3 bg-white"
// //               value={form.role}
// //               onChange={(e) => setForm({ ...form, role: e.target.value })}
// //             >
// //               {ROLES.map((r) => (
// //                 <option key={r.value} value={r.value}>
// //                   {r.label}
// //                 </option>
// //               ))}
// //             </select>
// //             <button
// //               type="submit"
// //               className="md:col-span-2 bg-pink-600 text-white rounded-lg py-3 font-semibold hover:bg-pink-700 inline-flex items-center justify-center gap-2"
// //             >
// //               <FiPlus /> Tạo tài khoản
// //             </button>
// //           </form>
// //           <p className="mt-3 text-xs text-gray-500">
// //             Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số và ký tự
// //             đặc biệt.
// //           </p>
// //         </div>

// //         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
// //           <div className="px-6 py-5 border-b border-gray-100">
// //             <h2 className="text-xl font-bold text-gray-800">
// //               Danh sách tài khoản quản trị
// //             </h2>
// //             <p className="text-sm text-gray-500 mt-1">
// //               {staffUsers.length} tài khoản
// //             </p>
// //           </div>
// //           <div className="overflow-x-auto">
// //             <table className="w-full min-w-[980px]">
// //               <thead className="bg-gray-50">
// //                 <tr>
// //                   <th className="text-left px-5 py-4">Tài khoản</th>
// //                   <th className="text-left px-5 py-4">Liên hệ</th>
// //                   <th className="text-left px-5 py-4">Quyền</th>
// //                   <th className="text-left px-5 py-4">Trạng thái</th>
// //                   <th className="text-right px-5 py-4">Thao tác</th>
// //                 </tr>
// //               </thead>
// //               <tbody className="divide-y divide-gray-100">
// //                 {staffUsers.map((account) => {
// //                   const root = account.email === ROOT_EMAIL;
// //                   const self = String(account.id) === String(user.id);
// //                   return (
// //                     <tr key={account.id} className="hover:bg-gray-50/70">
// //                       <td className="px-5 py-4">
// //                         <p className="font-semibold text-gray-800">
// //                           {account.name || "Chưa cập nhật"}
// //                         </p>
// //                         <p className="text-sm text-gray-500">{account.email}</p>
// //                       </td>
// //                       <td className="px-5 py-4 text-sm text-gray-700">
// //                         {account.phone || "—"}
// //                       </td>
// //                       <td className="px-5 py-4">
// //                         <span className="inline-flex px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-semibold">
// //                           {roleLabel(account.role)}
// //                         </span>
// //                       </td>
// //                       <td className="px-5 py-4">
// //                         {account.disabled ? (
// //                           <span className="text-red-600 text-sm font-medium">
// //                             Đã vô hiệu hóa
// //                           </span>
// //                         ) : (
// //                           <span className="text-green-600 text-sm font-medium">
// //                             Đang hoạt động
// //                           </span>
// //                         )}
// //                       </td>
// //                       <td className="px-5 py-4">
// //                         <div className="flex justify-end gap-2">
// //                           <button
// //                             title="Chỉnh sửa"
// //                             onClick={() => {
// //                               clearNotice();
// //                               setEditing({
// //                                 id: account.id,
// //                                 name: account.name || "",
// //                                 phone: account.phone || "",
// //                                 role: account.role,
// //                               });
// //                             }}
// //                             className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
// //                           >
// //                             <FiEdit2 />
// //                           </button>
// //                           <button
// //                             title="Thay đổi mật khẩu"
// //                             onClick={() => {
// //                               clearNotice();
// //                               setResetting(account);
// //                               setResetPassword("");
// //                               setShowResetPassword(false);
// //                             }}
// //                             className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100"
// //                           >
// //                             <FiKey />
// //                           </button>
// //                           <button
// //                             disabled={root || self}
// //                             title={
// //                               account.disabled
// //                                 ? "Mở khóa tài khoản"
// //                                 : "Khóa tài khoản"
// //                             }
// //                             onClick={() => toggleDisabled(account)}
// //                             className="p-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
// //                           >
// //                             {account.disabled ? <FiUnlock /> : <FiLock />}
// //                           </button>
// //                         </div>
// //                       </td>
// //                     </tr>
// //                   );
// //                 })}
// //               </tbody>
// //             </table>
// //           </div>
// //         </div>

// //         {editing && (
// //           <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4">
// //             <form
// //               onSubmit={saveEdit}
// //               className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
// //             >
// //               <div className="flex items-center justify-between">
// //                 <h3 className="text-xl font-bold text-gray-800">
// //                   Chỉnh sửa tài khoản
// //                 </h3>
// //                 <button type="button" onClick={() => setEditing(null)}>
// //                   <FiX />
// //                 </button>
// //               </div>
// //               <p className="mt-1 text-sm text-gray-500">
// //                 Email đăng nhập:{" "}
// //                 {staffUsers.find((x) => x.id === editing.id)?.email}
// //               </p>
// //               <div className="space-y-4 mt-5">
// //                 <input
// //                   required
// //                   className="w-full border rounded-lg px-4 py-3"
// //                   placeholder="Họ và tên"
// //                   value={editing.name}
// //                   onChange={(e) =>
// //                     setEditing({ ...editing, name: e.target.value })
// //                   }
// //                 />
// //                 <input
// //                   required
// //                   className="w-full border rounded-lg px-4 py-3"
// //                   placeholder="Số điện thoại"
// //                   value={editing.phone}
// //                   onChange={(e) =>
// //                     setEditing({ ...editing, phone: e.target.value })
// //                   }
// //                 />
// //                 <select
// //                   disabled={
// //                     editing.id === user.id ||
// //                     staffUsers.find((x) => x.id === editing.id)?.email ===
// //                       ROOT_EMAIL
// //                   }
// //                   className="w-full border rounded-lg px-4 py-3 bg-white disabled:bg-gray-100"
// //                   value={editing.role}
// //                   onChange={(e) =>
// //                     setEditing({ ...editing, role: e.target.value })
// //                   }
// //                 >
// //                   {ROLES.map((r) => (
// //                     <option key={r.value} value={r.value}>
// //                       {r.label}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>
// //               <div className="flex justify-end gap-3 mt-6">
// //                 <button
// //                   type="button"
// //                   onClick={() => setEditing(null)}
// //                   className="px-4 py-2 border rounded-lg"
// //                 >
// //                   Hủy
// //                 </button>
// //                 <button
// //                   type="submit"
// //                   className="px-4 py-2 bg-pink-600 text-white rounded-lg"
// //                 >
// //                   Lưu thay đổi
// //                 </button>
// //               </div>
// //             </form>
// //           </div>
// //         )}

// //         {resetting && (
// //           <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4">
// //             <form
// //               onSubmit={handleResetPassword}
// //               className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
// //             >
// //               <div className="flex items-center justify-between">
// //                 <h3 className="text-xl font-bold text-gray-800">
// //                   Thay đổi mật khẩu
// //                 </h3>
// //                 <button type="button" onClick={() => setResetting(null)}>
// //                   <FiX />
// //                 </button>
// //               </div>
// //               <p className="mt-1 text-sm text-gray-500">
// //                 {resetting.name || resetting.email}
// //               </p>
// //               <div className="relative mt-5">
// //                 <input
// //                   required
// //                   type={showResetPassword ? "text" : "password"}
// //                   className="w-full border rounded-lg px-4 py-3 pr-12"
// //                   placeholder="Mật khẩu mới"
// //                   value={resetPassword}
// //                   onChange={(e) => setResetPassword(e.target.value)}
// //                 />
// //                 <button
// //                   type="button"
// //                   onClick={() => setShowResetPassword((v) => !v)}
// //                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
// //                 >
// //                   {showResetPassword ? <FiEyeOff /> : <FiEye />}
// //                 </button>
// //               </div>
// //               <p className="mt-2 text-xs text-gray-500">
// //                 Mật khẩu phải đáp ứng đầy đủ quy tắc bảo mật.
// //               </p>
// //               <div className="flex justify-end gap-3 mt-6">
// //                 <button
// //                   type="button"
// //                   onClick={() => setResetting(null)}
// //                   className="px-4 py-2 border rounded-lg"
// //                 >
// //                   Hủy
// //                 </button>
// //                 <button
// //                   type="submit"
// //                   className="px-4 py-2 bg-pink-600 text-white rounded-lg"
// //                 >
// //                   Lưu mật khẩu
// //                 </button>
// //               </div>
// //             </form>
// //           </div>
// //         )}
// //       </div>
// //     </section>
// //   );
// // };

// // export default AdminUsersPage;

// import { useMemo, useState } from "react";
// import {
//   FiEdit2,
//   FiEye,
//   FiEyeOff,
//   FiKey,
//   FiLock,
//   FiPlus,
//   FiTrash2,
//   FiUnlock,
//   FiX,
// } from "react-icons/fi";
// import { useAuth } from "@/context/AuthContext";

// const EMPTY_FORM = {
//   name: "",
//   email: "",
//   phone: "",
//   password: "",
//   role: "manager",
// };

// const ROLE_OPTIONS = [
//   { value: "admin", label: "Admin - Quản trị viên" },
//   { value: "manager", label: "Manager - Quản lý" },
//   {
//     value: "product_manager",
//     label: "Product Manager - Quản lý sản phẩm",
//   },
// ];

// const fieldClass =
//   "w-full border border-gray-200 rounded-lg px-4 py-3 bg-white outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-50";

// const AdminUsersPage = () => {
//   const {
//     user,
//     users,
//     isAdmin,
//     ROLE_LABELS,
//     createUser,
//     updateUser,
//     deleteUser,
//     resetUserPassword,
//     toggleUserDisabled,
//     validatePassword,
//   } = useAuth();

//   const [formData, setFormData] = useState(EMPTY_FORM);
//   const [editingUser, setEditingUser] = useState(null);
//   const [resetPasswordUser, setResetPasswordUser] = useState(null);
//   const [resetPassword, setResetPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showResetPassword, setShowResetPassword] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const sortedUsers = useMemo(() => {
//     return (Array.isArray(users) ? users : [])
//       .filter((account) => account.role !== "customer")
//       .sort((a, b) => {
//         if (a.role === "admin" && b.role !== "admin") return -1;
//         if (a.role !== "admin" && b.role === "admin") return 1;
//         return String(a.name || "").localeCompare(String(b.name || ""), "vi");
//       });
//   }, [users]);

//   if (!user || !isAdmin) {
//     return (
//       <section className="py-16 bg-gray-50 min-h-[70vh]">
//         <div className="max-w-xl mx-auto px-4 text-center">
//           <h1 className="text-2xl font-bold text-gray-800">
//             Không có quyền truy cập
//           </h1>
//           <p className="mt-3 text-gray-500">
//             Chỉ quản trị viên cấp cao mới được sử dụng chức năng này.
//           </p>
//         </div>
//       </section>
//     );
//   }

//   const clearMessages = () => {
//     setMessage("");
//     setError("");
//   };

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     setFormData((current) => ({ ...current, [name]: value }));
//     clearMessages();
//   };

//   const resetForm = () => {
//     setFormData(EMPTY_FORM);
//     setEditingUser(null);
//     setShowPassword(false);
//   };

//   const handleCreate = (event) => {
//     event.preventDefault();
//     clearMessages();
//     setSubmitting(true);

//     try {
//       if (!formData.name.trim()) {
//         setError("Vui lòng nhập họ tên.");
//         return;
//       }
//       if (!formData.email.trim()) {
//         setError("Vui lòng nhập email.");
//         return;
//       }
//       if (!formData.phone.trim()) {
//         setError("Vui lòng nhập số điện thoại.");
//         return;
//       }
//       if (!formData.password) {
//         setError("Vui lòng nhập mật khẩu.");
//         return;
//       }

//       const check = validatePassword(formData.password);
//       if (!check.valid) {
//         setError(check.message);
//         return;
//       }

//       const result = createUser({
//         name: formData.name.trim(),
//         email: formData.email.trim().toLowerCase(),
//         phone: formData.phone.trim(),
//         password: formData.password,
//         role: formData.role,
//       });

//       if (!result.success) {
//         setError(result.message);
//         return;
//       }

//       setMessage(result.message || "Tạo tài khoản thành công.");
//       resetForm();
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const startEdit = (account) => {
//     clearMessages();
//     setEditingUser(account);
//     setFormData({
//       name: account.name || "",
//       email: account.email || "",
//       phone: account.phone || "",
//       password: "",
//       role: account.role || "manager",
//     });
//     setShowPassword(false);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleUpdate = (event) => {
//     event.preventDefault();
//     clearMessages();
//     setSubmitting(true);

//     try {
//       if (!editingUser) return;

//       if (!formData.name.trim()) {
//         setError("Vui lòng nhập họ tên.");
//         return;
//       }
//       if (!formData.phone.trim()) {
//         setError("Vui lòng nhập số điện thoại.");
//         return;
//       }

//       const result = updateUser(editingUser.id, {
//         name: formData.name.trim(),
//         phone: formData.phone.trim(),
//         role: editingUser.role === "admin" ? "admin" : formData.role,
//       });

//       if (!result.success) {
//         setError(result.message);
//         return;
//       }

//       setMessage(result.message || "Cập nhật tài khoản thành công.");
//       resetForm();
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = (account) => {
//     clearMessages();

//     if (account.id === user.id) {
//       setError("Không thể xóa tài khoản Admin đang đăng nhập.");
//       return;
//     }

//     if (account.role === "admin") {
//       setError("Không thể xóa tài khoản Admin cấp cao.");
//       return;
//     }

//     if (
//       !window.confirm(
//         `Bạn có chắc muốn xóa tài khoản "${account.name || account.email}"?`
//       )
//     ) {
//       return;
//     }

//     const result = deleteUser(account.id);

//     if (!result.success) setError(result.message);
//     else setMessage(result.message || "Đã xóa tài khoản.");
//   };

//   const handleToggleDisabled = (account) => {
//     clearMessages();

//     const result = toggleUserDisabled(account.id);

//     if (!result.success) {
//       setError(result.message);
//       return;
//     }

//     setMessage(
//       account.disabled
//         ? "Đã mở khóa tài khoản."
//         : "Đã khóa/vô hiệu hóa tài khoản."
//     );
//   };

//   const openResetPassword = (account) => {
//     clearMessages();
//     setResetPasswordUser(account);
//     setResetPassword("");
//     setShowResetPassword(false);
//   };

//   const handleResetPassword = (event) => {
//     event.preventDefault();
//     clearMessages();

//     if (!resetPasswordUser) return;

//     const check = validatePassword(resetPassword);

//     if (!check.valid) {
//       setError(check.message);
//       return;
//     }

//     const result = resetUserPassword(resetPasswordUser.id, resetPassword);

//     if (!result.success) {
//       setError(result.message);
//       return;
//     }

//     setMessage(result.message || "Đã đổi mật khẩu tài khoản.");
//     setResetPasswordUser(null);
//     setResetPassword("");
//   };

//   const roleLabel = (role) =>
//     ROLE_LABELS?.[role] ||
//     {
//       admin: "Quản trị viên",
//       manager: "Quản lý",
//       product_manager: "Quản lý sản phẩm",
//     }[role] ||
//     role;

//   const roleBadgeClass = (role) => {
//     if (role === "admin") return "bg-red-50 text-red-700";
//     if (role === "manager") return "bg-blue-50 text-blue-700";
//     if (role === "product_manager") return "bg-purple-50 text-purple-700";
//     return "bg-gray-50 text-gray-700";
//   };

//   return (
//     <section className="py-10 bg-gray-50 min-h-[70vh]">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="mb-7">
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
//             Quản lý tài khoản
//           </h1>
//           <p className="mt-2 text-gray-500">
//             Quản lý tài khoản Admin, Manager và Quản lý sản phẩm.
//           </p>
//         </div>

//         {message && (
//           <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700">
//             {message}
//           </div>
//         )}

//         {error && (
//           <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">
//             {error}
//           </div>
//         )}

//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
//           <div className="flex items-center justify-between gap-4 mb-6">
//             <div>
//               <h2 className="text-xl font-bold text-gray-800">
//                 {editingUser ? "Cập nhật tài khoản" : "Tạo tài khoản quản trị"}
//               </h2>
//               <p className="mt-1 text-sm text-gray-500">
//                 {editingUser
//                   ? `Đang chỉnh sửa: ${editingUser.email}`
//                   : "Chỉ Admin cấp cao mới có quyền tạo tài khoản quản trị."}
//               </p>
//             </div>

//             {editingUser && (
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
//               >
//                 <FiX />
//                 Hủy sửa
//               </button>
//             )}
//           </div>

//           <form
//             onSubmit={editingUser ? handleUpdate : handleCreate}
//             className="grid grid-cols-1 md:grid-cols-2 gap-5"
//           >
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Họ và tên *
//               </label>
//               <input
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 disabled={submitting}
//                 required
//                 className={fieldClass}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email *
//               </label>
//               <input
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 disabled={submitting || Boolean(editingUser)}
//                 required
//                 className={fieldClass}
//               />
//               {editingUser && (
//                 <p className="mt-1 text-xs text-gray-500">
//                   Email tài khoản hiện tại không được chỉnh sửa tại đây.
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Số điện thoại *
//               </label>
//               <input
//                 name="phone"
//                 type="tel"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 disabled={submitting}
//                 required
//                 className={fieldClass}
//               />
//             </div>

//             {!editingUser && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Mật khẩu *
//                 </label>
//                 <div className="relative">
//                   <input
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     value={formData.password}
//                     onChange={handleChange}
//                     disabled={submitting}
//                     required
//                     autoComplete="new-password"
//                     className={`${fieldClass} pr-12`}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword((current) => !current)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-600"
//                     aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
//                   >
//                     {showPassword ? (
//                       <FiEyeOff size={19} />
//                     ) : (
//                       <FiEye size={19} />
//                     )}
//                   </button>
//                 </div>
//                 <p className="mt-2 text-xs text-gray-500">
//                   Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc
//                   biệt.
//                 </p>
//               </div>
//             )}

//             <div className={editingUser ? "md:col-span-2" : ""}>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Quyền tài khoản *
//               </label>
//               <select
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//                 disabled={submitting || editingUser?.role === "admin"}
//                 className={`${fieldClass} disabled:bg-gray-50`}
//               >
//                 {ROLE_OPTIONS.map((option) => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//               {editingUser?.role === "admin" && (
//                 <p className="mt-2 text-xs text-red-600">
//                   Tài khoản Admin cấp cao không được hạ quyền.
//                 </p>
//               )}
//             </div>

//             <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="inline-flex items-center justify-center gap-2 flex-1 bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-60"
//               >
//                 {editingUser ? <FiEdit2 /> : <FiPlus />}
//                 {submitting
//                   ? "Đang xử lý..."
//                   : editingUser
//                     ? "Lưu thay đổi"
//                     : "Tạo tài khoản"}
//               </button>

//               {editingUser && (
//                 <button
//                   type="button"
//                   onClick={resetForm}
//                   className="px-6 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
//                 >
//                   Hủy
//                 </button>
//               )}
//             </div>
//           </form>
//         </div>

//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//           <div className="px-6 py-5 border-b border-gray-100">
//             <h2 className="text-xl font-bold text-gray-800">
//               Danh sách tài khoản
//             </h2>
//             <p className="mt-1 text-sm text-gray-500">
//               Tổng số: {sortedUsers.length} tài khoản
//             </p>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[1060px]">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
//                     Tài khoản
//                   </th>
//                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
//                     Liên hệ
//                   </th>
//                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
//                     Quyền
//                   </th>
//                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
//                     Trạng thái
//                   </th>
//                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
//                     Ngày tạo
//                   </th>
//                   <th className="text-right px-5 py-4 text-sm font-semibold text-gray-600">
//                     Thao tác
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-gray-100">
//                 {sortedUsers.map((account) => (
//                   <tr key={account.id} className="hover:bg-pink-50/30">
//                     <td className="px-5 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
//                           {(account.name || account.email || "?")
//                             .charAt(0)
//                             .toUpperCase()}
//                         </div>
//                         <div>
//                           <p className="font-semibold text-gray-800">
//                             {account.name || "Chưa cập nhật"}
//                             {account.id === user.id && (
//                               <span className="ml-2 text-xs text-pink-600">
//                                 (Bạn)
//                               </span>
//                             )}
//                           </p>
//                           <p className="text-sm text-gray-500">
//                             {account.email}
//                           </p>
//                         </div>
//                       </div>
//                     </td>

//                     <td className="px-5 py-4 text-sm text-gray-600">
//                       {account.phone || "Chưa cập nhật"}
//                     </td>

//                     <td className="px-5 py-4">
//                       <span
//                         className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadgeClass(
//                           account.role
//                         )}`}
//                       >
//                         {roleLabel(account.role)}
//                       </span>
//                     </td>

//                     <td className="px-5 py-4">
//                       <span
//                         className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
//                           account.disabled
//                             ? "bg-red-50 text-red-700"
//                             : "bg-green-50 text-green-700"
//                         }`}
//                       >
//                         {account.disabled ? "Đã khóa" : "Đang hoạt động"}
//                       </span>
//                     </td>

//                     <td className="px-5 py-4 text-sm text-gray-600">
//                       {account.createdAt
//                         ? new Date(account.createdAt).toLocaleDateString(
//                             "vi-VN"
//                           )
//                         : "—"}
//                     </td>

//                     <td className="px-5 py-4">
//                       <div className="flex justify-end gap-2">
//                         <button
//                           type="button"
//                           onClick={() => startEdit(account)}
//                           className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50"
//                           title="Chỉnh sửa"
//                         >
//                           <FiEdit2 size={16} />
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() => openResetPassword(account)}
//                           className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
//                           title="Đổi mật khẩu"
//                         >
//                           <FiKey size={16} />
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() => handleToggleDisabled(account)}
//                           disabled={
//                             account.id === user.id || account.role === "admin"
//                           }
//                           className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border ${
//                             account.disabled
//                               ? "border-green-100 text-green-600 hover:bg-green-50"
//                               : "border-orange-100 text-orange-600 hover:bg-orange-50"
//                           } disabled:opacity-30 disabled:cursor-not-allowed`}
//                           title={
//                             account.disabled
//                               ? "Mở khóa tài khoản"
//                               : "Khóa tài khoản"
//                           }
//                         >
//                           {account.disabled ? (
//                             <FiUnlock size={16} />
//                           ) : (
//                             <FiLock size={16} />
//                           )}
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() => handleDelete(account)}
//                           disabled={
//                             account.id === user.id || account.role === "admin"
//                           }
//                           className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
//                           title="Xóa tài khoản"
//                         >
//                           <FiTrash2 size={16} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {resetPasswordUser && (
//           <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4">
//             <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
//               <div className="flex items-center justify-between gap-4 mb-5">
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-800">
//                     Đổi mật khẩu
//                   </h3>
//                   <p className="mt-1 text-sm text-gray-500">
//                     {resetPasswordUser.name || resetPasswordUser.email}
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => setResetPasswordUser(null)}
//                   className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
//                   aria-label="Đóng"
//                 >
//                   <FiX />
//                 </button>
//               </div>

//               <form onSubmit={handleResetPassword}>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Mật khẩu mới *
//                 </label>

//                 <div className="relative">
//                   <input
//                     type={showResetPassword ? "text" : "password"}
//                     value={resetPassword}
//                     onChange={(event) => {
//                       setResetPassword(event.target.value);
//                       clearMessages();
//                     }}
//                     required
//                     autoComplete="new-password"
//                     className={`${fieldClass} pr-12`}
//                   />

//                   <button
//                     type="button"
//                     onClick={() => setShowResetPassword((current) => !current)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-600"
//                     aria-label={
//                       showResetPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
//                     }
//                   >
//                     {showResetPassword ? (
//                       <FiEyeOff size={19} />
//                     ) : (
//                       <FiEye size={19} />
//                     )}
//                   </button>
//                 </div>

//                 <p className="mt-2 text-xs text-gray-500">
//                   Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc
//                   biệt.
//                 </p>

//                 <div className="mt-6 flex gap-3">
//                   <button
//                     type="button"
//                     onClick={() => setResetPasswordUser(null)}
//                     className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
//                   >
//                     Hủy
//                   </button>

//                   <button
//                     type="submit"
//                     className="flex-1 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700"
//                   >
//                     Lưu mật khẩu
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default AdminUsersPage;

import { useMemo, useState } from "react";
import {
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
  { value: "admin", label: "Admin - Quản trị viên" },
  { value: "manager", label: "Manager - Quản lý" },
  {
    value: "product_manager",
    label: "Product Manager - Quản lý sản phẩm",
  },
];

const fieldClass =
  "w-full border border-gray-200 rounded-lg px-4 py-3 bg-white outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-50";

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
  const [editingUser, setEditingUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sortedUsers = useMemo(() => {
    return (Array.isArray(users) ? users : [])
      .filter((account) => account.role !== "customer")
      .sort((a, b) => {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (a.role !== "admin" && b.role === "admin") return 1;
        return String(a.name || "").localeCompare(String(b.name || ""), "vi");
      });
  }, [users]);

  if (!user || !isAdmin) {
    return (
      <section className="py-16 bg-gray-50 min-h-[70vh]">
        <div className="max-w-xl mx-auto px-4 text-center">
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    clearMessages();
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingUser(null);
    setShowPassword(false);
  };

  const handleCreate = (event) => {
    event.preventDefault();
    clearMessages();
    setSubmitting(true);

    try {
      if (!formData.name.trim()) {
        setError("Vui lòng nhập họ tên.");
        return;
      }
      if (!formData.emailPrefix.trim()) {
        setError("Vui lòng nhập phần tên email trước @flowershop.vn.");
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

      const check = validatePassword(formData.password);
      if (!check.valid) {
        setError(check.message);
        return;
      }

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
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (account) => {
    clearMessages();
    setEditingUser(account);
    setFormData({
      name: account.name || "",
      emailPrefix: String(account.email || "").split("@")[0],
      phone: account.phone || "",
      password: "",
      role: account.role || "manager",
    });
    setShowPassword(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    clearMessages();
    setSubmitting(true);

    try {
      if (!editingUser) return;

      if (!formData.name.trim()) {
        setError("Vui lòng nhập họ tên.");
        return;
      }
      if (!formData.phone.trim()) {
        setError("Vui lòng nhập số điện thoại.");
        return;
      }

      const result = updateUser(editingUser.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        role: editingUser.role === "admin" ? "admin" : formData.role,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message || "Cập nhật tài khoản thành công.");
      resetForm();
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

    if (!result.success) setError(result.message);
    else setMessage(result.message || "Đã xóa tài khoản.");
  };

  const handleToggleDisabled = (account) => {
    clearMessages();

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

  const openResetPassword = (account) => {
    clearMessages();
    setResetPasswordUser(account);
    setResetPassword("");
    setShowResetPassword(false);
  };

  const handleResetPassword = (event) => {
    event.preventDefault();
    clearMessages();

    if (!resetPasswordUser) return;

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

    setMessage(result.message || "Đã đổi mật khẩu tài khoản.");
    setResetPasswordUser(null);
    setResetPassword("");
  };

  const roleLabel = (role) =>
    ROLE_LABELS?.[role] ||
    {
      admin: "Quản trị viên",
      manager: "Quản lý",
      product_manager: "Quản lý sản phẩm",
    }[role] ||
    role;

  const roleBadgeClass = (role) => {
    if (role === "admin") return "bg-red-50 text-red-700";
    if (role === "manager") return "bg-blue-50 text-blue-700";
    if (role === "product_manager") return "bg-purple-50 text-purple-700";
    return "bg-gray-50 text-gray-700";
  };

  return (
    <section className="py-10 bg-gray-50 min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-7">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Quản lý tài khoản
          </h1>
          <p className="mt-2 text-gray-500">
            Quản lý tài khoản Admin, Manager và Quản lý sản phẩm.
          </p>
        </div>

        {message && (
          <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {editingUser ? "Cập nhật tài khoản" : "Tạo tài khoản quản trị"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {editingUser
                  ? `Đang chỉnh sửa: ${editingUser.email}`
                  : "Chỉ Admin cấp cao mới có quyền tạo tài khoản quản trị."}
              </p>
            </div>

            {editingUser && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <FiX />
                Hủy sửa
              </button>
            )}
          </div>

          <form
            onSubmit={editingUser ? handleUpdate : handleCreate}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên *
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={submitting}
                required
                className={fieldClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="flex">
                <input
                  name="emailPrefix"
                  value={formData.emailPrefix}
                  onChange={handleChange}
                  disabled={submitting || Boolean(editingUser)}
                  required
                  placeholder="ten nguoi dung"
                  className={`${fieldClass} rounded-r-none`}
                />
                <div className="shrink-0 flex items-center px-4 border border-l-0 border-gray-200 rounded-r-lg bg-gray-50 text-gray-600 text-sm">
                  {EMAIL_DOMAIN}
                </div>
              </div>
              {editingUser && (
                <p className="mt-1 text-xs text-gray-500">
                  Email tài khoản hiện tại không được chỉnh sửa tại đây.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại *
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={submitting}
                required
                className={fieldClass}
              />
            </div>

            {!editingUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                    autoComplete="new-password"
                    className={`${fieldClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-600"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <FiEyeOff size={19} />
                    ) : (
                      <FiEye size={19} />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc
                  biệt.
                </p>
              </div>
            )}

            <div className={editingUser ? "md:col-span-2" : ""}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quyền tài khoản *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={submitting || editingUser?.role === "admin"}
                className={`${fieldClass} disabled:bg-gray-50`}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {editingUser?.role === "admin" && (
                <p className="mt-2 text-xs text-red-600">
                  Tài khoản Admin cấp cao không được hạ quyền.
                </p>
              )}
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 flex-1 bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-60"
              >
                {editingUser ? <FiEdit2 /> : <FiPlus />}
                {submitting
                  ? "Đang xử lý..."
                  : editingUser
                    ? "Lưu thay đổi"
                    : "Tạo tài khoản"}
              </button>

              {editingUser && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">
              Danh sách tài khoản
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Tổng số: {sortedUsers.length} tài khoản
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                    Tài khoản
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                    Liên hệ
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                    Quyền
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                    Trạng thái
                  </th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                    Ngày tạo
                  </th>
                  <th className="text-right px-5 py-4 text-sm font-semibold text-gray-600">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {sortedUsers.map((account) => (
                  <tr key={account.id} className="hover:bg-pink-50/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                          {(account.name || account.email || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {account.name || "Chưa cập nhật"}
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
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadgeClass(
                          account.role
                        )}`}
                      >
                        {roleLabel(account.role)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
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
                          onClick={() => startEdit(account)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50"
                          title="Chỉnh sửa"
                        >
                          <FiEdit2 size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openResetPassword(account)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                          title="Đổi mật khẩu"
                        >
                          <FiKey size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleDisabled(account)}
                          disabled={
                            account.id === user.id || account.role === "admin"
                          }
                          className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border ${
                            account.disabled
                              ? "border-green-100 text-green-600 hover:bg-green-50"
                              : "border-orange-100 text-orange-600 hover:bg-orange-50"
                          } disabled:opacity-30 disabled:cursor-not-allowed`}
                          title={
                            account.disabled
                              ? "Mở khóa tài khoản"
                              : "Khóa tài khoản"
                          }
                        >
                          {account.disabled ? (
                            <FiUnlock size={16} />
                          ) : (
                            <FiLock size={16} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(account)}
                          disabled={
                            account.id === user.id || account.role === "admin"
                          }
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Xóa tài khoản"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {resetPasswordUser && (
          <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Đổi mật khẩu
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {resetPasswordUser.name || resetPasswordUser.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setResetPasswordUser(null)}
                  className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
                  aria-label="Đóng"
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleResetPassword}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    required
                    autoComplete="new-password"
                    className={`${fieldClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowResetPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-600"
                    aria-label={
                      showResetPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
                  >
                    {showResetPassword ? (
                      <FiEyeOff size={19} />
                    ) : (
                      <FiEye size={19} />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc
                  biệt.
                </p>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setResetPasswordUser(null)}
                    className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700"
                  >
                    Lưu mật khẩu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminUsersPage;
