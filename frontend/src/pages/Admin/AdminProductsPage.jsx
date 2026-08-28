// /*
// ============================================================
// FLOWER SHOP — ADMIN PRODUCTS
// ============================================================

// PHIÊN BẢN:
// - Quản lý sản phẩm tập trung qua catalog.js.
// - Không đọc localStorage trực tiếp.
// - Hiển thị tối đa 20 sản phẩm/trang.
// - Có phân trang.
// - Tìm kiếm sản phẩm.
// - Khu vực "Danh mục sản phẩm" có thể thu gọn.
// - Khu vực "Thêm sản phẩm" có thể thu gọn.
// - CRUD danh mục:
//     + Thêm
//     + Sửa
//     + Xóa
//     + Tóm tắt
//     + Hình ảnh
//     + Trạng thái
// - Chỉnh sửa danh mục bằng Modal riêng.
// - Chỉnh sửa sản phẩm bằng Modal riêng.
// - Đồng bộ với toàn bộ website thông qua catalog.js.
// ============================================================
// */

// import { useEffect, useMemo, useState } from "react";

// import {
//   FiChevronDown,
//   FiChevronLeft,
//   FiChevronRight,
//   FiEdit2,
//   FiEye,
//   FiImage,
//   FiPlus,
//   FiSearch,
//   FiTag,
//   FiTrash2,
//   FiX,
// } from "react-icons/fi";

// import { Link } from "react-router-dom";

// import {
//   CATEGORY_UPDATED_EVENT,
//   readProductCategories,
//   saveProductCategories,
//   slugifyCategory,
// } from "@/constants/productCategories";

// import {
//   PRODUCT_UPDATED_EVENT,
//   readProducts,
//   saveProducts,
// } from "@/services/catalog";

// const PRODUCTS_PER_PAGE = 20;

// const EMPTY_PRODUCT_FORM = {
//   name: "",
//   price: "",
//   oldPrice: "",
//   badge: "",
//   category: "",
//   description: "",
//   image: "",
// };

// const EMPTY_CATEGORY_FORM = {
//   name: "",
//   summary: "",
//   image: "",
//   active: true,
// };

// const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

// const AdminProductsPage = () => {
//   /*
//   ==========================================================
//   DATA
//   ==========================================================
//   */

//   const [products, setProducts] = useState(() => readProducts());

//   const [categories, setCategories] = useState(() => readProductCategories());

//   /*
//   ==========================================================
//   UI STATE
//   ==========================================================
//   */

//   const [keyword, setKeyword] = useState("");

//   const [currentPage, setCurrentPage] = useState(1);

//   const [showCategories, setShowCategories] = useState(false);

//   const [showCreateProduct, setShowCreateProduct] = useState(false);

//   const [showCategoryModal, setShowCategoryModal] = useState(false);

//   const [editingCategory, setEditingCategory] = useState(null);

//   const [showProductModal, setShowProductModal] = useState(false);

//   const [editingProduct, setEditingProduct] = useState(null);

//   /*
//   ==========================================================
//   FORM STATE
//   ==========================================================
//   */

//   const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);

//   const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);

//   /*
//   ==========================================================
//   MESSAGE
//   ==========================================================
//   */

//   const [message, setMessage] = useState("");

//   const [error, setError] = useState("");

//   /*
//   ==========================================================
//   REFRESH DATA
//   ==========================================================
//   */

//   useEffect(() => {
//     const refreshProducts = () => {
//       setProducts(readProducts());
//     };

//     const refreshCategories = () => {
//       setCategories(readProductCategories());
//     };

//     window.addEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

//     window.addEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

//     return () => {
//       window.removeEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

//       window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);
//     };
//   }, []);

//   /*
//   ==========================================================
//   FILTER
//   ==========================================================
//   */

//   const filteredProducts = useMemo(() => {
//     const query = keyword.trim().toLowerCase();

//     if (!query) {
//       return products;
//     }

//     return products.filter((product) =>
//       [product.name, product.category, product.badge, product.description]
//         .filter(Boolean)
//         .join(" ")
//         .toLowerCase()
//         .includes(query)
//     );
//   }, [keyword, products]);

//   /*
//   ==========================================================
//   PAGINATION
//   ==========================================================
//   */

//   const totalProducts = filteredProducts.length;

//   const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));

//   const safePage = Math.min(currentPage, totalPages);

//   const startIndex =
//     totalProducts === 0 ? 0 : (safePage - 1) * PRODUCTS_PER_PAGE;

//   const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);

//   const visibleProducts = filteredProducts.slice(startIndex, endIndex);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [keyword]);

//   /*
//   ==========================================================
//   PRODUCT FORM
//   ==========================================================
//   */

//   const handleProductChange = (event) => {
//     const { name, value } = event.target;

//     setProductForm((current) => ({
//       ...current,
//       [name]: value,
//     }));

//     setMessage("");
//     setError("");
//   };

//   /*
//   ==========================================================
//   IMAGE
//   ==========================================================
//   */

//   const readImageFile = (event, setter) => {
//     const file = event.target.files?.[0];

//     if (!file) {
//       return;
//     }

//     if (!file.type.startsWith("image/")) {
//       setError("Vui lòng chọn đúng file hình ảnh.");
//       return;
//     }

//     if (file.size > 2 * 1024 * 1024) {
//       setError("Hình ảnh không được vượt quá 2MB.");
//       return;
//     }

//     const reader = new FileReader();

//     reader.onload = () => {
//       setter(String(reader.result || ""));
//     };

//     reader.readAsDataURL(file);
//   };

//   /*
//   ==========================================================
//   CREATE PRODUCT
//   ==========================================================
//   */

//   const handleCreateProduct = (event) => {
//     event.preventDefault();

//     setMessage("");
//     setError("");

//     const name = productForm.name.trim();

//     const price = Number(productForm.price);

//     if (!name) {
//       setError("Vui lòng nhập tên sản phẩm.");
//       return;
//     }

//     if (!Number.isFinite(price) || price <= 0) {
//       setError("Giá sản phẩm phải lớn hơn 0.");
//       return;
//     }

//     if (!productForm.category) {
//       setError("Vui lòng chọn danh mục.");
//       return;
//     }

