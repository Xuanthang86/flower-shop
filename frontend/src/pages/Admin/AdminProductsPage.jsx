// // // import { useEffect, useMemo, useState } from "react";
// // // import {
// // //   FiEdit2,
// // //   FiEye,
// // //   FiImage,
// // //   FiPlus,
// // //   FiSearch,
// // //   FiTrash2,
// // //   FiX,
// // // } from "react-icons/fi";
// // // import { Link } from "react-router-dom";
// // // import { products as initialProducts } from "@/data/products";

// // // const STORAGE_KEY = "flower-shop-products";
// // // const PRODUCT_CATEGORIES = [
// // //   "Hoa khai trương",
// // //   "Hoa sinh nhật",
// // //   "Hoa cưới",
// // //   "Hoa tốt nghiệp",
// // //   "Hoa chia buồn",
// // // ];

// // // const emptyForm = {
// // //   name: "",
// // //   price: "",
// // //   oldPrice: "",
// // //   badge: "",
// // //   category: "",
// // //   description: "",
// // //   image: "",
// // // };

// // // const readProducts = () => {
// // //   try {
// // //     const raw = localStorage.getItem(STORAGE_KEY);

// // //     if (raw) {
// // //       const parsed = JSON.parse(raw);
// // //       if (Array.isArray(parsed)) return parsed;
// // //     }
// // //   } catch (error) {
// // //     console.error("Không thể đọc sản phẩm:", error);
// // //   }

// // //   const seed = (initialProducts || []).map((item) => ({
// // //     ...item,
// // //     category: item.category || "",
// // //     description: item.description || "",
// // //   }));

// // //   try {
// // //     localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
// // //   } catch {
// // //     // Không làm vỡ trang nếu localStorage đầy.
// // //   }

// // //   return seed;
// // // };

// // // const money = (value) => Number(value || 0).toLocaleString("vi-VN") + " ₫";

// // // const AdminProductsPage = () => {
// // //   const [products, setProducts] = useState(() => readProducts());
// // //   const [keyword, setKeyword] = useState("");
// // //   const [editingProduct, setEditingProduct] = useState(null);
// // //   const [formData, setFormData] = useState(emptyForm);
// // //   const [message, setMessage] = useState("");
// // //   const [error, setError] = useState("");

// // //   useEffect(() => {
// // //     const handleStorage = (event) => {
// // //       if (event.key === STORAGE_KEY) {
// // //         setProducts(readProducts());
// // //       }
// // //     };

// // //     window.addEventListener("storage", handleStorage);
// // //     return () => window.removeEventListener("storage", handleStorage);
// // //   }, []);

// // //   const filteredProducts = useMemo(() => {
// // //     const q = keyword.trim().toLowerCase();

// // //     if (!q) return products;

// // //     return products.filter((product) =>
// // //       [product.name, product.category, product.badge, product.description]
// // //         .filter(Boolean)
// // //         .join(" ")
// // //         .toLowerCase()
// // //         .includes(q)
// // //     );
// // //   }, [keyword, products]);

// // //   const persist = (next) => {
// // //     setProducts(next);
// // //     localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
// // //     window.dispatchEvent(new Event("flower-shop-products-updated"));
// // //   };

// // //   const clearForm = () => {
// // //     setEditingProduct(null);
// // //     setFormData(emptyForm);
// // //   };

// // //   const handleChange = (event) => {
// // //     const { name, value } = event.target;

// // //     setFormData((current) => ({
// // //       ...current,
// // //       [name]: value,
// // //     }));

// // //     setMessage("");
// // //     setError("");
// // //   };

// // //   const handleImage = (event) => {
// // //     const file = event.target.files?.[0];
// // //     if (!file) return;

// // //     if (!file.type.startsWith("image/")) {
// // //       setError("Vui lòng chọn đúng file hình ảnh.");
// // //       return;
// // //     }

// // //     if (file.size > 2 * 1024 * 1024) {
// // //       setError("Ảnh sản phẩm không được vượt quá 2MB.");
// // //       return;
// // //     }

// // //     const reader = new FileReader();

// // //     reader.onload = () => {
// // //       setFormData((current) => ({
// // //         ...current,
// // //         image: String(reader.result || ""),
// // //       }));
// // //       setError("");
// // //     };

// // //     reader.readAsDataURL(file);
// // //   };

// // //   const startCreate = () => {
// // //     clearForm();
// // //     setMessage("");
// // //     setError("");
// // //     window.scrollTo({ top: 0, behavior: "smooth" });
// // //   };

// // //   const startEdit = (product) => {
// // //     setEditingProduct(product);
// // //     setFormData({
// // //       name: product.name || "",
// // //       price: product.price ?? "",
// // //       oldPrice: product.oldPrice ?? "",
// // //       badge: product.badge || "",
// // //       category: product.category || "",
// // //       description: product.description || "",
// // //       image: product.image || "",
// // //     });
// // //     setMessage("");
// // //     setError("");
// // //     window.scrollTo({ top: 0, behavior: "smooth" });
// // //   };

// // //   const handleSubmit = (event) => {
// // //     event.preventDefault();
// // //     setMessage("");
// // //     setError("");

// // //     const name = formData.name.trim();
// // //     const price = Number(formData.price);

// // //     if (!name) {
// // //       setError("Vui lòng nhập tên sản phẩm.");
// // //       return;
// // //     }

// // //     if (!Number.isFinite(price) || price <= 0) {
// // //       setError("Giá sản phẩm phải lớn hơn 0.");
// // //       return;
// // //     }

// // //     if (!formData.category) {
// // //       setError("Vui lòng chọn danh mục sản phẩm.");
// // //       return;
// // //     }

// // //     const productData = {
// // //       name,
// // //       price,
// // //       oldPrice: formData.oldPrice ? Number(formData.oldPrice) : "",
// // //       badge: formData.badge.trim(),
// // //       category: formData.category,
// // //       description: formData.description.trim(),
// // //       image: formData.image || "",
// // //     };

// // //     let next;

// // //     if (editingProduct) {
// // //       next = products.map((product) =>
// // //         String(product.id) === String(editingProduct.id)
// // //           ? { ...product, ...productData }
// // //           : product
// // //       );

// // //       setMessage("Đã cập nhật sản phẩm thành công.");
// // //     } else {
// // //       next = [
// // //         ...products,
// // //         {
// // //           id: `product-${Date.now()}`,
// // //           ...productData,
// // //           createdAt: new Date().toISOString(),
// // //         },
// // //       ];

// // //       setMessage("Đã thêm sản phẩm thành công.");
// // //     }

