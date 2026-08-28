import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { readCatalogCategories, readCatalogProducts } from "@/data/catalog";
import { useCart } from "@/context/useCart";
import { useAuth } from "@/context/AuthContext";

const PRODUCTS_PER_PAGE = 20;
const WISHLIST_KEY = "flower-shop-wishlist";
const STAFF_ROLES = new Set(["admin", "manager", "product_manager"]);

const formatPrice = (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
const badgeClass = (badge) => badge === "Bán chạy" ? "bg-red-500 text-white" : badge === "Mới" ? "bg-green-500 text-white" : badge?.startsWith("-") ? "bg-orange-500 text-white" : "bg-pink-600 text-white";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(() => readCatalogProducts());
  const [categories, setCategories] = useState(() => readCatalogCategories());
  const [wishlistIds, setWishlistIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const activeCategory = searchParams.get("category") || "all";
  const search = searchParams.get("search") || "";
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

  useEffect(() => setCurrentPage(1), [activeCategory, search]);

  useEffect(() => {
    if (!user || isStaff) {
      setWishlistIds([]);
      return;
    }
    const key = `${WISHLIST_KEY}-${user.id || user.email}`;
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      setWishlistIds(Array.isArray(parsed) ? parsed.map(String) : []);
    } catch {
      setWishlistIds([]);
    }
  }, [user, isStaff]);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = activeCategory === "all" || product.category === activeCategory;
      const searchMatch = !keyword || [product.name, product.description, product.category, product.badge].filter(Boolean).join(" ").toLowerCase().includes(keyword);
      return categoryMatch && searchMatch;
    });
  }, [products, activeCategory, search]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = filteredProducts.length ? (safePage - 1) * PRODUCTS_PER_PAGE : 0;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, filteredProducts.length);
  const activeCategoryInfo = categories.find((category) => category.query === activeCategory);

  const changeCategory = (category) => {
    const next = {};
    if (category !== "all") next.category = category;
    if (search) next.search = search;
    setSearchParams(next);
  };

  const toggleWishlist = (product) => {
    if (!user) {
      window.alert("Vui lòng đăng nhập để thêm sản phẩm vào yêu thích.");
      return;
    }
    if (isStaff) return;
    const key = `${WISHLIST_KEY}-${user.id || user.email}`;
    const next = wishlistIds.includes(String(product.id)) ? wishlistIds.filter((id) => id !== String(product.id)) : [...wishlistIds, String(product.id)];
    localStorage.setItem(key, JSON.stringify(next));
    setWishlistIds(next);
  };

  const handleAddToCart = (product) => {
    if (isStaff) {
      window.alert("Tài khoản quản trị không có quyền mua hàng. Vui lòng sử dụng tài khoản khách hàng.");
      return;
    }
    const result = addToCart(product);
    if (!result?.success) {
      window.alert(result?.message || "Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng.");
      return;
    }
    window.alert(`Đã thêm "${product.name}" vào giỏ hàng.`);
  };

  const pages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
    const values = new Set([1, totalPages, safePage, safePage - 1, safePage + 1]);
    return [...values].filter((page) => page > 0 && page <= totalPages).sort((a, b) => a - b);
  }, [totalPages, safePage]);

  return (
    <section className="min-h-screen bg-gray-50 py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Sản phẩm</h1>
          <p className="mt-3 text-gray-500">Khám phá những mẫu hoa đẹp dành cho mọi dịp đặc biệt.</p>
          {search && <p className="mt-2 text-sm text-pink-600">Kết quả tìm kiếm cho: <strong>"{search}"</strong></p>}
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button type="button" onClick={() => changeCategory("all")} className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${activeCategory === "all" ? "bg-pink-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:text-pink-600"}`}>Tất cả</button>
          {categories.map((category) => (
            <button key={category.id} type="button" onClick={() => changeCategory(category.query)} className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${activeCategory === category.query ? "bg-pink-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:text-pink-600"}`}>{category.label}</button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{activeCategoryInfo?.label || "Tất cả sản phẩm"}</h2>
            <p className="text-sm text-gray-500 mt-1">{filteredProducts.length ? `Hiển thị ${startIndex + 1}-${endIndex}/${filteredProducts.length} sản phẩm` : "Không có sản phẩm phù hợp"}</p>
          </div>
          {isStaff && <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700">Chế độ quản trị · Không mua hàng</span>}
        </div>

        {currentProducts.length ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {currentProducts.map((product) => {
                const favorite = wishlistIds.includes(String(product.id));
                return (
                  <article key={product.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition">
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <Link to={`/products/${product.id}`}><img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /></Link>
                      {product.badge && <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${badgeClass(product.badge)}`}>{product.badge}</span>}
                      {!isStaff && <button type="button" onClick={() => toggleWishlist(product)} className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow-sm ${favorite ? "text-pink-600 bg-pink-50" : "text-gray-500 hover:text-pink-600"}`} aria-label={favorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}><FiHeart className={favorite ? "fill-current" : ""} /></button>}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-pink-600 font-medium mb-1">{categories.find((category) => category.query === product.category)?.label || product.category}</p>
                      <Link to={`/products/${product.id}`}><h3 className="font-semibold text-gray-800 line-clamp-2 min-h-[48px] hover:text-pink-600 transition">{product.name}</h3></Link>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2 min-h-[40px]">{product.description}</p>
                      <div className="mt-4"><span className="text-lg font-bold text-pink-600">{formatPrice(product.price)}</span>{product.oldPrice && <span className="ml-2 text-sm text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>}</div>
                      {isStaff ? <Link to={`/products/${product.id}`} className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:border-pink-400 hover:text-pink-600 transition">Xem chi tiết</Link> : <button type="button" onClick={() => handleAddToCart(product)} className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pink-600 text-white font-medium hover:bg-pink-700 transition"><FiShoppingCart />Thêm vào giỏ</button>}
                    </div>
                  </article>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
                <button type="button" disabled={safePage === 1} onClick={() => setCurrentPage(safePage - 1)} className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center disabled:opacity-40"><FiChevronLeft /></button>
                {pages.map((page, index) => (
                  <span key={page} className="flex items-center gap-2">
                    {index > 0 && page - pages[index - 1] > 1 && <span className="text-gray-400">…</span>}
                    <button type="button" onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-10 h-10 rounded-lg font-medium ${safePage === page ? "bg-pink-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:text-pink-600"}`}>{page}</button>
                  </span>
                ))}
                <button type="button" disabled={safePage === totalPages} onClick={() => setCurrentPage(safePage + 1)} className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center disabled:opacity-40"><FiChevronRight /></button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center"><p className="text-gray-500">Không tìm thấy sản phẩm phù hợp.</p><button type="button" onClick={() => setSearchParams({})} className="mt-4 text-pink-600 font-medium">Xóa bộ lọc</button></div>
        )}
      </div>
    </section>
  );
};

export default ProductsPage;