//     const newProduct = {
//       id: `product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,

//       name,

//       price,

//       oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : null,

//       badge: productForm.badge.trim(),

//       category: productForm.category,

//       description: productForm.description.trim(),

//       image: productForm.image || "",

//       salesCount: 0,

//       isNew: true,

//       createdAt: new Date().toISOString(),
//     };

//     try {
//       saveProducts([...products, newProduct]);

//       setProducts(readProducts());

//       setProductForm(EMPTY_PRODUCT_FORM);

//       setShowCreateProduct(false);

//       setMessage("Đã thêm sản phẩm thành công.");
//     } catch (storageError) {
//       console.error(storageError);

//       setError("Không thể lưu sản phẩm.");
//     }
//   };

//   /*
//   ==========================================================
//   EDIT PRODUCT
//   ==========================================================
//   */

//   const openProductEdit = (product) => {
//     setEditingProduct(product);

//     setProductForm({
//       name: product.name || "",

//       price: product.price ?? "",

//       oldPrice: product.oldPrice ?? "",

//       badge: product.badge || "",

//       category: product.category || "",

//       description: product.description || "",

//       image: product.image || "",
//     });

//     setShowProductModal(true);

//     setMessage("");
//     setError("");
//   };

//   const closeProductModal = () => {
//     setShowProductModal(false);

//     setEditingProduct(null);

//     setProductForm(EMPTY_PRODUCT_FORM);
//   };

//   const handleUpdateProduct = (event) => {
//     event.preventDefault();

//     setMessage("");
//     setError("");

//     if (!editingProduct) {
//       return;
//     }

//     const name = productForm.name.trim();

//     const price = Number(productForm.price);

//     if (!name) {
//       setError("Vui lòng nhập tên sản phẩm.");
//       return;
//     }

//     if (!Number.isFinite(price) || price <= 0) {
//       setError("Giá sản phẩm phải lớn hơn 0.");
//       return;
//     }

//     if (!productForm.category) {
//       setError("Vui lòng chọn danh mục.");
//       return;
//     }

//     const updatedProducts = products.map((product) =>
//       String(product.id) === String(editingProduct.id)
//         ? {
//             ...product,

//             name,

//             price,

//             oldPrice: productForm.oldPrice
//               ? Number(productForm.oldPrice)
//               : null,

//             badge: productForm.badge.trim(),

//             category: productForm.category,

//             description: productForm.description.trim(),

//             image: productForm.image || product.image || "",
//           }
//         : product
//     );

//     saveProducts(updatedProducts);

//     setProducts(readProducts());

//     closeProductModal();

//     setMessage("Đã cập nhật sản phẩm thành công.");
//   };

//   /*
//   ==========================================================
//   DELETE PRODUCT
//   ==========================================================
//   */

//   const handleDeleteProduct = (product) => {
//     const confirmed = window.confirm(
//       `Bạn có chắc muốn xóa sản phẩm "${product.name}"?`
//     );

//     if (!confirmed) {
//       return;
//     }

//     const updatedProducts = products.filter(
//       (item) => String(item.id) !== String(product.id)
//     );

//     saveProducts(updatedProducts);

//     setProducts(readProducts());

//     const newTotalPages = Math.max(
//       1,
//       Math.ceil(updatedProducts.length / PRODUCTS_PER_PAGE)
//     );

//     if (currentPage > newTotalPages) {
//       setCurrentPage(newTotalPages);
//     }

//     setMessage("Đã xóa sản phẩm.");
//   };

//   /*
//   ==========================================================
//   CATEGORY
//   ==========================================================
//   */

//   const openCreateCategory = () => {
//     setEditingCategory(null);

//     setCategoryForm(EMPTY_CATEGORY_FORM);

//     setShowCategoryModal(true);

//     setMessage("");
//     setError("");
//   };

//   const openEditCategory = (category) => {
//     setEditingCategory(category);

//     setCategoryForm({
//       name: category.name || category.label || "",

//       summary: category.summary || "",

//       image: category.image || "",

//       active: category.active !== false,
//     });

//     setShowCategoryModal(true);

//     setMessage("");
//     setError("");
//   };

//   const closeCategoryModal = () => {
//     setShowCategoryModal(false);

//     setEditingCategory(null);

//     setCategoryForm(EMPTY_CATEGORY_FORM);
//   };

//   const handleCategoryChange = (event) => {
//     const { name, value, type, checked } = event.target;

//     setCategoryForm((current) => ({
//       ...current,
//       [name]: type === "checkbox" ? checked : value,
//     }));

//     setMessage("");
//     setError("");
//   };

//   const handleSaveCategory = (event) => {
//     event.preventDefault();

//     setMessage("");
//     setError("");

//     const name = categoryForm.name.trim();

//     if (!name) {
//       setError("Vui lòng nhập tên danh mục.");
//       return;
//     }

//     const slug = slugifyCategory(name);

//     if (!slug) {
//       setError("Tên danh mục không hợp lệ.");
//       return;
//     }

//     const duplicate = categories.some(
//       (category) =>
//         category.slug === slug &&
//         String(category.id) !== String(editingCategory?.id)
//     );

//     if (duplicate) {
//       setError("Danh mục này đã tồn tại.");
//       return;
//     }

//     if (editingCategory) {
//       const updatedCategories = categories.map((category) => {
//         if (String(category.id) !== String(editingCategory.id)) {
//           return category;
//         }

//         return {
//           ...category,

//           id: category.id,

//           name,

//           slug,

//           label: name,

//           query: slug,

//           summary: categoryForm.summary.trim(),

//           image: categoryForm.image || category.image || "",

//           active: categoryForm.active,

//           sortOrder: category.sortOrder,
//         };
//       });

//       saveProductCategories(updatedCategories);

//       setCategories(readProductCategories());

//       closeCategoryModal();

//       setMessage("Đã cập nhật danh mục thành công.");

//       return;
//     }

//     const newCategory = {
//       id: slug,

//       name,

//       slug,

//       label: name,

//       query: slug,

//       summary: categoryForm.summary.trim(),

//       image: categoryForm.image || "",

//       active: categoryForm.active,

