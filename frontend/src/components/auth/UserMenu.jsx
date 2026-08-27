import { useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

const UserMenu = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);

  /*
  =========================================================
  ĐÓNG MENU KHI CLICK RA NGOÀI
  =========================================================
  */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
  =========================================================
  CHƯA ĐĂNG NHẬP
  =========================================================
  */

  if (!user) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition"
      >
        👤
        <span>Đăng nhập</span>
      </Link>
    );
  }

  /*
  =========================================================
  LOGOUT
  =========================================================
  */

  const handleLogout = () => {
    setOpen(false);

    logout();

    navigate("/");
  };

  /*
  =========================================================
  AVATAR
  =========================================================
  */

  const avatar = user.avatar || user.photoURL || "";

  const displayName = user.name || user.fullName || user.email || "Tài khoản";

  return (
    <div ref={menuRef} className="relative">
      {/* BUTTON */}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 hover:text-pink-600 transition"
      >
        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className="w-9 h-9 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        <span className="hidden md:block max-w-[140px] truncate">
          {displayName}
        </span>

        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {/* MENU */}

      {open && (
        <div className="absolute right-0 top-full mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* USER INFO */}

          <div className="px-4 py-4 bg-pink-50">
            <div className="flex items-center gap-3">
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center text-lg font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {displayName}
                </p>

                <p className="text-sm text-gray-500 truncate">{user.email}</p>

                {user.role === "admin" && (
                  <span className="inline-block mt-1 text-xs bg-pink-600 text-white px-2 py-0.5 rounded-full">
                    Quản trị viên
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* LINKS */}

          <div className="py-2">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 hover:bg-pink-50 transition"
            >
              👤 Thông tin tài khoản
            </Link>

            <Link
              to="/orders"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 hover:bg-pink-50 transition"
            >
              📦 Đơn hàng của tôi
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 hover:bg-pink-50 transition"
            >
              ❤️ Sản phẩm yêu thích
            </Link>
          </div>

          {/* LOGOUT */}

          <div className="border-t border-gray-100">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition"
            >
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
