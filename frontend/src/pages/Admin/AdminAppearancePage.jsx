// /*
// ============================================================
// FLOWER SHOP — ADMIN APPEARANCE PAGE
// ============================================================

// Mục đích:
// - Cho phép ADMIN chỉnh giao diện cơ bản của website.
// - Không sửa trực tiếp JSX/CSS.
// - Sử dụng ThemeProvider hiện tại của hệ thống.
// - Lưu cấu hình qua ThemeProvider/localStorage.
// - Không tạo thêm ThemeContext hoặc ThemeProvider thứ hai.

// Các thuộc tính:
// - Màu chủ đạo
// - Màu phụ
// - Màu chữ
// - Font chữ
// - Cỡ chữ cơ bản
// - Độ bo góc

// LƯU Ý:
// File này phải sử dụng:
//     @/context/ThemeProvider

// Không sử dụng:
//     @/context/ThemeContext
// ============================================================
// */

// import { useEffect, useState } from "react";
// import { FiRotateCcw, FiSave } from "react-icons/fi";

// import { useTheme } from "@/context/ThemeProvider";

// const FONT_OPTIONS = [
//   {
//     value: "Inter, system-ui, sans-serif",
//     label: "Inter / System UI",
//   },
//   {
//     value: "Arial, Helvetica, sans-serif",
//     label: "Arial",
//   },
//   {
//     value: "Georgia, serif",
//     label: "Georgia",
//   },
//   {
//     value: "Verdana, sans-serif",
//     label: "Verdana",
//   },
// ];

// const isValidHexColor = (value) =>
//   /^#[0-9A-Fa-f]{6}$/.test(String(value || ""));

// const AdminAppearancePage = () => {
//   const { theme, updateTheme, resetTheme } = useTheme();

//   const [draft, setDraft] = useState(theme);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     setDraft(theme);
//   }, [theme]);

//   const updateDraft = (field, value) => {
//     setDraft((current) => ({
//       ...current,
//       [field]: value,
//     }));

//     setMessage("");
//   };

//   const handleSave = () => {
//     if (
//       !isValidHexColor(draft.primaryColor) ||
//       !isValidHexColor(draft.secondaryColor) ||
//       !isValidHexColor(draft.textColor)
//     ) {
//       setMessage("Vui lòng nhập đúng mã màu HEX, ví dụ: #DB2777.");
//       return;
//     }

//     const fontSize = Number(draft.baseFontSize);
//     const radius = Number(draft.borderRadius);

//     if (fontSize < 12 || fontSize > 24) {
//       setMessage("Cỡ chữ phải nằm trong khoảng 12px đến 24px.");
//       return;
//     }

//     if (radius < 0 || radius > 32) {
//       setMessage("Độ bo góc phải nằm trong khoảng 0px đến 32px.");
//       return;
//     }

//     updateTheme({
//       primaryColor: draft.primaryColor,
//       secondaryColor: draft.secondaryColor,
//       textColor: draft.textColor,
//       fontFamily: draft.fontFamily,
//       baseFontSize: fontSize,
//       borderRadius: radius,
//     });

//     setMessage("Đã lưu giao diện thành công.");
//   };

//   const handleReset = () => {
//     resetTheme();
//     setMessage("Đã khôi phục giao diện mặc định.");
//   };

//   return (
//     <section className="min-h-screen bg-gray-50 py-10">
//       <div className="mx-auto max-w-6xl px-4">
//         {/* PAGE HEADER */}
//         <div className="mb-8">
//           <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
//             Tùy chỉnh giao diện
//           </h1>

//           <p className="mt-2 text-gray-500">
//             Quản trị viên có thể thay đổi các thiết lập giao diện cơ bản mà
//             không cần chỉnh sửa mã nguồn.
//           </p>
//         </div>

//         {/* MESSAGE */}
//         {message && (
//           <div
//             className={`mb-6 rounded-xl border p-4 text-sm ${
//               message.includes("thành công") || message.includes("mặc định")
//                 ? "border-green-200 bg-green-50 text-green-700"
//                 : "border-red-200 bg-red-50 text-red-700"
//             }`}
//           >
//             {message}
//           </div>
//         )}

//         <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
//           {/* SETTINGS */}
//           <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
//             <div className="space-y-7">
//               {/* PRIMARY COLOR */}
//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-gray-700">
//                   Màu chủ đạo
//                 </label>

