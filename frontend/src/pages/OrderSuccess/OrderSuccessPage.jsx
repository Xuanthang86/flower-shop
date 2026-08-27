import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";

const OrderSuccessPage = () => {
  const navigate = useNavigate();

  let order = null;

  try {
    const savedOrder = localStorage.getItem("flower-shop-last-order");

    if (savedOrder) {
      order = JSON.parse(savedOrder);
    }
  } catch (error) {
    console.error("Lỗi khi đọc đơn hàng:", error);
  }

  return (
    <section className="py-16 md:py-24 bg-gray-50 min-h-[70vh]">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center">
          {/* ICON */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <FiCheckCircle size={48} className="text-green-500" />
            </div>
          </div>

          {/* TIÊU ĐỀ */}
          <h1 className="mt-6 text-3xl md:text-4xl font-bold text-gray-800">
            Đặt hàng thành công!
          </h1>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Cảm ơn bạn đã mua hàng tại Flower Shop. Đơn hàng của bạn đã được
            tiếp nhận và đang được xử lý.
          </p>

          {/* MÃ ĐƠN HÀNG */}
          {order?.id && (
            <div className="mt-6 bg-pink-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Mã đơn hàng</p>

              <p className="mt-1 text-lg font-bold text-pink-600">{order.id}</p>
            </div>
          )}

          {/* TỔNG TIỀN */}
          {order?.total !== undefined && (
            <div className="mt-4 flex justify-between items-center border-b border-gray-200 pb-4">
              <span className="text-gray-600">Tổng tiền</span>

              <span className="font-bold text-pink-600">
                {order.total.toLocaleString("vi-VN")} ₫
              </span>
            </div>
          )}

          {/* PHƯƠNG THỨC THANH TOÁN */}
          {order?.paymentMethod && (
            <div className="mt-4 flex justify-between items-center">
              <span className="text-gray-600">Thanh toán</span>

              <span className="font-medium text-gray-800">
                {order.paymentMethod === "cod"
                  ? "Thanh toán khi nhận hàng"
                  : order.paymentMethod}
              </span>
            </div>
          )}

          {/* BUTTON */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="px-6 py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 transition"
            >
              Tiếp tục mua sắm
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderSuccessPage;
