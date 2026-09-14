import { useMemo, useState } from "react";

import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiFolder,
  FiUpload,
  FiX,
} from "react-icons/fi";

import { parseProductExcel } from "@/services/productExcel";
import { uploadImageFile } from "@/services/media";

const PREVIEW_OPTIONS = [10, 20, 50];

const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".avif",
  ".svg",
];

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const normalizeFileName = (value) => {
  let normalized = String(value || "")
    .replace(/\uFEFF/g, "")
    .replace(/[\u200B-\u200D\u2060]/g, "")
    .trim()
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "");

  normalized = normalized.replace(/\\/g, "/");

  const parts = normalized.split("/");

  normalized = parts[parts.length - 1] || normalized;

  return normalized.normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();
};

const getFileKey = (file) => normalizeFileName(file?.name);

const getFileExtension = (fileName) => {
  const normalized = normalizeFileName(fileName);
  const lastDot = normalized.lastIndexOf(".");

  return lastDot >= 0 ? normalized.slice(lastDot).toLowerCase() : "";
};

const isImageFile = (file) => {
  if (!file) {
    return false;
  }

  const type = String(file.type || "").toLowerCase();

  if (type.startsWith("image/")) {
    return true;
  }

  return IMAGE_EXTENSIONS.includes(getFileExtension(file.name));
};

const getFileDisplayPath = (file) =>
  String(file?.webkitRelativePath || file?.name || "").trim();

const findImageFile = (files, fileName) => {
  const normalizedName = normalizeFileName(fileName);

  if (!normalizedName) {
    return {
      file: null,
      reason: "Cột Hình ảnh đang trống.",
    };
  }

  const exactMatch = files.find((file) => getFileKey(file) === normalizedName);

  if (exactMatch) {
    return {
      file: exactMatch,
      reason: `Đã tìm thấy file "${getFileDisplayPath(exactMatch)}".`,
    };
  }

  const relativePathMatch = files.find((file) => {
    const relativePath = String(file.webkitRelativePath || "")
      .replace(/\\/g, "/")
      .trim();

    return normalizeFileName(relativePath) === normalizedName;
  });

  if (relativePathMatch) {
    return {
      file: relativePathMatch,
      reason: `Đã tìm thấy file trong đường dẫn "${getFileDisplayPath(
        relativePathMatch
      )}".`,
    };
  }

  const normalizedWithoutExtension = normalizedName.replace(/\.[^.]+$/, "");

  const sameStemMatch = files.find((file) => {
    const candidate = getFileKey(file).replace(/\.[^.]+$/, "");

    return candidate === normalizedWithoutExtension;
  });

  if (sameStemMatch) {
    return {
      file: null,
      reason: `Không khớp chính xác phần mở rộng. Excel yêu cầu "${fileName}", nhưng thư mục có "${getFileDisplayPath(
        sameStemMatch
      )}".`,
    };
  }

  const similarMatch = files.find((file) => {
    const candidate = getFileKey(file);

    return (
      candidate.includes(normalizedWithoutExtension) ||
      normalizedName.includes(candidate.replace(/\.[^.]+$/, ""))
    );
  });

  if (similarMatch) {
    return {
      file: null,
      reason: `Không khớp chính xác tên file. Excel yêu cầu "${fileName}", file gần giống đang có là "${getFileDisplayPath(
        similarMatch
      )}".`,
    };
  }

  return {
    file: null,
    reason: `Không tìm thấy "${fileName}" trong ${files.length} ảnh đã chọn. Tên sau khi chuẩn hóa được hệ thống kiểm tra là "${normalizedName}".`,
  };
};

