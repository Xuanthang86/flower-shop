import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "@/context/CartContext";
import { OrderContext } from "@/context/OrderContext";

import AddressForm from "@/components/checkout/AddressForm";
import PaymentMethod from "@/components/checkout/PaymentMethod";

import {
  calculateShippingAsync,
  createShippingSnapshot,
  DELIVERY_MODE,
  DELIVERY_MODE_LABELS,
  formatShippingMoney,
  getAvailableDeliveryTimeSlots,
  getDefaultDeliveryDate,
  getMaxDeliveryDate,
  getTodayDateKey,
} from "@/services/shipping";

const EMPTY_SHIPPING_RESULT = {
  success: false,
  message: "Vui lòng nhập đầy đủ địa chỉ nhận hàng để tính phí giao hàng.",
  shippingFee: 0,
  distanceKm: null,
  freeShippingApplied: false,
};

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

  /*
  ==========================================================
  DELIVERY MODE
  ==========================================================
  */

  const [deliveryMode, setDeliveryMode] = useState(DELIVERY_MODE.STANDARD);

  const [deliveryDate, setDeliveryDate] = useState(
    getDefaultDeliveryDate(DELIVERY_MODE.STANDARD)
  );

  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("");

  /*
  ==========================================================
  SHIPPING STATE
  ==========================================================
  */

  const [shippingCalculation, setShippingCalculation] = useState(
    EMPTY_SHIPPING_RESULT
  );

  const [shippingLoading, setShippingLoading] = useState(false);

  const [shippingRequestId, setShippingRequestId] = useState(0);

  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  /*
  ==========================================================
  CART TOTAL
  ==========================================================
  */

  const subtotal = Number(cartTotal) || 0;

  const shippingFee = shippingCalculation.success
    ? Number(shippingCalculation.shippingFee) || 0
    : 0;

  const grandTotal = subtotal + shippingFee;

  /*
  ==========================================================
  AVAILABLE TIME SLOTS
  ==========================================================
  */

  const availableTimeSlots = useMemo(() => {
    return getAvailableDeliveryTimeSlots(deliveryDate, deliveryMode);
  }, [deliveryDate, deliveryMode]);

  /*
  ==========================================================
  AUTO SELECT TIME SLOT
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
  DELIVERY MODE CHANGE
  ==========================================================
  */

  const handleDeliveryModeChange = (mode) => {
    setError("");

    setShippingCalculation(EMPTY_SHIPPING_RESULT);

    setDeliveryMode(mode);

    setDeliveryDate(getDefaultDeliveryDate(mode));
  };

  /*
  ==========================================================
  CUSTOMER INPUT
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
  ADDRESS CHANGE
  ==========================================================
  */

  const handleAddressChange = (address) => {
    const nextAddress = {
      provinceCode: address?.provinceCode || "",

      provinceName: address?.provinceName || "",

      wardCode: address?.wardCode || "",

      wardName: address?.wardName || "",

      houseNumber: address?.houseNumber || "",

      street: address?.street || "",
    };

    setFormData((currentData) => ({
      ...currentData,

      address: nextAddress,
    }));

    setShippingCalculation(EMPTY_SHIPPING_RESULT);

    setError("");

    /*
     * Tăng request ID để các request
     * cũ không được phép ghi đè kết quả mới.
     */
    setShippingRequestId((current) => current + 1);
  };

  /*
  ==========================================================
  PAYMENT
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
  CALCULATE SHIPPING
  ==========================================================

  Chỉ tính khi có:
  - Tỉnh/thành
  - Phường/xã
  - Số nhà
  - Tên đường
  - Ngày
  - Khung giờ

  Sau đó:
  - geocode địa chỉ
  - tính km
  - tính phí
  ==========================================================
  */

  useEffect(() => {
    let cancelled = false;

    const address = formData.address;

    const hasCompleteAddress = Boolean(
      address?.provinceCode &&
      address?.provinceName &&
      address?.wardCode &&
      address?.wardName &&
      address?.houseNumber?.trim() &&
      address?.street?.trim()
    );

    if (!hasCompleteAddress) {
      setShippingCalculation(EMPTY_SHIPPING_RESULT);

      setShippingLoading(false);

      return undefined;
    }

    if (!deliveryDate) {
      setShippingCalculation({
        ...EMPTY_SHIPPING_RESULT,

        message: "Vui lòng chọn ngày giao hàng.",
      });

      return undefined;
    }

    if (!deliveryTimeSlot) {
      setShippingCalculation({
        ...EMPTY_SHIPPING_RESULT,

        message: "Vui lòng chọn khung giờ giao hàng.",
      });

      return undefined;
    }

    const currentRequestId = shippingRequestId;

    setShippingLoading(true);

    setShippingCalculation({
      ...EMPTY_SHIPPING_RESULT,

      message: "Đang xác định khoảng cách và phí giao hàng...",
    });

    calculateShippingAsync({
      address,

      subtotal,

      deliveryDate,

      deliveryTimeSlot,

      deliveryMode,

      deliveryNote: formData.note,

      now: new Date(),
    })
      .then((result) => {
        if (cancelled) {
          return;
        }

        if (currentRequestId !== shippingRequestId) {
          return;
        }

        setShippingCalculation(result);

        if (!result.success) {
          setError(result.message || "Không thể tính phí giao hàng.");
        }
      })
      .catch((calculationError) => {
        if (cancelled) {
          return;
        }

        console.error("Lỗi tính phí giao hàng:", calculationError);

        setShippingCalculation({
          ...EMPTY_SHIPPING_RESULT,

          message:
            calculationError?.message || "Không thể xác định phí giao hàng.",
        });

        setError(
          calculationError?.message ||
            "Không thể xác định phí giao hàng. Vui lòng kiểm tra lại địa chỉ."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setShippingLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    formData.address,
    formData.note,
    subtotal,
    deliveryDate,
    deliveryTimeSlot,
    deliveryMode,
    shippingRequestId,
  ]);

  /*
  ==========================================================
  SUBMIT
  ==========================================================
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (submitting) {
      return;
    }

    /*
     * Kiểm tra giỏ hàng.
     */
    if (!cartItems || cartItems.length === 0) {
      setError(
        "Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng."
      );

      return;
    }

    /*
     * Kiểm tra khách hàng.
     */
    if (!formData.fullName.trim()) {
      setError("Vui lòng nhập họ và tên.");

      return;
    }

    if (!formData.phone.trim()) {
      setError("Vui lòng nhập số điện thoại.");

      return;
    }

    /*
     * Kiểm tra địa chỉ.
     */
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

    if (!deliveryDate) {
      setError("Vui lòng chọn ngày giao hàng.");

      return;
    }

    if (!deliveryTimeSlot) {
      setError("Vui lòng chọn khung giờ giao hàng.");

      return;
    }

    /*
     * Nếu đang tính khoảng cách,
     * không cho đặt.
     */
    if (shippingLoading) {
      setError(
        "Hệ thống đang xác định khoảng cách và phí giao hàng. Vui lòng chờ một chút."
      );

      return;
    }

    /*
     * Phải có kết quả shipping thành công.
     */
    if (!shippingCalculation?.success) {
      setError(
        shippingCalculation?.message ||
          "Không thể xác định phí giao hàng. Vui lòng kiểm tra lại địa chỉ."
      );

      return;
    }

    /*
     * TÍNH LẠI LẦN CUỐI TRƯỚC KHI ĐẶT
     *
     * Không tin hoàn toàn vào state
     * hiển thị trên giao diện.
     */
    setSubmitting(true);

    try {
      const finalShippingCalculation = await calculateShippingAsync({
        address: formData.address,

        subtotal,

        deliveryDate,

        deliveryTimeSlot,

        deliveryMode,

        deliveryNote: formData.note,

        now: new Date(),
      });

      if (!finalShippingCalculation.success) {
        setError(
          finalShippingCalculation.message ||
            "Không thể xác định phí giao hàng."
        );

        return;
      }

      const shippingSnapshot = createShippingSnapshot(finalShippingCalculation);

      if (!shippingSnapshot) {
        setError("Không thể tạo thông tin giao hàng. Vui lòng thử lại.");

        return;
      }

      const finalShippingFee =
        Number(finalShippingCalculation.shippingFee) || 0;

      const finalGrandTotal = subtotal + finalShippingFee;

      /*
       * Tạo order.
       *
       * OrderProvider hiện tại nhận object
       * orderData nên shippingSnapshot
       * sẽ được giữ trong order.
       */
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
         * Giá trị hàng hóa.
         */
        subtotal,

        /*
         * Phí giao đã chốt.
         */
        shippingFee: finalShippingFee,

        /*
         * Tổng thanh toán.
         */
        total: finalGrandTotal,

        /*
         * Shipping snapshot.
         */
        shippingSnapshot,

        /*
         * Các trường tiện dụng.
         */
        deliveryMode: finalShippingCalculation.deliveryMode,

        deliveryModeLabel: finalShippingCalculation.deliveryModeLabel,

        deliveryDate: finalShippingCalculation.deliveryDate,

        deliveryTimeSlot: finalShippingCalculation.deliveryTimeSlot,

        deliveryTimeSlotLabel: finalShippingCalculation.deliveryTimeSlotLabel,

        deliveryNote: finalShippingCalculation.deliveryNote,

        deliveryDistanceKm: finalShippingCalculation.distanceKm,

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
    } finally {
      setSubmitting(false);
    }
  };

  /*
  ==========================================================
  EMPTY CART
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

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

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
              LEFT
          ====================================== */}

          <div className="lg:col-span-2 space-y-8">
            {/* THÔNG TIN NHẬN HÀNG */}

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

                {/* PHONE */}

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

                {/* ADDRESS */}

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

            {/* GIAO HÀNG */}

            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Giao hàng
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Khoảng cách được tính từ 40 Nguyễn Chí Thanh, Đà Nẵng.
                </p>
              </div>

              {/* DELIVERY MODE */}

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Hình thức giao hàng
                </h3>

                <div className="space-y-3">
                  {[
                    DELIVERY_MODE.ECONOMY,
                    DELIVERY_MODE.STANDARD,
                    DELIVERY_MODE.EXPRESS,
                  ].map((mode) => {
                    const modeFee =
                      mode === DELIVERY_MODE.EXPRESS
                        ? 50000
                        : mode === DELIVERY_MODE.STANDARD
                          ? 30000
                          : 20000;

                    return (
                      <label
                        key={mode}
                        className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition ${
                          deliveryMode === mode
                            ? "border-pink-500 bg-pink-50"
                            : "border-gray-200 hover:border-pink-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMode"
                          value={mode}
                          checked={deliveryMode === mode}
                          onChange={() => handleDeliveryModeChange(mode)}
                          className="mt-1"
                        />

                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <p className="font-medium text-gray-800">
                              {DELIVERY_MODE_LABELS[mode]}
                            </p>

                            <p className="font-semibold text-pink-600">
                              {formatShippingMoney(modeFee)}
                            </p>
                          </div>

                          <p className="text-sm text-gray-500 mt-1">
                            {mode === DELIVERY_MODE.ECONOMY &&
                              "Thời gian giao dài hơn, phí thấp nhất."}

                            {mode === DELIVERY_MODE.STANDARD &&
                              "Nhanh hơn giao tiết kiệm, phù hợp đơn hàng thông thường."}

                            {mode === DELIVERY_MODE.EXPRESS &&
                              "Ưu tiên giao nhanh trong ngày."}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* DATE */}

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="deliveryDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ngày giao hàng *
                  </label>

                  <input
                    id="deliveryDate"
                    type="date"
                    value={deliveryDate}
                    min={getTodayDateKey()}
                    max={getMaxDeliveryDate()}
                    disabled={deliveryMode === DELIVERY_MODE.EXPRESS}
                    onChange={(event) => {
                      setDeliveryDate(event.target.value);

                      setShippingCalculation(EMPTY_SHIPPING_RESULT);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 disabled:bg-gray-100"
                  />

                  {deliveryMode === DELIVERY_MODE.EXPRESS && (
                    <p className="mt-1 text-xs text-gray-500">
                      Giao hỏa tốc chỉ áp dụng trong hôm nay.
                    </p>
                  )}
                </div>

                {/* TIME SLOT */}

                <div>
                  <label
                    htmlFor="deliveryTimeSlot"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Khung giờ giao *
                  </label>

                  <select
                    id="deliveryTimeSlot"
                    value={deliveryTimeSlot}
                    onChange={(event) => {
                      setDeliveryTimeSlot(event.target.value);

                      setShippingCalculation(EMPTY_SHIPPING_RESULT);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  >
                    <option value="">Chọn khung giờ</option>

                    {availableTimeSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.label}
                      </option>
                    ))}
                  </select>

                  {availableTimeSlots.length === 0 && (
                    <p className="mt-1 text-xs text-red-500">
                      Hiện không còn khung giờ phù hợp với hình thức giao đã
                      chọn.
                    </p>
                  )}
                </div>
              </div>

              {/* SHIPPING CALCULATION */}

              <div className="mt-6 rounded-xl border border-gray-200 p-4">
                {shippingLoading ? (
                  <div>
                    <p className="font-medium text-gray-800">
                      Đang xác định khoảng cách...
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Hệ thống đang xác định vị trí địa chỉ nhận hàng và tính
                      phí giao.
                    </p>
                  </div>
                ) : shippingCalculation.success ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-600">Khoảng cách</span>

                      <span className="font-semibold text-gray-800">
                        {Number(shippingCalculation.distanceKm).toFixed(2)} km
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-600">Hình thức giao</span>

                      <span className="font-medium text-gray-800">
                        {shippingCalculation.deliveryModeLabel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-600">Phí giao</span>

                      <span
                        className={`font-semibold ${
                          shippingCalculation.freeShippingApplied
                            ? "text-green-600"
                            : "text-pink-600"
                        }`}
                      >
                        {shippingCalculation.freeShippingApplied
                          ? "Miễn phí"
                          : formatShippingMoney(
                              shippingCalculation.shippingFee
                            )}
                      </span>
                    </div>

                    {shippingCalculation.freeShippingApplied && (
                      <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                        {shippingCalculation.freeShippingReason}
                      </div>
                    )}

                    {!shippingCalculation.freeShippingApplied && (
                      <p className="text-xs text-gray-500">
                        Đơn từ 500.000đ hoặc khoảng cách dưới 7 km sẽ được miễn
                        phí giao hàng.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {shippingCalculation.message ||
                      "Nhập đầy đủ địa chỉ để hệ thống tính phí giao hàng."}
                  </p>
                )}
              </div>

              {/* NOTE */}

              <div className="mt-6">
                <label
                  htmlFor="deliveryNote"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ghi chú giao hàng
                </label>

                <textarea
                  id="deliveryNote"
                  name="note"
                  rows={4}
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                />
              </div>
            </div>

            {/* PAYMENT */}

            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <PaymentMethod
                value={formData.paymentMethod}
                onChange={handlePaymentChange}
              />
            </div>
          </div>

          {/* =====================================
              ORDER SUMMARY
          ====================================== */}

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 lg:sticky lg:top-24">
              <h2 className="text-xl font-semibold text-gray-800">Đơn hàng</h2>

              <div className="mt-6 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          Hoa
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 line-clamp-2">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {item.quantity} × {formatShippingMoney(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">Tạm tính</span>

                  <span className="font-medium text-gray-800">
                    {formatShippingMoney(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">Phí giao hàng</span>

                  <span
                    className={`font-medium ${
                      shippingCalculation.success &&
                      shippingCalculation.freeShippingApplied
                        ? "text-green-600"
                        : "text-gray-800"
                    }`}
                  >
                    {shippingCalculation.success
                      ? shippingCalculation.freeShippingApplied
                        ? "Miễn phí"
                        : formatShippingMoney(shippingFee)
                      : "Chưa tính"}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-4">
                  <span className="font-semibold text-gray-800">Tổng cộng</span>

                  <span className="text-xl font-bold text-pink-600">
                    {formatShippingMoney(grandTotal)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  submitting || shippingLoading || !shippingCalculation.success
                }
                className="w-full mt-6 bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Đang đặt hàng..."
                  : shippingLoading
                    ? "Đang tính phí giao hàng..."
                    : "Đặt hàng"}
              </button>

              {!shippingCalculation.success && !shippingLoading && (
                <p className="mt-3 text-xs text-center text-gray-500">
                  Vui lòng nhập đầy đủ địa chỉ để hệ thống tính phí giao hàng
                  trước khi đặt.
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CheckoutPage;