// // //     try {
// // //       persist(next);
// // //       clearForm();
// // //     } catch (storageError) {
// // //       console.error(storageError);
// // //       setError("Không thể lưu sản phẩm. Bộ nhớ trình duyệt có thể đã đầy.");
// // //     }
// // //   };

// // //   const handleDelete = (product) => {
// // //     setMessage("");
// // //     setError("");

// // //     if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
// // //       return;
// // //     }

// // //     try {
// // //       const next = products.filter(
// // //         (item) => String(item.id) !== String(product.id)
// // //       );

// // //       persist(next);
// // //       setMessage("Đã xóa sản phẩm.");
// // //     } catch (storageError) {
// // //       console.error(storageError);
// // //       setError("Không thể xóa sản phẩm.");
// // //     }
// // //   };

// // //   return (
// // //     <section className="py-10 bg-gray-50 min-h-[70vh]">
// // //       <div className="max-w-7xl mx-auto px-4">
// // //         <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-7">
// // //           <div>
// // //             <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
// // //               Quản lý sản phẩm
// // //             </h1>
// // //             <p className="mt-2 text-gray-500">
// // //               Thêm, xem, chỉnh sửa, phân loại và xóa sản phẩm.
// // //             </p>
// // //           </div>

// // //           <div className="flex flex-col sm:flex-row gap-3">
// // //             <div className="relative w-full sm:w-72">
// // //               <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
// // //               <input
// // //                 value={keyword}
// // //                 onChange={(event) => setKeyword(event.target.value)}
// // //                 placeholder="Tìm sản phẩm..."
// // //                 className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 bg-white"
// // //               />
// // //             </div>

// // //             <button
// // //               type="button"
// // //               onClick={startCreate}
// // //               className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700"
// // //             >
// // //               <FiPlus />
// // //               Thêm sản phẩm
// // //             </button>
// // //           </div>
// // //         </div>

// // //         {message && (
// // //           <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700">
// // //             {message}
// // //           </div>
// // //         )}

// // //         {error && (
// // //           <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">
// // //             {error}
// // //           </div>
// // //         )}

// // //         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
// // //           <div className="flex items-center justify-between gap-4 mb-6">
// // //             <div>
// // //               <h2 className="text-xl font-bold text-gray-800">
// // //                 {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
// // //               </h2>
// // //               <p className="mt-1 text-sm text-gray-500">
// // //                 Danh mục là bắt buộc để sản phẩm xuất hiện đúng nhóm.
// // //               </p>
// // //             </div>

// // //             {editingProduct && (
// // //               <button
// // //                 type="button"
// // //                 onClick={clearForm}
// // //                 className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
// // //               >
// // //                 <FiX />
// // //                 Hủy sửa
// // //               </button>
// // //             )}
// // //           </div>

// // //           <form
// // //             onSubmit={handleSubmit}
// // //             className="grid grid-cols-1 md:grid-cols-2 gap-5"
// // //           >
// // //             <div>
// // //               <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                 Tên sản phẩm *
// // //               </label>
// // //               <input
// // //                 name="name"
// // //                 value={formData.name}
// // //                 onChange={handleChange}
// // //                 className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
// // //                 required
// // //               />
// // //             </div>

// // //             <div>
// // //               <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                 Danh mục *
// // //               </label>
// // //               <select
// // //                 name="category"
// // //                 value={formData.category}
// // //                 onChange={handleChange}
// // //                 className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
// // //                 required
// // //               >
// // //                 <option value="">-- Chọn danh mục --</option>
// // //                 {PRODUCT_CATEGORIES.map((category) => (
// // //                   <option key={category} value={category}>
// // //                     {category}
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>

// // //             <div>
// // //               <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                 Giá bán *
// // //               </label>
// // //               <input
// // //                 name="price"
// // //                 type="number"
// // //                 min="0"
// // //                 value={formData.price}
// // //                 onChange={handleChange}
// // //                 className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
// // //                 required
// // //               />
// // //             </div>

// // //             <div>
// // //               <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                 Giá cũ
// // //               </label>
// // //               <input
// // //                 name="oldPrice"
// // //                 type="number"
// // //                 min="0"
// // //                 value={formData.oldPrice}
// // //                 onChange={handleChange}
// // //                 className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
// // //               />
// // //             </div>

// // //             <div>
// // //               <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                 Nhãn
// // //               </label>
// // //               <input
// // //                 name="badge"
// // //                 value={formData.badge}
// // //                 onChange={handleChange}
// // //                 placeholder="Bán chạy, Mới, Nổi bật..."
// // //                 className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
// // //               />
// // //             </div>

// // //             <div>
// // //               <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                 Hình ảnh
// // //               </label>

// // //               <label className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50">
// // //                 <FiImage />
// // //                 Chọn ảnh
// // //                 <input
// // //                   type="file"
// // //                   accept="image/*"
// // //                   onChange={handleImage}
// // //                   className="hidden"
// // //                 />
// // //               </label>
// // //             </div>

// // //             <div className="md:col-span-2">
// // //               <label className="block text-sm font-medium text-gray-700 mb-2">
// // //                 Mô tả
// // //               </label>
// // //               <textarea
// // //                 name="description"
// // //                 value={formData.description}
// // //                 onChange={handleChange}
// // //                 rows={4}
// // //                 className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-y"
// // //               />
// // //             </div>

// // //             {formData.image && (
// // //               <div className="md:col-span-2">
// // //                 <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
// // //                   <img
// // //                     src={formData.image}
// // //                     alt="Xem trước"
// // //                     className="w-full h-full object-cover"
// // //                   />
// // //                 </div>
// // //               </div>
// // //             )}

// // //             <div className="md:col-span-2">
// // //               <button
// // //                 type="submit"
// // //                 className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700"
// // //               >
// // //                 {editingProduct ? "Lưu thay đổi" : "Thêm sản phẩm"}
// // //               </button>
// // //             </div>
// // //           </form>
// // //         </div>

// // //         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
// // //           <div className="px-6 py-5 border-b border-gray-100">
// // //             <h2 className="text-xl font-bold text-gray-800">
// // //               Danh sách sản phẩm
// // //             </h2>
// // //             <p className="mt-1 text-sm text-gray-500">
// // //               {filteredProducts.length} sản phẩm
// // //             </p>
// // //           </div>

// // //           <div className="overflow-x-auto">
// // //             <table className="w-full min-w-[980px]">
// // //               <thead className="bg-gray-50">
// // //                 <tr>
// // //                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
// // //                     Sản phẩm
// // //                   </th>
// // //                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
// // //                     Danh mục
// // //                   </th>
// // //                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
// // //                     Giá
// // //                   </th>
// // //                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
// // //                     Nhãn
// // //                   </th>
// // //                   <th className="text-right px-5 py-4 text-sm font-semibold text-gray-600">
// // //                     Thao tác
// // //                   </th>
// // //                 </tr>
// // //               </thead>

