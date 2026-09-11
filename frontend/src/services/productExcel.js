import { read, utils, writeFileXLSX } from "xlsx";

import { slugifyCategory } from "@/constants/productCategories";

export const PRODUCT_EXCEL_HEADERS = [
  "Tên sản phẩm",
  "Giá",
  "Giá cũ",
  "Danh mục",
  "Tóm tắt",
  "Hình ảnh",
];

const normalizeText = (value) =>
  String(value ?? "")
    .replace(/\uFEFF/g, "")
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
};

const getCanonicalHeader = (value) => {
  const normalized = normalizeHeader(value);

  return HEADER_ALIASES[normalized] || normalizeText(value);
};

const parsePrice = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const normalized = String(value)
    .replace(/\s/g, "")
    .replace(/[₫đĐ]/g, "")
    .replace(/\./g, "")
    .replace(/,/g, "");

  if (!normalized) {
    return null;
  }

  const number = Number(normalized);

  return Number.isFinite(number) ? number : null;
};

const normalizeImageUrl = (value) => {
  const image = normalizeText(value);

  if (!image) {
    return {
      value: "",
      valid: true,
      warning: false,
    };
  }

  try {
    const url = new URL(image);

    const validProtocol = url.protocol === "http:" || url.protocol === "https:";

    return {
      value: validProtocol ? url.toString() : "",
      valid: validProtocol,
      warning: !validProtocol,
    };
  } catch {
    return {
      value: "",
      valid: false,
      warning: true,
    };
  }
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

const createStatus = (code, label, level) => ({
  code,
  label,
  level,
});

const getStatus = ({ name, price, category, image, oldPrice, hasOldPrice }) => {
  if (!name) {
    return createStatus("missing_name", "❌ Thiếu tên", "error");
  }

  if (!Number.isFinite(price) || price <= 0) {
    return createStatus("invalid_price", "❌ Giá không hợp lệ", "error");
  }

  if (!category) {
    return createStatus(
      "invalid_category",
      "❌ Danh mục không tồn tại",
      "error"
    );
  }

  if (hasOldPrice && (!Number.isFinite(oldPrice) || oldPrice <= price)) {
    return createStatus("invalid_price", "❌ Giá không hợp lệ", "error");
  }

  if (image.warning) {
    return createStatus(
      "invalid_image",
      "⚠️ URL hình ảnh không hợp lệ",
      "warning"
    );
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

  const description = normalizeText(row["Tóm tắt"]);

  const image = normalizeImageUrl(row["Hình ảnh"]);

  const status = getStatus({
    name,
    price,
    category,
    image,
    oldPrice,
    hasOldPrice,
  });

  return {
    rowNumber: index + 2,

    name,

    price: Number.isFinite(price) ? price : 0,

    oldPrice: hasOldPrice && Number.isFinite(oldPrice) ? oldPrice : null,

    category: category?.slug || "",

    categoryName: category?.name || "",

    description,

    image: image.value,

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

  const rows = rawRows
    .slice(1)
    .filter((row) => row.some((value) => normalizeText(value) !== ""))
    .map((values, index) => {
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
    ["", "", "", "", "", ""],
  ]);

  worksheet["!cols"] = [
    { wch: 28 },
    { wch: 15 },
    { wch: 15 },
    { wch: 22 },
    { wch: 42 },
    { wch: 60 },
  ];

  const guideWorksheet = utils.aoa_to_sheet([
    ["HƯỚNG DẪN NHẬP SẢN PHẨM"],
    [],
    ["Cột", "Quy định"],
    ["Tên sản phẩm", "Bắt buộc. Không được để trống."],
    ["Giá", "Bắt buộc. Nhập số, ví dụ 450000."],
    ["Giá cũ", "Không bắt buộc. Nếu nhập phải là số và lớn hơn Giá."],
    ["Danh mục", "Nhập đúng tên danh mục hoặc slug đang có trong hệ thống."],
    ["Tóm tắt", "Nội dung ngắn dùng làm mô tả sản phẩm."],
    [
      "Hình ảnh",
      "Dùng URL http/https. Khuyến nghị URL Cloudinary của Flower Shop.",
    ],
    [],
    [
      "Lưu ý",
      "Không dùng đường dẫn C:\\ hoặc D:\\ trong Excel vì đó là đường dẫn chỉ tồn tại trên máy cá nhân.",
    ],
    [
      "Cách lưu ảnh",
      "Upload ảnh bằng chức năng Chọn tệp trong Quản lý sản phẩm để ảnh được lưu lên Cloudinary, sau đó copy địa chỉ ảnh và dán vào cột Hình ảnh.",
    ],
    [
      "Nhiều ảnh",
      "Phiên bản hiện tại nhập 1 ảnh chính cho mỗi sản phẩm. Hỗ trợ nhiều ảnh sẽ triển khai ở giai đoạn sau.",
    ],
  ]);

  guideWorksheet["!cols"] = [{ wch: 24 }, { wch: 110 }];

  const workbook = utils.book_new();

  utils.book_append_sheet(workbook, worksheet, "Sản phẩm");

  utils.book_append_sheet(workbook, guideWorksheet, "Hướng dẫn");

  writeFileXLSX(workbook, "flower-shop-product-template.xlsx");
};
