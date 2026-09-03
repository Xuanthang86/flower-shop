import { useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  FiHeart,
  FiKey,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiUser,
} from "react-icons/fi";

import { ROLE_LABELS, ROLES, useAuth } from "@/context/AuthContext";

const menuItemClass =
  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-700 transition hover:bg-pink-50 hover:text-pink-600";

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
        className="flex items-center gap-2 rounded-lg px-2 py-2 text-gray-700 transition hover:bg-pink-50 hover:text-pink-600"
        title="Đăng nhập"
        aria-label="Đăng nhập"
      >
        <FiUser size={22} />

        <span className="hidden text-sm font-medium sm:inline">Đăng nhập</span>
      </Link>
    );
  }

  const displayName = user.name || user.fullName || user.email || "Tài khoản";

  const roleLabel = ROLE_LABELS?.[user.role] || user.role || "Tài khoản";

  const avatar = user.avatar || user.photoURL || "";

  const isAdmin = user.role === ROLES.ADMIN;
  const isCustomer = user.role === ROLES.CUSTOMER;

  const canManage =
    user.role === ROLES.ADMIN ||
    user.role === ROLES.MANAGER ||
    user.role === ROLES.PRODUCT_MANAGER;

  const closeMenu = () => {
    setOpen(false);
  };

  const goToManagement = () => {
    closeMenu();
    navigate("/admin");
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
        className="flex h-10 items-center gap-2 rounded-lg px-2 text-gray-700 transition hover:bg-pink-50 hover:text-pink-600"
        aria-expanded={open}
        aria-haspopup="menu"
        title="Thông tin tài khoản"
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
        <div className="absolute right-0 top-full z-[120] mt-3 w-[330px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* ACCOUNT HEADER */}
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

          {/* MENU */}
          <div className="p-2">
            <Link to="/profile" onClick={closeMenu} className={menuItemClass}>
              <FiUser size={18} />
              <span>Thông tin tài khoản</span>
            </Link>

            <Link
              to="/change-password"
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

            {canManage && (
              <button
                type="button"
                onClick={goToManagement}
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

          {/* LOGOUT */}
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
        </div>
      )}
    </div>
  );
};

export default UserMenu;
