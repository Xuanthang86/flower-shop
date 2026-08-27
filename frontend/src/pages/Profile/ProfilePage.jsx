// // import { useEffect, useState } from "react";
// // import { useLocation, useNavigate } from "react-router-dom";
// // import { FiEye, FiEyeOff, FiSave, FiUser, FiLock } from "react-icons/fi";
// // import { useAuth } from "@/context/AuthContext";

// // const ProfilePage = () => {
// //   const { user, ROLE_LABELS, updateProfile, changePassword, validatePassword } =
// //     useAuth();
// //   const location = useLocation();
// //   const navigate = useNavigate();

// //   const [activeTab, setActiveTab] = useState(
// //     location.state?.tab === "password" ? "password" : "info"
// //   );

// //   const [profile, setProfile] = useState({
// //     name: "",
// //     phone: "",
// //     avatar: "",
// //   });

// //   const [passwordData, setPasswordData] = useState({
// //     currentPassword: "",
// //     newPassword: "",
// //     confirmPassword: "",
// //   });

// //   const [showCurrent, setShowCurrent] = useState(false);
// //   const [showNew, setShowNew] = useState(false);
// //   const [showConfirm, setShowConfirm] = useState(false);

// //   const [profileMessage, setProfileMessage] = useState("");
// //   const [profileError, setProfileError] = useState("");
// //   const [passwordMessage, setPasswordMessage] = useState("");
// //   const [passwordError, setPasswordError] = useState("");

// //   useEffect(() => {
// //     if (!user) {
// //       navigate("/login", { replace: true });
// //       return;
// //     }

// //     setProfile({
// //       name: user.name || "",
// //       phone: user.phone || "",
// //       avatar: user.avatar || "",
// //     });
// //   }, [user, navigate]);

// //   useEffect(() => {
// //     setActiveTab(location.state?.tab === "password" ? "password" : "info");
// //   }, [location.state]);

// //   if (!user) return null;

// //   const roleLabel =
// //     ROLE_LABELS?.[user.role] ||
// //     {
// //       admin: "Quản trị viên",
// //       manager: "Quản lý",
// //       product_manager: "Quản lý sản phẩm",
// //       customer: "Khách hàng",
// //     }[user.role] ||
// //     user.role;

// //   const selectTab = (tab) => {
// //     setActiveTab(tab);
// //     setProfileMessage("");
// //     setProfileError("");
// //     setPasswordMessage("");
// //     setPasswordError("");

// //     navigate("/profile", {
// //       replace: true,
// //       state: { tab },
// //     });
// //   };

// //   const handleAvatarChange = (event) => {
// //     const file = event.target.files?.[0];
// //     if (!file) return;

// //     if (!file.type.startsWith("image/")) {
// //       setProfileError("Vui lòng chọn file hình ảnh.");
// //       return;
// //     }

// //     if (file.size > 2 * 1024 * 1024) {
// //       setProfileError("Ảnh đại diện không được vượt quá 2MB.");
// //       return;
// //     }

// //     const reader = new FileReader();

// //     reader.onload = () => {
// //       setProfile((current) => ({
// //         ...current,
// //         avatar: reader.result,
// //       }));
// //       setProfileError("");
// //     };

// //     reader.readAsDataURL(file);
// //   };

// //   const handleProfileSubmit = (event) => {
// //     event.preventDefault();
// //     setProfileMessage("");
// //     setProfileError("");

// //     if (!profile.name.trim()) {
// //       setProfileError("Vui lòng nhập họ và tên.");
// //       return;
// //     }

// //     const result = updateProfile({
// //       name: profile.name.trim(),
// //       phone: profile.phone.trim(),
// //       avatar: profile.avatar || "",
// //     });

// //     if (!result?.success) {
// //       setProfileError(result?.message || "Không thể cập nhật thông tin.");
// //       return;
// //     }

// //     setProfileMessage("Thông tin tài khoản đã được cập nhật.");
// //   };

// //   const handlePasswordSubmit = (event) => {
// //     event.preventDefault();
// //     setPasswordMessage("");
// //     setPasswordError("");

