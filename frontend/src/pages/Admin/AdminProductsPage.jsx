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
  FiUpload,
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
  salesCount: 0,
};

const EMPTY_CATEGORY = {
  name: "",
  summary: "",
  image: "",
  active: true,
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

const compressImage = (
  file,
  { maxWidth = 1400, maxHeight = 1000, quality = 0.8 } = {}
) =>
  new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Vui lòng chọn đúng file hình ảnh."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const ratio = Math.min(
          1,
          maxWidth / image.width,
          maxHeight / image.height
        );

        const canvas = document.createElement("canvas");

        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Không thể xử lý hình ảnh."));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/webp", quality));
      };

      image.onerror = () => reject(new Error("Không thể đọc hình ảnh."));

      image.src = String(reader.result || "");
    };

    reader.onerror = () => reject(new Error("Không thể đọc file hình ảnh."));

    reader.readAsDataURL(file);
  });

const FilePicker = ({ id, selected, onChange }) => (
  <div className="mt-2">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label
        htmlFor={id}
        className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
      >
        <FiUpload size={16} />
        Chọn tệp
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
      className="sr-only"
    />
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

  const [confirmDelete, setConfirmDelete] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  const categoriesSorted = useMemo(
    () =>
      [...categories].sort(
        (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
      ),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    if (!query) return products;

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
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
    });

    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT);
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

  const handleImage = async (event, setter, options) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    clearMessages();

    try {
      const image = await compressImage(file, options);
      setter(image);
    } catch (imageError) {
      setError(imageError.message || "Không thể xử lý hình ảnh.");
    }
  };

  const saveCategory = (event) => {
    event.preventDefault();
    clearMessages();

    const name = categoryForm.name.trim();

    if (!name) {
      setError("Vui lòng nhập tên danh mục.");
      return;
    }

    const slug = slugifyCategory(name);

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

    const nextCategory = {
      id: editingCategory?.id || slug,
      name,
      slug,
      label: name,
      query: slug,
      summary: categoryForm.summary.trim(),
      image: categoryForm.image || "",
      active: categoryForm.active !== false,
      sortOrder: editingCategory?.sortOrder || categories.length + 1,
    };

    try {
      const updated = editingCategory
        ? categories.map((category) =>
            String(category.id) === String(editingCategory.id)
              ? nextCategory
              : category
          )
        : [...categories, nextCategory];

      const saved = saveCategories(updated);

      setCategories(saved);
      closeCategoryModal();

      setMessage(
        editingCategory ? "Đã cập nhật danh mục." : "Đã thêm danh mục."
      );
    } catch (saveError) {
      setError(saveError.message || "Không thể lưu danh mục.");
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

    if (!Number.isFinite(salesCount) || salesCount < 0) {
      setError("Đã bán phải là số nguyên không âm.");
      return;
    }

    const data = {
      name,
      price,
      oldPrice,
      category: productForm.category,
      description: productForm.description.trim(),
      image: productForm.image || "",
      salesCount: Math.floor(salesCount),
    };

    try {
      let saved;

      if (editingProduct) {
        saved = saveProducts(
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
        saved = saveProducts([
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

      setProducts(saved);
      closeProductModal();
    } catch (saveError) {
      setError(saveError.message || "Không thể lưu sản phẩm.");
    }
  };

  const requestDeleteProduct = (product) => {
    setConfirmDelete({
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

    setConfirmDelete({
      type: "category",
      id: category.id,
      name: category.name,
    });
  };

  const executeDelete = () => {
    if (!confirmDelete) return;

    try {
      if (confirmDelete.type === "product") {
        const saved = saveProducts(
          products.filter(
            (product) => String(product.id) !== String(confirmDelete.id)
          )
        );

        setProducts(saved);

        setMessage("Đã xóa sản phẩm.");
      }

      if (confirmDelete.type === "category") {
        const saved = saveCategories(
          categories
            .filter(
              (category) => String(category.id) !== String(confirmDelete.id)
            )
            .map((category, index) => ({
              ...category,
              sortOrder: index + 1,
            }))
        );

        setCategories(saved);
        setMessage("Đã xóa danh mục.");
      }

      setConfirmDelete(null);
      setError("");
    } catch (deleteError) {
      setConfirmDelete(null);
      setError(deleteError.message || "Không thể xóa dữ liệu.");
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;

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
            Quản lý sản phẩm, danh mục, hình ảnh, giá và số lượng đã bán.
          </p>
        </header>

        {message && (
          <div className="mb-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-5 overflow-hidden rounded-2xl bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setShowCategories((value) => !value)}
            className="flex w-full items-center justify-between p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                <FiTag />
              </span>

              <span>
                <span className="block text-lg font-bold text-gray-900">
                  Danh mục sản phẩm
                </span>

                <span className="text-sm text-gray-500">
                  {categories.length} danh mục
                </span>
              </span>
            </div>

            <FiChevronDown className={showCategories ? "rotate-180" : ""} />
          </button>

          {showCategories && (
            <div className="border-t border-gray-100 p-5">
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={openCreateCategory}
                  className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
                >
                  <FiPlus />
                  Thêm danh mục
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categoriesSorted.map((category) => (
                  <article
                    key={category.id}
                    className="overflow-hidden rounded-xl border border-gray-200"
                  >
                    <div className="flex h-28 items-center justify-center bg-gray-50 p-3">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="max-h-full max-w-full rounded-lg object-contain"
                        />
                      ) : (
                        <FiImage size={30} className="text-gray-300" />
                      )}
                    </div>

                    <div className="p-3">
                      <h3 className="font-semibold text-gray-800">
                        {category.name}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {category.summary || "Chưa có mô tả danh mục."}
                      </p>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditCategory(category)}
                          className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() => requestDeleteCategory(category)}
                          className="flex-1 rounded-lg border border-red-100 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

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

            <div className="flex flex-col gap-3 sm:flex-row">
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
                  <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gray-50 p-3 sm:h-40">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="max-h-full max-w-full rounded-lg object-contain"
                      />
                    ) : (
                      <FiImage size={32} className="text-gray-300" />
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
              >
                <FiChevronLeft />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
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
                )
              )}

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => goToPage(safePage + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40"
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
                <p className="mt-1 text-xs text-gray-400">
                  Đây là nơi Admin chỉnh sửa số lượng Đã bán.
                </p>
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
                  onChange={(event) =>
                    handleImage(
                      event,
                      (image) =>
                        setProductForm((current) => ({
                          ...current,
                          image,
                        })),
                      {
                        maxWidth: 1400,
                        maxHeight: 1000,
                        quality: 0.8,
                      }
                    )
                  }
                />

                {productForm.image && (
                  <div className="mt-4 flex h-36 w-48 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2">
                    <img
                      src={productForm.image}
                      alt="Xem trước sản phẩm"
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
                className="rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
              >
                Lưu sản phẩm
              </button>
            </div>
          </form>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 p-4">
          <form
            onSubmit={saveCategory}
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
              </h2>

              <button
                type="button"
                onClick={closeCategoryModal}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-4">
              <input
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Tên danh mục"
                className={inputClass}
              />

              <textarea
                rows={3}
                value={categoryForm.summary}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    summary: event.target.value,
                  }))
                }
                placeholder="Tóm tắt danh mục"
                className={inputClass}
              />

              <FilePicker
                id="category-image"
                selected={Boolean(categoryForm.image)}
                onChange={(event) =>
                  handleImage(
                    event,
                    (image) =>
                      setCategoryForm((current) => ({
                        ...current,
                        image,
                      })),
                    {
                      maxWidth: 1000,
                      maxHeight: 700,
                      quality: 0.8,
                    }
                  )
                }
              />

              {categoryForm.image && (
                <div className="flex h-32 w-44 items-center justify-center overflow-hidden rounded-xl border bg-gray-50 p-2">
                  <img
                    src={categoryForm.image}
                    alt="Xem trước danh mục"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCategoryModal}
                className="rounded-lg border border-gray-200 px-5 py-2.5"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="rounded-lg bg-pink-600 px-5 py-2.5 font-semibold text-white"
              >
                Lưu danh mục
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
    </main>
  );
};

export default AdminProductsPage;
