import { useState } from "react";

import { Link } from "react-router-dom";

import { FiShoppingCart } from "react-icons/fi";

import { ROLES, useAuth } from "@/context/AuthContext";

import { useCart } from "@/context/CartContext";

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const ProductCard = ({ product }) => {
  const { user } = useAuth();

  const { addToCart } = useCart();

  const [toast, setToast] = useState("");

  const isCustomer = user?.role === ROLES.CUSTOMER;

  const image = product?.image || product?.images?.[0] || "";

  const handleAddToCart = () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (!isCustomer) {
      return;
    }

    const result = addToCart(product, 1);

    if (result?.success) {
      setToast(result.message || "Đã thêm sản phẩm vào giỏ hàng.");
    } else {
      setToast(result?.message || "Không thể thêm sản phẩm vào giỏ hàng.");
    }

    window.setTimeout(() => setToast(""), 2200);
  };

  return (
    <>
      <article className="group overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <Link to={`/products/${product.id}`} className="block">
          <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50">
            {image ? (
              <img
                src={image}
                alt={product.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                Chưa có hình ảnh
              </div>
            )}
          </div>
        </Link>

        <div className="p-3">
          <Link to={`/products/${product.id}`}>
            <h3 className="line-clamp-2 min-h-[38px] text-sm font-semibold leading-5 text-gray-800 hover:text-pink-600">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 line-clamp-2 min-h-[34px] text-xs leading-5 text-gray-500">
            {product.description ||
              "Sản phẩm hoa tươi được tuyển chọn và thiết kế phù hợp với từng dịp."}
          </p>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-bold text-pink-600">
              {money(product.price)}
            </span>

            {product.oldPrice && (
              <span className="text-[11px] text-gray-400 line-through">
                {money(product.oldPrice)}
              </span>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <Link
              to={`/products/${product.id}`}
              className={`flex-1 rounded-lg px-2 py-2 text-center text-xs font-semibold ${
                isCustomer
                  ? "bg-gray-100 text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                  : "bg-pink-600 text-white hover:bg-pink-700"
              }`}
            >
              Xem sản phẩm
            </Link>

            {isCustomer && (
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-pink-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-pink-700"
              >
                <FiShoppingCart size={14} />
                <span>Thêm vào giỏ</span>
              </button>
            )}
          </div>
        </div>
      </article>

      {toast && (
        <div className="pointer-events-none fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="rounded-xl bg-gray-900 px-5 py-3 text-center text-sm font-medium text-white shadow-2xl">
            {toast}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
