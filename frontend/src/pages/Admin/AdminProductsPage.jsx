import {
  getStockStatus,
  getStockStatusLabel,
  STOCK_STATUS,
} from "@/services/inventory";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import {
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEdit2,
  FiImage,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";

import {
  getProductsSnapshot,
  subscribeProducts,
  saveProducts,
  saveProductsAsync,
  readCategories,
  CATEGORY_UPDATED_EVENT,
} from "@/services/catalog";

import { uploadImageFile } from "@/services/media";

import { downloadProductExcelTemplate } from "@/services/productExcel";

import AdminProductExcelImportModal from "./AdminProductExcelImportModal";

const PRODUCTS_PER_PAGE = 20;

const EMPTY_PRODUCT = {
  name: "",
  price: "",
  oldPrice: "",
  category: "",
  description: "",
  image: "",
  salesCount: 0,

  stock: 0,

  lowStockThreshold: 3,

  disabled: false,

  soldOut: false,
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const getDiscountPercent = (price, oldPrice) => {
  const current = Number(price);
  const old = Number(oldPrice);

  if (
    !Number.isFinite(current) ||
    !Number.isFinite(old) ||
    old <= current ||
    old <= 0
  ) {
    return 0;
  }

  return Math.round(((old - current) / old) * 100);
};

const FilePicker = ({ id, selected, disabled, onChange }) => (
  <div className="mt-2">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label
        htmlFor={id}
        className={`inline-flex w-fit items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:bg-pink-700"
        }`}
      >
        <FiUpload size={16} />

        {disabled ? "Đang tải..." : "Chọn tệp"}
      </label>

      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
        {selected ? "Đã chọn hình ảnh" : "Không có tệp nào được chọn"}
      </div>
    </div>

    <input
      id={id}
      type="file"
      accept="image/*"
      onChange={onChange}
      disabled={disabled}
      className="sr-only"
    />
  </div>
);

const StockStatusBadge = ({ product }) => {
  const stockStatus = getStockStatus(product);

  const label = getStockStatusLabel(product);

  const className =
    stockStatus === STOCK_STATUS.IN_STOCK
      ? "bg-green-50 text-green-700"
      : stockStatus === STOCK_STATUS.LOW_STOCK
        ? "bg-yellow-50 text-yellow-700"
        : stockStatus === STOCK_STATUS.DISABLED
          ? "bg-gray-100 text-gray-600"
          : stockStatus === STOCK_STATUS.SOLD_OUT
            ? "bg-purple-50 text-purple-700"
            : "bg-red-50 text-red-700";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${className}`}
    >
      {label}
    </span>
  );
};

const AdminProductsPage = () => {
  const products = useSyncExternalStore(
    subscribeProducts,
    getProductsSnapshot,
    getProductsSnapshot
  );

  const [categories, setCategories] = useState(() => readCategories());

  const [keyword, setKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [showProductModal, setShowProductModal] = useState(false);

  const [showExcelImportModal, setShowExcelImportModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);

  const [confirmDelete, setConfirmDelete] = useState(null);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    document.title = "Quản lý sản phẩm | Flower Shop";

    let robots = document.querySelector('meta[name="robots"]');

    if (!robots) {
      robots = document.createElement("meta");

      robots.name = "robots";

      document.head.appendChild(robots);
    }

    robots.content = "noindex,nofollow";
  }, []);

  useEffect(() => {
    const refreshCategories = () => {
      setCategories(readCategories());
    };

    window.addEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

    window.addEventListener("storage", refreshCategories);

    return () => {
      window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

      window.removeEventListener("storage", refreshCategories);
    };
  }, []);

  const categoriesSorted = useMemo(
    () =>
      [...categories].sort(
        (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
      ),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.category, product.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [products, keyword]);

  const totalProducts = filteredProducts.length;

  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));

  const safePage = Math.min(currentPage, totalPages);

  const startIndex =
    totalProducts === 0 ? 0 : (safePage - 1) * PRODUCTS_PER_PAGE;

  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);

  const visibleProducts = filteredProducts.slice(startIndex, endIndex);

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const openCreateProduct = () => {
    clearMessages();

    setEditingProduct(null);

    setProductForm({
      ...EMPTY_PRODUCT,
      category: categoriesSorted[0]?.slug || "",
    });

    setShowProductModal(true);
  };

  const openEditProduct = (product) => {
    clearMessages();

    setEditingProduct(product);

    setProductForm({
      name: product.name || "",
      price: product.price ?? "",
      oldPrice: product.oldPrice ?? "",
      category: product.category || "",
      description: product.description || "",
      image: product.image || "",
      salesCount: Number(product.salesCount || 0),

      stock: Number(product.stock || 0),

      lowStockThreshold: Number(product.lowStockThreshold ?? 3),

      disabled: Boolean(product.disabled),

      soldOut: Boolean(product.soldOut),
    });

    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);

    setEditingProduct(null);

    setProductForm(EMPTY_PRODUCT);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadingImage(true);

    clearMessages();

    try {
      const image = await uploadImageFile(file, {
        folder: "flower-shop/products",
        maxWidth: 1400,
        maxHeight: 1000,
        quality: 0.82,
      });

      setProductForm((current) => ({
        ...current,
        image,
      }));

      setMessage("Đã tải hình ảnh lên kho ảnh dùng chung.");
    } catch (uploadError) {
      setError(uploadError.message || "Không thể tải hình ảnh.");
    } finally {
      setUploadingImage(false);
    }
  };

  const saveProduct = (event) => {
    event.preventDefault();

    clearMessages();

    const name = productForm.name.trim();

    const price = Number(productForm.price);

    const oldPrice =
      productForm.oldPrice === "" ? null : Number(productForm.oldPrice);

    const salesCount = Number(productForm.salesCount);

    const stock = Number(productForm.stock);

    const lowStockThreshold = Number(productForm.lowStockThreshold);

    if (!name) {
      setError("Vui lòng nhập Tên sản phẩm.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Giá phải lớn hơn 0.");
      return;
    }

    if (
      oldPrice !== null &&
      (!Number.isFinite(oldPrice) || oldPrice <= price)
    ) {
      setError("Giá cũ phải lớn hơn giá hiện tại.");
      return;
    }

    if (!productForm.category) {
      setError("Vui lòng chọn Danh mục.");
      return;
    }

    if (
      !Number.isFinite(salesCount) ||
      salesCount < 0 ||
      !Number.isInteger(salesCount)
    ) {
      setError("Đã bán phải là số nguyên không âm.");
      return;
    }

    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      setError("Tồn kho phải là số nguyên không âm.");
      return;
    }

    if (
      !Number.isFinite(lowStockThreshold) ||
      lowStockThreshold < 0 ||
      !Number.isInteger(lowStockThreshold)
    ) {
      setError("Ngưỡng sắp hết phải là số nguyên không âm.");
      return;
    }

    const data = {
      name,

      price,

      oldPrice,

      category: productForm.category,

      description: productForm.description,

      image: productForm.image || "",

      salesCount: Math.floor(salesCount),

      stock: Math.floor(stock),

      lowStockThreshold: Math.floor(lowStockThreshold),

      disabled: Boolean(productForm.disabled),

      soldOut: Boolean(productForm.soldOut),
    };

    try {
      if (editingProduct) {
        saveProducts(
          products.map((product) =>
            String(product.id) === String(editingProduct.id)
              ? {
                  ...product,
                  ...data,
                }
              : product
          )
        );

        setMessage("Đã cập nhật sản phẩm thành công.");
      } else {
        saveProducts([
          ...products,

          {
            id: `product-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,

            ...data,

            isNew: true,

            createdAt: new Date().toISOString(),
          },
        ]);

        setMessage("Đã thêm sản phẩm thành công.");
      }

      closeProductModal();
    } catch (saveError) {
      setError(saveError.message || "Không thể lưu sản phẩm.");
    }
  };

  const handleExcelImport = async (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      const errorMessage = "Không có dòng sản phẩm hợp lệ để nhập.";

      setError(errorMessage);

      return {
        success: false,
        message: errorMessage,
      };
    }

    clearMessages();

    const currentProducts = getProductsSnapshot();

    const importTimestamp = Date.now();

    const importedProducts = rows.map((row, index) => ({
      id: `product-${importTimestamp}-${index}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

      name: String(row.name || "").trim(),

      price: Number(row.price || 0),

      oldPrice:
        row.oldPrice === null ||
        row.oldPrice === undefined ||
        row.oldPrice === ""
          ? null
          : Number(row.oldPrice),

      category: String(row.category || "").trim(),

      description: String(row.description || ""),

      image: String(row.image || "").trim(),

      salesCount: Number(row.salesCount || 0),

      isNew: row.isNew !== false,

      badge: String(row.badge || "").trim(),

      createdAt: new Date().toISOString(),

      importedFrom: "excel",

      stock: Number(row.stock || 0),

      lowStockThreshold: 3,

      disabled: false,

      soldOut: false,
    }));

    try {
      const saved = await saveProductsAsync([
        ...currentProducts,
        ...importedProducts,
      ]);

      setCurrentPage(1);

      setShowExcelImportModal(false);

      const successMessage = `Đã nhập thành công ${importedProducts.length} sản phẩm từ Excel.`;

      setMessage(successMessage);

      return {
        success: true,

        products: saved,

        importedProducts,

        message: successMessage,
      };
    } catch (saveError) {
      const errorMessage =
        saveError?.message ||
        "Không thể lưu sản phẩm từ Excel vào bộ nhớ trình duyệt.";

      setError(errorMessage);

      return {
        success: false,

        message: errorMessage,

        error: saveError,
      };
    }
  };

  const requestDeleteProduct = (product) => {
    setConfirmDelete({
      id: product.id,
      name: product.name,
    });
  };

  const executeDelete = () => {
    if (!confirmDelete) {
      return;
    }

    try {
      saveProducts(
        products.filter(
          (product) => String(product.id) !== String(confirmDelete.id)
        )
      );

      setMessage("Đã xóa sản phẩm.");

      setConfirmDelete(null);

      setError("");
    } catch (deleteError) {
      setConfirmDelete(null);

      setError(deleteError.message || "Không thể xóa sản phẩm.");
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const discount = getDiscountPercent(productForm.price, productForm.oldPrice);

  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>

          <p className="mt-2 text-sm text-gray-500">
            Quản lý sản phẩm, hình ảnh, giá và số lượng đã bán.
          </p>
        </header>

        {(message || error) && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-red-100 bg-red-50 text-red-700"
                : "border-green-100 bg-green-50 text-green-700"
            }`}
          >
            {error || message}
          </div>
        )}

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Tất cả sản phẩm
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {totalProducts === 0
                  ? "0/0 sản phẩm"
                  : `${startIndex + 1}–${endIndex}/${totalProducts} sản phẩm`}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <label className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={17}
                />

                <input
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value);

                    setCurrentPage(1);
                  }}
                  placeholder="Tìm sản phẩm..."
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-pink-400 sm:w-64"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowExcelImportModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-pink-200 bg-pink-50 px-4 py-2.5 text-sm font-semibold text-pink-700 hover:bg-pink-100"
              >
                <FiUpload />
                Nhập Excel
              </button>

              <button
                type="button"
                onClick={downloadProductExcelTemplate}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <FiDownload />
                Tải Excel mẫu
              </button>

              <button
                type="button"
                onClick={openCreateProduct}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
              >
                <FiPlus />
                Thêm sản phẩm
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
            {visibleProducts.map((product) => {
              const discountPercent = getDiscountPercent(
                product.price,
                product.oldPrice
              );

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative flex h-24 items-center justify-center overflow-hidden bg-gray-50 p-2 sm:h-28">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="max-h-full max-w-full rounded-lg object-contain"
                      />
                    ) : (
                      <FiImage size={28} className="text-gray-300" />
                    )}

                    {discountPercent > 0 && (
                      <span className="absolute left-2 top-2 rounded-md bg-pink-600 px-2 py-1 text-[10px] font-bold text-white">
                        GIẢM {discountPercent}%
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="line-clamp-2 min-h-[38px] text-sm font-semibold text-gray-800">
                      {product.name}
                    </h3>

                    <p className="mt-1 line-clamp-2 min-h-[32px] text-xs leading-5 text-gray-500">
                      {product.description || "Chưa có tóm tắt."}
                    </p>

                    <div className="mt-2">
                      <span className="text-sm font-bold text-pink-600">
                        {money(product.price)}
                      </span>

                      {product.oldPrice && (
                        <span className="ml-1 text-[10px] text-gray-400 line-through">
                          {money(product.oldPrice)}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      Đã bán:{" "}
                      <strong className="text-gray-700">
                        {Number(product.salesCount || 0).toLocaleString(
                          "vi-VN"
                        )}
                      </strong>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2 text-xs text-gray-500">
                      <span>
                        Tồn kho:{" "}
                        <strong className="text-gray-700">
                          {Number(product.stock || 0).toLocaleString("vi-VN")}
                        </strong>
                      </span>

                      <StockStatusBadge product={product} />
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditProduct(product)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        <FiEdit2 size={13} />
                        Sửa
                      </button>

                      <button
                        type="button"
                        onClick={() => requestDeleteProduct(product)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-100 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 size={13} />
                        Xóa
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {totalProducts === 0 && (
            <div className="py-12 text-center text-sm text-gray-500">
              Không tìm thấy sản phẩm.
            </div>
          )}

          {totalProducts > 0 && (
            <div className="mt-7 flex justify-center gap-2 border-t border-gray-100 pt-5">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => goToPage(safePage - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40"
                aria-label="Trang trước"
              >
                <FiChevronLeft />
              </button>

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-semibold ${
                    page === safePage
                      ? "border-pink-600 bg-pink-600 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-pink-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => goToPage(safePage + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40"
                aria-label="Trang sau"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </section>
      </div>

      {showProductModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 p-4">
          <form
            onSubmit={saveProduct}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
              </h2>

              <button
                type="button"
                onClick={closeProductModal}
                className="rounded-full p-2 hover:bg-gray-100"
                aria-label="Đóng"
              >
                <FiX />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Tên sản phẩm
                </label>

                <input
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Giá</label>

                <input
                  type="number"
                  min="0"
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Giá cũ
                </label>

                <input
                  type="number"
                  min="0"
                  value={productForm.oldPrice}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      oldPrice: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Giảm</label>

                <div className="rounded-xl border border-pink-100 bg-pink-50 px-4 py-3 text-sm font-bold text-pink-600">
                  GIẢM {discount}%
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Đã bán
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={productForm.salesCount}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      salesCount: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              {/* =========================================
                  TỒN KHO
              ========================================= */}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Tồn kho
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={productForm.stock}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      stock: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Ngưỡng sắp hết
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={productForm.lowStockThreshold}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      lowStockThreshold: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              {/* =========================================
                  TRẠNG THÁI BÁN
              ========================================= */}

              <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(productForm.disabled)}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        disabled: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />

                  <span className="text-sm font-semibold text-gray-700">
                    Ngừng bán sản phẩm
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(productForm.soldOut)}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        soldOut: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />

                  <span className="text-sm font-semibold text-gray-700">
                    Đánh dấu đã bán hết
                  </span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Danh mục
                </label>

                <select
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">Chọn danh mục</option>

                  {categoriesSorted.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Tóm tắt
                </label>

                <textarea
                  rows={4}
                  value={productForm.description}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Hình ảnh
                </label>

                <FilePicker
                  id="product-image"
                  selected={Boolean(productForm.image)}
                  disabled={uploadingImage}
                  onChange={handleImageUpload}
                />

                {productForm.image && (
                  <div className="mt-4 flex h-32 w-44 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2">
                    <img
                      src={productForm.image}
                      alt="Xem trước sản phẩm"
                      loading="lazy"
                      decoding="async"
                      className="max-h-full max-w-full rounded-lg object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeProductModal}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={uploadingImage}
                className="rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
              >
                Lưu sản phẩm
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <FiTrash2 />
            </div>

            <h2 className="mt-4 text-lg font-bold">Xác nhận xóa</h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Bạn có chắc muốn xóa <strong>{confirmDelete.name}</strong>?
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={executeDelete}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminProductExcelImportModal
        open={showExcelImportModal}
        categories={categoriesSorted}
        onClose={() => setShowExcelImportModal(false)}
        onConfirm={handleExcelImport}
      />
    </main>
  );
};

export default AdminProductsPage;
