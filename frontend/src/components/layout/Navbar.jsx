import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, LogIn, LogOut, Settings } from "lucide-react";

import { useCart } from "@/context/CartContext";
import { AuthContext } from "@/context/AuthContext";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { cartCount } = useCart();

  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();

    closeMobileMenu();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <nav className="bg-white border-b border-gray-100 relative z-50">
      {/* =====================================================
          MOBILE NAVBAR
      ====================================================== */}
      <div className="md:hidden">
        <div className="h-14 px-4 flex items-center justify-between">
          {/* LOGO */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="text-base font-bold text-pink-600 tracking-wide"
          >
            FLOWER SHOP
          </Link>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            {/* GIỎ HÀNG
                Chỉ hiện khi đã đăng nhập */}
            {isAuthenticated && (
              <Link
                to="/cart"
                onClick={closeMobileMenu}
                aria-label="Giỏ hàng"
                className="relative w-10 h-10 flex items-center justify-center text-gray-700"
              >
                <ShoppingCart size={23} strokeWidth={2} />

                {cartCount > 0 && (
                  <span
                    className="
                      absolute
                      -top-0.5
                      -right-0.5
                      min-w-[18px]
                      h-[18px]
                      px-1
                      flex
                      items-center
                      justify-center
                      rounded-full
                      bg-pink-600
                      text-white
                      text-[10px]
                      font-bold
                    "
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* MENU */}
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="
                w-10
                h-10
                flex
                items-center
                justify-center
                text-gray-700
                rounded-lg
                hover:bg-gray-100
                transition
              "
            >
              {mobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white">
            {/* TRANG CHỦ */}
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`
                flex
                items-center
                h-12
                px-5
                text-sm
                font-medium
                border-b
                border-gray-100
                transition-colors
                ${
                  isActive("/")
                    ? "text-pink-600 bg-pink-50"
                    : "text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                }
              `}
            >
              Trang chủ
            </Link>

            {/* SẢN PHẨM */}
            <Link
              to="/products"
              onClick={closeMobileMenu}
              className={`
                flex
                items-center
                h-12
                px-5
                text-sm
                font-medium
                border-b
                border-gray-100
                transition-colors
                ${
                  isActive("/products")
                    ? "text-pink-600 bg-pink-50"
                    : "text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                }
              `}
            >
              Sản phẩm
            </Link>

            {/* BÀI VIẾT */}
            <Link
              to="/blog"
              onClick={closeMobileMenu}
              className={`
                flex
                items-center
                h-12
                px-5
                text-sm
                font-medium
                border-b
                border-gray-100
                transition-colors
                ${
                  isActive("/blog")
                    ? "text-pink-600 bg-pink-50"
                    : "text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                }
              `}
            >
              Bài viết
            </Link>

            {/* LIÊN HỆ */}
            <Link
              to="/contact"
              onClick={closeMobileMenu}
              className={`
                flex
                items-center
                h-12
                px-5
                text-sm
                font-medium
                border-b
                border-gray-100
                transition-colors
                ${
                  isActive("/contact")
                    ? "text-pink-600 bg-pink-50"
                    : "text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                }
              `}
            >
              Liên hệ
            </Link>

            {/* =================================================
                KHÁCH HÀNG ĐÃ ĐĂNG NHẬP
            ================================================== */}

            {isAuthenticated && !isAdmin && (
              <>
                {/* ĐƠN HÀNG */}
                <Link
                  to="/orders"
                  onClick={closeMobileMenu}
                  className={`
                    flex
                    items-center
                    h-12
                    px-5
                    text-sm
                    font-medium
                    border-b
                    border-gray-100
                    transition-colors
                    ${
                      isActive("/orders")
                        ? "text-pink-600 bg-pink-50"
                        : "text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                    }
                  `}
                >
                  Đơn hàng
                </Link>

                {/* GIỎ HÀNG */}
                <Link
                  to="/cart"
                  onClick={closeMobileMenu}
                  className={`
                    flex
                    items-center
                    h-12
                    px-5
                    text-sm
                    font-medium
                    border-b
                    border-gray-100
                    transition-colors
                    ${
                      isActive("/cart")
                        ? "text-pink-600 bg-pink-50"
                        : "text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                    }
                  `}
                >
                  Giỏ hàng
                </Link>
              </>
            )}

            {/* =================================================
                ADMIN
            ================================================== */}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={closeMobileMenu}
                className={`
                  flex
                  items-center
                  gap-2
                  h-12
                  px-5
                  text-sm
                  font-semibold
                  border-b
                  border-gray-100
                  transition-colors
                  ${
                    location.pathname.startsWith("/admin")
                      ? "text-pink-600 bg-pink-50"
                      : "text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                  }
                `}
              >
                <Settings size={17} />
                Quản trị
              </Link>
            )}

            {/* =================================================
                ĐĂNG NHẬP / ĐĂNG XUẤT
            ================================================== */}

            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="
                  flex
                  items-center
                  gap-2
                  h-12
                  px-5
                  text-sm
                  font-medium
                  text-gray-700
                  hover:text-pink-600
                  hover:bg-gray-50
                "
              >
                <LogIn size={17} />
                Đăng nhập
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="
                  w-full
                  flex
                  items-center
                  gap-2
                  h-12
                  px-5
                  text-sm
                  font-medium
                  text-red-600
                  hover:bg-red-50
                  text-left
                "
              >
                <LogOut size={17} />
                Đăng xuất
              </button>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          DESKTOP NAVBAR
      ====================================================== */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-14 flex items-center justify-center gap-2">
            {/* TRANG CHỦ */}
            <Link
              to="/"
              className={`
                relative
                h-14
                flex
                items-center
                px-4
                text-sm
                font-medium
                whitespace-nowrap
                transition-colors
                ${
                  isActive("/")
                    ? "text-pink-600 border-b-2 border-pink-600"
                    : "text-gray-700 hover:text-pink-600"
                }
              `}
            >
              Trang chủ
            </Link>

            {/* SẢN PHẨM */}
            <Link
              to="/products"
              className={`
                relative
                h-14
                flex
                items-center
                px-4
                text-sm
                font-medium
                whitespace-nowrap
                transition-colors
                ${
                  isActive("/products")
                    ? "text-pink-600 border-b-2 border-pink-600"
                    : "text-gray-700 hover:text-pink-600"
                }
              `}
            >
              Sản phẩm
            </Link>

            {/* BÀI VIẾT */}
            <Link
              to="/blog"
              className={`
                relative
                h-14
                flex
                items-center
                px-4
                text-sm
                font-medium
                whitespace-nowrap
                transition-colors
                ${
                  isActive("/blog")
                    ? "text-pink-600 border-b-2 border-pink-600"
                    : "text-gray-700 hover:text-pink-600"
                }
              `}
            >
              Bài viết
            </Link>

            {/* LIÊN HỆ */}
            <Link
              to="/contact"
              className={`
                relative
                h-14
                flex
                items-center
                px-4
                text-sm
                font-medium
                whitespace-nowrap
                transition-colors
                ${
                  isActive("/contact")
                    ? "text-pink-600 border-b-2 border-pink-600"
                    : "text-gray-700 hover:text-pink-600"
                }
              `}
            >
              Liên hệ
            </Link>

            {/* =================================================
                KHÁCH HÀNG
            ================================================== */}

            {isAuthenticated && !isAdmin && (
              <>
                {/* ĐƠN HÀNG */}
                <Link
                  to="/orders"
                  className={`
                    relative
                    h-14
                    flex
                    items-center
                    px-4
                    text-sm
                    font-medium
                    whitespace-nowrap
                    transition-colors
                    ${
                      location.pathname.startsWith("/orders")
                        ? "text-pink-600 border-b-2 border-pink-600"
                        : "text-gray-700 hover:text-pink-600"
                    }
                  `}
                >
                  Đơn hàng
                </Link>

                {/* GIỎ HÀNG */}
                <Link
                  to="/cart"
                  aria-label="Giỏ hàng"
                  className={`
                    relative
                    h-14
                    w-12
                    flex
                    items-center
                    justify-center
                    transition-colors
                    ${
                      isActive("/cart")
                        ? "text-pink-600 border-b-2 border-pink-600"
                        : "text-gray-700 hover:text-pink-600"
                    }
                  `}
                >
                  <ShoppingCart size={22} strokeWidth={2} />

                  {cartCount > 0 && (
                    <span
                      className="
                        absolute
                        top-1
                        right-1
                        min-w-[18px]
                        h-[18px]
                        px-1
                        flex
                        items-center
                        justify-center
                        rounded-full
                        bg-pink-600
                        text-white
                        text-[10px]
                        font-bold
                      "
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* =================================================
                ADMIN
            ================================================== */}

            {isAdmin && (
              <Link
                to="/admin"
                className={`
                  relative
                  h-14
                  flex
                  items-center
                  gap-2
                  px-4
                  text-sm
                  font-semibold
                  whitespace-nowrap
                  transition-colors
                  ${
                    location.pathname.startsWith("/admin")
                      ? "text-pink-600 border-b-2 border-pink-600"
                      : "text-gray-700 hover:text-pink-600"
                  }
                `}
              >
                <Settings size={17} />
                Quản trị
              </Link>
            )}

            {/* =================================================
                ĐĂNG NHẬP / USER
            ================================================== */}

            {!isAuthenticated ? (
              <Link
                to="/login"
                className={`
                  relative
                  h-14
                  flex
                  items-center
                  gap-2
                  px-4
                  text-sm
                  font-medium
                  whitespace-nowrap
                  transition-colors
                  ${
                    isActive("/login")
                      ? "text-pink-600 border-b-2 border-pink-600"
                      : "text-gray-700 hover:text-pink-600"
                  }
                `}
              >
                <LogIn size={17} />
                Đăng nhập
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="
                  relative
                  h-14
                  flex
                  items-center
                  gap-2
                  px-4
                  text-sm
                  font-medium
                  whitespace-nowrap
                  text-gray-700
                  hover:text-red-600
                  transition-colors
                "
                title={`Đăng xuất ${user?.name || ""}`}
              >
                <LogOut size={17} />
                Đăng xuất
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
