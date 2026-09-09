import { uploadImageFile } from "@/services/media";
import { useEffect, useState } from "react";

import {
  FiImage,
  FiRotateCcw,
  FiSave,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";

import { useTheme } from "@/context/ThemeProvider";

import {
  readSiteSettings,
  saveSiteSettings,
  resetSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

const FONT_OPTIONS = [
  {
    value:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    label: "Inter / System UI",
  },
  {
    value: "Arial, Helvetica, sans-serif",
    label: "Arial",
  },
  {
    value: "Georgia, serif",
    label: "Georgia",
  },
  {
    value: "Verdana, sans-serif",
    label: "Verdana",
  },
];

const DEFAULT_THEME = {
  primaryColor: "#db2777",
  secondaryColor: "#fce7f3",
  textColor: "#1f2937",
  fontFamily:
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  baseFontSize: 16,
  headerFontSize: 15,
  borderRadius: 12,
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const isHex = (value) => /^#[0-9A-Fa-f]{6}$/.test(String(value || ""));

const compressImage = (
  file,
  { maxWidth = 900, maxHeight = 300, quality = 0.82 } = {}
) =>
  new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Vui lòng chọn đúng file hình ảnh."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const ratio = Math.min(
          1,
          maxWidth / image.width,
          maxHeight / image.height
        );

        const canvas = document.createElement("canvas");

        canvas.width = Math.max(1, Math.round(image.width * ratio));

        canvas.height = Math.max(1, Math.round(image.height * ratio));

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Không thể xử lý hình ảnh."));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/webp", quality));
      };

      image.onerror = () => reject(new Error("Không thể đọc hình ảnh."));

      image.src = String(reader.result || "");
    };

    reader.onerror = () => reject(new Error("Không thể đọc file."));

    reader.readAsDataURL(file);
  });

