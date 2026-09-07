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

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const EDITOR_STYLE = `
  .admin-blog-editor {
    color: #374151;
    font-size: 16px;
    line-height: 1.85;
    overflow-wrap: anywhere;
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
    line-height: 1.3;
  }

  .admin-blog-editor h2 {
    margin: 1.5rem 0 .8rem;
    font-size: 1.6rem;
    line-height: 1.35;
  }

  .admin-blog-editor h3 {
    margin: 1.25rem 0 .7rem;
    font-size: 1.3rem;
    line-height: 1.4;
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

  .admin-blog-editor a {
    color: #db2777;
    text-decoration: underline;
  }

  .admin-blog-editor strong {
    font-weight: 700;
  }

  .admin-blog-editor em {
    font-style: italic;
  }

  .admin-blog-editor u {
    text-decoration: underline;
  }
`;

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
      content: editorRef.current?.innerHTML || "",
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
        content: editorRef.current?.innerHTML || "",
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
      <style>{EDITOR_STYLE}</style>

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
            className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700"
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
            {posts.map((post) => {
              const excerpt = stripHtml(post.content).slice(0, 180);

              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                >
                  {post.image ? (
                    <div className="flex h-48 items-center justify-center overflow-hidden bg-gray-50">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-gray-50 text-sm text-gray-400">
                      Flower Shop
                    </div>
                  )}

                  <div className="p-5">
                    <h2 className="line-clamp-2 text-lg font-bold text-gray-800">
                      {post.title}
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">{post.date}</p>

                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                      {excerpt || "Nội dung bài viết đang được cập nhật."}
                    </p>

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(post)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                      >
                        <FiEdit2 />
                        Sửa
                      </button>

                      <button
                        type="button"
                        onClick={() => requestDeletePost(post)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <FiTrash2 />
                        Xóa
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {editorOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
            <div className="my-6 flex max-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingPost ? "Chỉnh sửa bài viết" : "Thêm bài viết"}
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Soạn nội dung và xem trước ngay trong trình chỉnh sửa.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEditor}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                  aria-label="Đóng"
                >
                  <FiX size={22} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="space-y-6 p-6">
                  <div className="grid gap-5 md:grid-cols-[1fr_220px]">
                    <div className="space-y-5">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                          className={`${inputClass} text-base font-medium`}
                          placeholder="Nhập tiêu đề bài viết *"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Ảnh đại diện
                      </label>

                      <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center transition hover:border-pink-300 hover:bg-pink-50">
                        {form.image ? (
                          <img
                            src={form.image}
                            alt="Ảnh đại diện"
                            className="h-[150px] w-full object-cover"
                          />
                        ) : (
                          <>
                            <FiImage size={30} className="text-gray-400" />

                            <span className="mt-2 px-3 text-xs text-gray-500">
                              Chọn ảnh đại diện
                            </span>
                          </>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImage}
                          className="hidden"
                        />
                      </label>

                      <p className="mt-2 text-xs text-gray-400">
                        JPG, PNG, WEBP · tối đa 2MB
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700">
                        Nội dung bài viết
                      </label>

                      <span className="text-xs text-gray-400">
                        Rich text editor
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
                        <button
                          type="button"
                          onClick={() => executeFormat("bold")}
                          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white"
                          title="In đậm"
                        >
                          <FiBold />
                        </button>

                        <button
                          type="button"
                          onClick={() => executeFormat("italic")}
                          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white"
                          title="In nghiêng"
                        >
                          <FiItalic />
                        </button>

                        <button
                          type="button"
                          onClick={() => executeFormat("underline")}
                          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white"
                          title="Gạch chân"
                        >
                          <FiUnderline />
                        </button>

                        <div className="mx-1 h-6 w-px bg-gray-200" />

                        <select
                          defaultValue="Arial"
                          onChange={(event) =>
                            executeFormat("fontName", event.target.value)
                          }
                          className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm"
                          title="Font chữ"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Tahoma">Tahoma</option>
                          <option value="Times New Roman">
                            Times New Roman
                          </option>
                        </select>

                        <select
                          defaultValue="3"
                          onChange={(event) =>
                            executeFormat("fontSize", event.target.value)
                          }
                          className="rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm"
                          title="Cỡ chữ"
                        >
                          <option value="1">Rất nhỏ</option>
                          <option value="2">Nhỏ</option>
                          <option value="3">Bình thường</option>
                          <option value="4">Lớn</option>
                          <option value="5">Rất lớn</option>
                          <option value="6">Tiêu đề</option>
                        </select>

                        <div className="mx-1 h-6 w-px bg-gray-200" />

                        <button
                          type="button"
                          onClick={() => executeFormat("justifyLeft")}
                          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white"
                          title="Căn trái"
                        >
                          <FiAlignLeft />
                        </button>

                        <button
                          type="button"
                          onClick={() => executeFormat("justifyCenter")}
                          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white"
                          title="Căn giữa"
                        >
                          <FiAlignCenter />
                        </button>

                        <button
                          type="button"
                          onClick={() => executeFormat("justifyRight")}
                          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white"
                          title="Căn phải"
                        >
                          <FiAlignRight />
                        </button>

                        <button
                          type="button"
                          onClick={() => executeFormat("insertUnorderedList")}
                          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white"
                          title="Danh sách"
                        >
                          <FiList />
                        </button>

                        <label
                          className="flex h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium text-gray-700 hover:bg-white"
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
                        className="admin-blog-editor min-h-[420px] bg-white p-6 outline-none focus:ring-2 focus:ring-inset focus:ring-pink-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={savePost}
                  className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700"
                >
                  <FiSave />

                  {editingPost ? "Lưu thay đổi" : "Thêm bài viết"}
                </button>
              </div>
            </div>
          </div>
        )}

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
                    className="rounded-xl border border-gray-200 px-5 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Hủy
                  </button>

                  <button
                    type="button"
                    onClick={confirmDeletePost}
                    className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
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
