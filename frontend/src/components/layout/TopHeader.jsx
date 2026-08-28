/*
============================================================
FLOWER SHOP — TOP HEADER
============================================================

Cập nhật:
- Danh mục lấy trực tiếp từ productCategories.js.
- Không còn hard-code danh mục.
- Danh mục Admin thêm/sửa/xóa sẽ đồng bộ Header.
- Phân biệt Customer và Staff.
- Admin / Manager / Product Manager không có giỏ hàng.
============================================================
*/

import { useEffect, useState } from "react";

import { FiChevronDown, FiShoppingCart } from "react-icons/fi";

import { Link, NavLink } from "react-router-dom";

import Logo from "./Logo";
import UserMenu from "./UserMenu";

import { useAuth, ROLES } from "@/context/AuthContext";

import { useCart } from "@/context/useCart";

import {
  CATEGORY_UPDATED_EVENT,
  readProductCategories,
} from "@/constants/productCategories";

const STAFF_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.PRODUCT_MANAGER];

const TopHeader = () => {
  const { user } = useAuth();

  const { cartCount = 0 } = useCart();

  const [productCategories, setProductCategories] = useState(() =>
    readProductCategories()
  );

  const isStaff = STAFF_ROLES.includes(user?.role);

  useEffect(() => {
    const refreshCategories = () => {
      setProductCategories(readProductCategories());
    };

    window.addEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

    window.addEventListener("storage", refreshCategories);

    return () => {
      window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

      window.removeEventListener("storage", refreshCategories);
    };
  }, []);

  const navClass = ({ isActive }) => `
    relative
    px-4
    py-6
    text-sm
    font-medium
    whitespace-nowrap
    transition
    ${isActive ? "text-pink-600" : "text-gray-700 hover:text-pink-600"}
  `;

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="min-h-[76px] flex items-center gap-7">
          <Logo />

          <nav className="flex items-center gap-1 ml-4">
            <NavLink to="/" end className={navClass}>
              Trang chủ
            </NavLink>

            {/* PRODUCTS */}

            <div className="relative group">
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `
                  flex
                  items-center
                  gap-1
                  px-4
                  py-6
                  text-sm
                  font-medium
                  whitespace-nowrap
                  transition
                  ${
                    isActive
                      ? "text-pink-600"
                      : "text-gray-700 hover:text-pink-600"
                  }
                  `
                }
              >
                Sản phẩm
                <FiChevronDown
                  size={15}
                  className="group-hover:rotate-180 transition-transform"
                />
              </NavLink>

              <div
                className="
                  absolute
                  left-0
                  top-full
                  w-72
                  bg-white
                  border
                  border-gray-100
                  rounded-b-xl
                  shadow-xl
                  opacity-0
                  invisible
                  translate-y-2
                  group-hover:opacity-100
                  group-hover:visible
                  group-hover:translate-y-0
                  transition-all
                  duration-200
                  z-[100]
                "
              >
                <div className="py-2">
                  {productCategories
                    .filter((category) => category.active !== false)
                    .map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?category=${encodeURIComponent(
                          category.slug
                        )}`}
                        className="
                            block
                            px-5
                            py-3
                            text-sm
                            text-gray-700
                            hover:bg-pink-50
                            hover:text-pink-600
                            transition
                          "
                      >
                        {category.name}
                      </Link>
                    ))}
                </div>
              </div>
            </div>

            <NavLink to="/blog" className={navClass}>
              Bài viết
            </NavLink>

            <NavLink to="/contact" className={navClass}>
              Liên hệ
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            {/* CUSTOMER CART ONLY */}

            {!isStaff && (
              <Link
                to="/cart"
                className="relative w-10 h-10 flex items-center justify-center text-gray-700 hover:text-pink-600 transition"
                title="Giỏ hàng"
                aria-label="Giỏ hàng"
              >
                <FiShoppingCart size={22} />

                {cartCount > 0 && (
                  <span
                    className="
                      absolute
                      -top-1
                      -right-1
                      min-w-5
                      h-5
                      px-1
                      rounded-full
                      bg-pink-600
                      text-white
                      text-[10px]
                      font-bold
                      flex
                      items-center
                      justify-center
                    "
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <UserMenu />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
