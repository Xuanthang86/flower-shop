import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { products } from "@/data/products";

const WISHLIST_KEY = "flower-shop-wishlist";

const readWishlist = (userId) => {
  try {
    const raw = localStorage.getItem(`${WISHLIST_KEY}-${userId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const WishlistPage = () => {
  const { user } = useAuth();
  const ids = useMemo(
    () => readWishlist(user?.id || user?.email || "guest"),
    [user]
  );
  const items = useMemo(
    () => products.filter((p) => ids.includes(String(p.id))),
    [ids]
  );

  return (
    <section className="min-h-[70vh] bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
            <FiHeart size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Sản phẩm yêu thích
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Các sản phẩm bạn đã lưu.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FiHeart className="mx-auto text-gray-300" size={48} />
            <h2 className="mt-4 text-lg font-semibold text-gray-800">
              Chưa có sản phẩm yêu thích
            </h2>
            <p className="mt-2 text-gray-500">
              Hãy thêm sản phẩm vào danh sách yêu thích để xem tại đây.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700"
            >
              <FiArrowLeft /> Xem sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full aspect-square object-cover bg-gray-100"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="mt-2 font-bold text-pink-600">
                    {Number(product.price || 0).toLocaleString("vi-VN")} ₫
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WishlistPage;
