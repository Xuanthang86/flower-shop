import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "@/context/CartContext";
import { OrderContext } from "@/context/OrderContext";

import AddressForm from "@/components/checkout/AddressForm";
import PaymentMethod from "@/components/checkout/PaymentMethod";

import {
  calculateShipping,
  createShippingSnapshot,
  DELIVERY_MODE,
  DELIVERY_MODE_LABELS,
  formatShippingMoney,
  getAvailableDeliveryTimeSlots,
  getDefaultDeliveryDate,
  getMaxDeliveryDate,
  getTodayDateKey,
} from "@/services/shipping";

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

  const [deliveryMode, setDeliveryMode] = useState(DELIVERY_MODE.STANDARD);

  const [deliveryDate, setDeliveryDate] = useState(getDefaultDeliveryDate());

  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("");

  const [error, setError] = useState("");

  /*
  ==========================================================
  KHUNG GIỜ KHẢ DỤNG
  ==========================================================
  */

  const availableTimeSlots = useMemo(() => {
    return getAvailableDeliveryTimeSlots(deliveryDate, deliveryMode);
  }, [deliveryDate, deliveryMode]);

  /*
  ==========================================================
  TỰ CHỌN KHUNG GIỜ HỢP LỆ
  ==========================================================
  */

  useEffect(() => {
    const stillAvailable = availableTimeSlots.some(
      (slot) => String(slot.id) === String(deliveryTimeSlot)
    );

    if (!stillAvailable) {
      setDeliveryTimeSlot(availableTimeSlots[0]?.id || "");
    }
  }, [availableTimeSlots, deliveryTimeSlot]);

  /*
  ==========================================================
  CHUYỂN HÌNH THỨC GIAO
  ==========================================================
  */

  const handleDeliveryModeChange = (mode) => {
    setError("");

    setDeliveryMode(mode);

    /*
     * Same-day và Express bắt buộc giao hôm nay.
     */
    if (mode === DELIVERY_MODE.SAME_DAY || mode === DELIVERY_MODE.EXPRESS) {
      setDeliveryDate(getTodayDateKey());

      return;
    }

    /*
     * Nếu chuyển về giao tiêu chuẩn từ
     * ngày hôm nay, giữ ngày hiện tại.
     *
     * Nếu ngày đã quá hạn thì dùng ngày mai.
     */
    const today = getTodayDateKey();

    if (!deliveryDate || deliveryDate < today) {
      setDeliveryDate(getDefaultDeliveryDate());
    }
  };

  /*
  ==========================================================
  INPUT THÔNG TIN KHÁCH HÀNG
  ==========================================================
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  /*
  ==========================================================
  ĐỊA CHỈ
  ==========================================================
  */

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

    setError("");
  };

  /*
  ==========================================================
  THANH TOÁN
  ==========================================================
  */

  const handlePaymentChange = (event) => {
    setFormData((currentData) => ({
      ...currentData,
      paymentMethod: event.target.value,
    }));
  };

  /*
  ==========================================================
  TÍNH SHIPPING TRƯỚC KHI ĐẶT
  ==========================================================
  */

  const shippingCalculation = useMemo(() => {
    return calculateShipping({
      address: formData.address,

      subtotal: Number(cartTotal) || 0,

      deliveryDate,

      deliveryTimeSlot,

      deliveryMode,

      deliveryNote: formData.note,

      now: new Date(),
    });
  }, [
    formData.address,
    formData.note,
    cartTotal,
    deliveryDate,
    deliveryTimeSlot,
    deliveryMode,
  ]);

  const shippingFee = shippingCalculation.success
    ? Number(shippingCalculation.shippingFee) || 0
    : 0;

  const grandTotal = (Number(cartTotal) || 0) + shippingFee;

  /*
  ==========================================================
  ĐẶT HÀNG
  ==========================================================
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!cartItems || cartItems.length === 0) {
      setError(
        "Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng."
      );

      return;
    }

    if (!formData.fullName.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }

    if (!formData.address.provinceCode || !formData.address.provinceName) {
      setError("Vui lòng chọn tỉnh/thành phố.");
      return;
    }

    if (!formData.address.wardCode || !formData.address.wardName) {
      setError("Vui lòng chọn phường/xã.");
      return;
    }

    if (!formData.address.houseNumber.trim()) {
      setError("Vui lòng nhập số nhà.");
      return;
    }

    if (!formData.address.street.trim()) {
      setError("Vui lòng nhập tên đường.");
      return;
    }

    /*
     * TÍNH LẠI SHIPPING NGAY TRƯỚC KHI ĐẶT
     *
     * Không sử dụng kết quả cũ trên giao diện.
     */
    const finalShippingCalculation = calculateShipping({
      address: formData.address,

      subtotal: Number(cartTotal) || 0,

      deliveryDate,

      deliveryTimeSlot,

      deliveryMode,

      deliveryNote: formData.note,

      now: new Date(),
    });

    if (!finalShippingCalculation.success) {
      setError(
        finalShippingCalculation.message ||
          "Không thể xác định phí giao hàng. Vui lòng kiểm tra lại thông tin giao hàng."
      );

      return;
    }

    const shippingSnapshot = createShippingSnapshot(finalShippingCalculation);

    if (!shippingSnapshot) {
      setError("Không thể tạo thông tin giao hàng. Vui lòng thử lại.");

      return;
    }

    const finalGrandTotal =
      (Number(cartTotal) || 0) +
      Number(finalShippingCalculation.shippingFee || 0);

    try {
      const result = await createOrder({
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

        /*
         * Tổng hàng hóa trước phí giao.
         */
        subtotal: Number(cartTotal) || 0,

        /*
         * Phí giao tại thời điểm đặt.
         */
        shippingFee: Number(finalShippingCalculation.shippingFee) || 0,

        /*
         * Tổng cuối cùng khách phải thanh toán.
         */
        total: finalGrandTotal,

        /*
         * Giữ shipping snapshot nguyên vẹn trong order.
         */
        shippingSnapshot,

        /*
         * Các trường tiện dụng để đọc nhanh.
         */
        deliveryMode: finalShippingCalculation.deliveryMode,

        deliveryDate: finalShippingCalculation.deliveryDate,

        deliveryTimeSlot: finalShippingCalculation.deliveryTimeSlot,

        deliveryNote: finalShippingCalculation.deliveryNote,

        status: "pending",
      });

      if (!result || result.success !== true || !result.order) {
        setError(
          result?.message || "Không thể tạo đơn hàng. Vui lòng thử lại."
        );

        return;
      }

      const newOrder = result.order;

      try {
        localStorage.setItem(
          "flower-shop-last-order",
          JSON.stringify(newOrder)
        );
      } catch (storageError) {
        console.error("Lỗi lưu đơn hàng gần nhất:", storageError);
      }

      clearCart();

      navigate("/order-success", {
        state: {
          orderId: newOrder.id,
        },
      });
    } catch (submitError) {
      console.error("Lỗi đặt hàng:", submitError);

      setError(submitError?.message || "Không thể đặt hàng. Vui lòng thử lại.");
    }
  };

  /*
  ==========================================================
  GIỎ HÀNG TRỐNG
  ==========================================================
  */

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

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
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
              </div>
            </div>

            {/* =====================================
                GIAO HÀNG
            ====================================== */}

            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-gray-800">
                  Giao hàng
                </h2>

                <p className="text-sm text-gray-500">
                  Phí giao được tính ngay trước khi đặt hàng.
                </p>
              </div>

              {/* KHU VỰC */}

              {formData.address.provinceName && formData.address.wardName && (
                <div
                  className={`mt-5 rounded-xl border p-4 ${
                    shippingCalculation.success
                      ? "border-green-200 bg-green-50"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-800">
                    Khu vực giao hàng
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {shippingCalculation.success
                      ? shippingCalculation.zoneLabel
                      : shippingCalculation.message}
                  </p>
                </div>
              )}

              {/* HÌNH THỨC GIAO */}

              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Hình thức giao hàng
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    DELIVERY_MODE.STANDARD,
                    DELIVERY_MODE.SAME_DAY,
                    DELIVERY_MODE.EXPRESS,
                  ].map((mode) => {
                    const checked = deliveryMode === mode;

                    return (
                      <label
                        key={mode}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                          checked
                            ? "border-pink-500 bg-pink-50"
                            : "border-gray-200 bg-white hover:border-pink-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMode"
                          value={mode}
                          checked={checked}
                          onChange={() => handleDeliveryModeChange(mode)}
                          className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500"
                        />

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-gray-800">
                              {DELIVERY_MODE_LABELS[mode]}
                            </span>

                            {mode === DELIVERY_MODE.STANDARD && (
                              <span className="text-sm text-gray-500">
                                Theo phí khu vực
                              </span>
                            )}

                            {mode === DELIVERY_MODE.SAME_DAY && (
                              <span className="text-sm font-medium text-pink-600">
                                +20.000 ₫
                              </span>
                            )}

                            {mode === DELIVERY_MODE.EXPRESS && (
                              <span className="text-sm font-medium text-pink-600">
                                +40.000 ₫
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-gray-500">
                            {mode === DELIVERY_MODE.STANDARD &&
                              "Giao theo ngày và khung giờ bạn lựa chọn."}

                            {mode === DELIVERY_MODE.SAME_DAY &&
                              "Nhận giao trong ngày nếu đặt trước giờ giới hạn."}

                            {mode === DELIVERY_MODE.EXPRESS &&
                              "Ưu tiên giao hỏa tốc trong ngày."}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* NGÀY GIAO */}

              <div className="mt-6">
                <label
                  htmlFor="deliveryDate"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Ngày giao hàng
                </label>

                <input
                  id="deliveryDate"
                  type="date"
                  min={getTodayDateKey()}
                  max={getMaxDeliveryDate()}
                  value={deliveryDate}
                  disabled={
                    deliveryMode === DELIVERY_MODE.SAME_DAY ||
                    deliveryMode === DELIVERY_MODE.EXPRESS
                  }
                  onChange={(event) => setDeliveryDate(event.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none disabled:bg-gray-100 disabled:text-gray-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                />

                {(deliveryMode === DELIVERY_MODE.SAME_DAY ||
                  deliveryMode === DELIVERY_MODE.EXPRESS) && (
                  <p className="mt-2 text-xs text-gray-500">
                    Hình thức này chỉ áp dụng cho ngày hôm nay.
                  </p>
                )}
              </div>

              {/* KHUNG GIỜ */}

              <div className="mt-6">
                <label
                  htmlFor="deliveryTimeSlot"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Khung giờ giao hàng
                </label>

                <select
                  id="deliveryTimeSlot"
                  value={deliveryTimeSlot}
                  onChange={(event) => setDeliveryTimeSlot(event.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                >
                  {availableTimeSlots.length === 0 ? (
                    <option value="">Không còn khung giờ phù hợp</option>
                  ) : (
                    availableTimeSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.label}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* GHI CHÚ GIAO HÀNG */}

              <div className="mt-6">
                <label
                  htmlFor="note"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ghi chú giao hàng
                </label>

                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Ví dụ: Gọi trước khi giao, giao tại quầy lễ tân..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                />
              </div>

              {/* SHIPPING SUMMARY */}

              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <div className="flex justify-between gap-4 text-sm text-gray-600">
                  <span>Phí giao cơ bản</span>

                  <span>
                    {shippingCalculation.success
                      ? shippingCalculation.freeShippingApplied
                        ? "Miễn phí"
                        : formatShippingMoney(
                            shippingCalculation.originalBaseFee
                          )
                      : "—"}
                  </span>
                </div>

                {shippingCalculation.success &&
                  shippingCalculation.surcharge > 0 && (
                    <div className="mt-2 flex justify-between gap-4 text-sm text-gray-600">
                      <span>Phụ phí dịch vụ</span>

                      <span>
                        {formatShippingMoney(shippingCalculation.surcharge)}
                      </span>
                    </div>
                  )}

                <div className="mt-3 border-t border-gray-200 pt-3 flex justify-between gap-4 font-semibold text-gray-800">
                  <span>Phí giao hàng</span>

                  <span className="text-pink-600">
                    {shippingCalculation.success
                      ? shippingFee === 0
                        ? "Miễn phí"
                        : formatShippingMoney(shippingFee)
                      : "Chưa xác định"}
                  </span>
                </div>

                {shippingCalculation.success &&
                  !shippingCalculation.freeShippingApplied &&
                  Number(cartTotal) <
                    Number(shippingCalculation.freeShippingThreshold) && (
                    <p className="mt-3 text-xs text-gray-500">
                      Đơn từ{" "}
                      {formatShippingMoney(
                        shippingCalculation.freeShippingThreshold
                      )}{" "}
                      sẽ được miễn phí giao hàng cơ bản.
                    </p>
                  )}

                {!shippingCalculation.success &&
                  formData.address.provinceName &&
                  formData.address.wardName && (
                    <p className="mt-3 text-sm text-orange-600">
                      {shippingCalculation.message}
                    </p>
                  )}
              </div>
            </div>

            {/* =====================================
                THANH TOÁN
            ====================================== */}

            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <PaymentMethod
                value={formData.paymentMethod}
                onChange={handlePaymentChange}
              />
            </div>
          </div>

          {/* =====================================
              TÓM TẮT ĐƠN HÀNG
          ====================================== */}

          <div className="bg-white rounded-2xl shadow-sm p-6 h-fit lg:sticky lg:top-6">
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

              <div className="flex justify-between mt-3 text-gray-600">
                <span>Phí giao hàng</span>

                <span>
                  {shippingCalculation.success
                    ? shippingFee === 0
                      ? "Miễn phí"
                      : formatShippingMoney(shippingFee)
                    : "—"}
                </span>
              </div>

              <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 text-lg font-bold text-gray-800">
                <span>Tổng cộng</span>

                <span className="text-pink-600">
                  {shippingCalculation.success
                    ? grandTotal.toLocaleString("vi-VN")
                    : Number(cartTotal).toLocaleString("vi-VN")}{" "}
                  ₫
                </span>
              </div>

              {!shippingCalculation.success && (
                <p className="mt-3 text-xs leading-5 text-orange-600">
                  Vui lòng hoàn tất địa chỉ và lựa chọn giao hàng để hệ thống
                  xác định tổng tiền chính xác.
                </p>
              )}

              <button
                type="submit"
                disabled={!shippingCalculation.success}
                className="w-full mt-6 bg-pink-600 text-white py-3.5 rounded-xl font-semibold hover:bg-pink-700 transition disabled:cursor-not-allowed disabled:bg-gray-300"
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
