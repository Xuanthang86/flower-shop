// // // // import { useEffect, useRef, useState } from "react";
// // // // import {
// // // //   FiChevronDown,
// // // //   FiLogOut,
// // // //   FiPackage,
// // // //   FiSettings,
// // // //   FiUser,
// // // //   FiHeart,
// // // //   FiBox,
// // // //   FiKey,
// // // // } from "react-icons/fi";
// // // // import { Link, useNavigate } from "react-router-dom";
// // // // import { useAuth } from "@/context/AuthContext";

// // // // const UserMenu = () => {
// // // //   const { user, logout, ROLE_LABELS, isAdmin } = useAuth();

// // // //   const navigate = useNavigate();
// // // //   const [open, setOpen] = useState(false);
// // // //   const menuRef = useRef(null);

// // // //   useEffect(() => {
// // // //     const handleOutside = (event) => {
// // // //       if (menuRef.current && !menuRef.current.contains(event.target)) {
// // // //         setOpen(false);
// // // //       }
// // // //     };

// // // //     document.addEventListener("mousedown", handleOutside);

// // // //     return () => {
// // // //       document.removeEventListener("mousedown", handleOutside);
// // // //     };
// // // //   }, []);

// // // //   if (!user) {
// // // //     return (
// // // //       <Link
// // // //         to="/login"
// // // //         className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-pink-600 transition"
// // // //         title="Đăng nhập"
// // // //         aria-label="Đăng nhập"
// // // //       >
// // // //         <FiUser size={22} />
// // // //       </Link>
// // // //     );
// // // //   }

// // // //   const displayName = user.name || user.email || "Tài khoản";
// // // //   const roleLabel =
// // // //     ROLE_LABELS?.[user.role] ||
// // // //     {
// // // //       admin: "Quản trị viên",
// // // //       manager: "Quản lý",
// // // //       product_manager: "Quản lý sản phẩm",
// // // //       customer: "Khách hàng",
// // // //     }[user.role] ||
// // // //     user.role ||
// // // //     "Tài khoản";

// // // //   const isCustomer = user.role === "customer";
// // // //   const isManager = user.role === "manager";
// // // //   const isProductManager = user.role === "product_manager";

// // // //   const handleLogout = () => {
// // // //     setOpen(false);
// // // //     logout();

// // // //     navigate("/", {
// // // //       replace: true,
// // // //     });
// // // //   };

// // // //   const handleChangePassword = () => {
// // // //     setOpen(false);

// // // //     /*
// // // //       Dùng /profile thay vì tạo một route mới chưa được kiểm tra.
// // // //       ProfilePage có thể đọc location.state.tab === "password"
// // // //       để mở thẳng khu vực Đổi mật khẩu.
// // // //     */
// // // //     navigate("/profile", {
// // // //       state: {
// // // //         tab: "password",
// // // //       },
// // // //     });
// // // //   };

// // // //   return (
// // // //     <div ref={menuRef} className="relative">
// // // //       <button
// // // //         type="button"
// // // //         onClick={() => setOpen((current) => !current)}
// // // //         className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition"
// // // //         aria-haspopup="menu"
// // // //         aria-expanded={open}
// // // //         title="Tài khoản"
// // // //       >
// // // //         <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-semibold overflow-hidden">
// // // //           {user.avatar ? (
// // // //             <img
// // // //               src={user.avatar}
// // // //               alt={displayName}
// // // //               className="w-full h-full object-cover"
// // // //             />
// // // //           ) : (
// // // //             displayName.charAt(0).toUpperCase()
// // // //           )}
// // // //         </div>

// // // //         <div className="hidden lg:block text-left max-w-[150px]">
// // // //           <p className="text-sm font-semibold text-gray-800 truncate">
// // // //             {displayName}
// // // //           </p>
// // // //           <p className="text-xs text-gray-500 truncate">{roleLabel}</p>
// // // //         </div>

// // // //         <FiChevronDown
// // // //           size={16}
// // // //           className={open ? "rotate-180 transition" : "transition"}
// // // //         />
// // // //       </button>

