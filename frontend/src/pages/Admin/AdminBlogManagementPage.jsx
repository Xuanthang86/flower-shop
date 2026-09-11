// import { useEffect, useRef, useState } from "react";

// import {
//   FiAlignCenter,
//   FiAlignJustify,
//   FiAlignLeft,
//   FiAlignRight,
//   FiBold,
//   FiImage,
//   FiItalic,
//   FiLink,
//   FiList,
//   FiSave,
//   FiTrash2,
//   FiUnderline,
//   FiX,
// } from "react-icons/fi";

// import {
//   readSiteSettings,
//   saveSiteSettings,
//   SITE_SETTINGS_UPDATED_EVENT,
//   DEFAULT_BLOG_SHOP_INFO_HTML,
// } from "@/services/siteSettings";

// import { uploadImageFile } from "@/services/media";

// import { useNotification } from "@/context/NotificationProvider";

// const EMPTY_POST = {
//   title: "",
//   date: new Date().toISOString().slice(0, 10),
//   time: new Date().toTimeString().slice(0, 5),
//   image: "",
//   content: "",
// };

// const inputClass =
//   "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

// const stripHtml = (html = "") =>
//   String(html)
//     .replace(/<img[^>]*>/gi, " ")
//     .replace(/<[^>]+>/g, " ")
//     .replace(/&nbsp;/gi, " ")
//     .replace(/\s+/g, " ")
//     .trim();

// const escapeHtml = (value = "") =>
//   String(value)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");

// const formatPostDate = (value) => {
//   const raw = String(value || "").slice(0, 10);

//   const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

//   if (!match) {
//     return raw || "—";
//   }

//   const [, year, month, day] = match;

//   return `${day}/${month}/${year}`;
// };

// const buildDefaultShopInfo = (settings) => {
//   const template =
//     String(settings?.blog?.defaultShopInfoHtml || "").trim() ||
//     DEFAULT_BLOG_SHOP_INFO_HTML;

//   const branding = settings?.branding || {};

//   const contact = settings?.contact || {};

//   return template
//     .replace(
//       /\{\{siteName\}\}/g,
//       escapeHtml(branding.siteName || "Flower Shop")
//     )
//     .replace(/\{\{tagline\}\}/g, escapeHtml(branding.tagline || ""))
//     .replace(/\{\{address\}\}/g, escapeHtml(contact.address || "Đang cập nhật"))
//     .replace(/\{\{phone\}\}/g, escapeHtml(contact.phone || "Đang cập nhật"))
//     .replace(/\{\{email\}\}/g, escapeHtml(contact.email || "Đang cập nhật"))
//     .replace(
//       /\{\{workingHours\}\}/g,
//       escapeHtml(contact.workingHours || "Đang cập nhật")
//     );
// };

// const normalizeEditorContent = (content = "") => {
//   const value = String(content || "");

//   if (!value.trim()) {
//     return "";
//   }

//   try {
//     const parser = new DOMParser();

//     const document = parser.parseFromString(
//       `<div id="flower-shop-editor-root">${value}</div>`,
//       "text/html"
//     );

//     const root = document.getElementById("flower-shop-editor-root");

//     if (!root) {
//       return value;
//     }

//     root
//       .querySelectorAll('[data-flower-shop-default-info="true"]')
//       .forEach((element) => {
//         element.setAttribute("contenteditable", "false");
//       });

//     return root.innerHTML;
//   } catch {
//     return value;
//   }
// };

// const hasDefaultShopInfo = (content = "") =>
//   String(content || "").includes('data-flower-shop-default-info="true"');

// const buildEditorContentWithDefault = (content, settings) => {
//   const current = String(content || "").trim();

//   if (hasDefaultShopInfo(current)) {
//     return normalizeEditorContent(current);
//   }

//   const defaultInfo = normalizeEditorContent(buildDefaultShopInfo(settings));

//   return `
//     <p><br /></p>
//     ${defaultInfo}
//     <p><br /></p>
//   `;
// };

// const ensureDefaultShopInfo = (content, settings) => {
//   const current = String(content || "").trim();

//   if (hasDefaultShopInfo(current)) {
//     return normalizeEditorContent(current);
//   }

//   return buildEditorContentWithDefault(current, settings);
// };

// const AdminBlogManagementPage = () => {
//   const [settings, setSettings] = useState(() => readSiteSettings());

//   const [editorOpen, setEditorOpen] = useState(false);

//   const [editingPost, setEditingPost] = useState(null);

//   const [form, setForm] = useState(EMPTY_POST);

//   const [confirmDelete, setConfirmDelete] = useState(null);

//   const [uploading, setUploading] = useState(false);

//   const editorRef = useRef(null);

//   const selectionRef = useRef(null);

//   const { notifySuccess, notifyError } = useNotification();

//   useEffect(() => {
//     document.title = "Quản lý bài viết | Flower Shop";

//     let robots = document.querySelector('meta[name="robots"]');

//     if (!robots) {
//       robots = document.createElement("meta");
//       robots.name = "robots";
//       document.head.appendChild(robots);
//     }

