import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

const AccountMenu = () => {
  const navigate = useNavigate();

  const { user, logout } = useContext(AuthContext);

  const [open, setOpen] = useState(false);

  if (!user) {
    return null;
  }

  const displayName = user.name || user.fullName || user.email || "Tài khoản";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <div className="relative">
      {/* =================================================
          NÚT TÀI KHOẢN
      ================================================= */}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
      >
        <div className="w-9 h-9 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-pink-600">
              {avatarLetter}
            </span>
          )}
        </div>

        <div className="hidden xl:block text-left">
          <p className="text-sm font-semibold text-gray-800">{displayName}</p>

          <p className="text-xs text-gray-500">
            {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
          </p>
        </div>

        <span className="text-gray-500">▾</span>
      </button>

      {/* =================================================
          DROPDOWN
      ================================================= */}

      {open && (
        <>
          {/* lớp nền để click ra ngoài */}

          <button
            type="button"
            aria-label="Đóng menu tài khoản"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
            {/* THÔNG TIN */}

            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-pink-600">
                      {avatarLetter}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {displayName}
                  </p>

                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* TÀI KHOẢN */}

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/account");
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition"
            >
              👤 Tài khoản của tôi
            </button>

            {/* ĐƠN HÀNG */}

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/orders");
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition"
            >
              📦 Đơn hàng của tôi
            </button>

            {/* ADMIN */}

            {user.role === "admin" && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("/admin");
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition"
              >
                ⚙️ Quản trị hệ thống
              </button>
            )}

            <div className="border-t border-gray-100" />

            {/* ĐĂNG XUẤT */}

            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition"
            >
              ↪ Đăng xuất
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountMenu;