//                 <div className="flex gap-3">
//                   <input
//                     type="color"
//                     value={
//                       isValidHexColor(draft.primaryColor)
//                         ? draft.primaryColor
//                         : "#DB2777"
//                     }
//                     onChange={(event) =>
//                       updateDraft("primaryColor", event.target.value)
//                     }
//                     className="h-12 w-14 cursor-pointer rounded-lg border p-1"
//                     aria-label="Chọn màu chủ đạo"
//                   />

//                   <input
//                     type="text"
//                     value={draft.primaryColor || ""}
//                     onChange={(event) =>
//                       updateDraft("primaryColor", event.target.value)
//                     }
//                     className="min-w-0 flex-1 rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-pink-500"
//                     placeholder="#DB2777"
//                   />
//                 </div>
//               </div>

//               {/* SECONDARY COLOR */}
//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-gray-700">
//                   Màu phụ
//                 </label>

//                 <div className="flex gap-3">
//                   <input
//                     type="color"
//                     value={
//                       isValidHexColor(draft.secondaryColor)
//                         ? draft.secondaryColor
//                         : "#FCE7F3"
//                     }
//                     onChange={(event) =>
//                       updateDraft("secondaryColor", event.target.value)
//                     }
//                     className="h-12 w-14 cursor-pointer rounded-lg border p-1"
//                     aria-label="Chọn màu phụ"
//                   />

//                   <input
//                     type="text"
//                     value={draft.secondaryColor || ""}
//                     onChange={(event) =>
//                       updateDraft("secondaryColor", event.target.value)
//                     }
//                     className="min-w-0 flex-1 rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-pink-500"
//                     placeholder="#FCE7F3"
//                   />
//                 </div>
//               </div>

//               {/* TEXT COLOR */}
//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-gray-700">
//                   Màu chữ
//                 </label>

//                 <div className="flex gap-3">
//                   <input
//                     type="color"
//                     value={
//                       isValidHexColor(draft.textColor)
//                         ? draft.textColor
//                         : "#1F2937"
//                     }
//                     onChange={(event) =>
//                       updateDraft("textColor", event.target.value)
//                     }
//                     className="h-12 w-14 cursor-pointer rounded-lg border p-1"
//                     aria-label="Chọn màu chữ"
//                   />

//                   <input
//                     type="text"
//                     value={draft.textColor || ""}
//                     onChange={(event) =>
//                       updateDraft("textColor", event.target.value)
//                     }
//                     className="min-w-0 flex-1 rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-pink-500"
//                     placeholder="#1F2937"
//                   />
//                 </div>
//               </div>

//               {/* FONT */}
//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-gray-700">
//                   Font chữ
//                 </label>

//                 <select
//                   value={draft.fontFamily || FONT_OPTIONS[0].value}
//                   onChange={(event) =>
//                     updateDraft("fontFamily", event.target.value)
//                   }
//                   className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-pink-500"
//                 >
//                   {FONT_OPTIONS.map((font) => (
//                     <option key={font.value} value={font.value}>
//                       {font.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* BASE FONT SIZE */}
//               <div>
//                 <div className="mb-2 flex items-center justify-between">
//                   <label className="text-sm font-semibold text-gray-700">
//                     Cỡ chữ cơ bản
//                   </label>

//                   <span className="text-sm font-medium text-pink-600">
//                     {draft.baseFontSize}px
//                   </span>
//                 </div>

//                 <input
//                   type="range"
//                   min="12"
//                   max="24"
//                   step="1"
//                   value={draft.baseFontSize}
//                   onChange={(event) =>
//                     updateDraft("baseFontSize", Number(event.target.value))
//                   }
//                   className="w-full"
//                 />
//               </div>

//               {/* BORDER RADIUS */}
//               <div>
//                 <div className="mb-2 flex items-center justify-between">
//                   <label className="text-sm font-semibold text-gray-700">
//                     Độ bo góc
//                   </label>

//                   <span className="text-sm font-medium text-pink-600">
//                     {draft.borderRadius}px
//                   </span>
//                 </div>

//                 <input
//                   type="range"
//                   min="0"
//                   max="32"
//                   step="1"
//                   value={draft.borderRadius}
//                   onChange={(event) =>
//                     updateDraft("borderRadius", Number(event.target.value))
//                   }
//                   className="w-full"
//                 />
//               </div>

//               {/* ACTIONS */}
//               <div className="flex flex-col gap-3 pt-2 sm:flex-row">
//                 <button
//                   type="button"
//                   onClick={handleSave}
//                   className="flex items-center justify-center gap-2 rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
//                 >
//                   <FiSave size={18} />
//                   Lưu giao diện
//                 </button>

