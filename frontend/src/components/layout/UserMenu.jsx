import { useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  FiBox,
  FiChevronDown,
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
  "flex items-center gap-3 px-4 py-3 text-gray-700 transition hover:bg-pink-50 hover:text-pink-600";

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

  const closeMenu = () => {
    setOpen(false);
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
        <div className="absolute right-0 top-full z-[100] mt-3 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
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

            {(isAdmin || isManager) && (
              <Link
                to="/admin/orders"
                onClick={closeMenu}
                className={menuItemClass}
              >
                <FiPackage size={18} />
                <span>Quản lý đơn hàng</span>
              </Link>
            )}

            {(isAdmin || isProductManager) && (
              <Link
                to="/admin/products"
                onClick={closeMenu}
                className={menuItemClass}
              >
                <FiBox size={18} />
                <span>Quản lý sản phẩm</span>
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin/users"
                  onClick={closeMenu}
                  className={menuItemClass}
                >
                  <FiSettings size={18} />
                  <span>Quản lý tài khoản</span>
                </Link>

                <Link
                  to="/admin/images"
                  onClick={closeMenu}
                  className={menuItemClass}
                >
                  <FiImage size={18} />
                  <span>Quản lý hình ảnh</span>
                </Link>

                <Link
                  to="/admin/appearance"
                  onClick={closeMenu}
                  className={menuItemClass}
                >
                  <FiSettings size={18} />
                  <span>Tùy chỉnh giao diện</span>
                </Link>
              </>
            )}
          </div>

          <div className="border-t border-gray-100">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
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
