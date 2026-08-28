/*
============================================================
FLOWER SHOP — PRODUCTS PAGE
============================================================

CẬP NHẬT:
- Không còn thanh tìm kiếm thứ hai.
- Search duy nhất nằm ở Header/SearchBox.
- Đọc search từ URL.
- Đọc category từ URL.
- Đọc products từ catalog.js.
- Đọc categories từ catalog.js.
- 20 sản phẩm/trang.
- Đồng bộ khi Admin thay đổi sản phẩm/danh mục.
- Không tạo data sản phẩm riêng.
============================================================
*/

import { useEffect, useMemo, useState } from "react";

import { Link, useSearchParams } from "react-router-dom";

import {
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiShoppingCart,
} from "react-icons/fi";

import {
  readProducts,
  readCategories,
  PRODUCT_UPDATED_EVENT,
  CATEGORY_UPDATED_EVENT,
} from "@/services/catalog";

import { useCart } from "@/context/useCart";
import { useAuth } from "@/context/AuthContext";

const PRODUCTS_PER_PAGE = 20;

const WISHLIST_KEY = "flower-shop-wishlist";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price || 0));

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { addToCart } = useCart();

  const { user } = useAuth();

  const [products, setProducts] = useState(() => readProducts());

  const [categories, setCategories] = useState(() => readCategories());

  const [wishlistIds, setWishlistIds] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  /*
  ==========================================================
  URL STATE
  ==========================================================
  */

  const activeCategory = searchParams.get("category") || "all";

  const searchKeyword = searchParams.get("search") || "";

  /*
  ==========================================================
  SYNC CATALOG
  ==========================================================
  */

  useEffect(() => {
    const refreshProducts = () => {
      setProducts(readProducts());
    };

    const refreshCategories = () => {
      setCategories(readCategories());
    };

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
  ==========================================================
  WISHLIST
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
  FILTER
  ==========================================================
  */

  const filteredProducts = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return products.filter((product) => {
      const matchCategory =
        activeCategory === "all" ||
        String(product.category) === String(activeCategory);

      if (!matchCategory) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [
        product.name,
        product.category,
        product.description,
        product.badge,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [products, activeCategory, searchKeyword]);

  /*
  ==========================================================
  RESET PAGE
  ==========================================================
  */

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchKeyword]);

  /*
  ==========================================================
  PAGINATION
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
  CATEGORY
  ==========================================================
  */

  const activeCategories = categories
    .filter((category) => category.active !== false)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

  const getCategoryName = (slug) => {
    if (slug === "all") {
      return "Tất cả sản phẩm";
    }

    return (
      categories.find((category) => String(category.slug) === String(slug))
        ?.name || "Danh mục sản phẩm"
    );
  };

  /*
  ==========================================================
  CHANGE CATEGORY
  ==========================================================
  */

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);

    params.delete("search");

    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    setSearchParams(params);

    setCurrentPage(1);
  };

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

    const updatedIds = currentIds.includes(productId)
      ? currentIds.filter((id) => id !== productId)
      : [...currentIds, productId];

    localStorage.setItem(key, JSON.stringify(updatedIds));

    setWishlistIds(updatedIds);
  };

  /*
  ==========================================================
  ADD CART
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
  PAGINATION
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

  const renderPagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    return (
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          disabled={safeCurrentPage === 1}
          onClick={() => goToPage(safeCurrentPage - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-pink-400 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Trang trước"
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
            className={`h-10 w-10 rounded-lg font-medium transition ${
              safeCurrentPage === page
                ? "bg-pink-600 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:border-pink-400 hover:text-pink-600"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          disabled={safeCurrentPage === totalPages}
          onClick={() => goToPage(safeCurrentPage + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-pink-400 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
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
    <section className="min-h-screen bg-gray-50 py-8 md:py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* TITLE */}
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">
            Sản phẩm
          </h1>

          <p className="mt-2 text-gray-500">
            Khám phá những mẫu hoa đẹp dành cho mọi dịp đặc biệt.
          </p>
        </div>

        {/* CATEGORY */}
        <div className="mb-7 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={() => handleCategoryChange("all")}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
              activeCategory === "all"
                ? "bg-pink-600 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:border-pink-300 hover:text-pink-600"
            }`}
          >
            Tất cả
          </button>

          {activeCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryChange(category.slug)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                activeCategory === category.slug
                  ? "bg-pink-600 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-pink-300 hover:text-pink-600"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* SEARCH RESULT INFO */}
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {getCategoryName(activeCategory)}
            </h2>

            {searchKeyword && (
              <p className="mt-1 text-sm text-gray-500">
                Kết quả tìm kiếm cho:{" "}
                <span className="font-semibold text-pink-600">
                  "{searchKeyword}"
                </span>
              </p>
            )}
          </div>

          <p className="text-sm text-gray-500">
            {totalProducts === 0
              ? "Không có sản phẩm"
              : `Hiển thị ${startIndex + 1}-${endIndex}/${totalProducts} sản phẩm`}
          </p>
        </div>

        {/* PRODUCTS */}
        {currentProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {currentProducts.map((product) => {
                const isFavorite = wishlistIds.includes(String(product.id));

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <Link to={`/products/${product.id}`}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </Link>

                      {product.badge && (
                        <span
                          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${getBadgeClass(
                            product.badge
                          )}`}
                        >
                          {product.badge}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleWishlist(product)}
                        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition ${
                          isFavorite
                            ? "bg-pink-50 text-pink-600"
                            : "bg-white/95 text-gray-500 hover:text-pink-600"
                        }`}
                        aria-label={
                          isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"
                        }
                      >
                        <FiHeart className={isFavorite ? "fill-current" : ""} />
                      </button>
                    </div>

                    <div className="p-4">
                      {activeCategory === "all" && (
                        <p className="mb-1 text-xs font-medium text-pink-600">
                          {getCategoryName(product.category)}
                        </p>
                      )}

                      <Link to={`/products/${product.id}`}>
                        <h3 className="min-h-[48px] line-clamp-2 font-semibold text-gray-800 transition hover:text-pink-600">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="mt-2 min-h-[40px] line-clamp-2 text-sm text-gray-500">
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
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 py-2.5 font-medium text-white transition hover:bg-pink-700"
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
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center">
            <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp.</p>

            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams();

                if (activeCategory !== "all") {
                  params.set("category", activeCategory);
                }

                setSearchParams(params);
              }}
              className="mt-4 font-medium text-pink-600 hover:text-pink-700"
            >
              Xóa tìm kiếm
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsPage;