// // //               <tbody className="divide-y divide-gray-100">
// // //                 {filteredProducts.map((product) => (
// // //                   <tr key={product.id} className="hover:bg-pink-50/30">
// // //                     <td className="px-5 py-4">
// // //                       <div className="flex items-center gap-3">
// // //                         <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
// // //                           {product.image ? (
// // //                             <img
// // //                               src={product.image}
// // //                               alt={product.name}
// // //                               className="w-full h-full object-cover"
// // //                             />
// // //                           ) : (
// // //                             <div className="w-full h-full flex items-center justify-center text-gray-400">
// // //                               <FiImage />
// // //                             </div>
// // //                           )}
// // //                         </div>

// // //                         <div>
// // //                           <p className="font-semibold text-gray-800">
// // //                             {product.name}
// // //                           </p>
// // //                           <p className="text-xs text-gray-500">
// // //                             ID: {product.id}
// // //                           </p>
// // //                         </div>
// // //                       </div>
// // //                     </td>

// // //                     <td className="px-5 py-4">
// // //                       <span className="inline-flex px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-semibold">
// // //                         {product.category || "Chưa phân loại"}
// // //                       </span>
// // //                     </td>

// // //                     <td className="px-5 py-4 font-semibold text-pink-600">
// // //                       {money(product.price)}
// // //                     </td>

// // //                     <td className="px-5 py-4 text-sm text-gray-600">
// // //                       {product.badge || "—"}
// // //                     </td>

// // //                     <td className="px-5 py-4">
// // //                       <div className="flex justify-end gap-2">
// // //                         <Link
// // //                           to={`/products/${product.id}`}
// // //                           className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:text-pink-600 hover:bg-pink-50"
// // //                           title="Xem"
// // //                         >
// // //                           <FiEye size={16} />
// // //                         </Link>

// // //                         <button
// // //                           type="button"
// // //                           onClick={() => startEdit(product)}
// // //                           className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:text-pink-600 hover:bg-pink-50"
// // //                           title="Chỉnh sửa"
// // //                         >
// // //                           <FiEdit2 size={16} />
// // //                         </button>

// // //                         <button
// // //                           type="button"
// // //                           onClick={() => handleDelete(product)}
// // //                           className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50"
// // //                           title="Xóa"
// // //                         >
// // //                           <FiTrash2 size={16} />
// // //                         </button>
// // //                       </div>
// // //                     </td>
// // //                   </tr>
// // //                 ))}

// // //                 {filteredProducts.length === 0 && (
// // //                   <tr>
// // //                     <td
// // //                       colSpan="5"
// // //                       className="px-5 py-12 text-center text-gray-500"
// // //                     >
// // //                       Không tìm thấy sản phẩm.
// // //                     </td>
// // //                   </tr>
// // //                 )}
// // //               </tbody>
// // //             </table>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </section>
// // //   );
// // // };

// // // export default AdminProductsPage;

// // import { useEffect, useMemo, useState } from "react";
// // import {
// //   FiEdit2,
// //   FiEye,
// //   FiImage,
// //   FiPlus,
// //   FiSearch,
// //   FiTrash2,
// //   FiX,
// // } from "react-icons/fi";
// // import { Link } from "react-router-dom";
// // import { products as initialProducts } from "@/data/products";

// // const STORAGE_KEY = "flower-shop-products";
// // const PRODUCT_CATEGORIES = [
// //   "Hoa khai trương",
// //   "Hoa sinh nhật",
// //   "Hoa cưới",
// //   "Hoa tốt nghiệp",
// //   "Hoa chia buồn",
// // ];

// // const emptyForm = {
// //   name: "",
// //   price: "",
// //   oldPrice: "",
// //   badge: "",
// //   category: "",
// //   description: "",
// //   image: "",
// // };

// // const readProducts = () => {
// //   try {
// //     const raw = localStorage.getItem(STORAGE_KEY);

// //     if (raw) {
// //       const parsed = JSON.parse(raw);
// //       if (Array.isArray(parsed)) return parsed;
// //     }
// //   } catch (error) {
// //     console.error("Không thể đọc sản phẩm:", error);
// //   }

// //   const seed = (initialProducts || []).map((item) => ({
// //     ...item,
// //     category: item.category || "",
// //     description: item.description || "",
// //   }));

// //   try {
// //     localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
// //   } catch {
// //     // Không làm vỡ trang nếu localStorage đầy.
// //   }

// //   return seed;
// // };

// // const money = (value) => Number(value || 0).toLocaleString("vi-VN") + " ₫";

// // const AdminProductsPage = () => {
// //   const [products, setProducts] = useState(() => readProducts());
// //   const [keyword, setKeyword] = useState("");
// //   const [editingProduct, setEditingProduct] = useState(null);
// //   const [formData, setFormData] = useState(emptyForm);
// //   const [message, setMessage] = useState("");
// //   const [error, setError] = useState("");

// //   useEffect(() => {
// //     const handleStorage = (event) => {
// //       if (event.key === STORAGE_KEY) {
// //         setProducts(readProducts());
// //       }
// //     };

// //     window.addEventListener("storage", handleStorage);
// //     return () => window.removeEventListener("storage", handleStorage);
// //   }, []);

// //   const filteredProducts = useMemo(() => {
// //     const q = keyword.trim().toLowerCase();

// //     if (!q) return products;

// //     return products.filter((product) =>
// //       [product.name, product.category, product.badge, product.description]
// //         .filter(Boolean)
// //         .join(" ")
// //         .toLowerCase()
// //         .includes(q)
// //     );
// //   }, [keyword, products]);

// //   const persist = (next) => {
// //     setProducts(next);
// //     localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
// //     window.dispatchEvent(new Event("flower-shop-products-updated"));
// //   };

// //   const clearForm = () => {
// //     setEditingProduct(null);
// //     setFormData(emptyForm);
// //   };

// //   const handleChange = (event) => {
// //     const { name, value } = event.target;

// //     setFormData((current) => ({
// //       ...current,
// //       [name]: value,
// //     }));

// //     setMessage("");
// //     setError("");
// //   };

// //   const handleImage = (event) => {
// //     const file = event.target.files?.[0];
// //     if (!file) return;

// //     if (!file.type.startsWith("image/")) {
// //       setError("Vui lòng chọn đúng file hình ảnh.");
// //       return;
// //     }

// //     if (file.size > 2 * 1024 * 1024) {
// //       setError("Ảnh sản phẩm không được vượt quá 2MB.");
// //       return;
// //     }

