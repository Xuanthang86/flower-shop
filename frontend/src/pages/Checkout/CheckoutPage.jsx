import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "@/context/CartContext";
import { OrderContext } from "@/context/OrderContext";

import AddressForm from "@/components/checkout/AddressForm";
import PaymentMethod from "@/components/checkout/PaymentMethod";

const CheckoutPage = () => {
  const navigate = useNavigate();

  const { cartItems, cartTotal, clearCart } = useCart();
  const { createOrder } = useContext(OrderContext);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",

    address: {
      provinceCode: "",
      provinceName: "",

      wardCode: "",
      wardName: "",

      houseNumber: "",
      street: "",
    },

    note: "",
    paymentMethod: "cod",
  });

  const [error, setError] = useState("");

  // ==========================================
  // INPUT THÔNG TIN KHÁCH HÀNG
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  // ==========================================
  // ĐỊA CHỈ
  // ==========================================

  const handleAddressChange = (address) => {
    setFormData((currentData) => ({
      ...currentData,
      address: {
        provinceCode: address?.provinceCode || "",
        provinceName: address?.provinceName || "",

        wardCode: address?.wardCode || "",
        wardName: address?.wardName || "",

        houseNumber: address?.houseNumber || "",
        street: address?.street || "",
      },
    }));
  };

  // ==========================================
  // THANH TOÁN
  // ==========================================

  const handlePaymentChange = (event) => {
    setFormData((currentData) => ({
      ...currentData,
      paymentMethod: event.target.value,
    }));
  };

  // ==========================================
  // ĐẶT HÀNG
  // ==========================================

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    // ------------------------------------------
    // KIỂM TRA GIỎ HÀNG
    // ------------------------------------------

    if (!cartItems || cartItems.length === 0) {
      setError(
        "Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng."
      );
      return;
    }

    // ------------------------------------------
    // THÔNG TIN KHÁCH HÀNG
    // ------------------------------------------

    if (!formData.fullName.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }

    // ------------------------------------------
    // TỈNH / THÀNH PHỐ
    // ------------------------------------------

    if (!formData.address.provinceCode || !formData.address.provinceName) {
      setError("Vui lòng chọn tỉnh/thành phố.");
      return;
    }

    // ------------------------------------------
    // PHƯỜNG / XÃ
    // ------------------------------------------

    if (!formData.address.wardCode || !formData.address.wardName) {
      setError("Vui lòng chọn phường/xã.");
      return;
    }

    // ------------------------------------------
    // SỐ NHÀ
    // ------------------------------------------

    if (!formData.address.houseNumber.trim()) {
      setError("Vui lòng nhập số nhà.");
      return;
    }

    // ------------------------------------------
    // TÊN ĐƯỜNG
    // ------------------------------------------

    if (!formData.address.street.trim()) {
      setError("Vui lòng nhập tên đường.");
      return;
    }

    // ==========================================
    // TẠO ĐƠN HÀNG
    // ==========================================

    const result = createOrder({
      customer: {
        name: formData.fullName.trim(),

        fullName: formData.fullName.trim(),

        phone: formData.phone.trim(),

        email: formData.email.trim(),

        address: {
          provinceCode: formData.address.provinceCode,

          provinceName: formData.address.provinceName,

          wardCode: formData.address.wardCode,

          wardName: formData.address.wardName,

          // QUAN TRỌNG:
          // BỔ SUNG SỐ NHÀ
          houseNumber: formData.address.houseNumber.trim(),

          street: formData.address.street.trim(),
        },

        note: formData.note.trim(),
      },

      paymentMethod: formData.paymentMethod,

      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 0,
        image: item.image || "",
      })),

      total: Number(cartTotal) || 0,

      status: "pending",
    });

    // ==========================================
    // KIỂM TRA KẾT QUẢ CREATE ORDER
    // ==========================================

    if (!result || result.success !== true || !result.order) {
      setError(result?.message || "Không thể tạo đơn hàng. Vui lòng thử lại.");
      return;
    }

    const newOrder = result.order;

    // ==========================================
    // LƯU ĐƠN HÀNG GẦN NHẤT
    // ==========================================

    try {
      localStorage.setItem("flower-shop-last-order", JSON.stringify(newOrder));
    } catch (storageError) {
      console.error("Lỗi lưu đơn hàng gần nhất:", storageError);
    }

    // ==========================================
    // XÓA GIỎ HÀNG
    // ==========================================

    clearCart();

    // ==========================================
    // CHUYỂN TRANG
    // ==========================================

    navigate("/order-success", {
      state: {
        orderId: newOrder.id,
      },
    });
  };

  // ==========================================
  // GIỎ HÀNG TRỐNG
  // ==========================================

  if (!cartItems || cartItems.length === 0) {
    return (
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Thanh toán</h1>

          <p className="mt-4 text-gray-600">Giỏ hàng của bạn đang trống.</p>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="mt-8 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Thanh toán
          </h1>

          <p className="mt-2 text-gray-600">
            Vui lòng nhập thông tin nhận hàng để hoàn tất đơn hàng.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* =====================================
              THÔNG TIN NHẬN HÀNG
          ====================================== */}

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-800">
              Thông tin nhận hàng
            </h2>

            <div className="mt-6 space-y-5">
              {/* HỌ TÊN */}

              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Họ và tên *
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                />
              </div>

              {/* SỐ ĐIỆN THOẠI */}

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Số điện thoại *
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                />
              </div>

              {/* ĐỊA CHỈ */}

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Địa chỉ nhận hàng
                </h3>

                <AddressForm
                  value={formData.address}
                  onChange={handleAddressChange}
                />
              </div>

              {/* GHI CHÚ */}

              <div>
                <label
                  htmlFor="note"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ghi chú đơn hàng
                </label>

                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Ví dụ: Giao giờ hành chính..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                />
              </div>

              {/* THANH TOÁN */}

              <PaymentMethod
                value={formData.paymentMethod}
                onChange={handlePaymentChange}
              />
            </div>
          </div>

          {/* =====================================
              TÓM TẮT ĐƠN HÀNG
          ====================================== */}

          <div className="bg-white rounded-2xl shadow-sm p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-800">
              Đơn hàng của bạn
            </h2>

            <div className="mt-6 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>

                    <p className="text-sm text-gray-500 mt-1">
                      SL: {item.quantity}
                    </p>

                    <p className="text-sm font-medium text-pink-600 mt-1">
                      {(
                        Number(item.price) * Number(item.quantity)
                      ).toLocaleString("vi-VN")}{" "}
                      ₫
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>

                <span>{Number(cartTotal).toLocaleString("vi-VN")} ₫</span>
              </div>

              <div className="flex justify-between mt-3 text-lg font-bold text-gray-800">
                <span>Tổng cộng</span>

                <span className="text-pink-600">
                  {Number(cartTotal).toLocaleString("vi-VN")} ₫
                </span>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-pink-600 text-white py-3.5 rounded-xl font-semibold hover:bg-pink-700 transition"
              >
                Đặt hàng
              </button>

              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Quay lại giỏ hàng
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CheckoutPage;
