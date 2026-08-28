import { useEffect, useState } from "react";
import { FiRotateCcw, FiSave } from "react-icons/fi";

import { useTheme } from "@/context/ThemeContext";

const FONT_OPTIONS = [
  {
    value:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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

const AdminAppearancePage = () => {
  const { theme, setTheme, resetTheme } = useTheme();

  const [draft, setDraft] = useState(theme);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDraft(theme);
  }, [theme]);

  const handleSave = () => {
    setTheme(draft);

    setMessage("Đã lưu giao diện thành công.");
  };

  const handleReset = () => {
    resetTheme();

    setMessage("Đã khôi phục giao diện mặc định.");
  };

  const updateDraft = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <section className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Tùy chỉnh giao diện
          </h1>

          <p className="mt-2 text-gray-500">
            Thay đổi các thiết lập giao diện cơ bản mà không cần sửa mã nguồn.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div className="space-y-7">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Màu chủ đạo
                </label>

                <div className="flex gap-3">
                  <input
                    type="color"
                    value={draft.primary}
                    onChange={(event) =>
                      updateDraft("primary", event.target.value)
                    }
                    className="h-12 w-14 cursor-pointer rounded-lg border p-1"
                  />

                  <input
                    type="text"
                    value={draft.primary}
                    onChange={(event) =>
                      updateDraft("primary", event.target.value)
                    }
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Màu hover
                </label>

                <div className="flex gap-3">
                  <input
                    type="color"
                    value={draft.primaryHover}
                    onChange={(event) =>
                      updateDraft("primaryHover", event.target.value)
                    }
                    className="h-12 w-14 cursor-pointer rounded-lg border p-1"
                  />

                  <input
                    type="text"
                    value={draft.primaryHover}
                    onChange={(event) =>
                      updateDraft("primaryHover", event.target.value)
                    }
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Font chữ
                </label>

                <select
                  value={draft.fontFamily}
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

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    Cỡ chữ
                  </label>

                  <span className="text-sm text-pink-600">
                    {draft.fontSize}px
                  </span>
                </div>

                <input
                  type="range"
                  min="14"
                  max="20"
                  step="1"
                  value={draft.fontSize}
                  onChange={(event) =>
                    updateDraft("fontSize", Number(event.target.value))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    Độ bo góc
                  </label>

                  <span className="text-sm text-pink-600">
                    {draft.radius}px
                  </span>
                </div>

                <input
                  type="range"
                  min="6"
                  max="24"
                  step="1"
                  value={draft.radius}
                  onChange={(event) =>
                    updateDraft("radius", Number(event.target.value))
                  }
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
                >
                  <FiSave />
                  Lưu giao diện
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <FiRotateCcw />
                  Khôi phục
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-gray-900">Xem trước</h2>

            <div
              className="mt-5 rounded-xl border border-gray-200 p-5"
              style={{
                fontFamily: draft.fontFamily,
                fontSize: `${draft.fontSize}px`,
              }}
            >
              <div
                className="flex h-12 items-center justify-center text-white font-semibold"
                style={{
                  backgroundColor: draft.primary,
                  borderRadius: `${draft.radius}px`,
                }}
              >
                Flower Shop
              </div>

              <h3 className="mt-5 text-xl font-bold">Hoa tươi mỗi ngày</h3>

              <p className="mt-2 text-sm text-gray-500">
                Giao diện xem trước giúp Admin kiểm tra thay đổi trước khi sử
                dụng.
              </p>

              <button
                type="button"
                className="mt-5 px-5 py-2.5 text-sm font-semibold text-white"
                style={{
                  backgroundColor: draft.primary,
                  borderRadius: `${draft.radius}px`,
                }}
              >
                Xem sản phẩm
              </button>
            </div>

            <p className="mt-5 text-xs leading-5 text-gray-500">
              Các thiết lập này chỉ tác động đến phần nhận diện giao diện cơ
              bản. Không thay đổi logic tài khoản, đơn hàng hoặc dữ liệu sản
              phẩm.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminAppearancePage;
