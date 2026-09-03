/*
============================================================
FLOWER SHOP — HOME CATEGORIES
============================================================

- Dùng catalog.js.
- Không dùng data danh mục thứ hai.
- Nội dung tiêu đề lấy từ siteSettings.
- Khoảng cách được thu gọn.
============================================================
*/

import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { readCategories, CATEGORY_UPDATED_EVENT } from "@/services/catalog";

import {
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

const Categories = () => {
  const [categories, setCategories] = useState(() =>
    readCategories()
      .filter((category) => category.active !== false)
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
  );

  const [settings, setSettings] = useState(() => readSiteSettings());

  useEffect(() => {
    const refreshCategories = () => {
      setCategories(
        readCategories()
          .filter((category) => category.active !== false)
          .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      );
    };

    const refreshSettings = () => {
      setSettings(readSiteSettings());
    };

    window.addEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refreshSettings);

    window.addEventListener("storage", refreshCategories);

    window.addEventListener("storage", refreshSettings);

    return () => {
      window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, refreshSettings);

      window.removeEventListener("storage", refreshCategories);

      window.removeEventListener("storage", refreshSettings);
    };
  }, []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="home-section-tight bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 md:text-3xl">
            {settings.sections.categoriesTitle}
          </h2>

          <p className="mt-1 text-sm text-gray-500 md:text-base">
            {settings.sections.categoriesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${encodeURIComponent(category.slug)}`}
              className="group block"
            >
              <article className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="aspect-[4/3] overflow-hidden bg-pink-50">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-pink-300">
                      Chưa có hình ảnh
                    </div>
                  )}
                </div>

                <div className="p-2.5 text-center">
                  <h3 className="font-bold uppercase text-gray-800 group-hover:text-pink-600">
                    {category.name}
                  </h3>

                  {category.summary && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                      {category.summary}
                    </p>
                  )}
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
