import { useEffect, useRef, useState } from "react";

import {
  FiAlignCenter,
  FiAlignJustify,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiImage,
  FiItalic,
  FiLink,
  FiList,
  FiSave,
  FiTrash2,
  FiUnderline,
  FiUndo,
  FiX,
} from "react-icons/fi";

import {
  readSiteSettings,
  saveSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

import { uploadImageFile } from "@/services/media";

const EMPTY_POST = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
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

const AdminBlogManagementPage = () => {
  const [settings, setSettings] = useState(() => readSiteSettings());

  const [editorOpen, setEditorOpen] = useState(false);

  const [editingPost, setEditingPost] = useState(null);

  const [form, setForm] = useState(EMPTY_POST);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(null);

  const [uploading, setUploading] = useState(false);

  const editorRef = useRef(null);

  useEffect(() => {
    document.title = "Quản lý bài viết | Flower Shop";

    let robots = document.querySelector('meta[name="robots"]');

    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }

    robots.content = "noindex,nofollow";
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
    if (!editorOpen) return;
    if (!editorRef.current) return;

    editorRef.current.innerHTML = form.content || "";
  }, [editorOpen, editingPost]);

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const openCreate = () => {
    clearMessages();
    setEditingPost(null);

    setForm({
      ...EMPTY_POST,
      date: new Date().toISOString().slice(0, 10),
    });

    setEditorOpen(true);
  };

  const openEdit = (post) => {
    clearMessages();
    setEditingPost(post);

    setForm({
      title: post.title || "",
      date: post.date || new Date().toISOString().slice(0, 10),
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
    });
  };

  const executeFormat = (command, value = null) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    document.execCommand(command, false, value);

    setForm((current) => ({
      ...current,
      content: editorRef.current?.innerHTML || "",
    }));
  };

  const createLink = () => {
    const url = window.prompt("Nhập liên kết:");

    if (!url) return;

    executeFormat("createLink", url);
  };

  const handleEditorInput = (event) => {
    const html = event.currentTarget?.innerHTML || "";

    setForm((current) => ({
      ...current,
      content: html,
    }));
  };

  const handleCoverImage = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setUploading(true);
    clearMessages();

    try {
      const image = await uploadImageFile(file, {
        folder: "flower-shop/blog",
      });

      setForm((current) => ({
        ...current,
        image,
      }));
    } catch (imageError) {
      setError(imageError.message || "Không thể tải ảnh.");
    } finally {
      setUploading(false);
    }
  };

  const insertImage = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setUploading(true);
    clearMessages();

    try {
      const image = await uploadImageFile(file, {
        folder: "flower-shop/blog/content",
      });

      if (!editorRef.current) {
        setError("Trình soạn thảo chưa sẵn sàng.");
        return;
      }

      editorRef.current.focus();

      document.execCommand("insertImage", false, image);

      setForm((current) => ({
        ...current,
        content: editorRef.current?.innerHTML || "",
      }));
    } catch (imageError) {
      setError(imageError.message || "Không thể chèn hình ảnh.");
    } finally {
      setUploading(false);
    }
  };

  const savePost = () => {
    clearMessages();

    const title = form.title.trim();

    const content = editorRef.current?.innerHTML?.trim() || form.content.trim();

    if (!title) {
      setError("Vui lòng nhập tiêu đề bài viết.");
      return;
    }

    if (!content || content === "<br>" || content === "<div><br></div>") {
      setError("Vui lòng nhập nội dung bài viết.");
      return;
    }

    const post = {
      id:
        editingPost?.id ||
        `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      date: form.date,
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

      setMessage(editingPost ? "Đã cập nhật bài viết." : "Đã thêm bài viết.");

      closeEditor();
    } catch (saveError) {
      setError(saveError.message || "Không thể lưu bài viết.");
    }
  };

  const executeDelete = () => {
    if (!confirmDelete) return;

    try {
      const saved = saveSiteSettings({
        ...settings,
        blogPosts: (settings.blogPosts || []).filter(
          (item) => String(item.id) !== String(confirmDelete.id)
        ),
      });

      setSettings(saved);
      setConfirmDelete(null);
      setMessage("Đã xóa bài viết.");
    } catch (deleteError) {
      setConfirmDelete(null);
      setError(deleteError.message || "Không thể xóa bài viết.");
    }
  };

  const posts = Array.isArray(settings.blogPosts) ? settings.blogPosts : [];

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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
          >
            Thêm bài viết
          </button>
        </header>

        {(message || error) && (
          <div className="mb-5 rounded-xl border bg-white p-4 text-sm shadow-sm">
            <span className={error ? "text-red-600" : "text-green-600"}>
              {error || message}
            </span>
          </div>
        )}

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <div className="flex h-44 items-center justify-center overflow-hidden bg-gray-50 p-3">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="max-h-full max-w-full rounded-xl object-contain"
                  />
                ) : (
                  <FiImage size={34} className="text-gray-300" />
                )}
              </div>

              <div className="p-5">
                <h2 className="line-clamp-2 text-lg font-bold text-gray-800">
                  {post.title}
                </h2>

                <p className="mt-1 text-xs text-gray-400">{post.date}</p>

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
            <header className="flex items-center justify-between border-b px-6 py-5">
              <h2 className="text-xl font-bold">
                {editingPost ? "Chỉnh sửa bài viết" : "Thêm bài viết"}
              </h2>

              <button
                type="button"
                onClick={closeEditor}
                className="rounded-full p-2 hover:bg-gray-100"
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
                    <div className="mt-4 flex h-36 w-52 items-center justify-center overflow-hidden rounded-xl border bg-gray-50 p-2">
                      <img
                        src={form.image}
                        alt="Xem trước ảnh đại diện"
                        className="max-h-full max-w-full rounded-lg object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="flex flex-wrap gap-1 border-b bg-gray-50 p-2">
                    {[
                      ["bold", <FiBold />],
                      ["italic", <FiItalic />],
                      ["underline", <FiUnderline />],
                      ["justifyLeft", <FiAlignLeft />],
                      ["justifyCenter", <FiAlignCenter />],
                      ["justifyRight", <FiAlignRight />],
                      ["justifyFull", <FiAlignJustify />],
                      ["insertUnorderedList", <FiList />],
                      [
                        "insertOrderedList",
                        <span className="text-xs font-bold">1.</span>,
                      ],
                      ["undo", <FiUndo />],
                      [
                        "redo",
                        <span
                          className="text-lg leading-none"
                          aria-hidden="true"
                        >
                          ↷
                        </span>,
                      ],
                    ].map(([command, icon]) => (
                      <button
                        key={command}
                        type="button"
                        onClick={() => executeFormat(command)}
                        className="rounded-lg p-2.5 hover:bg-white"
                        title={command}
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
                    >
                      <FiLink />
                    </button>

                    <label
                      htmlFor="blog-inline-image"
                      className="cursor-pointer rounded-lg p-2.5 hover:bg-white"
                      title="Chèn hình ảnh"
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
                    className="min-h-[320px] p-5 text-sm leading-7 text-gray-700 outline-none"
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
                    className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 font-semibold text-white hover:bg-pink-700"
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