// // // //       {open && (
// // // //         <div
// // // //           className="absolute right-0 top-full mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden"
// // // //           role="menu"
// // // //         >
// // // //           {/* HEADER TÀI KHOẢN */}
// // // //           <div className="px-4 py-4 bg-pink-50">
// // // //             <div className="flex items-center gap-3">
// // // //               <div className="w-12 h-12 shrink-0 rounded-full bg-pink-600 text-white flex items-center justify-center text-lg font-bold overflow-hidden">
// // // //                 {user.avatar ? (
// // // //                   <img
// // // //                     src={user.avatar}
// // // //                     alt={displayName}
// // // //                     className="w-full h-full object-cover"
// // // //                   />
// // // //                 ) : (
// // // //                   displayName.charAt(0).toUpperCase()
// // // //                 )}
// // // //               </div>

// // // //               <div className="min-w-0">
// // // //                 <p className="font-semibold text-gray-800 truncate">
// // // //                   {displayName}
// // // //                 </p>

// // // //                 <p className="text-sm text-gray-500 truncate">{user.email}</p>

// // // //                 <span className="inline-flex mt-1 px-2.5 py-1 rounded-full bg-pink-600 text-white text-xs font-medium">
// // // //                   {roleLabel}
// // // //                 </span>
// // // //               </div>
// // // //             </div>
// // // //           </div>

// // // //           {/* MENU */}
// // // //           <div className="py-2">
// // // //             {/* Tất cả tài khoản */}
// // // //             <Link
// // // //               to="/profile"
// // // //               state={{ tab: "info" }}
// // // //               onClick={() => setOpen(false)}
// // // //               className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition"
// // // //               role="menuitem"
// // // //             >
// // // //               <FiUser size={18} />
// // // //               <span>Thông tin tài khoản</span>
// // // //             </Link>

// // // //             <button
// // // //               type="button"
// // // //               onClick={handleChangePassword}
// // // //               className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-pink-50 transition"
// // // //               role="menuitem"
// // // //             >
// // // //               <FiKey size={18} />
// // // //               <span>Đổi mật khẩu</span>
// // // //             </button>

// // // //             {/* CUSTOMER ONLY */}
// // // //             {isCustomer && (
// // // //               <>
// // // //                 <Link
// // // //                   to="/orders"
// // // //                   onClick={() => setOpen(false)}
// // // //                   className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition"
// // // //                   role="menuitem"
// // // //                 >
// // // //                   <FiPackage size={18} />
// // // //                   <span>Đơn hàng của tôi</span>
// // // //                 </Link>

// // // //                 <Link
// // // //                   to="/wishlist"
// // // //                   onClick={() => setOpen(false)}
// // // //                   className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition"
// // // //                   role="menuitem"
// // // //                 >
// // // //                   <FiHeart size={18} />
// // // //                   <span>Sản phẩm yêu thích</span>
// // // //                 </Link>
// // // //               </>
// // // //             )}

// // // //             {/* MANAGER + ADMIN */}
// // // //             {(isAdmin || isManager) && (
// // // //               <Link
// // // //                 to="/admin/orders"
// // // //                 onClick={() => setOpen(false)}
// // // //                 className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition"
// // // //                 role="menuitem"
// // // //               >
// // // //                 <FiPackage size={18} />
// // // //                 <span>Quản lý đơn hàng</span>
// // // //               </Link>
// // // //             )}

// // // //             {/* PRODUCT MANAGER + ADMIN */}
// // // //             {(isAdmin || isProductManager) && (
// // // //               <Link
// // // //                 to="/admin"
// // // //                 onClick={() => setOpen(false)}
// // // //                 className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition"
// // // //                 role="menuitem"
// // // //               >
// // // //                 <FiBox size={18} />
// // // //                 <span>Quản lý sản phẩm</span>
// // // //               </Link>
// // // //             )}

// // // //             {/* ADMIN ONLY */}
// // // //             {isAdmin && (
// // // //               <Link
// // // //                 to="/admin/users"
// // // //                 onClick={() => setOpen(false)}
// // // //                 className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition"
// // // //                 role="menuitem"
// // // //               >
// // // //                 <FiSettings size={18} />
// // // //                 <span>Quản lý tài khoản</span>
// // // //               </Link>
// // // //             )}
// // // //           </div>

// // // //           {/* LOGOUT */}
// // // //           <div className="border-t border-gray-100">
// // // //             <button
// // // //               type="button"
// // // //               onClick={handleLogout}
// // // //               className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition"
// // // //               role="menuitem"
// // // //             >
// // // //               <FiLogOut size={18} />
// // // //               <span>Đăng xuất</span>
// // // //             </button>
// // // //           </div>
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // };

