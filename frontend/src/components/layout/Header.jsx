import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";

import HeaderIcons from "./HeaderIcons";
import SearchBox from "./SearchBox";
import Logo from "./Logo";

import { readCategories, CATEGORY_UPDATED_EVENT } from "@/services/catalog";

import {
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

const navClass = ({ isActive }) =>
  `py-2 font-semibold whitespace-nowrap transition-colors ${
    isActive ? "text-pink-600" : "text-gray-700 hover:text-pink-600"
  }`;

const Header = () => {
  const [categories, setCategories] = useState(() => readCategories());

  const [settings, setSettings] = useState(() => readSiteSettings());

  const [mobileOpen, setMobileOpen] = useState(false);

  const [desktopProductsOpen, setDesktopProductsOpen] = useState(false);

  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

  const productMenuRef = useRef(null);

  useEffect(() => {
    const refreshCategories = () => setCategories(readCategories());

    const refreshSettings = () => setSettings(readSiteSettings());

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

  useEffect(() => {
    const outside = (event) => {
      if (
        productMenuRef.current &&
        !productMenuRef.current.contains(event.target)
      ) {
        setDesktopProductsOpen(false);
      }
    };

    document.addEventListener("mousedown", outside);

    return () => document.removeEventListener("mousedown", outside);
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
    <header className="sticky top-0 z-[100] w-full bg-[#fff9fb]/95 shadow-[0_2px_14px_rgba(190,24,93,0.06)] backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex min-h-[72px] items-center gap-4">
          <Logo settings={settings} onClick={closeAll} />

          <nav className="ml-[clamp(2rem,4vw,5rem)] hidden items-center gap-6 lg:flex">
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
              >
                Sản phẩm
                <FiChevronDown
                  size={15}
                  className={
                    desktopProductsOpen
                      ? "rotate-180 transition-transform"
                      : "transition-transform"
                  }
                />
              </button>

              {desktopProductsOpen && (
                <div className="absolute left-0 top-full z-[110] mt-2 w-64 overflow-hidden rounded-xl bg-white p-2 shadow-xl">
                  <Link
                    to="/products"
                    onClick={() => setDesktopProductsOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-pink-50 hover:text-pink-600"
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
                      className="block rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                    >
                      {category.name}
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

          <div className="ml-auto hidden min-w-0 items-center gap-3 md:flex">
            <div className="w-[270px] xl:w-[320px]">
              <SearchBox />
            </div>

            <div className="shrink-0">
              <HeaderIcons />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 hover:bg-pink-50 hover:text-pink-600 lg:hidden"
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          >
            {mobileOpen ? <FiX size={23} /> : <FiMenu size={23} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="py-4 lg:hidden">
            <div className="mb-4">
              <SearchBox />
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
                  className={mobileProductsOpen ? "rotate-180" : ""}
                />
              </button>

              {mobileProductsOpen && (
                <div className="mb-2 ml-3 pl-3">
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

            <div className="mt-4 pt-4">
              <HeaderIcons />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
