import { useEffect, useState } from "react";

import { FiSave, FiRotateCcw } from "react-icons/fi";

import { useTheme } from "@/context/ThemeProvider";

import {
  readSiteSettings,
  saveSiteSettings,
  resetSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

import { useNotification } from "@/context/NotificationContext";

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

const AdminAppearancePage = () => {
  const { theme, updateTheme, resetTheme } = useTheme();

  const [settings, setSettings] = useState(() => readSiteSettings());

  const [draftTheme, setDraftTheme] = useState(() => ({
    ...DEFAULT_THEME,
    ...theme,
  }));

  const { notifySuccess, notifyError } = useNotification();

  useEffect(() => {
    document.title = "Tùy chỉnh giao diện | Flower Shop";

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

  const updateHero = (field, value) => {
    setSettings((current) => ({
      ...current,

      hero: {
        ...(current.hero || {}),
        [field]: value,
      },
    }));
  };

  const updateBlog = (field, value) => {
    setSettings((current) => ({
      ...current,

      blog: {
        ...(current.blog || {}),
        [field]: value,
      },
    }));
  };

  const updateContactStyle = (field, value) => {
    setSettings((current) => ({
      ...current,

      contact: {
        ...(current.contact || {}),

        style: {
          ...(current.contact?.style || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleSave = () => {
    if (
      !isHex(draftTheme.primaryColor) ||
      !isHex(draftTheme.secondaryColor) ||
      !isHex(draftTheme.textColor)
    ) {
      notifyError("Mã màu phải có dạng #RRGGBB.");

      return;
    }

    const baseFontSize = Number(draftTheme.baseFontSize);

    const headerFontSize = Number(draftTheme.headerFontSize);

    const borderRadius = Number(draftTheme.borderRadius);

    const bannerHeightDesktop = Number(settings.hero?.bannerHeightDesktop);

    const bannerHeightMobile = Number(settings.hero?.bannerHeightMobile);

    const bannerRadius = Number(settings.hero?.bannerRadius);

    const bannerInterval = Number(settings.hero?.bannerInterval);

    const blogColumns = Number(settings.blog?.columns);

    const blogRadius = Number(settings.blog?.borderRadius);

    const contactColumns = Number(settings.contact?.style?.columns || 2);

    const contactCardRadius = Number(settings.contact?.style?.cardRadius || 12);

    const contactSectionRadius = Number(
      settings.contact?.style?.sectionRadius || 16
    );

    if (baseFontSize < 12 || baseFontSize > 24) {
      notifyError("Cỡ chữ cơ bản phải từ 12px đến 24px.");

      return;
    }

    if (headerFontSize < 12 || headerFontSize > 24) {
      notifyError("Cỡ chữ Header phải từ 12px đến 24px.");

      return;
    }

    if (borderRadius < 0 || borderRadius > 32) {
      notifyError("Bo góc phải từ 0px đến 32px.");

      return;
    }

    if (
      bannerHeightDesktop < 160 ||
      bannerHeightDesktop > 420 ||
      bannerHeightMobile < 90 ||
      bannerHeightMobile > 220
    ) {
      notifyError("Chiều cao Banner nằm ngoài giới hạn cho phép.");

      return;
    }

    if (bannerRadius < 0 || bannerRadius > 32) {
      notifyError("Bo góc Banner phải từ 0px đến 32px.");

      return;
    }

    if (bannerInterval < 5 || bannerInterval > 15) {
      notifyError("Thời gian Banner phải từ 5 đến 15 giây.");

      return;
    }

    if (blogColumns < 1 || blogColumns > 4) {
      notifyError("Số cột bài viết phải từ 1 đến 4.");

      return;
    }

    if (blogRadius < 0 || blogRadius > 32) {
      notifyError("Bo góc bài viết phải từ 0px đến 32px.");

      return;
    }

    if (contactColumns < 1 || contactColumns > 4) {
      notifyError("Số cột Liên hệ phải từ 1 đến 4.");

      return;
    }

    try {
      const nextTheme = {
        primaryColor: draftTheme.primaryColor,

        secondaryColor: draftTheme.secondaryColor,

        textColor: draftTheme.textColor,

        fontFamily: draftTheme.fontFamily,

        baseFontSize,

        headerFontSize,

        borderRadius,
      };

      updateTheme(nextTheme);

      const saved = saveSiteSettings({
        ...settings,

        theme: nextTheme,

        hero: {
          ...(settings.hero || {}),

          bannerHeightDesktop,

          bannerHeightMobile,

          bannerRadius,

          bannerInterval,
        },

        blog: {
          ...(settings.blog || {}),

          columns: blogColumns,

          borderRadius: blogRadius,
        },

        contact: {
          ...(settings.contact || {}),

          style: {
            ...(settings.contact?.style || {}),

            columns: contactColumns,

            cardRadius: contactCardRadius,

            sectionRadius: contactSectionRadius,
          },
        },
      });

      setSettings(saved);

      notifySuccess("Đã lưu toàn bộ thiết lập kỹ thuật giao diện.");
    } catch (saveError) {
      notifyError(saveError?.message || "Không thể lưu cấu hình giao diện.");
    }
  };

  const handleReset = () => {
    if (
      !window.confirm(
        "Khôi phục toàn bộ thiết lập giao diện kỹ thuật về mặc định?"
      )
    ) {
      return;
    }

    try {
      resetTheme();

      const restored = resetSiteSettings();

      setSettings(restored);

      setDraftTheme({
        ...DEFAULT_THEME,
        ...(restored.theme || {}),
      });

      notifySuccess("Đã khôi phục cấu hình mặc định.");
    } catch (resetError) {
      notifyError(resetError?.message || "Không thể khôi phục cấu hình.");
    }
  };

  const hero = settings.hero || {};

  const blog = settings.blog || {};

  const contactStyle = settings.contact?.style || {};

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tùy chỉnh giao diện
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Quản lý các thông số kỹ thuật và bố cục của website. Nội dung
            website được quản lý tại Khu vực quản lý.
          </p>
        </header>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">1. Màu sắc & Font chữ</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {[
                ["primaryColor", "Màu chủ đạo", "#DB2777"],

                ["secondaryColor", "Màu phụ", "#FCE7F3"],

                ["textColor", "Màu chữ", "#1F2937"],
              ].map(([field, label, fallback]) => (
                <div key={field}>
                  <label className="mb-2 block text-sm font-semibold">
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
                <label className="mb-2 block text-sm font-semibold">
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
                  {FONT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Cỡ chữ cơ bản
                </label>

                <input
                  type="number"
                  min="12"
                  max="24"
                  value={draftTheme.baseFontSize}
                  onChange={(event) =>
                    setDraftTheme((current) => ({
                      ...current,

                      baseFontSize: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Cỡ chữ Header
                </label>

                <input
                  type="number"
                  min="12"
                  max="24"
                  value={draftTheme.headerFontSize}
                  onChange={(event) =>
                    setDraftTheme((current) => ({
                      ...current,

                      headerFontSize: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Bo góc chung
                </label>

                <input
                  type="number"
                  min="0"
                  max="32"
                  value={draftTheme.borderRadius}
                  onChange={(event) =>
                    setDraftTheme((current) => ({
                      ...current,

                      borderRadius: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">2. Thông số kỹ thuật Banner</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Chiều cao Banner Desktop
                </label>

                <input
                  type="number"
                  min="160"
                  max="420"
                  value={hero.bannerHeightDesktop ?? 240}
                  onChange={(event) =>
                    updateHero(
                      "bannerHeightDesktop",
                      Number(event.target.value)
                    )
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Chiều cao Banner Mobile
                </label>

                <input
                  type="number"
                  min="90"
                  max="220"
                  value={hero.bannerHeightMobile ?? 125}
                  onChange={(event) =>
                    updateHero("bannerHeightMobile", Number(event.target.value))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Bo góc Banner
                </label>

                <input
                  type="number"
                  min="0"
                  max="32"
                  value={hero.bannerRadius ?? 14}
                  onChange={(event) =>
                    updateHero("bannerRadius", Number(event.target.value))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Thời gian chuyển Banner
                </label>

                <select
                  value={hero.bannerInterval ?? 8}
                  onChange={(event) =>
                    updateHero("bannerInterval", Number(event.target.value))
                  }
                  className={inputClass}
                >
                  {Array.from(
                    {
                      length: 11,
                    },
                    (_, index) => index + 5
                  ).map((seconds) => (
                    <option key={seconds} value={seconds}>
                      {seconds} giây
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">3. Bố cục bài viết</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Số cột hiển thị
                </label>

                <select
                  value={blog.columns || 3}
                  onChange={(event) =>
                    updateBlog("columns", Number(event.target.value))
                  }
                  className={inputClass}
                >
                  <option value={1}>1 cột</option>

                  <option value={2}>2 cột</option>

                  <option value={3}>3 cột</option>

                  <option value={4}>4 cột</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Bo góc bài viết
                </label>

                <input
                  type="number"
                  min="0"
                  max="32"
                  value={blog.borderRadius ?? 16}
                  onChange={(event) =>
                    updateBlog("borderRadius", Number(event.target.value))
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">4. Giao diện trang Liên hệ</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Số cột
                </label>

                <select
                  value={contactStyle.columns || 2}
                  onChange={(event) =>
                    updateContactStyle("columns", Number(event.target.value))
                  }
                  className={inputClass}
                >
                  <option value={1}>1 cột</option>

                  <option value={2}>2 cột</option>

                  <option value={3}>3 cột</option>

                  <option value={4}>4 cột</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Bo góc ô thông tin
                </label>

                <input
                  type="number"
                  min="0"
                  max="32"
                  value={contactStyle.cardRadius || 12}
                  onChange={(event) =>
                    updateContactStyle("cardRadius", Number(event.target.value))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Bo góc khung Liên hệ
                </label>

                <input
                  type="number"
                  min="0"
                  max="32"
                  value={contactStyle.sectionRadius || 16}
                  onChange={(event) =>
                    updateContactStyle(
                      "sectionRadius",
                      Number(event.target.value)
                    )
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Nội dung điện thoại, Email, địa chỉ, giờ làm việc và thông tin bổ
              sung được quản lý riêng tại{" "}
              <strong>Quản lý thông tin liên hệ</strong>.
            </p>
          </section>

          <div className="flex flex-col justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <FiRotateCcw />
              Khôi phục
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white hover:bg-pink-700"
            >
              <FiSave />
              Lưu thiết lập giao diện
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminAppearancePage;