// // // // export default UserMenu;

// // // import { useEffect, useRef, useState } from "react";

// // // import { Link, useNavigate } from "react-router-dom";

// // // import {
// // //   FiBox,
// // //   FiHeart,
// // //   FiKey,
// // //   FiLogOut,
// // //   FiPackage,
// // //   FiSettings,
// // //   FiUser,
// // // } from "react-icons/fi";

// // // import { useAuth } from "@/context/AuthContext";

// // // const UserMenu = () => {
// // //   const { user, logout, isAdmin, isManager, isProductManager } = useAuth();

// // //   const navigate = useNavigate();

// // //   const [open, setOpen] = useState(false);

// // //   const menuRef = useRef(null);

// // //   useEffect(() => {
// // //     const handleOutside = (event) => {
// // //       if (menuRef.current && !menuRef.current.contains(event.target)) {
// // //         setOpen(false);
// // //       }
// // //     };

// // //     document.addEventListener("mousedown", handleOutside);

// // //     return () => document.removeEventListener("mousedown", handleOutside);
// // //   }, []);

// // //   if (!user) {
// // //     return (
// // //       <Link
// // //         to="/login"
// // //         className="flex items-center gap-2 text-gray-700 hover:text-pink-600"
// // //       >
// // //         <FiUser />
// // //         Đăng nhập
// // //       </Link>
// // //     );
// // //   }

// // //   const displayName = user.name || user.fullName || user.email || "Tài khoản";

// // //   const avatar = user.avatar || "";

// // //   const handleLogout = () => {
// // //     setOpen(false);
// // //     logout();
// // //     navigate("/", {
// // //       replace: true,
// // //     });
// // //   };

// // //   const closeMenu = () => {
// // //     setOpen(false);
// // //   };

// // //   return (
// // //     <div ref={menuRef} className="relative">
// // //       <button
// // //         type="button"
// // //         onClick={() => setOpen((value) => !value)}
// // //         className="flex items-center gap-2"
// // //       >
// // //         {avatar ? (
// // //           <img
// // //             src={avatar}
// // //             alt={displayName}
// // //             className="w-9 h-9 rounded-full object-cover border"
// // //           />
// // //         ) : (
// // //           <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-semibold">
// // //             {displayName.charAt(0).toUpperCase()}
// // //           </div>
// // //         )}

// // //         <span className="hidden md:block max-w-[140px] truncate">
// // //           {displayName}
// // //         </span>

// // //         <span>▾</span>
// // //       </button>

// // //       {open && (
// // //         <div className="absolute right-0 top-full mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
// // //           <div className="px-4 py-4 bg-pink-50">
// // //             <p className="font-semibold text-gray-800 truncate">
// // //               {displayName}
// // //             </p>

// // //             <p className="text-sm text-gray-500 truncate">{user.email}</p>
// // //           </div>

// // //           <div className="py-2">
// // //             <Link
// // //               to="/profile?tab=info"
// // //               onClick={closeMenu}
// // //               className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
// // //             >
// // //               <FiUser />
// // //               Thông tin tài khoản
// // //             </Link>

// // //             {/* QUAN TRỌNG */}

// // //             <Link
// // //               to="/profile?tab=password"
// // //               state={{
// // //                 tab: "password",
// // //               }}
// // //               onClick={closeMenu}
// // //               className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
// // //             >
// // //               <FiKey />
// // //               Đổi mật khẩu
// // //             </Link>

// // //             {user.role === "customer" && (
// // //               <>
// // //                 <Link
// // //                   to="/orders"
// // //                   onClick={closeMenu}
// // //                   className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
// // //                 >
// // //                   <FiPackage />
// // //                   Đơn hàng của tôi
// // //                 </Link>

// // //                 <Link
// // //                   to="/wishlist"
// // //                   onClick={closeMenu}
// // //                   className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
// // //                 >
// // //                   <FiHeart />
// // //                   Sản phẩm yêu thích
// // //                 </Link>
// // //               </>
// // //             )}

// // //             {(isAdmin || isManager) && (
// // //               <Link
// // //                 to="/admin/orders"
// // //                 onClick={closeMenu}
// // //                 className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
// // //               >
// // //                 <FiPackage />
// // //                 Quản lý đơn hàng
// // //               </Link>
// // //             )}

