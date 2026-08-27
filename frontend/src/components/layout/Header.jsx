import { useEffect, useRef, useState } from "react";

import { NavLink, Link } from "react-router-dom";

import { FiChevronDown, FiMenu, FiSearch, FiX } from "react-icons/fi";

import HeaderIcons from "./HeaderIcons";

import { readProductCategories } from "@/constants/productCategories";

const navClass = ({ isActive }) =>
  `relative py-2 text-sm font-medium transition ${
    isActive ? "text-pink-600" : "text-gray-700 hover:text-pink-600"
  }`;

const Header = () => {
  const [categories, setCategories] = useState(() => readProductCategories());

  const [mobileOpen, setMobileOpen] = useState(false);

  const [desktopProductsOpen, setDesktopProductsOpen] = useState(false);

  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

  const productMenuRef = useRef(null);

  /* =====================================================
     ĐỒNG BỘ DANH MỤC
  ===================================================== */

  useEffect(() => {
    const refreshCategories = () => {
      setCategories(readProductCategories());
    };

    const handleStorage = (event) => {
      if (event.key === "flower-shop-categories") {
        refreshCategories();
      }
    };

    window.addEventListener("storage", handleStorage);

    window.addEventListener(
      "flower-shop-categories-updated",
      refreshCategories
    );

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener(
        "flower-shop-categories-updated",
        refreshCategories
      );
    };
  }, []);

  /* =====================================================
     CLICK RA NGOÀI
  ===================================================== */

  useEffect(() => {
    const handleOutside = (event) => {
      if (
        productMenuRef.current &&
        !productMenuRef.current.contains(event.target)
      ) {
        setDesktopProductsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);

    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileProductsOpen(false);
  };

  const closeAll = () => {
    setDesktopProductsOpen(false);

    closeMobile();
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 shadow-sm relative z-[80]">
      <div className="bg-pink-600 text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-center text-center">
          🌸 Miễn phí giao hàng cho đơn từ 500.000đ | Đặt trước 14h giao trong
          ngày
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="min-h-[76px] flex items-center gap-4 lg:gap-6">
          <Link
            to="/"
            onClick={closeAll}
            className="flex items-center gap-3 shrink-0"
          >
            <div className="w-11 h-11 rounded-full bg-pink-600 text-white flex items-center justify-center text-xl shadow-sm">
              🌸
            </div>

            <div className="hidden sm:block">
              <div className="text-xl font-bold text-gray-900">Flower Shop</div>

              <div className="text-[11px] text-gray-500">
                Fresh Flower Everyday
              </div>
            </div>
          </Link>

          {/* DESKTOP */}

          <nav className="hidden lg:flex items-center gap-7">
            <NavLink to="/" className={navClass}>
              Trang chủ
            </NavLink>

            <div ref={productMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setDesktopProductsOpen((value) => !value)}
                className="flex items-center gap-1 py-2 text-sm font-medium text-gray-700 hover:text-pink-600"
              >
                Sản phẩm
                <FiChevronDown
                  size={15}
                  className={
                    desktopProductsOpen ? "rotate-180 transition" : "transition"
                  }
                />
              </button>

              {desktopProductsOpen && (
                <div className="absolute left-0 top-full mt-2 w-60 bg-white border border-gray-100 rounded-xl shadow-xl p-2 z-50">
                  <Link
                    to="/products"
                    onClick={() => setDesktopProductsOpen(false)}
                    className="block px-3 py-2.5 rounded-lg font-medium text-gray-800 hover:bg-pink-50 hover:text-pink-600"
                  >
                    Tất cả sản phẩm
                  </Link>

                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.query}`}
                      onClick={() => setDesktopProductsOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink to="/blog" className={navClass}>
              Bài viết
            </NavLink>

            <NavLink to="/contact" className={navClass}>
              Liên hệ
            </NavLink>
          </nav>

          {/* SEARCH */}

          <div className="hidden md:flex flex-1 max-w-sm ml-auto">
            <div className="w-full flex items-center border border-gray-200 rounded-full bg-gray-50">
              <FiSearch className="ml-4 text-gray-400" size={18} />

              <input
                type="search"
                placeholder="Tìm hoa theo tên..."
                className="w-full bg-transparent px-3 py-2.5 outline-none text-sm"
              />
            </div>
          </div>

          <div className="ml-auto lg:ml-0 flex items-center gap-2">
            <div className="hidden md:block">
              <HeaderIcons />
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-gray-700 hover:bg-pink-50"
              aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            >
              {mobileOpen ? <FiX size={23} /> : <FiMenu size={23} />}
            </button>
          </div>
        </div>

        {/* MOBILE */}

        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <div className="mb-4 flex items-center border border-gray-200 rounded-full bg-gray-50">
              <FiSearch className="ml-4 text-gray-400" size={18} />

              <input
                type="search"
                placeholder="Tìm hoa theo tên..."
                className="w-full bg-transparent px-3 py-2.5 outline-none text-sm"
              />
            </div>

            <nav className="flex flex-col">
              <NavLink to="/" onClick={closeMobile} className={navClass}>
                Trang chủ
              </NavLink>

              <button
                type="button"
                onClick={() => setMobileProductsOpen((value) => !value)}
                className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700"
              >
                <span>Sản phẩm</span>

                <FiChevronDown
                  size={16}
                  className={
                    mobileProductsOpen ? "rotate-180 transition" : "transition"
                  }
                />
              </button>

              {mobileProductsOpen && (
                <div className="ml-3 mb-2 border-l border-pink-100 pl-3">
                  <Link
                    to="/products"
                    onClick={closeMobile}
                    className="block py-2 text-sm font-medium"
                  >
                    Tất cả sản phẩm
                  </Link>

                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.query}`}
                      onClick={closeMobile}
                      className="block py-1.5 text-sm text-gray-500 hover:text-pink-600"
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              )}

              <NavLink to="/blog" onClick={closeMobile} className={navClass}>
                Bài viết
              </NavLink>

              <NavLink to="/contact" onClick={closeMobile} className={navClass}>
                Liên hệ
              </NavLink>
            </nav>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
              <HeaderIcons />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
