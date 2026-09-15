import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  getProductsSnapshot,
  readCategories,
  subscribeProducts,
  CATEGORY_UPDATED_EVENT,
} from "@/services/catalog";

import { isProductSellable } from "@/services/inventory";

import ProductCard from "@/components/product/ProductCard";

const PRODUCTS_PER_PAGE = 20;

const SORT_OPTIONS = [
  {
    value: "",
    label: "Mặc định",
  },
  {
    value: "price-asc",
    label: "Giá thấp → cao",
  },
  {
    value: "price-desc",
    label: "Giá cao → thấp",
  },
  {
    value: "best-selling",
    label: "Bán chạy",
  },
  {
    value: "newest",
    label: "Mới nhất",
  },
];

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const getProductPrice = (product) => {
  const price = Number(product?.price);

  return Number.isFinite(price) ? price : 0;
};

const getSalesCount = (product) => {
  const salesCount = Number(product?.salesCount);

  return Number.isFinite(salesCount) ? salesCount : 0;
};

const getCreatedAtTimestamp = (product) => {
  const createdAt = product?.createdAt;

  if (!createdAt) {
    return 0;
  }

  const timestamp = new Date(createdAt).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
};

const isProductOnSale = (product) => {
  const price = getProductPrice(product);
  const oldPrice = toNumberOrNull(product?.oldPrice);

  return oldPrice !== null && oldPrice > price;
};

const isProductNew = (product) => Boolean(product?.isNew);

