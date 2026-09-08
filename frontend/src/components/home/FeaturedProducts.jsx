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

import { ROLES, useAuth } from "@/context/AuthContext";

import ProductCard from "@/components/product/ProductCard";

const FeaturedProducts = () => {
  const [products, setProducts] = useState(() => readProducts());

  const [categories, setCategories] = useState(() => readCategories());

  const [settings, setSettings] = useState(() => readSiteSettings());

  const { user } = useAuth();

  useEffect(() => {
    const refreshProducts = () => setProducts(readProducts());

    const refreshCategories = () => setCategories(readCategories());

    const refreshSettings = () => setSettings(readSiteSettings());

    window.addEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

    window.addEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refreshSettings);

    return () => {
      window.removeEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

      window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, refreshSettings);
    };
  }, []);

  const groups = useMemo(
    () =>
      categories
        .filter((category) => category.active !== false)
        .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
        .map((category) => ({
          ...category,

          products: products
            .filter(
              (product) => String(product.category) === String(category.slug)
            )
            .sort((a, b) => {
              const newest =
                Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));

              if (newest !== 0) {
                return newest;
              }

              return Number(b.salesCount || 0) - Number(a.salesCount || 0);
            })
            .slice(0, 5),
        }))
        .filter((group) => group.products.length),
    [categories, products]
  );

  return (
    <section className="bg-gray-50 py-7">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-7 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {settings.sections?.featuredTitle || "Sản phẩm nổi bật"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {settings.sections?.featuredSubtitle ||
              "Những sản phẩm mới và được yêu thích nhất."}
          </p>
        </div>

        {groups.map((group) => (
          <div key={group.id} className="mb-9 last:mb-0">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{group.name}</h3>

              <Link
                to={`/products?category=${encodeURIComponent(group.slug)}`}
                className="text-sm font-semibold text-pink-600 hover:text-pink-700"
              >
                Xem tất cả →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
              {group.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