//     robots.content = "noindex,nofollow";

//     return () => {
//       robots.content = "index,follow";
//     };
//   }, []);

//   useEffect(() => {
//     const refresh = () => {
//       setSettings(readSiteSettings());
//     };

//     window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);

//     window.addEventListener("storage", refresh);

//     return () => {
//       window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);

//       window.removeEventListener("storage", refresh);
//     };
//   }, []);

//   /*
//    * Chỉ đồng bộ DOM khi:
//    * - mở editor;
//    * - chuyển từ thêm mới sang sửa;
//    * - chuyển sang bài viết khác.
//    *
//    * Không phụ thuộc form.content để tránh reset caret
//    * sau mỗi lần người dùng gõ.
//    */
//   useEffect(() => {
//     if (!editorOpen || !editorRef.current) {
//       return;
//     }

//     const normalizedContent = editingPost
//       ? normalizeEditorContent(form.content || "")
//       : buildEditorContentWithDefault(form.content, settings);

//     editorRef.current.innerHTML = normalizedContent;

//     if (!editingPost) {
//       window.requestAnimationFrame(() => {
//         const editor = editorRef.current;

//         if (!editor || !editor.isConnected) {
//           return;
//         }

//         const firstEditableParagraph = editor.querySelector(
//           ':scope > p:not([contenteditable="false"])'
//         );

//         editor.focus();

//         const selection = window.getSelection();

//         if (!selection) {
//           return;
//         }

//         const range = document.createRange();

//         if (firstEditableParagraph) {
//           range.selectNodeContents(firstEditableParagraph);
//           range.collapse(true);
//         } else {
//           range.selectNodeContents(editor);
//           range.collapse(true);
//         }

//         selection.removeAllRanges();
//         selection.addRange(range);

//         selectionRef.current = range.cloneRange();
//       });
//     }
//   }, [editorOpen, editingPost]);

//   const openCreate = () => {
//     const latestSettings = readSiteSettings();

//     setSettings(latestSettings);

//     setEditingPost(null);

//     setForm({
//       ...EMPTY_POST,
//       date: new Date().toISOString().slice(0, 10),
//       time: new Date().toTimeString().slice(0, 5),
//       content: buildEditorContentWithDefault("", latestSettings),
//     });

//     selectionRef.current = null;

//     setEditorOpen(true);
//   };

//   const openEdit = (post) => {
//     setEditingPost(post);

//     setForm({
//       title: post.title || "",
//       date: post.date || new Date().toISOString().slice(0, 10),
//       time: post.time || "08:00",
//       image: post.image || "",
//       content: post.content || "",
//     });

//     selectionRef.current = null;

//     setEditorOpen(true);
//   };

//   const closeEditor = () => {
//     setEditorOpen(false);

//     setEditingPost(null);

//     selectionRef.current = null;

//     setForm({
//       ...EMPTY_POST,
//       date: new Date().toISOString().slice(0, 10),
//       time: new Date().toTimeString().slice(0, 5),
//     });
//   };

//   const saveEditorSelection = () => {
//     const editor = editorRef.current;

//     const selection = window.getSelection();

//     if (!editor || !selection || selection.rangeCount === 0) {
//       return;
//     }

//     const range = selection.getRangeAt(0);

//     if (!editor.contains(range.commonAncestorContainer)) {
//       return;
//     }

//     const defaultBlock =
//       range.commonAncestorContainer.nodeType === 1
//         ? range.commonAncestorContainer.closest?.('[contenteditable="false"]')
//         : range.commonAncestorContainer.parentElement?.closest?.(
//             '[contenteditable="false"]'
//           );

//     if (defaultBlock) {
//       return;
//     }

//     selectionRef.current = range.cloneRange();
//   };

//   const restoreEditorSelection = () => {
//     const editor = editorRef.current;

//     if (!editor) {
//       return false;
//     }

//     const selection = window.getSelection();

//     if (!selection) {
//       return false;
//     }

//     if (
//       selectionRef.current &&
//       editor.contains(selectionRef.current.commonAncestorContainer)
//     ) {
//       selection.removeAllRanges();
//       selection.addRange(selectionRef.current);

//       return true;
//     }

//     editor.focus();

//     const range = document.createRange();

//     range.selectNodeContents(editor);
//     range.collapse(false);

//     selection.removeAllRanges();
//     selection.addRange(range);

//     selectionRef.current = range.cloneRange();

//     return true;
//   };

//   const syncEditorContent = () => {
//     if (!editorRef.current) {
//       return;
//     }

//     setForm((current) => ({
//       ...current,
//       content: editorRef.current.innerHTML || "",
//     }));
//   };

//   const executeFormat = (command, value = null) => {
//     if (!editorRef.current) {
//       return;
//     }

//     restoreEditorSelection();

//     editorRef.current.focus();

//     document.execCommand(command, false, value);

//     syncEditorContent();

//     saveEditorSelection();
//   };

//   const createLink = () => {
//     saveEditorSelection();

//     const url = window.prompt("Nhập liên kết:");

