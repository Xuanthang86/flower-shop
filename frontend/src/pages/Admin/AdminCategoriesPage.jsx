import { useEffect, useMemo, useRef, useState } from "react";
import {
  getPageTitle,
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiCheck,
  FiEdit2,
  FiImage,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";

import {
  CATEGORY_UPDATED_EVENT,
  slugifyCategory,
} from "@/constants/productCategories";

import {
  getProductsSnapshot,
  readCategories,
  readProducts,
  saveCategories,
  saveProductsAsync,
  subscribeProducts,
} from "@/services/catalog";

import { uploadImageFile } from "@/services/media";

const EMPTY_FORM = {
  id: "",
  name: "",
  slug: "",
  summary: "",
  seoTitle: "",
  seoDescription: "",
  image: "",
  active: true,
  sortOrder: 1,
  updatedAt: null,
};

const getNowIso = () => new Date().toISOString();

const normalizeText = (value) => String(value ?? "").trim();

const normalizeSlug = (value) => slugifyCategory(normalizeText(value));

const countProductsByCategory = (products, slug) =>
  products.filter((product) => String(product.category) === String(slug))
    .length;

const AdminCategoriesPage = () => {
  useEffect(() => {
    const updateTitle = () => {
      document.title = getPageTitle(readSiteSettings(), "Quản lý danh mục hoa");
    };

    updateTitle();

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, updateTitle);

    window.addEventListener("storage", updateTitle);

    return () => {
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, updateTitle);

      window.removeEventListener("storage", updateTitle);
    };
  }, []);
  const [categories, setCategories] = useState(() => readCategories());

  const [products, setProducts] = useState(() => readProducts());

  const [modalOpen, setModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [slugTouched, setSlugTouched] = useState(false);

  const [saving, setSaving] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [deleteCategory, setDeleteCategory] = useState(null);

  const [transferCategory, setTransferCategory] = useState(null);

  const [targetCategoryId, setTargetCategoryId] = useState("");

  const [transferSaving, setTransferSaving] = useState(false);

  const imageInputRef = useRef(null);

  useEffect(() => {
    const refreshCategories = () => {
      setCategories(readCategories());
    };

    const refreshProducts = () => {
      setProducts(readProducts());
    };

    window.addEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

    window.addEventListener("storage", refreshCategories);

    const unsubscribeProducts = subscribeProducts(refreshProducts);

    return () => {
      window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

      window.removeEventListener("storage", refreshCategories);

      unsubscribeProducts();
    };
  }, []);

  useEffect(() => {
    setProducts(getProductsSnapshot());
  }, []);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
      ),
    [categories]
  );

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
      sortOrder:
        Math.max(1, ...categories.map((item) => Number(item.sortOrder || 0))) +
        1,
    });

    setEditingCategory(null);
    setSlugTouched(false);
    setError("");
  };

  const openCreateModal = () => {
    resetForm();
    setMessage("");
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);

    setForm({
      ...EMPTY_FORM,
      ...category,
    });

    setSlugTouched(true);
    setMessage("");
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving || uploadingImage) {
      return;
    }

    setModalOpen(false);
    resetForm();
  };

  const handleNameChange = (event) => {
    const value = event.target.value;

    setForm((current) => ({
      ...current,
      name: value,
      slug: slugTouched ? current.slug : normalizeSlug(value),
      seoTitle:
        current.seoTitle ||
        (value.trim() ? `${value.trim()} | Flower Shop` : ""),
    }));
  };

  const handleSlugChange = (event) => {
    setSlugTouched(true);

    setForm((current) => ({
      ...current,
      slug: normalizeSlug(event.target.value),
    }));
  };

  const duplicateSlug = useMemo(() => {
    const currentSlug = normalizeSlug(form.slug);

    if (!currentSlug) {
      return false;
    }

    return categories.some(
      (category) =>
        String(category.slug) === currentSlug &&
        String(category.id) !== String(editingCategory?.id || "")
    );
  }, [categories, editingCategory, form.slug]);

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setError("");
    setMessage("");
    setUploadingImage(true);

    try {
      const url = await uploadImageFile(file, {
        folder: "flower-shop/categories",
      });

      setForm((current) => ({
        ...current,
        image: url,
      }));

      setMessage("Ảnh danh mục đã được tải lên Cloudinary.");
    } catch (uploadError) {
      setError(
        uploadError?.message || "Không thể tải ảnh danh mục lên Cloudinary."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    const name = normalizeText(form.name);
    const slug = normalizeSlug(form.slug);

    if (!name) {
      return "Vui lòng nhập tên danh mục.";
    }

    if (name.length > 150) {
      return "Tên danh mục không được vượt quá 150 ký tự.";
    }

    if (!slug) {
      return "Slug không được để trống.";
    }

    if (slug.length > 180) {
      return "Slug không được vượt quá 180 ký tự.";
    }

    if (duplicateSlug) {
      return `Slug "${slug}" đã tồn tại. Vui lòng chọn slug khác.`;
    }

    const sortOrder = Number(form.sortOrder);

    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      return "Sort order phải là số lớn hơn hoặc bằng 0.";
    }

    return "";
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const slug = normalizeSlug(form.slug);

    const nextCategory = {
      ...form,
      id: editingCategory?.id || slug || `category-${Date.now()}`,
      name: normalizeText(form.name),
      slug,
      label: normalizeText(form.name),
      query: slug,
      summary: normalizeText(form.summary),
      seoTitle:
        normalizeText(form.seoTitle) ||
        `${normalizeText(form.name)} | Flower Shop`,
      seoDescription:
        normalizeText(form.seoDescription) || normalizeText(form.summary),
      image: normalizeText(form.image),
      active: Boolean(form.active),
      sortOrder: Number(form.sortOrder),
      updatedAt: getNowIso(),
    };

    const nextCategories = editingCategory
      ? categories.map((category) =>
          String(category.id) === String(editingCategory.id)
            ? nextCategory
            : category
        )
      : [...categories, nextCategory];

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const savedCategories = saveCategories(nextCategories);

      setCategories(savedCategories);

      setMessage(
        editingCategory
          ? "Đã cập nhật danh mục thành công."
          : "Đã thêm danh mục thành công."
      );

      setModalOpen(false);
      resetForm();
    } catch (saveError) {
      setError(
        saveError?.message || "Không thể lưu danh mục. Vui lòng thử lại."
      );
    } finally {
      setSaving(false);
    }
  };

  const getTransferTargets = (sourceCategoryId) =>
    sortedCategories.filter(
      (category) => String(category.id) !== String(sourceCategoryId)
    );

  const openTransferModal = (category) => {
    const targets = getTransferTargets(category.id);

    setTransferCategory(category);
    setTargetCategoryId(targets[0]?.id || "");
    setError("");
    setMessage("");
  };

  const openDeleteModal = (category) => {
    const productCount = countProductsByCategory(products, category.slug);

    setDeleteCategory({
      ...category,
      productCount,
    });

    setTargetCategoryId("");

    if (productCount > 0) {
      const targets = getTransferTargets(category.id);

      setTargetCategoryId(targets[0]?.id || "");
    }

    setError("");
    setMessage("");
  };

  const closeTransferModal = () => {
    if (transferSaving) {
      return;
    }

    setTransferCategory(null);
    setTargetCategoryId("");
  };

  const closeDeleteModal = () => {
    if (transferSaving) {
      return;
    }

    setDeleteCategory(null);
    setTargetCategoryId("");
  };

  const executeTransfer = async ({
    sourceCategory,
    targetCategory,
    removeSource = false,
  }) => {
    if (!sourceCategory || !targetCategory) {
      setError("Vui lòng chọn danh mục đích.");
      return;
    }

    if (String(sourceCategory.id) === String(targetCategory.id)) {
      setError("Danh mục đích phải khác danh mục nguồn.");
      return;
    }

    const affectedProducts = products.filter(
      (product) => String(product.category) === String(sourceCategory.slug)
    );

    if (affectedProducts.length === 0) {
      if (removeSource) {
        const nextCategories = categories.filter(
          (category) => String(category.id) !== String(sourceCategory.id)
        );

        saveCategories(nextCategories);

        setCategories(nextCategories);

        setMessage(`Đã xóa danh mục "${sourceCategory.name}".`);

        return;
      }

      setMessage(
        `Danh mục "${sourceCategory.name}" hiện không có sản phẩm cần chuyển.`
      );

      return;
    }

    const nextProducts = products.map((product) =>
      String(product.category) === String(sourceCategory.slug)
        ? {
            ...product,
            category: targetCategory.slug,
          }
        : product
    );

    setTransferSaving(true);
    setError("");
    setMessage("");

    try {
      await saveProductsAsync(nextProducts);

      let nextCategories = categories;

      if (removeSource) {
        nextCategories = categories.filter(
          (category) => String(category.id) !== String(sourceCategory.id)
        );

        saveCategories(nextCategories);
      }

      setProducts(nextProducts);
      setCategories(nextCategories);

      setMessage(
        removeSource
          ? `Đã chuyển ${affectedProducts.length} sản phẩm sang "${targetCategory.name}" và xóa danh mục "${sourceCategory.name}".`
          : `Đã chuyển ${affectedProducts.length} sản phẩm sang "${targetCategory.name}".`
      );

      closeTransferModal();
      closeDeleteModal();
    } catch (operationError) {
      setError(
        operationError?.message ||
          "Không thể hoàn tất thao tác chuyển danh mục."
      );
    } finally {
      setTransferSaving(false);
    }
  };

  const handleTransfer = async () => {
    const targetCategory = categories.find(
      (category) => String(category.id) === String(targetCategoryId)
    );

    await executeTransfer({
      sourceCategory: transferCategory,
      targetCategory,
      removeSource: false,
    });
  };

  const handleDelete = async () => {
    if (!deleteCategory) {
      return;
    }

    const productCount = countProductsByCategory(products, deleteCategory.slug);

    if (productCount === 0) {
      setTransferSaving(true);
      setError("");

      try {
        const nextCategories = categories.filter(
          (category) => String(category.id) !== String(deleteCategory.id)
        );

        const savedCategories = saveCategories(nextCategories);

        setCategories(savedCategories);

        setMessage(`Đã xóa danh mục "${deleteCategory.name}".`);

        closeDeleteModal();
      } catch (deleteError) {
        setError(deleteError?.message || "Không thể xóa danh mục.");
      } finally {
        setTransferSaving(false);
      }

      return;
    }

    const targetCategory = categories.find(
      (category) => String(category.id) === String(targetCategoryId)
    );

    await executeTransfer({
      sourceCategory: deleteCategory,
      targetCategory,
      removeSource: true,
    });
  };

  const getCategoryProductCount = (category) =>
    countProductsByCategory(products, category.slug);

  return (
    <section className="min-h-[calc(100vh-76px)] bg-gray-50 py-6">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Quản lý danh mục hoa
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Quản lý tên, slug, SEO, hình ảnh, trạng thái và sản phẩm thuộc
              từng danh mục.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700"
          >
            <FiPlus size={18} />
            Thêm danh mục
          </button>
        </div>

        {message && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <FiCheck className="mt-0.5 shrink-0" size={17} />
            <span>{message}</span>
          </div>
        )}

        {error && !modalOpen && !deleteCategory && !transferCategory && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <FiAlertTriangle className="mt-0.5 shrink-0" size={17} />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-0 table-fixed">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="w-[26%] px-3 py-4 whitespace-nowrap">
                    Danh mục
                  </th>
                  <th className="w-[17%] px-3 py-4 whitespace-nowrap">
                    Slug / URL
                  </th>
                  <th className="w-[8%] px-3 py-4 whitespace-nowrap">
                    Sản phẩm
                  </th>
                  <th className="w-[18%] px-3 py-4 whitespace-nowrap">SEO</th>
                  <th className="w-[7%] px-3 py-4 whitespace-nowrap">Thứ tự</th>
                  <th className="w-[11%] px-3 py-4 whitespace-nowrap">
                    Trạng thái
                  </th>
                  <th className="w-[13%] px-3 py-4 whitespace-nowrap">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {sortedCategories.map((category) => {
                  const productCount = getCategoryProductCount(category);

                  return (
                    <tr
                      key={category.id}
                      className="align-top transition hover:bg-gray-50/70"
                    >
                      <td className="px-3 py-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-pink-50">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-pink-300">
                                <FiImage size={21} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">
                              {category.name}
                            </p>

                            {category.summary && (
                              <p className="mt-1 line-clamp-2 max-w-md text-xs leading-5 text-gray-500">
                                {category.summary}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        <p className="truncate font-mono text-sm text-gray-700">
                          {category.slug}
                        </p>

                        <p className="mt-1 break-all text-xs text-pink-600">
                          /products/category/{category.slug}
                        </p>
                      </td>

                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                          {productCount}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <p className="truncate text-sm font-medium text-gray-700">
                          {category.seoTitle || "—"}
                        </p>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                          {category.seoDescription || "—"}
                        </p>
                      </td>

                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-700">
                          {category.sortOrder}
                        </span>
                      </td>

                      <td className="px-3 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                            category.active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {category.active ? "Đang hoạt động" : "Tạm ẩn"}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex min-w-0 flex-wrap items-center justify-start gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(category)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-semibold text-gray-700 transition hover:border-pink-200 hover:text-pink-600"
                          >
                            <FiEdit2 size={14} />
                            Sửa
                          </button>

                          {productCount > 0 && (
                            <button
                              type="button"
                              onClick={() => openTransferModal(category)}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                            >
                              <FiRefreshCw size={14} />
                              Chuyển SP
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openDeleteModal(category)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            <FiTrash2 size={14} />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {sortedCategories.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-12 text-center text-sm text-gray-500"
                    >
                      Chưa có danh mục nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Cập nhật thông tin danh mục và SEO.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving || uploadingImage}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
                aria-label="Đóng"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <FiAlertTriangle className="mt-0.5 shrink-0" size={17} />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {message}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="category-name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Tên danh mục
                  </label>

                  <input
                    id="category-name"
                    value={form.name}
                    onChange={handleNameChange}
                    maxLength={150}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                    placeholder="Ví dụ: Hoa khai trương"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category-slug"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Slug
                  </label>

                  <input
                    id="category-slug"
                    value={form.slug}
                    onChange={handleSlugChange}
                    className={`w-full rounded-xl border px-4 py-3 font-mono text-sm outline-none transition focus:ring-2 ${
                      duplicateSlug
                        ? "border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-pink-400 focus:ring-pink-100"
                    }`}
                    placeholder="hoa-khai-truong"
                  />

                  {duplicateSlug ? (
                    <p className="mt-1 text-xs text-red-600">
                      Slug này đã tồn tại.
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-400">
                      URL: /products/category/
                      {normalizeSlug(form.slug) || "..."}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="category-summary"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Mô tả ngắn
                  </label>

                  <textarea
                    id="category-summary"
                    value={form.summary}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        summary: event.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-pink-100"
                    placeholder="Mô tả ngắn cho danh mục..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="category-seo-title"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    SEO title
                  </label>

                  <input
                    id="category-seo-title"
                    value={form.seoTitle}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        seoTitle: event.target.value,
                      }))
                    }
                    maxLength={180}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                    placeholder="Hoa khai trương đẹp | Flower Shop"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category-sort-order"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Sort order
                  </label>

                  <input
                    id="category-sort-order"
                    type="number"
                    min="0"
                    step="1"
                    value={form.sortOrder}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sortOrder: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="category-seo-description"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    SEO description
                  </label>

                  <textarea
                    id="category-seo-description"
                    value={form.seoDescription}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        seoDescription: event.target.value,
                      }))
                    }
                    rows={4}
                    maxLength={320}
                    className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-pink-100"
                    placeholder="Mô tả SEO cho trang danh mục..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Ảnh danh mục
                  </label>

                  <div className="flex gap-3">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-pink-50">
                      {form.image ? (
                        <img
                          src={form.image}
                          alt={form.name || "Ảnh danh mục"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-pink-300">
                          <FiImage size={25} />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-pink-200 hover:text-pink-600 disabled:opacity-50"
                      >
                        {uploadingImage ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-pink-600" />
                            Đang tải...
                          </>
                        ) : (
                          <>
                            <FiUpload size={16} />
                            Tải ảnh lên
                          </>
                        )}
                      </button>

                      <p className="text-xs leading-5 text-gray-400">
                        Ảnh được tải lên Cloudinary và lưu URL.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Trạng thái
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={Boolean(form.active)}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          active: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />

                    <span className="whitespace-nowrap text-sm font-medium text-gray-700">
                      Danh mục đang hoạt động
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving || uploadingImage}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={saving || uploadingImage || duplicateSlug}
                  className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-pink-200 border-t-white" />
                  )}

                  {editingCategory ? "Lưu thay đổi" : "Thêm danh mục"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {transferCategory && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Chuyển sản phẩm
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Chuyển toàn bộ sản phẩm sang danh mục khác.
                </p>
              </div>

              <button
                type="button"
                onClick={closeTransferModal}
                disabled={transferSaving}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Danh mục nguồn</p>

                <p className="mt-1 font-semibold text-gray-900">
                  {transferCategory.name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {countProductsByCategory(products, transferCategory.slug)} sản
                  phẩm
                </p>
              </div>

              <div className="my-5 flex justify-center text-gray-300">
                <FiArrowRight size={24} />
              </div>

              <label
                htmlFor="transfer-target"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Danh mục đích
              </label>

              <select
                id="transfer-target"
                value={targetCategoryId}
                onChange={(event) => setTargetCategoryId(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              >
                {getTransferTargets(transferCategory.id).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeTransferModal}
                  disabled={transferSaving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleTransfer}
                  disabled={transferSaving || !targetCategoryId}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {transferSaving && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-white" />
                  )}
                  Chuyển sản phẩm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteCategory && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Xóa danh mục
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Kiểm tra sản phẩm trước khi xóa.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={transferSaving}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {deleteCategory.productCount > 0 ? (
                <>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <FiAlertTriangle
                        className="mt-0.5 shrink-0 text-amber-600"
                        size={19}
                      />

                      <div>
                        <p className="font-semibold text-amber-800">
                          Không thể xóa trực tiếp
                        </p>

                        <p className="mt-1 text-sm leading-6 text-amber-700">
                          Danh mục <strong>{deleteCategory.name}</strong> đang
                          có <strong>{deleteCategory.productCount}</strong> sản
                          phẩm.
                        </p>

                        <p className="mt-1 text-sm leading-6 text-amber-700">
                          Hãy chuyển toàn bộ sản phẩm sang danh mục khác trước
                          khi xóa.
                        </p>
                      </div>
                    </div>
                  </div>

                  <label
                    htmlFor="delete-target"
                    className="mb-2 mt-5 block text-sm font-semibold text-gray-700"
                  >
                    Chuyển sản phẩm sang
                  </label>

                  <select
                    id="delete-target"
                    value={targetCategoryId}
                    onChange={(event) =>
                      setTargetCategoryId(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  >
                    {getTransferTargets(deleteCategory.id).map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm leading-6 text-red-700">
                    Bạn có chắc muốn xóa danh mục{" "}
                    <strong>{deleteCategory.name}</strong>?
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={transferSaving}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={
                    transferSaving ||
                    (deleteCategory.productCount > 0 && !targetCategoryId)
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {transferSaving && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-white" />
                  )}

                  {deleteCategory.productCount > 0
                    ? "Chuyển sản phẩm và xóa"
                    : "Xóa danh mục"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminCategoriesPage;