//       sortOrder: categories.length + 1,
//     };

//     const updatedCategories = [...categories, newCategory];

//     saveProductCategories(updatedCategories);

//     setCategories(readProductCategories());

//     closeCategoryModal();

//     setMessage("Đã thêm danh mục thành công.");
//   };

//   /*
//   ==========================================================
//   DELETE CATEGORY
//   ==========================================================
//   */

//   const handleDeleteCategory = (category) => {
//     const productCount = products.filter(
//       (product) => product.category === category.slug
//     ).length;

//     if (productCount > 0) {
//       setError(
//         `Không thể xóa danh mục "${category.name}" vì đang có ${productCount} sản phẩm sử dụng danh mục này. Hãy chuyển sản phẩm sang danh mục khác trước.`
//       );

//       return;
//     }

//     const confirmed = window.confirm(
//       `Bạn có chắc muốn xóa danh mục "${category.name}"?`
//     );

//     if (!confirmed) {
//       return;
//     }

//     const updatedCategories = categories
//       .filter((item) => String(item.id) !== String(category.id))
//       .map((item, index) => ({
//         ...item,
//         sortOrder: index + 1,
//       }));

//     saveProductCategories(updatedCategories);

//     setCategories(readProductCategories());

//     setMessage("Đã xóa danh mục.");
//   };

//   /*
//   ==========================================================
//   CATEGORY IMAGE
//   ==========================================================
//   */

//   const handleCategoryImage = (event) => {
//     readImageFile(event, (image) =>
//       setCategoryForm((current) => ({
//         ...current,
//         image,
//       }))
//     );
//   };

//   /*
//   ==========================================================
//   PRODUCT IMAGE
//   ==========================================================
//   */

//   const handleProductImage = (event) => {
//     readImageFile(event, (image) =>
//       setProductForm((current) => ({
//         ...current,
//         image,
//       }))
//     );
//   };

//   /*
//   ==========================================================
//   PAGINATION BUTTONS
//   ==========================================================
//   */

//   const goToPage = (page) => {
//     if (page < 1 || page > totalPages) {
//       return;
//     }

//     setCurrentPage(page);

//     window.scrollTo({
//       top: 0,
//       behavior: "smooth",
//     });
//   };

//   /*
//   ==========================================================
//   RENDER
//   ==========================================================
//   */

//   return (
//     <section className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4">
//         {/* PAGE HEADER */}

//         <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-7">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
//               Quản lý sản phẩm
//             </h1>

//             <p className="mt-2 text-gray-500">
//               Quản lý sản phẩm và danh mục tập trung.
//             </p>
//           </div>

//           <div className="relative w-full lg:w-80">
//             <FiSearch
//               className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
//               size={18}
//             />

//             <input
//               value={keyword}
//               onChange={(event) => {
//                 setKeyword(event.target.value);
//                 setCurrentPage(1);
//               }}
//               placeholder="Tìm sản phẩm..."
//               className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
//             />
//           </div>
//         </div>

//         {/* MESSAGE */}

//         {message && (
//           <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-green-700">
//             {message}
//           </div>
//         )}

//         {error && (
//           <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-700">
//             {error}
//           </div>
//         )}

//         {/* =================================================
//              CATEGORY SECTION
//         ================================================= */}

//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
//           <button
//             type="button"
//             onClick={() => setShowCategories((current) => !current)}
//             className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition"
//           >
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
//                 <FiTag />
//               </div>

//               <div>
//                 <h2 className="font-bold text-gray-800">Danh mục sản phẩm</h2>

//                 <p className="text-sm text-gray-500">
//                   {categories.length} danh mục
//                 </p>
//               </div>
//             </div>

//             <FiChevronDown
//               className={`transition-transform ${
//                 showCategories ? "rotate-180" : ""
//               }`}
//             />
//           </button>

//           {showCategories && (
//             <div className="border-t border-gray-100 p-6">
//               <div className="flex justify-end mb-5">
//                 <button
//                   type="button"
//                   onClick={openCreateCategory}
//                   className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700"
//                 >
//                   <FiPlus />
//                   Thêm danh mục
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//                 {categories.map((category) => (
//                   <div
//                     key={category.id}
//                     className="border border-gray-100 rounded-xl overflow-hidden"
//                   >
//                     <div className="aspect-[16/9] bg-pink-50">
//                       {category.image ? (
//                         <img
//                           src={category.image}
//                           alt={category.name}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <div className="h-full flex items-center justify-center text-sm text-gray-400">
//                           Chưa có hình ảnh
//                         </div>
//                       )}
//                     </div>

//                     <div className="p-4">
//                       <div className="flex items-start justify-between gap-3">
//                         <div>
//                           <h3 className="font-semibold text-gray-800">
//                             {category.name}
//                           </h3>

//                           <span
//                             className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
//                               category.active
//                                 ? "bg-green-50 text-green-700"
//                                 : "bg-gray-100 text-gray-500"
//                             }`}
//                           >
//                             {category.active ? "Đang hiển thị" : "Đang ẩn"}
//                           </span>
//                         </div>

//                         <span className="text-xs text-gray-400">
//                           #{category.sortOrder}
//                         </span>
//                       </div>

//                       {category.summary && (
//                         <p className="mt-3 text-sm text-gray-500 line-clamp-2">
//                           {category.summary}
//                         </p>
//                       )}

//                       <div className="flex gap-2 mt-4">
//                         <button
//                           type="button"
//                           onClick={() => openEditCategory(category)}
//                           className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-700 hover:border-pink-300 hover:text-pink-600"
//                         >
//                           <FiEdit2 />
//                           Sửa
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() => handleDeleteCategory(category)}
//                           className="w-11 inline-flex items-center justify-center border border-red-100 rounded-lg text-red-500 hover:bg-red-50"
//                           title="Xóa danh mục"
//                         >
//                           <FiTrash2 />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* =================================================
//              CREATE PRODUCT
//         ================================================= */}

//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
//           <button
//             type="button"
//             onClick={() => setShowCreateProduct((current) => !current)}
//             className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition"
//           >
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
//                 <FiPlus />
//               </div>

//               <div>
//                 <h2 className="font-bold text-gray-800">Thêm sản phẩm mới</h2>

