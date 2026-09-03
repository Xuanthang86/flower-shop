import { useEffect, useRef, useState } from "react";

import { Link, NavLink } from "react-router-dom";

import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";

import HeaderIcons from "./HeaderIcons";
import SearchBox from "./SearchBox";

import { readCategories, CATEGORY_UPDATED_EVENT } from "@/services/catalog";

const navClass = ({ isActive }) =>
  `relative py-2 font-semibold transition ${
    isActive ? "text-pink-600" : "text-gray-700 hover:text-pink-600"
  }`;

const Header = () => {
  const [categories, setCategories] = useState(() => readCategories());

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopProductsOpen, setDesktopProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

  const productMenuRef = useRef(null);

  useEffect(() => {
    const refresh = () => {
      setCategories(readCategories());
    };

    window.addEventListener(CATEGORY_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(CATEGORY_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        productMenuRef.current &&
        !productMenuRef.current.contains(event.target)
      ) {
        setDesktopProductsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const activeCategories = categories
    .filter((category) => category.active !== false)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileProductsOpen(false);
  };

  const closeAll = () => {
    setDesktopProductsOpen(false);
    closeMobile();
  };

  return (
    <header className="relative z-[80] w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex min-h-[76px] items-center gap-3 lg:gap-5">
          <Link
            to="/"
            onClick={closeAll}
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-600 text-xl text-white shadow-sm">
              🌸
            </div>

            <div className="hidden sm:block">
              <div className="text-xl font-bold text-gray-900">Flower Shop</div>

              <div className="text-[11px] text-gray-500">
                Fresh Flower Everyday
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex">
            <NavLink
              to="/"
              className={navClass}
              style={{
                fontSize: "var(--fs-header-font-size)",
              }}
            >
              Trang chủ
            </NavLink>

            <div ref={productMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setDesktopProductsOpen((value) => !value)}
                className="flex items-center gap-1 py-2 font-semibold text-gray-700 hover:text-pink-600"
                style={{
                  fontSize: "var(--fs-header-font-size)",
                }}
              >
                Sản phẩm
                <FiChevronDown
                  size={16}
                  className={
                    desktopProductsOpen ? "rotate-180 transition" : "transition"
                  }
                />
              </button>

              {desktopProductsOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
                  <Link
                    to="/products"
                    onClick={() => setDesktopProductsOpen(false)}
                    className="block rounded-lg px-3 py-2.5 font-semibold text-gray-800 hover:bg-pink-50 hover:text-pink-600"
                  >
                    Tất cả sản phẩm
                  </Link>

                  {activeCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${encodeURIComponent(
                        category.slug
                      )}`}
                      onClick={() => setDesktopProductsOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink
              to="/blog"
              className={navClass}
              style={{
                fontSize: "var(--fs-header-font-size)",
              }}
            >
              Bài viết
            </NavLink>

            <NavLink
              to="/contact"
              className={navClass}
              style={{
                fontSize: "var(--fs-header-font-size)",
              }}
            >
              Liên hệ
            </NavLink>
          </nav>

          <div className="ml-auto hidden min-w-0 md:flex md:items-center md:justify-end">
            <SearchBox />
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="hidden md:block">
              <HeaderIcons />
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-pink-50 lg:hidden"
              aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            >
              {mobileOpen ? <FiX size={23} /> : <FiMenu size={23} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-gray-100 py-4 lg:hidden">
            <div className="mb-4">
              <SearchBox className="max-w-none" />
            </div>

            <nav className="flex flex-col">
              <NavLink to="/" onClick={closeMobile} className={navClass}>
                Trang chủ
              </NavLink>

              <button
                type="button"
                onClick={() => setMobileProductsOpen((value) => !value)}
                className="flex w-full items-center justify-between py-2 font-semibold text-gray-700"
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
                <div className="mb-2 ml-3 border-l border-pink-100 pl-3">
                  <Link
                    to="/products"
                    onClick={closeMobile}
                    className="block py-2 font-semibold"
                  >
                    Tất cả sản phẩm
                  </Link>

                  {activeCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${encodeURIComponent(
                        category.slug
                      )}`}
                      onClick={closeMobile}
                      className="block py-2 text-sm text-gray-600 hover:text-pink-600"
                    >
                      {category.name}
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

            <div className="mt-4 border-t border-gray-100 pt-4">
              <HeaderIcons />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