const MessageModal = ({ message, error, onClose }) => {
  if (!message && !error) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/25 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div
          className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
            error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
          }`}
        >
          {error ? <FiX /> : <FiSave />}
        </div>

        <p
          className={`mt-4 text-center text-sm font-medium ${
            error ? "text-red-700" : "text-gray-700"
          }`}
        >
          {error || message}
        </p>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminAppearancePage = () => {
  const { theme, updateTheme, resetTheme } = useTheme();

  const [settings, setSettings] = useState(() => readSiteSettings());

  const [draftTheme, setDraftTheme] = useState(() => ({
    ...DEFAULT_THEME,
    ...theme,
  }));

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    document.title = "Tùy chỉnh giao diện | Flower Shop";

    let robots = document.querySelector('meta[name="robots"]');

    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }

    robots.setAttribute("content", "noindex,nofollow");
  }, []);

  useEffect(() => {
    const refresh = () => {
      const next = readSiteSettings();

      setSettings(next);

      setDraftTheme({
        ...DEFAULT_THEME,
        ...(next.theme || {}),
      });
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

  const updateSettings = (updater) => {
    setSettings((current) =>
      typeof updater === "function" ? updater(current) : updater
    );

    clearMessages();
  };

  const updateHero = (field, value) => {
    updateSettings((current) => ({
      ...current,
      hero: {
        ...(current.hero || {}),
        [field]: value,
      },
    }));
  };

  const updateSections = (field, value) => {
    updateSettings((current) => ({
      ...current,
      sections: {
        ...(current.sections || {}),
        [field]: value,
      },
    }));
  };

  const updateContact = (field, value) => {
    updateSettings((current) => ({
      ...current,
      contact: {
        ...(current.contact || {}),
        [field]: value,
      },
    }));
  };

  const updateFooter = (field, value) => {
    updateSettings((current) => ({
      ...current,
      footer: {
        ...(current.footer || {}),
        [field]: value,
      },
    }));
  };

  const updateBlog = (field, value) => {
    updateSettings((current) => ({
      ...current,
      blog: {
        ...(current.blog || {}),
        [field]: value,
      },
    }));
  };

  const updateAnnouncement = (index, value) => {
    updateSettings((current) => {
      const messages = [...(current.announcementMessages || [])];

      messages[index] = value;

      return {
        ...current,
        announcementMessages: messages,
      };
    });
  };

  const addAnnouncement = () => {
    updateSettings((current) => ({
      ...current,
      announcementMessages: [...(current.announcementMessages || []), ""],
    }));
  };

  const requestRemoveAnnouncement = (index) => {
    const messages = settings.announcementMessages || [];

    setConfirmDelete({
      type: "announcement",
      index,
      message: messages[index] || "thông báo này",
    });
  };

  const removeAnnouncement = () => {
    if (!confirmDelete || confirmDelete.type !== "announcement") {
      return;
    }

    const index = confirmDelete.index;

    setSettings((current) => ({
      ...current,
      announcementMessages: (current.announcementMessages || []).filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));

    setConfirmDelete(null);
    setMessage("Đã xóa thông báo.");
    setError("");
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setUploadingLogo(true);
    clearMessages();

    try {
      const logo = await uploadImageFile(file, {
        folder: "flower-shop/branding",
        maxWidth: 1200,
        maxHeight: 500,
        quality: 0.84,
      });

      setSettings((current) => ({
        ...current,
        branding: {
          ...(current.branding || {}),
          logoImage: logo,
          logoAlt: current.branding?.logoAlt || "Flower Shop",
        },
      }));

      setMessage(
        "Đã tải Logo lên kho ảnh dùng chung. Hãy bấm Lưu toàn bộ thay đổi để áp dụng."
      );
    } catch (uploadError) {
      console.error(uploadError);

      setError(uploadError.message || "Không thể tải Logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setSettings((current) => ({
      ...current,
      branding: {
        ...(current.branding || {}),
        logoImage: "",
      },
    }));

    setMessage("Đã bỏ Logo. Hãy bấm Lưu toàn bộ thay đổi để áp dụng.");
  };

  const handleSave = () => {
    clearMessages();

    if (
      !isHex(draftTheme.primaryColor) ||
      !isHex(draftTheme.secondaryColor) ||
      !isHex(draftTheme.textColor)
    ) {
      setError("Mã màu phải có dạng #RRGGBB.");
      return;
    }

    const baseFontSize = Number(draftTheme.baseFontSize);

    const headerFontSize = Number(draftTheme.headerFontSize);

    const borderRadius = Number(draftTheme.borderRadius);

    if (baseFontSize < 12 || baseFontSize > 24) {
      setError("Cỡ chữ cơ bản phải từ 12px đến 24px.");
      return;
    }

    if (headerFontSize < 12 || headerFontSize > 24) {
      setError("Cỡ chữ Header phải từ 12px đến 24px.");
      return;
    }

    if (borderRadius < 0 || borderRadius > 32) {
      setError("Bo góc phải từ 0px đến 32px.");
      return;
    }

    try {
      updateTheme({
        primaryColor: draftTheme.primaryColor,
        secondaryColor: draftTheme.secondaryColor,
        textColor: draftTheme.textColor,
        fontFamily: draftTheme.fontFamily,
        baseFontSize,
        headerFontSize,
        borderRadius,
      });

      const saved = saveSiteSettings({
        ...settings,
        theme: {
          ...settings.theme,
          primaryColor: draftTheme.primaryColor,
          secondaryColor: draftTheme.secondaryColor,
          textColor: draftTheme.textColor,
          fontFamily: draftTheme.fontFamily,
          baseFontSize,
          headerFontSize,
          borderRadius,
        },
      });

      setSettings(saved);

      setMessage("Đã lưu toàn bộ thay đổi giao diện website.");
    } catch (saveError) {
      console.error(saveError);

      setError(saveError.message || "Không thể lưu cấu hình website.");
    }
  };

  const handleReset = () => {
    setConfirmDelete({
      type: "reset",
    });
  };

  const executeReset = () => {
    try {
      resetTheme();

      const restored = resetSiteSettings();

      setSettings(restored);

      setDraftTheme({
        ...DEFAULT_THEME,
        ...(restored.theme || {}),
      });

      setConfirmDelete(null);

      setMessage("Đã khôi phục cấu hình mặc định.");

      setError("");
    } catch (resetError) {
      console.error(resetError);

      setConfirmDelete(null);

      setError("Không thể khôi phục cấu hình.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tùy chỉnh giao diện
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Quản lý giao diện, Logo, Banner, nội dung trang chủ, bài viết, thông
            báo, liên hệ và Footer.
          </p>
        </header>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              1. Giao diện cơ bản
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {[
                ["primaryColor", "Màu chủ đạo", "#DB2777"],
                ["secondaryColor", "Màu phụ", "#FCE7F3"],
                ["textColor", "Màu chữ", "#1F2937"],
              ].map(([field, label, fallback]) => (
                <div key={field}>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {label}
                  </label>

                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={
                        isHex(draftTheme[field]) ? draftTheme[field] : fallback
                      }
                      onChange={(event) =>
                        setDraftTheme((current) => ({
                          ...current,
                          [field]: event.target.value,
                        }))
                      }
                      className="h-12 w-14 cursor-pointer rounded-lg border p-1"
                    />

                    <input
                      type="text"
                      value={draftTheme[field] || ""}
                      onChange={(event) =>
                        setDraftTheme((current) => ({
                          ...current,
                          [field]: event.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Font chữ
                </label>

                <select
                  value={draftTheme.fontFamily}
                  onChange={(event) =>
                    setDraftTheme((current) => ({
                      ...current,
                      fontFamily: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Cỡ chữ cơ bản: {draftTheme.baseFontSize}
                  px
                </label>

                <input
                  type="range"
                  min="12"
                  max="24"
                  value={draftTheme.baseFontSize}
                  onChange={(event) =>
                    setDraftTheme((current) => ({
                      ...current,
                      baseFontSize: Number(event.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Cỡ chữ Header: {draftTheme.headerFontSize}
                  px
                </label>

                <input
                  type="range"
                  min="12"
                  max="24"
                  value={draftTheme.headerFontSize}
                  onChange={(event) =>
                    setDraftTheme((current) => ({
                      ...current,
                      headerFontSize: Number(event.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Bo góc: {draftTheme.borderRadius}
                  px
                </label>

                <input
                  type="range"
                  min="0"
                  max="32"
                  value={draftTheme.borderRadius}
                  onChange={(event) =>
                    setDraftTheme((current) => ({
                      ...current,
                      borderRadius: Number(event.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">2. Logo Header</h2>

            <p className="mt-1 text-sm text-gray-500">
              Logo sẽ được lưu vào cấu hình thương hiệu và sử dụng bởi Header.
            </p>

            <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 p-3">
                {settings.branding?.logoImage ? (
                  <img
                    src={settings.branding.logoImage}
                    alt={settings.branding.logoAlt || "Flower Shop"}
                    className="h-full w-full rounded-full object-contain"
                  />
                ) : (
                  <FiImage size={34} className="text-gray-300" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    htmlFor="header-logo"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
                  >
                    <FiUpload />
                    {uploadingLogo ? "Đang xử lý..." : "Chọn Logo"}
                  </label>

                  <input
                    id="header-logo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="sr-only"
                    disabled={uploadingLogo}
                    onChange={handleLogoUpload}
                  />

                  {settings.branding?.logoImage && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-100 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <FiTrash2 />
                      Bỏ Logo
                    </button>
                  )}
                </div>

                <p className="mt-3 text-xs leading-5 text-gray-500">
                  Khuyến nghị Logo PNG/WebP nền trong suốt, khoảng 600×180 hoặc
                  800×240 px.
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Logo trong phần xem trước được hiển thị dạng hình tròn.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              3. Banner trang chủ
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Banner được thêm, xóa, ẩn/hiện và thiết lập ưu tiên tại Quản lý
              hình ảnh.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Chiều cao Banner Desktop
                </label>

                <input
                  type="range"
                  min="180"
                  max="360"
                  value={settings.hero?.bannerHeightDesktop || 240}
                  onChange={(event) =>
                    updateHero(
                      "bannerHeightDesktop",
                      Number(event.target.value)
                    )
                  }
                  className="w-full"
                />

                <p className="mt-1 text-xs text-gray-500">
                  {settings.hero?.bannerHeightDesktop}
                  px
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Bo góc Banner
                </label>

                <input
                  type="range"
                  min="0"
                  max="32"
                  value={settings.hero?.bannerRadius ?? 14}
                  onChange={(event) =>
                    updateHero("bannerRadius", Number(event.target.value))
                  }
                  className="w-full"
                />

                <p className="mt-1 text-xs text-gray-500">
                  {settings.hero?.bannerRadius}
                  px
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">
                4. Thanh thông báo
              </h2>

              <button
                type="button"
                onClick={addAnnouncement}
                className="rounded-lg border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-600 hover:bg-pink-50"
              >
                Thêm thông báo
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {(settings.announcementMessages || []).map(
                (announcement, index) => (
                  <div key={`${index}-${announcement}`} className="flex gap-2">
                    <input
                      value={announcement}
                      onChange={(event) =>
                        updateAnnouncement(index, event.target.value)
                      }
                      className={inputClass}
                    />

                    <button
                      type="button"
                      onClick={() => requestRemoveAnnouncement(index)}
                      className="rounded-xl border border-red-100 px-4 text-red-500 hover:bg-red-50"
                    >
                      Xóa
                    </button>
                  </div>
                )
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              5. Nội dung trang chủ
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tiêu đề danh mục
                </label>

                <input
                  className={inputClass}
                  value={settings.sections?.categoriesTitle || ""}
                  onChange={(event) =>
                    updateSections("categoriesTitle", event.target.value)
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Mô tả danh mục
                </label>

                <input
                  className={inputClass}
                  value={settings.sections?.categoriesSubtitle || ""}
                  onChange={(event) =>
                    updateSections("categoriesSubtitle", event.target.value)
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tiêu đề sản phẩm nổi bật
                </label>

                <input
                  className={inputClass}
                  value={settings.sections?.featuredTitle || ""}
                  onChange={(event) =>
                    updateSections("featuredTitle", event.target.value)
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Mô tả sản phẩm nổi bật
                </label>

                <input
                  className={inputClass}
                  value={settings.sections?.featuredSubtitle || ""}
                  onChange={(event) =>
                    updateSections("featuredSubtitle", event.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tiêu đề khách hàng
                </label>

                <input
                  className={inputClass}
                  value={settings.sections?.customerTitle || ""}
                  onChange={(event) =>
                    updateSections("customerTitle", event.target.value)
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">6. Footer</h2>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nội dung bản quyền
              </label>

              <input
                className={inputClass}
                value={settings.footer?.copyright || ""}
                onChange={(event) =>
                  updateFooter("copyright", event.target.value)
                }
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">7. Bài viết</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Số cột hiển thị
                </label>

                <select
                  value={settings.blog?.columns || 3}
                  onChange={(event) =>
                    updateBlog("columns", Number(event.target.value))
                  }
                  className={inputClass}
                >
                  <option value="1">1 cột</option>
                  <option value="2">2 cột</option>
                  <option value="3">3 cột</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Bo góc bài viết
                </label>

                <input
                  type="range"
                  min="0"
                  max="32"
                  value={settings.blog?.borderRadius ?? 16}
                  onChange={(event) =>
                    updateBlog("borderRadius", Number(event.target.value))
                  }
                  className="w-full"
                />

                <p className="mt-1 text-xs text-gray-500">
                  {settings.blog?.borderRadius}
                  px
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Nội dung bài viết được tạo và chỉnh sửa tại mục Quản lý bài viết.
            </p>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">8. Liên hệ</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ["title", "Tiêu đề"],
                ["phone", "Số điện thoại"],
                ["email", "Email"],
                ["address", "Địa chỉ"],
                ["workingHours", "Giờ làm việc"],
              ].map(([field, label]) => (
                <div
                  key={field}
                  className={field === "address" ? "md:col-span-2" : ""}
                >
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {label}
                  </label>

                  <input
                    className={inputClass}
                    value={settings.contact?.[field] || ""}
                    onChange={(event) =>
                      updateContact(field, event.target.value)
                    }
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Mô tả liên hệ
                </label>

                <textarea
                  rows={4}
                  className={inputClass}
                  value={settings.contact?.description || ""}
                  onChange={(event) =>
                    updateContact("description", event.target.value)
                  }
                />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <FiRotateCcw />
              Khôi phục mặc định
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
            >
              <FiSave />
              Lưu toàn bộ thay đổi
            </button>
          </section>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              {confirmDelete.type === "reset" ? <FiRotateCcw /> : <FiTrash2 />}
            </div>

            <h2 className="mt-4 text-center text-lg font-bold text-gray-900">
              {confirmDelete.type === "reset"
                ? "Khôi phục mặc định?"
                : "Xóa thông báo?"}
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-gray-600">
              {confirmDelete.type === "reset"
                ? "Toàn bộ cấu hình giao diện hiện tại sẽ được khôi phục về mặc định."
                : `Bạn có chắc muốn xóa "${confirmDelete.message}"?`}
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={
                  confirmDelete.type === "reset"
                    ? executeReset
                    : removeAnnouncement
                }
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <MessageModal message={message} error={error} onClose={clearMessages} />
    </main>
  );
};

export default AdminAppearancePage;
