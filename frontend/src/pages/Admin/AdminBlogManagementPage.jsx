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
  FiPlus,
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
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const AdminBlogManagementPage = () => {
  const [settings, setSettings] = useState(() => readSiteSettings());

  const [editorOpen, setEditorOpen] = useState(false);

  const [editingPost, setEditingPost] = useState(null);

  const [form, setForm] = useState(() => ({
    ...EMPTY_POST,
    date: new Date().toISOString().slice(0, 10),
  }));

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(null);

  const editorRef = useRef(null);

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
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();

    document.execCommand(command, false, value);

    setForm((current) => ({
      ...current,
      content: editorRef.current.innerHTML,
    }));
  };

  const handleEditorInput = (event) => {
    setForm((current) => ({
      ...current,
      content: event.currentTarget.innerHTML,
    }));
  };

  const insertImage = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn đúng file hình ảnh.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Hình ảnh không được vượt quá 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (!editorRef.current) {
        return;
      }

      editorRef.current.focus();

      document.execCommand("insertImage", false, String(reader.result || ""));

      setForm((current) => ({
        ...current,
        content: editorRef.current.innerHTML,
      }));
    };

    reader.onerror = () => {
      setError("Không thể đọc hình ảnh.");
    };

    reader.readAsDataURL(file);
  };

  const handleCoverImage = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn đúng file hình ảnh.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Hình ảnh không được vượt quá 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((current) => ({
        ...current,
        image: String(reader.result || ""),
      }));
    };

    reader.onerror = () => {
      setError("Không thể đọc hình ảnh.");
    };

    reader.readAsDataURL(file);
  };

  const savePost = () => {
    clearMessages();

    const title = form.title.trim();

    const content = editorRef.current
      ? editorRef.current.innerHTML.trim()
      : form.content.trim();

    if (!title) {
      setError("Vui lòng nhập tiêu đề bài viết.");
      return;
    }

    if (!content || content === "<br>") {
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

      setError("Không thể lưu bài viết.");
    }
  };

  const requestDeletePost = (post) => {
    setConfirmDelete({
      type: "post",
      id: post.id,
      title: post.title || "bài viết này",
    });
  };

  const confirmDeletePost = () => {
    if (!confirmDelete || confirmDelete.type !== "post") {
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

      setMessage("Đã xóa bài viết.");

      setError("");
    } catch (saveError) {
      console.error(saveError);

      setConfirmDelete(null);

      setError("Không thể xóa bài viết.");
    }
  };

  const posts = Array.isArray(settings.blogPosts) ? settings.blogPosts : [];

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Quản lý bài viết
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Tạo, chỉnh sửa và xóa bài viết.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700"
          >
            <FiPlus />
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
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="aspect-[16/9] w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <h2 className="line-clamp-2 text-lg font-bold text-gray-800">
                    {post.title}
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">{post.date}</p>

                  <div
                    className="blog-content mt-4 line-clamp-5 text-sm leading-7 text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: post.content || "",
                    }}
                  />

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(post)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                      <FiEdit2 />
                      Sửa
                    </button>

                    <button
                      type="button"
                      onClick={() => requestDeletePost(post)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-100 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
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

        {/* EDITOR MODAL */}
        {editorOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
            <div className="my-8 w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 p-5">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingPost ? "Chỉnh sửa bài viết" : "Thêm bài viết"}
                </h2>

                <button
                  type="button"
                  onClick={closeEditor}
                  className="text-gray-500 transition hover:text-gray-800"
                  aria-label="Đóng"
                >
                  <FiX size={22} />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="Tiêu đề bài viết *"
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
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Ảnh đại diện
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImage}
                    className="block w-full rounded-lg border border-gray-200 bg-white p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-pink-600 file:px-4 file:py-2 file:text-white"
                  />

                  {form.image && (
                    <img
                      src={form.image}
                      alt="Ảnh đại diện"
                      className="mt-3 h-44 w-full rounded-xl object-cover"
                    />
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Nội dung bài viết
                  </label>

                  <div className="mb-2 flex flex-wrap items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-2">
                    <button
                      type="button"
                      onClick={() => executeFormat("bold")}
                      className="flex h-9 w-9 items-center justify-center rounded hover:bg-white"
                      title="In đậm"
                    >
                      <FiBold />
                    </button>

                    <button
                      type="button"
                      onClick={() => executeFormat("italic")}
                      className="flex h-9 w-9 items-center justify-center rounded hover:bg-white"
                      title="In nghiêng"
                    >
                      <FiItalic />
                    </button>

                    <button
                      type="button"
                      onClick={() => executeFormat("underline")}
                      className="flex h-9 w-9 items-center justify-center rounded hover:bg-white"
                      title="Gạch chân"
                    >
                      <FiUnderline />
                    </button>

                    <select
                      defaultValue="Arial"
                      onChange={(event) =>
                        executeFormat("fontName", event.target.value)
                      }
                      className="rounded border border-gray-200 bg-white px-2 py-1.5 text-sm"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Tahoma">Tahoma</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>

                    <select
                      defaultValue="3"
                      onChange={(event) =>
                        executeFormat("fontSize", event.target.value)
                      }
                      className="rounded border border-gray-200 bg-white px-2 py-1.5 text-sm"
                    >
                      <option value="1">Rất nhỏ</option>
                      <option value="2">Nhỏ</option>
                      <option value="3">Bình thường</option>
                      <option value="4">Lớn</option>
                      <option value="5">Rất lớn</option>
                      <option value="6">Tiêu đề</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => executeFormat("justifyLeft")}
                      className="flex h-9 w-9 items-center justify-center rounded hover:bg-white"
                      title="Căn trái"
                    >
                      <FiAlignLeft />
                    </button>

                    <button
                      type="button"
                      onClick={() => executeFormat("justifyCenter")}
                      className="flex h-9 w-9 items-center justify-center rounded hover:bg-white"
                      title="Căn giữa"
                    >
                      <FiAlignCenter />
                    </button>

                    <button
                      type="button"
                      onClick={() => executeFormat("justifyRight")}
                      className="flex h-9 w-9 items-center justify-center rounded hover:bg-white"
                      title="Căn phải"
                    >
                      <FiAlignRight />
                    </button>

                    <button
                      type="button"
                      onClick={() => executeFormat("insertUnorderedList")}
                      className="flex h-9 w-9 items-center justify-center rounded hover:bg-white"
                      title="Danh sách"
                    >
                      <FiList />
                    </button>

                    <label
                      className="flex h-9 cursor-pointer items-center gap-2 rounded px-3 text-sm font-medium text-gray-700 hover:bg-white"
                      title="Chèn hình ảnh"
                    >
                      <FiImage />

                      <span>Chèn ảnh</span>

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
                    dangerouslySetInnerHTML={{
                      __html: form.content || "",
                    }}
                    className="min-h-[350px] overflow-y-auto rounded-lg border border-gray-200 bg-white p-5 text-sm leading-7 text-gray-700 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  />
                </div>

                <div className="flex gap-3 border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={savePost}
                    className="flex items-center gap-2 rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700"
                  >
                    <FiSave />

                    {editingPost ? "Lưu thay đổi" : "Thêm bài viết"}
                  </button>

                  <button
                    type="button"
                    onClick={closeEditor}
                    className="rounded-lg border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {confirmDelete && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-post-title"
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <FiTrash2 size={24} />
                </div>

                <h3
                  id="delete-post-title"
                  className="mt-4 text-xl font-bold text-gray-900"
                >
                  Xác nhận xóa bài viết
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Bạn có chắc muốn xóa bài viết{" "}
                  <span className="font-semibold text-gray-800">
                    “{confirmDelete.title}”
                  </span>
                  ?
                </p>

                <div className="mt-6 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(null)}
                    className="rounded-lg border border-gray-200 px-5 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Hủy
                  </button>

                  <button
                    type="button"
                    onClick={confirmDeletePost}
                    className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
                  >
                    Xóa bài viết
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminBlogManagementPage;