// //     if (!passwordData.currentPassword) {
// //       setPasswordError("Vui lòng nhập mật khẩu hiện tại.");
// //       return;
// //     }

// //     if (!passwordData.newPassword) {
// //       setPasswordError("Vui lòng nhập mật khẩu mới.");
// //       return;
// //     }

// //     const passwordCheck = validatePassword(passwordData.newPassword);

// //     if (!passwordCheck.valid) {
// //       setPasswordError(passwordCheck.message);
// //       return;
// //     }

// //     if (passwordData.newPassword !== passwordData.confirmPassword) {
// //       setPasswordError("Mật khẩu xác nhận không khớp.");
// //       return;
// //     }

// //     const result = changePassword(
// //       passwordData.currentPassword,
// //       passwordData.newPassword
// //     );

// //     if (!result?.success) {
// //       setPasswordError(result?.message || "Không thể đổi mật khẩu.");
// //       return;
// //     }

// //     setPasswordMessage("Đổi mật khẩu thành công.");
// //     setPasswordData({
// //       currentPassword: "",
// //       newPassword: "",
// //       confirmPassword: "",
// //     });
// //     setShowCurrent(false);
// //     setShowNew(false);
// //     setShowConfirm(false);
// //   };

// //   return (
// //     <section className="min-h-[70vh] bg-gray-50 py-10">
// //       <div
// //         className={`${activeTab === "password" ? "max-w-3xl" : "max-w-5xl"} mx-auto px-4`}
// //       >
// //         <div className="mb-7">
// //           <h1 className="text-3xl font-bold text-gray-800">Tài khoản</h1>
// //           <p className="mt-2 text-gray-500">
// //             Quản lý thông tin cá nhân và bảo mật tài khoản.
// //           </p>
// //         </div>

// //         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
// //           <div className="px-6 md:px-8 pt-6 pb-2">
// //             <div className="flex items-center gap-3">
// //               <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
// //                 {activeTab === "info" ? <FiUser /> : <FiLock />}
// //               </div>
// //               <div>
// //                 <h2 className="text-xl font-bold text-gray-800">
// //                   {activeTab === "info"
// //                     ? "Thông tin tài khoản"
// //                     : "Đổi mật khẩu"}
// //                 </h2>
// //                 <p className="text-sm text-gray-500">
// //                   {activeTab === "info"
// //                     ? "Cập nhật thông tin cá nhân của bạn."
// //                     : "Cập nhật mật khẩu để bảo vệ tài khoản."}
// //                 </p>
// //               </div>
// //             </div>
// //           </div>

// //           {activeTab === "info" && (
// //             <div className="p-6 md:p-8">
// //               {profileMessage && (
// //                 <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
// //                   {profileMessage}
// //                 </div>
// //               )}

// //               {profileError && (
// //                 <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
// //                   {profileError}
// //                 </div>
// //               )}

// //               <form onSubmit={handleProfileSubmit} className="space-y-6">
// //                 <div className="flex items-center gap-5">
// //                   <div className="w-20 h-20 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center text-pink-600 text-2xl font-bold">
// //                     {profile.avatar ? (
// //                       <img
// //                         src={profile.avatar}
// //                         alt="Ảnh đại diện"
// //                         className="w-full h-full object-cover"
// //                       />
// //                     ) : (
// //                       (profile.name || "U").charAt(0).toUpperCase()
// //                     )}
// //                   </div>

// //                   <div>
// //                     <input
// //                       id="profile-avatar"
// //                       type="file"
// //                       accept="image/*"
// //                       onChange={handleAvatarChange}
// //                       className="hidden"
// //                     />
// //                     <label
// //                       htmlFor="profile-avatar"
// //                       className="inline-block cursor-pointer px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
// //                     >
// //                       Chọn ảnh
// //                     </label>
// //                     <p className="mt-2 text-xs text-gray-500">
// //                       JPG, PNG hoặc WEBP. Tối đa 2MB.
// //                     </p>
// //                   </div>
// //                 </div>

// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// //                     Họ và tên *
// //                   </label>
// //                   <input
// //                     value={profile.name}
// //                     onChange={(event) =>
// //                       setProfile((current) => ({
// //                         ...current,
// //                         name: event.target.value,
// //                       }))
// //                     }
// //                     required
// //                     className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
// //                   />
// //                 </div>

// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// //                     Email
// //                   </label>
// //                   <input
// //                     value={user.email || ""}
// //                     disabled
// //                     className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-lg px-4 py-3"
// //                   />
// //                   <p className="mt-1 text-xs text-gray-500">
// //                     Email đăng nhập chưa cho phép thay đổi.
// //                   </p>
// //                 </div>

// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// //                     Số điện thoại
// //                   </label>
// //                   <input
// //                     value={profile.phone}
// //                     onChange={(event) =>
// //                       setProfile((current) => ({
// //                         ...current,
// //                         phone: event.target.value,
// //                       }))
// //                     }
// //                     className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
// //                   />
// //                 </div>

// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// //                     Quyền tài khoản
// //                   </label>
// //                   <span className="inline-flex px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-sm font-semibold">
// //                     {roleLabel}
// //                   </span>
// //                 </div>

// //                 <button
// //                   type="submit"
// //                   className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700"
// //                 >
// //                   <FiSave />
// //                   Lưu thay đổi
// //                 </button>
// //               </form>
// //             </div>
// //           )}

// //           {activeTab === "password" && (
// //             <div className="p-6 md:p-8">
// //               {passwordMessage && (
// //                 <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
// //                   {passwordMessage}
// //                 </div>
// //               )}

// //               {passwordError && (
// //                 <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
// //                   {passwordError}
// //                 </div>
// //               )}

// //               <form
// //                 onSubmit={handlePasswordSubmit}
// //                 className="max-w-xl space-y-5"
// //               >
// //                 {[
// //                   [
// //                     "currentPassword",
// //                     "Mật khẩu hiện tại",
// //                     showCurrent,
// //                     setShowCurrent,
// //                   ],
// //                   ["newPassword", "Mật khẩu mới", showNew, setShowNew],
// //                   [
// //                     "confirmPassword",
// //                     "Xác nhận mật khẩu mới",
// //                     showConfirm,
// //                     setShowConfirm,
// //                   ],
// //                 ].map(([name, label, visible, setVisible]) => (
// //                   <div key={name}>
// //                     <label className="block text-sm font-medium text-gray-700 mb-2">
// //                       {label} *
// //                     </label>
// //                     <div className="relative">
// //                       <input
// //                         type={visible ? "text" : "password"}
// //                         value={passwordData[name]}
// //                         onChange={(event) =>
// //                           setPasswordData((current) => ({
// //                             ...current,
// //                             [name]: event.target.value,
// //                           }))
// //                         }
// //                         autoComplete="new-password"
// //                         required
// //                         className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
// //                       />
// //                       <button
// //                         type="button"
// //                         onClick={() => setVisible((current) => !current)}
// //                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-600"
// //                         aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
// //                       >
// //                         {visible ? <FiEyeOff size={19} /> : <FiEye size={19} />}
// //                       </button>
// //                     </div>
// //                   </div>
// //                 ))}

// //                 <p className="text-xs text-gray-500">
// //                   Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường,
// //                   số và ký tự đặc biệt.
// //                 </p>

// //                 <button
// //                   type="submit"
// //                   className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700"
// //                 >
// //                   <FiLock />
// //                   Đổi mật khẩu
// //                 </button>
// //               </form>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </section>
// //   );
// // };

// // export default ProfilePage;

// import { useEffect, useState } from "react";

// import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

// import { FiEye, FiEyeOff, FiLock, FiSave, FiUser } from "react-icons/fi";

// import { useAuth } from "@/context/AuthContext";

// const ProfilePage = () => {
//   const { user, ROLE_LABELS, updateProfile, changePassword, validatePassword } =
//     useAuth();

//   const location = useLocation();

//   const navigate = useNavigate();

//   const [searchParams] = useSearchParams();

