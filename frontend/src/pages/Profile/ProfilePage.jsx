import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSave, FiUser, FiMapPin } from "react-icons/fi";

import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationProvider";

import AddressForm from "@/components/checkout/AddressForm";

const ROLE_FALLBACK_LABELS = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  product_manager: "Quản lý sản phẩm",
  customer: "Khách hàng",
};

const EMPTY_ADDRESS = {
  provinceCode: "",
  provinceName: "",
  wardCode: "",
  wardName: "",
  houseNumber: "",
  street: "",
};

const ProfilePage = () => {
  const { user, roleLabels, updateProfile } = useAuth();

  const { notifySuccess, notifyError } = useNotification();

  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    avatar: "",
    address: EMPTY_ADDRESS,
  });

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

      address: {
        ...EMPTY_ADDRESS,

        ...(user.address || {}),
      },
    });
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const roleLabel =
    roleLabels?.[user.role] || ROLE_FALLBACK_LABELS[user.role] || user.role;

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setProfileError("");

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

    reader.onerror = () => {
      setProfileError("Không thể đọc ảnh. Vui lòng chọn lại file.");
    };

    reader.readAsDataURL(file);
  };

  const handleAddressChange = (address) => {
    setProfile((current) => ({
      ...current,

      address: {
        ...EMPTY_ADDRESS,

        ...(address || {}),
      },
    }));

    setProfileError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setProfileError("");

    if (!profile.name.trim()) {
      setProfileError("Vui lòng nhập họ và tên.");

      return;
    }

    if (profile.phone && !/^[0-9+\s().-]{8,20}$/.test(profile.phone.trim())) {
      setProfileError("Số điện thoại không hợp lệ.");

      return;
    }

    setSaving(true);

    try {
      const result = await updateProfile({
        name: profile.name.trim(),

        phone: profile.phone.trim(),

        avatar: profile.avatar || "",

        address: {
          provinceCode: profile.address?.provinceCode || "",

          provinceName: profile.address?.provinceName || "",

          wardCode: profile.address?.wardCode || "",

          wardName: profile.address?.wardName || "",

          houseNumber: profile.address?.houseNumber?.trim() || "",

          street: profile.address?.street?.trim() || "",
        },
      });

      if (!result?.success) {
        setProfileError(result?.message || "Không thể cập nhật thông tin.");

        return;
      }

      notifySuccess(result.message || "Cập nhật thông tin thành công.");
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);

      setProfileError(
        error?.message || "Đã xảy ra lỗi khi cập nhật thông tin."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-[70vh] bg-gray-50 py-10 md:py-14">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
            <FiUser size={22} />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">
            Thông tin tài khoản
          </h1>

          <p className="mt-2 text-gray-500">
            Xem và cập nhật thông tin cá nhân, số điện thoại và địa chỉ tài
            khoản.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8 md:p-10">
            {profileError && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {profileError}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mx-auto max-w-2xl space-y-7"
            >
              <div className="flex flex-col items-center pb-2 text-center">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-pink-100 text-3xl font-bold text-pink-600 shadow-md">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Ảnh đại diện"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (profile.name || "U").charAt(0).toUpperCase()
                  )}
                </div>

                <div className="mt-4">
                  <input
                    id="profile-avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={saving}
                  />

                  <label
                    htmlFor="profile-avatar"
                    className={`inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition ${
                      saving
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:border-pink-400 hover:bg-gray-50 hover:text-pink-600"
                    }`}
                  >
                    Chọn ảnh đại diện
                  </label>

                  <p className="mt-2 text-xs text-gray-500">
                    JPG, PNG, WEBP · Tối đa 2MB
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
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
                  disabled={saving}
                  className="h-12 w-full rounded-xl border border-gray-300 px-4 text-gray-800 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-100"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email
                </label>

                <input
                  id="profile-email"
                  value={user.email || ""}
                  disabled
                  readOnly
                  className="h-12 w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 text-gray-500"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Email đăng nhập hiện chưa cho phép thay đổi.
                </p>
              </div>

              <div>
                <label
                  htmlFor="profile-phone"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Số điện thoại
                </label>

                <input
                  id="profile-phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  disabled={saving}
                  className="h-12 w-full rounded-xl border border-gray-300 px-4 text-gray-800 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-100"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                    <FiMapPin size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-800">
                      Địa chỉ tài khoản
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Địa chỉ này sẽ được dùng làm thông tin mặc định khi bạn
                      đặt hàng.
                    </p>
                  </div>
                </div>

                <AddressForm
                  value={profile.address}
                  onChange={handleAddressChange}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Quyền tài khoản
                </label>

                <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-600">
                  <FiUser size={16} />
                  {roleLabel}
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-700 active:bg-pink-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiSave size={18} />

                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
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
