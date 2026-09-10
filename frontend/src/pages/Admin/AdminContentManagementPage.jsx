import { useEffect, useState } from "react";
import { FiImage, FiPlus, FiSave, FiTrash2, FiX } from "react-icons/fi";

import {
  readSiteSettings,
  saveSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

import { uploadImageFile } from "@/services/media";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const AdminContentManagementPage = () => {
  const [settings, setSettings] = useState(() => readSiteSettings());

  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [confirmAnnouncement, setConfirmAnnouncement] = useState(null);

  useEffect(() => {
    document.title = "Quản lý nội dung website | Flower Shop";

    let robots = document.querySelector('meta[name="robots"]');

    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }

    robots.content = "noindex,nofollow";
  }, []);

  useEffect(() => {
    const refresh = () => setSettings(readSiteSettings());

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);

      window.removeEventListener("storage", refresh);
    };
  }, []);

  const updateBranding = (field, value) => {
    setSettings((current) => ({
      ...current,
      branding: {
        ...(current.branding || {}),
        [field]: value,
      },
    }));

    setMessage("");
    setError("");
  };

  const updateSection = (field, value) => {
    setSettings((current) => ({
      ...current,
      sections: {
        ...(current.sections || {}),
        [field]: value,
      },
    }));

    setMessage("");
    setError("");
  };

  const saveImmediately = (nextSettings, successMessage) => {
    try {
      const saved = saveSiteSettings(nextSettings);

      setSettings(saved);
      setMessage(successMessage);
      setError("");
    } catch (saveError) {
      setError(saveError.message || "Không thể lưu dữ liệu.");
      setMessage("");
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const logo = await uploadImageFile(file, {
        folder: "flower-shop/branding",
        maxWidth: 1200,
        maxHeight: 500,
        quality: 0.84,
      });

      const nextSettings = {
        ...settings,
        branding: {
          ...(settings.branding || {}),
          logoImage: logo,
        },
      };

      setSettings(nextSettings);

      saveImmediately(nextSettings, "Đã tải Logo. Thông tin đã được lưu.");
    } catch (uploadError) {
      setError(uploadError.message || "Không thể tải Logo.");
    } finally {
      setUploading(false);
    }
  };

  const updateAnnouncement = (index, value) => {
    setSettings((current) => {
      const messages = [...(current.announcementMessages || [])];

      messages[index] = value;

      return {
        ...current,
        announcementMessages: messages,
      };
    });

    setMessage("");
    setError("");
  };

  const addAnnouncement = () => {
    setSettings((current) => ({
      ...current,
      announcementMessages: [...(current.announcementMessages || []), ""],
    }));

    setMessage("");
    setError("");
  };

  const askRemoveAnnouncement = (index) => {
    setConfirmAnnouncement({
      index,
      value: settings.announcementMessages?.[index] || "",
    });
  };

  const removeAnnouncement = () => {
    if (!confirmAnnouncement) return;

    const nextSettings = {
      ...settings,
      announcementMessages: (settings.announcementMessages || []).filter(
        (_, index) => index !== confirmAnnouncement.index
      ),
    };

    setConfirmAnnouncement(null);

    saveImmediately(nextSettings, "Đã xóa thanh thông báo.");
  };

  const handleSave = () => {
    saveImmediately(settings, "Đã lưu toàn bộ nội dung website.");
  };

  const branding = settings.branding || {};
  const sections = settings.sections || {};

  const announcementMessages = Array.isArray(settings.announcementMessages)
    ? settings.announcementMessages
    : [];

  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý nội dung website
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-500">
            Quản lý Logo, thương hiệu, thanh thông báo và nội dung trang chủ.
          </p>
        </header>

        {(message || error) && (
          <div className="mb-5 flex justify-center">
            <div
              className={`rounded-xl border bg-white px-5 py-3 text-center text-sm shadow-sm ${
                error
                  ? "border-red-100 text-red-600"
                  : "border-green-100 text-green-600"
              }`}
              role="status"
              aria-live="polite"
            >
              {error || message}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Logo & thương hiệu
            </h2>

            <div className="mt-5 grid gap-6 md:grid-cols-[180px_1fr]">
              <div className="flex items-center justify-center">
                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-pink-100 bg-gray-50 p-3 shadow-sm">
                  {branding.logoImage ? (
                    <img
                      src={branding.logoImage}
                      alt={
                        branding.logoAlt || branding.siteName || "Flower Shop"
                      }
                      className="h-24 w-24 rounded-full object-contain"
                    />
                  ) : (
                    <FiImage size={36} className="text-gray-300" />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Tên thương hiệu
                    </label>

                    <input
                      value={branding.siteName || ""}
                      onChange={(event) =>
                        updateBranding("siteName", event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Slogan
                    </label>

                    <input
                      value={branding.tagline || ""}
                      onChange={(event) =>
                        updateBranding("tagline", event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Alt Logo
                  </label>

                  <input
                    value={branding.logoAlt || ""}
                    onChange={(event) =>
                      updateBranding("logoAlt", event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <label
                  htmlFor="site-logo"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
                >
                  <FiImage />
                  {uploading ? "Đang tải..." : "Chọn Logo"}
                </label>

                <input
                  id="site-logo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading}
                  onChange={handleLogoUpload}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Thanh thông báo
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Nội dung hiển thị ở thanh thông báo website.
                </p>
              </div>

              <button
                type="button"
                onClick={addAnnouncement}
                className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
              >
                <FiPlus />
                Thêm
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {announcementMessages.map((item, index) => (
                <div key={`announcement-${index}`} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(event) =>
                      updateAnnouncement(index, event.target.value)
                    }
                    className={inputClass}
                    placeholder="Nội dung thông báo"
                  />

                  <button
                    type="button"
                    onClick={() => askRemoveAnnouncement(index)}
                    className="rounded-xl border border-red-100 px-4 text-red-600 transition hover:bg-red-50"
                    aria-label="Xóa thông báo"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Nội dung trang chủ
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Tiêu đề Danh mục
                </label>

                <input
                  value={sections.categoriesTitle || ""}
                  onChange={(event) =>
                    updateSection("categoriesTitle", event.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Mô tả Danh mục
                </label>

                <input
                  value={sections.categoriesSubtitle || ""}
                  onChange={(event) =>
                    updateSection("categoriesSubtitle", event.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Tiêu đề Sản phẩm nổi bật
                </label>

                <input
                  value={sections.featuredTitle || ""}
                  onChange={(event) =>
                    updateSection("featuredTitle", event.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Mô tả Sản phẩm nổi bật
                </label>

                <input
                  value={sections.featuredSubtitle || ""}
                  onChange={(event) =>
                    updateSection("featuredSubtitle", event.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Tiêu đề Khách hàng tiêu biểu
                </label>

                <input
                  value={sections.customerTitle || ""}
                  onChange={(event) =>
                    updateSection("customerTitle", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-700"
            >
              <FiSave />
              Lưu toàn bộ nội dung
            </button>
          </div>
        </div>
      </div>

      {confirmAnnouncement && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Xác nhận xóa thông báo
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Bạn có chắc chắn muốn xóa thanh thông báo này không?
                </p>

                {confirmAnnouncement.value && (
                  <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                    {confirmAnnouncement.value}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setConfirmAnnouncement(null)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAnnouncement(null)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={removeAnnouncement}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Xóa thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminContentManagementPage;
