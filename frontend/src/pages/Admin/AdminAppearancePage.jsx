/*
============================================================
FLOWER SHOP — ADMIN APPEARANCE
============================================================

Admin chỉ chỉnh giao diện cơ bản.
Không cần sửa code.

Có:
- Màu chủ đạo
- Màu phụ
- Màu chữ
- Font
- Cỡ chữ
- Bo góc
- Khôi phục mặc định
============================================================
*/

import { FiRotateCcw, FiSave } from "react-icons/fi";

import { DEFAULT_THEME, useTheme } from "@/context/ThemeProvider";

const AdminAppearancePage = () => {
  const { theme, updateTheme, resetTheme } = useTheme();

  return (
    <section className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Tùy chỉnh giao diện
          </h1>

          <p className="mt-2 text-gray-500">
            Thay đổi giao diện cơ bản mà không cần chỉnh sửa code.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Màu chủ đạo
              </label>

              <div className="flex gap-3">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(event) =>
                    updateTheme({
                      primaryColor: event.target.value,
                    })
                  }
                  className="w-14 h-11 rounded cursor-pointer"
                />

                <input
                  value={theme.primaryColor}
                  onChange={(event) =>
                    updateTheme({
                      primaryColor: event.target.value,
                    })
                  }
                  className="flex-1 border border-gray-200 rounded-lg px-4"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Màu phụ</label>

              <div className="flex gap-3">
                <input
                  type="color"
                  value={theme.secondaryColor}
                  onChange={(event) =>
                    updateTheme({
                      secondaryColor: event.target.value,
                    })
                  }
                  className="w-14 h-11 rounded cursor-pointer"
                />

                <input
                  value={theme.secondaryColor}
                  onChange={(event) =>
                    updateTheme({
                      secondaryColor: event.target.value,
                    })
                  }
                  className="flex-1 border border-gray-200 rounded-lg px-4"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Màu chữ</label>

              <div className="flex gap-3">
                <input
                  type="color"
                  value={theme.textColor}
                  onChange={(event) =>
                    updateTheme({
                      textColor: event.target.value,
                    })
                  }
                  className="w-14 h-11 rounded cursor-pointer"
                />

                <input
                  value={theme.textColor}
                  onChange={(event) =>
                    updateTheme({
                      textColor: event.target.value,
                    })
                  }
                  className="flex-1 border border-gray-200 rounded-lg px-4"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Font chữ</label>

              <select
                value={theme.fontFamily}
                onChange={(event) =>
                  updateTheme({
                    fontFamily: event.target.value,
                  })
                }
                className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white"
              >
                <option value="Inter, system-ui, sans-serif">Inter</option>

                <option value="Arial, sans-serif">Arial</option>

                <option value="Georgia, serif">Georgia</option>

                <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cỡ chữ cơ bản
              </label>

              <input
                type="number"
                min="12"
                max="22"
                value={theme.baseFontSize}
                onChange={(event) =>
                  updateTheme({
                    baseFontSize: Number(event.target.value),
                  })
                }
                className="w-full border border-gray-200 rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bo góc</label>

              <input
                type="range"
                min="0"
                max="24"
                value={theme.borderRadius}
                onChange={(event) =>
                  updateTheme({
                    borderRadius: Number(event.target.value),
                  })
                }
                className="w-full"
              />

              <p className="text-sm text-gray-500 mt-1">
                {theme.borderRadius}px
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-xl bg-[var(--fs-secondary)]">
            <p
              style={{
                color: "var(--fs-text)",
                fontFamily: "var(--fs-font-family)",
                fontSize: "var(--fs-base-font-size)",
              }}
            >
              Đây là khu vực xem trước giao diện.
            </p>

            <button
              type="button"
              style={{
                backgroundColor: "var(--fs-primary)",
                borderRadius: "var(--fs-radius)",
              }}
              className="mt-4 px-5 py-3 text-white font-semibold"
            >
              Nút xem trước
            </button>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={resetTheme}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <FiRotateCcw />
              Khôi phục mặc định
            </button>

            <div className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-green-50 text-green-700">
              <FiSave />
              Thay đổi được lưu tự động
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminAppearancePage;
