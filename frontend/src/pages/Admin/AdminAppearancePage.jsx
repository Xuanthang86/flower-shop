/*
============================================================
FLOWER SHOP — ADMIN APPEARANCE PAGE
============================================================

Mục đích:
- Cho phép ADMIN chỉnh giao diện cơ bản của website.
- Không sửa trực tiếp JSX/CSS.
- Sử dụng ThemeProvider hiện tại của hệ thống.
- Lưu cấu hình qua ThemeProvider/localStorage.
- Không tạo thêm ThemeContext hoặc ThemeProvider thứ hai.

Các thuộc tính:
- Màu chủ đạo
- Màu phụ
- Màu chữ
- Font chữ
- Cỡ chữ cơ bản
- Độ bo góc

LƯU Ý:
File này phải sử dụng:
    @/context/ThemeProvider

Không sử dụng:
    @/context/ThemeContext
============================================================
*/

import { useEffect, useState } from "react";
import { FiRotateCcw, FiSave } from "react-icons/fi";

import { useTheme } from "@/context/ThemeProvider";

const FONT_OPTIONS = [
  {
    value: "Inter, system-ui, sans-serif",
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

const isValidHexColor = (value) =>
  /^#[0-9A-Fa-f]{6}$/.test(String(value || ""));

const AdminAppearancePage = () => {
  const { theme, updateTheme, resetTheme } = useTheme();

  const [draft, setDraft] = useState(theme);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDraft(theme);
  }, [theme]);

  const updateDraft = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  };

  const handleSave = () => {
    if (
      !isValidHexColor(draft.primaryColor) ||
      !isValidHexColor(draft.secondaryColor) ||
      !isValidHexColor(draft.textColor)
    ) {
      setMessage("Vui lòng nhập đúng mã màu HEX, ví dụ: #DB2777.");
      return;
    }

    const fontSize = Number(draft.baseFontSize);
    const radius = Number(draft.borderRadius);

    if (fontSize < 12 || fontSize > 24) {
      setMessage("Cỡ chữ phải nằm trong khoảng 12px đến 24px.");
      return;
    }

    if (radius < 0 || radius > 32) {
      setMessage("Độ bo góc phải nằm trong khoảng 0px đến 32px.");
      return;
    }

    updateTheme({
      primaryColor: draft.primaryColor,
      secondaryColor: draft.secondaryColor,
      textColor: draft.textColor,
      fontFamily: draft.fontFamily,
      baseFontSize: fontSize,
      borderRadius: radius,
    });

    setMessage("Đã lưu giao diện thành công.");
  };

  const handleReset = () => {
    resetTheme();
    setMessage("Đã khôi phục giao diện mặc định.");
  };

  return (
    <section className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Tùy chỉnh giao diện
          </h1>

          <p className="mt-2 text-gray-500">
            Quản trị viên có thể thay đổi các thiết lập giao diện cơ bản mà
            không cần chỉnh sửa mã nguồn.
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm ${
              message.includes("thành công") || message.includes("mặc định")
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* SETTINGS */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="space-y-7">
              {/* PRIMARY COLOR */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Màu chủ đạo
                </label>

                <div className="flex gap-3">
                  <input
                    type="color"
                    value={
                      isValidHexColor(draft.primaryColor)
                        ? draft.primaryColor
                        : "#DB2777"
                    }
                    onChange={(event) =>
                      updateDraft("primaryColor", event.target.value)
                    }
                    className="h-12 w-14 cursor-pointer rounded-lg border p-1"
                    aria-label="Chọn màu chủ đạo"
                  />

                  <input
                    type="text"
                    value={draft.primaryColor || ""}
                    onChange={(event) =>
                      updateDraft("primaryColor", event.target.value)
                    }
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-pink-500"
                    placeholder="#DB2777"
                  />
                </div>
              </div>

              {/* SECONDARY COLOR */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Màu phụ
                </label>

                <div className="flex gap-3">
                  <input
                    type="color"
                    value={
                      isValidHexColor(draft.secondaryColor)
                        ? draft.secondaryColor
                        : "#FCE7F3"
                    }
                    onChange={(event) =>
                      updateDraft("secondaryColor", event.target.value)
                    }
                    className="h-12 w-14 cursor-pointer rounded-lg border p-1"
                    aria-label="Chọn màu phụ"
                  />

                  <input
                    type="text"
                    value={draft.secondaryColor || ""}
                    onChange={(event) =>
                      updateDraft("secondaryColor", event.target.value)
                    }
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-pink-500"
                    placeholder="#FCE7F3"
                  />
                </div>
              </div>

              {/* TEXT COLOR */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Màu chữ
                </label>

                <div className="flex gap-3">
                  <input
                    type="color"
                    value={
                      isValidHexColor(draft.textColor)
                        ? draft.textColor
                        : "#1F2937"
                    }
                    onChange={(event) =>
                      updateDraft("textColor", event.target.value)
                    }
                    className="h-12 w-14 cursor-pointer rounded-lg border p-1"
                    aria-label="Chọn màu chữ"
                  />

                  <input
                    type="text"
                    value={draft.textColor || ""}
                    onChange={(event) =>
                      updateDraft("textColor", event.target.value)
                    }
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-pink-500"
                    placeholder="#1F2937"
                  />
                </div>
              </div>

              {/* FONT */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Font chữ
                </label>

                <select
                  value={draft.fontFamily || FONT_OPTIONS[0].value}
                  onChange={(event) =>
                    updateDraft("fontFamily", event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-pink-500"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* BASE FONT SIZE */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    Cỡ chữ cơ bản
                  </label>

                  <span className="text-sm font-medium text-pink-600">
                    {draft.baseFontSize}px
                  </span>
                </div>

                <input
                  type="range"
                  min="12"
                  max="24"
                  step="1"
                  value={draft.baseFontSize}
                  onChange={(event) =>
                    updateDraft("baseFontSize", Number(event.target.value))
                  }
                  className="w-full"
                />
              </div>

              {/* BORDER RADIUS */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    Độ bo góc
                  </label>

                  <span className="text-sm font-medium text-pink-600">
                    {draft.borderRadius}px
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="32"
                  step="1"
                  value={draft.borderRadius}
                  onChange={(event) =>
                    updateDraft("borderRadius", Number(event.target.value))
                  }
                  className="w-full"
                />
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
                >
                  <FiSave size={18} />
                  Lưu giao diện
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <FiRotateCcw size={18} />
                  Khôi phục mặc định
                </button>
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-gray-900">Xem trước giao diện</h2>

            <div
              className="mt-5 rounded-xl border border-gray-200 p-5"
              style={{
                fontFamily: draft.fontFamily,
                fontSize: `${draft.baseFontSize}px`,
                color: draft.textColor,
              }}
            >
              <div
                className="flex h-12 items-center justify-center font-semibold text-white"
                style={{
                  backgroundColor: draft.primaryColor,
                  borderRadius: `${draft.borderRadius}px`,
                }}
              >
                Flower Shop
              </div>

              <h3 className="mt-5 text-xl font-bold">Hoa tươi mỗi ngày</h3>

              <p className="mt-2 text-sm text-gray-500">
                Giao diện xem trước giúp Admin kiểm tra các thay đổi trước khi
                áp dụng.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="px-5 py-2.5 text-sm font-semibold text-white"
                  style={{
                    backgroundColor: draft.primaryColor,
                    borderRadius: `${draft.borderRadius}px`,
                  }}
                >
                  Xem sản phẩm
                </button>

                <button
                  type="button"
                  className="px-5 py-2.5 text-sm font-semibold"
                  style={{
                    backgroundColor: draft.secondaryColor,
                    color: draft.primaryColor,
                    borderRadius: `${draft.borderRadius}px`,
                  }}
                >
                  Xem thêm
                </button>
              </div>
            </div>

            <p className="mt-5 text-xs leading-5 text-gray-500">
              Thiết lập này chỉ điều chỉnh các thuộc tính giao diện cơ bản.
              Không thay đổi logic tài khoản, đơn hàng hoặc sản phẩm.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminAppearancePage;
