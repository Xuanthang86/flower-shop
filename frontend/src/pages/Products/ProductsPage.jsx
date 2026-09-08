import { useEffect, useMemo, useState } from "react";

import { useSearchParams } from "react-router-dom";

import {
  readProducts,
  readCategories,
  PRODUCT_UPDATED_EVENT,
  CATEGORY_UPDATED_EVENT,
} from "@/services/catalog";

import ProductCard from "@/components/product/ProductCard";

const PRODUCTS_PER_PAGE = 20;

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState(() => readProducts());

  const [categories, setCategories] = useState(() => readCategories());

  const keyword = searchParams.get("search") || "";

  const category = searchParams.get("category") || "";

  const pageParam = Number(searchParams.get("page") || 1);

  const currentPage =
    Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

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

    window.addEventListener("storage", refreshCategories);

    return () => {
      window.removeEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

      window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

      window.removeEventListener("storage", refreshProducts);

      window.removeEventListener("storage", refreshCategories);
    };
  }, []);

  const visibleFilteredProducts = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        !category || String(product.category) === String(category);

      const matchesQuery =
        !query ||
        [product.name, product.description, product.badge]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [products, keyword, category]);

  const totalProducts = visibleFilteredProducts.length;

  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));

  const safePage = Math.min(currentPage, totalPages);

  const startIndex =
    totalProducts === 0 ? 0 : (safePage - 1) * PRODUCTS_PER_PAGE;

  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);

  const paginatedProducts = visibleFilteredProducts.slice(startIndex, endIndex);

  const currentCategory = categories.find(
    (item) => String(item.slug) === String(category)
  );

  useEffect(() => {
    const title = currentCategory?.name
      ? `${currentCategory.name} | Flower Shop`
      : keyword
        ? `Tìm kiếm "${keyword}" | Flower Shop`
        : "Tất cả sản phẩm | Flower Shop";

    document.title = title;

    const description =
      currentCategory?.summary ||
      "Khám phá những mẫu hoa tươi được thiết kế phù hợp với nhiều dịp đặc biệt tại Flower Shop.";

    let meta = document.querySelector('meta[name="description"]');

    if (!meta) {
      meta = document.createElement("meta");

      meta.setAttribute("name", "description");

      document.head.appendChild(meta);
    }

    meta.setAttribute("content", description);
  }, [currentCategory, keyword]);

  const updateParams = (updater) => {
    const params = new URLSearchParams(searchParams);

    updater(params);

    params.delete("page");

    setSearchParams(params);
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;

    updateParams((params) => {
      if (value) {
        params.set("category", value);
      } else {
        params.delete("category");
      }
    });
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    setSearchParams(params);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {currentCategory?.name || "Tất cả sản phẩm"}
              </h1>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
                {currentCategory?.summary ||
                  "Khám phá những mẫu hoa tươi được thiết kế phù hợp với nhiều dịp đặc biệt."}
              </p>

              <p className="mt-2 text-sm font-medium text-gray-600">
                {totalProducts === 0
                  ? "0/0 sản phẩm"
                  : `${startIndex + 1}–${endIndex}/${totalProducts} sản phẩm`}
              </p>
            </div>

            <div className="w-full md:w-auto md:min-w-[220px]">
              <label htmlFor="product-category" className="sr-only">
                Tất cả danh mục
              </label>

              <select
                id="product-category"
                value={category}
                onChange={handleCategoryChange}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm outline-none transition focus:ring-2 focus:ring-pink-100 md:w-auto"
              >
                <option value="">Tất cả danh mục</option>

                {categories
                  .filter((item) => item.active !== false)
                  .sort(
                    (a, b) =>
                      Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
                  )
                  .map((item) => (
                    <option key={item.id} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {keyword && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Kết quả tìm kiếm:</span>

            <span className="rounded-full bg-pink-50 px-3 py-1 text-sm font-semibold text-pink-600">
              {keyword}
            </span>

            <button
              type="button"
              onClick={() => updateParams((params) => params.delete("search"))}
              className="text-sm font-medium text-gray-500 hover:text-pink-600"
            >
              Xóa tìm kiếm
            </button>
          </div>
        )}

        {paginatedProducts.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-8 flex flex-wrap justify-center gap-2"
                aria-label="Phân trang sản phẩm"
              >
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => goToPage(safePage - 1)}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-pink-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Trước
                </button>

                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    aria-current={page === safePage ? "page" : undefined}
                    className={`min-w-10 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      page === safePage
                        ? "bg-pink-600 text-white"
                        : "bg-white text-gray-700 shadow-sm hover:bg-pink-50 hover:text-pink-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => goToPage(safePage + 1)}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-pink-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sau
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ProductsPage;
