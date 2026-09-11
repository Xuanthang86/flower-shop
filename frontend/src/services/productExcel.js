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
  "ten san pham ": "Tên sản phẩm",
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

const getStatus = ({ name, price, category, image }) => {
  if (!name) {
    return {
      code: "missing_name",
      label: "❌ Thiếu tên",
      level: "error",
    };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return {
      code: "invalid_price",
      label: "❌ Giá không hợp lệ",
      level: "error",
    };
  }

  if (!category) {
    return {
      code: "invalid_category",
      label: "❌ Danh mục không tồn tại",
      level: "error",
    };
  }

  if (image.warning) {
    return {
      code: "invalid_image",
      label: "⚠️ URL hình ảnh không hợp lệ",
      level: "warning",
    };
  }

  return {
    code: "valid",
    label: "✅ Hợp lệ",
    level: "success",
  };
};

export const createProductFromExcelRow = (row, categories, index) => {
  const name = normalizeText(row["Tên sản phẩm"]);

  const price = parsePrice(row["Giá"]);

  const oldPriceRaw = row["Giá cũ"];

  const oldPrice =
    oldPriceRaw === null ||
    oldPriceRaw === undefined ||
    normalizeText(oldPriceRaw) === ""
      ? null
      : parsePrice(oldPriceRaw);

  const category = findCategory(row["Danh mục"], categories);

  const description = normalizeText(row["Tóm tắt"]);

  const image = normalizeImageUrl(row["Hình ảnh"]);

  const status = getStatus({
    name,
    price,
    category,
    image,
  });

  const validOldPrice =
    oldPrice === null || (Number.isFinite(oldPrice) && oldPrice > price);

  const finalStatus =
    status.level === "success" && !validOldPrice
      ? {
          code: "invalid_price",
          label: "❌ Giá không hợp lệ",
          level: "error",
        }
      : status;

  return {
    rowNumber: index + 2,

    name,

    price: Number.isFinite(price) ? price : 0,

    oldPrice: oldPrice === null || !Number.isFinite(oldPrice) ? null : oldPrice,

    category: category?.slug || "",

    categoryName: category?.name || "",

    description,

    image: image.value,

    status: finalStatus,

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
    ["Giá cũ", "Không bắt buộc. Nếu nhập phải lớn hơn Giá."],
    ["Danh mục", "Nhập đúng tên danh mục hoặc slug đang có trong hệ thống."],
    ["Tóm tắt", "Nội dung ngắn dùng làm mô tả sản phẩm."],
    [
      "Hình ảnh",
      "Nên dùng URL Cloudinary https://res.cloudinary.com/... . Không dùng đường dẫn C:\\ hoặc D:\\.",
    ],
    [],
    [
      "Lưu ý",
      "Ảnh nên được upload lên Quản lý sản phẩm trước, sau đó copy URL Cloudinary vào cột Hình ảnh.",
    ],
  ]);

  guideWorksheet["!cols"] = [{ wch: 24 }, { wch: 100 }];

  const workbook = utils.book_new();

  utils.book_append_sheet(workbook, worksheet, "Sản phẩm");

  utils.book_append_sheet(workbook, guideWorksheet, "Hướng dẫn");

  writeFileXLSX(workbook, "flower-shop-product-template.xlsx");
};
