import { read, utils, writeFileXLSX } from "xlsx";

import { slugifyCategory } from "@/constants/productCategories";

export const PRODUCT_EXCEL_HEADERS = [
  "Tên sản phẩm",
  "Giá",
  "Giá cũ",
  "Danh mục",
  "Tóm tắt",
  "Hình ảnh",
  "Tồn kho",
];

const MAX_EXCEL_FILE_SIZE = 20 * 1024 * 1024;
const MAX_IMPORT_ROWS = 5000;

const IMAGE_FILE_PATTERN =
  /^[^<>:"/\\|?*]+\.(?:jpe?g|png|webp|gif|bmp|avif|svg)$/i;

const normalizeText = (value) =>
  String(value ?? "")
    .replace(/\uFEFF/g, "")
    .replace(/[\u200B-\u200D\u2060]/g, "")
    .replace(/\u00A0/g, " ")
    .trim();

const normalizeMultilineText = (value) =>
  String(value ?? "")
    .replace(/\uFEFF/g, "")
    .replace(/[\u200B-\u200D\u2060]/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/\r\n?/g, "\n")
    .trim();

const normalizeHeader = (value) =>
  normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ");

const HEADER_ALIASES = {
  "ten san pham": "Tên sản phẩm",
  gia: "Giá",
  "gia cu": "Giá cũ",
  "danh muc": "Danh mục",
  "tom tat": "Tóm tắt",
  "mo ta": "Tóm tắt",
  "hinh anh": "Hình ảnh",
  hinh: "Hình ảnh",
  image: "Hình ảnh",
  "ton kho": "Tồn kho",
  stock: "Tồn kho",
};

const getCanonicalHeader = (value) => {
  const normalized = normalizeHeader(value);

  return HEADER_ALIASES[normalized] || normalizeText(value);
};

const parseNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  const normalized = String(value)
    .replace(/\s/g, "")
    .replace(/[₫đĐ]/g, "")
    .replace(/\./g, "")
    .replace(/,/g, "");

  if (!normalized) {
    return fallback;
  }

  const number = Number(normalized);

  return Number.isFinite(number) ? number : fallback;
};

const parsePrice = (value) => parseNumber(value, null);

const parseStock = (value) => {
  const stock = parseNumber(value, 0);

  if (!Number.isFinite(stock)) {
    return null;
  }

  return Math.floor(stock);
};

const normalizeImageReference = (value) => {
  const image = normalizeText(value);

  if (!image) {
    return {
      value: "",
      type: "empty",
      valid: true,
      warning: true,
      fileName: "",
    };
  }

  try {
    const url = new URL(image);

    const validProtocol = url.protocol === "http:" || url.protocol === "https:";

    if (validProtocol) {
      return {
        value: url.toString(),
        type: "url",
        valid: true,
        warning: false,
        fileName: "",
      };
    }
  } catch {
    // Tiếp tục kiểm tra tên file.
  }

  if (IMAGE_FILE_PATTERN.test(image)) {
    return {
      value: image,
      type: "filename",
      valid: true,
      warning: true,
      fileName: image,
    };
  }

  return {
    value: "",
    type: "invalid",
    valid: false,
    warning: true,
    fileName: "",
  };
};

const findCategory = (value, categories) => {
  const raw = normalizeText(value);

  if (!raw) {
    return null;
  }

  const slug = slugifyCategory(raw);

  return (
    categories.find(
      (category) =>
        String(category.slug || "").toLowerCase() === raw.toLowerCase()
    ) ||
    categories.find(
      (category) =>
        String(category.slug || "").toLowerCase() === slug.toLowerCase()
    ) ||
    categories.find(
      (category) =>
        String(category.name || "")
          .trim()
          .toLowerCase() === raw.toLowerCase()
    ) ||
    null
  );
};

const createStatus = (code, label, level, details = []) => ({
  code,
  label,
  level,
  details,
});

const createImportIdentityKey = (name, category) =>
  `${normalizeHeader(name)}::${String(category || "")
    .trim()
    .toLowerCase()}`;