const ProductsPage = () => {
  const { categorySlug: routeCategorySlug } = useParams();

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const products = useSyncExternalStore(
    subscribeProducts,
    getProductsSnapshot,
    getProductsSnapshot
  );

  const [categories, setCategories] = useState(() => readCategories());

  const keyword = searchParams.get("search") || "";

  const queryCategory = searchParams.get("category") || "";

  const category = routeCategorySlug || queryCategory || "";

  const minPrice = toNumberOrNull(searchParams.get("minPrice"));

  const maxPrice = toNumberOrNull(searchParams.get("maxPrice"));

  const sort = searchParams.get("sort") || "";

  const newOnly = searchParams.get("new") === "1";

  const saleOnly = searchParams.get("sale") === "1";

  const stockFilter = searchParams.get("stock") || "";

  const pageParam = Number(searchParams.get("page") || 1);

  const currentPage =
    Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  useEffect(() => {
    const refreshCategories = () => {
      setCategories(readCategories());
    };

    window.addEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

    window.addEventListener("storage", refreshCategories);

    return () => {
      window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

      window.removeEventListener("storage", refreshCategories);
    };
  }, []);

  const currentCategory = categories.find(
    (item) => String(item.slug) === String(category)
  );

  const visibleFilteredProducts = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesCategory =
        !category || String(product.category) === String(category);

      const matchesQuery =
        !query ||
        [product.name, product.description, product.badge]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const productPrice = getProductPrice(product);

      const matchesMinPrice =
        minPrice === null || productPrice >= Math.max(0, minPrice);

      const matchesMaxPrice =
        maxPrice === null || productPrice <= Math.max(0, maxPrice);

      const matchesNew = !newOnly || isProductNew(product);

      const matchesSale = !saleOnly || isProductOnSale(product);

      const productIsSellable = isProductSellable(product);

      const matchesStock =
        !stockFilter ||
        (stockFilter === "in" && productIsSellable) ||
        (stockFilter === "out" && !productIsSellable);

      return (
        matchesCategory &&
        matchesQuery &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesNew &&
        matchesSale &&
        matchesStock
      );
    });

    return filtered.sort((a, b) => {
      if (sort === "price-asc") {
        return getProductPrice(a) - getProductPrice(b);
      }

      if (sort === "price-desc") {
        return getProductPrice(b) - getProductPrice(a);
      }

      if (sort === "best-selling") {
        const salesDifference = getSalesCount(b) - getSalesCount(a);

        if (salesDifference !== 0) {
          return salesDifference;
        }

        return getCreatedAtTimestamp(b) - getCreatedAtTimestamp(a);
      }

      if (sort === "newest") {
        const dateDifference =
          getCreatedAtTimestamp(b) - getCreatedAtTimestamp(a);

        if (dateDifference !== 0) {
          return dateDifference;
        }

        return Number(b?.id || 0) - Number(a?.id || 0);
      }

      return 0;
    });
  }, [
    products,
    keyword,
    category,
    minPrice,
    maxPrice,
    sort,
    newOnly,
    saleOnly,
    stockFilter,
  ]);

  const totalProducts = visibleFilteredProducts.length;

  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));

  const safePage = Math.min(currentPage, totalPages);

  const startIndex =
    totalProducts === 0 ? 0 : (safePage - 1) * PRODUCTS_PER_PAGE;

  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);

  const paginatedProducts = visibleFilteredProducts.slice(startIndex, endIndex);

  const hasActiveFilters =
    Boolean(keyword) ||
    Boolean(queryCategory) ||
    minPrice !== null ||
    maxPrice !== null ||
    Boolean(sort) ||
    newOnly ||
    saleOnly ||
    Boolean(stockFilter);

  useEffect(() => {
    const title = currentCategory?.seoTitle
      ? currentCategory.seoTitle
      : currentCategory?.name
        ? `${currentCategory.name} | Flower Shop`
        : keyword
          ? `Tìm kiếm "${keyword}" | Flower Shop`
          : "Tất cả sản phẩm | Flower Shop";

    document.title = title;

    const description =
      currentCategory?.seoDescription ||
      currentCategory?.summary ||
      "Khám phá những mẫu hoa tươi được thiết kế phù hợp với nhiều dịp đặc biệt tại Flower Shop.";

    let meta = document.querySelector('meta[name="description"]');

    if (!meta) {
      meta = document.createElement("meta");

      meta.setAttribute("name", "description");

      document.head.appendChild(meta);
    }

    meta.setAttribute("content", description);

    const canonicalPath = currentCategory?.slug
      ? `/products/category/${currentCategory.slug}`
      : "/products";

    const canonicalUrl = `${window.location.origin}${canonicalPath}`;

    let canonical = document.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement("link");

      canonical.setAttribute("rel", "canonical");

      document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", canonicalUrl);

    return () => {
      if (canonical?.parentNode) {
        canonical.parentNode.removeChild(canonical);
      }
    };
  }, [currentCategory, keyword]);

  const updateParams = (updater) => {
    const params = new URLSearchParams(searchParams);

    updater(params);

    params.delete("page");

    setSearchParams(params);
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;

    if (value) {
      navigate(`/products/category/${value}`);

      return;
    }

    navigate("/products");
  };

  const handlePriceChange = (key, value) => {
    updateParams((params) => {
      const normalizedValue = value.trim();

      if (!normalizedValue) {
        params.delete(key);

        return;
      }

      const number = Number(normalizedValue);

      if (!Number.isFinite(number) || number < 0) {
        return;
      }

      params.set(key, String(Math.floor(number)));
    });
  };

  const handleSortChange = (event) => {
    const value = event.target.value;

    updateParams((params) => {
      if (value) {
        params.set("sort", value);
      } else {
        params.delete("sort");
      }
    });
  };

  const handleStockChange = (event) => {
    const value = event.target.value;

    updateParams((params) => {
      if (value) {
        params.set("stock", value);
      } else {
        params.delete("stock");
      }
    });
  };

  const handleToggleFilter = (key, enabled) => {
    updateParams((params) => {
      if (enabled) {
        params.set(key, "1");
      } else {
        params.delete(key);
      }
    });
  };

  const resetFilters = () => {
    if (routeCategorySlug) {
      navigate(`/products/category/${routeCategorySlug}`);

      return;
    }

    setSearchParams({});
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
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-2 text-sm"
        >
          <Link to="/" className="text-gray-500 transition hover:text-pink-600">
            Trang chủ
          </Link>

          <span className="text-gray-300">/</span>

          <Link
            to="/products"
            className={`transition ${
              currentCategory
                ? "text-gray-500 hover:text-pink-600"
                : "font-medium text-gray-800"
            }`}
          >
            Sản phẩm
          </Link>

          {currentCategory && (
            <>
              <span className="text-gray-300">/</span>

              <span className="font-medium text-gray-800">
                {currentCategory.name}
              </span>
            </>
          )}
        </nav>

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
                value={routeCategorySlug ? routeCategorySlug : queryCategory}
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

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Lọc và sắp xếp
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Có thể kết hợp nhiều điều kiện cùng lúc.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="self-start text-sm font-semibold text-pink-600 transition hover:text-pink-700 sm:self-auto"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="product-min-price"
                className="mb-1.5 block text-xs font-semibold text-gray-600"
              >
                Giá từ
              </label>

              <input
                id="product-min-price"
                type="number"
                min="0"
                step="1000"
                value={minPrice === null ? "" : minPrice}
                onChange={(event) =>
                  handlePriceChange("minPrice", event.target.value)
                }
                placeholder="Ví dụ: 300000"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-pink-300 focus:bg-white focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label
                htmlFor="product-max-price"
                className="mb-1.5 block text-xs font-semibold text-gray-600"
              >
                Giá đến
              </label>

              <input
                id="product-max-price"
                type="number"
                min="0"
                step="1000"
                value={maxPrice === null ? "" : maxPrice}
                onChange={(event) =>
                  handlePriceChange("maxPrice", event.target.value)
                }
                placeholder="Ví dụ: 1000000"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-pink-300 focus:bg-white focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label
                htmlFor="product-sort"
                className="mb-1.5 block text-xs font-semibold text-gray-600"
              >
                Sắp xếp
              </label>

              <select
                id="product-sort"
                value={sort}
                onChange={handleSortChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-pink-300 focus:bg-white focus:ring-2 focus:ring-pink-100"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="product-stock"
                className="mb-1.5 block text-xs font-semibold text-gray-600"
              >
                Tình trạng kho
              </label>

              <select
                id="product-stock"
                value={stockFilter}
                onChange={handleStockChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-pink-300 focus:bg-white focus:ring-2 focus:ring-pink-100"
              >
                <option value="">Tất cả tình trạng</option>
                <option value="in">Còn hàng</option>
                <option value="out">Hết hàng</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-pink-200 hover:bg-pink-50">
              <input
                type="checkbox"
                checked={newOnly}
                onChange={(event) =>
                  handleToggleFilter("new", event.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />

              <span>Sản phẩm mới</span>
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-pink-200 hover:bg-pink-50">
              <input
                type="checkbox"
                checked={saleOnly}
                onChange={(event) =>
                  handleToggleFilter("sale", event.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />

              <span>Đang giảm giá</span>
            </label>
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

        {hasActiveFilters && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Đang áp dụng:</span>

            {minPrice !== null && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                Từ {minPrice.toLocaleString("vi-VN")}đ
              </span>
            )}

            {maxPrice !== null && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                Đến {maxPrice.toLocaleString("vi-VN")}đ
              </span>
            )}

            {sort && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {SORT_OPTIONS.find((item) => item.value === sort)?.label ||
                  sort}
              </span>
            )}

            {newOnly && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                Sản phẩm mới
              </span>
            )}

            {saleOnly && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                Đang giảm giá
              </span>
            )}

            {stockFilter === "in" && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                Còn hàng
              </span>
            )}

            {stockFilter === "out" && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                Hết hàng
              </span>
            )}
          </div>
        )}

        {paginatedProducts.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">
              Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
              >
                Đặt lại bộ lọc
              </button>
            )}
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
