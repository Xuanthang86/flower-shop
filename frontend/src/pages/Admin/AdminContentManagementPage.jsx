import { useEffect, useState } from "react";
import { FiImage, FiPlus, FiSave, FiTrash2 } from "react-icons/fi";

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

  const update = (path, value) => {
    setSettings((current) => {
      const next = structuredClone(current);

      if (path[0] === "branding") {
        next.branding = {
          ...(next.branding || {}),
          [path[1]]: value,
        };
      }

      if (path[0] === "hero") {
        next.hero = {
          ...(next.hero || {}),
          [path[1]]: value,
        };
      }

      if (path[0] === "sections") {
        next.sections = {
          ...(next.sections || {}),
          [path[1]]: value,
        };
      }

      return next;
    });

    setMessage("");
    setError("");
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
  };

  const addAnnouncement = () => {
    setSettings((current) => ({
      ...current,
      announcementMessages: [...(current.announcementMessages || []), ""],
    }));
  };

  const removeAnnouncement = (index) => {
    setSettings((current) => ({
      ...current,
      announcementMessages: (current.announcementMessages || []).filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
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

      update(["branding", "logoImage"], logo);

      setMessage("Đã tải Logo. Hãy bấm Lưu toàn bộ thay đổi để áp dụng.");
    } catch (uploadError) {
      setError(uploadError.message || "Không thể tải Logo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    try {
      const saved = saveSiteSettings(settings);
      setSettings(saved);
      setMessage("Đã lưu toàn bộ nội dung website.");
      setError("");
    } catch (saveError) {
      setError(saveError.message || "Không thể lưu nội dung.");
      setMessage("");
    }
  };

  const branding = settings.branding || {};
  const hero = settings.hero || {};
  const sections = settings.sections || {};
  const announcementMessages = Array.isArray(settings.announcementMessages)
    ? settings.announcementMessages
    : [];

  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý nội dung website
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Quản lý nội dung hiển thị; các thiết lập kỹ thuật nằm trong Tùy
            chỉnh giao diện.
          </p>
        </header>

        {(message || error) && (
          <div
            className={`mb-5 rounded-xl border bg-white p-4 text-sm ${
              error
                ? "border-red-100 text-red-600"
                : "border-green-100 text-green-600"
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Logo & thương hiệu
            </h2>

            <div className="mt-5 flex flex-col gap-5 md:flex-row">
              <div className="flex h-36 w-64 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-4">
                {branding.logoImage ? (
                  <img
                    src={branding.logoImage}
                    alt={branding.logoAlt || "Flower Shop"}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <FiImage size={36} className="text-gray-300" />
                )}
              </div>

              <div className="flex-1">
                <label
                  htmlFor="site-logo"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-700"
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

                <input
                  value={branding.logoAlt || ""}
                  onChange={(event) =>
                    update(["branding", "logoAlt"], event.target.value)
                  }
                  placeholder="Alt của Logo"
                  className={`${inputClass} mt-4`}
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
                    onClick={() => removeAnnouncement(index)}
                    className="rounded-xl border border-red-100 px-4 text-red-600 hover:bg-red-50"
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
                    update(["sections", "categoriesTitle"], event.target.value)
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
                    update(
                      ["sections", "categoriesSubtitle"],
                      event.target.value
                    )
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
                    update(["sections", "featuredTitle"], event.target.value)
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
                    update(["sections", "featuredSubtitle"], event.target.value)
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
                    update(["sections", "customerTitle"], event.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">
              Chiều cao Banner, bo góc Banner, thời gian chuyển Banner, số cột
              bài viết và các thông số kỹ thuật được chỉnh tại
              <strong> Tùy chỉnh giao diện</strong>.
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white hover:bg-pink-700"
            >
              <FiSave />
              Lưu toàn bộ nội dung
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminContentManagementPage;