const getStatus = ({
  name,
  price,
  category,
  image,
  oldPrice,
  hasOldPrice,
  stock,
}) => {
  const errors = [];

  if (!name) {
    errors.push("Thiếu tên sản phẩm.");
  } else if (name.length > 200) {
    errors.push("Tên sản phẩm không được vượt quá 200 ký tự.");
  }

  if (!Number.isFinite(price) || price <= 0) {
    errors.push("Giá phải là số lớn hơn 0.");
  }

  if (!category) {
    errors.push("Danh mục không tồn tại hoặc đang để trống.");
  }

  if (hasOldPrice && (!Number.isFinite(oldPrice) || oldPrice <= price)) {
    errors.push("Giá cũ phải lớn hơn Giá hiện tại.");
  }

  if (!image.valid) {
    errors.push("Hình ảnh phải là URL http/https hoặc tên file ảnh hợp lệ.");
  }

  if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
    errors.push("Tồn kho phải là số nguyên không âm.");
  }

  if (errors.length > 0) {
    return createStatus(
      "invalid_row",
      `❌ ${errors.length} lỗi dữ liệu`,
      "error",
      errors
    );
  }

  if (image.type === "filename") {
    return createStatus("image_pending_upload", "⚠️ Ảnh chờ tải", "warning", [
      "Ảnh sẽ được tìm và upload lên Cloudinary.",
    ]);
  }

  if (image.type === "empty") {
    return createStatus("image_missing", "⚠️ Chưa có ảnh", "warning", [
      "Sản phẩm chưa có hình ảnh.",
    ]);
  }

  return createStatus("valid", "✅ Hợp lệ", "success");
};

export const createProductFromExcelRow = (row, categories, index) => {
  const name = normalizeText(row["Tên sản phẩm"]);

  const price = parsePrice(row["Giá"]);

  const oldPriceRaw = row["Giá cũ"];

  const hasOldPrice = normalizeText(oldPriceRaw) !== "";

  const oldPrice = hasOldPrice ? parsePrice(oldPriceRaw) : null;

  const category = findCategory(row["Danh mục"], categories);

  const description = normalizeMultilineText(row["Tóm tắt"]);

  const image = normalizeImageReference(row["Hình ảnh"]);

  /*
   * TỒN KHO
   *
   * Không nhập → mặc định 0.
   */

  const stock = parseStock(row["Tồn kho"]);

  const status = getStatus({
    name,

    price,

    category,

    image,

    oldPrice,

    hasOldPrice,

    stock,
  });

  const categorySlug = category?.slug || "";

  return {
    rowNumber: index + 2,

    name,

    price: Number.isFinite(price) ? price : 0,

    oldPrice: hasOldPrice && Number.isFinite(oldPrice) ? oldPrice : null,

    category: categorySlug,

    categoryName: category?.name || "",

    description,

    image: image.value,

    imageType: image.type,

    imageFileName: image.fileName,

    importIdentityKey: createImportIdentityKey(name, categorySlug),

    /*
     * INVENTORY
     */

    stock: Number.isFinite(stock) ? stock : 0,

    /*
     * Cố định theo yêu cầu:
     * ngưỡng sắp hết = 3
     */

    lowStockThreshold: 3,

    /*
     * Excel không quản lý 2 trạng thái này.
     */

    disabled: false,

    soldOut: false,

    status,

    raw: row,
  };
};

