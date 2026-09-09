import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";

import { ROLES, useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const getDiscountPercent = (product) => {
  const oldPrice = Number(product?.oldPrice || 0);
  const price = Number(product?.price || 0);

  if (
    !Number.isFinite(oldPrice) ||
    !Number.isFinite(price) ||
    oldPrice <= price ||
    price <= 0
  ) {
    return 0;
  }

  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);

  const isStaff =
    user &&
    [ROLES.ADMIN, ROLES.MANAGER, ROLES.PRODUCT_MANAGER].includes(user.role);

  const image =
    product?.image ||
    product?.images?.[0] ||
    product?.imageUrl ||
    product?.thumbnail ||
    "";

  const discountPercent = getDiscountPercent(product);

  const showAddToCart = !isStaff;

  const showToast = (message) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast(message);

    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
    }, 2200);
  };

  const handleAddToCart = () => {
    if (!user) {
      showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");

      window.setTimeout(() => {
        navigate("/login", {
          state: {
            from: `/products/${product.id}`,
          },
        });
      }, 900);

      return;
    }

    if (user.role !== ROLES.CUSTOMER) {
      return;
    }

    const result = addToCart(product, 1);

    showToast(
      result?.success
        ? result.message || "Đã thêm sản phẩm vào giỏ hàng."
        : result?.message || "Không thể thêm sản phẩm vào giỏ hàng."
    );
  };

  return (
    <>
      <article className="group overflow-hidden rounded-xl bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <Link
          to={`/products/${product.id}`}
          className="relative block"
          aria-label={`Xem ${product.name}`}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
            {image ? (
              <img
                src={image}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                Chưa có hình ảnh
              </div>
            )}

            {discountPercent > 0 && (
              <span className="absolute left-2 top-2 rounded-md bg-pink-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                GIẢM {discountPercent}%
              </span>
            )}
          </div>
        </Link>

        <div className="p-3">
          <Link to={`/products/${product.id}`} className="block">
            <h3 className="line-clamp-2 min-h-[38px] text-sm font-semibold leading-5 text-gray-800 transition hover:text-pink-600">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 line-clamp-2 min-h-[34px] text-xs leading-5 text-gray-500">
            {product.description ||
              "Sản phẩm hoa tươi được tuyển chọn và thiết kế phù hợp với từng dịp."}
          </p>

          <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-bold text-pink-600">
              {money(product.price)}
            </span>

            {product.oldPrice && (
              <span className="text-[11px] text-gray-400 line-through">
                {money(product.oldPrice)}
              </span>
            )}
          </div>

          <div className="mt-3 flex w-full gap-2">
            <Link
              to={`/products/${product.id}`}
              className="flex min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-pink-600 px-2 py-2 text-center text-[11px] font-semibold text-white transition hover:bg-pink-700 sm:text-xs"
            >
              Xem sản phẩm
            </Link>

            {showAddToCart && (
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-pink-600 px-2 py-2 text-[11px] font-semibold text-white transition hover:bg-pink-700 sm:text-xs"
              >
                <FiShoppingCart size={13} />
                <span>Thêm vào giỏ</span>
              </button>
            )}
          </div>
        </div>
      </article>

      {toast && (
        <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl bg-gray-900/95 px-5 py-3 text-center text-sm font-medium text-white shadow-2xl"
          >
            {toast}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