//     if (!url) {
//       return;
//     }

//     executeFormat("createLink", url);
//   };

//   const handleEditorInput = (event) => {
//     if (!event.currentTarget) {
//       return;
//     }

//     setForm((current) => ({
//       ...current,
//       content: event.currentTarget.innerHTML || "",
//     }));

//     saveEditorSelection();
//   };

//   const handleEditorSelection = () => {
//     saveEditorSelection();
//   };

//   const handleCoverImage = async (event) => {
//     const file = event.target.files?.[0];

//     event.target.value = "";

//     if (!file) {
//       return;
//     }

//     setUploading(true);

//     try {
//       const image = await uploadImageFile(file, {
//         folder: "flower-shop/blog",
//         maxWidth: 1400,
//         maxHeight: 900,
//         quality: 0.82,
//       });

//       setForm((current) => ({
//         ...current,
//         image,
//       }));

//       notifySuccess("Đã tải ảnh đại diện lên thành công.");
//     } catch (imageError) {
//       notifyError(imageError?.message || "Không thể tải ảnh.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const insertImage = async (event) => {
//     const file = event.target.files?.[0];

//     event.target.value = "";

//     if (!file) {
//       return;
//     }

//     saveEditorSelection();

//     setUploading(true);

//     try {
//       const image = await uploadImageFile(file, {
//         folder: "flower-shop/blog/content",
//         maxWidth: 1400,
//         maxHeight: 1000,
//         quality: 0.82,
//       });

//       const editor = editorRef.current;

//       if (!editor) {
//         notifyError("Trình soạn thảo chưa sẵn sàng.");

//         return;
//       }

//       editor.focus();

//       restoreEditorSelection();

//       const selection = window.getSelection();

//       if (!selection || selection.rangeCount === 0) {
//         notifyError("Không xác định được vị trí chèn ảnh.");

//         return;
//       }

//       const range = selection.getRangeAt(0);

//       if (!editor.contains(range.commonAncestorContainer)) {
//         notifyError("Không xác định được vị trí chèn ảnh.");

//         return;
//       }

//       const imageElement = document.createElement("img");

//       imageElement.src = image;

//       imageElement.alt = "Hình ảnh trong bài viết";

//       imageElement.loading = "lazy";

//       imageElement.decoding = "async";

//       imageElement.style.display = "block";

//       imageElement.style.maxWidth = "80%";

//       imageElement.style.height = "auto";

//       imageElement.style.margin = "16px auto";

//       imageElement.style.borderRadius = "12px";

//       range.deleteContents();

//       range.insertNode(imageElement);

//       range.setStartAfter(imageElement);

//       range.collapse(true);

//       selection.removeAllRanges();

//       selection.addRange(range);

//       selectionRef.current = range.cloneRange();

//       syncEditorContent();

//       notifySuccess("Đã chèn hình ảnh vào đúng vị trí đang chọn.");
//     } catch (imageError) {
//       notifyError(imageError?.message || "Không thể chèn hình ảnh.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const savePost = () => {
//     const title = form.title.trim();

//     let content = editorRef.current?.innerHTML?.trim() || form.content.trim();

//     if (!title) {
//       notifyError("Vui lòng nhập tiêu đề bài viết.");

//       return;
//     }

//     content = ensureDefaultShopInfo(content, settings);

//     if (!content || content === "<br>" || content === "<div><br></div>") {
//       notifyError("Vui lòng nhập nội dung bài viết.");

//       return;
//     }

//     const post = {
//       id:
//         editingPost?.id ||
//         `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

//       title,

//       date: form.date,

//       time: form.time || "08:00",

//       image: form.image || "",

//       content,

//       updatedAt: new Date().toISOString(),
//     };

//     const posts = Array.isArray(settings.blogPosts) ? settings.blogPosts : [];

//     const updatedPosts = editingPost
//       ? posts.map((item) =>
//           String(item.id) === String(editingPost.id) ? post : item
//         )
//       : [...posts, post];

//     try {
//       const saved = saveSiteSettings({
//         ...settings,
//         blogPosts: updatedPosts,
//       });

//       setSettings(saved);

//       notifySuccess(
//         editingPost ? "Đã cập nhật bài viết." : "Đã thêm bài viết."
//       );

//       closeEditor();
//     } catch (saveError) {
//       notifyError(saveError?.message || "Không thể lưu bài viết.");
//     }
//   };

//   const executeDelete = () => {
//     if (!confirmDelete) {
//       return;
//     }

//     try {
//       const saved = saveSiteSettings({
//         ...settings,
//         blogPosts: (settings.blogPosts || []).filter(
//           (item) => String(item.id) !== String(confirmDelete.id)
//         ),
//       });

//       setSettings(saved);

//       setConfirmDelete(null);

//       notifySuccess("Đã xóa bài viết.");
//     } catch (deleteError) {
//       setConfirmDelete(null);

//       notifyError(deleteError?.message || "Không thể xóa bài viết.");
//     }
//   };

