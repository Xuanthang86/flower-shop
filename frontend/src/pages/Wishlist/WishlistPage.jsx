import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { FiArrowLeft, FiHeart } from "react-icons/fi";

import { useAuth } from "@/context/AuthContext";

import { readProducts, PRODUCT_UPDATED_EVENT } from "@/services/catalog";

import ProductCard from "@/components/product/ProductCard";

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

  const [products, setProducts] = useState(() => readProducts());

  useEffect(() => {
    const refresh = () => setProducts(readProducts());

    window.addEventListener(PRODUCT_UPDATED_EVENT, refresh);

    return () => window.removeEventListener(PRODUCT_UPDATED_EVENT, refresh);
  }, []);

  const ids = useMemo(
    () => readWishlist(user?.id || user?.email || "guest"),
    [user]
  );

  const items = useMemo(
    () => products.filter((product) => ids.includes(String(product.id))),
    [products, ids]
  );

  return (
    <section className="min-h-[70vh] bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
            <FiHeart size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Sản phẩm yêu thích
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Các sản phẩm bạn đã lưu.
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <FiHeart className="mx-auto text-gray-300" size={48} />

            <h2 className="mt-4 text-lg font-semibold text-gray-800">
              Chưa có sản phẩm yêu thích
            </h2>

            <p className="mt-2 text-gray-500">
              Hãy thêm sản phẩm vào danh sách yêu thích để xem tại đây.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white hover:bg-pink-700"
            >
              <FiArrowLeft />
              Xem sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WishlistPage;
