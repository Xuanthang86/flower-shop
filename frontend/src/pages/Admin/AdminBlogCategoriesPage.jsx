import { useEffect, useMemo, useState } from "react";

import { FiEdit2, FiPlus, FiSave, FiTrash2, FiX } from "react-icons/fi";

import {
  getPageTitle,
  readSiteSettings,
  saveSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

import { useNotification } from "@/context/NotificationProvider";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const createId = () =>
  `blog-category-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const slugify = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const EMPTY_FORM = {
  id: "",
  name: "",
  slug: "",
  description: "",
  image: "",
  active: true,
  sortOrder: 1,
  seoTitle: "",
  seoDescription: "",
};

const AdminBlogCategoriesPage = () => {
  useEffect(() => {
    const updateTitle = () => {
      document.title = getPageTitle(readSiteSettings(), "Danh mục bài viết");
    };

    updateTitle();

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, updateTitle);

    window.addEventListener("storage", updateTitle);

    return () => {
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, updateTitle);

      window.removeEventListener("storage", updateTitle);
    };
  }, []);
  const [settings, setSettings] = useState(() => readSiteSettings());

  const [editing, setEditing] = useState(null);

  const [editorOpen, setEditorOpen] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  const { notifySuccess, notifyError } = useNotification();

  useEffect(() => {
    const refresh = () => setSettings(readSiteSettings());

    window.addEventListener("flower-shop-site-settings-updated", refresh);

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("flower-shop-site-settings-updated", refresh);

      window.removeEventListener("storage", refresh);
    };
  }, []);

  const categories = useMemo(
    () =>
      Array.isArray(settings.blogCategories) ? settings.blogCategories : [],
    [settings.blogCategories]
  );

  const posts = Array.isArray(settings.blogPosts) ? settings.blogPosts : [];

  const openCreate = () => {
    setEditing(null);

    setForm({
      ...EMPTY_FORM,
      sortOrder: categories.length + 1,
    });

    setEditorOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);

    setForm({
      ...EMPTY_FORM,
      ...category,
    });

    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const saveCategory = () => {
    const name = form.name.trim();

    if (!name) {
      notifyError("Vui lòng nhập tên danh mục.");

      return;
    }

    const slug = form.slug.trim() || slugify(name);

    if (!slug) {
      notifyError("Không thể tạo slug danh mục.");

      return;
    }

    const duplicate = categories.find(
      (item) => item.slug === slug && String(item.id) !== String(form.id)
    );

    if (duplicate) {
      notifyError("Slug danh mục đã tồn tại.");

      return;
    }

    const now = new Date().toISOString();

    const category = {
      ...form,

      id: form.id || createId(),

      name,

      slug,

      description: form.description.trim(),

      image: form.image.trim(),

      active: form.active !== false,

      sortOrder: Number(form.sortOrder) || 1,

      seoTitle: form.seoTitle.trim(),

      seoDescription: form.seoDescription.trim(),

      updatedAt: now,

      createdAt: form.createdAt || now,
    };

    const nextCategories = editing
      ? categories.map((item) =>
          String(item.id) === String(form.id) ? category : item
        )
      : [...categories, category];

    try {
      const saved = saveSiteSettings({
        ...settings,
        blogCategories: nextCategories,
      });

      setSettings(saved);

      notifySuccess(editing ? "Đã cập nhật danh mục." : "Đã thêm danh mục.");

      closeEditor();
    } catch (error) {
      notifyError(error?.message || "Không thể lưu danh mục.");
    }
  };

  const deleteCategory = (category) => {
    const used = posts.some(
      (post) =>
        String(post.categoryId || "") === String(category.id) ||
        String(post.categorySlug || "") === category.slug
    );

    if (used) {
      notifyError("Không thể xóa danh mục đang có bài viết sử dụng.");

      return;
    }

    if (!window.confirm(`Xóa danh mục "${category.name}"?`)) {
      return;
    }

    try {
      const saved = saveSiteSettings({
        ...settings,

        blogCategories: categories.filter(
          (item) => String(item.id) !== String(category.id)
        ),
      });

      setSettings(saved);

      notifySuccess("Đã xóa danh mục.");
    } catch (error) {
      notifyError(error?.message || "Không thể xóa danh mục.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Danh mục Bài viết
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Quản lý danh mục bài viết.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
          >
            <FiPlus />
            Thêm danh mục
          </button>
        </header>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Tên
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Slug
                  </th>

                  <th className="px-5 py-4 text-center text-sm font-semibold">
                    Bài viết
                  </th>

                  <th className="px-5 py-4 text-center text-sm font-semibold">
                    Active
                  </th>

                  <th className="px-5 py-4 text-center text-sm font-semibold">
                    Thứ tự
                  </th>

                  <th className="px-5 py-4 text-right text-sm font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => {
                  const count = posts.filter(
                    (post) =>
                      String(post.categoryId || "") === String(category.id) ||
                      String(post.categorySlug || "") === category.slug
                  ).length;

                  return (
                    <tr key={category.id}>
                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {category.name}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {category.slug}
                      </td>

                      <td className="px-5 py-4 text-center">{count}</td>

                      <td className="px-5 py-4 text-center">
                        {category.active !== false ? (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                            Có
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                            Không
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {category.sortOrder}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(category)}
                            className="rounded-lg border border-blue-100 px-3 py-2 text-blue-600 hover:bg-blue-50"
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteCategory(category)}
                            className="rounded-lg border border-red-100 px-3 py-2 text-red-600 hover:bg-red-50"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {categories.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-gray-500"
                    >
                      Chưa có danh mục bài viết.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editing ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
              </h2>

              <button
                type="button"
                onClick={closeEditor}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                    slug: current.slug || slugify(event.target.value),
                  }))
                }
                placeholder="Tên danh mục"
                className={inputClass}
              />

              <input
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    slug: slugify(event.target.value),
                  }))
                }
                placeholder="Slug"
                className={inputClass}
              />

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Mô tả"
                rows={4}
                className={inputClass}
              />

              <input
                value={form.image}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    image: event.target.value,
                  }))
                }
                placeholder="URL hình ảnh"
                className={inputClass}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="number"
                  min="1"
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sortOrder: event.target.value,
                    }))
                  }
                  placeholder="Thứ tự"
                  className={inputClass}
                />

                <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.active !== false}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        active: event.target.checked,
                      }))
                    }
                  />

                  <span className="text-sm font-semibold">Đang hoạt động</span>
                </label>
              </div>

              <input
                value={form.seoTitle}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    seoTitle: event.target.value,
                  }))
                }
                placeholder="SEO Title"
                className={inputClass}
              />

              <textarea
                value={form.seoDescription}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    seoDescription: event.target.value,
                  }))
                }
                placeholder="SEO Description"
                rows={3}
                className={inputClass}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-xl border border-gray-200 px-5 py-3 font-semibold"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={saveCategory}
                className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white"
              >
                <FiSave />
                Lưu danh mục
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminBlogCategoriesPage;