//   const initialTab =
//     location.state?.tab === "password" || searchParams.get("tab") === "password"
//       ? "password"
//       : "info";

//   const [activeTab, setActiveTab] = useState(initialTab);

//   const [profile, setProfile] = useState({
//     name: "",
//     phone: "",
//     avatar: "",
//   });

//   const [passwordData, setPasswordData] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const [showCurrent, setShowCurrent] = useState(false);

//   const [showNew, setShowNew] = useState(false);

//   const [showConfirm, setShowConfirm] = useState(false);

//   const [profileMessage, setProfileMessage] = useState("");

//   const [profileError, setProfileError] = useState("");

//   const [passwordMessage, setPasswordMessage] = useState("");

//   const [passwordError, setPasswordError] = useState("");

//   /* =====================================================
//      USER
//   ===================================================== */

//   useEffect(() => {
//     if (!user) {
//       navigate("/login", {
//         replace: true,
//       });

//       return;
//     }

//     setProfile({
//       name: user.name || "",
//       phone: user.phone || "",
//       avatar: user.avatar || "",
//     });
//   }, [user, navigate]);

//   /* =====================================================
//      TAB
//   ===================================================== */

//   useEffect(() => {
//     const tab =
//       location.state?.tab === "password" ||
//       searchParams.get("tab") === "password"
//         ? "password"
//         : "info";

//     setActiveTab(tab);
//   }, [location.state, searchParams]);

//   if (!user) {
//     return null;
//   }

//   const roleLabel =
//     ROLE_LABELS?.[user.role] ||
//     {
//       admin: "Quản trị viên",
//       manager: "Quản lý",
//       product_manager: "Quản lý sản phẩm",
//       customer: "Khách hàng",
//     }[user.role] ||
//     user.role;

//   /* =====================================================
//      CHUYỂN TAB
//   ===================================================== */

//   const selectTab = (tab) => {
//     setActiveTab(tab);

//     setProfileMessage("");
//     setProfileError("");
//     setPasswordMessage("");
//     setPasswordError("");

//     navigate(
//       tab === "password" ? "/profile?tab=password" : "/profile?tab=info",
//       {
//         replace: true,
//         state: {
//           tab,
//         },
//       }
//     );
//   };

//   /* =====================================================
//      AVATAR
//   ===================================================== */

//   const handleAvatarChange = (event) => {
//     const file = event.target.files?.[0];

//     if (!file) {
//       return;
//     }

//     if (!file.type.startsWith("image/")) {
//       setProfileError("Vui lòng chọn file hình ảnh.");
//       return;
//     }

//     if (file.size > 2 * 1024 * 1024) {
//       setProfileError("Ảnh đại diện không được vượt quá 2MB.");
//       return;
//     }

//     const reader = new FileReader();

//     reader.onload = () => {
//       setProfile((current) => ({
//         ...current,
//         avatar: reader.result,
//       }));
//     };

//     reader.readAsDataURL(file);
//   };

//   /* =====================================================
//      CẬP NHẬT PROFILE
//   ===================================================== */

//   const handleProfileSubmit = (event) => {
//     event.preventDefault();

//     setProfileMessage("");
//     setProfileError("");

//     if (!profile.name.trim()) {
//       setProfileError("Vui lòng nhập họ và tên.");
//       return;
//     }

//     const result = updateProfile({
//       name: profile.name.trim(),
//       phone: profile.phone.trim(),
//       avatar: profile.avatar || "",
//     });

//     if (!result?.success) {
//       setProfileError(result?.message || "Không thể cập nhật thông tin.");
//       return;
//     }

//     setProfileMessage("Thông tin tài khoản đã được cập nhật.");
//   };

//   /* =====================================================
//      ĐỔI MẬT KHẨU
//   ===================================================== */

//   const handlePasswordSubmit = (event) => {
//     event.preventDefault();

//     setPasswordMessage("");
//     setPasswordError("");

//     if (!passwordData.currentPassword) {
//       setPasswordError("Vui lòng nhập mật khẩu hiện tại.");
//       return;
//     }

