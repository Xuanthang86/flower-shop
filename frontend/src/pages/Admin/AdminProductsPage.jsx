import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiEdit2, FiImage, FiPlus, FiSearch, FiTag, FiTrash2, FiX } from "react-icons/fi";
import { readCatalogCategories, readCatalogProducts, saveCatalogCategories, saveCatalogProducts } from "@/data/catalog";
import { slugifyCategory } from "@/constants/productCategories";
import { PERMISSIONS, useAuth } from "@/context/AuthContext";

const PAGE_SIZE = 20;
const EMPTY_PRODUCT = { name: "", price: "", oldPrice: "", badge: "", category: "", description: "", image: "" };
const EMPTY_CATEGORY = { label: "", summary: "", image: "" };
const field = "w-full border border-gray-200 rounded-lg px-4 py-3 bg-white outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100";
const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const AdminProductsPage = () => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(PERMISSIONS.CREATE_PRODUCTS);
  const canUpdate = hasPermission(PERMISSIONS.UPDATE_PRODUCTS);
  const canDelete = hasPermission(PERMISSIONS.DELETE_PRODUCTS);
  const [products, setProducts] = useState(() => readCatalogProducts());
  const [categories, setCategories] = useState(() => readCatalogCategories());
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [showCategories, setShowCategories] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [productModal, setProductModal] = useState(null);
  const [categoryModal, setCategoryModal] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const refreshProducts = () => setProducts(readCatalogProducts());
    const refreshCategories = () => setCategories(readCatalogCategories());
    window.addEventListener("storage", refreshProducts);
    window.addEventListener("flower-shop-products-updated", refreshProducts);
    window.addEventListener("storage", refreshCategories);
    window.addEventListener("flower-shop-categories-updated", refreshCategories);
    return () => {
      window.removeEventListener("storage", refreshProducts);
      window.removeEventListener("flower-shop-products-updated", refreshProducts);
      window.removeEventListener("storage", refreshCategories);
      window.removeEventListener("flower-shop-categories-updated", refreshCategories);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return products.filter((item) => !q || [item.name, item.category, item.badge, item.description].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [products, keyword]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleProducts = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const categoryName = (slug) => categories.find((item) => item.query === slug)?.label || slug || "—";
  const clearNotice = () => { setMessage(""); setError(""); };

  const handleImage = (event, setter) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Vui lòng chọn đúng file hình ảnh.");
    if (file.size > 2 * 1024 * 1024) return setError("Hình ảnh không được vượt quá 2MB.");
    const reader = new FileReader();
    reader.onload = () => setter(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const openCreateProduct = () => { clearNotice(); setProductForm({ ...EMPTY_PRODUCT, category: categories[0]?.query || "" }); setProductModal("create"); };
  const openEditProduct = (product) => { clearNotice(); setProductForm({ name: product.name || "", price: product.price ?? "", oldPrice: product.oldPrice ?? "", badge: product.badge || "", category: product.category || "", description: product.description || "", image: product.image || "" }); setProductModal(product); };
  const closeProduct = () => { setProductModal(null); setProductForm(EMPTY_PRODUCT); };

  const saveProduct = (event) => {
    event.preventDefault(); clearNotice();
    const name = productForm.name.trim(); const price = Number(productForm.price);
    if (!name) return setError("Vui lòng nhập tên sản phẩm.");
    if (!Number.isFinite(price) || price <= 0) return setError("Giá sản phẩm phải lớn hơn 0.");
    if (!productForm.category) return setError("Vui lòng chọn danh mục.");
    const data = { ...productForm, name, price, oldPrice: productForm.oldPrice === "" ? null : Number(productForm.oldPrice), badge: productForm.badge.trim(), description: productForm.description.trim(), image: productForm.image || "" };
    if (productModal === "create") {
      saveCatalogProducts([...products, { ...data, id: `product-${Date.now()}`, createdAt: new Date().toISOString(), salesCount: 0, isNew: true }]);
      setMessage("Đã thêm sản phẩm thành công.");
    } else {
      saveCatalogProducts(products.map((item) => String(item.id) === String(productModal.id) ? { ...item, ...data } : item));
      setMessage("Đã cập nhật sản phẩm thành công.");
    }
    closeProduct();
  };

  const deleteProduct = (product) => {
    if (!canDelete) return setError("Tài khoản hiện tại không có quyền xóa sản phẩm.");
    if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) return;
    saveCatalogProducts(products.filter((item) => String(item.id) !== String(product.id)));
    setMessage("Đã xóa sản phẩm.");
  };

  const openCreateCategory = () => { clearNotice(); setCategoryForm(EMPTY_CATEGORY); setCategoryModal("create"); };
  const openEditCategory = (category) => { clearNotice(); setCategoryForm({ label: category.label || "", summary: category.summary || "", image: category.image || "" }); setCategoryModal(category); };
  const closeCategory = () => { setCategoryModal(null); setCategoryForm(EMPTY_CATEGORY); };

  const saveCategory = (event) => {
    event.preventDefault(); clearNotice();
    const label = categoryForm.label.trim(); const query = slugifyCategory(label);
    if (!label || !query) return setError("Vui lòng nhập tên danh mục hợp lệ.");
    const duplicate = categories.some((item) => item.query === query && categoryModal === "create" || item.query === query && categoryModal !== "create" && item.id !== categoryModal.id);
    if (duplicate) return setError("Danh mục này đã tồn tại.");
    const data = { id: categoryModal === "create" ? query : categoryModal.id, label, query, summary: categoryForm.summary.trim(), image: categoryForm.image || "" };
    saveCatalogCategories(categoryModal === "create" ? [...categories, data] : categories.map((item) => item.id === categoryModal.id ? data : item));
    setMessage(categoryModal === "create" ? "Đã thêm danh mục." : "Đã cập nhật danh mục.");
    closeCategory();
  };

  const deleteCategory = (category) => {
    if (products.some((product) => product.category === category.query)) return setError("Không thể xóa danh mục đang có sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.");
    if (!window.confirm(`Xóa danh mục "${category.label}"?`)) return;
    saveCatalogCategories(categories.filter((item) => item.id !== category.id));
    setMessage("Đã xóa danh mục.");
  };

  return <section className="min-h-screen bg-gray-50 py-10"><div className="max-w-7xl mx-auto px-4">
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-7"><div><h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý sản phẩm</h1><p className="mt-2 text-gray-500">Danh mục và sản phẩm sử dụng chung một nguồn dữ liệu catalog.</p></div><div className="relative w-full lg:w-80"><FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /><input value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} placeholder="Tìm sản phẩm..." className={`${field} pl-11`} /></div></div>
    {message && <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700">{message}</div>}{error && <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">{error}</div>}

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden"><button type="button" onClick={() => setShowCategories((value) => !value)} className="w-full px-6 py-5 flex items-center justify-between text-left"><div className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center"><FiTag /></span><div><h2 className="text-xl font-bold text-gray-800">Danh mục sản phẩm</h2><p className="text-sm text-gray-500 mt-1">{categories.length} danh mục · {showCategories ? "Đang mở" : "Bấm để quản lý"}</p></div></div><FiChevronDown className={showCategories ? "rotate-180 transition" : "transition"} /></button>{showCategories && <div className="border-t border-gray-100 p-6"><div className="flex justify-end mb-5"><button type="button" onClick={openCreateCategory} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-pink-600 text-white font-semibold"><FiPlus />Thêm danh mục</button></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{categories.map((category) => <div key={category.id} className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50"><div className="h-36 bg-white overflow-hidden">{category.image ? <img src={category.image} alt={category.label} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-gray-300"><FiImage size={30} /></div>}</div><div className="p-4"><h3 className="font-semibold text-gray-800">{category.label}</h3><p className="mt-1 text-sm text-gray-500 line-clamp-2">{category.summary || "Chưa có tóm tắt."}</p><div className="mt-4 flex gap-2"><button onClick={() => openEditCategory(category)} className="flex-1 py-2 rounded-lg border bg-white text-gray-700 hover:text-pink-600"><FiEdit2 className="inline mr-1" />Sửa</button><button onClick={() => deleteCategory(category)} className="w-10 rounded-lg border bg-white text-gray-600 hover:text-red-600"><FiTrash2 /></button></div></div></div>)}</div></div>}</div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden"><button type="button" onClick={() => setShowCreate((value) => !value)} className="w-full px-6 py-5 flex items-center justify-between text-left"><div className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center"><FiPlus /></span><div><h2 className="text-xl font-bold text-gray-800">Thêm sản phẩm mới</h2><p className="text-sm text-gray-500 mt-1">{showCreate ? "Đang mở biểu mẫu" : "Bấm để mở biểu mẫu khi cần"}</p></div></div><FiChevronDown className={showCreate ? "rotate-180 transition" : "transition"} /></button>{showCreate && <div className="border-t p-6"><form onSubmit={(e) => { openCreateProduct(); setShowCreate(false); }}><button type="submit" className="px-5 py-3 rounded-lg bg-pink-600 text-white font-semibold"><FiPlus className="inline mr-2" />Mở biểu mẫu thêm sản phẩm</button></form></div>}</div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"><div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between"><div><h2 className="text-xl font-bold text-gray-800">Danh sách sản phẩm</h2><p className="text-sm text-gray-500 mt-1">Hiển thị tối đa {PAGE_SIZE} sản phẩm mỗi trang · {filtered.length} sản phẩm</p></div></div><div className="overflow-x-auto"><table className="w-full min-w-[950px]"><thead className="bg-gray-50"><tr>{["Sản phẩm","Danh mục","Giá","Trạng thái","Thao tác"].map((title) => <th key={title} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">{title}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{visibleProducts.map((product) => <tr key={product.id} className="hover:bg-gray-50"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">{product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}</div><div><Link to={`/products/${product.id}`} className="font-semibold text-gray-800 hover:text-pink-600">{product.name}</Link><p className="text-xs text-gray-400 mt-1">ID: {product.id}</p></div></div></td><td className="px-5 py-4 text-sm text-gray-600">{categoryName(product.category)}</td><td className="px-5 py-4"><span className="font-semibold text-pink-600">{money(product.price)}</span>{product.oldPrice && <span className="block text-xs text-gray-400 line-through">{money(product.oldPrice)}</span>}</td><td className="px-5 py-4 text-sm text-gray-600">{product.badge || (product.isNew ? "Mới" : "Đang bán")}</td><td className="px-5 py-4"><div className="flex gap-2"><button disabled={!canUpdate} onClick={() => openEditProduct(product)} className="w-9 h-9 rounded-lg border flex items-center justify-center hover:text-pink-600 disabled:opacity-40" title="Sửa"><FiEdit2 /></button>{canDelete && <button onClick={() => deleteProduct(product)} className="w-9 h-9 rounded-lg border flex items-center justify-center hover:text-red-600" title="Xóa"><FiTrash2 /></button>}</div></td></tr>)}</tbody></table></div>{!visibleProducts.length && <div className="p-12 text-center text-gray-500">Không tìm thấy sản phẩm.</div>}{totalPages > 1 && <div className="px-6 py-4 border-t flex justify-center gap-2 flex-wrap">{Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => <button key={number} onClick={() => { setPage(number); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-10 h-10 rounded-lg ${safePage === number ? "bg-pink-600 text-white" : "border bg-white text-gray-600"}`}>{number}</button>)}</div>}</div>
  </div>

  {(productModal || categoryModal) && <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">{productModal && <><div className="sticky top-0 z-10 bg-white border-b px-6 py-5 flex justify-between"><div><h2 className="text-xl font-bold">{productModal === "create" ? "Thêm sản phẩm" : "Chỉnh sửa sản phẩm"}</h2><p className="text-sm text-gray-500 mt-1">Dữ liệu được lưu vào catalog dùng chung.</p></div><button onClick={closeProduct}><FiX /></button></div><form onSubmit={saveProduct} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-sm font-medium mb-2">Tên sản phẩm *</label><input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className={field} required /></div><div><label className="block text-sm font-medium mb-2">Danh mục *</label><select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className={field} required><option value="">-- Chọn danh mục --</option>{categories.map((category) => <option key={category.id} value={category.query}>{category.label}</option>)}</select></div><div><label className="block text-sm font-medium mb-2">Giá *</label><input type="number" min="1" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className={field} required /></div><div><label className="block text-sm font-medium mb-2">Giá cũ</label><input type="number" min="0" value={productForm.oldPrice} onChange={(e) => setProductForm({ ...productForm, oldPrice: e.target.value })} className={field} /></div><div><label className="block text-sm font-medium mb-2">Nhãn</label><input value={productForm.badge} onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })} className={field} placeholder="Mới / Bán chạy / -10%" /></div><div><label className="block text-sm font-medium mb-2">Hình ảnh</label><input type="file" accept="image/*" onChange={(e) => handleImage(e, (image) => setProductForm((current) => ({ ...current, image })))} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-pink-50 file:text-pink-700" />{productForm.image && <img src={productForm.image} alt="Xem trước" className="mt-3 w-24 h-24 rounded-lg object-cover" />}</div><div className="md:col-span-2"><label className="block text-sm font-medium mb-2">Mô tả</label><textarea rows="4" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className={field} /></div><div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={closeProduct} className="px-5 py-3 rounded-lg border">Hủy</button><button className="px-6 py-3 rounded-lg bg-pink-600 text-white font-semibold">Lưu</button></div></form></>}
  {categoryModal && <><div className="sticky top-0 z-10 bg-white border-b px-6 py-5 flex justify-between"><div><h2 className="text-xl font-bold">{categoryModal === "create" ? "Thêm danh mục" : "Chỉnh sửa danh mục"}</h2><p className="text-sm text-gray-500 mt-1">Tên, tóm tắt và hình ảnh được quản lý cùng một nơi.</p></div><button onClick={closeCategory}><FiX /></button></div><form onSubmit={saveCategory} className="p-6 space-y-5"><div><label className="block text-sm font-medium mb-2">Tên danh mục *</label><input value={categoryForm.label} onChange={(e) => setCategoryForm({ ...categoryForm, label: e.target.value })} className={field} required /></div><div><label className="block text-sm font-medium mb-2">Tóm tắt danh mục</label><textarea rows="3" value={categoryForm.summary} onChange={(e) => setCategoryForm({ ...categoryForm, summary: e.target.value })} className={field} placeholder="Mô tả ngắn để hiển thị ở trang chủ..." /></div><div><label className="block text-sm font-medium mb-2">Hình ảnh danh mục</label><input type="file" accept="image/*" onChange={(e) => handleImage(e, (image) => setCategoryForm((current) => ({ ...current, image })))} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-pink-50 file:text-pink-700" />{categoryForm.image && <img src={categoryForm.image} alt="Xem trước danh mục" className="mt-3 w-full h-44 rounded-xl object-cover" />}</div><div className="flex justify-end gap-3"><button type="button" onClick={closeCategory} className="px-5 py-3 rounded-lg border">Hủy</button><button className="px-6 py-3 rounded-lg bg-pink-600 text-white font-semibold">Lưu danh mục</button></div></form></>}
  </div></div>}
  </section>;
};

export default AdminProductsPage;
