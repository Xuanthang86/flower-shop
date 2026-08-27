import { FiChevronDown, FiShoppingCart } from "react-icons/fi";

import { Link, NavLink } from "react-router-dom";

import Logo from "./Logo";
import UserMenu from "./UserMenu";

import { useAuth } from "@/context/AuthContext";

import { useCart } from "@/context/CartContext";

const productCategories = [
  {
    label: "Hoa Khai Trương",
    value: "hoa-khai-truong",
  },
  {
    label: "Hoa Sinh Nhật",
    value: "hoa-sinh-nhat",
  },
  {
    label: "Hoa Cưới",
    value: "hoa-cuoi",
  },
  {
    label: "Hoa Tốt Nghiệp",
    value: "hoa-tot-nghiep",
  },
  {
    label: "Hoa Chia Buồn",
    value: "hoa-chia-buon",
  },
];

const TopHeader = () => {
  const { user } = useAuth();

  const { cartCount = 0 } = useCart();

  const isAdmin = user?.role === "admin";

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="min-h-[76px] flex items-center gap-7">
          {/* LOGO */}

          <Logo />

          {/* NAVIGATION */}

          <nav className="flex items-center gap-1 ml-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `
                relative
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

              {/* DROPDOWN */}

              <div
                className="
                absolute
                left-0
                top-full
                mt-0
                w-64
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
                  {productCategories.map((category) => (
                    <Link
                      key={category.value}
                      to={`/products?category=${category.value}`}
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
                      {category.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* BLOG */}

            <NavLink
              to="/blog"
              className={({ isActive }) =>
                `
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
              Bài viết
            </NavLink>

            {/* CONTACT */}

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `
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
              Liên hệ
            </NavLink>
          </nav>

          {/* RIGHT */}

          <div className="ml-auto flex items-center gap-4">
            {/* CART */}

            {!isAdmin && (
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

            {/* ACCOUNT */}

            <UserMenu />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
