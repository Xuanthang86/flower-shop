import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

const AccountPage = () => {
  const navigate = useNavigate();

  const { user, updateProfile, changePassword } = useContext(AuthContext);

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    avatar: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileMessage, setProfileMessage] = useState("");

  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* =====================================================
     NẾU CHƯA ĐĂNG NHẬP
  ===================================================== */

  useEffect(() => {
    if (!user) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [user, navigate]);

  /* =====================================================
     ĐỒNG BỘ THÔNG TIN USER
  ===================================================== */

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfile({
      name: user.name || "",
      phone: user.phone || "",
      avatar: user.avatar || "",
    });
  }, [user]);

  if (!user) {
    return null;
  }

  /* =====================================================
     THAY ĐỔI THÔNG TIN
  ===================================================== */

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* =====================================================
     CHỌN ẢNH ĐẠI DIỆN
  ===================================================== */

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setProfileError("Vui lòng chọn một file hình ảnh.");
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

      setProfileError("");
    };

    reader.readAsDataURL(file);
  };

  /* =====================================================
     LƯU THÔNG TIN
  ===================================================== */

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

  /* =====================================================
     THAY ĐỔI MẬT KHẨU
  ===================================================== */

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!passwordData.currentPassword) {
      setPasswordError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError("Vui lòng nhập mật khẩu mới.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp.");
      return;
    }

    const result = changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    );

    if (!result?.success) {
      setPasswordError(result?.message || "Không thể đổi mật khẩu.");
      return;
    }

    setPasswordMessage("Đổi mật khẩu thành công.");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* TIÊU ĐỀ */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Tài khoản của tôi
          </h1>

          <p className="mt-2 text-gray-600">
            Quản lý thông tin cá nhân và bảo mật tài khoản.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* =================================================
              THẺ TÀI KHOẢN
          ================================================= */}

          <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Ảnh đại diện"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-pink-600">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-xl font-bold text-gray-800">
                {user.name || "Khách hàng"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">{user.email}</p>

              <span className="mt-4 px-3 py-1 rounded-full text-sm bg-pink-50 text-pink-600">
                {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
              </span>
            </div>

            <div className="border-t border-gray-100 mt-6 pt-6 space-y-3">
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                📦 Đơn hàng của tôi
              </button>

              <button
                type="button"
                onClick={() => navigate("/products")}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                🛍️ Tiếp tục mua sắm
              </button>
            </div>
          </div>

          {/* =================================================
              NỘI DUNG
          ================================================= */}

          <div className="lg:col-span-2 space-y-8">
            {/* =================================================
                THÔNG TIN CÁ NHÂN
            ================================================= */}

            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-semibold text-gray-800">
                Thông tin cá nhân
              </h2>

              {profileError && (
                <div className="mt-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
                  {profileError}
                </div>
              )}

              {profileMessage && (
                <div className="mt-5 p-4 rounded-lg bg-green-50 border border-green-200 text-green-600">
                  {profileMessage}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
                {/* ẢNH */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ảnh đại diện
                  </label>

                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-pink-600">
                          {(profile.name || "U").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div>
                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />

                      <label
                        htmlFor="avatar"
                        className="inline-block cursor-pointer px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        Chọn ảnh
                      </label>

                      <p className="mt-2 text-xs text-gray-500">
                        JPG, PNG hoặc WEBP. Tối đa 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* TÊN */}

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Họ và tên
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={profile.name}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-lg px-4 py-3"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Email đăng nhập hiện chưa cho phép thay đổi.
                  </p>
                </div>

                {/* SĐT */}

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Số điện thoại
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
                >
                  Lưu thay đổi
                </button>
              </form>
            </div>

            {/* =================================================
                ĐỔI MẬT KHẨU
            ================================================= */}

            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-semibold text-gray-800">
                Đổi mật khẩu
              </h2>

              {passwordError && (
                <div className="mt-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
                  {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div className="mt-5 p-4 rounded-lg bg-green-50 border border-green-200 text-green-600">
                  {passwordMessage}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
                {/* MẬT KHẨU HIỆN TẠI */}

                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mật khẩu hiện tại
                  </label>

                  <div className="relative">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />

                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      aria-label={
                        showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                    >
                      {showCurrentPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* MẬT KHẨU MỚI */}

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mật khẩu mới
                  </label>

                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />

                    <button
                      type="button"
                      onClick={() => setShowNewPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showNewPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* XÁC NHẬN */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nhập lại mật khẩu mới
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
                >
                  Đổi mật khẩu
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountPage;
