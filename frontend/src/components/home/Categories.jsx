/*
============================================================
FLOWER SHOP — HOME CATEGORIES
============================================================

Mục đích:
- Hiển thị danh mục trên trang chủ.
- Không chứa dữ liệu danh mục riêng.
- Lấy dữ liệu trực tiếp từ Catalog Service.
- Tự cập nhật khi Admin thay đổi danh mục.
============================================================
*/

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import SectionTitle from "./SectionTitle";

import {
  CATEGORY_UPDATED_EVENT,
  getActiveCategories,
} from "@/constants/productCategories";

import { readCategories } from "@/services/catalog";

const Categories = () => {
  const [categories, setCategories] = useState(() =>
    getActiveCategories(readCategories())
  );

  useEffect(() => {
    const refreshCategories = () => {
      setCategories(getActiveCategories(readCategories()));
    };

    window.addEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

    window.addEventListener("storage", refreshCategories);

    return () => {
      window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

      window.removeEventListener("storage", refreshCategories);
    };
  }, []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          title="Danh mục nổi bật"
          subtitle="Lựa chọn hoa phù hợp với từng dịp đặc biệt"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${encodeURIComponent(category.slug)}`}
              className="group block"
            >
              <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden bg-pink-50">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-pink-300">
                      Chưa có hình ảnh
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-4 text-center">
                  <h3 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                    {category.name}
                  </h3>

                  {category.summary && (
                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                      {category.summary}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-pink-500">Xem sản phẩm →</p>
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
