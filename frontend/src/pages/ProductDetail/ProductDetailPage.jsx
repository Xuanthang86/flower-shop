import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHeart, FiShoppingCart, FiCheck } from "react-icons/fi";

import { PRODUCT_CATEGORIES, products } from "@/data/products";
import { useCart } from "@/context/useCart";
import { useAuth } from "@/context/AuthContext";

const WISHLIST_KEY = "flower-shop-wishlist";

const ProductDetailPage = () => {
  /*
  ==========================================================
  ROUTE PARAMETER
  ==========================================================

  AppRoutes.jsx đang dùng:

  /products/:productId

  Vì vậy phải lấy productId.
  ==========================================================
  */

  const { productId } = useParams();

  const navigate = useNavigate();

  const { addToCart } = useCart();

  const { user } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);

  /*
  ==========================================================
  TÌM SẢN PHẨM
  ==========================================================
  */

  const product = products.find((item) => item.id === Number(productId));

  /*
  ==========================================================
  DANH MỤC
  ==========================================================
  */

  const category = product
    ? PRODUCT_CATEGORIES.find((item) => item.slug === product.category)
    : null;

  /*
  ==========================================================
  KIỂM TRA YÊU THÍCH
  ==========================================================
  */

  useEffect(() => {
    if (!user || !product) {
      setIsFavorite(false);
      return;
    }

    const userId = user.id || user.email;

    try {
      const raw = localStorage.getItem(`${WISHLIST_KEY}-${userId}`);

      const ids = raw ? JSON.parse(raw) : [];

      setIsFavorite(
        Array.isArray(ids) && ids.map(String).includes(String(product.id))
      );
    } catch {
      setIsFavorite(false);
    }
  }, [user, product]);

  /*
  ==========================================================
  SẢN PHẨM LIÊN QUAN
  ==========================================================
  */

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return products
      .filter(
        (item) => item.category === product.category && item.id !== product.id
      )
      .sort((a, b) => {
        const aIsNew = a.isNew ? 1 : 0;
        const bIsNew = b.isNew ? 1 : 0;

        if (aIsNew !== bIsNew) {
          return bIsNew - aIsNew;
        }

        return (b.salesCount || 0) - (a.salesCount || 0);
      })
      .slice(0, 4);
  }, [product]);

  /*
  ==========================================================
  FORMAT GIÁ
  ==========================================================
  */

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  /*
  ==========================================================
  THÊM GIỎ HÀNG
  ==========================================================
  */

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    const result = addToCart(product);

    if (!result?.success) {
      window.alert(
        result?.message ||
          "Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng."
      );

      navigate("/login", {
        state: {
          from: `/products/${product.id}`,
        },
      });

      return;
    }

    window.alert(`Đã thêm "${product.name}" vào giỏ hàng.`);
  };

  /*
  ==========================================================
  YÊU THÍCH
  ==========================================================
  */

  const handleToggleFavorite = () => {
    if (!product) {
      return;
    }

    if (!user) {
      window.alert("Vui lòng đăng nhập để thêm sản phẩm vào yêu thích.");

      navigate("/login", {
        state: {
          from: `/products/${product.id}`,
        },
      });

      return;
    }

    const userId = user.id || user.email;

    const key = `${WISHLIST_KEY}-${userId}`;

    let ids = [];

    try {
      const raw = localStorage.getItem(key);

      const parsed = raw ? JSON.parse(raw) : [];

      ids = Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      ids = [];
    }

    const productIdString = String(product.id);

    let updatedIds;

    if (ids.includes(productIdString)) {
      updatedIds = ids.filter((id) => id !== productIdString);
    } else {
      updatedIds = [...ids, productIdString];
    }

    localStorage.setItem(key, JSON.stringify(updatedIds));

    setIsFavorite(updatedIds.includes(productIdString));
  };

  /*
  ==========================================================
  KHÔNG TÌM THẤY
  ==========================================================
  */

  if (!product) {
    return (
      <section className="min-h-[70vh] bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
            <h1 className="text-2xl font-bold text-gray-800">
              Không tìm thấy sản phẩm
            </h1>

            <p className="mt-3 text-gray-500">
              Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã được cập nhật.
            </p>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-pink-600 text-white font-medium hover:bg-pink-700 transition"
            >
              <FiArrowLeft />
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (
    <section className="min-h-screen bg-gray-50 py-8 md:py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* BACK */}

        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-pink-600 mb-5 transition"
        >
          <FiArrowLeft />
          Quay lại sản phẩm
        </Link>

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 mb-5">
          <Link to="/products" className="hover:text-pink-600">
            Sản phẩm
          </Link>

          <span>/</span>

          {category && (
            <>
              <Link
                to={`/products?category=${category.slug}`}
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                {category.name}
              </Link>

              <span>/</span>
            </>
          )}

          <span className="text-gray-500 line-clamp-1">{product.name}</span>
        </div>

        {/* PRODUCT MAIN */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-[0.9fr_1.1fr]">
            {/* IMAGE */}

            <div className="bg-gray-50 p-4 md:p-6">
              <div className="aspect-square max-w-md mx-auto overflow-hidden rounded-2xl bg-white">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* INFO */}

            <div className="p-6 md:p-8 lg:p-10">
              {/* CATEGORY */}

              {category && (
                <Link
                  to={`/products?category=${category.slug}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-pink-50 text-pink-600 text-xs font-semibold hover:bg-pink-100 transition"
                >
                  {category.name}
                </Link>
              )}

              {/* NAME */}

              <h1 className="mt-4 text-2xl md:text-3xl font-bold text-gray-800">
                {product.name}
              </h1>

              {/* BADGE */}

              {product.badge && (
                <div className="mt-3">
                  <span className="inline-flex px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-semibold">
                    {product.badge}
                  </span>
                </div>
              )}

              {/* PRICE */}

              <div className="mt-5 flex items-center gap-3 flex-wrap">
                <span className="text-2xl md:text-3xl font-bold text-pink-600">
                  {formatPrice(product.price)}
                </span>

                {product.oldPrice && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>

              {/* SALES */}

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                {typeof product.salesCount === "number" && (
                  <span>
                    Đã bán{" "}
                    <strong className="text-gray-700">
                      {product.salesCount}
                    </strong>
                  </span>
                )}

                {product.isNew && (
                  <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                    <FiCheck />
                    Sản phẩm mới
                  </span>
                )}
              </div>

              {/* SHORT DIVIDER */}

              <div className="my-6 border-t border-gray-100" />

              {/* ACTION */}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 transition"
                >
                  <FiShoppingCart />
                  Thêm vào giỏ
                </button>

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`sm:w-14 h-12 sm:h-auto rounded-xl border flex items-center justify-center transition ${
                    isFavorite
                      ? "border-pink-300 bg-pink-50 text-pink-600"
                      : "border-gray-200 text-gray-500 hover:text-pink-600 hover:border-pink-300"
                  }`}
                  aria-label={
                    isFavorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"
                  }
                >
                  <FiHeart
                    className={isFavorite ? "fill-current" : ""}
                    size={20}
                  />
                </button>
              </div>

              {isFavorite && (
                <p className="mt-3 text-xs text-pink-600">
                  Sản phẩm đã được thêm vào yêu thích.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}

        <div className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800">Mô tả sản phẩm</h2>

          <div className="mt-4 text-gray-600 leading-7">
            <p>{product.description}</p>
          </div>
        </div>

        {/* RELATED PRODUCTS */}

        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  Sản phẩm liên quan
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Những sản phẩm khác trong cùng danh mục.
                </p>
              </div>

              {category && (
                <Link
                  to={`/products?category=${category.slug}`}
                  className="text-sm font-medium text-pink-600 hover:text-pink-700"
                >
                  Xem tất cả →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {relatedProducts.map((relatedProduct) => (
                <article
                  key={relatedProduct.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition group"
                >
                  <Link to={`/products/${relatedProduct.id}`}>
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />

                      {relatedProduct.badge && (
                        <span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-pink-600 text-white text-[10px] font-semibold">
                          {relatedProduct.badge}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-3 md:p-4">
                    <Link to={`/products/${relatedProduct.id}`}>
                      <h3 className="font-semibold text-sm md:text-base text-gray-800 line-clamp-2 hover:text-pink-600 transition min-h-[40px] md:min-h-[48px]">
                        {relatedProduct.name}
                      </h3>
                    </Link>

                    <p className="mt-2 text-sm font-bold text-pink-600">
                      {formatPrice(relatedProduct.price)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetailPage;