// // //             {(isAdmin || isProductManager) && (
// // //               <Link
// // //                 to="/admin/products"
// // //                 onClick={closeMenu}
// // //                 className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
// // //               >
// // //                 <FiBox />
// // //                 Quản lý sản phẩm
// // //               </Link>
// // //             )}

// // //             {isAdmin && (
// // //               <Link
// // //                 to="/admin/users"
// // //                 onClick={closeMenu}
// // //                 className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
// // //               >
// // //                 <FiSettings />
// // //                 Quản lý tài khoản
// // //               </Link>
// // //             )}
// // //           </div>

// // //           <div className="border-t border-gray-100">
// // //             <button
// // //               type="button"
// // //               onClick={handleLogout}
// // //               className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50"
// // //             >
// // //               <FiLogOut />
// // //               Đăng xuất
// // //             </button>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default UserMenu;

// // import { useEffect, useRef, useState } from "react";

// // import { Link, useNavigate } from "react-router-dom";

// // import {
// //   FiBox,
// //   FiHeart,
// //   FiKey,
// //   FiLogOut,
// //   FiPackage,
// //   FiSettings,
// //   FiUser,
// // } from "react-icons/fi";

// // import { useAuth } from "@/context/AuthContext";

// // const UserMenu = () => {
// //   const { user, logout, isAdmin, isManager, isProductManager } = useAuth();

// //   const navigate = useNavigate();

// //   const [open, setOpen] = useState(false);

// //   const menuRef = useRef(null);

// //   useEffect(() => {
// //     const handleOutside = (event) => {
// //       if (menuRef.current && !menuRef.current.contains(event.target)) {
// //         setOpen(false);
// //       }
// //     };

// //     document.addEventListener("mousedown", handleOutside);

// //     return () => {
// //       document.removeEventListener("mousedown", handleOutside);
// //     };
// //   }, []);

// //   if (!user) {
// //     return (
// //       <Link
// //         to="/login"
// //         className="flex items-center gap-2 text-gray-700 hover:text-pink-600"
// //       >
// //         <FiUser />
// //         Đăng nhập
// //       </Link>
// //     );
// //   }

// //   const displayName = user.name || user.fullName || user.email || "Tài khoản";

// //   const avatar = user.avatar || "";

// //   const handleLogout = () => {
// //     setOpen(false);

// //     logout();

// //     navigate("/", {
// //       replace: true,
// //     });
// //   };

// //   const closeMenu = () => {
// //     setOpen(false);
// //   };

// //   return (
// //     <div ref={menuRef} className="relative">
// //       {/* USER BUTTON */}
// //       <button
// //         type="button"
// //         onClick={() => setOpen((value) => !value)}
// //         className="flex items-center gap-2"
// //       >
// //         {avatar ? (
// //           <img
// //             src={avatar}
// //             alt={displayName}
// //             className="w-9 h-9 rounded-full object-cover border"
// //           />
// //         ) : (
// //           <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-semibold">
// //             {displayName.charAt(0).toUpperCase()}
// //           </div>
// //         )}

// //         <span className="hidden md:block max-w-[140px] truncate">
// //           {displayName}
// //         </span>

// //         <span>▾</span>
// //       </button>

// //       {/* DROPDOWN MENU */}
// //       {open && (
// //         <div className="absolute right-0 top-full mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
// //           {/* USER HEADER */}
// //           <div className="px-4 py-4 bg-pink-50">
// //             <p className="font-semibold text-gray-800 truncate">
// //               {displayName}
// //             </p>

// //             <p className="text-sm text-gray-500 truncate">{user.email}</p>
// //           </div>

// //           <div className="py-2">
// //             {/* =================================================
// //                 THÔNG TIN TÀI KHOẢN
// //             ================================================= */}

// //             <Link
// //               to="/profile"
// //               onClick={closeMenu}
// //               className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
// //             >
// //               <FiUser />

// //               <span>Thông tin tài khoản</span>
// //             </Link>

// //             {/* =================================================
// //                 ĐỔI MẬT KHẨU
// //             ================================================= */}

// //             <Link
// //               to="/change-password"
// //               onClick={closeMenu}
// //               className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
// //             >
// //               <FiKey />

// //               <span>Đổi mật khẩu</span>
// //             </Link>

// //             {/* =================================================
// //                 CUSTOMER
// //             ================================================= */}

// //             {user.role === "customer" && (
// //               <>
// //                 <Link
// //                   to="/orders"
// //                   onClick={closeMenu}
// //                   className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
// //                 >
// //                   <FiPackage />

