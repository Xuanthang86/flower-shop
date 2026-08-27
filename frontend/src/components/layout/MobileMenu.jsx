import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiX, FiShoppingCart } from "react-icons/fi";

import { useCart } from "@/context/CartContext";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { cartCount } = useCart();

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="w-full bg-white border-b border-gray-100 shadow-sm">
      {/* ==============================
          THANH MOBILE
      =============================== */}
      <div className="h-16 px-4 flex items-center justify-between">
        {/* LOGO */}
        <NavLink
          to="/"
          onClick={closeMenu}
          className="text-lg font-bold text-pink-600"
        >
          FLOWER SHOP
        </NavLink>

        {/* CÁC NÚT BÊN PHẢI */}
        <div className="flex items-center gap-2">
          {/* GIỎ HÀNG */}
          <NavLink
            to="/cart"
            onClick={closeMenu}
            className="relative w-11 h-11 flex items-center justify-center text-gray-700"
            aria-label="Giỏ hàng"
          >
            <FiShoppingCart size={23} />

            {/* SỐ LƯỢNG */}
            {cartCount > 0 && (
              <span
                className="
                  absolute
                  top-0
                  right-0
                  min-w-[18px]
                  h-[18px]
                  px-1
                  rounded-full
                  bg-pink-600
                  text-white
                  text-[10px]
                  font-bold
                  flex
                  items-center
                  justify-center
                  border-2
                  border-white
                "
              >
                {cartCount}
              </span>
            )}
          </NavLink>

          {/* NÚT MENU */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="
              w-11
              h-11
              flex
              items-center
              justify-center
              text-gray-700
              rounded-lg
              hover:bg-gray-100
              transition
            "
            aria-label={isOpen ? "Đóng menu" : "Mở menu"}
          >
            {isOpen ? <FiX size={25} /> : <FiMenu size={25} />}
          </button>
        </div>
      </div>

      {/* ==============================
          MENU MOBILE
      =============================== */}
      {isOpen && (
        <div className="border-t border-gray-100 bg-white shadow-lg">
          <nav className="px-4 py-2">
            {/* TRANG CHỦ */}
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                `
                block
                py-4
                border-b
                border-gray-100
                text-base
                transition
                ${isActive ? "text-pink-600 font-semibold" : "text-gray-700"}
                `
              }
            >
              Trang chủ
            </NavLink>

            {/* SẢN PHẨM */}
            <NavLink
              to="/products"
              onClick={closeMenu}
              className={({ isActive }) =>
                `
                block
                py-4
                border-b
                border-gray-100
                text-base
                transition
                ${isActive ? "text-pink-600 font-semibold" : "text-gray-700"}
                `
              }
            >
              Sản phẩm
            </NavLink>

            {/* BÀI VIẾT */}
            <NavLink
              to="/blog"
              onClick={closeMenu}
              className={({ isActive }) =>
                `
                block
                py-4
                border-b
                border-gray-100
                text-base
                transition
                ${isActive ? "text-pink-600 font-semibold" : "text-gray-700"}
                `
              }
            >
              Bài viết
            </NavLink>

            {/* LIÊN HỆ */}
            <NavLink
              to="/contact"
              onClick={closeMenu}
              className={({ isActive }) =>
                `
                block
                py-4
                text-base
                transition
                ${isActive ? "text-pink-600 font-semibold" : "text-gray-700"}
                `
              }
            >
              Liên hệ
            </NavLink>
          </nav>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
