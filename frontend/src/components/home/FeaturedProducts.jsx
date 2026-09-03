/*
============================================================
FLOWER SHOP — FEATURED PRODUCTS
============================================================

- Chỉ đọc catalog.js.
- Không đọc products.js trực tiếp.
- Không đọc homeData.js.
- Không có search.
- Không có dòng "Sản phẩm nổi bật" dưới từng danh mục.
- Khoảng cách thu gọn.
============================================================
*/

import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import {
  readProducts,
  readCategories,
  PRODUCT_UPDATED_EVENT,
  CATEGORY_UPDATED_EVENT,
} from "@/services/catalog";

import {
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price || 0));

const FeaturedProducts = () => {
  const [products, setProducts] = useState(() => readProducts());

  const [categories, setCategories] = useState(() => readCategories());

  const [settings, setSettings] = useState(() => readSiteSettings());

  useEffect(() => {
    const refreshProducts = () => {
      setProducts(readProducts());
    };

    const refreshCategories = () => {
      setCategories(readCategories());
    };

    const refreshSettings = () => {
      setSettings(readSiteSettings());
    };

    window.addEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

    window.addEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refreshSettings);

    window.addEventListener("storage", refreshProducts);

    window.addEventListener("storage", refreshCategories);

    window.addEventListener("storage", refreshSettings);

    return () => {
      window.removeEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

      window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, refreshSettings);

      window.removeEventListener("storage", refreshProducts);

      window.removeEventListener("storage", refreshCategories);

      window.removeEventListener("storage", refreshSettings);
    };
  }, []);

  const featuredByCategory = useMemo(() => {
    return categories
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
      })
      .filter((category) => category.products.length > 0);
  }, [categories, products]);

  return (
    <section className="home-section-tight bg-gray-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-5 text-center">
          <h2 className="text-2xl font-bold text-gray-800 md:text-3xl">
            {settings.sections.featuredTitle}
          </h2>

          {settings.sections.featuredSubtitle && (
            <p className="mt-1 text-sm text-gray-500 md:text-base">
              {settings.sections.featuredSubtitle}
            </p>
          )}
        </div>

        {featuredByCategory.map((category) => (
          <div key={category.id} className="mb-7 last:mb-0">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold uppercase text-gray-800 md:text-xl">
                {category.name}
              </h3>

              <Link
                to={`/products?category=${encodeURIComponent(category.slug)}`}
                className="text-sm font-semibold text-pink-600 hover:text-pink-700"
              >
                Xem tất cả →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {category.products.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
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
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          Chưa có hình ảnh
                        </div>
                      )}

                      {product.badge && (
                        <span className="absolute left-2 top-2 rounded-full bg-pink-600 px-2 py-1 text-[10px] font-semibold text-white">
                          {product.badge}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-3">
                    <Link to={`/products/${product.id}`}>
                      <h4 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-gray-800 transition hover:text-pink-600">
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
                      className="mt-2 block rounded-lg bg-pink-600 py-2 text-center text-xs font-semibold text-white hover:bg-pink-700"
                    >
                      Xem sản phẩm
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}

        {settings.customerLogos.length > 0 && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="mb-4 text-center text-lg font-bold tracking-wide text-gray-800 md:text-xl">
              {settings.sections.customerTitle}
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {settings.customerLogos.map((logo) => (
                <div
                  key={logo.id}
                  className="flex h-16 w-28 items-center justify-center rounded-lg bg-white p-2 shadow-sm"
                >
                  <img
                    src={logo.image}
                    alt={logo.name || "Khách hàng"}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