// //                   <span>Đơn hàng của tôi</span>
// //                 </Link>

// //                 <Link
// //                   to="/wishlist"
// //                   onClick={closeMenu}
// //                   className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
// //                 >
// //                   <FiHeart />

// //                   <span>Sản phẩm yêu thích</span>
// //                 </Link>
// //               </>
// //             )}

// //             {/* =================================================
// //                 QUẢN LÝ ĐƠN HÀNG
// //             ================================================= */}

// //             {(isAdmin || isManager) && (
// //               <Link
// //                 to="/admin/orders"
// //                 onClick={closeMenu}
// //                 className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
// //               >
// //                 <FiPackage />

// //                 <span>Quản lý đơn hàng</span>
// //               </Link>
// //             )}

// //             {/* =================================================
// //                 QUẢN LÝ SẢN PHẨM
// //             ================================================= */}

// //             {(isAdmin || isProductManager) && (
// //               <Link
// //                 to="/admin/products"
// //                 onClick={closeMenu}
// //                 className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
// //               >
// //                 <FiBox />

// //                 <span>Quản lý sản phẩm</span>
// //               </Link>
// //             )}

// //             {/* =================================================
// //                 QUẢN LÝ TÀI KHOẢN
// //             ================================================= */}

// //             {isAdmin && (
// //               <Link
// //                 to="/admin/users"
// //                 onClick={closeMenu}
// //                 className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
// //               >
// //                 <FiSettings />

// //                 <span>Quản lý tài khoản</span>
// //               </Link>
// //             )}
// //           </div>

// //           {/* LOGOUT */}
// //           <div className="border-t border-gray-100">
// //             <button
// //               type="button"
// //               onClick={handleLogout}
// //               className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50"
// //             >
// //               <FiLogOut />

// //               <span>Đăng xuất</span>
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default UserMenu;

// import { useEffect, useRef, useState } from "react";

// import { Link, useNavigate } from "react-router-dom";

// import {
//   FiBox,
//   FiHeart,
//   FiKey,
//   FiLogOut,
//   FiPackage,
//   FiSettings,
//   FiUser,
// } from "react-icons/fi";

// import { useAuth } from "@/context/AuthContext";

// const UserMenu = () => {
//   const { user, logout, isAdmin, isManager, isProductManager, ROLE_LABELS } =
//     useAuth();

//   const navigate = useNavigate();

//   const [open, setOpen] = useState(false);

//   const menuRef = useRef(null);

//   /*
//    * ==========================================================
//    * ĐÓNG MENU KHI CLICK RA NGOÀI
//    * ==========================================================
//    */

//   useEffect(() => {
//     const handleOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleOutside);
//     };
//   }, []);

//   /*
//    * ==========================================================
//    * CHƯA ĐĂNG NHẬP
//    * ==========================================================
//    */

//   if (!user) {
//     return (
//       <Link
//         to="/login"
//         className="flex items-center gap-2 text-gray-700 hover:text-pink-600"
//       >
//         <FiUser />

//         <span>Đăng nhập</span>
//       </Link>
//     );
//   }

//   /*
//    * ==========================================================
//    * TÊN HIỂN THỊ
//    * ==========================================================
//    */

//   const displayName = user.name || user.fullName || user.email || "Tài khoản";

//   /*
//    * ==========================================================
//    * AVATAR
//    * ==========================================================
//    */

//   const avatar = user.avatar || "";

//   /*
//    * ==========================================================
//    * TÊN QUYỀN
//    * ==========================================================
//    */

//   const roleLabel =
//     ROLE_LABELS?.[user.role] ||
//     {
//       admin: "Quản trị viên",
//       manager: "Quản lý",
//       product_manager: "Quản lý sản phẩm",
//       customer: "Khách hàng",
//     }[user.role] ||
//     user.role ||
//     "Khách hàng";

//   /*
//    * ==========================================================
//    * LOGOUT
//    * ==========================================================
//    */

//   const handleLogout = () => {
//     setOpen(false);

//     logout();

//     navigate("/", {
//       replace: true,
//     });
//   };

//   /*
//    * ==========================================================
//    * ĐÓNG MENU
//    * ==========================================================
//    */

//   const closeMenu = () => {
//     setOpen(false);
//   };

//   /*
//    * ==========================================================
//    * RENDER
//    * ==========================================================
//    */

