import { useMemo, useState } from "react";

import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiFolder,
  FiInfo,
  FiUpload,
  FiX,
} from "react-icons/fi";

import { parseProductExcel } from "@/services/productExcel";
import { uploadImageFile } from "@/services/media";
import { readProducts, waitForProductsPersistence } from "@/services/catalog";

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

const normalizeIdentityPart = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ");

const createProductIdentityKey = (product) =>
  `${normalizeIdentityPart(product?.name)}::${normalizeIdentityPart(
    product?.category
  )}`;

const normalizeFileName = (value) => {
  let normalized = String(value || "")
    .replace(/\uFEFF/g, "")
    .replace(/[\u200B-\u200D\u2060]/g, "")
    .replace(/\u00A0/g, " ")
    .trim()
    .replace(/^[ "'“”‘’]+|[ "'“”‘’]+$/g, "");

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

const getImageStem = (value) =>
  normalizeFileName(value).replace(/\.[^.]+$/, "");

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
    const relativePath = String(file?.webkitRelativePath || "")
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

  const normalizedStem = getImageStem(normalizedName);

  const sameStemMatch = files.find(
    (file) => getImageStem(file?.name) === normalizedStem
  );

  if (sameStemMatch) {
    return {
      file: null,
      reason: `Tên file gần như trùng nhau nhưng khác phần mở rộng. Excel yêu cầu "${fileName}", trong thư mục có "${getFileDisplayPath(
        sameStemMatch
      )}".`,
    };
  }

  const similarMatch = files.find((file) => {
    const candidateName = getFileKey(file);

    const candidateStem = getImageStem(candidateName);

    return (
      candidateName.includes(normalizedStem) ||
      normalizedName.includes(candidateStem)
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
    reason: `Không tìm thấy "${fileName}" trong ${files.length} ảnh đã chọn.`,
  };
};

const createProductVerificationSignature = (product) =>
  JSON.stringify([
    String(product?.name || "").trim(),
    Number(product?.price || 0),
    product?.oldPrice === null ||
    product?.oldPrice === undefined ||
    product?.oldPrice === ""
      ? null
      : Number(product.oldPrice),
    String(product?.category || "").trim(),
    String(product?.description || "").trim(),
    String(product?.image || "").trim(),
  ]);

const createSignatureCountMap = (products) => {
  const counts = new Map();

  for (const product of products) {
    const signature = createProductVerificationSignature(product);

    counts.set(signature, (counts.get(signature) || 0) + 1);
  }

  return counts;
};

const verifyImportedProductsWereSaved = async (
  beforeProducts,
  importedRows
) => {
  await waitForProductsPersistence();

  const afterProducts = readProducts();

  const beforeCounts = createSignatureCountMap(beforeProducts);

  const afterCounts = createSignatureCountMap(afterProducts);

  const importedCounts = createSignatureCountMap(importedRows);

  const missingRows = [];

  for (const [signature, requiredCount] of importedCounts.entries()) {
    const beforeCount = beforeCounts.get(signature) || 0;

    const afterCount = afterCounts.get(signature) || 0;

    const actualIncrease = afterCount - beforeCount;

    if (actualIncrease < requiredCount) {
      const row = importedRows.find(
        (item) => createProductVerificationSignature(item) === signature
      );

      missingRows.push({
        rowNumber: row?.rowNumber || "?",
        name: row?.name || "Không xác định",
      });
    }
  }

  if (missingRows.length > 0) {
    return {
      success: false,
      message: "Dữ liệu sản phẩm chưa được lưu đầy đủ vào Catalog.",
      missingRows,
    };
  }

  return {
    success: true,
    products: afterProducts,
  };
};

const escapeCsv = (value) => {
  const text = String(value ?? "");

  return `"${text.replace(/"/g, '""')}"`;
};

const downloadErrorReport = (rows) => {
  const errorRows = rows.filter(
    (row) =>
      row.status?.level === "error" ||
      row.status?.level === "warning" ||
      row.duplicate
  );

  if (errorRows.length === 0) {
    return;
  }

  const header = [
    "Dòng Excel",
    "Tên sản phẩm",
    "Danh mục",
    "Trạng thái",
    "Chi tiết",
    "Hình ảnh",
  ];

  const lines = [header.map(escapeCsv).join(",")];

  for (const row of errorRows) {
    const details = [
      ...(row.status?.details || []),
      row.imageMatchMessage,
      row.duplicateMessage,
    ].filter(Boolean);

    lines.push(
      [
        row.rowNumber,
        row.name,
        row.categoryName || row.category,
        row.status?.label || "Chưa xác định",
        details.join(" | "),
        row.imageFileName || row.image || "",
      ]
        .map(escapeCsv)
        .join(",")
    );
  }

  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;

  anchor.download = "flower-shop-product-import-errors.csv";

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
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

  const [savingProducts, setSavingProducts] = useState(false);

  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });

  const [parseError, setParseError] = useState("");

  const [operationMessage, setOperationMessage] = useState("");

  const resetModalState = () => {
    setFile(null);
    setRows([]);
    setImageFiles([]);
    setParsing(false);
    setUploadingImages(false);
    setSavingProducts(false);

    setUploadProgress({
      current: 0,
      total: 0,
    });

    setParseError("");
    setOperationMessage("");
    setPreviewSize(10);
    setCurrentPage(1);
  };

  const isBusy = parsing || uploadingImages || savingProducts;

  const handleClose = () => {
    if (isBusy) {
      return;
    }

    resetModalState();
    onClose();
  };

  const currentProducts = useMemo(() => readProducts(), [rows]);

  const existingIdentityMap = useMemo(() => {
    const map = new Map();

    for (const product of currentProducts) {
      map.set(createProductIdentityKey(product), product);
    }

    return map;
  }, [currentProducts]);

  const markDuplicates = (sourceRows) => {
    const seen = new Set();

    return sourceRows.map((row) => {
      const identity = row.importIdentityKey || createProductIdentityKey(row);

      const existing = existingIdentityMap.get(identity);

      const duplicateInFile = seen.has(identity);

      seen.add(identity);

      if (existing) {
        return {
          ...row,
          duplicate: true,
          duplicateType: "existing",
          duplicateMessage: `Sản phẩm đã tồn tại trong Catalog: "${existing.name}". Dòng này sẽ được bỏ qua để tránh duplicate.`,
          status: {
            code: "duplicate_existing",
            label: "⚠️ Sản phẩm đã tồn tại",
            level: "warning",
            details: [
              "Sản phẩm cùng tên và danh mục đã tồn tại.",
              "Hệ thống sẽ không tạo thêm sản phẩm trùng.",
            ],
          },
        };
      }

      if (duplicateInFile) {
        return {
          ...row,
          duplicate: true,
          duplicateType: "file",
          duplicateMessage: "Sản phẩm bị trùng trong chính file Excel.",
          status: {
            code: "duplicate_file",
            label: "❌ Trùng trong file",
            level: "error",
            details: [
              "Tên sản phẩm và danh mục trùng với một dòng khác trong file.",
            ],
          },
        };
      }

      return {
        ...row,
        duplicate: false,
        duplicateType: "",
        duplicateMessage: "",
      };
    });
  };

  const summary = useMemo(() => {
    const valid = rows.filter(
      (row) => row.status?.level === "success" && !row.duplicate
    ).length;

    const warnings = rows.filter(
      (row) => row.status?.level === "warning"
    ).length;

    const errors = rows.filter((row) => row.status?.level === "error").length;

    const pendingImages = rows.filter(
      (row) => row.imageType === "filename" && !row.matchedImageFile
    ).length;

    const duplicates = rows.filter((row) => row.duplicate).length;

    return {
      valid,
      warnings,
      errors,
      pendingImages,
      duplicates,
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
            details: [],
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
          details: [match.reason],
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
    setOperationMessage("");
    setCurrentPage(1);
    setParsing(true);

    try {
      const result = await parseProductExcel(selectedFile, categories);

      const resolvedRows = resolveImageFilesForRows(
        markDuplicates(result.rows),
        imageFiles
      );

      setRows(resolvedRows);

      setOperationMessage(
        `Đã đọc ${resolvedRows.length} dòng sản phẩm từ file Excel.`
      );
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
    setOperationMessage("");

    setRows((currentRows) => resolveImageFilesForRows(currentRows, files));

    setCurrentPage(1);

    if (files.length === 0) {
      setParseError("Không tìm thấy file ảnh hợp lệ trong thư mục đã chọn.");
    } else {
      setParseError("");

      setOperationMessage(
        `Đã nhận ${files.length} ảnh. Hệ thống đã kiểm tra lại khả năng ghép ảnh với Excel.`
      );
    }
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

    setRows(markDuplicates(resolvedRows));

    setCurrentPage(1);

    const filenameRows = resolvedRows.filter(
      (row) => row.imageType === "filename"
    );

    const pendingCount = filenameRows.filter(
      (row) => !row.matchedImageFile
    ).length;

    if (pendingCount > 0) {
      setParseError(
        `Đã kiểm tra lại ${filenameRows.length} dòng có ảnh. Còn ${pendingCount} ảnh chưa ghép.`
      );

      setOperationMessage("");
    } else {
      setParseError("");

      setOperationMessage(
        `Đã ghép thành công toàn bộ ${filenameRows.length} dòng ảnh với thư mục đã chọn.`
      );
    }
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
    if (!rows.length) {
      setParseError("Chưa có dữ liệu sản phẩm để nhập.");

      return;
    }

    if (summary.errors > 0) {
      setParseError(
        "File Excel còn lỗi dữ liệu hoặc có dòng trùng trong chính file. Hãy sửa các dòng lỗi trước khi nhập."
      );

      return;
    }

    if (summary.pendingImages > 0) {
      setParseError(
        "Vẫn còn ảnh chưa được tìm thấy. Hãy chọn đúng thư mục ảnh hoặc kiểm tra chi tiết tại từng dòng."
      );

      return;
    }

    const importableRows = rows.filter(
      (row) => !row.duplicate && row.status?.level !== "error"
    );

    if (importableRows.length === 0) {
      setParseError(
        "Không có sản phẩm mới để nhập. Các sản phẩm trong file đã tồn tại hoặc đã bị loại do trùng dữ liệu."
      );

      return;
    }

    setParseError("");
    setOperationMessage("");

    const localImageRows = importableRows.filter(
      (row) => row.imageType === "filename"
    );

    setUploadingImages(true);

    setUploadProgress({
      current: 0,
      total: localImageRows.length,
    });

    try {
      const uploadedUrlCache = new Map();

      let completedCount = 0;

      for (const row of importableRows) {
        if (row.imageType !== "filename") {
          continue;
        }

        const imageFile = row.matchedImageFile;

        if (!imageFile) {
          setParseError(
            `Không tìm thấy file ảnh "${row.imageFileName}" cho dòng Excel ${row.rowNumber}.`
          );

          return;
        }

        const cacheKey = getFileKey(imageFile);

        let imageUrl = uploadedUrlCache.get(cacheKey);

        if (!imageUrl) {
          try {
            setOperationMessage(
              `Đang upload ảnh "${getFileDisplayPath(
                imageFile
              )}" lên Cloudinary...`
            );

            imageUrl = await uploadImageFile(imageFile, {
              folder: "flower-shop/products",
              maxWidth: 1400,
              maxHeight: 1000,
              quality: 0.82,
            });

            if (!imageUrl) {
              throw new Error(
                "Cloudinary không trả về URL ảnh sau khi upload."
              );
            }

            uploadedUrlCache.set(cacheKey, imageUrl);
          } catch (imageError) {
            const reason =
              imageError?.message ||
              "Không xác định được nguyên nhân upload ảnh.";

            setRows((currentRows) =>
              currentRows.map((currentRow) =>
                currentRow.rowNumber === row.rowNumber
                  ? {
                      ...currentRow,
                      status: {
                        code: "image_upload_failed",
                        label: "❌ Upload ảnh lỗi",
                        level: "error",
                        details: [reason],
                      },
                      imageMatchMessage: `Upload thất bại: ${reason}`,
                    }
                  : currentRow
              )
            );

            setParseError(
              `Upload ảnh thất bại tại dòng Excel ${row.rowNumber} - "${row.imageFileName}".\n\nNguyên nhân: ${reason}\n\nCác ảnh đã upload thành công vẫn được giữ lại. Khi xác nhận lại, hệ thống chỉ xử lý ảnh chưa thành công.`
            );

            return;
          }
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
                    details: [],
                  },
                }
              : currentRow
          )
        );

        setUploadProgress({
          current: completedCount,
          total: localImageRows.length,
        });

        setOperationMessage(
          `Đã upload thành công ${completedCount}/${localImageRows.length} ảnh lên Cloudinary.`
        );
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
            details: [],
          },
        };
      });

      const finalRows = markDuplicates(latestRows);

      setRows(finalRows);

      const rowsReadyForSave = finalRows.filter(
        (row) =>
          !row.duplicate &&
          row.status?.level !== "error" &&
          row.imageType !== "filename"
      );

      if (rowsReadyForSave.length === 0) {
        setParseError("Không còn sản phẩm mới đủ điều kiện để lưu.");

        return;
      }

      setSavingProducts(true);

      setOperationMessage(
        `Đã xử lý ảnh. Đang lưu ${rowsReadyForSave.length} sản phẩm vào Catalog...`
      );

      const beforeProducts = readProducts();

      try {
        const result = await onConfirm(rowsReadyForSave);

        if (result && result.success === false) {
          throw new Error(result.message || "Không thể xác nhận lưu sản phẩm.");
        }
      } catch (saveError) {
        setParseError(
          saveError?.message || "Không thể lưu danh sách sản phẩm."
        );

        setOperationMessage(
          "Ảnh đã upload thành công. Dữ liệu sản phẩm chưa hoàn tất lưu."
        );

        return;
      } finally {
        setSavingProducts(false);
      }

      const verification = await verifyImportedProductsWereSaved(
        beforeProducts,
        rowsReadyForSave
      );

      if (!verification.success) {
        const detail =
          verification.missingRows
            ?.slice(0, 5)
            .map((item) => `- Dòng ${item.rowNumber}: ${item.name}`)
            .join("\n") || "";

        setParseError(
          `${verification.message}\n\n${detail}\n\nCác ảnh đã upload thành công vẫn được giữ lại và sẽ không bị upload lại.`
        );

        setOperationMessage(
          "Upload ảnh thành công nhưng bước lưu sản phẩm chưa được xác minh hoàn tất."
        );

        return;
      }

      const skippedDuplicates = rows.filter((row) => row.duplicate).length;

      setParseError("");

      setOperationMessage(
        `Đã nhập thành công ${rowsReadyForSave.length} sản phẩm.${
          skippedDuplicates > 0
            ? ` Đã bỏ qua ${skippedDuplicates} sản phẩm trùng để tránh duplicate.`
            : ""
        }`
      );

      setUploadProgress({
        current: localImageRows.length,
        total: localImageRows.length,
      });

      resetModalState();
    } catch (operationError) {
      setParseError(
        operationError?.message || "Không thể hoàn tất quá trình nhập sản phẩm."
      );

      setOperationMessage("");
    } finally {
      setUploadingImages(false);
      setSavingProducts(false);
    }
  };

  const canConfirm =
    !isBusy &&
    rows.length > 0 &&
    summary.errors === 0 &&
    summary.pendingImages === 0 &&
    summary.valid > 0;

  const firstVisibleRowNumber = rows.length === 0 ? 0 : previewStartIndex + 1;

  const lastVisibleRowNumber = Math.min(
    previewStartIndex + previewRows.length,
    rows.length
  );

  if (!open) {
    return null;
  }

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
            disabled={isBusy}
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
                disabled={isBusy}
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
                  file.
                </p>

                <p className="mt-2 rounded-lg bg-white px-3 py-2 font-mono text-xs">
                  hoa-khai-truong-2.jpg
                </p>

                <label
                  htmlFor="product-image-folder"
                  className={`mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${
                    isBusy
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
                    disabled={isBusy}
                  />
                </label>

                <p className="mt-2 text-xs text-green-700">
                  Đặt toàn bộ ảnh sản phẩm trong một thư mục. Hệ thống tự tìm
                  ảnh, upload Cloudinary và gắn URL vào sản phẩm.
                </p>

                {rows.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRetryImageMatching}
                    disabled={isBusy || imageFiles.length === 0}
                    className="mt-3 w-full rounded-lg border border-green-300 bg-white px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Kiểm tra lại ảnh
                  </button>
                )}
              </div>

              {rows.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-sm font-bold text-gray-800">
                    Kết quả kiểm tra
                  </p>

                  <div className="mt-3 space-y-2 text-sm">
                    <p className="text-green-600">
                      ✅ Có thể nhập: <strong>{summary.valid}</strong>
                    </p>

                    <p className="text-amber-600">
                      ⚠️ Cảnh báo: <strong>{summary.warnings}</strong>
                    </p>

                    <p className="text-red-600">
                      ❌ Lỗi: <strong>{summary.errors}</strong>
                    </p>

                    <p className="text-orange-600">
                      🔁 Duplicate: <strong>{summary.duplicates}</strong>
                    </p>

                    {summary.pendingImages > 0 && (
                      <p className="text-amber-700">
                        📷 Ảnh chưa ghép:{" "}
                        <strong>{summary.pendingImages}</strong>
                      </p>
                    )}
                  </div>

                  {(summary.errors > 0 ||
                    summary.warnings > 0 ||
                    summary.duplicates > 0) && (
                    <button
                      type="button"
                      onClick={() => downloadErrorReport(rows)}
                      className="mt-4 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Tải Error Report
                    </button>
                  )}
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

              {savingProducts && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-700">
                    Đang lưu danh sách sản phẩm...
                  </p>

                  <p className="mt-1 text-xs text-blue-600">
                    Hệ thống đang ghi dữ liệu vào Catalog.
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

              {operationMessage && !parseError && (
                <div className="mb-4 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="mt-0.5 shrink-0" size={18} />

                    <p className="whitespace-pre-wrap">{operationMessage}</p>
                  </div>
                </div>
              )}

              {operationMessage && parseError && (
                <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                  <div className="flex items-start gap-3">
                    <FiInfo className="mt-0.5 shrink-0" size={18} />

                    <p className="whitespace-pre-wrap">{operationMessage}</p>
                  </div>
                </div>
              )}

              {parseError && (
                <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
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
                              key={`${row.rowNumber}-${row.name}-${index}`}
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

                                    {row.imageMatchMessage && (
                                      <p className="mt-1 break-words text-[11px] leading-4 text-gray-600">
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

                                {row.duplicateMessage && (
                                  <p className="mt-1 max-w-[260px] text-[11px] leading-4 text-orange-600">
                                    {row.duplicateMessage}
                                  </p>
                                )}

                                {row.status?.details?.length > 0 && (
                                  <ul className="mt-1 space-y-0.5 text-[11px] leading-4 text-red-600">
                                    {row.status.details.map(
                                      (detail, detailIndex) => (
                                        <li
                                          key={`${row.rowNumber}-${detailIndex}`}
                                        >
                                          • {detail}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}
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
                Có lỗi dữ liệu. Hãy tải Error Report nếu cần kiểm tra toàn bộ.
              </span>
            )}

            {rows.length > 0 &&
              summary.errors === 0 &&
              summary.pendingImages > 0 && (
                <span className="font-semibold text-amber-600">
                  Có ảnh chưa ghép. Hãy kiểm tra lại thư mục ảnh.
                </span>
              )}

            {rows.length > 0 &&
              summary.errors === 0 &&
              summary.pendingImages === 0 &&
              summary.valid === 0 && (
                <span className="font-semibold text-orange-600">
                  Không có sản phẩm mới để nhập.
                </span>
              )}

            {rows.length > 0 &&
              summary.errors === 0 &&
              summary.pendingImages === 0 &&
              summary.valid > 0 && (
                <span className="font-semibold text-green-600">
                  Dữ liệu mới đã sẵn sàng để nhập.
                </span>
              )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isBusy}
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
                : savingProducts
                  ? "Đang lưu sản phẩm..."
                  : summary.valid === 0
                    ? "Không có sản phẩm mới"
                    : `Xác nhận nhập ${summary.valid} sản phẩm`}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminProductExcelImportModal;
