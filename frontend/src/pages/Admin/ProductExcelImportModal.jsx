import { useMemo, useState } from "react";

import {
  FiAlertTriangle,
  FiCheckCircle,
  FiFileText,
  FiUpload,
  FiX,
} from "react-icons/fi";

import { parseProductExcel } from "@/services/productExcel";

const PREVIEW_OPTIONS = [10, 20, 50];

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const ProductExcelImportModal = ({ open, categories, onClose, onConfirm }) => {
  const [file, setFile] = useState(null);

  const [rows, setRows] = useState([]);

  const [previewSize, setPreviewSize] = useState(10);

  const [parsing, setParsing] = useState(false);

  const [parseError, setParseError] = useState("");

  const summary = useMemo(() => {
    const valid = rows.filter((row) => row.status.level === "success").length;

    const warnings = rows.filter(
      (row) => row.status.level === "warning"
    ).length;

    const errors = rows.filter((row) => row.status.level === "error").length;

    return {
      valid,
      warnings,
      errors,
    };
  }, [rows]);

  const previewRows = useMemo(
    () => rows.slice(0, previewSize),
    [rows, previewSize]
  );

  if (!open) {
    return null;
  }

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);

    setRows([]);

    setParseError("");

    setParsing(true);

    try {
      const result = await parseProductExcel(selectedFile, categories);

      setRows(result.rows);
    } catch (error) {
      setParseError(error?.message || "Không thể đọc file Excel.");
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = () => {
    const importableRows = rows.filter((row) => row.status.level !== "error");

    if (!importableRows.length) {
      return;
    }

    onConfirm(importableRows);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Nhập sản phẩm từ Excel
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Đọc file .xlsx, kiểm tra dữ liệu và xem trước trước khi lưu.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Đóng"
          >
            <FiX size={20} />
          </button>
        </header>

        <div className="overflow-y-auto p-6">
          <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
            <aside className="space-y-4">
              <label
                htmlFor="product-excel-file"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50 p-8 text-center transition hover:border-pink-400 hover:bg-pink-100"
              >
                <FiUpload size={32} className="text-pink-600" />

                <span className="mt-3 text-sm font-bold text-pink-700">
                  Chọn file Excel
                </span>

                <span className="mt-1 text-xs text-pink-600">
                  Chỉ hỗ trợ .xlsx
                </span>
              </label>

              <input
                id="product-excel-file"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="sr-only"
                onChange={handleFileChange}
                disabled={parsing}
              />

              {file && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <FiFileText
                      className="mt-0.5 shrink-0 text-gray-500"
                      size={20}
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                <p className="font-bold">Hướng dẫn hình ảnh</p>

                <p className="mt-2">
                  Ảnh không đưa trực tiếp vào Excel. Hãy upload ảnh bằng chức
                  năng <strong>Chọn tệp</strong> trong Quản lý sản phẩm để ảnh
                  được lưu lên Cloudinary.
                </p>

                <p className="mt-2">
                  Sau đó dùng URL ảnh
                  <strong> https://res.cloudinary.com/...</strong> trong cột{" "}
                  <strong>Hình ảnh</strong>.
                </p>

                <p className="mt-2">
                  Không dùng:
                  <br />
                  <code>C:\Users\...</code>
                  <br />
                  hoặc
                  <br />
                  <code>D:\FlowerShop\...</code>
                </p>
              </div>

              {rows.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-sm font-bold text-gray-800">
                    Kết quả kiểm tra
                  </p>

                  <div className="mt-3 space-y-2 text-sm">
                    <p className="text-green-600">
                      ✅ Hợp lệ: <strong>{summary.valid}</strong>
                    </p>

                    <p className="text-amber-600">
                      ⚠️ Cảnh báo: <strong>{summary.warnings}</strong>
                    </p>

                    <p className="text-red-600">
                      ❌ Lỗi: <strong>{summary.errors}</strong>
                    </p>
                  </div>
                </div>
              )}
            </aside>

            <section className="min-w-0">
              {parsing && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-700">
                  Đang đọc và kiểm tra file Excel...
                </div>
              )}

              {parseError && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
                  <div className="flex items-start gap-3">
                    <FiAlertTriangle className="mt-0.5 shrink-0" size={18} />

                    <p>{parseError}</p>
                  </div>
                </div>
              )}

              {!parsing && !parseError && rows.length === 0 && (
                <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 text-center">
                  <div>
                    <FiFileText size={42} className="mx-auto text-gray-300" />

                    <p className="mt-4 text-sm font-semibold text-gray-600">
                      Chưa có dữ liệu xem trước
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Chọn file Excel để bắt đầu kiểm tra.
                    </p>
                  </div>
                </div>
              )}

              {rows.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        Preview dữ liệu
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Hiển thị {Math.min(previewSize, rows.length)} /{" "}
                        {rows.length} dòng
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Xem:</span>

                      {PREVIEW_OPTIONS.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setPreviewSize(size)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                            previewSize === size
                              ? "border-pink-600 bg-pink-600 text-white"
                              : "border-gray-200 bg-white text-gray-700 hover:bg-pink-50"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-[1100px] w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-white text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                          <th className="px-4 py-3">Dòng</th>

                          <th className="px-4 py-3">Tên sản phẩm</th>

                          <th className="px-4 py-3">Giá</th>

                          <th className="px-4 py-3">Giá cũ</th>

                          <th className="px-4 py-3">Danh mục</th>

                          <th className="px-4 py-3">Hình ảnh</th>

                          <th className="px-4 py-3">Trạng thái</th>
                        </tr>
                      </thead>

                      <tbody>
                        {previewRows.map((row) => {
                          const isError = row.status.level === "error";

                          const isWarning = row.status.level === "warning";

                          return (
                            <tr
                              key={`${row.rowNumber}-${row.name}`}
                              className="border-b border-gray-100 last:border-0"
                            >
                              <td className="px-4 py-3 text-gray-500">
                                {row.rowNumber}
                              </td>

                              <td className="max-w-[220px] px-4 py-3 font-semibold text-gray-800">
                                <div className="line-clamp-2">
                                  {row.name || "—"}
                                </div>
                              </td>

                              <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                {row.price ? money(row.price) : "—"}
                              </td>

                              <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                                {row.oldPrice ? money(row.oldPrice) : "—"}
                              </td>

                              <td className="px-4 py-3 text-gray-700">
                                {row.categoryName || "—"}
                              </td>

                              <td className="max-w-[250px] px-4 py-3">
                                {row.image ? (
                                  <span className="block truncate text-xs text-blue-600">
                                    {row.image}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    Không có
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                    isError
                                      ? "bg-red-50 text-red-700"
                                      : isWarning
                                        ? "bg-amber-50 text-amber-700"
                                        : "bg-green-50 text-green-700"
                                  }`}
                                >
                                  {row.status.level === "success" ? (
                                    <FiCheckCircle />
                                  ) : (
                                    <FiAlertTriangle />
                                  )}

                                  {row.status.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {rows.length > previewSize && (
                    <p className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-500">
                      Còn {rows.length - previewSize} dòng chưa hiển thị.
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>

        <footer className="flex flex-col gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-gray-500">
            {rows.length > 0 && summary.errors > 0 && (
              <span className="font-semibold text-red-600">
                Có lỗi dữ liệu. Hãy sửa Excel trước khi nhập.
              </span>
            )}

            {rows.length > 0 &&
              summary.errors === 0 &&
              summary.warnings > 0 && (
                <span className="font-semibold text-amber-600">
                  Có dòng cảnh báo hình ảnh. Các dòng này vẫn được nhập, nhưng
                  hình ảnh không hợp lệ sẽ được bỏ qua.
                </span>
              )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={parsing || rows.length === 0 || summary.errors > 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiCheckCircle />

              {summary.errors > 0
                ? "Không thể nhập"
                : `Xác nhận nhập ${summary.valid + summary.warnings} sản phẩm`}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ProductExcelImportModal;
