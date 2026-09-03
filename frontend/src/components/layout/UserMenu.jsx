import { useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  FiBox,
  FiChevronDown,
  FiChevronRight,
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
  "flex w-full items-center gap-3 px-4 py-3 text-left text-gray-700 transition hover:bg-pink-50 hover:text-pink-600";

const UserMenu = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const [managementOpen, setManagementOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
        setManagementOpen(false);
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
        className="flex h-10 items-center justify-center rounded-lg px-2 text-gray-700 transition hover:bg-pink-50 hover:text-pink-600"
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

  const hasManagementAccess =
    canManageOrders ||
    canManageProducts ||
    canManageBlog ||
    canManageImages ||
    canManageUsers;

  const closeMenu = () => {
    setOpen(false);
    setManagementOpen(false);
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
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-gray-700 transition hover:bg-pink-50 hover:text-pink-600"
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

        <FiChevronDown
          size={16}
          className={open ? "rotate-180 transition" : "transition"}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[100] mt-3 w-80 overflow-visible rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="overflow-hidden rounded-t-xl bg-pink-50 px-4 py-4">
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

          <div className="py-2">
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

            {hasManagementAccess && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setManagementOpen((value) => !value)}
                  className={menuItemClass}
                >
                  <FiSettings size={18} />

                  <span className="flex-1">Quản lý</span>

                  <FiChevronRight
                    size={17}
                    className={
                      managementOpen ? "rotate-90 transition" : "transition"
                    }
                  />
                </button>

                {managementOpen && (
                  <div className="ml-4 border-l border-pink-100 py-1">
                    {canManageOrders && (
                      <Link
                        to="/admin/orders"
                        onClick={closeMenu}
                        className={menuItemClass}
                      >
                        <FiPackage size={17} />
                        <span>Quản lý đơn hàng</span>
                      </Link>
                    )}

                    {canManageProducts && (
                      <Link
                        to="/admin/products"
                        onClick={closeMenu}
                        className={menuItemClass}
                      >
                        <FiBox size={17} />
                        <span>Quản lý sản phẩm</span>
                      </Link>
                    )}

                    {canManageBlog && (
                      <Link
                        to="/admin/blog"
                        onClick={closeMenu}
                        className={menuItemClass}
                      >
                        <FiEditIcon />
                        <span>Quản lý bài viết</span>
                      </Link>
                    )}

                    {canManageImages && (
                      <Link
                        to="/admin/images"
                        onClick={closeMenu}
                        className={menuItemClass}
                      >
                        <FiImage size={17} />
                        <span>Quản lý hình ảnh</span>
                      </Link>
                    )}

                    {canManageUsers && (
                      <Link
                        to="/admin/users"
                        onClick={closeMenu}
                        className={menuItemClass}
                      >
                        <FiUser size={17} />
                        <span>Quản lý tài khoản</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
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
              className="flex w-full items-center gap-3 rounded-b-xl px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
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