//     if (!passwordData.newPassword) {
//       setPasswordError("Vui lòng nhập mật khẩu mới.");
//       return;
//     }

//     const checked = validatePassword(passwordData.newPassword);

//     if (!checked.valid) {
//       setPasswordError(checked.message);
//       return;
//     }

//     if (passwordData.newPassword !== passwordData.confirmPassword) {
//       setPasswordError("Mật khẩu xác nhận không khớp.");
//       return;
//     }

//     const result = changePassword(
//       passwordData.currentPassword,
//       passwordData.newPassword
//     );

//     if (!result?.success) {
//       setPasswordError(result?.message || "Không thể đổi mật khẩu.");
//       return;
//     }

//     setPasswordMessage("Đổi mật khẩu thành công.");

//     setPasswordData({
//       currentPassword: "",
//       newPassword: "",
//       confirmPassword: "",
//     });

//     setShowCurrent(false);
//     setShowNew(false);
//     setShowConfirm(false);
//   };

//   return (
//     <section className="min-h-[70vh] bg-gray-50 py-10">
//       <div className="max-w-5xl mx-auto px-4">
//         <div className="mb-7">
//           <h1 className="text-3xl font-bold text-gray-800">Tài khoản</h1>

//           <p className="mt-2 text-gray-500">
//             Quản lý thông tin cá nhân và bảo mật tài khoản.
//           </p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//           {/* TAB */}

//           <div className="border-b border-gray-100 px-6 md:px-8">
//             <div className="flex gap-6">
//               <button
//                 type="button"
//                 onClick={() => selectTab("info")}
//                 className={`py-4 border-b-2 font-medium ${
//                   activeTab === "info"
//                     ? "border-pink-600 text-pink-600"
//                     : "border-transparent text-gray-500"
//                 }`}
//               >
//                 <FiUser className="inline mr-2" />
//                 Thông tin tài khoản
//               </button>
//             </div>
//           </div>

//           {/* =================================================
//               THÔNG TIN
//           ================================================= */}

//           {activeTab === "info" && (
//             <div className="p-6 md:p-8">
//               {profileMessage && (
//                 <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
//                   {profileMessage}
//                 </div>
//               )}

//               {profileError && (
//                 <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
//                   {profileError}
//                 </div>
//               )}

//               <form
//                 onSubmit={handleProfileSubmit}
//                 className="max-w-xl space-y-6"
//               >
//                 <div className="flex items-center gap-5">
//                   <div className="w-20 h-20 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center text-pink-600 text-2xl font-bold">
//                     {profile.avatar ? (
//                       <img
//                         src={profile.avatar}
//                         alt="Ảnh đại diện"
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       (profile.name || "U").charAt(0).toUpperCase()
//                     )}
//                   </div>

//                   <div>
//                     <input
//                       id="profile-avatar"
//                       type="file"
//                       accept="image/*"
//                       onChange={handleAvatarChange}
//                       className="hidden"
//                     />

//                     <label
//                       htmlFor="profile-avatar"
//                       className="inline-block cursor-pointer px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//                     >
//                       Chọn ảnh
//                     </label>

//                     <p className="mt-2 text-xs text-gray-500">
//                       JPG, PNG, WEBP. Tối đa 2MB.
//                     </p>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-2">
//                     Họ và tên *
//                   </label>

//                   <input
//                     value={profile.name}
//                     onChange={(event) =>
//                       setProfile((current) => ({
//                         ...current,
//                         name: event.target.value,
//                       }))
//                     }
//                     required
//                     className="w-full border border-gray-300 rounded-lg px-4 py-3"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-2">
//                     Email
//                   </label>

//                   <input
//                     value={user.email || ""}
//                     disabled
//                     className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-lg px-4 py-3"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-2">
//                     Số điện thoại
//                   </label>

//                   <input
//                     value={profile.phone}
//                     onChange={(event) =>
//                       setProfile((current) => ({
//                         ...current,
//                         phone: event.target.value,
//                       }))
//                     }
//                     className="w-full border border-gray-300 rounded-lg px-4 py-3"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-2">
//                     Quyền tài khoản
//                   </label>

