import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiHeart,
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { PRODUCT_CATEGORIES, products } from "@/data/products";
import { useCart } from "@/context/useCart";
import { useAuth } from "@/context/AuthContext";

const PRODUCTS_PER_PAGE = 20;

const WISHLIST_KEY = "flower-shop-wishlist";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category") || "all";

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlistIds, setWishlistIds] = useState([]);

  const { addToCart } = useCart();
  const { user } = useAuth();

  /*
  ==========================================================
  ĐỌC WISHLIST
  ==========================================================
  */

  useEffect(() => {
    const userId = user?.id || user?.email;

    if (!userId) {
      setWishlistIds([]);
      return;
    }

    try {
      const raw = localStorage.getItem(`${WISHLIST_KEY}-${userId}`);

      const parsed = raw ? JSON.parse(raw) : [];

      setWishlistIds(Array.isArray(parsed) ? parsed.map(String) : []);
    } catch {
      setWishlistIds([]);
    }
  }, [user]);

  /*
  ==========================================================
  DANH MỤC HIỆN TẠI
  ==========================================================
  */

  const activeCategory = categoryFromUrl;

  /*
  ==========================================================
  ĐỔI DANH MỤC
  ==========================================================
  */

  const handleCategoryChange = (category) => {
    setCurrentPage(1);

    if (category === "all") {
      setSearchParams({});
      return;
    }

    setSearchParams({
      category,
    });
  };

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
  BADGE
  ==========================================================
  */

  const getBadgeClass = (badge) => {
    if (badge === "Bán chạy") {
      return "bg-red-500 text-white";
    }

    if (badge === "Mới") {
      return "bg-green-500 text-white";
    }

    if (badge === "Nổi bật") {
      return "bg-pink-600 text-white";
    }

    if (badge?.startsWith("-")) {
      return "bg-orange-500 text-white";
    }

    return "bg-gray-500 text-white";
  };

  /*
  ==========================================================
  LỌC SẢN PHẨM
  ==========================================================
  */

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchCategory =
        activeCategory === "all" || product.category === activeCategory;

      const matchSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword);

      return matchCategory && matchSearch;
    });
  }, [activeCategory, search]);

  /*
  ==========================================================
  PHÂN TRANG
  ==========================================================
  */

  const totalProducts = filteredProducts.length;

  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex =
    totalProducts === 0 ? 0 : (safeCurrentPage - 1) * PRODUCTS_PER_PAGE;

  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);

  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  /*
  ==========================================================
  RESET PAGE KHI URL DANH MỤC THAY ĐỔI
  ==========================================================
  */

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  /*
  ==========================================================
  TÊN DANH MỤC
  ==========================================================
  */

  const getCategoryName = (slug) => {
    return (
      PRODUCT_CATEGORIES.find((category) => category.slug === slug)?.name ||
      "Danh mục sản phẩm"
    );
  };

  const isAllCategory = activeCategory === "all";

  /*
  ==========================================================
  WISHLIST
  ==========================================================
  */

  const toggleWishlist = (product) => {
    if (!user) {
      window.alert("Vui lòng đăng nhập để thêm sản phẩm vào yêu thích.");

      return;
    }

    const userId = user.id || user.email;

    const key = `${WISHLIST_KEY}-${userId}`;

    let currentIds = [];

    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];

      currentIds = Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      currentIds = [];
    }

    const productId = String(product.id);

    let updatedIds;

    if (currentIds.includes(productId)) {
      updatedIds = currentIds.filter((id) => id !== productId);
    } else {
      updatedIds = [...currentIds, productId];
    }

    localStorage.setItem(key, JSON.stringify(updatedIds));

    setWishlistIds(updatedIds);
  };

  /*
  ==========================================================
  THÊM GIỎ HÀNG
  ==========================================================
  */

  const handleAddToCart = (product) => {
    const result = addToCart(product);

    if (!result?.success) {
      window.alert(
        result?.message ||
          "Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng."
      );

      return;
    }

    window.alert(`Đã thêm "${product.name}" vào giỏ hàng.`);
  };

  /*
  ==========================================================
  CHUYỂN TRANG
  ==========================================================
  */

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

  /*
  ==========================================================
  PAGINATION
  ==========================================================
  */

  const renderPagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    return (
      <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
        <button
          type="button"
          disabled={safeCurrentPage === 1}
          onClick={() => goToPage(safeCurrentPage - 1)}
          className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pink-400 hover:text-pink-600 transition"
          aria-label="Trang trước"
        >
          <FiChevronLeft />
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page) => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={`w-10 h-10 rounded-lg font-medium transition ${
                safeCurrentPage === page
                  ? "bg-pink-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-pink-400 hover:text-pink-600"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          disabled={safeCurrentPage === totalPages}
          onClick={() => goToPage(safeCurrentPage + 1)}
          className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pink-400 hover:text-pink-600 transition"
          aria-label="Trang sau"
        >
          <FiChevronRight />
        </button>
      </div>
    );
  };

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (
    <section className="min-h-screen bg-gray-50 py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Sản phẩm
          </h1>

          <p className="mt-3 text-gray-500">
            Khám phá những mẫu hoa đẹp dành cho mọi dịp đặc biệt.
          </p>
        </div>

        {/* SEARCH */}

        <div className="max-w-xl mx-auto mb-8">
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full h-12 px-5 rounded-xl border border-gray-300 bg-white outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
          />
        </div>

        {/* CATEGORY */}

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            type="button"
            onClick={() => handleCategoryChange("all")}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${
              activeCategory === "all"
                ? "bg-pink-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:text-pink-600 hover:border-pink-300"
            }`}
          >
            Tất cả
          </button>

          {PRODUCT_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryChange(category.slug)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition ${
                activeCategory === category.slug
                  ? "bg-pink-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:text-pink-600 hover:border-pink-300"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* TOP INFO */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {isAllCategory
                ? "Tất cả sản phẩm"
                : getCategoryName(activeCategory)}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {totalProducts > 0 ? (
                <>
                  Hiển thị{" "}
                  <span className="font-semibold text-gray-800">
                    {startIndex + 1}-{endIndex}
                  </span>
                  /
                  <span className="font-semibold text-gray-800">
                    {totalProducts}
                  </span>{" "}
                  sản phẩm
                </>
              ) : (
                <>
                  Hiển thị{" "}
                  <span className="font-semibold text-gray-800">0</span>/
                  <span className="font-semibold text-gray-800">0</span> sản
                  phẩm
                </>
              )}
            </p>
          </div>
        </div>

        {/* PRODUCTS */}

        {currentProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {currentProducts.map((product) => {
                const isFavorite = wishlistIds.includes(String(product.id));

                return (
                  <article
                    key={product.id}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition"
                  >
                    {/* IMAGE */}

                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <Link to={`/products/${product.id}`}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </Link>

                      {product.badge && (
                        <span
                          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getBadgeClass(
                            product.badge
                          )}`}
                        >
                          {product.badge}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleWishlist(product)}
                        className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow-sm transition ${
                          isFavorite
                            ? "text-pink-600 bg-pink-50"
                            : "text-gray-500 hover:text-pink-600"
                        }`}
                        aria-label={
                          isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"
                        }
                      >
                        <FiHeart className={isFavorite ? "fill-current" : ""} />
                      </button>
                    </div>

                    {/* CONTENT */}

                    <div className="p-4">
                      {isAllCategory && (
                        <p className="text-xs text-pink-600 font-medium mb-1">
                          {getCategoryName(product.category)}
                        </p>
                      )}

                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-semibold text-gray-800 line-clamp-2 min-h-[48px] hover:text-pink-600 transition">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="mt-2 text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                        {product.description}
                      </p>

                      <div className="mt-4">
                        <span className="text-lg font-bold text-pink-600">
                          {formatPrice(product.price)}
                        </span>

                        {product.oldPrice && (
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pink-600 text-white font-medium hover:bg-pink-700 transition"
                      >
                        <FiShoppingCart />
                        Thêm vào giỏ
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {renderPagination()}
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp.</p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                handleCategoryChange("all");
              }}
              className="mt-4 text-pink-600 font-medium hover:text-pink-700"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsPage;