// //     const reader = new FileReader();

// //     reader.onload = () => {
// //       setFormData((current) => ({
// //         ...current,
// //         image: String(reader.result || ""),
// //       }));
// //       setError("");
// //     };

// //     reader.readAsDataURL(file);
// //   };

// //   const startCreate = () => {
// //     clearForm();
// //     setMessage("");
// //     setError("");
// //     window.scrollTo({ top: 0, behavior: "smooth" });
// //   };

// //   const startEdit = (product) => {
// //     setEditingProduct(product);
// //     setFormData({
// //       name: product.name || "",
// //       price: product.price ?? "",
// //       oldPrice: product.oldPrice ?? "",
// //       badge: product.badge || "",
// //       category: product.category || "",
// //       description: product.description || "",
// //       image: product.image || "",
// //     });
// //     setMessage("");
// //     setError("");
// //     window.scrollTo({ top: 0, behavior: "smooth" });
// //   };

// //   const handleSubmit = (event) => {
// //     event.preventDefault();
// //     setMessage("");
// //     setError("");

// //     const name = formData.name.trim();
// //     const price = Number(formData.price);

// //     if (!name) {
// //       setError("Vui lòng nhập tên sản phẩm.");
// //       return;
// //     }

// //     if (!Number.isFinite(price) || price <= 0) {
// //       setError("Giá sản phẩm phải lớn hơn 0.");
// //       return;
// //     }

// //     if (!formData.category) {
// //       setError("Vui lòng chọn danh mục sản phẩm.");
// //       return;
// //     }

// //     const productData = {
// //       name,
// //       price,
// //       oldPrice: formData.oldPrice ? Number(formData.oldPrice) : "",
// //       badge: formData.badge.trim(),
// //       category: formData.category,
// //       description: formData.description.trim(),
// //       image: formData.image || "",
// //     };

// //     let next;

// //     if (editingProduct) {
// //       next = products.map((product) =>
// //         String(product.id) === String(editingProduct.id)
// //           ? { ...product, ...productData }
// //           : product
// //       );

// //       setMessage("Đã cập nhật sản phẩm thành công.");
// //     } else {
// //       next = [
// //         ...products,
// //         {
// //           id: `product-${Date.now()}`,
// //           ...productData,
// //           createdAt: new Date().toISOString(),
// //         },
// //       ];

// //       setMessage("Đã thêm sản phẩm thành công.");
// //     }

// //     try {
// //       persist(next);
// //       clearForm();
// //     } catch (storageError) {
// //       console.error(storageError);
// //       setError("Không thể lưu sản phẩm. Bộ nhớ trình duyệt có thể đã đầy.");
// //     }
// //   };

// //   const handleDelete = (product) => {
// //     setMessage("");
// //     setError("");

// //     if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
// //       return;
// //     }

// //     try {
// //       const next = products.filter(
// //         (item) => String(item.id) !== String(product.id)
// //       );

// //       persist(next);
// //       setMessage("Đã xóa sản phẩm.");
// //     } catch (storageError) {
// //       console.error(storageError);
// //       setError("Không thể xóa sản phẩm.");
// //     }
// //   };

// //   return (
// //     <section className="py-10 bg-gray-50 min-h-[70vh]">
// //       <div className="max-w-7xl mx-auto px-4">
// //         <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-7">
// //           <div>
// //             <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
// //               Quản lý sản phẩm
// //             </h1>
// //             <p className="mt-2 text-gray-500">
// //               Thêm, xem, chỉnh sửa, phân loại và xóa sản phẩm.
// //             </p>
// //           </div>

// //           <div className="flex flex-col sm:flex-row gap-3">
// //             <div className="relative w-full sm:w-72">
// //               <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
// //               <input
// //                 value={keyword}
// //                 onChange={(event) => setKeyword(event.target.value)}
// //                 placeholder="Tìm sản phẩm..."
// //                 className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 bg-white"
// //               />
// //             </div>

// //             <button
// //               type="button"
// //               onClick={startCreate}
// //               className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700"
// //             >
// //               <FiPlus />
// //               Thêm sản phẩm
// //             </button>
// //           </div>
// //         </div>

// //         {message && (
// //           <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700">
// //             {message}
// //           </div>
// //         )}

// //         {error && (
// //           <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">
// //             {error}
// //           </div>
// //         )}

// //         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
// //           <div className="flex items-center justify-between gap-4 mb-6">
// //             <div>
// //               <h2 className="text-xl font-bold text-gray-800">
// //                 {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
// //               </h2>
// //               <p className="mt-1 text-sm text-gray-500">
// //                 Danh mục là bắt buộc để sản phẩm xuất hiện đúng nhóm.
// //               </p>
// //             </div>

// //             {editingProduct && (
// //               <button
// //                 type="button"
// //                 onClick={clearForm}
// //                 className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
// //               >
// //                 <FiX />
// //                 Hủy sửa
// //               </button>
// //             )}
// //           </div>

// //           <form
// //             onSubmit={handleSubmit}
// //             className="grid grid-cols-1 md:grid-cols-2 gap-5"
// //           >
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 Tên sản phẩm *
// //               </label>
// //               <input
// //                 name="name"
// //                 value={formData.name}
// //                 onChange={handleChange}
// //                 className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
// //                 required
// //               />
// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 Danh mục *
// //               </label>
// //               <select
// //                 name="category"
// //                 value={formData.category}
// //                 onChange={handleChange}
// //                 className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
// //                 required
// //               >
// //                 <option value="">-- Chọn danh mục --</option>
// //                 {PRODUCT_CATEGORIES.map((category) => (
// //                   <option key={category} value={category}>
// //                     {category}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 Giá bán *
// //               </label>
// //               <input
// //                 name="price"
// //                 type="number"
// //                 min="0"
// //                 value={formData.price}
// //                 onChange={handleChange}
// //                 className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
// //                 required
// //               />
// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 Giá cũ
// //               </label>
// //               <input
// //                 name="oldPrice"
// //                 type="number"
// //                 min="0"
// //                 value={formData.oldPrice}
// //                 onChange={handleChange}
// //                 className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
// //               />
// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 Nhãn
// //               </label>
// //               <input
// //                 name="badge"
// //                 value={formData.badge}
// //                 onChange={handleChange}
// //                 placeholder="Bán chạy, Mới, Nổi bật..."
// //                 className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
// //               />
// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 Hình ảnh
// //               </label>

// //               <label className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50">
// //                 <FiImage />
// //                 Chọn ảnh
// //                 <input
// //                   type="file"
// //                   accept="image/*"
// //                   onChange={handleImage}
// //                   className="hidden"
// //                 />
// //               </label>
// //             </div>