//   return (
//     <div ref={menuRef} className="relative">
//       {/* =====================================================
//           USER BUTTON
//       ===================================================== */}

//       <button
//         type="button"
//         onClick={() => setOpen((value) => !value)}
//         className="flex items-center gap-3 py-1.5"
//       >
//         {/* AVATAR */}

//         {avatar ? (
//           <img
//             src={avatar}
//             alt={displayName}
//             className="w-9 h-9 rounded-full object-cover border border-pink-100"
//           />
//         ) : (
//           <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-semibold">
//             {displayName.charAt(0).toUpperCase()}
//           </div>
//         )}

//         {/* =================================================
//             NAME + ROLE
//         ================================================= */}

//         <div className="hidden md:flex flex-col items-start leading-tight max-w-[160px] text-left">
//           <span className="font-medium text-gray-800 truncate w-full">
//             {displayName}
//           </span>

//           <span className="text-xs text-pink-600 font-medium truncate w-full mt-0.5">
//             {roleLabel}
//           </span>
//         </div>

//         {/* ARROW */}

//         <span
//           className={`text-gray-500 text-sm transition-transform duration-200 ${
//             open ? "rotate-180" : ""
//           }`}
//         >
//           ▾
//         </span>
//       </button>

//       {/* =====================================================
//           DROPDOWN
//       ===================================================== */}

//       {open && (
//         <div className="absolute right-0 top-full mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
//           {/* =================================================
//               USER HEADER
//           ================================================= */}

//           <div className="px-4 py-4 bg-pink-50">
//             <div className="flex items-center gap-3">
//               {avatar ? (
//                 <img
//                   src={avatar}
//                   alt={displayName}
//                   className="w-11 h-11 rounded-full object-cover border border-pink-200"
//                 />
//               ) : (
//                 <div className="w-11 h-11 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-semibold">
//                   {displayName.charAt(0).toUpperCase()}
//                 </div>
//               )}

//               <div className="min-w-0">
//                 <p className="font-semibold text-gray-800 truncate">
//                   {displayName}
//                 </p>

//                 <p className="text-xs font-medium text-pink-600 mt-0.5">
//                   {roleLabel}
//                 </p>

//                 <p className="text-sm text-gray-500 truncate mt-0.5">
//                   {user.email}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* =================================================
//               MENU
//           ================================================= */}

//           <div className="py-2">
//             {/* THÔNG TIN TÀI KHOẢN */}

//             <Link
//               to="/profile"
//               onClick={closeMenu}
//               className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition"
//             >
//               <FiUser />

//               <span>Thông tin tài khoản</span>
//             </Link>

//             {/* ĐỔI MẬT KHẨU */}

//             <Link
//               to="/change-password"
//               onClick={closeMenu}
//               className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition"
//             >
//               <FiKey />

//               <span>Đổi mật khẩu</span>
//             </Link>

//             {/* =================================================
//                 CUSTOMER
//             ================================================= */}

//             {user.role === "customer" && (
//               <>
//                 <Link
//                   to="/orders"
//                   onClick={closeMenu}
//                   className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition"
//                 >
//                   <FiPackage />

//                   <span>Đơn hàng của tôi</span>
//                 </Link>

//                 <Link
//                   to="/wishlist"
//                   onClick={closeMenu}
//                   className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition"
//                 >
//                   <FiHeart />

//                   <span>Sản phẩm yêu thích</span>
//                 </Link>
//               </>
//             )}

//             {/* =================================================
//                 QUẢN LÝ ĐƠN HÀNG
//             ================================================= */}

//             {(isAdmin || isManager) && (
//               <Link
//                 to="/admin/orders"
//                 onClick={closeMenu}
//                 className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition"
//               >
//                 <FiPackage />

//                 <span>Quản lý đơn hàng</span>
//               </Link>
//             )}

//             {/* =================================================
//                 QUẢN LÝ SẢN PHẨM
//             ================================================= */}

//             {(isAdmin || isProductManager) && (
//               <Link
//                 to="/admin/products"
//                 onClick={closeMenu}
//                 className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition"
//               >
//                 <FiBox />

//                 <span>Quản lý sản phẩm</span>
//               </Link>
//             )}

//             {/* =================================================
//                 QUẢN LÝ TÀI KHOẢN
//             ================================================= */}

//             {isAdmin && (
//               <Link
//                 to="/admin/users"
//                 onClick={closeMenu}
//                 className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition"
//               >
//                 <FiSettings />

