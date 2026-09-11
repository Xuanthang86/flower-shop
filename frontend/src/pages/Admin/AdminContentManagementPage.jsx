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

    return () => {
      robots.content = "index,follow";
    };
  }, []);

  useEffect(() => {
    const refresh = () => {
      setSettings(readSiteSettings());
    };

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);

      window.removeEventListener("storage", refresh);
    };
  }, []);

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const saveSettings = (nextSettings, successMessage) => {
    try {
      const saved = saveSiteSettings(nextSettings);

      setSettings(saved);

      setMessage(successMessage);

      setError("");

      return true;
    } catch (saveError) {
      setError(saveError?.message || "Không thể lưu dữ liệu.");

      setMessage("");

      return false;
    }
  };

  const updateBranding = (field, value) => {
    setSettings((current) => ({
      ...current,

      branding: {
        ...(current.branding || {}),
        [field]: value,
      },
    }));

    clearMessages();
  };

  const saveBranding = () => {
    saveSettings(settings, "Đã lưu thông tin Logo & thương hiệu.");
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setUploading(true);

    clearMessages();

    try {
      const logo = await uploadImageFile(file, {
        folder: "flower-shop/branding",
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.84,
      });

      const nextSettings = {
        ...settings,

        branding: {
          ...(settings.branding || {}),
          logoImage: logo,
        },
      };

      const saved = saveSettings(nextSettings, "Đã tải và lưu Logo.");

      if (!saved) {
        return;
      }
    } catch (uploadError) {
      setError(uploadError?.message || "Không thể tải Logo.");
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

    clearMessages();
  };

  const addAnnouncement = () => {
    setSettings((current) => ({
      ...current,

      announcementMessages: [...(current.announcementMessages || []), ""],
    }));

    clearMessages();
  };

  const askRemoveAnnouncement = (index) => {
    setConfirmAnnouncement({
      index,
      value: settings.announcementMessages?.[index] || "",
    });
  };

  const removeAnnouncement = () => {
    if (!confirmAnnouncement) {
      return;
    }

    const nextSettings = {
      ...settings,

      announcementMessages: (settings.announcementMessages || []).filter(
        (_, index) => index !== confirmAnnouncement.index
      ),
    };

    setConfirmAnnouncement(null);

    saveSettings(nextSettings, "Đã xóa thanh thông báo.");
  };

  const saveAnnouncements = () => {
    saveSettings(settings, "Đã lưu thanh thông báo.");
  };

  const updateSection = (field, value) => {
    setSettings((current) => ({
      ...current,

      sections: {
        ...(current.sections || {}),
        [field]: value,
      },
    }));

    clearMessages();
  };

  const saveHomepageContent = () => {
    saveSettings(settings, "Đã lưu nội dung trang chủ.");
  };

  const updateBlogShopInfo = (value) => {
    setSettings((current) => ({
      ...current,

      blog: {
        ...(current.blog || {}),
        defaultShopInfoHtml: value,
      },
    }));

    clearMessages();
  };

  const saveBlogShopInfo = () => {
    saveSettings(settings, "Đã lưu thông tin Shop mặc định cho bài viết.");
  };

  const branding = settings.branding || {};

  const sections = settings.sections || {};

  const blog = settings.blog || {};

  const announcementMessages = Array.isArray(settings.announcementMessages)
    ? settings.announcementMessages
    : [];

  return (
    <main className="min-h-screen bg-gray-50 py-5">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý nội dung website
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-500">
            Quản lý Logo, thương hiệu, thanh thông báo, nội dung trang chủ và
            nội dung mặc định cho bài viết.
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
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-gray-900">
                Logo & thương hiệu
              </h2>

              <p className="text-sm text-gray-500">
                Thông tin này được dùng trực tiếp ở khu vực Logo của website.
              </p>
            </div>

            <div className="mt-5 grid gap-6 md:grid-cols-[180px_1fr]">
              <div className="flex items-center justify-center">
                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-pink-100 bg-gray-50 p-3 shadow-sm">
                  {branding.logoImage ? (
                    <img
                      src={branding.logoImage}
                      alt={
                        branding.logoAlt || branding.siteName || "Flower Shop"
                      }
                      className="h-28 w-28 rounded-full object-contain"
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

                <div className="flex flex-wrap gap-3">
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

                  <button
                    type="button"
                    onClick={saveBranding}
                    className="inline-flex items-center gap-2 rounded-xl border border-pink-200 bg-white px-5 py-3 text-sm font-semibold text-pink-600 transition hover:bg-pink-50"
                  >
                    <FiSave />
                    Lưu Logo & thương hiệu
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
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

            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={saveAnnouncements}
                className="inline-flex items-center gap-2 rounded-xl border border-pink-200 bg-white px-6 py-3 text-sm font-semibold text-pink-600 hover:bg-pink-50"
              >
                <FiSave />
                Lưu thanh thông báo
              </button>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Nội dung trang chủ
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Chỉnh sửa nội dung chữ của các section trên trang chủ.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={saveHomepageContent}
                className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-700"
              >
                <FiSave />
                Lưu nội dung trang chủ
              </button>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Thông tin Shop mặc định trong bài viết
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Nội dung này sẽ tự động được chèn vào cuối mỗi bài viết mới. Bạn
                có thể chỉnh sửa nội dung HTML để bổ sung thông tin thương hiệu,
                liên hệ và liên kết nội bộ phục vụ SEO.
              </p>

              <p className="mt-2 rounded-xl bg-pink-50 p-3 text-xs leading-5 text-pink-700">
                Có thể sử dụng các biến:{" "}
                <strong>
                  {
                    "{{siteName}} {{address}} {{phone}} {{email}} {{workingHours}}"
                  }
                </strong>
                . Khi tạo bài viết, hệ thống sẽ tự thay bằng thông tin hiện tại
                của Shop.
              </p>
            </div>

            <div className="mt-5">
              <textarea
                value={blog.defaultShopInfoHtml || ""}
                onChange={(event) => updateBlogShopInfo(event.target.value)}
                rows={14}
                className={`${inputClass} font-mono text-xs leading-6`}
                aria-label="Thông tin Shop mặc định trong bài viết"
              />
            </div>

            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={saveBlogShopInfo}
                className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-700"
              >
                <FiSave />
                Lưu thông tin Shop cho bài viết
              </button>
            </div>
          </section>
        </div>
      </div>

      {confirmAnnouncement && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-announcement-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="delete-announcement-title"
                  className="text-lg font-bold text-gray-900"
                >
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
                aria-label="Đóng"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmAnnouncement(null)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={removeAnnouncement}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
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
