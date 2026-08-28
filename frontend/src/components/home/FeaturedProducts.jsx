import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { readCatalogCategories, readCatalogProducts } from "@/data/catalog";

const FeaturedProducts = () => {
  const [products, setProducts] = useState(() => readCatalogProducts());
  const [categories, setCategories] = useState(() => readCatalogCategories());

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

  const featuredByCategory = useMemo(() => categories.map((category) => ({
    ...category,
    products: products.filter((product) => product.category === category.query)
      .slice()
      .sort((a, b) => {
        const newScore = Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
        if (newScore !== 0) return newScore;
        return Number(b.salesCount || 0) - Number(a.salesCount || 0);
      })
      .slice(0, 4),
  })), [categories, products]);

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Sản phẩm nổi bật</h2>
          <p className="mt-2 text-gray-500">Những sản phẩm mới và được yêu thích nhất.</p>
        </div>
        {featuredByCategory.map((category) => (
          <div key={category.id} className="mb-14 last:mb-0">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">{category.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{category.summary || "Sản phẩm nổi bật"}</p>
              </div>
              <Link to={`/products?category=${category.query}`} className="text-sm font-medium text-pink-600 hover:text-pink-700 transition">Xem tất cả →</Link>
            </div>
            {category.products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                {category.products.map((product) => (
                  <article key={product.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <Link to={`/products/${product.id}`} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {product.badge && <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-pink-600 text-white text-[10px] md:text-xs font-semibold">{product.badge}</span>}
                      </div>
                    </Link>
                    <div className="p-3 md:p-4">
                      <Link to={`/products/${product.id}`}><h4 className="font-semibold text-sm md:text-base text-gray-800 hover:text-pink-600 line-clamp-2 min-h-[40px] md:min-h-[48px] transition">{product.name}</h4></Link>
                      <div className="mt-2"><span className="text-sm md:text-base font-bold text-pink-600">{formatPrice(product.price)}</span>{product.oldPrice && <span className="ml-1 text-[11px] md:text-xs text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>}</div>
                      {typeof product.salesCount === "number" && <p className="mt-1 text-xs text-gray-400">Đã bán {product.salesCount}</p>}
                      <Link to={`/products/${product.id}`} className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-pink-600 text-white text-xs md:text-sm font-medium hover:bg-pink-700 transition"><FiShoppingCart size={15} />Xem sản phẩm</Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">Chưa có sản phẩm trong danh mục này.</div>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
