import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SectionTitle from "./SectionTitle";
import { readCatalogCategories } from "@/data/catalog";

const Categories = () => {
  const [categories, setCategories] = useState(() => readCatalogCategories());

  useEffect(() => {
    const refresh = () => setCategories(readCatalogCategories());
    window.addEventListener("storage", refresh);
    window.addEventListener("flower-shop-categories-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("flower-shop-categories-updated", refresh);
    };
  }, []);

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle title="Danh mục nổi bật" subtitle="Lựa chọn hoa phù hợp với từng dịp đặc biệt" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6">
          {categories.map((item) => (
            <Link key={item.id} to={`/products?category=${item.query}`} className="group block">
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden bg-pink-50">
                  <img src={item.image} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">{item.label}</h3>
                  {item.summary && <p className="mt-1 text-xs text-gray-400 line-clamp-2">{item.summary}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