//                 <p className="text-sm text-gray-500">
//                   Chỉ mở biểu mẫu khi cần thêm sản phẩm.
//                 </p>
//               </div>
//             </div>

//             <FiChevronDown
//               className={`transition-transform ${
//                 showCreateProduct ? "rotate-180" : ""
//               }`}
//             />
//           </button>

//           {showCreateProduct && (
//             <form
//               onSubmit={handleCreateProduct}
//               className="border-t border-gray-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-5"
//             >
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Tên sản phẩm *
//                 </label>

//                 <input
//                   name="name"
//                   value={productForm.name}
//                   onChange={handleProductChange}
//                   required
//                   className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Danh mục *
//                 </label>

//                 <select
//                   name="category"
//                   value={productForm.category}
//                   onChange={handleProductChange}
//                   required
//                   className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white outline-none focus:border-pink-400"
//                 >
//                   <option value="">-- Chọn danh mục --</option>

//                   {categories
//                     .filter((category) => category.active !== false)
//                     .map((category) => (
//                       <option key={category.id} value={category.slug}>
//                         {category.name}
//                       </option>
//                     ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Giá bán *
//                 </label>

//                 <input
//                   name="price"
//                   type="number"
//                   min="1"
//                   value={productForm.price}
//                   onChange={handleProductChange}
//                   required
//                   className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Giá cũ
//                 </label>

//                 <input
//                   name="oldPrice"
//                   type="number"
//                   min="0"
//                   value={productForm.oldPrice}
//                   onChange={handleProductChange}
//                   className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Nhãn sản phẩm
//                 </label>

//                 <input
//                   name="badge"
//                   value={productForm.badge}
//                   onChange={handleProductChange}
//                   placeholder="Ví dụ: Mới, Bán chạy..."
//                   className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Hình ảnh
//                 </label>

//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleProductImage}
//                   className="w-full text-sm"
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 {productForm.image && (
//                   <div className="mb-4 w-32 h-32 rounded-xl overflow-hidden border">
//                     <img
//                       src={productForm.image}
//                       alt="Preview"
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                 )}

//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Mô tả sản phẩm
//                 </label>

//                 <textarea
//                   name="description"
//                   value={productForm.description}
//                   onChange={handleProductChange}
//                   rows={4}
//                   className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 resize-none"
//                 />
//               </div>

//               <div className="md:col-span-2 flex justify-end gap-3">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowCreateProduct(false);

//                     setProductForm(EMPTY_PRODUCT_FORM);
//                   }}
//                   className="px-5 py-3 rounded-lg border border-gray-200 text-gray-700"
//                 >
//                   Hủy
//                 </button>

//                 <button
//                   type="submit"
//                   className="px-5 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700"
//                 >
//                   Thêm sản phẩm
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>

//         {/* =================================================
//              PRODUCT LIST
//         ================================================= */}

//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//           <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//             <div>
//               <h2 className="font-bold text-gray-800">Danh sách sản phẩm</h2>

//               <p className="text-sm text-gray-500 mt-1">
//                 {totalProducts > 0
//                   ? `Hiển thị ${startIndex + 1}-${endIndex} / ${totalProducts} sản phẩm`
//                   : "Không có sản phẩm"}
//               </p>
//             </div>

//             {/* <div className="text-sm text-gray-500">20 sản phẩm / trang</div> */}
//           </div>

//           {visibleProducts.length === 0 ? (
//             <div className="py-16 text-center text-gray-500">
//               Không tìm thấy sản phẩm phù hợp.
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-100">
//               {visibleProducts.map((product) => (
//                 <div
//                   key={product.id}
//                   className="p-5 flex flex-col md:flex-row md:items-center gap-4"
//                 >
//                   <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
//                     {product.image ? (
//                       <img
//                         src={product.image}
//                         alt={product.name}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center text-gray-400">
//                         <FiImage />
//                       </div>
//                     )}
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <div className="flex flex-wrap items-center gap-2">
//                       <h3 className="font-semibold text-gray-800">
//                         {product.name}
//                       </h3>

//                       {product.badge && (
//                         <span className="text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-600">
//                           {product.badge}
//                         </span>
//                       )}
//                     </div>

//                     <p className="text-sm text-gray-500 mt-1">
//                       Danh mục:{" "}
//                       {categories.find(
//                         (category) => category.slug === product.category
//                       )?.name ||
//                         product.category ||
//                         "Chưa phân loại"}
//                     </p>

//                     <div className="mt-2 flex items-center gap-2">
//                       <span className="font-bold text-pink-600">
//                         {money(product.price)}
//                       </span>

//                       {product.oldPrice && (
//                         <span className="text-sm text-gray-400 line-through">
//                           {money(product.oldPrice)}
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex gap-2">
//                     <Link
//                       to={`/products/${product.id}`}
//                       className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-pink-600 hover:border-pink-300"
//                       title="Xem sản phẩm"
//                     >
//                       <FiEye />
//                     </Link>

//                     <button
//                       type="button"
//                       onClick={() => openProductEdit(product)}
//                       className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-pink-600 hover:border-pink-300"
//                       title="Sửa sản phẩm"
//                     >
//                       <FiEdit2 />
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() => handleDeleteProduct(product)}
//                       className="w-10 h-10 rounded-lg border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50"
//                       title="Xóa sản phẩm"
//                     >
//                       <FiTrash2 />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* PAGINATION */}

//           {totalPages > 1 && (
//             <div className="border-t border-gray-100 px-6 py-5 flex items-center justify-center gap-2 flex-wrap">
//               <button
//                 type="button"
//                 disabled={safePage === 1}
//                 onClick={() => goToPage(safePage - 1)}
//                 className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:border-pink-300 hover:text-pink-600"
//               >
//                 <FiChevronLeft />
//               </button>

//               {Array.from(
//                 {
//                   length: totalPages,
//                 },
//                 (_, index) => index + 1
//               ).map((page) => (
//                 <button
//                   key={page}
//                   type="button"
//                   onClick={() => goToPage(page)}
//                   className={`w-10 h-10 rounded-lg font-medium ${
//                     safePage === page
//                       ? "bg-pink-600 text-white"
//                       : "border border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-600"
//                   }`}
//                 >
//                   {page}
//                 </button>
//               ))}