// //             <div className="md:col-span-2">
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 Mô tả
// //               </label>
// //               <textarea
// //                 name="description"
// //                 value={formData.description}
// //                 onChange={handleChange}
// //                 rows={4}
// //                 className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-y"
// //               />
// //             </div>

// //             {formData.image && (
// //               <div className="md:col-span-2">
// //                 <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
// //                   <img
// //                     src={formData.image}
// //                     alt="Xem trước"
// //                     className="w-full h-full object-cover"
// //                   />
// //                 </div>
// //               </div>
// //             )}

// //             <div className="md:col-span-2">
// //               <button
// //                 type="submit"
// //                 className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700"
// //               >
// //                 {editingProduct ? "Lưu thay đổi" : "Thêm sản phẩm"}
// //               </button>
// //             </div>
// //           </form>
// //         </div>

// //         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
// //           <div className="px-6 py-5 border-b border-gray-100">
// //             <h2 className="text-xl font-bold text-gray-800">
// //               Danh sách sản phẩm
// //             </h2>
// //             <p className="mt-1 text-sm text-gray-500">
// //               {filteredProducts.length} sản phẩm
// //             </p>
// //           </div>

// //           <div className="overflow-x-auto">
// //             <table className="w-full min-w-[980px]">
// //               <thead className="bg-gray-50">
// //                 <tr>
// //                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
// //                     Sản phẩm
// //                   </th>
// //                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
// //                     Danh mục
// //                   </th>
// //                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
// //                     Giá
// //                   </th>
// //                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
// //                     Nhãn
// //                   </th>
// //                   <th className="text-right px-5 py-4 text-sm font-semibold text-gray-600">
// //                     Thao tác
// //                   </th>
// //                 </tr>
// //               </thead>

// //               <tbody className="divide-y divide-gray-100">
// //                 {filteredProducts.map((product) => (
// //                   <tr key={product.id} className="hover:bg-pink-50/30">
// //                     <td className="px-5 py-4">
// //                       <div className="flex items-center gap-3">
// //                         <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
// //                           {product.image ? (
// //                             <img
// //                               src={product.image}
// //                               alt={product.name}
// //                               className="w-full h-full object-cover"
// //                             />
// //                           ) : (
// //                             <div className="w-full h-full flex items-center justify-center text-gray-400">
// //                               <FiImage />
// //                             </div>
// //                           )}
// //                         </div>

// //                         <div>
// //                           <p className="font-semibold text-gray-800">
// //                             {product.name}
// //                           </p>
// //                           <p className="text-xs text-gray-500">
// //                             ID: {product.id}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     </td>

// //                     <td className="px-5 py-4">
// //                       <span className="inline-flex px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-semibold">
// //                         {product.category || "Chưa phân loại"}
// //                       </span>
// //                     </td>

// //                     <td className="px-5 py-4 font-semibold text-pink-600">
// //                       {money(product.price)}
// //                     </td>

// //                     <td className="px-5 py-4 text-sm text-gray-600">
// //                       {product.badge || "—"}
// //                     </td>

// //                     <td className="px-5 py-4">
// //                       <div className="flex justify-end gap-2">
// //                         <Link
// //                           to={`/products/${product.id}`}
// //                           className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:text-pink-600 hover:bg-pink-50"
// //                           title="Xem"
// //                         >
// //                           <FiEye size={16} />
// //                         </Link>

// //                         <button
// //                           type="button"
// //                           onClick={() => startEdit(product)}
// //                           className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:text-pink-600 hover:bg-pink-50"
// //                           title="Chỉnh sửa"
// //                         >
// //                           <FiEdit2 size={16} />
// //                         </button>

// //                         <button
// //                           type="button"
// //                           onClick={() => handleDelete(product)}
// //                           className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50"
// //                           title="Xóa"
// //                         >
// //                           <FiTrash2 size={16} />
// //                         </button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 ))}

// //                 {filteredProducts.length === 0 && (
// //                   <tr>
// //                     <td
// //                       colSpan="5"
// //                       className="px-5 py-12 text-center text-gray-500"
// //                     >
// //                       Không tìm thấy sản phẩm.
// //                     </td>
// //                   </tr>
// //                 )}
// //               </tbody>
// //             </table>
// //           </div>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // };

// // export default AdminProductsPage;

// import { useEffect, useMemo, useState } from "react";
// import {
//   FiEdit2,
//   FiEye,
//   FiImage,
//   FiPlus,
//   FiSearch,
//   FiTrash2,
//   FiX,
// } from "react-icons/fi";
// import { Link } from "react-router-dom";
// import { products as initialProducts } from "@/data/products";

// const STORAGE_KEY = "flower-shop-products";
// const PRODUCT_CATEGORIES = [
//   "Hoa khai trương",
//   "Hoa sinh nhật",
//   "Hoa cưới",
//   "Hoa tốt nghiệp",
//   "Hoa chia buồn",
// ];

// const emptyForm = {
//   name: "",
//   price: "",
//   oldPrice: "",
//   badge: "",
//   category: "",
//   description: "",
//   image: "",
// };

// const readProducts = () => {
//   try {
//     const raw = localStorage.getItem(STORAGE_KEY);

//     if (raw) {
//       const parsed = JSON.parse(raw);
//       if (Array.isArray(parsed)) return parsed;
//     }
//   } catch (error) {
//     console.error("Không thể đọc sản phẩm:", error);
//   }

//   const seed = (initialProducts || []).map((item) => ({
//     ...item,
//     category: item.category || "",
//     description: item.description || "",
//   }));

//   try {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
//   } catch {
//     // Không làm vỡ trang nếu localStorage đầy.
//   }

//   return seed;
// };

// const money = (value) => Number(value || 0).toLocaleString("vi-VN") + " ₫";

