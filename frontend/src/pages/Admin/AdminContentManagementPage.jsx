import { useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  FiAlignCenter,
  FiAlignLeft,
  FiBold,
  FiImage,
  FiItalic,
  FiLink,
  FiList,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUnderline,
  FiX,
} from "react-icons/fi";

import {
  buildDefaultBlogShopInfoHtml,
  readSiteSettings,
  saveSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
  DEFAULT_BLOG_SHOP_INFO_HTML,
} from "@/services/siteSettings";

import { uploadImageFile } from "@/services/media";

import { useNotification } from "@/context/NotificationProvider";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const stripDefaultMarkerStyles = (html = "") => {
  const value = String(html || "");

  if (!value.trim()) {
    return "";
  }

  try {
    const parser = new DOMParser();

    const document = parser.parseFromString(
      `<div id="default-blog-editor-root">${value}</div>`,
      "text/html"
    );

    const root = document.getElementById("default-blog-editor-root");

    if (!root) {
      return value;
    }

    const defaultBlock = root.querySelector(
      '[data-flower-shop-default-info="true"]'
    );

    if (!defaultBlock) {
      return root.innerHTML.trim();
    }

    defaultBlock.setAttribute("data-flower-shop-default-info", "true");

    defaultBlock.querySelectorAll("[style]").forEach((element) => {
      element.removeAttribute("style");
    });

    return defaultBlock.outerHTML.trim();
  } catch {
    return value;
  }
};

