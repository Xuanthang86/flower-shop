import { useEffect, useRef, useState } from "react";

import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiEdit2,
  FiImage,
  FiItalic,
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

const EMPTY_POST = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  image: "",
  content: "<p><br></p>",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const EDITOR_STYLE = `
.admin-blog-editor {
  color: #374151;
  font-size: 16px;
  line-height: 1.85;
  overflow-wrap: anywhere;
  white-space: normal;
}
.admin-blog-editor p {
  display: block;
  min-height: 1.5em;
  margin: 0 0 1rem;
}
.admin-blog-editor p:last-child {
  margin-bottom: 0;
}
.admin-blog-editor h1,
.admin-blog-editor h2,
.admin-blog-editor h3,
.admin-blog-editor h4 {
  color: #111827;
  font-weight: 700;
}
.admin-blog-editor h1 {
  margin: 1.5rem 0 .9rem;
  font-size: 2rem;
}
.admin-blog-editor h2 {
  margin: 1.5rem 0 .8rem;
  font-size: 1.6rem;
}
.admin-blog-editor h3 {
  margin: 1.25rem 0 .7rem;
  font-size: 1.3rem;
}
.admin-blog-editor ul,
.admin-blog-editor ol {
  margin: 1rem 0;
  padding-left: 1.5rem;
}
.admin-blog-editor ul {
  list-style: disc;
}
.admin-blog-editor ol {
  list-style: decimal;
}
.admin-blog-editor li {
  margin-bottom: .4rem;
}
.admin-blog-editor blockquote {
  margin: 1rem 0;
  padding: .9rem 1rem;
  border-left: 4px solid #db2777;
  border-radius: .75rem;
  background: #fdf2f8;
}
.admin-blog-editor img {
  display: block;
  max-width: 100%;
  max-height: 500px;
  width: auto;
  margin: 1.25rem auto;
  border-radius: .9rem;
  object-fit: contain;
}
`;

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const stripHtml = (html = "") =>
  String(html)
    .replace(/<img[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeContent = (html = "") => {
  const value = String(html).trim();

  if (!value) {
    return "<p><br></p>";
  }

  if (value === "<br>" || value === "<div><br></div>") {
    return "<p><br></p>";
  }

  return value;
};

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Vui lòng chọn đúng file hình ảnh."));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      reject(new Error("Hình ảnh không được vượt quá 5MB."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxWidth = 1600;

        const ratio = Math.min(1, maxWidth / image.naturalWidth);

        const width = Math.round(image.naturalWidth * ratio);

        const height = Math.round(image.naturalHeight * ratio);

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Không thể xử lý hình ảnh."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL("image/webp", 0.8));
      };

      image.onerror = () => reject(new Error("Không thể đọc hình ảnh."));

      image.src = String(reader.result || "");
    };

    reader.onerror = () => reject(new Error("Không thể đọc file."));

    reader.readAsDataURL(file);
  });