//                   <span className="inline-flex px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-sm font-semibold">
//                     {roleLabel}
//                   </span>
//                 </div>

//                 <button
//                   type="submit"
//                   className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700"
//                 >
//                   <FiSave />
//                   Lưu thay đổi
//                 </button>
//               </form>
//             </div>
//           )}
//         </div>
//       </div>
//       <div className="max-w-5xl mx-auto px-4">
//         <div className="mb-7">
//           <h1 className="text-3xl font-bold text-gray-800">Tài khoản</h1>

//           <p className="mt-2 text-gray-500">
//             Quản lý thông tin cá nhân và bảo mật tài khoản.
//           </p>
//         </div>

//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//           {/* TAB */}

//           <div className="border-b border-gray-100 px-6 md:px-8">
//             <div>
//               <button
//                 type="button"
//                 onClick={() => selectTab("password")}
//                 className={`py-4 border-b-2 font-medium ${
//                   activeTab === "password"
//                     ? "border-pink-600 text-pink-600"
//                     : "border-transparent text-gray-500"
//                 }`}
//               >
//                 <FiLock className="inline mr-2" />
//                 Đổi mật khẩu
//               </button>
//             </div>
//           </div>

//           {/* =================================================
//               PASSWORD
//           ================================================= */}

//           {activeTab === "password" && (
//             <div className="p-6 md:p-8">
//               {passwordMessage && (
//                 <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
//                   {passwordMessage}
//                 </div>
//               )}

//               {passwordError && (
//                 <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
//                   {passwordError}
//                 </div>
//               )}

//               <form
//                 onSubmit={handlePasswordSubmit}
//                 className="max-w-xl space-y-5"
//               >
//                 {[
//                   [
//                     "currentPassword",
//                     "Mật khẩu hiện tại",
//                     showCurrent,
//                     setShowCurrent,
//                   ],
//                   ["newPassword", "Mật khẩu mới", showNew, setShowNew],
//                   [
//                     "confirmPassword",
//                     "Xác nhận mật khẩu mới",
//                     showConfirm,
//                     setShowConfirm,
//                   ],
//                 ].map(([name, label, visible, setVisible]) => (
//                   <div key={name}>
//                     <label className="block text-sm font-medium mb-2">
//                       {label} *
//                     </label>

//                     <div className="relative">
//                       <input
//                         type={visible ? "text" : "password"}
//                         value={passwordData[name]}
//                         onChange={(event) =>
//                           setPasswordData((current) => ({
//                             ...current,
//                             [name]: event.target.value,
//                           }))
//                         }
//                         required
//                         autoComplete="new-password"
//                         className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12"
//                       />

//                       <button
//                         type="button"
//                         onClick={() => setVisible((value) => !value)}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
//                       >
//                         {visible ? <FiEyeOff /> : <FiEye />}
//                       </button>
//                     </div>
//                   </div>
//                 ))}

//                 <p className="text-xs text-gray-500">
//                   Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường,
//                   số và ký tự đặc biệt.
//                 </p>

//                 <button
//                   type="submit"
//                   className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700"
//                 >
//                   <FiLock />
//                   Đổi mật khẩu
//                 </button>
//               </form>
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ProfilePage;

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { FiSave, FiUser } from "react-icons/fi";

import { useAuth } from "@/context/AuthContext";