//                 <span>Quản lý tài khoản</span>
//               </Link>
//             )}
//           </div>

//           {/* =================================================
//               LOGOUT
//           ================================================= */}

//           <div className="border-t border-gray-100">
//             <button
//               type="button"
//               onClick={handleLogout}
//               className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition"
//             >
//               <FiLogOut />

//               <span>Đăng xuất</span>
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserMenu;

/*
============================================================
FLOWER SHOP — USER MENU
============================================================

CUSTOMER:
- Thông tin tài khoản
- Đổi mật khẩu
- Đơn hàng
- Yêu thích

ADMIN:
- Thông tin tài khoản
- Đổi mật khẩu
- Quản lý đơn hàng
- Quản lý sản phẩm
- Quản lý tài khoản
- Tùy chỉnh giao diện
============================================================
*/

import { useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  FiBox,
  FiChevronDown,
  FiHeart,
  FiKey,
  FiLayout,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiUser,
} from "react-icons/fi";

import { ROLE_LABELS, ROLES, useAuth } from "@/context/AuthContext";

const UserMenu = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, []);

  if (!user) {
    return (
      <Link
        to="/login"
        className="flex h-10 items-center gap-2 rounded-lg px-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600"
        title="Đăng nhập"
      >
        <FiUser size={22} />
        <span className="hidden lg:inline">Đăng nhập</span>
      </Link>
    );
  }

  const roleLabel = ROLE_LABELS?.[user.role] || user.role || "Tài khoản";

  const displayName = user.name || user.fullName || user.email || "Tài khoản";

  const isAdmin = user.role === ROLES.ADMIN;

  const isManager = user.role === ROLES.MANAGER;

  const isProductManager = user.role === ROLES.PRODUCT_MANAGER;

  const isCustomer = user.role === ROLES.CUSTOMER;

  const close = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    close();

    logout();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-gray-700 hover:bg-pink-50 hover:text-pink-600"
        aria-expanded={open}
      >
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-pink-100 font-semibold text-pink-600">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>

        <div className="hidden max-w-[140px] text-left lg:block">
          <p className="truncate text-sm font-semibold text-gray-800">
            {displayName}
          </p>

          <p className="truncate text-xs text-gray-500">{roleLabel}</p>
        </div>

        <FiChevronDown
          size={16}
          className={open ? "rotate-180 transition" : "transition"}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[100] mt-3 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="bg-pink-50 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pink-600 text-lg font-bold text-white">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-800">
                  {displayName}
                </p>

                <p className="truncate text-sm text-gray-500">{user.email}</p>

                <span className="mt-1 inline-flex rounded-full bg-pink-600 px-2.5 py-1 text-xs font-medium text-white">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="py-2">
            <Link
              to="/profile"
              state={{ tab: "info" }}
              onClick={close}
              className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
            >
              <FiUser size={18} />
              <span>Thông tin tài khoản</span>
            </Link>

            <Link
              to="/profile"
              state={{
                tab: "password",
              }}
              onClick={close}
              className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
            >
              <FiKey size={18} />
              <span>Đổi mật khẩu</span>
            </Link>

            {isCustomer && (
              <>
                <Link
                  to="/orders"
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
                >
                  <FiPackage size={18} />
                  <span>Đơn hàng của tôi</span>
                </Link>

                <Link
                  to="/wishlist"
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
                >
                  <FiHeart size={18} />
                  <span>Sản phẩm yêu thích</span>
                </Link>
              </>
            )}

            {(isAdmin || isManager) && (
              <Link
                to="/admin/orders"
                onClick={close}
                className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
              >
                <FiPackage size={18} />
                <span>Quản lý đơn hàng</span>
              </Link>
            )}

            {(isAdmin || isProductManager) && (
              <Link
                to="/admin/products"
                onClick={close}
                className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
              >
                <FiBox size={18} />
                <span>Quản lý sản phẩm</span>
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin/users"
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"
                >
                  <FiSettings size={18} />
                  <span>Quản lý tài khoản</span>
                </Link>

                <Link
                  to="/admin/appearance"
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-3 font-semibold text-pink-600 hover:bg-pink-50"
                >
                  <FiLayout size={18} />
                  <span>Tùy chỉnh giao diện</span>
                </Link>
              </>
            )}
          </div>

          <div className="border-t border-gray-100">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50"
            >
              <FiLogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
