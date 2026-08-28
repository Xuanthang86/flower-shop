/*
============================================================
FLOWER SHOP — FEATURED PRODUCTS
============================================================

CẬP NHẬT:
- Không đọc products.js trực tiếp.
- Không đọc category data riêng.
- Dùng catalog.js.
- Tự cập nhật khi Admin thay đổi sản phẩm/danh mục.
- Giảm khoảng trắng trên trang chủ.
============================================================
*/

import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { FiShoppingCart } from "react-icons/fi";

import {
  readProducts,
  readCategories,
  PRODUCT_UPDATED_EVENT,
  CATEGORY_UPDATED_EVENT,
} from "@/services/catalog";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price || 0));

const FeaturedProducts = () => {
  const [products, setProducts] = useState(() => readProducts());

  const [categories, setCategories] = useState(() => readCategories());

  useEffect(() => {
    const refreshProducts = () => setProducts(readProducts());

    const refreshCategories = () => setCategories(readCategories());

    window.addEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

    window.addEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

    window.addEventListener("storage", refreshProducts);

    return () => {
      window.removeEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

      window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

      window.removeEventListener("storage", refreshProducts);
    };
  }, []);

  const featuredByCategory = useMemo(
    () =>
      categories
        .filter((category) => category.active !== false)
        .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
        .map((category) => {
          const categoryProducts = products
            .filter(
              (product) => String(product.category) === String(category.slug)
            )
            .sort((a, b) => {
              const newDifference =
                Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));

              if (newDifference !== 0) {
                return newDifference;
              }

              return Number(b.salesCount || 0) - Number(a.salesCount || 0);
            })
            .slice(0, 4);

          return {
            ...category,
            products: categoryProducts,
          };
        }),
    [categories, products]
  );

  return (
    <section className="bg-gray-50 py-4 md:py-6">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-7 text-center">
          <h2 className="text-3xl font-bold text-gray-800">Sản phẩm nổi bật</h2>

          <p className="mt-2 text-gray-500">
            Những sản phẩm mới và được yêu thích nhất.
          </p>
        </div>

        {featuredByCategory.map((category) => (
          <div key={category.id} className="mb-8 last:mb-0">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 md:text-2xl">
                  {category.name}
                </h3>

                <p className="mt-1 text-sm text-gray-500">Sản phẩm nổi bật</p>
              </div>

              <Link
                to={`/products?category=${encodeURIComponent(category.slug)}`}
                className="text-sm font-medium text-pink-600 hover:text-pink-700"
              >
                Xem tất cả →
              </Link>
            </div>

            {category.products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
                {category.products.map((product) => (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg"
                  >
                    <Link to={`/products/${product.id}`} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-gray-400">
                            Chưa có hình ảnh
                          </div>
                        )}

                        {product.badge && (
                          <span className="absolute left-2 top-2 rounded-full bg-pink-600 px-2.5 py-1 text-[10px] font-semibold text-white md:text-xs">
                            {product.badge}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="p-3 md:p-4">
                      <Link to={`/products/${product.id}`}>
                        <h4 className="min-h-[40px] line-clamp-2 text-sm font-semibold text-gray-800 transition hover:text-pink-600 md:min-h-[48px] md:text-base">
                          {product.name}
                        </h4>
                      </Link>

                      <div className="mt-2">
                        <span className="font-bold text-pink-600">
                          {formatPrice(product.price)}
                        </span>

                        {product.oldPrice && (
                          <span className="ml-1 text-xs text-gray-400 line-through">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/products/${product.id}`}
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-pink-600 py-2 text-xs font-medium text-white transition hover:bg-pink-700 md:text-sm"
                      >
                        <FiShoppingCart size={15} />
                        Xem sản phẩm
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