const AdminContentManagementPage = () => {
  const [settings, setSettings] = useState(() => readSiteSettings());

  const [uploading, setUploading] = useState(false);

  const [confirmAnnouncement, setConfirmAnnouncement] = useState(null);

  const blogEditorRef = useRef(null);

  const { notifySuccess, notifyError } = useNotification();

  useLayoutEffect(() => {
    const editor = blogEditorRef.current;

    if (!editor || !editor.isConnected) {
      return;
    }

    const html =
      settings.blog?.defaultShopInfoHtml || DEFAULT_BLOG_SHOP_INFO_HTML;

    if (editor.innerHTML.trim() !== String(html).trim()) {
      editor.innerHTML = html;
    }
  }, []);

  useEffect(() => {
    const refresh = () => {
      setSettings(readSiteSettings());
    };

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);

      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const editor = blogEditorRef.current;

    if (!editor || !editor.isConnected) {
      return;
    }

    const html =
      settings.blog?.defaultShopInfoHtml || DEFAULT_BLOG_SHOP_INFO_HTML;

    editor.innerHTML = html;
  }, [settings.blog?.defaultShopInfoHtml]);

  const saveSettings = (nextSettings, successMessage) => {
    try {
      const saved = saveSiteSettings(nextSettings);

      setSettings(saved);

      notifySuccess(successMessage);

      return true;
    } catch (saveError) {
      notifyError(saveError?.message || "Không thể lưu dữ liệu.");

      return false;
    }
  };

  const updateBranding = (field, value) => {
    setSettings((current) => ({
      ...current,

      branding: {
        ...(current.branding || {}),
        [field]: value,
      },
    }));
  };

  const saveBranding = () => {
    saveSettings(settings, "Đã lưu thông tin Logo & thương hiệu.");
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setUploading(true);

    try {
      const logo = await uploadImageFile(file, {
        folder: "flower-shop/branding",
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.84,
      });

      const nextSettings = {
        ...settings,

        branding: {
          ...(settings.branding || {}),
          logoImage: logo,
        },
      };

      saveSettings(nextSettings, "Đã tải và lưu Logo.");
    } catch (uploadError) {
      notifyError(uploadError?.message || "Không thể tải Logo.");
    } finally {
      setUploading(false);
    }
  };

  const updateAnnouncement = (index, value) => {
    setSettings((current) => {
      const messages = [...(current.announcementMessages || [])];

      messages[index] = value;

      return {
        ...current,
        announcementMessages: messages,
      };
    });
  };

  const addAnnouncement = () => {
    setSettings((current) => ({
      ...current,

      announcementMessages: [...(current.announcementMessages || []), ""],
    }));
  };

  const askRemoveAnnouncement = (index) => {
    setConfirmAnnouncement({
      index,
      value: settings.announcementMessages?.[index] || "",
    });
  };

  const removeAnnouncement = () => {
    if (!confirmAnnouncement) {
      return;
    }

    const nextSettings = {
      ...settings,

      announcementMessages: (settings.announcementMessages || []).filter(
        (_, index) => index !== confirmAnnouncement.index
      ),
    };

    setConfirmAnnouncement(null);

    saveSettings(nextSettings, "Đã xóa thanh thông báo.");
  };

  const saveAnnouncements = () => {
    saveSettings(settings, "Đã lưu thanh thông báo.");
  };

  const updateSection = (field, value) => {
    setSettings((current) => ({
      ...current,

      sections: {
        ...(current.sections || {}),
        [field]: value,
      },
    }));
  };

  const saveHomepageContent = () => {
    saveSettings(settings, "Đã lưu nội dung trang chủ.");
  };

  const getBlogEditorHtml = () => {
    const editor = blogEditorRef.current;

    if (!editor || !editor.isConnected) {
      return DEFAULT_BLOG_SHOP_INFO_HTML;
    }

    return (
      stripDefaultMarkerStyles(editor.innerHTML || "") ||
      DEFAULT_BLOG_SHOP_INFO_HTML
    );
  };

  const executeBlogFormat = (command, value = null) => {
    const editor = blogEditorRef.current;

    if (!editor || !editor.isConnected) {
      return;
    }

    editor.focus();

    document.execCommand(command, false, value);
  };

  const createBlogLink = () => {
    const url = window.prompt("Nhập liên kết:");

    if (!url) {
      return;
    }

    executeBlogFormat("createLink", url);
  };

  const resetBlogEditor = () => {
    const editor = blogEditorRef.current;

    if (!editor) {
      return;
    }

    editor.innerHTML = DEFAULT_BLOG_SHOP_INFO_HTML;
    editor.focus();
  };

  const branding = settings.branding || {};

  const sections = settings.sections || {};

  const blog = settings.blog || {};

  const blogStyle = blog.defaultShopInfoStyle || {
    backgroundColor: "#fff7fb",
    borderColor: "#fce7f3",
    accentColor: "#db2777",
    headingColor: "#1f2937",
    textColor: "#4b5563",
    borderRadius: 14,
    padding: 14,
    headingFontSize: 19,
    subHeadingFontSize: 15,
    bodyFontSize: 14,
    lineHeight: 1.5,
  };

  const defaultShopInfo = buildDefaultBlogShopInfoHtml(settings);

  const announcementMessages = Array.isArray(settings.announcementMessages)
    ? settings.announcementMessages
    : [];

  const shipping = settings.shipping || {
    deliveryDateNextDayCutoffHour: 21,
  };

  return (
    <main className="min-h-screen bg-gray-50 py-5">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý nội dung website
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-500">
            Quản lý Logo, thương hiệu, thanh thông báo, nội dung trang chủ và
            nội dung mặc định cho bài viết.
          </p>
        </header>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-gray-900">
                Logo & thương hiệu
              </h2>

              <p className="text-sm text-gray-500">
                Thông tin này được dùng trực tiếp ở khu vực Logo của website.
              </p>
            </div>

            <div className="mt-5 grid gap-6 md:grid-cols-[180px_1fr]">
              <div className="flex items-center justify-center">
                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-pink-100 bg-gray-50 p-3 shadow-sm">
                  {branding.logoImage ? (
                    <img
                      src={branding.logoImage}
                      alt={
                        branding.logoAlt || branding.siteName || "Flower Shop"
                      }
                      className="h-28 w-28 rounded-full object-contain"
                    />
                  ) : (
                    <FiImage size={36} className="text-gray-300" />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Tên thương hiệu
                    </label>

                    <input
                      value={branding.siteName || ""}
                      onChange={(event) =>
                        updateBranding("siteName", event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Slogan
                    </label>

                    <input
                      value={branding.tagline || ""}
                      onChange={(event) =>
                        updateBranding("tagline", event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Alt Logo
                  </label>

                  <input
                    value={branding.logoAlt || ""}
                    onChange={(event) =>
                      updateBranding("logoAlt", event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <label
                    htmlFor="site-logo"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
                  >
                    <FiImage />

                    {uploading ? "Đang tải..." : "Chọn Logo"}
                  </label>

                  <input
                    id="site-logo"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading}
                    onChange={handleLogoUpload}
                  />

                  <button
                    type="button"
                    onClick={saveBranding}
                    className="inline-flex items-center gap-2 rounded-xl border border-pink-200 bg-white px-5 py-3 text-sm font-semibold text-pink-600 transition hover:bg-pink-50"
                  >
                    <FiSave />
                    Lưu Logo & thương hiệu
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Thanh thông báo
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Nội dung hiển thị ở thanh thông báo website.
                </p>
              </div>

              <button
                type="button"
                onClick={addAnnouncement}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
              >
                <FiPlus />
                Thêm
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {announcementMessages.map((item, index) => (
                <div key={`announcement-${index}`} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(event) =>
                      updateAnnouncement(index, event.target.value)
                    }
                    className={inputClass}
                    placeholder="Nội dung thông báo"
                  />

                  <button
                    type="button"
                    onClick={() => askRemoveAnnouncement(index)}
                    className="rounded-xl border border-red-100 px-4 text-red-600 transition hover:bg-red-50"
                    aria-label="Xóa thông báo"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={saveAnnouncements}
                className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-700"
              >
                <FiSave />
                Lưu thanh thông báo
              </button>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Nội dung trang chủ
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Chỉnh sửa nội dung chữ của các section trên trang chủ.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tiêu đề Danh mục
                </label>

                <input
                  value={sections.categoriesTitle || ""}
                  onChange={(event) =>
                    updateSection("categoriesTitle", event.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Mô tả Danh mục
                </label>

                <input
                  value={sections.categoriesSubtitle || ""}
                  onChange={(event) =>
                    updateSection("categoriesSubtitle", event.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tiêu đề Sản phẩm nổi bật
                </label>

                <input
                  value={sections.featuredTitle || ""}
                  onChange={(event) =>
                    updateSection("featuredTitle", event.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Mô tả Sản phẩm nổi bật
                </label>

                <input
                  value={sections.featuredSubtitle || ""}
                  onChange={(event) =>
                    updateSection("featuredSubtitle", event.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Tiêu đề Khách hàng tiêu biểu
                </label>

                <input
                  value={sections.customerTitle || ""}
                  onChange={(event) =>
                    updateSection("customerTitle", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={saveHomepageContent}
                className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-700"
              >
                <FiSave />
                Lưu nội dung trang chủ
              </button>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Cấu hình giao hàng
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Thiết lập thời điểm sau đó đơn hàng sẽ mặc định giao vào ngày kế
                tiếp.
              </p>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                    🕘
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Mốc chuyển sang ngày giao tiếp theo
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Khi khách đặt hàng từ mốc giờ này trở đi, hệ thống sẽ mặc
                      định ngày giao hàng là ngày hôm sau.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-pink-100 bg-white p-4">
                  <p className="text-sm text-gray-500">Cấu hình hiện tại</p>

                  <p className="mt-1 text-lg font-bold text-pink-600">
                    Từ{" "}
                    {String(
                      Number(shipping.deliveryDateNextDayCutoffHour ?? 21)
                    ).padStart(2, "0")}
                    :00
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Ví dụ: chọn 21:00 thì từ 21:00 trở đi đơn hàng sẽ mặc định
                    giao vào ngày hôm sau.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <label
                  htmlFor="deliveryDateNextDayCutoffHour"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Giờ áp dụng
                </label>

                <select
                  id="deliveryDateNextDayCutoffHour"
                  value={String(shipping.deliveryDateNextDayCutoffHour ?? 21)}
                  onChange={(event) => {
                    const value = Number(event.target.value);

                    setSettings((current) => ({
                      ...current,

                      shipping: {
                        ...(current.shipping || {}),

                        deliveryDateNextDayCutoffHour: Number.isFinite(value)
                          ? Math.min(23, Math.max(0, value))
                          : 21,
                      },
                    }));
                  }}
                  className={inputClass}
                >
                  {Array.from({ length: 24 }, (_, hour) => (
                    <option key={hour} value={hour}>
                      {String(hour).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  saveSettings(settings, "Đã lưu cấu hình giao hàng.")
                }
                className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-700"
              >
                <FiSave />
                Lưu cấu hình giao hàng
              </button>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Thông tin Shop mặc định trong bài viết
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Đây là nội dung được hiển thị tự động ở cuối mỗi bài viết. Nội
                dung được quản lý riêng, còn màu sắc, font chữ, khoảng cách và
                bo góc được quản lý tại Tùy chỉnh giao diện.
              </p>

              <p className="mt-2 rounded-xl bg-pink-50 p-3 text-xs leading-5 text-pink-700">
                Có thể sử dụng các biến:
                <strong className="ml-1">
                  {
                    "{{siteName}} {{tagline}} {{address}} {{phone}} {{email}} {{workingHours}}"
                  }
                </strong>
                . Hệ thống sẽ tự thay bằng thông tin hiện tại của Shop.
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50 p-2">
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    executeBlogFormat("bold");
                  }}
                  className="rounded-lg p-2.5 hover:bg-white"
                  title="In đậm"
                  aria-label="In đậm"
                >
                  <FiBold />
                </button>

                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    executeBlogFormat("italic");
                  }}
                  className="rounded-lg p-2.5 hover:bg-white"
                  title="In nghiêng"
                  aria-label="In nghiêng"
                >
                  <FiItalic />
                </button>

                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    executeBlogFormat("underline");
                  }}
                  className="rounded-lg p-2.5 hover:bg-white"
                  title="Gạch chân"
                  aria-label="Gạch chân"
                >
                  <FiUnderline />
                </button>

                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    executeBlogFormat("justifyLeft");
                  }}
                  className="rounded-lg p-2.5 hover:bg-white"
                  title="Căn trái"
                  aria-label="Căn trái"
                >
                  <FiAlignLeft />
                </button>

                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    executeBlogFormat("justifyCenter");
                  }}
                  className="rounded-lg p-2.5 hover:bg-white"
                  title="Căn giữa"
                  aria-label="Căn giữa"
                >
                  <FiAlignCenter />
                </button>

                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    executeBlogFormat("insertUnorderedList");
                  }}
                  className="rounded-lg p-2.5 hover:bg-white"
                  title="Danh sách"
                  aria-label="Danh sách"
                >
                  <FiList />
                </button>

                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    createBlogLink();
                  }}
                  className="rounded-lg p-2.5 hover:bg-white"
                  title="Chèn liên kết"
                  aria-label="Chèn liên kết"
                >
                  <FiLink />
                </button>

                <select
                  defaultValue=""
                  onChange={(event) =>
                    executeBlogFormat("formatBlock", event.target.value)
                  }
                  className="rounded-lg border-0 bg-transparent px-2 text-sm outline-none"
                  aria-label="Định dạng nội dung"
                >
                  <option value="">Đoạn văn</option>

                  <option value="h2">Tiêu đề H2</option>

                  <option value="h3">Tiêu đề H3</option>

                  <option value="p">Đoạn văn</option>
                </select>

                <button
                  type="button"
                  onClick={resetBlogEditor}
                  className="ml-auto rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-white"
                >
                  Khôi phục nội dung mặc định
                </button>
              </div>

              <style>
                {`
                  .admin-default-blog-editor {
                    color: #374151;
                    font-size: 14px;
                    line-height: 1.5;
                    overflow-x: hidden;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    white-space: normal;
                  }

                  .admin-default-blog-editor
                    > *:first-child {
                    margin-top: 0 !important;
                  }

                  .admin-default-blog-editor
                    > *:last-child {
                    margin-bottom: 0 !important;
                  }

                  .admin-default-blog-editor p {
                    margin: .35rem 0 !important;
                    line-height: 1.5 !important;
                  }

                  .admin-default-blog-editor h2 {
                    margin: .65rem 0 .3rem !important;
                    font-size: 19px !important;
                    line-height: 1.25 !important;
                    font-weight: 700 !important;
                  }

                  .admin-default-blog-editor h3 {
                    margin: .55rem 0 .25rem !important;
                    font-size: 15px !important;
                    line-height: 1.3 !important;
                    font-weight: 700 !important;
                  }

                  .admin-default-blog-editor section {
                    margin: .45rem 0 !important;
                    padding: .45rem .6rem !important;
                    border: 1px solid #f3f4f6;
                    border-radius: .65rem;
                    background: rgba(255,255,255,.72);
                  }

                  .admin-default-blog-editor
                    > section {
                    margin: 0 !important;
                    padding: 0 !important;
                    border: 0;
                    background: transparent;
                  }

                  .admin-default-blog-editor ul,
                  .admin-default-blog-editor ol {
                    margin: .35rem 0 .5rem !important;
                    padding-left: 1.25rem;
                  }

                  .admin-default-blog-editor li {
                    margin: 0 0 .1rem !important;
                  }

                  .admin-default-blog-editor a {
                    color: #db2777;
                    font-weight: 600;
                    overflow-wrap: anywhere;
                  }

                  .admin-default-blog-editor strong {
                    font-weight: 700;
                  }
                `}
              </style>

              <div
                ref={blogEditorRef}
                contentEditable
                suppressContentEditableWarning
                role="textbox"
                aria-label="Nội dung Shop mặc định trong bài viết"
                className="admin-default-blog-editor min-h-[360px] w-full overflow-x-hidden p-5 outline-none"
                spellCheck
              />
            </div>

            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const editorHtml = getBlogEditorHtml();

                  saveSettings(
                    {
                      ...settings,
                      blog: {
                        ...(settings.blog || {}),
                        defaultShopInfoHtml: editorHtml,
                      },
                    },
                    "Đã lưu thông tin Shop mặc định cho bài viết."
                  );
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-700"
              >
                <FiSave />
                Lưu thông tin Shop cho bài viết
              </button>
            </div>

            <div
              className="mt-5 overflow-hidden rounded-xl border bg-white"
              style={{
                borderColor: blogStyle.borderColor,
              }}
            >
              <div
                className="blog-default-shop-preview p-4"
                style={{
                  backgroundColor: blogStyle.backgroundColor,
                  color: blogStyle.textColor,
                  fontSize: `${blogStyle.bodyFontSize}px`,
                  lineHeight: blogStyle.lineHeight,
                }}
              >
                <style>
                  {`
                    .blog-default-shop-preview {
                      overflow-wrap: anywhere;
                      word-break: break-word;
                    }

                    .blog-default-shop-preview
                      [data-flower-shop-default-info="true"] {
                      width: 100%;
                      max-width: 100%;
                    }

                    .blog-default-shop-preview p {
                      margin: .3rem 0 !important;
                    }

                    .blog-default-shop-preview h2 {
                      margin: .55rem 0 .25rem !important;
                      font-size: ${blogStyle.headingFontSize}px !important;
                      line-height: 1.25 !important;
                    }

                    .blog-default-shop-preview h3 {
                      margin: .45rem 0 .2rem !important;
                      font-size: ${blogStyle.subHeadingFontSize}px !important;
                      line-height: 1.3 !important;
                    }

                    .blog-default-shop-preview section {
                      margin: .4rem 0 !important;
                      padding: .45rem .6rem !important;
                      border: 1px solid #f3f4f6;
                      border-radius: .6rem;
                    }

                    .blog-default-shop-preview
                      > [data-flower-shop-default-info="true"] {
                      margin: 0 !important;
                      padding: 0 !important;
                      border: 0 !important;
                      background: transparent !important;
                    }

                    .blog-default-shop-preview
                      a {
                      color: ${blogStyle.accentColor};
                      font-weight: 600;
                      overflow-wrap: anywhere;
                    }
                  `}
                </style>

                <div
                  dangerouslySetInnerHTML={{
                    __html: defaultShopInfo,
                  }}
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      {confirmAnnouncement && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-announcement-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="delete-announcement-title"
                  className="text-lg font-bold text-gray-900"
                >
                  Xác nhận xóa thông báo
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Bạn có chắc chắn muốn xóa thanh thông báo này không?
                </p>

                {confirmAnnouncement.value && (
                  <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                    {confirmAnnouncement.value}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setConfirmAnnouncement(null)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
                aria-label="Đóng"
              >
                <FiX />
              </button>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmAnnouncement(null)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={removeAnnouncement}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Xóa thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminContentManagementPage;