//   const posts = Array.isArray(settings.blogPosts) ? settings.blogPosts : [];

//   const toolbar = [
//     ["bold", <FiBold />, "In đậm"],
//     ["italic", <FiItalic />, "In nghiêng"],
//     ["underline", <FiUnderline />, "Gạch chân"],
//     ["justifyLeft", <FiAlignLeft />, "Căn trái"],
//     ["justifyCenter", <FiAlignCenter />, "Căn giữa"],
//     ["justifyRight", <FiAlignRight />, "Căn phải"],
//     ["justifyFull", <FiAlignJustify />, "Căn đều"],
//     ["insertUnorderedList", <FiList />, "Danh sách"],
//     [
//       "insertOrderedList",
//       <span className="text-xs font-bold">1.</span>,
//       "Danh sách số",
//     ],
//     ["undo", <span className="text-lg leading-none">↶</span>, "Hoàn tác"],
//     ["redo", <span className="text-lg leading-none">↷</span>, "Làm lại"],
//   ];

//   return (
//     <main className="min-h-screen bg-gray-50 py-6">
//       <div className="mx-auto max-w-7xl px-4">
//         <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">
//               Quản lý bài viết
//             </h1>

//             <p className="mt-2 text-sm text-gray-500">
//               Tạo, chỉnh sửa và quản lý nội dung bài viết.
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={openCreate}
//             className="inline-flex items-center justify-center rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
//           >
//             Thêm bài viết
//           </button>
//         </header>

//         <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
//           {posts.map((post) => (
//             <article
//               key={post.id}
//               className="overflow-hidden rounded-2xl bg-white shadow-sm"
//             >
//               <div className="flex h-36 items-center justify-center overflow-hidden bg-gray-50 p-3">
//                 {post.image ? (
//                   <img
//                     src={post.image}
//                     alt={post.title}
//                     loading="lazy"
//                     decoding="async"
//                     className="max-h-full max-w-full rounded-lg object-contain"
//                   />
//                 ) : (
//                   <FiImage size={34} className="text-gray-300" />
//                 )}
//               </div>

//               <div className="p-5">
//                 <h2 className="line-clamp-2 text-lg font-bold text-gray-800">
//                   {post.title}
//                 </h2>

//                 <p className="mt-1 text-xs text-gray-400">
//                   {formatPostDate(post.date)} {post.time || "08:00"}
//                 </p>

//                 <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
//                   {stripHtml(post.content) || "Nội dung đang được cập nhật."}
//                 </p>

//                 <div className="mt-4 flex gap-2">
//                   <button
//                     type="button"
//                     onClick={() => openEdit(post)}
//                     className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
//                   >
//                     Sửa
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => setConfirmDelete(post)}
//                     className="flex-1 rounded-xl border border-red-100 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
//                   >
//                     Xóa
//                   </button>
//                 </div>
//               </div>
//             </article>
//           ))}
//         </section>
//       </div>

//       {editorOpen && (
//         <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
//           <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
//             <header className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
//               <h2 className="text-xl font-bold">
//                 {editingPost ? "Chỉnh sửa bài viết" : "Thêm bài viết"}
//               </h2>

//               <button
//                 type="button"
//                 onClick={closeEditor}
//                 className="rounded-full p-2 hover:bg-gray-100"
//                 aria-label="Đóng"
//               >
//                 <FiX />
//               </button>
//             </header>

//             <div className="overflow-y-auto p-6">
//               <div className="space-y-5">
//                 <input
//                   value={form.title}
//                   onChange={(event) =>
//                     setForm((current) => ({
//                       ...current,
//                       title: event.target.value,
//                     }))
//                   }
//                   placeholder="Tiêu đề bài viết"
//                   className={inputClass}
//                 />

//                 <div className="grid gap-4 sm:grid-cols-2">
//                   <div>
//                     <label className="mb-2 block text-sm font-semibold">
//                       Ngày đăng
//                     </label>

//                     <input
//                       type="date"
//                       value={form.date}
//                       onChange={(event) =>
//                         setForm((current) => ({
//                           ...current,
//                           date: event.target.value,
//                         }))
//                       }
//                       className={inputClass}
//                     />
//                   </div>

//                   <div>
//                     <label className="mb-2 block text-sm font-semibold">
//                       Giờ đăng
//                     </label>

//                     <input
//                       type="time"
//                       value={form.time}
//                       onChange={(event) =>
//                         setForm((current) => ({
//                           ...current,
//                           time: event.target.value,
//                         }))
//                       }
//                       className={inputClass}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="mb-2 block text-sm font-semibold">
//                     Ảnh đại diện
//                   </label>

//                   <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
//                     <label
//                       htmlFor="blog-cover"
//                       className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
//                     >
//                       <FiImage />

//                       {uploading ? "Đang tải..." : "Chọn tệp"}
//                     </label>

//                     <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
//                       {form.image
//                         ? "Đã chọn hình ảnh"
//                         : "Không có tệp nào được chọn"}
//                     </div>
//                   </div>

