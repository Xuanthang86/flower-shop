import { useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiBox,
  FiHeart,
  FiImage,
  FiKey,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiUser,
} from "react-icons/fi";

import { ROLE_LABELS, ROLES, useAuth } from "@/context/AuthContext";

const menuItemClass =
  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-700 transition hover:bg-pink-50 hover:text-pink-600";

const managementCardClass =
  "flex min-h-[110px] flex-col items-center justify-center gap-3 rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600";

const UserMenu = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [managementView, setManagementView] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
        setManagementView(false);
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
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-pink-50 hover:text-pink-600"
        title="Đăng nhập"
        aria-label="Đăng nhập"
      >
        <FiUser size={22} />
      </Link>
    );
  }

  const displayName = user.name || user.fullName || user.email || "Tài khoản";

  const roleLabel = ROLE_LABELS?.[user.role] || user.role || "Tài khoản";

  const avatar = user.avatar || user.photoURL || "";

  const isAdmin = user.role === ROLES.ADMIN;
  const isManager = user.role === ROLES.MANAGER;
  const isProductManager = user.role === ROLES.PRODUCT_MANAGER;
  const isCustomer = user.role === ROLES.CUSTOMER;

  const canManageOrders = isAdmin || isManager;

  const canManageProducts = isAdmin || isProductManager;

  const canManageBlog = isAdmin;
  const canManageImages = isAdmin;
  const canManageUsers = isAdmin;

  const managementItems = [
    canManageOrders && {
      to: "/admin/orders",
      label: "Quản lý đơn hàng",
      icon: FiPackage,
    },

    canManageProducts && {
      to: "/admin/products",
      label: "Quản lý sản phẩm",
      icon: FiBox,
    },

    canManageBlog && {
      to: "/admin/blog",
      label: "Quản lý bài viết",
      icon: FiEditIcon,
    },

    canManageImages && {
      to: "/admin/images",
      label: "Quản lý hình ảnh",
      icon: FiImage,
    },

    canManageUsers && {
      to: "/admin/users",
      label: "Quản lý tài khoản",
      icon: FiUser,
    },
  ].filter(Boolean);

  const closeMenu = () => {
    setOpen(false);
    setManagementView(false);
  };

  const handleLogout = () => {
    closeMenu();

    logout();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setManagementView(false);
        }}
        className="flex h-10 items-center gap-2 rounded-lg px-2 text-gray-700 transition hover:bg-pink-50 hover:text-pink-600"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-pink-100 font-semibold text-pink-600">
          {avatar ? (
            <img
              src={avatar}
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
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[120] mt-3 w-[360px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* HEADER */}
          <div className="bg-pink-50 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pink-600 text-lg font-bold text-white">
                {avatar ? (
                  <img
                    src={avatar}
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

          {!managementView ? (
            <>
              <div className="p-2">
                <Link
                  to="/profile"
                  state={{ tab: "info" }}
                  onClick={closeMenu}
                  className={menuItemClass}
                >
                  <FiUser size={18} />
                  <span>Thông tin tài khoản</span>
                </Link>

                <Link
                  to="/profile"
                  state={{ tab: "password" }}
                  onClick={closeMenu}
                  className={menuItemClass}
                >
                  <FiKey size={18} />
                  <span>Đổi mật khẩu</span>
                </Link>

                {isCustomer && (
                  <>
                    <Link
                      to="/orders"
                      onClick={closeMenu}
                      className={menuItemClass}
                    >
                      <FiPackage size={18} />
                      <span>Đơn hàng của tôi</span>
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={closeMenu}
                      className={menuItemClass}
                    >
                      <FiHeart size={18} />
                      <span>Sản phẩm yêu thích</span>
                    </Link>
                  </>
                )}

                {managementItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setManagementView(true)}
                    className={menuItemClass}
                  >
                    <FiSettings size={18} />
                    <span>Quản lý</span>
                  </button>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/appearance"
                    onClick={closeMenu}
                    className={menuItemClass}
                  >
                    <FiSettings size={18} />
                    <span>Tùy chỉnh giao diện</span>
                  </Link>
                )}
              </div>

              <div className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-b-2xl px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
                >
                  <FiLogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* MANAGEMENT VIEW */}
              <div className="p-4">
                <button
                  type="button"
                  onClick={() => setManagementView(false)}
                  className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-pink-600"
                >
                  <FiArrowLeft size={17} />
                  Quay lại
                </button>

                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Quản lý
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {managementItems.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={closeMenu}
                      className={managementCardClass}
                    >
                      <Icon size={25} className="text-pink-600" />

                      <span className="text-sm font-semibold leading-5">
                        {label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-b-2xl px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
                >
                  <FiLogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const FiEditIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export default UserMenu;
