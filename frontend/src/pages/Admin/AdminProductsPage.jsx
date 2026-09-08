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
};

const EMPTY_CATEGORY = {
  name: "",
  summary: "",
  image: "",
  active: true,
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

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

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const compressImage = (
  file,
  { maxWidth = 1400, maxHeight = 1000, quality = 0.8 } = {}
) =>
  new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("image/")) {
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

        const width = Math.max(1, Math.round(image.width * ratio));

        const height = Math.max(1, Math.round(image.height * ratio));

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Không thể xử lý hình ảnh."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        const result = canvas.toDataURL("image/webp", quality);

        resolve(result);
      };

      image.onerror = () => {
        reject(new Error("Không thể đọc hình ảnh."));
      };

      image.src = String(reader.result || "");
    };

    reader.onerror = () => {
      reject(new Error("Không thể đọc file hình ảnh."));
    };

    reader.readAsDataURL(file);
  });

const FilePicker = ({ id, onChange, selected, accept = "image/*" }) => (
  <div className="mt-2">
    <div className="flex flex-wrap items-center gap-3">
      <label
        htmlFor={id}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
      >
        <FiUpload size={16} />
        Chọn tệp
      </label>

      <span className="text-sm text-gray-500">
        {selected ? "Đã chọn hình ảnh" : "Không có tệp nào được chọn"}
      </span>
    </div>

    <input
      id={id}
      type="file"
      accept={accept}
      onChange={onChange}
      className="sr-only"
    />
  </div>
);