const ProfilePage = () => {
  const { user, ROLE_LABELS, updateProfile } = useAuth();

  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    avatar: "",
  });

  const [profileMessage, setProfileMessage] = useState("");

  const [profileError, setProfileError] = useState("");

  /*
   * ==========================================================
   * KIỂM TRA USER
   * ==========================================================
   */

  useEffect(() => {
    if (!user) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    setProfile({
      name: user.name || user.fullName || "",
      phone: user.phone || "",
      avatar: user.avatar || "",
    });
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  /*
   * ==========================================================
   * ROLE
   * ==========================================================
   */

  const roleLabel =
    ROLE_LABELS?.[user.role] ||
    {
      admin: "Quản trị viên",
      manager: "Quản lý",
      product_manager: "Quản lý sản phẩm",
      customer: "Khách hàng",
    }[user.role] ||
    user.role;

  /*
   * ==========================================================
   * AVATAR
   * ==========================================================
   */

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setProfileError("");
    setProfileMessage("");

    if (!file.type.startsWith("image/")) {
      setProfileError("Vui lòng chọn file hình ảnh.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Ảnh đại diện không được vượt quá 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProfile((current) => ({
        ...current,
        avatar: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  /*
   * ==========================================================
   * UPDATE PROFILE
   * ==========================================================
   */

  const handleProfileSubmit = (event) => {
    event.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (!profile.name.trim()) {
      setProfileError("Vui lòng nhập họ và tên.");
      return;
    }

    const result = updateProfile({
      name: profile.name.trim(),
      phone: profile.phone.trim(),
      avatar: profile.avatar || "",
    });

    if (!result?.success) {
      setProfileError(result?.message || "Không thể cập nhật thông tin.");

      return;
    }

    setProfileMessage("Thông tin tài khoản đã được cập nhật.");
  };

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <section className="min-h-[70vh] bg-gray-50 py-10 md:py-14">
      <div className="max-w-3xl mx-auto px-4">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 text-pink-600 mb-4">
            <FiUser size={22} />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Thông tin tài khoản
          </h1>

          <p className="mt-2 text-gray-500">
            Xem và cập nhật thông tin cá nhân của bạn.
          </p>
        </div>

        {/* =================================================
            CARD
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            {/* =================================================
                MESSAGE
            ================================================= */}

            {profileMessage && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                {profileMessage}
              </div>
            )}

            {profileError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {profileError}
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleProfileSubmit}
              className="max-w-2xl mx-auto space-y-6"
            >
              {/* =================================================
                  AVATAR
              ================================================= */}

              <div className="flex flex-col items-center text-center pb-2">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center text-pink-600 text-3xl font-bold border-4 border-white shadow-md">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Ảnh đại diện"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (profile.name || "U").charAt(0).toUpperCase()
                  )}
                </div>

                <div className="mt-4">
                  <input
                    id="profile-avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />

                  <label
                    htmlFor="profile-avatar"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium cursor-pointer hover:bg-gray-50 hover:border-pink-400 hover:text-pink-600 transition"
                  >
                    Chọn ảnh đại diện
                  </label>

                  <p className="mt-2 text-xs text-gray-500">
                    JPG, PNG, WEBP · Tối đa 2MB
                  </p>
                </div>
              </div>

              {/* =================================================
                  NAME
              ================================================= */}

              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Họ và tên <span className="text-pink-600">*</span>
                </label>

                <input
                  id="profile-name"
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                  className="w-full h-12 border border-gray-300 rounded-xl px-4 text-gray-800 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  placeholder="Nhập họ và tên"
                />
              </div>

              {/* =================================================
                  EMAIL
              ================================================= */}

              <div>
                <label
                  htmlFor="profile-email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email
                </label>

                <input
                  id="profile-email"
                  value={user.email || ""}
                  disabled
                  className="w-full h-12 border border-gray-200 bg-gray-100 text-gray-500 rounded-xl px-4 cursor-not-allowed"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Email tài khoản không thể thay đổi.
                </p>
              </div>

              {/* =================================================
                  PHONE
              ================================================= */}

              <div>
                <label
                  htmlFor="profile-phone"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Số điện thoại
                </label>

                <input
                  id="profile-phone"
                  value={profile.phone}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  className="w-full h-12 border border-gray-300 rounded-xl px-4 text-gray-800 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              {/* =================================================
                  ROLE
              ================================================= */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quyền tài khoản
                </label>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 border border-pink-100 text-pink-600 text-sm font-semibold">
                  <FiUser size={16} />

                  {roleLabel}
                </div>
              </div>

              {/* =================================================
                  BUTTON
              ================================================= */}

              <div className="pt-2 flex justify-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 min-w-[180px] px-6 py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 active:bg-pink-800 transition shadow-sm hover:shadow-md"
                >
                  <FiSave size={18} />
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
