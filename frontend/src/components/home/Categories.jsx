/*
============================================================
FLOWER SHOP — HOME CATEGORIES
============================================================
*/

import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import SectionTitle from "./SectionTitle";

import { CATEGORY_UPDATED_EVENT } from "@/constants/productCategories";

import { readCategories } from "@/services/catalog";

const Categories = () => {
  const [categories, setCategories] = useState(() =>
    readCategories().filter((category) => category.active !== false)
  );

  useEffect(() => {
    const refresh = () => {
      setCategories(
        readCategories()
          .filter((category) => category.active !== false)
          .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      );
    };

    window.addEventListener(CATEGORY_UPDATED_EVENT, refresh);

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(CATEGORY_UPDATED_EVENT, refresh);

      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-4 md:py-6">
      <div className="mx-auto max-w-7xl px-4">
        <SectionTitle
          title="Danh mục nổi bật"
          subtitle="Lựa chọn hoa phù hợp với từng dịp đặc biệt"
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 md:gap-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${encodeURIComponent(category.slug)}`}
              className="group block"
            >
              <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden bg-pink-50">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-pink-300">
                      Chưa có hình ảnh
                    </div>
                  )}
                </div>

                <div className="p-3 text-center">
                  <h3 className="font-semibold text-gray-800 transition-colors group-hover:text-pink-600">
                    {category.name}
                  </h3>

                  {category.summary && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                      {category.summary}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-pink-500">Xem sản phẩm →</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
