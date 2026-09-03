/*
============================================================
FLOWER SHOP — ADMIN APPEARANCE / CONTENT
============================================================

QUẢN LÝ:
1. Giao diện
2. Banner Hero nhiều banner
3. Announcement
4. Nội dung trang chủ
5. Footer
6. Contact
7. Blog
============================================================
*/

import { useEffect, useState } from "react";

import {
  FiEdit2,
  FiPlus,
  FiRotateCcw,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { useTheme } from "@/context/ThemeProvider";

import {
  readSiteSettings,
  saveSiteSettings,
  resetSiteSettings,
} from "@/services/siteSettings";

const FONT_OPTIONS = [
  {
    value:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    label: "Inter / System UI",
  },
  {
    value: "Arial, Helvetica, sans-serif",
    label: "Arial",
  },
  {
    value: "Georgia, serif",
    label: "Georgia",
  },
  {
    value: "Verdana, sans-serif",
    label: "Verdana",
  },
];

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const fileInputClass =
  "block w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-pink-600 file:px-4 file:py-2 file:text-white hover:border-pink-400";

const isHex = (value) => /^#[0-9A-Fa-f]{6}$/.test(String(value || ""));

const readImage = (file, callback, setError) => {
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    setError("Vui lòng chọn đúng file hình ảnh.");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    setError("Hình ảnh không được vượt quá 2MB.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    callback(String(reader.result || ""));
  };

  reader.onerror = () => {
    setError("Không thể đọc hình ảnh.");
  };

  reader.readAsDataURL(file);
};

const createBannerId = () =>
  `banner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createPostId = () =>
  `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const AdminAppearancePage = () => {
  const { theme, updateTheme, resetTheme } = useTheme();

  const [settings, setSettings] = useState(() => readSiteSettings());

  const [draftTheme, setDraftTheme] = useState(theme);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [bannerEditorOpen, setBannerEditorOpen] = useState(false);

  const [editingBanner, setEditingBanner] = useState(null);

  const [bannerForm, setBannerForm] = useState({
    image: "",
    alt: "",
  });

  const [postEditorOpen, setPostEditorOpen] = useState(false);

  const [editingPost, setEditingPost] = useState(null);

  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    date: "",
    image: "",
  });

  useEffect(() => {
    setDraftTheme(theme);
  }, [theme]);

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const updateSettings = (updater) => {
    setSettings((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;

      return next;
    });

    clearMessages();
  };

  const updateHeroLegacy = (field, value) => {
    updateSettings((current) => ({
      ...current,
      hero: {
        ...current.hero,
        [field]: value,
      },
    }));
  };

  const updateSections = (field, value) => {
    updateSettings((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [field]: value,
      },
    }));
  };

  const updateContact = (field, value) => {
    updateSettings((current) => ({
      ...current,
      contact: {
        ...current.contact,
        [field]: value,
      },
    }));
  };

  const updateFooter = (value) => {
    updateSettings((current) => ({
      ...current,
      footer: {
        ...current.footer,
        copyright: value,
      },
    }));
  };

  const updateAnnouncement = (index, value) => {
    updateSettings((current) => {
      const messages = [...(current.announcementMessages || [])];

      messages[index] = value;

      return {
        ...current,
        announcementMessages: messages,
      };
    });
  };

  const addAnnouncement = () => {
    updateSettings((current) => ({
      ...current,
      announcementMessages: [...(current.announcementMessages || []), ""],
    }));
  };

  const removeAnnouncement = (index) => {
    updateSettings((current) => ({
      ...current,
      announcementMessages: (current.announcementMessages || []).filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  };

  const openCreateBanner = () => {
    clearMessages();

    setEditingBanner(null);

    setBannerForm({
      image: "",
      alt: "",
    });

    setBannerEditorOpen(true);
  };

  const openEditBanner = (banner) => {
    clearMessages();

    setEditingBanner(banner);

    setBannerForm({
      image: banner.image || "",
      alt: banner.alt || "",
    });

    setBannerEditorOpen(true);
  };

  const closeBannerEditor = () => {
    setBannerEditorOpen(false);

    setEditingBanner(null);

    setBannerForm({
      image: "",
      alt: "",
    });
  };

  const saveBanner = () => {
    if (!bannerForm.image) {
      setError("Vui lòng chọn hình ảnh banner.");
      return;
    }

    const banner = {
      id: editingBanner?.id || createBannerId(),

      image: bannerForm.image,

      alt: bannerForm.alt.trim() || "Flower Shop",
    };

    updateSettings((current) => {
      const banners = Array.isArray(current.hero?.banners)
        ? current.hero.banners
        : [];

      const nextBanners = editingBanner
        ? banners.map((item) =>
            String(item.id) === String(editingBanner.id) ? banner : item
          )
        : [...banners, banner];

      return {
        ...current,
        hero: {
          ...current.hero,
          banners: nextBanners,

          /*
          Đồng bộ banner đầu tiên
          với field cũ.
          */
          bannerImage: nextBanners[0]?.image || "",
        },
      };
    });

    closeBannerEditor();

    setMessage(editingBanner ? "Đã cập nhật banner." : "Đã thêm banner.");
  };

  const deleteBanner = (banner) => {
    if (!window.confirm(`Bạn có chắc muốn xóa banner này?`)) {
      return;
    }

    updateSettings((current) => {
      const banners = (current.hero?.banners || []).filter(
        (item) => String(item.id) !== String(banner.id)
      );

      return {
        ...current,
        hero: {
          ...current.hero,
          banners,
          bannerImage: banners[0]?.image || "",
        },
      };
    });

    setMessage("Đã xóa banner.");
  };

  const openCreatePost = () => {
    clearMessages();

    setEditingPost(null);

    setPostForm({
      title: "",
      content: "",
      date: new Date().toISOString().slice(0, 10),
      image: "",
    });

    /*
    QUAN TRỌNG:
    Đây là biến bị thiếu trong code cũ.
    */
    setPostEditorOpen(true);
  };

  const openEditPost = (post) => {
    clearMessages();

    setEditingPost(post);

    setPostForm({
      title: post.title || "",
      content: post.content || "",
      date: post.date || "",
      image: post.image || "",
    });

    setPostEditorOpen(true);
  };

  const closePostEditor = () => {
    setPostEditorOpen(false);

    setEditingPost(null);

    setPostForm({
      title: "",
      content: "",
      date: "",
      image: "",
    });
  };

  const savePost = () => {
    if (!postForm.title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết.");
      return;
    }

    if (!postForm.content.trim()) {
      setError("Vui lòng nhập nội dung bài viết.");
      return;
    }

    const post = {
      id: editingPost?.id || createPostId(),

      title: postForm.title.trim(),

      content: postForm.content.trim(),

      date: postForm.date,

      image: postForm.image || "",
    };

    updateSettings((current) => {
      const currentPosts = Array.isArray(current.blogPosts)
        ? current.blogPosts
        : [];

      const posts = editingPost
        ? currentPosts.map((item) =>
            String(item.id) === String(editingPost.id) ? post : item
          )
        : [...currentPosts, post];

      return {
        ...current,
        blogPosts: posts,
      };
    });

    /*
    Lưu ngay để BlogPage cập nhật
    ngay lập tức, không phụ thuộc
    nút "Lưu toàn bộ".
    */
    const current = readSiteSettings();

    const currentPosts = Array.isArray(current.blogPosts)
      ? current.blogPosts
      : [];

    const savedPosts = editingPost
      ? currentPosts.map((item) =>
          String(item.id) === String(editingPost.id) ? post : item
        )
      : [...currentPosts, post];

    saveSiteSettings({
      ...current,
      blogPosts: savedPosts,
    });

    closePostEditor();

    setMessage(editingPost ? "Đã cập nhật bài viết." : "Đã thêm bài viết.");
  };

  const deletePost = (post) => {
    if (!window.confirm(`Bạn có chắc muốn xóa "${post.title}"?`)) {
      return;
    }

    const posts = (settings.blogPosts || []).filter(
      (item) => String(item.id) !== String(post.id)
    );

    updateSettings((current) => ({
      ...current,
      blogPosts: posts,
    }));

    saveSiteSettings({
      ...settings,
      blogPosts: posts,
    });

    setMessage("Đã xóa bài viết.");
  };

  const handleSaveAll = () => {
    clearMessages();

    if (
      !isHex(draftTheme.primaryColor) ||
      !isHex(draftTheme.secondaryColor) ||
      !isHex(draftTheme.textColor)
    ) {
      setError("Mã màu phải có dạng #RRGGBB.");
      return;
    }

    const baseFontSize = Number(draftTheme.baseFontSize);

    const headerFontSize = Number(draftTheme.headerFontSize);

    const borderRadius = Number(draftTheme.borderRadius);

    if (baseFontSize < 12 || baseFontSize > 24) {
      setError("Cỡ chữ cơ bản phải từ 12px đến 24px.");
      return;
    }

    if (headerFontSize < 12 || headerFontSize > 24) {
      setError("Cỡ chữ Header phải từ 12px đến 24px.");
      return;
    }

    if (borderRadius < 0 || borderRadius > 32) {
      setError("Bo góc phải từ 0px đến 32px.");
      return;
    }

    updateTheme({
      primaryColor: draftTheme.primaryColor,

      secondaryColor: draftTheme.secondaryColor,

      textColor: draftTheme.textColor,

      fontFamily: draftTheme.fontFamily,

      baseFontSize,

      headerFontSize,

      borderRadius,
    });

    try {
      const normalized = saveSiteSettings(settings);

      setSettings(normalized);

      setMessage("Đã lưu toàn bộ giao diện và nội dung website.");
    } catch (saveError) {
      console.error(saveError);

      setError("Không thể lưu nội dung website.");
    }
  };

  const handleReset = () => {
    resetTheme();

    const restored = resetSiteSettings();

    setSettings(restored);

    setDraftTheme({
      ...theme,
      primaryColor: "#db2777",
      secondaryColor: "#fce7f3",
      textColor: "#1f2937",
      baseFontSize: 16,
      headerFontSize: 15,
      borderRadius: 12,
    });

    closeBannerEditor();

    closePostEditor();

    setMessage("Đã khôi phục toàn bộ cấu hình mặc định.");

    setError("");
  };

  const banners = Array.isArray(settings.hero?.banners)
    ? settings.hero.banners
    : [];

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tùy chỉnh giao diện
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Quản trị viên có thể thay đổi giao diện và nội dung website mà không
            cần chỉnh sửa mã nguồn.
          </p>
        </div>

        {(message || error) && (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="space-y-6">
          {/* GIAO DIỆN */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              1. Giao diện cơ bản
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {[
                ["primaryColor", "Màu chủ đạo", "#DB2777"],
                ["secondaryColor", "Màu phụ", "#FCE7F3"],
                ["textColor", "Màu chữ", "#1F2937"],
              ].map(([field, label, fallback]) => (
                <div key={field}>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {label}
                  </label>

                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={
                        isHex(draftTheme[field]) ? draftTheme[field] : fallback
                      }
                      onChange={(event) =>
                        setDraftTheme((current) => ({
                          ...current,
                          [field]: event.target.value,
                        }))
                      }
                      className="h-12 w-14 cursor-pointer rounded-lg border p-1"
                    />

                    <input
                      type="text"
                      value={draftTheme[field] || ""}
                      onChange={(event) =>
                        setDraftTheme((current) => ({
                          ...current,
                          [field]: event.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Font chữ
                </label>

                <select
                  value={draftTheme.fontFamily}
                  onChange={(event) =>
                    setDraftTheme((current) => ({
                      ...current,
                      fontFamily: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Cỡ chữ cơ bản: {draftTheme.baseFontSize}
                  px
                </label>

                <input
                  type="range"
                  min="12"
                  max="24"
                  value={draftTheme.baseFontSize}
                  onChange={(event) =>
                    setDraftTheme((current) => ({
                      ...current,
                      baseFontSize: Number(event.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Cỡ chữ Header: {draftTheme.headerFontSize}
                  px
                </label>

                <input
                  type="range"
                  min="12"
                  max="24"
                  value={draftTheme.headerFontSize}
                  onChange={(event) =>
                    setDraftTheme((current) => ({
                      ...current,
                      headerFontSize: Number(event.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Bo góc: {draftTheme.borderRadius}
                  px
                </label>

                <input
                  type="range"
                  min="0"
                  max="32"
                  value={draftTheme.borderRadius}
                  onChange={(event) =>
                    setDraftTheme((current) => ({
                      ...current,
                      borderRadius: Number(event.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>
            </div>
          </section>

          {/* BANNER */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">2. Banner trang chủ</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Có thể thêm nhiều banner. Website sẽ tự động trình chiếu.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateBanner}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 font-semibold text-white hover:bg-pink-700"
              >
                <FiPlus />
                Thêm banner
              </button>
            </div>

            {bannerEditorOpen && (
              <div className="mt-5 rounded-xl border border-pink-100 bg-pink-50 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">
                    {editingBanner ? "Chỉnh sửa banner" : "Thêm banner mới"}
                  </h3>

                  <button
                    type="button"
                    onClick={closeBannerEditor}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <input
                    className={inputClass}
                    value={bannerForm.alt}
                    onChange={(event) =>
                      setBannerForm((current) => ({
                        ...current,
                        alt: event.target.value,
                      }))
                    }
                    placeholder="Tên/mô tả banner"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    className={fileInputClass}
                    onChange={(event) =>
                      readImage(
                        event.target.files?.[0],
                        (image) =>
                          setBannerForm((current) => ({
                            ...current,
                            image,
                          })),
                        setError
                      )
                    }
                  />

                  {bannerForm.image && (
                    <div className="flex h-52 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-3">
                      <img
                        src={bannerForm.image}
                        alt="Xem trước banner"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={saveBanner}
                      className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 font-semibold text-white hover:bg-pink-700"
                    >
                      <FiSave />
                      {editingBanner ? "Lưu thay đổi" : "Thêm banner"}
                    </button>

                    <button
                      type="button"
                      onClick={closeBannerEditor}
                      className="rounded-lg border border-gray-200 px-5 py-2.5 font-medium text-gray-700 hover:bg-white"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <div className="aspect-[16/7] bg-gray-50">
                    <img
                      src={banner.image}
                      alt={banner.alt || `Banner ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <p className="mb-3 text-sm font-medium text-gray-700">
                      Banner {index + 1}
                    </p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditBanner(banner)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm hover:border-pink-300 hover:text-pink-600"
                      >
                        <FiEdit2 />
                        Sửa
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteBanner(banner)}
                        className="flex h-9 w-10 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ANNOUNCEMENT */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">3. Thanh thông báo</h2>

              <button
                type="button"
                onClick={addAnnouncement}
                className="inline-flex items-center gap-2 rounded-lg border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-600 hover:bg-pink-50"
              >
                <FiPlus />
                Thêm thông báo
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {(settings.announcementMessages || []).map(
                (announcement, index) => (
                  <div key={`announcement-${index}`} className="flex gap-2">
                    <input
                      value={announcement}
                      onChange={(event) =>
                        updateAnnouncement(index, event.target.value)
                      }
                      className={inputClass}
                    />

                    <button
                      type="button"
                      onClick={() => removeAnnouncement(index)}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )
              )}
            </div>
          </section>

          {/* HOME */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">4. Nội dung trang chủ</h2>

            <div className="mt-5 grid gap-4">
              <input
                className={inputClass}
                value={settings.sections?.categoriesTitle || ""}
                onChange={(event) =>
                  updateSections("categoriesTitle", event.target.value)
                }
                placeholder="Tiêu đề danh mục"
              />

              <input
                className={inputClass}
                value={settings.sections?.categoriesSubtitle || ""}
                onChange={(event) =>
                  updateSections("categoriesSubtitle", event.target.value)
                }
                placeholder="Mô tả danh mục"
              />

              <input
                className={inputClass}
                value={settings.sections?.featuredTitle || ""}
                onChange={(event) =>
                  updateSections("featuredTitle", event.target.value)
                }
                placeholder="Tiêu đề sản phẩm"
              />

              <input
                className={inputClass}
                value={settings.sections?.featuredSubtitle || ""}
                onChange={(event) =>
                  updateSections("featuredSubtitle", event.target.value)
                }
                placeholder="Mô tả sản phẩm"
              />

              <input
                className={inputClass}
                value={settings.sections?.customerTitle || ""}
                onChange={(event) =>
                  updateSections("customerTitle", event.target.value)
                }
                placeholder="Khách hàng tiêu biểu"
              />
            </div>
          </section>

          {/* FOOTER */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">5. Footer</h2>

            <textarea
              rows="2"
              className={`${inputClass} mt-4`}
              value={settings.footer?.copyright || ""}
              onChange={(event) => updateFooter(event.target.value)}
            />
          </section>

          {/* CONTACT */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">6. Liên hệ</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ["title", "Tiêu đề"],
                ["phone", "Điện thoại"],
                ["email", "Email"],
                ["address", "Địa chỉ"],
                ["workingHours", "Thời gian làm việc"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {label}
                  </label>

                  <input
                    className={inputClass}
                    value={settings.contact?.[field] || ""}
                    onChange={(event) =>
                      updateContact(field, event.target.value)
                    }
                  />
                </div>
              ))}

              <textarea
                rows="3"
                className={inputClass}
                value={settings.contact?.description || ""}
                onChange={(event) =>
                  updateContact("description", event.target.value)
                }
                placeholder="Mô tả liên hệ"
              />
            </div>
          </section>

          {/* BLOG */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">7. Bài viết</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Thêm, sửa và xóa bài viết.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreatePost}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
              >
                <FiPlus />
                Thêm bài viết
              </button>
            </div>

            {/* FORM HIỂN THỊ BẰNG STATE RIÊNG */}
            {postEditorOpen && (
              <div className="mt-5 rounded-xl border border-pink-100 bg-pink-50 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">
                    {editingPost ? "Chỉnh sửa bài viết" : "Thêm bài viết mới"}
                  </h3>

                  <button
                    type="button"
                    onClick={closePostEditor}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <input
                    className={inputClass}
                    value={postForm.title}
                    onChange={(event) =>
                      setPostForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Tiêu đề bài viết"
                  />

                  <input
                    type="date"
                    className={inputClass}
                    value={postForm.date}
                    onChange={(event) =>
                      setPostForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                  />

                  <textarea
                    rows="7"
                    className={inputClass}
                    value={postForm.content}
                    onChange={(event) =>
                      setPostForm((current) => ({
                        ...current,
                        content: event.target.value,
                      }))
                    }
                    placeholder="Nội dung bài viết"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    className={fileInputClass}
                    onChange={(event) =>
                      readImage(
                        event.target.files?.[0],
                        (image) =>
                          setPostForm((current) => ({
                            ...current,
                            image,
                          })),
                        setError
                      )
                    }
                  />

                  {postForm.image && (
                    <div className="flex h-48 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-3">
                      <img
                        src={postForm.image}
                        alt="Xem trước bài viết"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={savePost}
                      className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 font-semibold text-white hover:bg-pink-700"
                    >
                      <FiSave />

                      {editingPost ? "Lưu thay đổi" : "Thêm bài viết"}
                    </button>

                    <button
                      type="button"
                      onClick={closePostEditor}
                      className="rounded-lg border border-gray-200 px-5 py-2.5 text-gray-700 hover:bg-white"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-3">
              {(settings.blogPosts || []).map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800">{post.title}</p>

                    {post.date && (
                      <p className="mt-1 text-xs text-gray-400">{post.date}</p>
                    )}

                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openEditPost(post)}
                      className="rounded-lg border border-gray-200 p-2 text-blue-600 hover:bg-blue-50"
                      title="Sửa"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePost(post)}
                      className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"
                      title="Xóa"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}

              {settings.blogPosts?.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
                  Chưa có bài viết.
                </div>
              )}
            </div>
          </section>

          {/* SAVE */}
          <section className="sticky bottom-4 z-30 rounded-2xl border border-pink-100 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleSaveAll}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white hover:bg-pink-700"
              >
                <FiSave />
                Lưu toàn bộ thay đổi
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                <FiRotateCcw />
                Khôi phục mặc định
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default AdminAppearancePage;