//                   <input
//                     id="blog-cover"
//                     type="file"
//                     accept="image/*"
//                     className="sr-only"
//                     disabled={uploading}
//                     onChange={handleCoverImage}
//                   />

//                   {form.image && (
//                     <div className="mt-4 flex h-24 w-36 items-center justify-center overflow-hidden rounded-lg bg-gray-50 p-2">
//                       <img
//                         src={form.image}
//                         alt="Xem trước ảnh đại diện"
//                         className="max-h-full max-w-full rounded-md object-contain"
//                       />
//                     </div>
//                   )}
//                 </div>

//                 <div className="overflow-hidden rounded-xl border border-gray-100">
//                   <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50 p-2">
//                     {toolbar.map(([command, icon, title]) => (
//                       <button
//                         key={command}
//                         type="button"
//                         onMouseDown={(event) => {
//                           event.preventDefault();

//                           saveEditorSelection();

//                           executeFormat(command);
//                         }}
//                         className="rounded-lg p-2.5 hover:bg-white"
//                         title={title}
//                         aria-label={title}
//                       >
//                         {icon}
//                       </button>
//                     ))}

//                     <select
//                       onMouseDown={saveEditorSelection}
//                       onChange={(event) =>
//                         executeFormat("formatBlock", event.target.value)
//                       }
//                       defaultValue=""
//                       className="rounded-lg border-0 bg-transparent px-2 text-sm outline-none"
//                       aria-label="Định dạng đoạn văn"
//                     >
//                       <option value="">Đoạn văn</option>
//                       <option value="h2">Tiêu đề H2</option>
//                       <option value="h3">Tiêu đề H3</option>
//                       <option value="p">Đoạn văn</option>
//                     </select>

//                     <button
//                       type="button"
//                       onMouseDown={(event) => {
//                         event.preventDefault();

//                         saveEditorSelection();

//                         createLink();
//                       }}
//                       className="rounded-lg p-2.5 hover:bg-white"
//                       title="Chèn liên kết"
//                       aria-label="Chèn liên kết"
//                     >
//                       <FiLink />
//                     </button>

//                     <label
//                       htmlFor="blog-inline-image"
//                       onMouseDown={saveEditorSelection}
//                       className="cursor-pointer rounded-lg p-2.5 hover:bg-white"
//                       title="Chèn hình ảnh"
//                       aria-label="Chèn hình ảnh"
//                     >
//                       <FiImage />
//                     </label>

//                     <input
//                       id="blog-inline-image"
//                       type="file"
//                       accept="image/*"
//                       className="sr-only"
//                       disabled={uploading}
//                       onChange={insertImage}
//                     />

//                     <button
//                       type="button"
//                       onMouseDown={(event) => {
//                         event.preventDefault();

//                         saveEditorSelection();

//                         executeFormat("removeFormat");
//                       }}
//                       className="rounded-lg px-3 py-2 text-xs font-semibold hover:bg-white"
//                     >
//                       Xóa định dạng
//                     </button>
//                   </div>

//                   <div
//                     ref={editorRef}
//                     contentEditable
//                     suppressContentEditableWarning
//                     onInput={handleEditorInput}
//                     onMouseUp={handleEditorSelection}
//                     onKeyUp={handleEditorSelection}
//                     onSelect={handleEditorSelection}
//                     className="blog-editor-content min-h-[320px] w-full overflow-x-hidden p-5 text-sm leading-7 text-gray-700 outline-none [&_a]:font-semibold [&_a]:text-pink-600 [&_div]:w-full [&_h2]:w-full [&_h3]:w-full [&_img]:mx-auto [&_img]:my-4 [&_img]:block [&_img]:max-h-[360px] [&_img]:max-w-[80%] [&_img]:rounded-lg [&_img]:border-0 [&_img]:shadow-none [&_p]:w-full"
//                     style={{
//                       whiteSpace: "pre-wrap",
//                     }}
//                   />
//                 </div>

//                 <div className="flex justify-end gap-3">
//                   <button
//                     type="button"
//                     onClick={closeEditor}
//                     className="rounded-lg border border-gray-200 px-5 py-2.5 font-semibold"
//                   >
//                     Hủy
//                   </button>

//                   <button
//                     type="button"
//                     onClick={savePost}
//                     disabled={uploading}
//                     className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
//                   >
//                     <FiSave />
//                     Lưu bài viết
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {confirmDelete && (
//         <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/35 p-4">
//           <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
//             <FiTrash2 className="mx-auto text-red-600" size={28} />

//             <h2 className="mt-3 text-lg font-bold">Xóa bài viết?</h2>

//             <p className="mt-2 text-sm text-gray-500">
//               Bạn có chắc muốn xóa bài viết này?
//             </p>

//             <div className="mt-5 flex justify-center gap-3">
//               <button
//                 type="button"
//                 onClick={() => setConfirmDelete(null)}
//                 className="rounded-lg border px-5 py-2.5 font-semibold"
//               >
//                 Hủy
//               </button>

//               <button
//                 type="button"
//                 onClick={executeDelete}
//                 className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white"
//               >
//                 Xóa
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// };

// export default AdminBlogManagementPage;

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
  FiX,
} from "react-icons/fi";

import {
  readSiteSettings,
  saveSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
  DEFAULT_BLOG_SHOP_INFO_HTML,
} from "@/services/siteSettings";

import { uploadImageFile } from "@/services/media";

import { useNotification } from "@/context/NotificationProvider";

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

const formatPostDate = (value) => {
  const raw = String(value || "").slice(0, 10);

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return raw || "—";
  }

  const [, year, month, day] = match;

  return `${day}/${month}/${year}`;
};

