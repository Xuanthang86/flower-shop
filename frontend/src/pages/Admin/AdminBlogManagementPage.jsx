import { useEffect, useRef, useState } from "react";

import {
  FiAlignCenter,
  FiAlignJustify,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiCheckCircle,
  FiImage,
  FiItalic,
  FiLink,
  FiList,
  FiSave,
  FiTrash2,
  FiUnderline,
  FiX,
} from "react-icons/fi";

import {
  readSiteSettings,
  saveSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

import { uploadImageFile } from "@/services/media";

import { useNotification } from "@/context/NotificationContext";

const DEFAULT_SHOP_INFO_HTML = `
<div
  data-flower-shop-default-info="true"
  style="
    display:block;
    width:100%;
    max-width:100%;
    margin:28px 0 8px;
    padding:28px;
    border:1px solid #fce7f3;
    border-radius:20px;
    background:linear-gradient(135deg,#fff7fb 0%,#ffffff 55%,#fffafc 100%);
    box-sizing:border-box;
  "
>
  <div
    style="
      display:block;
      width:100%;
      margin:0 0 20px;
      padding:0 0 18px;
      border-bottom:1px solid #fbcfe8;
      box-sizing:border-box;
    "
  >
    <p
      style="
        margin:0 0 7px;
        color:#db2777;
        font-size:12px;
        line-height:18px;
        font-weight:700;
        letter-spacing:0.08em;
        text-transform:uppercase;
      "
    >
      Thông tin Shop
    </p>

    <h2
      style="
        margin:0;
        color:#1f2937;
        font-size:26px;
        line-height:34px;
        font-weight:800;
      "
    >
      Về {{siteName}}
    </h2>

    <p
      style="
        margin:9px 0 0;
        color:#6b7280;
        font-size:14px;
        line-height:23px;
      "
    >
      Hoa tươi tinh tế cho những khoảnh khắc đáng nhớ.
    </p>
  </div>

  <p
    style="
      margin:0 0 18px;
      color:#4b5563;
      font-size:15px;
      line-height:27px;
    "
  >
    <strong style="color:#374151;">{{siteName}}</strong> là cửa hàng hoa tươi
    chuyên cung cấp những sản phẩm hoa được tuyển chọn và chăm sóc kỹ lưỡng,
    phù hợp cho sinh nhật, khai trương, cưới hỏi, chúc mừng, tri ân và nhiều
    dịp đặc biệt khác.
  </p>

  <p
    style="
      margin:0 0 22px;
      color:#4b5563;
      font-size:15px;
      line-height:27px;
    "
  >
    Chúng tôi hướng tới những sản phẩm hoa tươi chất lượng, cách trình bày tinh
    tế và trải nghiệm mua sắm thuận tiện, thân thiện cho khách hàng.
  </p>

  <div
    style="
      width:100%;
      margin:0 0 22px;
      padding:18px 20px;
      border-radius:15px;
      background:#ffffff;
      border:1px solid #f3f4f6;
      box-sizing:border-box;
    "
  >
    <h3
      style="
        margin:0 0 13px;
        color:#374151;
        font-size:16px;
        line-height:24px;
        font-weight:700;
      "
    >
      Thông tin liên hệ
    </h3>

    <p
      style="
        margin:0 0 8px;
        color:#6b7280;
        font-size:14px;
        line-height:23px;
      "
    >
      <strong style="color:#374151;">Địa chỉ:</strong>
      {{address}}
    </p>

    <p
      style="
        margin:0 0 8px;
        color:#6b7280;
        font-size:14px;
        line-height:23px;
      "
    >
      <strong style="color:#374151;">Điện thoại:</strong>
      <a
        href="tel:{{phone}}"
        style="color:#db2777;text-decoration:none;font-weight:600;"
      >
        {{phone}}
      </a>
    </p>

    <p
      style="
        margin:0 0 8px;
        color:#6b7280;
        font-size:14px;
        line-height:23px;
      "
    >
      <strong style="color:#374151;">Email:</strong>
      <a
        href="mailto:{{email}}"
        style="color:#db2777;text-decoration:none;font-weight:600;"
      >
        {{email}}
      </a>
    </p>

    <p
      style="
        margin:0;
        color:#6b7280;
        font-size:14px;
        line-height:23px;
      "
    >
      <strong style="color:#374151;">Thời gian làm việc:</strong>
      {{workingHours}}
    </p>
  </div>

  <div
    style="
      display:block;
      width:100%;
      box-sizing:border-box;
    "
  >
    <p
      style="
        margin:0 0 12px;
        color:#374151;
        font-size:14px;
        line-height:23px;
        font-weight:600;
      "
    >
      Bạn có thể tham khảo thêm:
    </p>

    <p
      style="
        margin:0;
        font-size:14px;
        line-height:24px;
      "
    >
      <a
        href="/products"
        style="color:#db2777;text-decoration:none;font-weight:700;"
      >
        Xem danh mục sản phẩm
      </a>

      <span style="color:#d1d5db;">&nbsp;&nbsp;•&nbsp;&nbsp;</span>

      <a
        href="/contact"
        style="color:#db2777;text-decoration:none;font-weight:700;"
      >
        Liên hệ với Flower Shop
      </a>
    </p>
  </div>
</div>
`;

const EMPTY_POST = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  time: new Date().toTimeString().slice(0, 5),
  image: "",
  content: "",
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const stripHtml = (html = "") =>
  String(html)
    .replace(/<img[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const buildDefaultShopInfo = (settings) => {
  const template =
    String(settings?.blog?.defaultShopInfoHtml || "").trim() ||
    DEFAULT_SHOP_INFO_HTML;

  const branding = settings?.branding || {};

  const contact = settings?.contact || {};

  return template
    .replace(
      /\{\{siteName\}\}/g,
      escapeHtml(branding.siteName || "Flower Shop")
    )
    .replace(/\{\{tagline\}\}/g, escapeHtml(branding.tagline || ""))
    .replace(/\{\{address\}\}/g, escapeHtml(contact.address || "Đang cập nhật"))
    .replace(/\{\{phone\}\}/g, escapeHtml(contact.phone || "Đang cập nhật"))
    .replace(/\{\{email\}\}/g, escapeHtml(contact.email || "Đang cập nhật"))
    .replace(
      /\{\{workingHours\}\}/g,
      escapeHtml(contact.workingHours || "Đang cập nhật")
    );
};

const AdminBlogManagementPage = () => {
  const [settings, setSettings] = useState(() => readSiteSettings());

  const [editorOpen, setEditorOpen] = useState(false);

  const [editingPost, setEditingPost] = useState(null);

  const [form, setForm] = useState(EMPTY_POST);

  const [confirmDelete, setConfirmDelete] = useState(null);

  const [uploading, setUploading] = useState(false);

  const editorRef = useRef(null);

  const { notifySuccess, notifyError } = useNotification();

  useEffect(() => {
    document.title = "Quản lý bài viết | Flower Shop";

    let robots = document.querySelector('meta[name="robots"]');

    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }

    robots.content = "noindex,nofollow";

    return () => {
      robots.content = "index,follow";
    };
  }, []);

  useEffect(() => {
    const refresh = () => setSettings(readSiteSettings());

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (!editorOpen || !editorRef.current) {
      return;
    }

    editorRef.current.innerHTML = form.content || "";

    if (!editingPost) {
      const editor = editorRef.current;

      window.requestAnimationFrame(() => {
        if (!editor || !editor.isConnected) {
          return;
        }

        editor.focus();

        const selection = window.getSelection();

        if (!selection) {
          return;
        }

        const range = document.createRange();

        const firstChild = editor.firstChild;

        if (firstChild) {
          range.setStart(firstChild, 0);
          range.collapse(true);
        } else {
          range.selectNodeContents(editor);
          range.collapse(true);
        }

        selection.removeAllRanges();
        selection.addRange(range);
      });
    }
  }, [editorOpen, editingPost, form.content]);

  const openCreate = () => {
    setEditingPost(null);

    const latestSettings = readSiteSettings();

    setSettings(latestSettings);

    const defaultShopInfo = buildDefaultShopInfo(latestSettings);

    setForm({
      ...EMPTY_POST,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      content: `<p><br /></p>${defaultShopInfo}`,
    });

    setEditorOpen(true);
  };

  const openEdit = (post) => {
    setEditingPost(post);

    setForm({
      title: post.title || "",
      date: post.date || new Date().toISOString().slice(0, 10),
      time: post.time || "08:00",
      image: post.image || "",
      content: post.content || "",
    });

    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);

    setEditingPost(null);

    setForm({
      ...EMPTY_POST,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
    });
  };

  const executeFormat = (command, value = null) => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();

    document.execCommand(command, false, value);

    setForm((current) => ({
      ...current,
      content: editorRef.current?.innerHTML || "",
    }));
  };

  const createLink = () => {
    const url = window.prompt("Nhập liên kết:");

    if (!url) {
      return;
    }

    executeFormat("createLink", url);
  };

  const handleEditorInput = (event) => {
    setForm((current) => ({
      ...current,
      content: event.currentTarget?.innerHTML || "",
    }));
  };

  const handleCoverImage = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setUploading(true);

    try {
      const image = await uploadImageFile(file, {
        folder: "flower-shop/blog",
        maxWidth: 1400,
        maxHeight: 900,
        quality: 0.82,
      });

      setForm((current) => ({
        ...current,
        image,
      }));

      notifySuccess("Đã tải ảnh đại diện lên thành công.");
    } catch (imageError) {
      notifyError(imageError?.message || "Không thể tải ảnh.");
    } finally {
      setUploading(false);
    }
  };

  const insertImage = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setUploading(true);

    try {
      const image = await uploadImageFile(file, {
        folder: "flower-shop/blog/content",
        maxWidth: 1400,
        maxHeight: 1000,
        quality: 0.82,
      });

      if (!editorRef.current) {
        notifyError("Trình soạn thảo chưa sẵn sàng.");
        return;
      }

      editorRef.current.focus();

      document.execCommand("insertImage", false, image);

      setForm((current) => ({
        ...current,
        content: editorRef.current?.innerHTML || "",
      }));

      notifySuccess("Đã chèn hình ảnh vào bài viết.");
    } catch (imageError) {
      notifyError(imageError?.message || "Không thể chèn hình ảnh.");
    } finally {
      setUploading(false);
    }
  };

  const savePost = () => {
    const title = form.title.trim();

    const content = editorRef.current?.innerHTML?.trim() || form.content.trim();

    if (!title) {
      notifyError("Vui lòng nhập tiêu đề bài viết.");
      return;
    }

    if (!content || content === "<br>" || content === "<div><br></div>") {
      notifyError("Vui lòng nhập nội dung bài viết.");
      return;
    }

    const post = {
      id:
        editingPost?.id ||
        `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

      title,

      date: form.date,

      time: form.time || "08:00",

      image: form.image || "",

      content,

      updatedAt: new Date().toISOString(),
    };

    const posts = Array.isArray(settings.blogPosts) ? settings.blogPosts : [];

    const updatedPosts = editingPost
      ? posts.map((item) =>
          String(item.id) === String(editingPost.id) ? post : item
        )
      : [...posts, post];

    try {
      const saved = saveSiteSettings({
        ...settings,
        blogPosts: updatedPosts,
      });

      setSettings(saved);

      notifySuccess(
        editingPost ? "Đã cập nhật bài viết." : "Đã thêm bài viết."
      );

      closeEditor();
    } catch (saveError) {
      notifyError(saveError?.message || "Không thể lưu bài viết.");
    }
  };

  const executeDelete = () => {
    if (!confirmDelete) {
      return;
    }

    try {
      const saved = saveSiteSettings({
        ...settings,
        blogPosts: (settings.blogPosts || []).filter(
          (item) => String(item.id) !== String(confirmDelete.id)
        ),
      });

      setSettings(saved);

      setConfirmDelete(null);

      notifySuccess("Đã xóa bài viết.");
    } catch (deleteError) {
      setConfirmDelete(null);

      notifyError(deleteError?.message || "Không thể xóa bài viết.");
    }
  };

  const posts = Array.isArray(settings.blogPosts) ? settings.blogPosts : [];

  const toolbar = [
    ["bold", <FiBold />, "In đậm"],
    ["italic", <FiItalic />, "In nghiêng"],
    ["underline", <FiUnderline />, "Gạch chân"],
    ["justifyLeft", <FiAlignLeft />, "Căn trái"],
    ["justifyCenter", <FiAlignCenter />, "Căn giữa"],
    ["justifyRight", <FiAlignRight />, "Căn phải"],
    ["justifyFull", <FiAlignJustify />, "Căn đều"],
    ["insertUnorderedList", <FiList />, "Danh sách"],
    [
      "insertOrderedList",
      <span className="text-xs font-bold">1.</span>,
      "Danh sách số",
    ],
    ["undo", <span className="text-lg leading-none">↶</span>, "Hoàn tác"],
    ["redo", <span className="text-lg leading-none">↷</span>, "Làm lại"],
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý bài viết
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Tạo, chỉnh sửa và quản lý nội dung bài viết.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
          >
            Thêm bài viết
          </button>
        </header>

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <div className="flex h-36 items-center justify-center overflow-hidden bg-gray-50 p-3">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full rounded-lg object-contain"
                  />
                ) : (
                  <FiImage size={34} className="text-gray-300" />
                )}
              </div>

              <div className="p-5">
                <h2 className="line-clamp-2 text-lg font-bold text-gray-800">
                  {post.title}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {post.date || "—"} {post.time || "08:00"}
                </p>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                  {stripHtml(post.content) || "Nội dung đang được cập nhật."}
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(post)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    Sửa
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmDelete(post)}
                    className="flex-1 rounded-xl border border-red-100 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <h2 className="text-xl font-bold">
                {editingPost ? "Chỉnh sửa bài viết" : "Thêm bài viết"}
              </h2>

              <button
                type="button"
                onClick={closeEditor}
                className="rounded-full p-2 hover:bg-gray-100"
                aria-label="Đóng"
              >
                <FiX />
              </button>
            </header>

            <div className="overflow-y-auto p-6">
              <div className="space-y-5">
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Tiêu đề bài viết"
                  className={inputClass}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Ngày đăng
                    </label>

                    <input
                      type="date"
                      value={form.date}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          date: event.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Giờ đăng
                    </label>

                    <input
                      type="time"
                      value={form.time}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          time: event.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Ảnh đại diện
                  </label>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label
                      htmlFor="blog-cover"
                      className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
                    >
                      <FiImage />

                      {uploading ? "Đang tải..." : "Chọn tệp"}
                    </label>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                      {form.image
                        ? "Đã chọn hình ảnh"
                        : "Không có tệp nào được chọn"}
                    </div>
                  </div>

                  <input
                    id="blog-cover"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading}
                    onChange={handleCoverImage}
                  />

                  {form.image && (
                    <div className="mt-4 flex h-24 w-36 items-center justify-center overflow-hidden rounded-lg bg-gray-50 p-2">
                      <img
                        src={form.image}
                        alt="Xem trước ảnh đại diện"
                        className="max-h-full max-w-full rounded-md object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50 p-2">
                    {toolbar.map(([command, icon, title]) => (
                      <button
                        key={command}
                        type="button"
                        onClick={() => executeFormat(command)}
                        className="rounded-lg p-2.5 hover:bg-white"
                        title={title}
                        aria-label={title}
                      >
                        {icon}
                      </button>
                    ))}

                    <select
                      onChange={(event) =>
                        executeFormat("formatBlock", event.target.value)
                      }
                      defaultValue=""
                      className="rounded-lg border-0 bg-transparent px-2 text-sm outline-none"
                      aria-label="Định dạng đoạn văn"
                    >
                      <option value="">Đoạn văn</option>
                      <option value="h2">Tiêu đề H2</option>
                      <option value="h3">Tiêu đề H3</option>
                      <option value="p">Đoạn văn</option>
                    </select>

                    <button
                      type="button"
                      onClick={createLink}
                      className="rounded-lg p-2.5 hover:bg-white"
                      title="Chèn liên kết"
                      aria-label="Chèn liên kết"
                    >
                      <FiLink />
                    </button>

                    <label
                      htmlFor="blog-inline-image"
                      className="cursor-pointer rounded-lg p-2.5 hover:bg-white"
                      title="Chèn hình ảnh"
                      aria-label="Chèn hình ảnh"
                    >
                      <FiImage />
                    </label>

                    <input
                      id="blog-inline-image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={uploading}
                      onChange={insertImage}
                    />

                    <button
                      type="button"
                      onClick={() => executeFormat("removeFormat")}
                      className="rounded-lg px-3 py-2 text-xs font-semibold hover:bg-white"
                    >
                      Xóa định dạng
                    </button>
                  </div>

                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleEditorInput}
                    className="blog-editor-content min-h-[320px] w-full overflow-x-hidden p-5 text-sm leading-7 text-gray-700 outline-none [&_a]:font-semibold [&_a]:text-pink-600 [&_div]:w-full [&_h2]:w-full [&_h3]:w-full [&_img]:mx-auto [&_img]:my-4 [&_img]:block [&_img]:max-h-[360px] [&_img]:max-w-[80%] [&_img]:rounded-lg [&_img]:border-0 [&_img]:shadow-none [&_p]:w-full"
                    style={{
                      whiteSpace: "pre-wrap",
                    }}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="rounded-lg border border-gray-200 px-5 py-2.5 font-semibold"
                  >
                    Hủy
                  </button>

                  <button
                    type="button"
                    onClick={savePost}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
                  >
                    <FiSave />
                    Lưu bài viết
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <FiTrash2 className="mx-auto text-red-600" size={28} />

            <h2 className="mt-3 text-lg font-bold">Xóa bài viết?</h2>

            <p className="mt-2 text-sm text-gray-500">
              Bạn có chắc muốn xóa bài viết này?
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border px-5 py-2.5 font-semibold"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={executeDelete}
                className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white"
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

export default AdminBlogManagementPage;