//                 <button
//                   type="button"
//                   onClick={handleReset}
//                   className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
//                 >
//                   <FiRotateCcw size={18} />
//                   Khôi phục mặc định
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* PREVIEW */}
//           <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
//             <h2 className="font-bold text-gray-900">Xem trước giao diện</h2>

//             <div
//               className="mt-5 rounded-xl border border-gray-200 p-5"
//               style={{
//                 fontFamily: draft.fontFamily,
//                 fontSize: `${draft.baseFontSize}px`,
//                 color: draft.textColor,
//               }}
//             >
//               <div
//                 className="flex h-12 items-center justify-center font-semibold text-white"
//                 style={{
//                   backgroundColor: draft.primaryColor,
//                   borderRadius: `${draft.borderRadius}px`,
//                 }}
//               >
//                 Flower Shop
//               </div>

//               <h3 className="mt-5 text-xl font-bold">Hoa tươi mỗi ngày</h3>

//               <p className="mt-2 text-sm text-gray-500">
//                 Giao diện xem trước giúp Admin kiểm tra các thay đổi trước khi
//                 áp dụng.
//               </p>

//               <div className="mt-5 flex flex-wrap gap-3">
//                 <button
//                   type="button"
//                   className="px-5 py-2.5 text-sm font-semibold text-white"
//                   style={{
//                     backgroundColor: draft.primaryColor,
//                     borderRadius: `${draft.borderRadius}px`,
//                   }}
//                 >
//                   Xem sản phẩm
//                 </button>

//                 <button
//                   type="button"
//                   className="px-5 py-2.5 text-sm font-semibold"
//                   style={{
//                     backgroundColor: draft.secondaryColor,
//                     color: draft.primaryColor,
//                     borderRadius: `${draft.borderRadius}px`,
//                   }}
//                 >
//                   Xem thêm
//                 </button>
//               </div>
//             </div>

//             <p className="mt-5 text-xs leading-5 text-gray-500">
//               Thiết lập này chỉ điều chỉnh các thuộc tính giao diện cơ bản.
//               Không thay đổi logic tài khoản, đơn hàng hoặc sản phẩm.
//             </p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AdminAppearancePage;

/*
============================================================
FLOWER SHOP — ADMIN APPEARANCE / CONTENT
============================================================

ADMIN CÓ THỂ CHỈNH:

1. Giao diện:
   - Màu chủ đạo
   - Màu phụ
   - Màu chữ
   - Font
   - Cỡ chữ
   - Cỡ chữ Header
   - Bo góc

2. Hero:
   - Tiêu đề
   - Mô tả
   - Nút
   - Banner

3. Trang chủ:
   - Danh mục
   - Sản phẩm
   - Khách hàng tiêu biểu

4. Footer

5. Blog:
   - Thêm
   - Sửa
   - Xóa

6. Contact

Không sửa JSX/CSS để thay nội dung.
============================================================
*/

import { useEffect, useState } from "react";