const buildDefaultShopInfo = (settings) => {
  const template =
    String(settings?.blog?.defaultShopInfoHtml || "").trim() ||
    DEFAULT_BLOG_SHOP_INFO_HTML;

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

const normalizeEditorContent = (content = "") => {
  const value = String(content || "");

  if (!value.trim()) {
    return "";
  }

  try {
    const parser = new DOMParser();

    const parsedDocument = parser.parseFromString(
      `<div id="flower-shop-editor-root">${value}</div>`,
      "text/html"
    );

    const root = parsedDocument.getElementById("flower-shop-editor-root");

    if (!root) {
      return value;
    }

    root
      .querySelectorAll('[data-flower-shop-default-info="true"]')
      .forEach((element) => {
        element.setAttribute("contenteditable", "false");
      });

    return root.innerHTML;
  } catch {
    return value;
  }
};

const hasDefaultShopInfo = (content = "") =>
  String(content || "").includes('data-flower-shop-default-info="true"');

const buildEditorContentWithDefault = (content, settings) => {
  const current = String(content || "").trim();

  if (hasDefaultShopInfo(current)) {
    return normalizeEditorContent(current);
  }

  const defaultInfo = normalizeEditorContent(buildDefaultShopInfo(settings));

  return `
    <p><br /></p>
    ${defaultInfo}
    <p><br /></p>
  `;
};

const ensureDefaultShopInfo = (content, settings) => {
  const current = String(content || "").trim();

  if (hasDefaultShopInfo(current)) {
    return normalizeEditorContent(current);
  }

  return buildEditorContentWithDefault(current, settings);
};

const LEGACY_DEFAULT_BLOG_SHOP_INFO_HTML = `
<h2>Về Flower Shop</h2>
<p>
  Flower Shop là cửa hàng hoa tươi chuyên cung cấp những sản phẩm hoa đẹp,
  được tuyển chọn và chăm sóc kỹ lưỡng cho nhiều dịp đặc biệt như sinh nhật,
  khai trương, cưới hỏi, chúc mừng, tri ân và các sự kiện quan trọng.
</p>
<p>
  {{siteName}} luôn hướng tới những sản phẩm hoa tươi chất lượng,
  cách trình bày tinh tế và dịch vụ hỗ trợ tận tâm.
</p>
<p>
  <strong>Thông tin liên hệ:</strong><br />
  Địa chỉ: {{address}}<br />
  Điện thoại: {{phone}}<br />
  Email: {{email}}<br />
  Thời gian làm việc: {{workingHours}}
</p>
<p>
  Bạn có thể tham khảo thêm các sản phẩm hoa tại
  <a href="/products">Danh mục sản phẩm</a>
  hoặc liên hệ với shop qua trang
  <a href="/contact">Liên hệ</a>.
</p>
`;

const normalizeHtmlForComparison = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

const isLegacyDefaultBlogShopInfo = (value) => {
  const normalized = normalizeHtmlForComparison(value);

  if (!normalized) {
    return true;
  }

  const legacyTemplate = normalizeHtmlForComparison(
    LEGACY_DEFAULT_BLOG_SHOP_INFO_HTML
  );

  if (normalized === legacyTemplate) {
    return true;
  }

  const isOldAdminBlogTemplate =
    normalized.includes('data-flower-shop-default-info="true"') &&
    normalized.includes("Hoa tươi tinh tế cho những khoảnh khắc đáng nhớ.") &&
    normalized.includes("Bạn có thể tham khảo thêm:") &&
    normalized.includes("Xem danh mục sản phẩm");

  if (isOldAdminBlogTemplate) {
    return true;
  }

  const isVeryOldSimpleTemplate =
    normalized.includes("<h2>Về Flower Shop</h2>") &&
    normalized.includes("Thông tin liên hệ") &&
    normalized.includes("Danh mục sản phẩm") &&
    normalized.includes("/contact");

  return isVeryOldSimpleTemplate;
};

const buildDefaultBlogShopInfoHtml = (template, settings) => {
  const branding = settings?.branding || {};

  const contact = settings?.contact || {};

  return String(template || "")
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

const migrateLegacyBlogPostContent = (content, renderedDefaultTemplate) => {
  const value = String(content || "").trim();

  if (!value) {
    return value;
  }

  if (isLegacyDefaultBlogShopInfo(value)) {
    return renderedDefaultTemplate;
  }

  if (!value.includes('data-flower-shop-default-info="true"')) {
    return value;
  }

  try {
    const parser = new DOMParser();

    const parsedDocument = parser.parseFromString(
      `<div id="flower-shop-migration-root">${value}</div>`,
      "text/html"
    );

    const root = parsedDocument.getElementById("flower-shop-migration-root");

    const defaultBlock = root?.querySelector(
      '[data-flower-shop-default-info="true"]'
    );

    if (
      !root ||
      !defaultBlock ||
      !isLegacyDefaultBlogShopInfo(defaultBlock.outerHTML)
    ) {
      return value;
    }

    defaultBlock.outerHTML = renderedDefaultTemplate;

    return root.innerHTML;
  } catch {
    return value;
  }
};

const migrateLegacyBlogPosts = (posts, renderedDefaultTemplate) => {
  if (!Array.isArray(posts)) {
    return [];
  }

  return posts.map((post) => {
    if (!post || typeof post !== "object") {
      return post;
    }

    const content = String(post.content || "");

    const migratedContent = migrateLegacyBlogPostContent(
      content,
      renderedDefaultTemplate
    );

    if (migratedContent === content) {
      return post;
    }

    return {
      ...post,
      content: migratedContent,
      updatedAt: new Date().toISOString(),
    };
  });
};

const AdminBlogManagementPage = () => {
  const [settings, setSettings] = useState(() => readSiteSettings());

  const [editorOpen, setEditorOpen] = useState(false);

  const [editingPost, setEditingPost] = useState(null);

  const [form, setForm] = useState(EMPTY_POST);

  const [confirmDelete, setConfirmDelete] = useState(null);

  const [uploading, setUploading] = useState(false);

  const editorRef = useRef(null);

  const selectionRef = useRef(null);

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

  /*
   * Chỉ đồng bộ DOM editor sau khi editor
   * thực sự đã được mount.
   *
   * Không đưa form.content vào dependency
   * để tránh reset caret khi người dùng gõ.
   */
  useEffect(() => {
    if (!editorOpen) {
      return;
    }

    const editor = editorRef.current;

    if (!editor || !editor.isConnected) {
      return;
    }

    const normalizedContent = editingPost
      ? normalizeEditorContent(form.content || "")
      : buildEditorContentWithDefault(form.content, settings);

    editor.innerHTML = normalizedContent;

    if (!editingPost) {
      window.requestAnimationFrame(() => {
        const currentEditor = editorRef.current;

        if (!currentEditor || !currentEditor.isConnected) {
          return;
        }

        const firstEditableParagraph = currentEditor.querySelector(
          ':scope > p:not([contenteditable="false"])'
        );

        currentEditor.focus();

        const selection = window.getSelection();

        if (!selection) {
          return;
        }

        const range = document.createRange();

        if (firstEditableParagraph) {
          range.selectNodeContents(firstEditableParagraph);

          range.collapse(true);
        } else {
          range.selectNodeContents(currentEditor);

          range.collapse(true);
        }

        selection.removeAllRanges();

        selection.addRange(range);

        selectionRef.current = range.cloneRange();
      });
    }
  }, [editorOpen, editingPost]);

  const openCreate = () => {
    const latestSettings = readSiteSettings();

    setSettings(latestSettings);

    setEditingPost(null);

    setForm({
      ...EMPTY_POST,

      date: new Date().toISOString().slice(0, 10),

      time: new Date().toTimeString().slice(0, 5),

      content: buildEditorContentWithDefault("", latestSettings),
    });

    selectionRef.current = null;

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

    selectionRef.current = null;

    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);

    setEditingPost(null);

    selectionRef.current = null;

    setForm({
      ...EMPTY_POST,

      date: new Date().toISOString().slice(0, 10),

      time: new Date().toTimeString().slice(0, 5),
    });
  };

  const saveEditorSelection = () => {
    const editor = editorRef.current;

    const selection = window.getSelection();

    if (
      !editor ||
      !editor.isConnected ||
      !selection ||
      selection.rangeCount === 0
    ) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }

    const defaultBlock =
      range.commonAncestorContainer.nodeType === 1
        ? range.commonAncestorContainer.closest?.('[contenteditable="false"]')
        : range.commonAncestorContainer.parentElement?.closest?.(
            '[contenteditable="false"]'
          );

    if (defaultBlock) {
      return;
    }

    selectionRef.current = range.cloneRange();
  };

  const restoreEditorSelection = () => {
    const editor = editorRef.current;

    if (!editor || !editor.isConnected) {
      return false;
    }

    const selection = window.getSelection();

    if (!selection) {
      return false;
    }

    if (
      selectionRef.current &&
      editor.contains(selectionRef.current.commonAncestorContainer)
    ) {
      selection.removeAllRanges();

      selection.addRange(selectionRef.current);

      return true;
    }

    editor.focus();

    const range = document.createRange();

    range.selectNodeContents(editor);

    range.collapse(false);

    selection.removeAllRanges();

    selection.addRange(range);

    selectionRef.current = range.cloneRange();

    return true;
  };

  /*
   * FIX LỖI:
   * Cannot read properties of null
   * (reading 'innerHTML')
   *
   * Không đọc editorRef.current lần thứ hai
   * bên trong functional updater.
   */
  const syncEditorContent = () => {
    const editor = editorRef.current;

    if (!editor || !editor.isConnected) {
      return;
    }

    const content = editor.innerHTML || "";

    setForm((current) => ({
      ...current,
      content,
    }));
  };

  const executeFormat = (command, value = null) => {
    const editor = editorRef.current;

    if (!editor || !editor.isConnected) {
      return;
    }

    restoreEditorSelection();

    editor.focus();

    document.execCommand(command, false, value);

    syncEditorContent();

    saveEditorSelection();
  };

  const createLink = () => {
    saveEditorSelection();

    const url = window.prompt("Nhập liên kết:");

    if (!url) {
      return;
    }

    executeFormat("createLink", url);
  };

  const handleEditorInput = (event) => {
    if (!event.currentTarget || !event.currentTarget.isConnected) {
      return;
    }

    const content = event.currentTarget.innerHTML || "";

    setForm((current) => ({
      ...current,
      content,
    }));

    saveEditorSelection();
  };

  const handleEditorSelection = () => {
    saveEditorSelection();
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

    saveEditorSelection();

    setUploading(true);

    try {
      const image = await uploadImageFile(file, {
        folder: "flower-shop/blog/content",

        maxWidth: 1400,

        maxHeight: 1000,

        quality: 0.82,
      });

      const editor = editorRef.current;

      if (!editor || !editor.isConnected) {
        notifyError("Trình soạn thảo chưa sẵn sàng.");

        return;
      }

      editor.focus();

      restoreEditorSelection();

      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0) {
        notifyError("Không xác định được vị trí chèn ảnh.");

        return;
      }

      const range = selection.getRangeAt(0);

      if (!editor.contains(range.commonAncestorContainer)) {
        notifyError("Không xác định được vị trí chèn ảnh.");

        return;
      }

      const imageElement = document.createElement("img");

      imageElement.src = image;

      imageElement.alt = "Hình ảnh trong bài viết";

      imageElement.loading = "lazy";

      imageElement.decoding = "async";

      imageElement.style.display = "block";

      imageElement.style.maxWidth = "80%";

      imageElement.style.height = "auto";

      imageElement.style.margin = "16px auto";

      imageElement.style.borderRadius = "12px";

      range.deleteContents();

      range.insertNode(imageElement);

      range.setStartAfter(imageElement);

      range.collapse(true);

      selection.removeAllRanges();

      selection.addRange(range);

      selectionRef.current = range.cloneRange();

      syncEditorContent();

      notifySuccess("Đã chèn hình ảnh vào đúng vị trí đang chọn.");
    } catch (imageError) {
      notifyError(imageError?.message || "Không thể chèn hình ảnh.");
    } finally {
      setUploading(false);
    }
  };

  const savePost = () => {
    const title = form.title.trim();

    const editor = editorRef.current;

    let content = editor?.isConnected
      ? editor.innerHTML?.trim() || form.content.trim()
      : form.content.trim();

    if (!title) {
      notifyError("Vui lòng nhập tiêu đề bài viết.");

      return;
    }

    content = ensureDefaultShopInfo(content, settings);

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

  /*
   * Migrate dữ liệu template cũ khi đọc.
   *
   * Không ghi lại ngay localStorage.
   * Chỉ chuyển nội dung trong state để tránh
   * tự ý thay đổi dữ liệu nếu người dùng chưa lưu.
   */
  const renderedDefaultTemplate = buildDefaultBlogShopInfoHtml(
    settings?.blog?.defaultShopInfoHtml || DEFAULT_BLOG_SHOP_INFO_HTML,
    settings
  );

  const posts = migrateLegacyBlogPosts(
    Array.isArray(settings.blogPosts) ? settings.blogPosts : [],
    renderedDefaultTemplate
  );

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
                  {formatPostDate(post.date)} {post.time || "08:00"}
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
                        onMouseDown={(event) => {
                          event.preventDefault();

                          saveEditorSelection();

                          executeFormat(command);
                        }}
                        className="rounded-lg p-2.5 hover:bg-white"
                        title={title}
                        aria-label={title}
                      >
                        {icon}
                      </button>
                    ))}

                    <select
                      onMouseDown={saveEditorSelection}
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
                      onMouseDown={(event) => {
                        event.preventDefault();

                        saveEditorSelection();

                        createLink();
                      }}
                      className="rounded-lg p-2.5 hover:bg-white"
                      title="Chèn liên kết"
                      aria-label="Chèn liên kết"
                    >
                      <FiLink />
                    </button>

                    <label
                      htmlFor="blog-inline-image"
                      onMouseDown={saveEditorSelection}
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
                      onMouseDown={(event) => {
                        event.preventDefault();

                        saveEditorSelection();

                        executeFormat("removeFormat");
                      }}
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
                    onMouseUp={handleEditorSelection}
                    onKeyUp={handleEditorSelection}
                    onSelect={handleEditorSelection}
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
