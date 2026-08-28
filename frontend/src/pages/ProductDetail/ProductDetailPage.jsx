import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiHeart, FiShoppingCart, FiCheck, FiShield } from "react-icons/fi";
import { readCatalogCategories, readCatalogProducts } from "@/data/catalog";
import { useCart } from "@/context/useCart";
import { useAuth } from "@/context/AuthContext";

const WISHLIST_KEY = "flower-shop-wishlist";
const STAFF_ROLES = new Set(["admin", "manager", "product_manager"]);
const formatPrice = (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState(() => readCatalogProducts());
  const [categories, setCategories] = useState(() => readCatalogCategories());
  const [isFavorite, setIsFavorite] = useState(false);
  const isStaff = STAFF_ROLES.has(user?.role);

  useEffect(() => {
    const refresh = () => {
      setProducts(readCatalogProducts());
      setCategories(readCatalogCategories());
    };
    window.addEventListener("storage", refresh);
    window.addEventListener("flower-shop-products-updated", refresh);
    window.addEventListener("flower-shop-categories-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("flower-shop-products-updated", refresh);
      window.removeEventListener("flower-shop-categories-updated", refresh);
    };
  }, []);

  const product = useMemo(() => products.find((item) => String(item.id) === String(productId)) || null, [products, productId]);
  const category = categories.find((item) => item.query === product?.category) || null;

  useEffect(() => {
    if (!user || isStaff || !product) {
      setIsFavorite(false);
      return;
    }
    try {
      const raw = localStorage.getItem(`${WISHLIST_KEY}-${user.id || user.email}`);
      const ids = raw ? JSON.parse(raw) : [];
      setIsFavorite(Array.isArray(ids) && ids.map(String).includes(String(product.id)));
    } catch {
      setIsFavorite(false);
    }
  }, [user, isStaff, product]);

  const relatedProducts = useMemo(() => product ? products.filter((item) => item.category === product.category && String(item.id) !== String(product.id)).slice().sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) || Number(b.salesCount || 0) - Number(a.salesCount || 0)).slice(0, 4) : [], [products, product]);

  const handleAddToCart = () => {
    if (!product) return;
    if (isStaff) {
      window.alert("Tài khoản quản trị không có quyền mua hàng. Vui lòng sử dụng tài khoản khách hàng.");
      return;
    }
    const result = addToCart(product);
    if (!result?.success) {
      window.alert(result?.message || "Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng.");
      navigate("/login", { state: { from: `/products/${product.id}` } });
      return;
    }
    window.alert(`Đã thêm "${product.name}" vào giỏ hàng.`);
  };

  const toggleFavorite = () => {
    if (!product) return;
    if (isStaff) return;
    if (!user) {
      window.alert("Vui lòng đăng nhập để thêm sản phẩm vào yêu thích.");
      navigate("/login", { state: { from: `/products/${product.id}` } });
      return;
    }
    const key = `${WISHLIST_KEY}-${user.id || user.email}`;
    let ids = [];
    try { ids = JSON.parse(localStorage.getItem(key) || "[]"); } catch { ids = []; }
    ids = Array.isArray(ids) ? ids.map(String) : [];
    const id = String(product.id);
    const updated = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
    localStorage.setItem(key, JSON.stringify(updated));
    setIsFavorite(updated.includes(id));
  };

  if (!product) {
    return <section className="min-h-[70vh] bg-gray-50 py-16"><div className="max-w-5xl mx-auto px-4 text-center"><div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10"><h1 className="text-2xl font-bold text-gray-800">Không tìm thấy sản phẩm</h1><p className="mt-3 text-gray-500">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã được cập nhật.</p><Link to="/products" className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-pink-600 text-white font-medium"><FiArrowLeft />Xem sản phẩm</Link></div></div></section>;
  }

  return (
    <section className="min-h-screen bg-gray-50 py-8 md:py-10">
      <div className="max-w-5xl mx-auto px-4">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-pink-600 mb-5"><FiArrowLeft />Quay lại sản phẩm</Link>
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 mb-5"><Link to="/products">Sản phẩm</Link><span>/</span>{category && <><Link to={`/products?category=${category.query}`} className="text-pink-600 font-medium">{category.label}</Link><span>/</span></>}<span className="text-gray-500 line-clamp-1">{product.name}</span></div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-gray-50 p-4 md:p-6"><div className="aspect-square max-w-md mx-auto overflow-hidden rounded-2xl bg-white"><img src={product.image} alt={product.name} className="w-full h-full object-cover" /></div></div>
            <div className="p-6 md:p-8 lg:p-10">
              {category && <Link to={`/products?category=${category.query}`} className="inline-flex px-3 py-1.5 rounded-full bg-pink-50 text-pink-600 text-xs font-semibold">{category.label}</Link>}
              <h1 className="mt-4 text-2xl md:text-3xl font-bold text-gray-800">{product.name}</h1>
              {product.badge && <div className="mt-3"><span className="inline-flex px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-semibold">{product.badge}</span></div>}
              <div className="mt-5 flex items-center gap-3 flex-wrap"><span className="text-2xl md:text-3xl font-bold text-pink-600">{formatPrice(product.price)}</span>{product.oldPrice && <span className="text-base text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>}</div>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">{typeof product.salesCount === "number" && <span>Đã bán <strong className="text-gray-700">{product.salesCount}</strong></span>}{product.isNew && <span className="inline-flex items-center gap-1 text-green-600 font-medium"><FiCheck />Sản phẩm mới</span>}</div>
              <div className="my-6 border-t border-gray-100" />

              {isStaff ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start gap-3"><FiShield className="mt-0.5 text-amber-600 shrink-0" size={20} /><div><h2 className="font-semibold text-amber-900">Chế độ quản trị</h2><p className="mt-1 text-sm text-amber-800">Tài khoản Admin, Manager và Quản lý sản phẩm chỉ dùng để quản lý hệ thống và không có quyền mua hàng.</p></div></div>
                  <Link to="/admin/products" className="mt-4 inline-flex px-4 py-2.5 rounded-lg bg-white border border-amber-200 text-amber-800 font-medium hover:bg-amber-100">Quay lại quản lý</Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700"><FiShoppingCart />Thêm vào giỏ</button>
                  <button type="button" onClick={toggleFavorite} className={`sm:w-14 h-12 sm:h-auto rounded-xl border flex items-center justify-center ${isFavorite ? "border-pink-300 bg-pink-50 text-pink-600" : "border-gray-200 text-gray-500 hover:text-pink-600"}`} aria-label={isFavorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}><FiHeart className={isFavorite ? "fill-current" : ""} size={20} /></button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8"><h2 className="text-xl font-bold text-gray-800">Mô tả sản phẩm</h2><p className="mt-4 text-gray-600 leading-7">{product.description}</p></div>

        {relatedProducts.length > 0 && <div className="mt-10"><div className="flex items-center justify-between mb-5"><div><h2 className="text-xl md:text-2xl font-bold text-gray-800">Sản phẩm liên quan</h2><p className="mt-1 text-sm text-gray-500">Những sản phẩm khác trong cùng danh mục.</p></div>{category && <Link to={`/products?category=${category.query}`} className="text-sm font-medium text-pink-600">Xem tất cả →</Link>}</div><div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">{relatedProducts.map((item) => <article key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition"><Link to={`/products/${item.id}`}><div className="aspect-square overflow-hidden bg-gray-100"><img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition" /></div></Link><div className="p-3 md:p-4"><Link to={`/products/${item.id}`}><h3 className="font-semibold text-sm md:text-base text-gray-800 line-clamp-2">{item.name}</h3></Link><p className="mt-2 text-sm font-bold text-pink-600">{formatPrice(item.price)}</p></div></article>)}</div></div>}
      </div>
    </section>
  );
};

export default ProductDetailPage;
