import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";

import {
  readProducts,
  readCategories,
  PRODUCT_UPDATED_EVENT,
  CATEGORY_UPDATED_EVENT,
} from "@/services/catalog";

import {
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));

const STAFF_ROLES = new Set(["admin", "manager", "product_manager"]);

const getRole = (user) => {
  if (!user) {
    return "";
  }

  return String(
    user.role || user.userRole || user.accountRole || ""
  ).toLowerCase();
};

const isStaffAccount = (user) => STAFF_ROLES.has(getRole(user));

const getProductImage = (product) => {
  return (
    product?.image ||
    product?.images?.[0] ||
    product?.imageUrl ||
    product?.thumbnail ||
    ""
  );
};

const getProductDescription = (product) => {
  const description =
    product?.description || product?.shortDescription || product?.intro || "";

  return String(description).trim();
};

const FeaturedProducts = () => {
  const [products, setProducts] = useState(() => readProducts());
  const [categories, setCategories] = useState(() => readCategories());
  const [settings, setSettings] = useState(() => readSiteSettings());

  const [cartMessage, setCartMessage] = useState("");

  const { user } = useAuth();
  const { addToCart } = useCart();

  const staffAccount = isStaffAccount(user);

  useEffect(() => {
    const refreshProducts = () => {
      setProducts(readProducts());
    };

    const refreshCategories = () => {
      setCategories(readCategories());
    };

    const refreshSettings = () => {
      setSettings(readSiteSettings());
    };

    window.addEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);
    window.addEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);
    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refreshSettings);

    window.addEventListener("storage", refreshProducts);
    window.addEventListener("storage", refreshCategories);
    window.addEventListener("storage", refreshSettings);

    return () => {
      window.removeEventListener(PRODUCT_UPDATED_EVENT, refreshProducts);

      window.removeEventListener(CATEGORY_UPDATED_EVENT, refreshCategories);

      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, refreshSettings);

      window.removeEventListener("storage", refreshProducts);
      window.removeEventListener("storage", refreshCategories);
      window.removeEventListener("storage", refreshSettings);
    };
  }, []);

  useEffect(() => {
    if (!cartMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCartMessage("");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [cartMessage]);

  const featuredByCategory = useMemo(() => {
    return categories
      .filter((category) => category.active !== false)
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      .map((category) => {
        const categoryProducts = products
          .filter(
            (product) => String(product.category) === String(category.slug)
          )
          .sort((a, b) => {
            const newDifference =
              Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));

            if (newDifference !== 0) {
              return newDifference;
            }

            return Number(b.salesCount || 0) - Number(a.salesCount || 0);
          })
          .slice(0, 5);

        return {
          ...category,
          products: categoryProducts,
        };
      })
      .filter((category) => category.products.length > 0);
  }, [categories, products]);

  const handleAddToCart = (product) => {
    if (staffAccount) {
      return;
    }

    const result = addToCart(product, 1);

    if (!result?.success) {
      setCartMessage(
        result?.message || "Vui lòng đăng nhập trước khi thêm sản phẩm."
      );

      return;
    }

    setCartMessage(`Đã thêm "${product.name}" vào giỏ hàng.`);
  };

  return (
    <>
      <section className="bg-gray-50 py-8 md:py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-7 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              {settings.sections?.featuredTitle || "Sản phẩm nổi bật"}
            </h2>

            {settings.sections?.featuredSubtitle && (
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-500 md:text-base">
                {settings.sections.featuredSubtitle}
              </p>
            )}
          </div>

          {featuredByCategory.map((category) => (
            <div key={category.id} className="mb-9 last:mb-0">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-base font-bold uppercase tracking-wide text-gray-800 md:text-lg">
                  {category.name}
                </h3>

                <Link
                  to={`/products?category=${encodeURIComponent(category.slug)}`}
                  className="shrink-0 text-sm font-semibold text-pink-600 transition hover:text-pink-700"
                >
                  Xem tất cả →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {category.products.map((product) => {
                  const image = getProductImage(product);
                  const description = getProductDescription(product);

                  return (
                    <article key={product.id} className="group min-w-0">
                      <Link to={`/products/${product.id}`} className="block">
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
                          {image ? (
                            <img
                              src={image}
                              alt={product.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-400">
                              Chưa có hình ảnh
                            </div>
                          )}

                          {product.badge && (
                            <span className="absolute left-2 top-2 rounded-full bg-pink-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </Link>

                      <div className="pt-3">
                        <Link to={`/products/${product.id}`} className="block">
                          <h4 className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-5 text-gray-800 transition group-hover:text-pink-600">
                            {product.name}
                          </h4>
                        </Link>

                        <p className="mt-1.5 line-clamp-2 min-h-[36px] text-xs leading-[18px] text-gray-500">
                          {description ||
                            "Sản phẩm hoa tươi được tuyển chọn và chuẩn bị cẩn thận."}
                        </p>

                        <div className="mt-2 flex min-h-[25px] flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="text-sm font-bold text-pink-600">
                            {formatPrice(product.price)}
                          </span>

                          {product.oldPrice && (
                            <span className="text-[11px] text-gray-400 line-through">
                              {formatPrice(product.oldPrice)}
                            </span>
                          )}
                        </div>

                        {staffAccount ? (
                          <Link
                            to={`/products/${product.id}`}
                            className="mt-3 flex h-9 w-full items-center justify-center rounded-lg bg-pink-600 px-2 text-xs font-semibold text-white transition hover:bg-pink-700"
                          >
                            Xem sản phẩm
                          </Link>
                        ) : (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <Link
                              to={`/products/${product.id}`}
                              className="flex h-9 items-center justify-center rounded-lg border border-pink-600 px-2 text-center text-[11px] font-semibold text-pink-600 transition hover:bg-pink-50"
                            >
                              Xem sản phẩm
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              className="flex h-9 items-center justify-center gap-1 rounded-lg bg-pink-600 px-2 text-[11px] font-semibold text-white transition hover:bg-pink-700"
                            >
                              <FiShoppingCart size={13} />
                              <span>Thêm vào giỏ</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}

          {Array.isArray(settings.customerLogos) &&
            settings.customerLogos.length > 0 && (
              <div className="mt-10 border-t border-gray-200 pt-7">
                <h2 className="mb-5 text-center text-base font-bold tracking-wide text-gray-800 md:text-lg">
                  {settings.sections?.customerTitle || "KHÁCH HÀNG TIÊU BIỂU"}
                </h2>

                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-7">
                  {settings.customerLogos.map((logo) => (
                    <div
                      key={logo.id}
                      className="flex h-14 w-24 items-center justify-center bg-white p-2"
                    >
                      {logo.image && (
                        <img
                          src={logo.image}
                          alt={logo.name || "Khách hàng"}
                          className="max-h-full max-w-full object-contain"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </section>

      {cartMessage && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 pointer-events-none">
          <div className="w-full max-w-xs rounded-xl bg-gray-900 px-5 py-4 text-center text-sm font-medium text-white shadow-2xl">
            {cartMessage}
          </div>
        </div>
      )}
    </>
  );
};

export default FeaturedProducts;
