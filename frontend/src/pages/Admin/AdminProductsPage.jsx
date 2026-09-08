import { useEffect, useMemo, useState } from "react";

import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiImage,
  FiPlus,
  FiSearch,
  FiTag,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  readProducts,
  saveProducts,
  readCategories,
  saveCategories,
  PRODUCT_UPDATED_EVENT,
  CATEGORY_UPDATED_EVENT,
} from "@/services/catalog";

import { slugifyCategory } from "@/constants/productCategories";

const PRODUCTS_PER_PAGE = 20;

const EMPTY_PRODUCT = {
  name: "",
  price: "",
  oldPrice: "",
  category: "",
  description: "",
  image: "",
};

const EMPTY_CATEGORY = {
  name: "",
  summary: "",
  image: "",
  active: true,
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const formatPrice = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const getDiscountPercent = (price, oldPrice) => {
  const current = Number(price || 0);
  const old = Number(oldPrice || 0);

  if (!current || !old || old <= current) {
    return 0;
  }

  return Math.round(((old - current) / old) * 100);
};

const compressImage = (
  file,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.78
) =>
  new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Vui lòng chọn đúng file hình ảnh."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        let width = image.naturalWidth;

        let height = image.naturalHeight;

        const ratio = Math.min(1, maxWidth / width, maxHeight / height);

        width = Math.round(width * ratio);

        height = Math.round(height * ratio);

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Không thể xử lý hình ảnh."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        const webp = canvas.toDataURL("image/webp", quality);

        if (webp && webp.startsWith("data:image/webp")) {
          resolve(webp);
          return;
        }

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      image.onerror = () => reject(new Error("Không thể đọc hình ảnh."));

      image.src = String(reader.result || "");
    };

    reader.onerror = () => reject(new Error("Không thể đọc file hình ảnh."));

    reader.readAsDataURL(file);
  });

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Đóng"
        >
          <FiX />
        </button>
      </div>

      <div className="mt-5">{children}</div>
    </div>
  </div>
);

