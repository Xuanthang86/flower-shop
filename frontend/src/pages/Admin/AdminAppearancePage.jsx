import { useEffect, useState } from "react";

import { FiRotateCcw, FiSave } from "react-icons/fi";

import { useTheme } from "@/context/ThemeProvider";

import {
  readSiteSettings,
  saveSiteSettings,
  resetSiteSettings,
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

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const isHex = (value) => /^#[0-9A-Fa-f]{6}$/.test(String(value || ""));

const AdminAppearancePage = () => {
  const { theme, updateTheme, resetTheme } = useTheme();

  const [settings, setSettings] = useState(() => readSiteSettings());

  const [draftTheme, setDraftTheme] = useState(theme);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraftTheme(theme);
  }, [theme]);

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
        ...current.hero,
        [field]: value,
      },
    }));
  };

  const updateSections = (field, value) => {
    updateSettings((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [field]: value,
      },
    }));
  };

  const updateContact = (field, value) => {
    updateSettings((current) => ({
      ...current,
      contact: {
        ...current.contact,
        [field]: value,
      },
    }));
  };

  const updateFooter = (value) => {
    updateSettings((current) => ({
      ...current,
      footer: {
        ...current.footer,
        copyright: value,
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

  const removeAnnouncement = (index) => {
    const currentMessages = settings.announcementMessages || [];

    const message = currentMessages[index] || "thông báo này";

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa "${message}" không?`
    );

    if (!confirmed) {
      return;
    }

    updateSettings((current) => ({
      ...current,
      announcementMessages: (current.announcementMessages || []).filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
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

      const saved = saveSiteSettings(settings);

      setSettings(saved);

      setMessage("Đã lưu giao diện website.");
    } catch (saveError) {
      console.error(saveError);

      setError("Không thể lưu cấu hình website.");
    }
  };

  const handleReset = () => {
    try {
      resetTheme();

      const restored = resetSiteSettings();

      setSettings(restored);

      setDraftTheme(
        restored.theme || {
          primaryColor: "#db2777",
          secondaryColor: "#fce7f3",
          textColor: "#1f2937",
          fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          baseFontSize: 16,
          headerFontSize: 15,
          borderRadius: 12,
        }
      );

      setMessage("Đã khôi phục cấu hình mặc định.");

      setError("");
    } catch (resetError) {
      console.error(resetError);

      setError("Không thể khôi phục cấu hình.");
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tùy chỉnh giao diện
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Chỉ chỉnh giao diện và nội dung hiển thị. Banner và bài viết được
            quản lý tại khu vực quản lý riêng.
          </p>
        </div>

        {(message || error) && (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="space-y-6">
          {/* 1 */}
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
                  Cỡ chữ cơ bản: {draftTheme.baseFontSize}px
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
                  Cỡ chữ Header: {draftTheme.headerFontSize}px
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
                  Bo góc: {draftTheme.borderRadius}px
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

          {/* 2 */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              2. Banner trang chủ
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Khu vực này chỉ chỉnh giao diện hiển thị của Banner. Thêm/xóa
              Banner thực hiện tại Quản lý hình ảnh.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Chiều cao Banner Desktop
                </label>

                <input
                  type="range"
                  min="220"
                  max="500"
                  value={settings.hero?.bannerHeightDesktop || 360}
                  onChange={(event) =>
                    updateHero(
                      "bannerHeightDesktop",
                      Number(event.target.value)
                    )
                  }
                  className="w-full"
                />

                <p className="mt-1 text-xs text-gray-500">
                  {settings.hero?.bannerHeightDesktop || 360}
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
                  value={settings.hero?.bannerRadius ?? 16}
                  onChange={(event) =>
                    updateHero("bannerRadius", Number(event.target.value))
                  }
                  className="w-full"
                />

                <p className="mt-1 text-xs text-gray-500">
                  {settings.hero?.bannerRadius ?? 16}
                  px
                </p>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">
                3. Thanh thông báo
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
                  <div key={index} className="flex gap-2">
                    <input
                      value={announcement}
                      onChange={(event) =>
                        updateAnnouncement(index, event.target.value)
                      }
                      className={inputClass}
                    />

                    <button
                      type="button"
                      onClick={() => removeAnnouncement(index)}
                      className="rounded-lg border border-red-100 px-4 text-red-500 hover:bg-red-50"
                    >
                      Xóa
                    </button>
                  </div>
                )
              )}
            </div>
          </section>

          {/* 4 */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              4. Nội dung trang chủ
            </h2>

            <div className="mt-5 grid gap-4">
              <input
                className={inputClass}
                value={settings.sections?.categoriesTitle || ""}
                onChange={(event) =>
                  updateSections("categoriesTitle", event.target.value)
                }
                placeholder="Tiêu đề danh mục"
              />

              <input
                className={inputClass}
                value={settings.sections?.categoriesSubtitle || ""}
                onChange={(event) =>
                  updateSections("categoriesSubtitle", event.target.value)
                }
                placeholder="Mô tả danh mục"
              />

              <input
                className={inputClass}
                value={settings.sections?.featuredTitle || ""}
                onChange={(event) =>
                  updateSections("featuredTitle", event.target.value)
                }
                placeholder="Tiêu đề sản phẩm"
              />

              <input
                className={inputClass}
                value={settings.sections?.featuredSubtitle || ""}
                onChange={(event) =>
                  updateSections("featuredSubtitle", event.target.value)
                }
                placeholder="Mô tả sản phẩm"
              />

              <input
                className={inputClass}
                value={settings.sections?.customerTitle || ""}
                onChange={(event) =>
                  updateSections("customerTitle", event.target.value)
                }
                placeholder="Khách hàng tiêu biểu"
              />
            </div>
          </section>

          {/* 5 */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">5. Footer</h2>

            <textarea
              rows={2}
              className={`${inputClass} mt-4`}
              value={settings.footer?.copyright || ""}
              onChange={(event) => updateFooter(event.target.value)}
            />
          </section>

          {/* 6 */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">6. Liên hệ</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ["title", "Tiêu đề"],
                ["phone", "Điện thoại"],
                ["email", "Email"],
                ["address", "Địa chỉ"],
                ["workingHours", "Thời gian làm việc"],
              ].map(([field, label]) => (
                <div key={field}>
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

              <textarea
                rows={3}
                className={inputClass}
                value={settings.contact?.description || ""}
                onChange={(event) =>
                  updateContact("description", event.target.value)
                }
                placeholder="Mô tả liên hệ"
              />
            </div>
          </section>

          {/* 7 */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">7. Bài viết</h2>

            <p className="mt-1 text-sm text-gray-500">
              Chỉ chỉnh giao diện hiển thị bài viết. Thêm, sửa và xóa bài viết
              thực hiện tại Quản lý bài viết.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Số cột bài viết Desktop
                </label>

                <select
                  value={settings.blog?.columns || 3}
                  onChange={(event) =>
                    updateSettings((current) => ({
                      ...current,
                      blog: {
                        ...(current.blog || {}),
                        columns: Number(event.target.value),
                      },
                    }))
                  }
                  className={inputClass}
                >
                  <option value={2}>2 cột</option>
                  <option value={3}>3 cột</option>
                  <option value={4}>4 cột</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Bo góc thẻ bài viết
                </label>

                <input
                  type="range"
                  min="0"
                  max="32"
                  value={settings.blog?.borderRadius ?? 16}
                  onChange={(event) =>
                    updateSettings((current) => ({
                      ...current,
                      blog: {
                        ...(current.blog || {}),
                        borderRadius: Number(event.target.value),
                      },
                    }))
                  }
                  className="w-full"
                />
              </div>
            </div>
          </section>

          {/* SAVE */}
          <section className="sticky bottom-4 z-30 rounded-2xl border border-pink-100 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleSave}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white hover:bg-pink-700"
              >
                <FiSave />
                Lưu toàn bộ thay đổi
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                <FiRotateCcw />
                Khôi phục mặc định
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default AdminAppearancePage;