const AdminProductExcelImportModal = ({
  open,
  categories,
  onClose,
  onConfirm,
}) => {
  const [file, setFile] = useState(null);

  const [rows, setRows] = useState([]);

  const [imageFiles, setImageFiles] = useState([]);

  const [previewSize, setPreviewSize] = useState(10);

  const [currentPage, setCurrentPage] = useState(1);

  const [parsing, setParsing] = useState(false);

  const [uploadingImages, setUploadingImages] = useState(false);

  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });

  const [parseError, setParseError] = useState("");

  const resetModalState = () => {
    setFile(null);
    setRows([]);
    setImageFiles([]);
    setParsing(false);
    setUploadingImages(false);
    setUploadProgress({
      current: 0,
      total: 0,
    });
    setParseError("");
    setPreviewSize(10);
    setCurrentPage(1);
  };

  const handleClose = () => {
    if (uploadingImages) {
      return;
    }

    resetModalState();
    onClose();
  };

  const summary = useMemo(() => {
    const valid = rows.filter((row) => row.status?.level === "success").length;

    const warnings = rows.filter(
      (row) => row.status?.level === "warning"
    ).length;

    const errors = rows.filter((row) => row.status?.level === "error").length;

    const pendingImages = rows.filter(
      (row) => row.imageType === "filename" && !row.matchedImageFile
    ).length;

    return {
      valid,
      warnings,
      errors,
      pendingImages,
    };
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(rows.length / previewSize));

  const safePage = Math.min(currentPage, totalPages);

  const previewStartIndex =
    rows.length === 0 ? 0 : (safePage - 1) * previewSize;

  const previewRows = useMemo(
    () => rows.slice(previewStartIndex, previewStartIndex + previewSize),
    [rows, previewStartIndex, previewSize]
  );

  const pageNumbers = useMemo(() => {
    const pages = [];

    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(page);
      }

      return pages;
    }

    pages.push(1);

    if (safePage > 4) {
      pages.push("ellipsis-start");
    }

    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    if (safePage < totalPages - 3) {
      pages.push("ellipsis-end");
    }

    pages.push(totalPages);

    return pages;
  }, [safePage, totalPages]);

  if (!open) {
    return null;
  }

  const resolveImageFilesForRows = (sourceRows, files) =>
    sourceRows.map((row) => {
      if (row.imageType !== "filename") {
        return row;
      }

      const match = findImageFile(files, row.imageFileName);

      if (match.file) {
        return {
          ...row,
          matchedImageFile: match.file,
          imageMatchMessage: match.reason,
          status: {
            code: "valid",
            label: "✅ Hợp lệ",
            level: "success",
          },
        };
      }

      return {
        ...row,
        matchedImageFile: null,
        imageMatchMessage: match.reason,
        status: {
          code: "image_file_not_found",
          label: "⚠️ Không tìm thấy ảnh",
          level: "warning",
        },
      };
    });

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setRows([]);
    setParseError("");
    setCurrentPage(1);
    setParsing(true);

    try {
      const result = await parseProductExcel(selectedFile, categories);

      const resolvedRows = resolveImageFilesForRows(result.rows, imageFiles);

      setRows(resolvedRows);
    } catch (error) {
      setParseError(error?.message || "Không thể đọc file Excel.");
    } finally {
      setParsing(false);
    }
  };

  const handleImageFolderChange = (event) => {
    const files = Array.from(event.target.files || []).filter(isImageFile);

    event.target.value = "";

    setImageFiles(files);

    setRows((currentRows) => resolveImageFilesForRows(currentRows, files));

    setCurrentPage(1);
    setParseError(
      files.length === 0
        ? "Không tìm thấy file ảnh hợp lệ trong thư mục đã chọn."
        : ""
    );
  };

  const handleRetryImageMatching = () => {
    if (!rows.length) {
      return;
    }

    if (!imageFiles.length) {
      setParseError(
        "Chưa có thư mục ảnh. Hãy chọn thư mục ảnh trước khi kiểm tra lại."
      );

      return;
    }

    const resolvedRows = resolveImageFilesForRows(rows, imageFiles);

    setRows(resolvedRows);
    setCurrentPage(1);

    const pendingCount = resolvedRows.filter(
      (row) => row.imageType === "filename" && !row.matchedImageFile
    ).length;

    setParseError(
      pendingCount > 0
        ? `Đã kiểm tra lại ${
            resolvedRows.filter((row) => row.imageType === "filename").length
          } dòng ảnh. Còn ${pendingCount} ảnh chưa ghép. Xem chi tiết ngay tại cột Hình ảnh.`
        : ""
    );
  };

  const handlePreviewSizeChange = (size) => {
    setPreviewSize(size);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((page) => Math.max(1, page - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  };

  const handleConfirm = async () => {
    if (!rows.length || summary.errors > 0 || summary.pendingImages > 0) {
      if (summary.pendingImages > 0) {
        setParseError(
          "Vẫn còn ảnh chưa được tìm thấy. Hãy chọn đúng thư mục ảnh hoặc kiểm tra chi tiết lỗi tại từng dòng."
        );
      }

      return;
    }

    setParseError("");

    const localImageRows = rows.filter((row) => row.imageType === "filename");

    setUploadingImages(true);

    setUploadProgress({
      current: 0,
      total: localImageRows.length,
    });

    try {
      const uploadedUrlCache = new Map();

      let completedCount = 0;

      for (const row of rows) {
        if (row.imageType !== "filename") {
          continue;
        }

        const imageFile = row.matchedImageFile;

        if (!imageFile) {
          setParseError(
            `Không tìm thấy file ảnh "${row.imageFileName}" cho dòng Excel ${row.rowNumber}. ${row.imageMatchMessage || ""}`
          );

          return;
        }

        const cacheKey = getFileKey(imageFile);

        let imageUrl = uploadedUrlCache.get(cacheKey);

        if (!imageUrl) {
          imageUrl = await uploadImageFile(imageFile, {
            folder: "flower-shop/products",
            maxWidth: 1400,
            maxHeight: 1000,
            quality: 0.82,
          });

          uploadedUrlCache.set(cacheKey, imageUrl);
        }

        completedCount += 1;

        setRows((currentRows) =>
          currentRows.map((currentRow) =>
            currentRow.rowNumber === row.rowNumber
              ? {
                  ...currentRow,
                  image: imageUrl,
                  imageType: "url",
                  imageFileName: "",
                  matchedImageFile: null,
                  imageMatchMessage:
                    "Ảnh đã được upload thành công lên Cloudinary.",
                  status: {
                    code: "valid",
                    label: "✅ Hợp lệ",
                    level: "success",
                  },
                }
              : currentRow
          )
        );

        setUploadProgress({
          current: completedCount,
          total: localImageRows.length,
        });
      }

      const latestRows = rows.map((row) => {
        if (row.imageType !== "filename") {
          return row;
        }

        const imageFile = row.matchedImageFile;

        if (!imageFile) {
          return row;
        }

        const imageUrl = uploadedUrlCache.get(getFileKey(imageFile));

        if (!imageUrl) {
          return row;
        }

        return {
          ...row,
          image: imageUrl,
          imageType: "url",
          imageFileName: "",
          matchedImageFile: null,
          imageMatchMessage: "Ảnh đã được upload thành công lên Cloudinary.",
          status: {
            code: "valid",
            label: "✅ Hợp lệ",
            level: "success",
          },
        };
      });

      setRows(latestRows);

      const importableRows = latestRows.filter(
        (row) => row.status?.level !== "error"
      );

      if (importableRows.some((row) => row.imageType === "filename")) {
        setParseError(
          "Vẫn còn ảnh chưa được upload. Không thể hoàn tất nhập sản phẩm."
        );

        return;
      }

      await onConfirm(importableRows);

      resetModalState();
    } catch (uploadError) {
      setParseError(
        uploadError?.message ||
          "Không thể tải hình ảnh sản phẩm lên Cloudinary. Các ảnh đã upload thành công vẫn được giữ lại; bạn có thể tiếp tục xử lý phần còn lại."
      );
    } finally {
      setUploadingImages(false);
    }
  };

  const canConfirm =
    !parsing &&
    !uploadingImages &&
    rows.length > 0 &&
    summary.errors === 0 &&
    summary.pendingImages === 0;

  const firstVisibleRowNumber = rows.length === 0 ? 0 : previewStartIndex + 1;

  const lastVisibleRowNumber = Math.min(
    previewStartIndex + previewRows.length,
    rows.length
  );

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Nhập sản phẩm từ Excel
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Đọc file .xlsx, kiểm tra dữ liệu, ghép ảnh và xem trước trước khi
              lưu.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={uploadingImages}
            className="rounded-full p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
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
                disabled={parsing || uploadingImages}
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

              <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm leading-6 text-green-800">
                <p className="font-bold">Nhập ảnh hàng loạt</p>

                <p className="mt-2">
                  Trong cột <strong>Hình ảnh</strong> của Excel, chỉ cần ghi tên
                  file, ví dụ:
                </p>

                <p className="mt-2 rounded-lg bg-white px-3 py-2 font-mono text-xs">
                  hoa-khai-truong-2.jpg
                </p>

                <label
                  htmlFor="product-image-folder"
                  className={`mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${
                    uploadingImages
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  <FiFolder />

                  {imageFiles.length > 0
                    ? `Đã chọn ${imageFiles.length} ảnh`
                    : "Chọn thư mục ảnh"}

                  <input
                    id="product-image-folder"
                    type="file"
                    accept="image/*"
                    multiple
                    webkitdirectory="true"
                    className="sr-only"
                    onChange={handleImageFolderChange}
                    disabled={uploadingImages}
                  />
                </label>

                <p className="mt-2 text-xs text-green-700">
                  Đặt toàn bộ ảnh sản phẩm trong một thư mục. Cột Hình ảnh chỉ
                  cần ghi đúng tên file. Hệ thống sẽ tự tìm ảnh, upload lên
                  Cloudinary và gắn URL vào sản phẩm.
                </p>

                {rows.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRetryImageMatching}
                    disabled={uploadingImages || imageFiles.length === 0}
                    className="mt-3 w-full rounded-lg border border-green-300 bg-white px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Kiểm tra lại ảnh
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                <p className="font-bold">Nếu đã có URL Cloudinary</p>

                <p className="mt-2">Bạn vẫn có thể nhập trực tiếp:</p>

                <p className="mt-2 break-all rounded-lg bg-white px-3 py-2 font-mono text-xs">
                  https://res.cloudinary.com/...
                </p>

                <p className="mt-2">
                  Ảnh có URL Cloudinary sẽ không được upload lại.
                </p>

                <p className="mt-2 font-semibold">Không nhập:</p>

                <code className="mt-1 block rounded-lg bg-white px-3 py-2 text-xs">
                  C:\Users\...
                </code>

                <code className="mt-1 block rounded-lg bg-white px-3 py-2 text-xs">
                  D:\FlowerShop\...
                </code>
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

                    {summary.pendingImages > 0 && (
                      <p className="text-amber-700">
                        📷 Ảnh chưa ghép:{" "}
                        <strong>{summary.pendingImages}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {uploadingImages && (
                <div className="rounded-xl border border-pink-100 bg-pink-50 p-4">
                  <p className="text-sm font-semibold text-pink-700">
                    Đang tải ảnh lên Cloudinary...
                  </p>

                  <p className="mt-1 text-xs text-pink-600">
                    {uploadProgress.current} / {uploadProgress.total} ảnh
                  </p>
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

                    <p className="whitespace-pre-wrap">{parseError}</p>
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
                        Hiển thị dòng <strong>{firstVisibleRowNumber}</strong> –{" "}
                        <strong>{lastVisibleRowNumber}</strong> / {rows.length}{" "}
                        sản phẩm
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500">Xem:</span>

                      {PREVIEW_OPTIONS.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handlePreviewSizeChange(size)}
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
                          <th className="px-4 py-3">STT</th>

                          <th className="px-4 py-3">Tên sản phẩm</th>

                          <th className="px-4 py-3">Giá</th>

                          <th className="px-4 py-3">Giá cũ</th>

                          <th className="px-4 py-3">Danh mục</th>

                          <th className="px-4 py-3">Hình ảnh</th>

                          <th className="px-4 py-3">Trạng thái</th>
                        </tr>
                      </thead>

                      <tbody>
                        {previewRows.map((row, index) => {
                          const isError = row.status?.level === "error";

                          const isWarning = row.status?.level === "warning";

                          const displayIndex = previewStartIndex + index + 1;

                          return (
                            <tr
                              key={`${row.rowNumber}-${row.name}`}
                              className="border-b border-gray-100 last:border-0"
                            >
                              <td className="px-4 py-3 text-gray-500">
                                {displayIndex}
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

                              <td className="max-w-[340px] px-4 py-3">
                                {row.imageType === "filename" ? (
                                  <div>
                                    <p className="truncate text-xs font-semibold text-gray-700">
                                      {row.imageFileName}
                                    </p>

                                    <p
                                      className={`mt-1 text-[11px] ${
                                        row.matchedImageFile
                                          ? "text-green-600"
                                          : "text-amber-600"
                                      }`}
                                    >
                                      {row.matchedImageFile
                                        ? "Đã tìm thấy ảnh"
                                        : "Chưa tìm thấy ảnh"}
                                    </p>

                                    {!row.matchedImageFile &&
                                      row.imageMatchMessage && (
                                        <p className="mt-1 break-words text-[11px] leading-4 text-red-600">
                                          {row.imageMatchMessage}
                                        </p>
                                      )}

                                    {row.matchedImageFile &&
                                      row.imageMatchMessage && (
                                        <p className="mt-1 break-words text-[11px] leading-4 text-green-700">
                                          {row.imageMatchMessage}
                                        </p>
                                      )}
                                  </div>
                                ) : row.image ? (
                                  <span className="block break-all text-xs text-blue-600">
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
                                  {row.status?.level === "success" ? (
                                    <FiCheckCircle />
                                  ) : (
                                    <FiAlertTriangle />
                                  )}

                                  {row.status?.label || "Chưa xác định"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-gray-500">
                      Trang <strong>{safePage}</strong> /{" "}
                      <strong>{totalPages}</strong>
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePreviousPage}
                        disabled={safePage <= 1}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Trang trước"
                      >
                        <FiChevronLeft size={15} />
                        Trước
                      </button>

                      {pageNumbers.map((page) =>
                        typeof page === "number" ? (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-9 rounded-lg border px-3 py-2 text-xs font-semibold ${
                              safePage === page
                                ? "border-pink-600 bg-pink-600 text-white"
                                : "border-gray-200 bg-white text-gray-700 hover:bg-pink-50"
                            }`}
                            aria-label={`Trang ${page}`}
                            aria-current={
                              safePage === page ? "page" : undefined
                            }
                          >
                            {page}
                          </button>
                        ) : (
                          <span
                            key={page}
                            className="px-1 text-xs text-gray-400"
                          >
                            …
                          </span>
                        )
                      )}

                      <button
                        type="button"
                        onClick={handleNextPage}
                        disabled={safePage >= totalPages}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Trang sau"
                      >
                        Sau
                        <FiChevronRight size={15} />
                      </button>
                    </div>
                  </div>
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
              summary.pendingImages > 0 && (
                <span className="font-semibold text-amber-600">
                  Có ảnh chưa ghép. Xem nguyên nhân cụ thể ngay tại từng dòng
                  trong cột Hình ảnh.
                </span>
              )}

            {rows.length > 0 &&
              summary.errors === 0 &&
              summary.pendingImages === 0 &&
              summary.warnings > 0 && (
                <span className="font-semibold text-amber-600">
                  Có dòng cảnh báo hình ảnh. Các URL không hợp lệ sẽ được xử lý
                  theo quy tắc nhập hiện tại.
                </span>
              )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploadingImages}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiCheckCircle />

              {uploadingImages
                ? `Đang tải ảnh ${uploadProgress.current}/${uploadProgress.total}...`
                : summary.errors > 0
                  ? "Không thể nhập"
                  : summary.pendingImages > 0
                    ? "Chưa đủ ảnh"
                    : `Xác nhận nhập ${
                        summary.valid + summary.warnings
                      } sản phẩm`}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminProductExcelImportModal;