const AdminProductsPage = () => {
  const [products, setProducts] = useState(() => readProducts());

  const [categories, setCategories] = useState(() => readCategories());

  const [keyword, setKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [showCategories, setShowCategories] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [editingCategory, setEditingCategory] = useState(null);

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);

  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    const refreshProducts = () => setProducts(readProducts());

    const refreshCategories = () => setCategories(readCategories());

    window.addEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

    window.addEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

    window.addEventListener("storage", refreshProducts);

    window.addEventListener("storage", refreshCategories);

    return () => {
      window.removeEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

      window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

      window.removeEventListener("storage", refreshProducts);

      window.removeEventListener("storage", refreshCategories);
    };
  }, []);

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

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

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  const readProductImage = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    clearMessages();

    try {
      const image = await compressImage(file);

      setProductForm((current) => ({
        ...current,
        image,
      }));
    } catch (imageError) {
      console.error(imageError);

      setError(imageError.message || "Không thể xử lý hình ảnh.");
    }
  };

  const openCreateProduct = () => {
    clearMessages();

    setEditingProduct(null);

    setProductForm(EMPTY_PRODUCT);

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
    });

    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);

    setEditingProduct(null);

    setProductForm(EMPTY_PRODUCT);
  };

  const handleProductChange = (event) => {
    const { name, value } = event.target;

    setProductForm((current) => ({
      ...current,
      [name]: value,
    }));

    clearMessages();
  };

  const saveProduct = (event) => {
    event.preventDefault();

    clearMessages();

    const name = productForm.name.trim();

    const price = Number(productForm.price);

    const oldPrice = productForm.oldPrice ? Number(productForm.oldPrice) : null;

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
      setError("Giá cũ phải lớn hơn Giá.");
      return;
    }

    if (!productForm.category) {
      setError("Vui lòng chọn Danh mục.");
      return;
    }

    try {
      if (editingProduct) {
        const updated = products.map((product) =>
          String(product.id) === String(editingProduct.id)
            ? {
                ...product,
                name,
                price,
                oldPrice,
                category: productForm.category,
                description: productForm.description.trim(),
                image: productForm.image || product.image || "",
              }
            : product
        );

        const saved = saveProducts(updated);

        setProducts(saved);

        closeProductModal();

        setMessage("Đã cập nhật sản phẩm thành công.");

        return;
      }

      const newProduct = {
        id: `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        price,
        oldPrice,
        category: productForm.category,
        description: productForm.description.trim(),
        image: productForm.image || "",
        salesCount: 0,
        isNew: true,
        createdAt: new Date().toISOString(),
      };

      const saved = saveProducts([...products, newProduct]);

      setProducts(saved);

      closeProductModal();

      setMessage("Đã thêm sản phẩm thành công.");
    } catch (saveError) {
      console.error(saveError);

      setError(saveError.message || "Không thể lưu sản phẩm.");
    }
  };

  const requestDelete = (product) => {
    setDeleteTarget({
      type: "product",
      id: product.id,
      name: product.name,
    });
  };

  const requestDeleteCategory = (category) => {
    const count = products.filter(
      (product) => String(product.category) === String(category.slug)
    ).length;

    if (count > 0) {
      setError(
        `Không thể xóa "${category.name}" vì đang có ${count} sản phẩm sử dụng danh mục này.`
      );

      return;
    }

    setDeleteTarget({
      type: "category",
      id: category.id,
      name: category.name,
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    try {
      if (deleteTarget.type === "product") {
        const saved = saveProducts(
          products.filter(
            (product) => String(product.id) !== String(deleteTarget.id)
          )
        );

        setProducts(saved);

        setMessage("Đã xóa sản phẩm.");
      } else {
        const saved = saveCategories(
          categories
            .filter(
              (category) => String(category.id) !== String(deleteTarget.id)
            )
            .map((category, index) => ({
              ...category,
              sortOrder: index + 1,
            }))
        );

        setCategories(saved);

        setMessage("Đã xóa danh mục.");
      }

      setDeleteTarget(null);
    } catch (deleteError) {
      console.error(deleteError);

      setDeleteTarget(null);

      setError("Không thể xóa dữ liệu.");
    }
  };

  const openCreateCategory = () => {
    clearMessages();

    setEditingCategory(null);

    setCategoryForm(EMPTY_CATEGORY);

    setShowCategoryModal(true);
  };

  const openEditCategory = (category) => {
    clearMessages();

    setEditingCategory(category);

    setCategoryForm({
      name: category.name || "",
      summary: category.summary || "",
      image: category.image || "",
      active: category.active !== false,
    });

    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);

    setEditingCategory(null);

    setCategoryForm(EMPTY_CATEGORY);
  };

  const saveCategory = (event) => {
    event.preventDefault();

    clearMessages();

    const name = categoryForm.name.trim();

    const slug = slugifyCategory(name);

    if (!name) {
      setError("Vui lòng nhập tên danh mục.");
      return;
    }

    if (!slug) {
      setError("Tên danh mục không hợp lệ.");
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.slug === slug &&
        String(category.id) !== String(editingCategory?.id)
    );

    if (duplicate) {
      setError("Danh mục này đã tồn tại.");
      return;
    }

    try {
      if (editingCategory) {
        const saved = saveCategories(
          categories.map((category) =>
            String(category.id) === String(editingCategory.id)
              ? {
                  ...category,
                  name,
                  slug,
                  label: name,
                  query: slug,
                  summary: categoryForm.summary.trim(),
                  image: categoryForm.image || category.image || "",
                  active: categoryForm.active,
                }
              : category
          )
        );

        setCategories(saved);

        closeCategoryModal();

        setMessage("Đã cập nhật danh mục.");

        return;
      }

      const newCategory = {
        id: slug,
        name,
        slug,
        label: name,
        query: slug,
        summary: categoryForm.summary.trim(),
        image: categoryForm.image || "",
        active: categoryForm.active,
        sortOrder: categories.length + 1,
      };

      const saved = saveCategories([...categories, newCategory]);

      setCategories(saved);

      closeCategoryModal();

      setMessage("Đã thêm danh mục.");
    } catch (saveError) {
      console.error(saveError);

      setError("Không thể lưu danh mục.");
    }
  };

  const sortedCategories = [...categories].sort(
    (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
  );

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-7">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý sản phẩm</h1>

          <p className="mt-2 text-sm text-gray-500">
            Quản lý danh mục và sản phẩm.
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 rounded-2xl bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setShowCategories((value) => !value)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                <FiTag />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Danh mục sản phẩm
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {categories.length} danh mục
                </p>
              </div>
            </div>

            <FiChevronDown
              className={
                showCategories ? "rotate-180 transition" : "transition"
              }
            />
          </button>

          {showCategories && (
            <div className="border-t border-gray-100 p-6">
              <div className="mb-5 flex justify-end">
                <button
                  type="button"
                  onClick={openCreateCategory}
                  className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
                >
                  <FiPlus />
                  Thêm danh mục
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {sortedCategories.map((category) => (
                  <div key={category.id} className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {category.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {category.active !== false
                            ? "Đang hiển thị"
                            : "Đang ẩn"}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openEditCategory(category)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50"
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          type="button"
                          onClick={() => requestDeleteCategory(category)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Tất cả sản phẩm
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {totalProducts === 0
                  ? "0 sản phẩm"
                  : `${startIndex + 1}–${endIndex}/${totalProducts} sản phẩm`}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm sản phẩm..."
                  className="w-full rounded-xl bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-pink-100 sm:w-64"
                />
              </div>

              <button
                type="button"
                onClick={openCreateProduct}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
              >
                <FiPlus />
                Thêm sản phẩm
              </button>
            </div>
          </div>

          {visibleProducts.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              Không có sản phẩm.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {visibleProducts.map((product) => {
                  const discount = getDiscountPercent(
                    product.price,
                    product.oldPrice
                  );

                  return (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100"
                    >
                      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden bg-gray-50 p-2">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <FiImage size={34} className="text-gray-300" />
                        )}

                        {discount > 0 && (
                          <span className="absolute left-2 top-2 rounded-md bg-pink-600 px-2 py-1 text-[10px] font-bold text-white">
                            GIẢM {discount}%
                          </span>
                        )}
                      </div>

                      <div className="p-3">
                        <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-gray-800">
                          {product.name}
                        </h3>

                        <div className="mt-2">
                          <p className="text-sm font-bold text-pink-600">
                            {formatPrice(product.price)}
                          </p>

                          {product.oldPrice && (
                            <p className="text-[11px] text-gray-400 line-through">
                              {formatPrice(product.oldPrice)}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditProduct(product)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-50 px-2 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                          >
                            <FiEdit2 />
                            Sửa
                          </button>

                          <button
                            type="button"
                            onClick={() => requestDelete(product)}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-50 px-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                          >
                            <FiTrash2 />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-7 flex justify-center gap-2">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage(safePage - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 disabled:opacity-40"
                  >
                    <FiChevronLeft />
                  </button>

                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) => {
                      const page = index + 1;

                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`h-10 min-w-10 rounded-lg px-3 text-sm font-semibold ${
                            page === safePage
                              ? "bg-pink-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}

                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage(safePage + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 disabled:opacity-40"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {showProductModal && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center overflow-y-auto bg-black/45 p-4">
          <form
            onSubmit={saveProduct}
            className="my-6 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
              </h2>

              <button
                type="button"
                onClick={closeProductModal}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tên sản phẩm
                </label>

                <input
                  name="name"
                  value={productForm.name}
                  onChange={handleProductChange}
                  className={inputClass}
                  placeholder="Ví dụ: Bó hoa hồng đỏ"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Giá
                </label>

                <input
                  name="price"
                  type="number"
                  min="0"
                  value={productForm.price}
                  onChange={handleProductChange}
                  className={inputClass}
                  placeholder="Ví dụ: 500000"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Giá cũ
                </label>

                <input
                  name="oldPrice"
                  type="number"
                  min="0"
                  value={productForm.oldPrice}
                  onChange={handleProductChange}
                  className={inputClass}
                  placeholder="Ví dụ: 650000"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Giảm
                </label>

                <div className="flex h-[46px] items-center rounded-xl bg-pink-50 px-4 font-bold text-pink-600">
                  GIẢM{" "}
                  {getDiscountPercent(productForm.price, productForm.oldPrice)}%
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Danh mục
                </label>

                <select
                  name="category"
                  value={productForm.category}
                  onChange={handleProductChange}
                  className={inputClass}
                >
                  <option value="">Chọn danh mục</option>

                  {sortedCategories
                    .filter((category) => category.active !== false)
                    .map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tóm tắt
                </label>

                <textarea
                  name="description"
                  rows="4"
                  value={productForm.description}
                  onChange={handleProductChange}
                  className={inputClass}
                  placeholder="Nhập mô tả ngắn về sản phẩm..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Hình ảnh
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={readProductImage}
                  className="block w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-3 text-sm"
                />

                {productForm.image && (
                  <div className="mt-4 flex min-h-48 items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-3">
                    <img
                      src={productForm.image}
                      alt="Xem trước sản phẩm"
                      className="max-h-56 max-w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeProductModal}
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
              >
                {editingProduct ? "Lưu thay đổi" : "Thêm sản phẩm"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/45 p-4">
          <form
            onSubmit={saveCategory}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
              </h2>

              <button
                type="button"
                onClick={closeCategoryModal}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Tên danh mục
                </label>

                <input
                  name="name"
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Mô tả
                </label>

                <textarea
                  rows="3"
                  value={categoryForm.summary}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      summary: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={categoryForm.active}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      active: event.target.checked,
                    }))
                  }
                />
                Hiển thị danh mục
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCategoryModal}
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <Modal title="Xác nhận xóa" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm leading-6 text-gray-600">
            Bạn có chắc muốn xóa <strong>"{deleteTarget.name}"</strong>
            ?
            <br />
            Thao tác này không thể hoàn tác.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Xóa
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default AdminProductsPage;