// const AdminProductsPage = () => {
//   const [products, setProducts] = useState(() => readProducts());
//   const [keyword, setKeyword] = useState("");
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [formData, setFormData] = useState(emptyForm);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const handleStorage = (event) => {
//       if (event.key === STORAGE_KEY) {
//         setProducts(readProducts());
//       }
//     };

//     window.addEventListener("storage", handleStorage);
//     return () => window.removeEventListener("storage", handleStorage);
//   }, []);

//   const filteredProducts = useMemo(() => {
//     const q = keyword.trim().toLowerCase();

//     if (!q) return products;

//     return products.filter((product) =>
//       [product.name, product.category, product.badge, product.description]
//         .filter(Boolean)
//         .join(" ")
//         .toLowerCase()
//         .includes(q)
//     );
//   }, [keyword, products]);

//   const persist = (next) => {
//     setProducts(next);
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
//     window.dispatchEvent(new Event("flower-shop-products-updated"));
//   };

//   const clearForm = () => {
//     setEditingProduct(null);
//     setFormData(emptyForm);
//   };

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setFormData((current) => ({
//       ...current,
//       [name]: value,
//     }));

//     setMessage("");
//     setError("");
//   };

//   const handleImage = (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     if (!file.type.startsWith("image/")) {
//       setError("Vui lòng chọn đúng file hình ảnh.");
//       return;
//     }

//     if (file.size > 2 * 1024 * 1024) {
//       setError("Ảnh sản phẩm không được vượt quá 2MB.");
//       return;
//     }

//     const reader = new FileReader();

//     reader.onload = () => {
//       setFormData((current) => ({
//         ...current,
//         image: String(reader.result || ""),
//       }));
//       setError("");
//     };

//     reader.readAsDataURL(file);
//   };

//   const startCreate = () => {
//     clearForm();
//     setMessage("");
//     setError("");
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const startEdit = (product) => {
//     setEditingProduct(product);
//     setFormData({
//       name: product.name || "",
//       price: product.price ?? "",
//       oldPrice: product.oldPrice ?? "",
//       badge: product.badge || "",
//       category: product.category || "",
//       description: product.description || "",
//       image: product.image || "",
//     });
//     setMessage("");
//     setError("");
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     setMessage("");
//     setError("");

//     const name = formData.name.trim();
//     const price = Number(formData.price);

//     if (!name) {
//       setError("Vui lòng nhập tên sản phẩm.");
//       return;
//     }

//     if (!Number.isFinite(price) || price <= 0) {
//       setError("Giá sản phẩm phải lớn hơn 0.");
//       return;
//     }

//     if (!formData.category) {
//       setError("Vui lòng chọn danh mục sản phẩm.");
//       return;
//     }

//     const productData = {
//       name,
//       price,
//       oldPrice: formData.oldPrice ? Number(formData.oldPrice) : "",
//       badge: formData.badge.trim(),
//       category: formData.category,
//       description: formData.description.trim(),
//       image: formData.image || "",
//     };

//     let next;

//     if (editingProduct) {
//       next = products.map((product) =>
//         String(product.id) === String(editingProduct.id)
//           ? { ...product, ...productData }
//           : product
//       );

//       setMessage("Đã cập nhật sản phẩm thành công.");
//     } else {
//       next = [
//         ...products,
//         {
//           id: `product-${Date.now()}`,
//           ...productData,
//           createdAt: new Date().toISOString(),
//         },
//       ];

//       setMessage("Đã thêm sản phẩm thành công.");
//     }

//     try {
//       persist(next);
//       clearForm();
//     } catch (storageError) {
//       console.error(storageError);
//       setError("Không thể lưu sản phẩm. Bộ nhớ trình duyệt có thể đã đầy.");
//     }
//   };

//   const handleDelete = (product) => {
//     setMessage("");
//     setError("");

//     if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
//       return;
//     }

//     try {
//       const next = products.filter(
//         (item) => String(item.id) !== String(product.id)
//       );

//       persist(next);
//       setMessage("Đã xóa sản phẩm.");
//     } catch (storageError) {
//       console.error(storageError);
//       setError("Không thể xóa sản phẩm.");
//     }
//   };

//   return (
//     <section className="py-10 bg-gray-50 min-h-[70vh]">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-7">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
//               Quản lý sản phẩm
//             </h1>
//             <p className="mt-2 text-gray-500">
//               Thêm, xem, chỉnh sửa, phân loại và xóa sản phẩm.
//             </p>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-3">
//             <div className="relative w-full sm:w-72">
//               <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input
//                 value={keyword}
//                 onChange={(event) => setKeyword(event.target.value)}
//                 placeholder="Tìm sản phẩm..."
//                 className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 bg-white"
//               />
//             </div>

//             <button
//               type="button"
//               onClick={startCreate}
//               className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700"
//             >
//               <FiPlus />
//               Thêm sản phẩm
//             </button>
//           </div>
//         </div>

//         {message && (
//           <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700">
//             {message}
//           </div>
//         )}

//         {error && (
//           <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">
//             {error}
//           </div>
//         )}

//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
//           <div className="flex items-center justify-between gap-4 mb-6">
//             <div>
//               <h2 className="text-xl font-bold text-gray-800">
//                 {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
//               </h2>
//               <p className="mt-1 text-sm text-gray-500">
//                 Danh mục là bắt buộc để sản phẩm xuất hiện đúng nhóm.
//               </p>
//             </div>

//             {editingProduct && (
//               <button
//                 type="button"
//                 onClick={clearForm}
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
//               >
//                 <FiX />
//                 Hủy sửa
//               </button>
//             )}
//           </div>

//           <form
//             onSubmit={handleSubmit}
//             className="grid grid-cols-1 md:grid-cols-2 gap-5"
//           >
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Tên sản phẩm *
//               </label>
//               <input
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Danh mục *
//               </label>
//               <select
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//                 className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
//                 required
//               >
//                 <option value="">-- Chọn danh mục --</option>
//                 {PRODUCT_CATEGORIES.map((category) => (
//                   <option key={category} value={category}>
//                     {category}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Giá bán *
//               </label>
//               <input
//                 name="price"
//                 type="number"
//                 min="0"
//                 value={formData.price}
//                 onChange={handleChange}
//                 className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Giá cũ
//               </label>
//               <input
//                 name="oldPrice"
//                 type="number"
//                 min="0"
//                 value={formData.oldPrice}
//                 onChange={handleChange}
//                 className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Nhãn
//               </label>
//               <input
//                 name="badge"
//                 value={formData.badge}
//                 onChange={handleChange}
//                 placeholder="Bán chạy, Mới, Nổi bật..."
//                 className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Hình ảnh
//               </label>

//               <label className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50">
//                 <FiImage />
//                 Chọn ảnh
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImage}
//                   className="hidden"
//                 />
//               </label>
//             </div>

//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Mô tả
//               </label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 rows={4}
//                 className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 resize-y"
//               />
//             </div>

//             {formData.image && (
//               <div className="md:col-span-2">
//                 <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
//                   <img
//                     src={formData.image}
//                     alt="Xem trước"
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               </div>
//             )}

//             <div className="md:col-span-2">
//               <button
//                 type="submit"
//                 className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700"
//               >
//                 {editingProduct ? "Lưu thay đổi" : "Thêm sản phẩm"}
//               </button>
//             </div>
//           </form>
//         </div>

//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//           <div className="px-6 py-5 border-b border-gray-100">
//             <h2 className="text-xl font-bold text-gray-800">
//               Danh sách sản phẩm
//             </h2>
//             <p className="mt-1 text-sm text-gray-500">
//               {filteredProducts.length} sản phẩm
//             </p>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[980px]">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
//                     Sản phẩm
//                   </th>
//                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
//                     Danh mục
//                   </th>
//                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
//                     Giá
//                   </th>
//                   <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
//                     Nhãn
//                   </th>
//                   <th className="text-right px-5 py-4 text-sm font-semibold text-gray-600">
//                     Thao tác
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-gray-100">
//                 {filteredProducts.map((product) => (
//                   <tr key={product.id} className="hover:bg-pink-50/30">
//                     <td className="px-5 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
//                           {product.image ? (
//                             <img
//                               src={product.image}
//                               alt={product.name}
//                               className="w-full h-full object-cover"
//                             />
//                           ) : (
//                             <div className="w-full h-full flex items-center justify-center text-gray-400">
//                               <FiImage />
//                             </div>
//                           )}
//                         </div>

//                         <div>
//                           <p className="font-semibold text-gray-800">
//                             {product.name}
//                           </p>
//                           <p className="text-xs text-gray-500">
//                             ID: {product.id}
//                           </p>
//                         </div>
//                       </div>
//                     </td>

//                     <td className="px-5 py-4">
//                       <span className="inline-flex px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-semibold">
//                         {product.category || "Chưa phân loại"}
//                       </span>
//                     </td>

//                     <td className="px-5 py-4 font-semibold text-pink-600">
//                       {money(product.price)}
//                     </td>

//                     <td className="px-5 py-4 text-sm text-gray-600">
//                       {product.badge || "—"}
//                     </td>

//                     <td className="px-5 py-4">
//                       <div className="flex justify-end gap-2">
//                         <Link
//                           to={`/products/${product.id}`}
//                           className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:text-pink-600 hover:bg-pink-50"
//                           title="Xem"
//                         >
//                           <FiEye size={16} />
//                         </Link>

//                         <button
//                           type="button"
//                           onClick={() => startEdit(product)}
//                           className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:text-pink-600 hover:bg-pink-50"
//                           title="Chỉnh sửa"
//                         >
//                           <FiEdit2 size={16} />
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() => handleDelete(product)}
//                           className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50"
//                           title="Xóa"
//                         >
//                           <FiTrash2 size={16} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}

//                 {filteredProducts.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan="5"
//                       className="px-5 py-12 text-center text-gray-500"
//                     >
//                       Không tìm thấy sản phẩm.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AdminProductsPage;

import { useEffect, useMemo, useState } from "react";

import {
  FiEdit2,
  FiEye,
  FiImage,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
  FiTag,
} from "react-icons/fi";

import { Link } from "react-router-dom";

import { products as initialProducts } from "@/data/products";

import {
  readProductCategories,
  saveProductCategories,
  slugifyCategory,
} from "@/constants/productCategories";

const PRODUCT_STORAGE_KEY = "flower-shop-products";

const EMPTY_FORM = {
  name: "",
  price: "",
  oldPrice: "",
  badge: "",
  category: "",
  description: "",
  image: "",
};

const readProducts = () => {
  try {
    const raw = localStorage.getItem(PRODUCT_STORAGE_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Không thể đọc sản phẩm:", error);
  }

  const seed = (initialProducts || []).map((item) => ({
    ...item,
    category: item.category || "",
    description: item.description || "",
  }));

  try {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(seed));
  } catch {
    // Không làm vỡ trang.
  }

  return seed;
};

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const AdminProductsPage = () => {
  const [products, setProducts] = useState(() => readProducts());

  const [categories, setCategories] = useState(() => readProductCategories());

  const [keyword, setKeyword] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [categoryName, setCategoryName] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);

  /* =====================================================
       ĐỒNG BỘ
    ===================================================== */

  useEffect(() => {
    const handleProducts = () => {
      setProducts(readProducts());
    };

    const handleCategories = () => {
      setCategories(readProductCategories());
    };

    window.addEventListener("storage", (event) => {
      if (event.key === PRODUCT_STORAGE_KEY) {
        handleProducts();
      }
    });

    window.addEventListener("flower-shop-products-updated", handleProducts);

    window.addEventListener("flower-shop-categories-updated", handleCategories);

    return () => {
      window.removeEventListener(
        "flower-shop-products-updated",
        handleProducts
      );

      window.removeEventListener(
        "flower-shop-categories-updated",
        handleCategories
      );
    };
  }, []);

  /* =====================================================
       DANH SÁCH LỌC
    ===================================================== */

  const filteredProducts = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    if (!q) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.category, product.badge, product.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [keyword, products]);

  /* =====================================================
       LƯU PRODUCTS
    ===================================================== */

  const persistProducts = (nextProducts) => {
    setProducts(nextProducts);

    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(nextProducts));

    window.dispatchEvent(new Event("flower-shop-products-updated"));
  };

  /* =====================================================
       FORM
    ===================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  /* =====================================================
       ẢNH
    ===================================================== */

  const handleImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn đúng file hình ảnh.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Ảnh sản phẩm không được vượt quá 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setFormData((current) => ({
        ...current,
        image: String(reader.result || ""),
      }));
    };

    reader.readAsDataURL(file);
  };

  /* =====================================================
       THÊM DANH MỤC
    ===================================================== */

  const handleAddCategory = (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const label = categoryName.trim();

    if (!label) {
      setError("Vui lòng nhập tên danh mục.");
      return;
    }

    const query = slugifyCategory(label);

    if (!query) {
      setError("Tên danh mục không hợp lệ.");
      return;
    }

    const exists = categories.some(
      (item) =>
        item.query === query || item.label.toLowerCase() === label.toLowerCase()
    );

    if (exists) {
      setError("Danh mục này đã tồn tại.");
      return;
    }

    const newCategory = {
      id: query,
      label,
      query,
    };

    const nextCategories = [...categories, newCategory];

    saveProductCategories(nextCategories);

    setCategories(nextCategories);

    setCategoryName("");

    setMessage(`Đã thêm danh mục "${label}". Header sẽ tự động cập nhật.`);
  };

  /* =====================================================
       THÊM SẢN PHẨM
    ===================================================== */

  const handleCreate = (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const name = formData.name.trim();

    const price = Number(formData.price);

    if (!name) {
      setError("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Giá sản phẩm phải lớn hơn 0.");
      return;
    }

    if (!formData.category) {
      setError("Vui lòng chọn danh mục sản phẩm.");
      return;
    }

    const product = {
      id: `product-${Date.now()}`,

      name,

      price,

      oldPrice: formData.oldPrice ? Number(formData.oldPrice) : "",

      badge: formData.badge.trim(),

      category: formData.category,

      description: formData.description.trim(),

      image: formData.image || "",

      createdAt: new Date().toISOString(),
    };

    try {
      persistProducts([...products, product]);

      setFormData(EMPTY_FORM);

      setMessage("Đã thêm sản phẩm thành công.");
    } catch (storageError) {
      console.error(storageError);

      setError("Không thể lưu sản phẩm.");
    }
  };

  /* =====================================================
       MỞ MODAL CHỈNH SỬA
    ===================================================== */

  const startEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",

      price: product.price ?? "",

      oldPrice: product.oldPrice ?? "",

      badge: product.badge || "",

      category: product.category || "",

      description: product.description || "",

      image: product.image || "",
    });

    setMessage("");
    setError("");
    setShowEditModal(true);
  };

  /* =====================================================
       LƯU CHỈNH SỬA
    ===================================================== */

  const handleUpdate = (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!editingProduct) {
      return;
    }

    const name = formData.name.trim();

    const price = Number(formData.price);

    if (!name) {
      setError("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Giá sản phẩm phải lớn hơn 0.");
      return;
    }

    if (!formData.category) {
      setError("Vui lòng chọn danh mục.");
      return;
    }

    const updated = products.map((product) =>
      String(product.id) === String(editingProduct.id)
        ? {
            ...product,

            name,

            price,

            oldPrice: formData.oldPrice ? Number(formData.oldPrice) : "",

            badge: formData.badge.trim(),

            category: formData.category,

            description: formData.description.trim(),

            image: formData.image || "",
          }
        : product
    );

    try {
      persistProducts(updated);

      setShowEditModal(false);

      setEditingProduct(null);

      setFormData(EMPTY_FORM);

      setMessage("Đã cập nhật sản phẩm thành công.");
    } catch (storageError) {
      console.error(storageError);

      setError("Không thể cập nhật sản phẩm.");
    }
  };

  /* =====================================================
       XÓA
    ===================================================== */

  const handleDelete = (product) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
      return;
    }

    const next = products.filter(
      (item) => String(item.id) !== String(product.id)
    );

    persistProducts(next);

    setMessage("Đã xóa sản phẩm.");
  };

  return (
    <section className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-7">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Quản lý sản phẩm
            </h1>

            <p className="mt-2 text-gray-500">
              Quản lý sản phẩm, danh mục và thông tin hiển thị.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm sản phẩm..."
                className="w-full sm:w-72 border border-gray-200 rounded-xl pl-11 pr-4 py-3 bg-white outline-none focus:border-pink-400"
              />
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
              QUẢN LÝ DANH MỤC
          ================================================= */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <FiTag />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Danh mục sản phẩm
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Danh mục mới sẽ tự động xuất hiện trong Header.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAddCategory}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="Ví dụ: Hoa tình yêu"
              className="flex-1 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400"
            />

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700"
            >
              <FiPlus />
              Thêm danh mục
            </button>
          </form>

          <div className="flex flex-wrap gap-2 mt-5">
            {categories.map((category) => (
              <span
                key={category.id}
                className="px-3 py-1.5 rounded-full bg-pink-50 text-pink-700 text-sm font-medium"
              >
                {category.label}
              </span>
            ))}
          </div>
        </div>

        {/* =================================================
              THÊM SẢN PHẨM
          ================================================= */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <FiPlus />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Thêm sản phẩm mới
              </h2>
            </div>
          </div>

          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                Tên sản phẩm *
              </label>

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Danh mục *
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white outline-none focus:border-pink-400"
              >
                <option value="">-- Chọn danh mục --</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.label}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Giá bán *
              </label>

              <input
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Giá cũ</label>

              <input
                name="oldPrice"
                type="number"
                min="0"
                value={formData.oldPrice}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nhãn</label>

              <input
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                placeholder="Bán chạy, Mới..."
                className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hình ảnh</label>

              <label className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50">
                <FiImage />
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="hidden"
                />
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Mô tả</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400 resize-y"
              />
            </div>

            {formData.image && (
              <div className="md:col-span-2">
                <img
                  src={formData.image}
                  alt="Xem trước"
                  className="w-32 h-32 rounded-xl object-cover"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700"
              >
                Thêm sản phẩm
              </button>
            </div>
          </form>
        </div>

        {/* =================================================
              DANH SÁCH
          ================================================= */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-bold">Danh sách sản phẩm</h2>

            <p className="text-sm text-gray-500 mt-1">
              {filteredProducts.length} sản phẩm
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-4">Sản phẩm</th>

                  <th className="text-left px-5 py-4">Danh mục</th>

                  <th className="text-left px-5 py-4">Giá</th>

                  <th className="text-left px-5 py-4">Nhãn</th>

                  <th className="text-right px-5 py-4">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-pink-50/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FiImage />
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-semibold">{product.name}</p>

                          <p className="text-xs text-gray-500">
                            ID: {product.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-semibold">
                        {product.category || "Chưa phân loại"}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-pink-600">
                      {money(product.price)}
                    </td>

                    <td className="px-5 py-4">{product.badge || "—"}</td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 hover:bg-pink-50"
                          title="Xem"
                        >
                          <FiEye />
                        </Link>

                        <button
                          type="button"
                          onClick={() => startEdit(product)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 hover:bg-pink-50"
                          title="Chỉnh sửa"
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50"
                          title="Xóa"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-12 text-center text-gray-500"
                    >
                      Không tìm thấy sản phẩm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =================================================
            MODAL CHỈNH SỬA
        ================================================= */}

      {showEditModal && editingProduct && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Chỉnh sửa sản phẩm
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Cập nhật thông tin sản phẩm
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);

                  setEditingProduct(null);

                  setError("");
                }}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <FiX />
              </button>
            </div>

            <form
              onSubmit={handleUpdate}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên sản phẩm *
                </label>

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Danh mục *
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white"
                >
                  <option value="">-- Chọn danh mục --</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.label}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Giá bán *
                </label>

                <input
                  name="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Giá cũ</label>

                <input
                  name="oldPrice"
                  type="number"
                  min="0"
                  value={formData.oldPrice}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nhãn</label>

                <input
                  name="badge"
                  value={formData.badge}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Hình ảnh
                </label>

                <label className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-3 cursor-pointer">
                  <FiImage />
                  Đổi ảnh
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Mô tả</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3"
                />
              </div>

              {formData.image && (
                <div className="md:col-span-2">
                  <img
                    src={formData.image}
                    alt="Xem trước"
                    className="w-32 h-32 rounded-xl object-cover"
                  />
                </div>
              )}

              {error && (
                <div className="md:col-span-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);

                    setEditingProduct(null);

                    setError("");
                  }}
                  className="flex-1 py-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminProductsPage;