const ImagePreview = ({ src, alt, className = "h-32 w-48" }) => {
  if (!src) return null;

  return (
    <div
      className={`mt-4 flex items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2 ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="block max-h-full max-w-full rounded-lg object-contain"
      />
    </div>
  );
};

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
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }

    robots.setAttribute("content", "noindex,nofollow");
  }, []);

  useEffect(() => {
    const refreshProducts = () => {
      setProducts(readProducts());
    };

    const refreshCategories = () => {
      setCategories(readCategories());
    };

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

    setCategoryForm({
      ...EMPTY_CATEGORY,
    });

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
      console.error(imageError);

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

    try {
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
      console.error(saveError);

      setError("Không thể lưu danh mục. Hãy giảm dung lượng hình ảnh.");
    }
  };

  const requestDeleteCategory = (category) => {
    const productCount = products.filter(
      (product) => String(product.category) === String(category.slug)
    ).length;

    if (productCount > 0) {
      setError(
        `Không thể xóa "${category.name}" vì đang có ${productCount} sản phẩm sử dụng danh mục này.`
      );
      return;
    }

    setConfirmDelete({
      type: "category",
      id: category.id,
      name: category.name,
    });
  };

  const requestDeleteProduct = (product) => {
    setConfirmDelete({
      type: "product",
      id: product.id,
      name: product.name,
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

        const nextTotal = saved.length;

        const nextPages = Math.max(1, Math.ceil(nextTotal / PRODUCTS_PER_PAGE));

        if (currentPage > nextPages) {
          setCurrentPage(nextPages);
        }

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
      console.error(deleteError);

      setConfirmDelete(null);

      setError("Không thể xóa dữ liệu.");
    }
  };

  const validateProduct = () => {
    const name = productForm.name.trim();

    const price = Number(productForm.price);

    const oldPrice =
      productForm.oldPrice === "" ? null : Number(productForm.oldPrice);

    if (!name) {
      setError("Vui lòng nhập tên sản phẩm.");
      return false;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Giá sản phẩm phải lớn hơn 0.");
      return false;
    }

    if (
      oldPrice !== null &&
      (!Number.isFinite(oldPrice) || oldPrice <= price)
    ) {
      setError("Giá cũ phải lớn hơn giá hiện tại.");
      return false;
    }

    if (!productForm.category) {
      setError("Vui lòng chọn danh mục.");
      return false;
    }

    return true;
  };

  const saveProduct = (event) => {
    event.preventDefault();
    clearMessages();

    if (!validateProduct()) {
      return;
    }

    try {
      const data = {
        name: productForm.name.trim(),
        price: Number(productForm.price),
        oldPrice:
          productForm.oldPrice === "" ? null : Number(productForm.oldPrice),
        category: productForm.category,
        description: productForm.description.trim(),
        image: productForm.image || "",
      };

      if (editingProduct) {
        const saved = saveProducts(
          products.map((product) =>
            String(product.id) === String(editingProduct.id)
              ? {
                  ...product,
                  ...data,
                }
              : product
          )
        );

        setProducts(saved);

        setMessage("Đã cập nhật sản phẩm thành công.");
      } else {
        const saved = saveProducts([
          ...products,
          {
            id: `product-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,
            ...data,
            salesCount: 0,
            isNew: true,
            createdAt: new Date().toISOString(),
          },
        ]);

        setProducts(saved);

        setMessage("Đã thêm sản phẩm thành công.");
      }

      closeProductModal();
    } catch (saveError) {
      console.error(saveError);

      setError("Không thể lưu sản phẩm. Hãy giảm dung lượng ảnh.");
    }
  };

  const discount = getDiscountPercent(productForm.price, productForm.oldPrice);

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

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-7">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>

          <p className="mt-2 text-sm text-gray-500">
            Quản lý sản phẩm, danh mục và hình ảnh.
          </p>
        </header>

        {(message || error) && (
          <div className="mb-5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm">
            <span className={error ? "text-red-600" : "text-green-600"}>
              {error || message}
            </span>
          </div>
        )}

        <section className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setShowCategories((value) => !value)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                <FiTag />
              </span>

              <span>
                <span className="block text-xl font-bold text-gray-900">
                  Danh mục sản phẩm
                </span>

                <span className="mt-1 block text-sm text-gray-500">
                  {categories.length} danh mục
                </span>
              </span>
            </div>

            <FiChevronDown
              className={`transition ${showCategories ? "rotate-180" : ""}`}
            />
          </button>

          {showCategories && (
            <div className="border-t border-gray-100 p-6">
              <div className="mb-5 flex justify-end">
                <button
                  type="button"
                  onClick={openCreateCategory}
                  className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
                >
                  <FiPlus />
                  Thêm danh mục
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categoriesSorted.map((category) => (
                  <article
                    key={category.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <div className="flex h-32 items-center justify-center overflow-hidden bg-gray-50 p-3">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          loading="lazy"
                          className="block max-h-full max-w-full rounded-lg object-contain"
                        />
                      ) : (
                        <FiImage size={32} className="text-gray-300" />
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800">
                        {category.name}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                        {category.summary || "Chưa có mô tả danh mục."}
                      </p>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditCategory(category)}
                          className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() => requestDeleteCategory(category)}
                          className="flex-1 rounded-lg border border-red-100 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
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

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-pink-400 sm:w-64"
                  aria-label="Tìm sản phẩm trong quản lý sản phẩm"
                />
              </label>

              <button
                type="button"
                onClick={openCreateProduct}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
              >
                <FiPlus />
                Thêm sản phẩm
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
            {visibleProducts.map((product) => {
              const productDiscount = getDiscountPercent(
                product.price,
                product.oldPrice
              );

              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                  <div className="relative flex h-40 w-full items-center justify-center overflow-hidden bg-gray-50 p-3 sm:h-44">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="block max-h-full max-w-full rounded-lg object-contain"
                      />
                    ) : (
                      <FiImage size={34} className="text-gray-300" />
                    )}

                    {productDiscount > 0 && (
                      <span className="absolute left-2 top-2 rounded-md bg-pink-600 px-2 py-1 text-[10px] font-bold text-white">
                        GIẢM {productDiscount}%
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-gray-800">
                      {product.name}
                    </h3>

                    <p className="mt-1 line-clamp-2 min-h-[34px] text-xs leading-5 text-gray-500">
                      {product.description || "Chưa có tóm tắt."}
                    </p>

                    <div className="mt-2">
                      <span className="text-sm font-bold text-pink-600">
                        {money(product.price)}
                      </span>

                      {product.oldPrice && (
                        <span className="ml-2 text-[11px] text-gray-400 line-through">
                          {money(product.oldPrice)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditProduct(product)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        <FiEdit2 size={13} />
                        Sửa
                      </button>

                      <button
                        type="button"
                        onClick={() => requestDeleteProduct(product)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-100 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
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

          {visibleProducts.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-500">
              Không tìm thấy sản phẩm.
            </div>
          )}

          {totalProducts > 0 && (
            <div className="mt-8 flex flex-col items-center gap-3 border-t border-gray-100 pt-6">
              {totalPages > 1 && (
                <nav
                  className="flex items-center justify-center gap-2"
                  aria-label="Phân trang quản lý sản phẩm"
                >
                  <button
                    type="button"
                    disabled={safePage === 1}
                    onClick={() => goToPage(safePage - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-pink-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
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
                      aria-current={page === safePage ? "page" : undefined}
                      className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition ${
                        page === safePage
                          ? "border-pink-600 bg-pink-600 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={safePage === totalPages}
                    onClick={() => goToPage(safePage + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-pink-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Trang sau"
                  >
                    <FiChevronRight />
                  </button>
                </nav>
              )}
            </div>
          )}
        </section>
      </div>

      {showProductModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={saveProduct}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
              </h2>

              <button
                type="button"
                onClick={closeProductModal}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
                aria-label="Đóng"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Giá
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={productForm.price}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
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
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Giảm {discount}%
                </label>

                <input
                  value={`${discount}%`}
                  readOnly
                  className={`${inputClass} bg-gray-50 font-semibold text-pink-600`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                  required
                >
                  <option value="">Chọn danh mục</option>

                  {categoriesSorted
                    .filter((category) => category.active !== false)
                    .map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                  placeholder="Nhập tóm tắt sản phẩm..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">
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

                <ImagePreview
                  src={productForm.image}
                  alt="Xem trước sản phẩm"
                  className="h-32 w-48"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-5">
              <button
                type="button"
                onClick={closeProductModal}
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
              >
                {editingProduct ? "Lưu thay đổi" : "Thêm sản phẩm"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={saveCategory}
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
              </h2>

              <button
                type="button"
                onClick={closeCategoryModal}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
                aria-label="Đóng"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tên danh mục
                </label>

                <input
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tóm tắt
                </label>

                <textarea
                  rows={3}
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

              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Hình ảnh danh mục
                </label>

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
                        quality: 0.78,
                      }
                    )
                  }
                />

                <ImagePreview
                  src={categoryForm.image}
                  alt="Xem trước danh mục"
                  className="h-28 w-40"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
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

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-5">
              <button
                type="button"
                onClick={closeCategoryModal}
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
              >
                Lưu danh mục
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <FiTrash2 />
            </div>

            <h2
              id="delete-product-title"
              className="mt-4 text-center text-lg font-bold text-gray-900"
            >
              Xác nhận xóa
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-gray-600">
              Bạn có chắc muốn xóa <strong>{confirmDelete.name}</strong>
              ?
              <br />
              Thao tác này không thể hoàn tác.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={executeDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
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
