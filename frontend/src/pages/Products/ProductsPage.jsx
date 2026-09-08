import { useEffect, useMemo, useState } from "react";

import { useSearchParams } from "react-router-dom";

import { FiSearch } from "react-icons/fi";

import {
  readProducts,
  readCategories,
  PRODUCT_UPDATED_EVENT,
  CATEGORY_UPDATED_EVENT,
} from "@/services/catalog";

import ProductCard from "@/components/product/ProductCard";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState(() => readProducts());

  const [categories, setCategories] = useState(() => readCategories());

  const keyword = searchParams.get("q") || "";

  const category = searchParams.get("category") || "";

  useEffect(() => {
    const refreshProducts = () => setProducts(readProducts());

    const refreshCategories = () => setCategories(readCategories());

    window.addEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

    window.addEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

    return () => {
      window.removeEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

      window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);
    };
  }, []);

  const visibleProducts = useMemo(() => {
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

  const currentCategory = categories.find(
    (item) => String(item.slug) === String(category)
  );

  const handleSearch = (event) => {
    event.preventDefault();

    const value = event.currentTarget.elements.keyword.value.trim();

    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    setSearchParams(params);
  };

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {currentCategory?.name || "Tất cả sản phẩm"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {currentCategory?.summary ||
              "Khám phá những mẫu hoa tươi được thiết kế phù hợp với nhiều dịp đặc biệt."}
          </p>
        </div>

        <div className="mb-7 flex flex-col gap-3 md:flex-row">
          <form onSubmit={handleSearch} className="relative flex-1">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />

            <input
              name="keyword"
              defaultValue={keyword}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full rounded-xl bg-white py-3 pl-11 pr-4 text-sm outline-none shadow-sm focus:ring-2 focus:ring-pink-100"
            />
          </form>

          <select
            value={category}
            onChange={(event) => {
              const params = new URLSearchParams(searchParams);

              if (event.target.value) {
                params.set("category", event.target.value);
              } else {
                params.delete("category");
              }

              setSearchParams(params);
            }}
            className="rounded-xl bg-white px-4 py-3 text-sm text-gray-700 shadow-sm outline-none"
          >
            <option value="">Tất cả danh mục</option>

            {categories
              .filter((item) => item.active !== false)
              .map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsPage;
