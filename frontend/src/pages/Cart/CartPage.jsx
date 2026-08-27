import { Link } from "react-router-dom";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { useCart } from "@/context/useCart";

const Cart = () => {
  const {
    cartItems,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  return (
    <section className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* TIÊU ĐỀ */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Giỏ hàng
          </h1>

          <p className="text-gray-500 mt-2">
            Kiểm tra các sản phẩm bạn đã chọn
          </p>
        </div>

        {/* GIỎ HÀNG TRỐNG */}
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-6">🛒</div>

            <h2 className="text-2xl font-semibold text-gray-800">
              Giỏ hàng đang trống
            </h2>

            <p className="text-gray-500 mt-3">
              Hãy chọn những bó hoa yêu thích của bạn.
            </p>

            <Link
              to="/products"
              className="
                inline-block
                mt-6
                bg-pink-600
                text-white
                px-6
                py-3
                rounded-xl
                hover:bg-pink-700
                transition
              "
            >
              Tiếp tục mua hàng
            </Link>
          </div>
        ) : (
          /* GIỎ HÀNG CÓ SẢN PHẨM */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* DANH SÁCH */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="
                    bg-white
                    rounded-2xl
                    shadow-sm
                    p-5
                    flex
                    flex-col
                    md:flex-row
                    gap-5
                    items-center
                  "
                >
                  {/* ẢNH */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="
                      w-28
                      h-28
                      rounded-xl
                      object-cover
                    "
                  />

                  {/* THÔNG TIN */}
                  <div className="flex-1 w-full">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {item.name}
                    </h2>

                    <p className="text-pink-600 font-bold mt-2">
                      {item.price.toLocaleString("vi-VN")} ₫
                    </p>

                    {/* SỐ LƯỢNG */}
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.id)}
                        className="
                          w-9
                          h-9
                          border
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          hover:bg-pink-50
                        "
                      >
                        <FiMinus size={15} />
                      </button>

                      <span className="font-semibold min-w-[30px] text-center">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.id)}
                        className="
                          w-9
                          h-9
                          border
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          hover:bg-pink-50
                        "
                      >
                        <FiPlus size={15} />
                      </button>
                    </div>
                  </div>

                  {/* THÀNH TIỀN + XÓA */}
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                    </p>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="
                        mt-4
                        text-gray-400
                        hover:text-red-500
                        transition
                      "
                      title="Xóa sản phẩm"
                    >
                      <FiTrash2 size={19} />
                    </button>
                  </div>
                </div>
              ))}

              {/* XÓA GIỎ */}
              <button
                type="button"
                onClick={clearCart}
                className="
                  text-sm
                  text-red-500
                  hover:text-red-700
                  transition
                "
              >
                Xóa toàn bộ giỏ hàng
              </button>
            </div>

            {/* TỔNG ĐƠN HÀNG */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Tổng đơn hàng
                </h2>

                <div className="flex justify-between mt-6">
                  <span className="text-gray-500">Tạm tính</span>

                  <span className="font-semibold">
                    {cartTotal.toLocaleString("vi-VN")} ₫
                  </span>
                </div>

                <div className="border-t mt-5 pt-5 flex justify-between">
                  <span className="font-semibold">Tổng cộng</span>

                  <span className="text-xl font-bold text-pink-600">
                    {cartTotal.toLocaleString("vi-VN")} ₫
                  </span>
                </div>

                <Link
                  to="/checkout"
                  className="
    block
    w-full
    text-center
    bg-pink-600
    text-white
    py-3
    rounded-xl
    font-semibold
    hover:bg-pink-700
    transition
  "
                >
                  Tiến hành thanh toán
                </Link>

                <Link
                  to="/products"
                  className="
                    block
                    text-center
                    mt-4
                    text-pink-600
                    hover:text-pink-700
                  "
                >
                  ← Tiếp tục mua hàng
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Cart;
