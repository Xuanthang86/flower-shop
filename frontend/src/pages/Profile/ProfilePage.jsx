import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSave, FiUser } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

const ROLE_FALLBACK_LABELS = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  product_manager: "Quản lý sản phẩm",
  customer: "Khách hàng",
};

const ProfilePage = () => {
  const { user, roleLabels, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: "", phone: "", avatar: "" });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    setProfile({
      name: user.name || user.fullName || "",
      phone: user.phone || "",
      avatar: user.avatar || "",
    });
  }, [user, navigate]);

  if (!user) return null;

  const roleLabel = roleLabels?.[user.role] || ROLE_FALLBACK_LABELS[user.role] || user.role;

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    reader.onload = () => setProfile((current) => ({ ...current, avatar: reader.result }));
    reader.onerror = () => setProfileError("Không thể đọc ảnh. Vui lòng chọn lại file.");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProfileMessage("");
    setProfileError("");

    if (!profile.name.trim()) {
      setProfileError("Vui lòng nhập họ và tên.");
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfile({
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        avatar: profile.avatar || "",
      });

      if (!result?.success) {
        setProfileError(result?.message || "Không thể cập nhật thông tin.");
        return;
      }

      setProfileMessage(result.message || "Thông tin tài khoản đã được cập nhật.");
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      setProfileError(error?.message || "Đã xảy ra lỗi khi cập nhật thông tin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-[70vh] bg-gray-50 py-10 md:py-14">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 text-pink-600 mb-4">
            <FiUser size={22} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Thông tin tài khoản</h1>
          <p className="mt-2 text-gray-500">Xem và cập nhật thông tin cá nhân của bạn.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            {profileMessage && <div role="status" className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">{profileMessage}</div>}
            {profileError && <div role="alert" className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{profileError}</div>}

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
              <div className="flex flex-col items-center text-center pb-2">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center text-pink-600 text-3xl font-bold border-4 border-white shadow-md">
                  {profile.avatar ? <img src={profile.avatar} alt="Ảnh đại diện" className="w-full h-full object-cover" /> : (profile.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="mt-4">
                  <input id="profile-avatar" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" disabled={saving} />
                  <label htmlFor="profile-avatar" className={`inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium transition ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50 hover:border-pink-400 hover:text-pink-600"}`}>Chọn ảnh đại diện</label>
                  <p className="mt-2 text-xs text-gray-500">JPG, PNG, WEBP · Tối đa 2MB</p>
                </div>
              </div>

              <div>
                <label htmlFor="profile-name" className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên <span className="text-pink-600">*</span></label>
                <input id="profile-name" value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} required disabled={saving} className="w-full h-12 border border-gray-300 rounded-xl px-4 text-gray-800 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-100" placeholder="Nhập họ và tên" />
              </div>

              <div>
                <label htmlFor="profile-email" className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input id="profile-email" value={user.email || ""} disabled readOnly className="w-full h-12 border border-gray-200 bg-gray-100 text-gray-500 rounded-xl px-4 cursor-not-allowed" />
                <p className="mt-2 text-xs text-gray-400">Email tài khoản không thể thay đổi.</p>
              </div>

              <div>
                <label htmlFor="profile-phone" className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                <input id="profile-phone" type="tel" value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} disabled={saving} className="w-full h-12 border border-gray-300 rounded-xl px-4 text-gray-800 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-100" placeholder="Nhập số điện thoại" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quyền tài khoản</label>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 border border-pink-100 text-pink-600 text-sm font-semibold"><FiUser size={16} />{roleLabel}</div>
              </div>

              <div className="pt-2 flex justify-center">
                <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 min-w-[180px] px-6 py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 active:bg-pink-800 transition shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                  <FiSave size={18} />{saving ? "Đang lưu..." : "Lưu thay đổi"}
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