const AdminBlogManagementPage = () => {
  const [settings, setSettings] = useState(() => readSiteSettings());

  const [editorOpen, setEditorOpen] = useState(false);

  const [editingPost, setEditingPost] = useState(null);

  const [form, setForm] = useState(EMPTY_POST);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const editorRef = useRef(null);

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

    editorRef.current.innerHTML = normalizeContent(form.content);
  }, [editorOpen, editingPost?.id]);

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
      content: normalizeContent(post.content),
    });

    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);

    setEditingPost(null);

    setForm(EMPTY_POST);
  };

  const executeFormat = (command, value = null) => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    document.execCommand(command, false, value);

    setForm((current) => ({
      ...current,
      content: normalizeContent(editor.innerHTML),
    }));
  };

  const handleEditorInput = (event) => {
    setForm((current) => ({
      ...current,
      content: normalizeContent(event.currentTarget.innerHTML),
    }));
  };

  const insertImage = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    clearMessages();

    try {
      const image = await compressImage(file);

      const editor = editorRef.current;

      if (!editor) {
        setError("Trình soạn thảo chưa sẵn sàng.");
        return;
      }

      editor.focus();

      document.execCommand("insertImage", false, image);

      setForm((current) => ({
        ...current,
        content: normalizeContent(editor.innerHTML),
      }));
    } catch (imageError) {
      console.error(imageError);

      setError(imageError.message || "Không thể chèn hình ảnh.");
    }
  };

  const handleCoverImage = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    clearMessages();

    try {
      const image = await compressImage(file);

      setForm((current) => ({
        ...current,
        image,
      }));
    } catch (imageError) {
      console.error(imageError);

      setError(imageError.message || "Không thể xử lý ảnh đại diện.");
    }
  };

  const savePost = () => {
    clearMessages();

    const title = form.title.trim();

    const editor = editorRef.current;

    const content = normalizeContent(editor ? editor.innerHTML : form.content);

    if (!title) {
      setError("Vui lòng nhập tiêu đề bài viết.");
      return;
    }

    if (!stripHtml(content)) {
      setError("Vui lòng nhập nội dung bài viết.");
      return;
    }

    const post = {
      id:
        editingPost?.id ||
        `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      date: form.date || new Date().toISOString().slice(0, 10),
      image: form.image || "",
      content,
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

      closeEditor();

      setMessage(editingPost ? "Đã cập nhật bài viết." : "Đã thêm bài viết.");
    } catch (saveError) {
      console.error(saveError);

      setError(saveError.message || "Không thể lưu bài viết.");
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    try {
      const saved = saveSiteSettings({
        ...settings,
        blogPosts: (settings.blogPosts || []).filter(
          (post) => String(post.id) !== String(deleteTarget.id)
        ),
      });

      setSettings(saved);

      setDeleteTarget(null);

      setMessage("Đã xóa bài viết.");
    } catch (deleteError) {
      console.error(deleteError);

      setDeleteTarget(null);

      setError("Không thể xóa bài viết.");
    }
  };

  const posts = Array.isArray(settings.blogPosts) ? settings.blogPosts : [];

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <style>{EDITOR_STYLE}</style>

      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Quản lý bài viết
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Tạo, chỉnh sửa và quản lý nội dung bài viết.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-700"
          >
            <FiEdit2 />
            Thêm bài viết
          </button>
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

        {posts.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center text-gray-500 shadow-sm">
            Chưa có bài viết.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <div className="flex h-48 items-center justify-center overflow-hidden bg-gray-50">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-400">Chưa có ảnh</span>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="line-clamp-2 text-lg font-bold text-gray-800">
                    {post.title}
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">{post.date}</p>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                    {stripHtml(post.content)}
                  </p>

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(post)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-100"
                    >
                      <FiEdit2 />
                      Sửa
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(post)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                      <FiTrash2 />
                      Xóa
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {editorOpen && (
          <div className="fixed inset-0 z-[900] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-6 flex max-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-5">
                <h2 className="text-xl font-bold">
                  {editingPost ? "Chỉnh sửa bài viết" : "Thêm bài viết"}
                </h2>

                <button
                  type="button"
                  onClick={closeEditor}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
                >
                  <FiX />
                </button>
              </div>

              <div className="overflow-y-auto p-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold">
                      Tiêu đề bài viết
                    </label>

                    <input
                      value={form.title}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </div>

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
                      Ảnh đại diện
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImage}
                      className="block w-full rounded-xl border border-gray-200 p-3 text-sm"
                    />
                  </div>

                  {form.image && (
                    <div className="md:col-span-2">
                      <div className="flex h-48 items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-3">
                        <img
                          src={form.image}
                          alt="Xem trước ảnh đại diện"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold">
                      Nội dung bài viết
                    </label>

                    <div className="mb-2 flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-gray-50 p-2">
                      <button
                        type="button"
                        onClick={() => executeFormat("bold")}
                        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white"
                      >
                        <FiBold />
                      </button>

                      <button
                        type="button"
                        onClick={() => executeFormat("italic")}
                        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white"
                      >
                        <FiItalic />
                      </button>

                      <button
                        type="button"
                        onClick={() => executeFormat("underline")}
                        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white"
                      >
                        <FiUnderline />
                      </button>

                      <button
                        type="button"
                        onClick={() => executeFormat("justifyLeft")}
                        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white"
                      >
                        <FiAlignLeft />
                      </button>

                      <button
                        type="button"
                        onClick={() => executeFormat("justifyCenter")}
                        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white"
                      >
                        <FiAlignCenter />
                      </button>

                      <button
                        type="button"
                        onClick={() => executeFormat("justifyRight")}
                        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white"
                      >
                        <FiAlignRight />
                      </button>

                      <button
                        type="button"
                        onClick={() => executeFormat("insertUnorderedList")}
                        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white"
                      >
                        <FiList />
                      </button>

                      <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium hover:bg-white">
                        <FiImage />
                        Ảnh
                        <input
                          type="file"
                          accept="image/*"
                          onChange={insertImage}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={handleEditorInput}
                      className="admin-blog-editor min-h-[320px] rounded-xl border border-gray-200 bg-white p-5 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                      role="textbox"
                      aria-multiline="true"
                      data-placeholder="Nhập nội dung bài viết..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                  >
                    Hủy
                  </button>

                  <button
                    type="button"
                    onClick={savePost}
                    className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
                  >
                    <FiSave />
                    Lưu bài viết
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
              <h2 className="text-lg font-bold">Xác nhận xóa bài viết</h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Bạn có chắc muốn xóa bài viết{" "}
                <strong>"{deleteTarget.title}"</strong>?
              </p>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminBlogManagementPage;