//               <button
//                 type="button"
//                 disabled={safePage === totalPages}
//                 onClick={() => goToPage(safePage + 1)}
//                 className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:border-pink-300 hover:text-pink-600"
//               >
//                 <FiChevronRight />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ====================================================
//            CATEGORY MODAL
//       ==================================================== */}

//       {showCategoryModal && (
//         <div className="fixed inset-0 z-[200]">
//           <div
//             className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//             onClick={closeCategoryModal}
//           />

//           <div className="relative z-10 min-h-full flex items-center justify-center p-4">
//             <form
//               onSubmit={handleSaveCategory}
//               className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
//             >
//               <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-800">
//                     {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
//                   </h2>

//                   <p className="text-sm text-gray-500 mt-1">
//                     Cập nhật thông tin danh mục.
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={closeCategoryModal}
//                   className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
//                 >
//                   <FiX />
//                 </button>
//               </div>

//               <div className="p-6 space-y-5">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Tên danh mục *
//                   </label>

//                   <input
//                     name="name"
//                     value={categoryForm.name}
//                     onChange={handleCategoryChange}
//                     required
//                     className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Tóm tắt danh mục
//                   </label>

//                   <textarea
//                     name="summary"
//                     value={categoryForm.summary}
//                     onChange={handleCategoryChange}
//                     rows={4}
//                     placeholder="Mô tả ngắn về danh mục..."
//                     className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 resize-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Hình ảnh danh mục
//                   </label>

//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleCategoryImage}
//                     className="w-full text-sm"
//                   />

//                   {categoryForm.image && (
//                     <div className="mt-4 w-40 h-28 rounded-xl overflow-hidden border">
//                       <img
//                         src={categoryForm.image}
//                         alt="Preview"
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   )}
//                 </div>

//                 <label className="flex items-center gap-3 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     name="active"
//                     checked={categoryForm.active}
//                     onChange={handleCategoryChange}
//                     className="w-4 h-4 accent-pink-600"
//                   />

//                   <span className="text-sm text-gray-700">
//                     Hiển thị danh mục trên website
//                   </span>
//                 </label>
//               </div>

//               <div className="px-6 py-5 border-t border-gray-100 flex justify-end gap-3">
//                 <button
//                   type="button"
//                   onClick={closeCategoryModal}
//                   className="px-5 py-3 rounded-lg border border-gray-200 text-gray-700"
//                 >
//                   Hủy
//                 </button>

//                 <button
//                   type="submit"
//                   className="px-5 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700"
//                 >
//                   {editingCategory ? "Lưu thay đổi" : "Thêm danh mục"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ====================================================
//            PRODUCT EDIT MODAL
//       ==================================================== */}

//       {showProductModal && (
//         <div className="fixed inset-0 z-[200]">
//           <div
//             className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//             onClick={closeProductModal}
//           />

//           <div className="relative z-10 min-h-full flex items-center justify-center p-4">
//             <form
//               onSubmit={handleUpdateProduct}
//               className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
//             >
//               <div className="sticky top-0 z-10 px-6 py-5 bg-white border-b border-gray-100 flex items-center justify-between">
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-800">
//                     Chỉnh sửa sản phẩm
//                   </h2>

//                   <p className="text-sm text-gray-500 mt-1">
//                     {editingProduct?.name}
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={closeProductModal}
//                   className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
//                 >
//                   <FiX />
//                 </button>
//               </div>

//               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Tên sản phẩm *
//                   </label>

//                   <input
//                     name="name"
//                     value={productForm.name}
//                     onChange={handleProductChange}
//                     required
//                     className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Danh mục *
//                   </label>

//                   <select
//                     name="category"
//                     value={productForm.category}
//                     onChange={handleProductChange}
//                     required
//                     className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white outline-none focus:border-pink-400"
//                   >
//                     <option value="">-- Chọn danh mục --</option>

//                     {categories.map((category) => (
//                       <option key={category.id} value={category.slug}>
//                         {category.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Giá bán *
//                   </label>

//                   <input
//                     name="price"
//                     type="number"
//                     min="1"
//                     value={productForm.price}
//                     onChange={handleProductChange}
//                     required
//                     className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Giá cũ
//                   </label>

//                   <input
//                     name="oldPrice"
//                     type="number"
//                     min="0"
//                     value={productForm.oldPrice}
//                     onChange={handleProductChange}
//                     className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Badge
//                   </label>

//                   <input
//                     name="badge"
//                     value={productForm.badge}
//                     onChange={handleProductChange}
//                     className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Thay hình ảnh
//                   </label>

//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleProductImage}
//                     className="w-full text-sm"
//                   />
//                 </div>

//                 {productForm.image && (
//                   <div className="md:col-span-2">
//                     <div className="w-40 h-40 rounded-xl overflow-hidden border">
//                       <img
//                         src={productForm.image}
//                         alt="Preview"
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   </div>
//                 )}

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Mô tả
//                   </label>

//                   <textarea
//                     name="description"
//                     value={productForm.description}
//                     onChange={handleProductChange}
//                     rows={5}
//                     className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 resize-none"
//                   />
//                 </div>
//               </div>

//               <div className="sticky bottom-0 px-6 py-5 bg-white border-t border-gray-100 flex justify-end gap-3">
//                 <button
//                   type="button"
//                   onClick={closeProductModal}
//                   className="px-5 py-3 rounded-lg border border-gray-200 text-gray-700"
//                 >
//                   Hủy
//                 </button>

//                 <button
//                   type="submit"
//                   className="px-5 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700"
//                 >
//                   Lưu thay đổi
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// };

// export default AdminProductsPage;

/*
============================================================
FLOWER SHOP — ADMIN PRODUCTS
============================================================

KIẾN TRÚC:

catalog.js
   │
   ├── Products
   └── Categories
          ↓
     Admin Products

CẬP NHẬT:
- 20 sản phẩm/trang.
- Search sản phẩm.
- Danh mục thu gọn/mở rộng.
- Thêm sản phẩm thu gọn/mở rộng.
- CRUD danh mục.
- Tên danh mục.
- Tóm tắt.
- Hình ảnh.
- Trạng thái.
- Modal sửa danh mục.
- Modal sửa sản phẩm.
- Không đọc localStorage trực tiếp.
- Input file hiển thị rõ nút "Chọn tệp".
============================================================
*/