export const parseProductExcel = async (file, categories) => {
  if (!file) {
    throw new Error("Vui lòng chọn file Excel.");
  }

  const fileName = String(file.name || "").toLowerCase();

  if (!fileName.endsWith(".xlsx")) {
    throw new Error("Chỉ hỗ trợ file Excel .xlsx.");
  }

  if (file.size > MAX_EXCEL_FILE_SIZE) {
    throw new Error(
      "File Excel quá lớn. Vui lòng sử dụng file không quá 20MB."
    );
  }

  if (
    file.type &&
    ![
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/octet-stream",
    ].includes(file.type)
  ) {
    throw new Error("File được chọn không có định dạng Excel .xlsx hợp lệ.");
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error(
      "Hệ thống chưa có danh mục sản phẩm để kiểm tra file Excel."
    );
  }

  const arrayBuffer = await file.arrayBuffer();

  const workbook = read(arrayBuffer, {
    type: "array",
    dense: true,
  });

  if (!workbook.SheetNames?.length) {
    throw new Error("File Excel không có sheet dữ liệu.");
  }

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!worksheet) {
    throw new Error("Không thể đọc sheet đầu tiên.");
  }

  const rawRows = utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    raw: true,
  });

  if (!rawRows.length) {
    throw new Error("File Excel không có dữ liệu.");
  }

  const rawHeaders = rawRows[0].map(getCanonicalHeader);

  const missingHeaders = PRODUCT_EXCEL_HEADERS.filter(
    (header) => !rawHeaders.includes(header)
  );

  if (missingHeaders.length > 0) {
    throw new Error(`Thiếu cột bắt buộc: ${missingHeaders.join(", ")}.`);
  }

  const headerCount = new Map();

  rawHeaders.forEach((header) => {
    if (!header) {
      return;
    }

    headerCount.set(header, (headerCount.get(header) || 0) + 1);
  });

  const duplicateHeaders = [...headerCount.entries()]
    .filter(([, count]) => count > 1)
    .map(([header]) => header);

  if (duplicateHeaders.length > 0) {
    throw new Error(
      `File Excel có cột bị trùng: ${duplicateHeaders.join(", ")}.`
    );
  }

  const dataRows = rawRows
    .slice(1)
    .filter((row) => row.some((value) => normalizeText(value) !== ""));

  if (dataRows.length === 0) {
    throw new Error("File Excel không có dòng sản phẩm.");
  }

  if (dataRows.length > MAX_IMPORT_ROWS) {
    throw new Error(
      `File Excel có ${dataRows.length} dòng. Giới hạn một lần nhập là ${MAX_IMPORT_ROWS} dòng.`
    );
  }

  const rows = dataRows.map((values, index) => {
    const row = {};

    rawHeaders.forEach((header, columnIndex) => {
      row[header] = values[columnIndex] ?? "";
    });

    return createProductFromExcelRow(row, categories, index);
  });

  return {
    rows,

    total: rows.length,
  };
};

export const downloadProductExcelTemplate = () => {
  const worksheet = utils.aoa_to_sheet([
    PRODUCT_EXCEL_HEADERS,

    ["", "", "", "", "", "", 0],
  ]);

  worksheet["!cols"] = [
    { wch: 28 },
    { wch: 15 },
    { wch: 15 },
    { wch: 22 },
    { wch: 42 },
    { wch: 38 },
    { wch: 14 },
  ];

  const guideWorksheet = utils.aoa_to_sheet([
    ["HƯỚNG DẪN NHẬP SẢN PHẨM"],

    [],

    ["Cột", "Quy định"],

    ["Tên sản phẩm", "Bắt buộc. Không được để trống."],

    ["Giá", "Bắt buộc. Nhập số, ví dụ 450000."],

    ["Giá cũ", "Không bắt buộc. Nếu nhập phải là số và lớn hơn Giá."],

    ["Danh mục", "Nhập đúng tên danh mục hoặc slug đang có trong hệ thống."],

    ["Tóm tắt", "Có thể chứa nhiều đoạn. Hệ thống giữ nguyên xuống dòng."],

    ["Hình ảnh", "Có thể nhập tên file ảnh hoặc URL http/https."],

    [
      "Tồn kho",
      "Số nguyên không âm. Nếu để trống hệ thống mặc định Tồn kho = 0.",
    ],

    [
      "Ngưỡng sắp hết",
      "Không cần nhập trong Excel. Hệ thống mặc định ngưỡng sắp hết = 3.",
    ],

    ["Ngừng bán", "Không nhập trong Excel. Mặc định sản phẩm được phép bán."],

    [
      "Đánh dấu đã bán hết",
      "Không nhập trong Excel. Mặc định sản phẩm chưa được đánh dấu bán hết.",
    ],

    [],

    [
      "Cách nhập ảnh hàng loạt",
      "Đặt toàn bộ ảnh sản phẩm trong một thư mục. Trong Excel, cột Hình ảnh chỉ ghi đúng tên file.",
    ],

    [
      "Không dùng",
      "Không nhập C:\\Users\\... hoặc D:\\FlowerShop\\... vào cột Hình ảnh.",
    ],

    [
      "URL Cloudinary",
      "Nếu ảnh đã được upload trước đó, có thể nhập trực tiếp URL https://res.cloudinary.com/...",
    ],

    ["Nhiều ảnh", "Phiên bản hiện tại nhập 1 ảnh chính cho mỗi sản phẩm."],
  ]);

  guideWorksheet["!cols"] = [{ wch: 28 }, { wch: 110 }];

  const workbook = utils.book_new();

  utils.book_append_sheet(workbook, worksheet, "Sản phẩm");

  utils.book_append_sheet(workbook, guideWorksheet, "Hướng dẫn");

  writeFileXLSX(workbook, "flower-shop-product-template.xlsx");
};