import {
  FiEdit2,
  FiPlus,
  FiRotateCcw,
  FiSave,
  FiTrash2,
  FiUpload,
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

const isHex = (value) => /^#[0-9A-Fa-f]{6}$/.test(String(value || ""));

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

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

const AdminAppearancePage = () => {
  const { theme, updateTheme, resetTheme } = useTheme();

  const [settings, setSettings] = useState(() => readSiteSettings());

  const [draftTheme, setDraftTheme] = useState(theme);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

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

  const updateHero = (field, value) => {
    setSettings((current) => ({
      ...current,
      hero: {
        ...current.hero,
        [field]: value,
      },
    }));

    setMessage("");
    setError("");
  };

  const updateSections = (field, value) => {
    setSettings((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [field]: value,
      },
    }));

    setMessage("");
    setError("");
  };

  const updateContact = (field, value) => {
    setSettings((current) => ({
      ...current,
      contact: {
        ...current.contact,
        [field]: value,
      },
    }));

    setMessage("");
    setError("");
  };

  const updateFooter = (value) => {
    setSettings((current) => ({
      ...current,
      footer: {
        ...current.footer,
        copyright: value,
      },
    }));
  };

  const handleSave = () => {
    setError("");

    if (
      !isHex(draftTheme.primaryColor) ||
      !isHex(draftTheme.secondaryColor) ||
      !isHex(draftTheme.textColor)
    ) {
      setError("Mã màu phải có dạng #RRGGBB.");
      return;
    }

    if (
      Number(draftTheme.baseFontSize) < 12 ||
      Number(draftTheme.baseFontSize) > 24
    ) {
      setError("Cỡ chữ cơ bản phải từ 12px đến 24px.");
      return;
    }

    if (
      Number(draftTheme.headerFontSize) < 12 ||
      Number(draftTheme.headerFontSize) > 24
    ) {
      setError("Cỡ chữ Header phải từ 12px đến 24px.");
      return;
    }

    if (
      Number(draftTheme.borderRadius) < 0 ||
      Number(draftTheme.borderRadius) > 32
    ) {
      setError("Bo góc phải từ 0px đến 32px.");
      return;
    }

    updateTheme({
      primaryColor: draftTheme.primaryColor,
      secondaryColor: draftTheme.secondaryColor,
      textColor: draftTheme.textColor,
      fontFamily: draftTheme.fontFamily,
      baseFontSize: Number(draftTheme.baseFontSize),
      borderRadius: Number(draftTheme.borderRadius),
      headerFontSize: Number(draftTheme.headerFontSize),
    });

    try {
      saveSiteSettings(settings);

      setMessage("Đã lưu toàn bộ giao diện và nội dung website.");
    } catch {
      setError("Không thể lưu nội dung website.");
    }
  };

  const handleReset = () => {
    resetTheme();

    const restored = resetSiteSettings();

    setSettings(restored);

    setMessage("Đã khôi phục toàn bộ cấu hình mặc định.");

    setError("");
  };

  const openCreatePost = () => {
    setEditingPost(null);

    setPostForm({
      title: "",
      content: "",
      date: new Date().toISOString().slice(0, 10),
      image: "",
    });
  };

  const openEditPost = (post) => {
    setEditingPost(post);

    setPostForm({
      title: post.title || "",
      content: post.content || "",
      date: post.date || "",
      image: post.image || "",
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

    const newPost = {
      id: editingPost?.id || `post-${Date.now()}`,
      title: postForm.title.trim(),
      content: postForm.content.trim(),
      date: postForm.date,
      image: postForm.image,
    };

    const posts = editingPost
      ? settings.blogPosts.map((post) =>
          String(post.id) === String(editingPost.id) ? newPost : post
        )
      : [...settings.blogPosts, newPost];

    setSettings((current) => ({
      ...current,
      blogPosts: posts,
    }));

    setEditingPost(null);

    setPostForm({
      title: "",
      content: "",
      date: "",
      image: "",
    });

    setMessage(editingPost ? "Đã cập nhật bài viết." : "Đã thêm bài viết.");

    setError("");
  };

  const deletePost = (post) => {
    if (!window.confirm(`Bạn có chắc muốn xóa "${post.title}"?`)) {
      return;
    }

    setSettings((current) => ({
      ...current,
      blogPosts: current.blogPosts.filter(
        (item) => String(item.id) !== String(post.id)
      ),
    }));

    setMessage("Đã xóa bài viết.");
  };

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
          {/* GIAO DIỆN CƠ BẢN */}
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
                      className="h-12 w-14 rounded-lg border p-1"
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
                  Cỡ chữ cơ bản: {draftTheme.baseFontSize}px
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
                  Cỡ chữ Header: {draftTheme.headerFontSize}px
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
                  Bo góc: {draftTheme.borderRadius}px
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

          {/* HERO */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">2. Banner / Hero trang chủ</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                className={inputClass}
                value={settings.hero.eyebrow}
                onChange={(event) => updateHero("eyebrow", event.target.value)}
                placeholder="Dòng nhỏ"
              />

              <input
                className={inputClass}
                value={settings.hero.titleBefore}
                onChange={(event) =>
                  updateHero("titleBefore", event.target.value)
                }
                placeholder="Tiêu đề trước"
              />

              <input
                className={inputClass}
                value={settings.hero.titleHighlight}
                onChange={(event) =>
                  updateHero("titleHighlight", event.target.value)
                }
                placeholder="Tiêu đề nổi bật"
              />

              <input
                className={inputClass}
                value={settings.hero.primaryButtonText}
                onChange={(event) =>
                  updateHero("primaryButtonText", event.target.value)
                }
                placeholder="Nút chính"
              />

              <input
                className={inputClass}
                value={settings.hero.secondaryButtonText}
                onChange={(event) =>
                  updateHero("secondaryButtonText", event.target.value)
                }
                placeholder="Nút phụ"
              />

              <textarea
                rows="3"
                className={inputClass}
                value={settings.hero.description}
                onChange={(event) =>
                  updateHero("description", event.target.value)
                }
                placeholder="Mô tả"
              />

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Banner
                </label>

                <input
                  type="file"
                  accept="image/*"
                  className="block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-pink-600 file:px-4 file:py-2 file:text-white"
                  onChange={(event) =>
                    readImage(
                      event.target.files?.[0],
                      (image) => updateHero("bannerImage", image),
                      setError
                    )
                  }
                />

                {settings.hero.bannerImage && (
                  <img
                    src={settings.hero.bannerImage}
                    alt="Banner"
                    className="mt-3 h-32 w-full rounded-xl object-cover"
                  />
                )}
              </div>
            </div>
          </section>

          {/* HOME CONTENT */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">3. Nội dung trang chủ</h2>

            <div className="mt-5 grid gap-4">
              <input
                className={inputClass}
                value={settings.sections.categoriesTitle}
                onChange={(event) =>
                  updateSections("categoriesTitle", event.target.value)
                }
                placeholder="Danh mục nổi bật"
              />

              <input
                className={inputClass}
                value={settings.sections.categoriesSubtitle}
                onChange={(event) =>
                  updateSections("categoriesSubtitle", event.target.value)
                }
                placeholder="Mô tả danh mục"
              />

              <input
                className={inputClass}
                value={settings.sections.featuredTitle}
                onChange={(event) =>
                  updateSections("featuredTitle", event.target.value)
                }
                placeholder="Sản phẩm nổi bật"
              />

              <input
                className={inputClass}
                value={settings.sections.featuredSubtitle}
                onChange={(event) =>
                  updateSections("featuredSubtitle", event.target.value)
                }
                placeholder="Mô tả sản phẩm"
              />

              <input
                className={inputClass}
                value={settings.sections.customerTitle}
                onChange={(event) =>
                  updateSections("customerTitle", event.target.value)
                }
                placeholder="KHÁCH HÀNG TIÊU BIỂU"
              />
            </div>
          </section>

          {/* FOOTER */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">4. Footer</h2>

            <textarea
              rows="2"
              className={`${inputClass} mt-4`}
              value={settings.footer.copyright}
              onChange={(event) => updateFooter(event.target.value)}
            />
          </section>

          {/* CONTACT */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">5. Liên hệ</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ["title", "Tiêu đề"],
                ["phone", "Điện thoại"],
                ["email", "Email"],
                ["address", "Địa chỉ"],
                ["workingHours", "Thời gian làm việc"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="mb-2 block text-sm font-semibold">
                    {label}
                  </label>

                  <input
                    className={inputClass}
                    value={settings.contact[field] || ""}
                    onChange={(event) =>
                      updateContact(field, event.target.value)
                    }
                  />
                </div>
              ))}

              <textarea
                rows="3"
                className={inputClass}
                value={settings.contact.description}
                onChange={(event) =>
                  updateContact("description", event.target.value)
                }
                placeholder="Mô tả"
              />
            </div>
          </section>

          {/* BLOG */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">6. Bài viết</h2>

              <button
                type="button"
                onClick={openCreatePost}
                className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700"
              >
                <FiPlus />
                Thêm bài viết
              </button>
            </div>

            {editingPost !== null || postForm.title ? (
              <div className="mt-5 rounded-xl border border-pink-100 bg-pink-50 p-5">
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
                  className={`${inputClass} mt-3`}
                  type="date"
                  value={postForm.date}
                  onChange={(event) =>
                    setPostForm((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                />

                <textarea
                  rows="5"
                  className={`${inputClass} mt-3`}
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
                  className="mt-3 block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-pink-600 file:px-4 file:py-2 file:text-white"
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

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={savePost}
                    className="rounded-lg bg-pink-600 px-5 py-2 font-semibold text-white"
                  >
                    <FiSave className="mr-2 inline" />
                    Lưu
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPost(null);
                      setPostForm({
                        title: "",
                        content: "",
                        date: "",
                        image: "",
                      });
                    }}
                    className="rounded-lg border px-5 py-2"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-5 space-y-3">
              {settings.blogPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between gap-4 rounded-xl border p-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{post.title}</p>

                    <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openEditPost(post)}
                      className="rounded-lg border p-2 text-blue-600"
                      title="Sửa"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePost(post)}
                      className="rounded-lg border p-2 text-red-600"
                      title="Xóa"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SAVE */}
          <section className="sticky bottom-4 z-30 rounded-2xl border border-pink-100 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleSave}
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