import { useEffect, useMemo, useState } from "react";

import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiEye,
  FiImage,
  FiPlus,
  FiSearch,
  FiTag,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { Link } from "react-router-dom";

import {
  readProducts,
  saveProducts,
  readCategories,
  saveCategories,
  PRODUCT_UPDATED_EVENT,
  CATEGORY_UPDATED_EVENT,
} from "@/services/catalog";

import { slugifyCategory } from "@/constants/productCategories";

const PRODUCTS_PER_PAGE = 20;

const EMPTY_PRODUCT = {
  name: "",
  price: "",
  oldPrice: "",
  badge: "",
  category: "",
  description: "",
  image: "",
};

const EMPTY_CATEGORY = {
  name: "",
  summary: "",
  image: "",
  active: true,
};

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const fileInputClass =
  "mt-2 block w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-pink-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-pink-700";

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const AdminProductsPage = () => {
  const [products, setProducts] = useState(() => readProducts());

  const [categories, setCategories] = useState(() => readCategories());

  const [keyword, setKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [showCategories, setShowCategories] = useState(false);

  const [showCreateProduct, setShowCreateProduct] = useState(false);

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);

  const [editingProduct, setEditingProduct] = useState(null);

  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY);

  const [editingCategory, setEditingCategory] = useState(null);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  /*
    ========================================================
    REFRESH
    ========================================================
    */

  useEffect(() => {
    const refreshProducts = () => setProducts(readProducts());

    const refreshCategories = () => setCategories(readCategories());

    window.addEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

    window.addEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

    window.addEventListener("storage", refreshProducts);

    return () => {
      window.removeEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

      window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

      window.removeEventListener("storage", refreshProducts);
    };
  }, []);

  /*
    ========================================================
    FILTER
    ========================================================
    */

  const filteredProducts = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.category, product.badge, product.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [products, keyword]);

  /*
    ========================================================
    PAGINATION
    ========================================================
    */

  const totalProducts = filteredProducts.length;

  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));

  const safePage = Math.min(currentPage, totalPages);

  const startIndex =
    totalProducts === 0 ? 0 : (safePage - 1) * PRODUCTS_PER_PAGE;

  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);

  const visibleProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  /*
    ========================================================
    MESSAGES
    ========================================================
    */

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  /*
    ========================================================
    IMAGE READER
    ========================================================
    */

  const readImageFile = (event, setter) => {
    const file = event.target.files?.[0];

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
      setter(String(reader.result || ""));
    };

    reader.onerror = () => {
      setError("Không thể đọc hình ảnh.");
    };

    reader.readAsDataURL(file);
  };

  /*
    ========================================================
    PRODUCT FORM
    ========================================================
    */

  const handleProductChange = (event) => {
    const { name, value } = event.target;

    setProductForm((current) => ({
      ...current,
      [name]: value,
    }));

    clearMessages();
  };

  /*
    ========================================================
    CREATE PRODUCT
    ========================================================
    */

  const handleCreateProduct = (event) => {
    event.preventDefault();

    clearMessages();

    const name = productForm.name.trim();

    const price = Number(productForm.price);

    if (!name) {
      setError("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Giá sản phẩm phải lớn hơn 0.");
      return;
    }

    if (!productForm.category) {
      setError("Vui lòng chọn danh mục.");
      return;
    }

    try {
      const newProduct = {
        id: `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

        name,

        price,

        oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : null,

        badge: productForm.badge.trim(),

        category: productForm.category,

        description: productForm.description.trim(),

        image: productForm.image || "",

        salesCount: 0,

        isNew: true,

        createdAt: new Date().toISOString(),
      };

      const saved = saveProducts([...products, newProduct]);

      setProducts(saved);

      setProductForm(EMPTY_PRODUCT);

      setShowCreateProduct(false);

      setMessage("Đã thêm sản phẩm thành công.");
    } catch (storageError) {
      console.error(storageError);

      setError("Không thể lưu sản phẩm.");
    }
  };

  /*
    ========================================================
    EDIT PRODUCT
    ========================================================
    */

  const openProductEdit = (product) => {
    clearMessages();

    setEditingProduct(product);

    setProductForm({
      name: product.name || "",

      price: product.price ?? "",

      oldPrice: product.oldPrice ?? "",

      badge: product.badge || "",

      category: product.category || "",

      description: product.description || "",

      image: product.image || "",
    });
  };

  const closeProductEdit = () => {
    setEditingProduct(null);

    setProductForm(EMPTY_PRODUCT);
  };

  const handleUpdateProduct = (event) => {
    event.preventDefault();

    clearMessages();

    if (!editingProduct) {
      return;
    }

    const name = productForm.name.trim();

    const price = Number(productForm.price);

    if (!name) {
      setError("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Giá sản phẩm phải lớn hơn 0.");
      return;
    }

    if (!productForm.category) {
      setError("Vui lòng chọn danh mục.");
      return;
    }

    const updated = products.map((product) =>
      String(product.id) === String(editingProduct.id)
        ? {
            ...product,

            name,

            price,

            oldPrice: productForm.oldPrice
              ? Number(productForm.oldPrice)
              : null,

            badge: productForm.badge.trim(),

            category: productForm.category,

            description: productForm.description.trim(),

            image: productForm.image || product.image || "",
          }
        : product
    );

    try {
      const saved = saveProducts(updated);

      setProducts(saved);

      closeProductEdit();

      setMessage("Đã cập nhật sản phẩm thành công.");
    } catch (storageError) {
      console.error(storageError);

      setError("Không thể cập nhật sản phẩm.");
    }
  };

  /*
    ========================================================
    DELETE PRODUCT
    ========================================================
    */

  const handleDeleteProduct = (product) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa sản phẩm "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const updated = products.filter(
        (item) => String(item.id) !== String(product.id)
      );

      const saved = saveProducts(updated);

      setProducts(saved);

      setMessage("Đã xóa sản phẩm.");
    } catch (storageError) {
      console.error(storageError);

      setError("Không thể xóa sản phẩm.");
    }
  };

  /*
    ========================================================
    CATEGORY MODAL
    ========================================================
    */

  const openCreateCategory = () => {
    clearMessages();

    setEditingCategory(null);

    setCategoryForm(EMPTY_CATEGORY);
  };

  const openEditCategory = (category) => {
    clearMessages();

    setEditingCategory(category);

    setCategoryForm({
      name: category.name || "",

      summary: category.summary || "",

      image: category.image || "",

      active: category.active !== false,
    });
  };

  const closeCategoryModal = () => {
    setEditingCategory(null);

    setCategoryForm(EMPTY_CATEGORY);
  };

  const handleCategoryChange = (event) => {
    const { name, value, type, checked } = event.target;

    setCategoryForm((current) => ({
      ...current,

      [name]: type === "checkbox" ? checked : value,
    }));

    clearMessages();
  };

  /*
    ========================================================
    SAVE CATEGORY
    ========================================================
    */

  const handleSaveCategory = (event) => {
    event.preventDefault();

    clearMessages();

    const name = categoryForm.name.trim();

    if (!name) {
      setError("Vui lòng nhập tên danh mục.");
      return;
    }

    const slug = slugifyCategory(name);

    if (!slug) {
      setError("Tên danh mục không hợp lệ.");
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.slug === slug &&
        String(category.id) !== String(editingCategory?.id)
    );

    if (duplicate) {
      setError("Danh mục này đã tồn tại.");
      return;
    }

    try {
      if (editingCategory) {
        const updated = categories.map((category) =>
          String(category.id) === String(editingCategory.id)
            ? {
                ...category,

                name,

                slug,

                label: name,

                query: slug,

                summary: categoryForm.summary.trim(),

                image: categoryForm.image || category.image || "",

                active: categoryForm.active,
              }
            : category
        );

        const saved = saveCategories(updated);

        setCategories(saved);

        closeCategoryModal();

        setMessage("Đã cập nhật danh mục thành công.");

        return;
      }

      const newCategory = {
        id: slug,

        name,

        slug,

        label: name,

        query: slug,

        summary: categoryForm.summary.trim(),

        image: categoryForm.image || "",

        active: categoryForm.active,

        sortOrder: categories.length + 1,
      };

      const saved = saveCategories([...categories, newCategory]);

      setCategories(saved);

      closeCategoryModal();

      setMessage("Đã thêm danh mục thành công.");
    } catch (storageError) {
      console.error(storageError);

      setError("Không thể lưu danh mục.");
    }
  };

  /*
    ========================================================
    DELETE CATEGORY
    ========================================================
    */

  const handleDeleteCategory = (category) => {
    const productCount = products.filter(
      (product) => product.category === category.slug
    ).length;

    if (productCount > 0) {
      setError(
        `Không thể xóa "${category.name}" vì đang có ${productCount} sản phẩm sử dụng danh mục này.`
      );

      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa danh mục "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const updated = categories
        .filter((item) => String(item.id) !== String(category.id))
        .map((item, index) => ({
          ...item,
          sortOrder: index + 1,
        }));

      const saved = saveCategories(updated);

      setCategories(saved);

      setMessage("Đã xóa danh mục.");
    } catch (storageError) {
      console.error(storageError);

      setError("Không thể xóa danh mục.");
    }
  };

  /*
    ========================================================
    CATEGORY IMAGE
    ========================================================
    */

  const handleCategoryImage = (event) => {
    readImageFile(event, (image) =>
      setCategoryForm((current) => ({
        ...current,
        image,
      }))
    );
  };

  /*
    ========================================================
    PRODUCT IMAGE
    ========================================================
    */

  const handleProductImage = (event) => {
    readImageFile(event, (image) =>
      setProductForm((current) => ({
        ...current,
        image,
      }))
    );
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* HEADER */}

        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
              Quản lý sản phẩm
            </h1>

            <p className="mt-2 text-gray-500">
              Quản lý sản phẩm và danh mục tập trung.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm sản phẩm..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-pink-400"
            />
          </div>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* CATEGORY */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setShowCategories((value) => !value)}
            className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                <FiTag />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">Danh mục sản phẩm</h2>

                <p className="text-sm text-gray-500">
                  {categories.length} danh mục
                </p>
              </div>
            </div>

            <FiChevronDown
              className={
                showCategories ? "rotate-180 transition" : "transition"
              }
            />
          </button>

          {showCategories && (
            <div className="border-t border-gray-100 p-6">
              <div className="mb-5 flex justify-end">
                <button
                  type="button"
                  onClick={openCreateCategory}
                  className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 font-semibold text-white hover:bg-pink-700"
                >
                  <FiPlus />
                  Thêm danh mục
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="overflow-hidden rounded-xl border border-gray-100"
                  >
                    <div className="aspect-[16/9] bg-pink-50">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                          Chưa có hình ảnh
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {category.name}
                          </h3>

                          <span
                            className={`mt-1 inline-block rounded-full px-2 py-1 text-xs ${
                              category.active
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {category.active ? "Đang hiển thị" : "Đang ẩn"}
                          </span>
                        </div>

                        <span className="text-xs text-gray-400">
                          #{category.sortOrder}
                        </span>
                      </div>

                      {category.summary && (
                        <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                          {category.summary}
                        </p>
                      )}

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditCategory(category)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium hover:border-pink-300 hover:text-pink-600"
                        >
                          <FiEdit2 />
                          Sửa
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(category)}
                          className="flex h-10 w-11 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CREATE PRODUCT */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setShowCreateProduct((value) => !value)}
            className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                <FiPlus />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">Thêm sản phẩm mới</h2>

                <p className="text-sm text-gray-500">
                  Chỉ mở biểu mẫu khi cần thêm sản phẩm.
                </p>
              </div>
            </div>

            <FiChevronDown
              className={
                showCreateProduct ? "rotate-180 transition" : "transition"
              }
            />
          </button>

          {showCreateProduct && (
            <form
              onSubmit={handleCreateProduct}
              className="grid grid-cols-1 gap-5 border-t border-gray-100 p-6 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tên sản phẩm *
                </label>

                <input
                  name="name"
                  value={productForm.name}
                  onChange={handleProductChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Danh mục *
                </label>

                <select
                  name="category"
                  value={productForm.category}
                  onChange={handleProductChange}
                  className={inputClass}
                  required
                >
                  <option value="">-- Chọn danh mục --</option>

                  {categories
                    .filter((category) => category.active !== false)
                    .map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Giá bán *
                </label>

                <input
                  name="price"
                  type="number"
                  min="1"
                  value={productForm.price}
                  onChange={handleProductChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Giá cũ
                </label>

                <input
                  name="oldPrice"
                  type="number"
                  min="0"
                  value={productForm.oldPrice}
                  onChange={handleProductChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nhãn sản phẩm
                </label>

                <input
                  name="badge"
                  value={productForm.badge}
                  onChange={handleProductChange}
                  className={inputClass}
                  placeholder="Mới, Bán chạy..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Hình ảnh
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProductImage}
                  className={fileInputClass}
                />
              </div>

              {productForm.image && (
                <div className="md:col-span-2">
                  <div className="h-32 w-32 overflow-hidden rounded-xl border">
                    <img
                      src={productForm.image}
                      alt="Xem trước"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Mô tả sản phẩm
                </label>

                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductChange}
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="flex justify-end gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateProduct(false);

                    setProductForm(EMPTY_PRODUCT);
                  }}
                  className="rounded-lg border border-gray-200 px-5 py-3 text-gray-700"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
                >
                  Thêm sản phẩm
                </button>
              </div>
            </form>
          )}
        </div>

        {/* PRODUCT LIST */}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="font-bold text-gray-800">Danh sách sản phẩm</h2>

            <p className="mt-1 text-sm text-gray-500">
              {totalProducts > 0
                ? `Hiển thị ${
                    startIndex + 1
                  }-${endIndex} / ${totalProducts} sản phẩm`
                : "Không có sản phẩm"}
            </p>
          </div>

          {visibleProducts.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {visibleProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-4 p-5 md:flex-row md:items-center"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <FiImage />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Danh mục:{" "}
                      {categories.find(
                        (category) => category.slug === product.category
                      )?.name ||
                        product.category ||
                        "Chưa phân loại"}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-bold text-pink-600">
                        {money(product.price)}
                      </span>

                      {product.oldPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {money(product.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-600"
                      title="Xem sản phẩm"
                    >
                      <FiEye />
                    </Link>

                    <button
                      type="button"
                      onClick={() => openProductEdit(product)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-600"
                      title="Sửa sản phẩm"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                      title="Xóa sản phẩm"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PAGINATION */}

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 border-t border-gray-100 px-6 py-5">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => goToPage(safePage - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40"
              >
                <FiChevronLeft />
              </button>

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`h-10 w-10 rounded-lg font-medium ${
                    safePage === page
                      ? "bg-pink-600 text-white"
                      : "border border-gray-200 text-gray-600"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => goToPage(safePage + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================
             CATEGORY MODAL
        ================================================== */}

      {(editingCategory !== null ||
        categoryForm.name !== "" ||
        categoryForm.summary !== "" ||
        categoryForm.image !== "") && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeCategoryModal}
          />

          <form
            onSubmit={handleSaveCategory}
            className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Cập nhật thông tin danh mục.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCategoryModal}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tên danh mục *
                </label>

                <input
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tóm tắt danh mục
                </label>

                <textarea
                  name="summary"
                  value={categoryForm.summary}
                  onChange={handleCategoryChange}
                  rows={4}
                  placeholder="Mô tả ngắn về danh mục..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Hình ảnh danh mục
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryImage}
                  className={fileInputClass}
                />

                <p className="mt-2 text-xs text-gray-500">
                  Chỉ chấp nhận hình ảnh, tối đa 2MB.
                </p>

                {categoryForm.image && (
                  <div className="mt-4 h-36 w-52 overflow-hidden rounded-xl border border-gray-200">
                    <img
                      src={categoryForm.image}
                      alt="Xem trước danh mục"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="active"
                  checked={categoryForm.active}
                  onChange={handleCategoryChange}
                  className="h-4 w-4 accent-pink-600"
                />

                <span className="text-sm text-gray-700">
                  Hiển thị danh mục trên website
                </span>
              </label>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-5">
              <button
                type="button"
                onClick={closeCategoryModal}
                className="rounded-lg border border-gray-200 px-5 py-3 text-gray-700"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
              >
                {editingCategory ? "Lưu thay đổi" : "Thêm danh mục"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================================================
             PRODUCT EDIT MODAL
        ================================================== */}

      {editingProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeProductEdit}
          />

          <form
            onSubmit={handleUpdateProduct}
            className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Chỉnh sửa sản phẩm
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingProduct.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeProductEdit}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tên sản phẩm *
                </label>

                <input
                  name="name"
                  value={productForm.name}
                  onChange={handleProductChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Danh mục *
                </label>

                <select
                  name="category"
                  value={productForm.category}
                  onChange={handleProductChange}
                  className={inputClass}
                  required
                >
                  <option value="">-- Chọn danh mục --</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Giá bán *
                </label>

                <input
                  name="price"
                  type="number"
                  min="1"
                  value={productForm.price}
                  onChange={handleProductChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Giá cũ
                </label>

                <input
                  name="oldPrice"
                  type="number"
                  min="0"
                  value={productForm.oldPrice}
                  onChange={handleProductChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Badge
                </label>

                <input
                  name="badge"
                  value={productForm.badge}
                  onChange={handleProductChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Thay hình ảnh
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProductImage}
                  className={fileInputClass}
                />
              </div>

              {productForm.image && (
                <div className="md:col-span-2">
                  <div className="h-40 w-40 overflow-hidden rounded-xl border">
                    <img
                      src={productForm.image}
                      alt="Xem trước"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Mô tả
                </label>

                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductChange}
                  rows={5}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-5">
              <button
                type="button"
                onClick={closeProductEdit}
                className="rounded-lg border border-gray-200 px-5 py-3 text-gray-700"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default AdminProductsPage;
