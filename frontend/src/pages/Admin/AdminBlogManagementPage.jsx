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
  content: "",
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    if (!file?.type.startsWith("image/")) {
      reject(new Error("Vui lòng chọn đúng file hình ảnh."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const ratio = Math.min(1, 1200 / image.width, 900 / image.height);

        const canvas = document.createElement("canvas");

        canvas.width = Math.max(1, Math.round(image.width * ratio));

        canvas.height = Math.max(1, Math.round(image.height * ratio));

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Không thể xử lý hình ảnh."));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/webp", 0.78));
      };

      image.onerror = () => reject(new Error("Không thể đọc hình ảnh."));

      image.src = String(reader.result || "");
    };

    reader.onerror = () => reject(new Error("Không thể đọc file."));

    reader.readAsDataURL(file);
  });

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

    clearMessages();

    try {
      const image = await compressImage(file);

      setForm((current) => ({
        ...current,
        image,
      }));
    } catch (imageError) {
      console.error(imageError);
      setError(imageError.message || "Không thể xử lý hình ảnh.");
    }
  };

  const insertImage = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    clearMessages();

    try {
      const image = await compressImage(file);

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
      console.error(imageError);
      setError(imageError.message || "Không thể chèn hình ảnh.");
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
      console.error(saveError);
      setError("Không thể lưu bài viết. Hãy giảm dung lượng ảnh.");
    }
  };

  const requestDelete = (post) => {
    setConfirmDelete(post);
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
      setError("");
    } catch (deleteError) {
      console.error(deleteError);
      setConfirmDelete(null);
      setError("Không thể xóa bài viết.");
    }
  };

  const posts = Array.isArray(settings.blogPosts) ? settings.blogPosts : [];

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý bài viết
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Tạo, chỉnh sửa và xóa bài viết.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
          >
            <FiEdit2 />
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

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              <div className="flex h-48 items-center justify-center overflow-hidden bg-gray-50 p-3">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
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

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                  {stripHtml(post.content) || "Nội dung đang được cập nhật."}
                </p>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(post)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    Sửa
                  </button>

                  <button
                    type="button"
                    onClick={() => requestDelete(post)}
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

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700">
                    <FiImage />
                    Chọn tệp
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverImage}
                    />
                  </label>

                  <span className="ml-3 text-sm text-gray-500">
                    {form.image
                      ? "Đã chọn hình ảnh"
                      : "Không có tệp nào được chọn"}
                  </span>

                  {form.image && (
                    <div className="mt-4 flex h-36 w-52 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2">
                      <img
                        src={form.image}
                        alt="Xem trước ảnh đại diện"
                        className="max-h-full max-w-full rounded-lg object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2">
                    <button
                      type="button"
                      onClick={() => executeFormat("bold")}
                      className="rounded-lg p-2 hover:bg-white"
                    >
                      <FiBold />
                    </button>

                    <button
                      type="button"
                      onClick={() => executeFormat("italic")}
                      className="rounded-lg p-2 hover:bg-white"
                    >
                      <FiItalic />
                    </button>

                    <button
                      type="button"
                      onClick={() => executeFormat("underline")}
                      className="rounded-lg p-2 hover:bg-white"
                    >
                      <FiUnderline />
                    </button>

                    <button
                      type="button"
                      onClick={() => executeFormat("justifyLeft")}
                      className="rounded-lg p-2 hover:bg-white"
                    >
                      <FiAlignLeft />
                    </button>

                    <button
                      type="button"
                      onClick={() => executeFormat("justifyCenter")}
                      className="rounded-lg p-2 hover:bg-white"
                    >
                      <FiAlignCenter />
                    </button>

                    <button
                      type="button"
                      onClick={() => executeFormat("justifyRight")}
                      className="rounded-lg p-2 hover:bg-white"
                    >
                      <FiAlignRight />
                    </button>

                    <button
                      type="button"
                      onClick={() => executeFormat("insertUnorderedList")}
                      className="rounded-lg p-2 hover:bg-white"
                    >
                      <FiList />
                    </button>

                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white">
                      <FiImage />
                      Chèn ảnh
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={insertImage}
                      />
                    </label>
                  </div>

                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleEditorInput}
                    className="admin-blog-editor min-h-[360px] whitespace-pre-wrap p-5 outline-none"
                    style={{
                      whiteSpace: "pre-wrap",
                    }}
                  />
                </div>
              </div>
            </div>

            <footer className="flex justify-end gap-3 border-t border-gray-100 px-6 py-5">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold"
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
            </footer>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <FiTrash2 />
            </div>

            <h2 className="mt-4 text-center text-lg font-bold">
              Xác nhận xóa bài viết
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-gray-600">
              Bạn có chắc muốn xóa <strong>{confirmDelete.title}</strong>?
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={executeDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white"
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
