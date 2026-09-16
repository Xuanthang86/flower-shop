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
  SHIPPING_CONFIG,
  formatShippingMoney,
  getAvailableDeliveryTimeSlots,
  getDefaultDeliveryDate,
  getMaxDeliveryDate,
  getTodayDateKey,
} from "@/services/shipping";

const EMPTY_SHIPPING_RESULT = {
  success: false,

  message: "Vui lòng nhập đầy đủ thông tin giao hàng.",

  shippingFee: 0,

  distanceKm: null,

  freeShippingApplied: false,
};

const CHECKOUT_PAYMENT_METHOD = "cod";

const BANK_TRANSFER_PAYMENT_METHOD = "bank_transfer";

/*
 * Không tự bịa thông tin ngân hàng.
 *
 * Shop chỉ cần thay các giá trị này bằng
 * thông tin thật khi triển khai thanh toán.
 */
const BANK_TRANSFER_INFO = {
  bankName: "",

  accountNumber: "",

  accountName: "",

  transferContentPrefix: "FLOWERSHOP",
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

    paymentMethod: CHECKOUT_PAYMENT_METHOD,
  });

  const [deliveryMode, setDeliveryMode] = useState(DELIVERY_MODE.STANDARD);

  const [deliveryDate, setDeliveryDate] = useState(getDefaultDeliveryDate());

  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("");

  const [shippingCalculation, setShippingCalculation] = useState(
    EMPTY_SHIPPING_RESULT
  );

  const [shippingLoading, setShippingLoading] = useState(false);

  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [showExpressFallbackModal, setShowExpressFallbackModal] =
    useState(false);

  const [bankTransferConfirmed, setBankTransferConfirmed] = useState(false);

  const [currentTime, setCurrentTime] = useState(() => new Date());

  const subtotal = Number(cartTotal) || 0;

  const shippingFee = shippingCalculation.success
    ? Number(shippingCalculation.shippingFee) || 0
    : 0;

  const grandTotal = subtotal + shippingFee;

  /*
  ==========================================================
  CURRENT TIME
  ==========================================================
  */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  /*
  ==========================================================
  EXPRESS CUTOFF
  ==========================================================
  */

  const showExpressFallback = () => {
    setDeliveryMode(DELIVERY_MODE.STANDARD);

    setShippingCalculation(EMPTY_SHIPPING_RESULT);

    setDeliveryTimeSlot("");

    setShowExpressFallbackModal(true);
  };

  useEffect(() => {
    if (deliveryMode !== DELIVERY_MODE.EXPRESS) {
      return;
    }

    const today = getTodayDateKey(currentTime);

    if (deliveryDate !== today) {
      return;
    }

    if (currentTime.getHours() < SHIPPING_CONFIG.expressCutoffHour) {
      return;
    }

    showExpressFallback();
  }, [currentTime, deliveryMode, deliveryDate]);

  /*
  ==========================================================
  TIME SLOTS
  ==========================================================
  */

  const availableTimeSlots = useMemo(
    () =>
      getAvailableDeliveryTimeSlots(deliveryDate, deliveryMode, currentTime),
    [deliveryDate, deliveryMode, currentTime]
  );

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
  DELIVERY MODE
  ==========================================================
  */

  const handleDeliveryModeChange = (mode) => {
    setError("");

    const today = getTodayDateKey(currentTime);

    if (
      mode === DELIVERY_MODE.EXPRESS &&
      deliveryDate === today &&
      currentTime.getHours() >= SHIPPING_CONFIG.expressCutoffHour
    ) {
      showExpressFallback();

      return;
    }

    setDeliveryMode(mode);

    /*
     * Không đổi ngày đã chọn.
     * Nếu khách đang đặt trước ngày tương lai,
     * vẫn giữ ngày đó.
     */

    setShippingCalculation(EMPTY_SHIPPING_RESULT);

    setDeliveryTimeSlot("");
  };

  /*
  ==========================================================
  INPUT
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
  ADDRESS
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
  };

  /*
  ==========================================================
  PAYMENT
  ==========================================================
  */

  const handlePaymentChange = (event) => {
    const value = event.target.value;

    setFormData((currentData) => ({
      ...currentData,

      paymentMethod: value,
    }));

    setBankTransferConfirmed(false);

    setError("");
  };

  /*
  ==========================================================
  DELIVERY DATE
  ==========================================================
  */

  const handleDeliveryDateChange = (event) => {
    const nextDate = event.target.value;

    setDeliveryDate(nextDate);

    setDeliveryTimeSlot("");

    setShippingCalculation(EMPTY_SHIPPING_RESULT);

    setError("");
  };

  /*
  ==========================================================
  CALCULATE SHIPPING
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

      setShippingLoading(false);

      return undefined;
    }

    if (!deliveryTimeSlot) {
      setShippingCalculation({
        ...EMPTY_SHIPPING_RESULT,

        message: "Vui lòng chọn khung giờ giao hàng.",
      });

      setShippingLoading(false);

      return undefined;
    }

    setShippingLoading(true);

    /*
     * Không thay đổi text của nút Đặt hàng.
     *
     * Chỉ làm nút disabled trong lúc này.
     */
    setShippingCalculation(EMPTY_SHIPPING_RESULT);

    calculateShippingAsync({
      address,

      subtotal,

      deliveryDate,

      deliveryTimeSlot,

      deliveryMode,

      deliveryNote: formData.note,

      now: currentTime,
    })
      .then((result) => {
        if (cancelled) {
          return;
        }

        setShippingCalculation(result);

        if (!result.success) {
          setError(result.message || "Không thể tính phí giao hàng.");
        } else {
          setError("");
        }
      })
      .catch((calculationError) => {
        if (cancelled) {
          return;
        }

        console.error("Lỗi tính phí giao hàng:", calculationError);

        const message =
          calculationError?.message || "Không thể xác định phí giao hàng.";

        setShippingCalculation({
          ...EMPTY_SHIPPING_RESULT,

          message,
        });

        setError(message);
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
    currentTime,
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

    if (!cartItems?.length) {
      setError("Giỏ hàng đang trống.");

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

    if (!deliveryDate) {
      setError("Vui lòng chọn ngày giao hàng.");

      return;
    }

    if (deliveryDate < getTodayDateKey()) {
      setError("Ngày giao hàng không hợp lệ.");

      return;
    }

    if (deliveryDate > getMaxDeliveryDate()) {
      setError(
        `Ngày giao hàng chỉ được đặt trước tối đa ${SHIPPING_CONFIG.maxAdvanceDays} ngày.`
      );

      return;
    }

    if (!deliveryTimeSlot) {
      setError("Vui lòng chọn khung giờ giao hàng.");

      return;
    }

    if (
      formData.paymentMethod === BANK_TRANSFER_PAYMENT_METHOD &&
      !bankTransferConfirmed
    ) {
      setError(
        "Vui lòng hoàn tất thanh toán chuyển khoản và xác nhận đã thanh toán trước khi đặt hàng."
      );

      return;
    }

    if (shippingLoading || !shippingCalculation.success) {
      setError(
        shippingCalculation?.message ||
          "Vui lòng chờ hệ thống tính phí giao hàng hoàn tất."
      );

      return;
    }

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

      /*
       * Nếu trong lúc khách đang checkout
       * hỏa tốc vừa quá 18h thì không cho bypass.
       */
      const now = new Date();

      if (
        deliveryDate === getTodayDateKey(now) &&
        deliveryMode === DELIVERY_MODE.EXPRESS &&
        now.getHours() >= SHIPPING_CONFIG.expressCutoffHour
      ) {
        showExpressFallback();

        setError(
          "Hình thức giao hàng Giao hỏa tốc không khả dụng với đơn hàng đặt giao từ 18h00 trở về cuối ngày."
        );

        return;
      }

      const shippingSnapshot = createShippingSnapshot(finalShippingCalculation);

      if (!shippingSnapshot) {
        setError("Không thể tạo thông tin giao hàng.");

        return;
      }

      const finalShippingFee =
        Number(finalShippingCalculation.shippingFee) || 0;

      const finalGrandTotal = subtotal + finalShippingFee;

      const paymentStatus =
        formData.paymentMethod === BANK_TRANSFER_PAYMENT_METHOD
          ? "paid_by_customer_confirmation"
          : "pending_cod";

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

        paymentStatus,

        paymentConfirmed:
          formData.paymentMethod === BANK_TRANSFER_PAYMENT_METHOD
            ? true
            : false,

        items: cartItems.map((item) => ({
          id: item.id,

          name: item.name,

          price: Number(item.price) || 0,

          quantity: Number(item.quantity) || 0,

          image: item.image || "",
        })),

        subtotal,

        shippingFee: finalShippingFee,

        total: finalGrandTotal,

        shippingSnapshot,

        deliveryMode: finalShippingCalculation.deliveryMode,

        deliveryModeLabel: finalShippingCalculation.deliveryModeLabel,

        deliveryDate: finalShippingCalculation.deliveryDate,

        deliveryTimeSlot: finalShippingCalculation.deliveryTimeSlot,

        deliveryTimeSlotLabel: finalShippingCalculation.deliveryTimeSlotLabel,

        estimatedDeliveryTime: finalShippingCalculation.estimatedDeliveryTime,

        deliveryNote: finalShippingCalculation.deliveryNote,

        deliveryDistanceKm: finalShippingCalculation.distanceKm,

        status: "pending",
      });

      if (!result || result.success !== true || !result.order) {
        setError(result?.message || "Không thể tạo đơn hàng.");

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
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Thanh toán</h1>

          <p className="mt-4 text-gray-600">Giỏ hàng của bạn đang trống.</p>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="mt-8 rounded-lg bg-pink-600 px-6 py-3 text-white transition hover:bg-pink-700"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">
              Thanh toán
            </h1>

            <p className="mt-2 text-gray-600">
              Vui lòng nhập thông tin nhận hàng để hoàn tất đơn hàng.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-8 lg:grid-cols-3"
          >
            <div className="space-y-8 lg:col-span-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                <h2 className="text-xl font-semibold text-gray-800">
                  Thông tin nhận hàng
                </h2>

                <div className="mt-6 space-y-5">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-sm font-medium text-gray-700"
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium text-gray-700"
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-gray-700"
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">
                      Địa chỉ nhận hàng
                    </h3>

                    <AddressForm
                      value={formData.address}
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                <h2 className="text-xl font-semibold text-gray-800">
                  Giao hàng
                </h2>

                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-semibold text-gray-700">
                    Hình thức giao hàng
                  </h3>

                  <div className="space-y-3">
                    {[
                      DELIVERY_MODE.ECONOMY,
                      DELIVERY_MODE.STANDARD,
                      DELIVERY_MODE.EXPRESS,
                    ].map((mode) => {
                      const modeFee = SHIPPING_CONFIG.deliveryFees[mode];

                      return (
                        <label
                          key={mode}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
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
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <p className="font-medium text-gray-800">
                                {DELIVERY_MODE_LABELS[mode]}
                              </p>

                              <p className="font-semibold text-pink-600">
                                {formatShippingMoney(modeFee)}
                              </p>
                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                              {mode === DELIVERY_MODE.ECONOMY &&
                                "Giao trong ngày, tốc độ chậm hơn, phí thấp nhất."}

                              {mode === DELIVERY_MODE.STANDARD &&
                                "Giao trong ngày, tốc độ trung bình, phù hợp đơn hàng thông thường."}

                              {mode === DELIVERY_MODE.EXPRESS &&
                                "Giao trong ngày, ưu tiên nhanh nhất và luôn tính phí 50.000đ."}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="deliveryDate"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Ngày giao hàng *
                  </label>

                  <input
                    id="deliveryDate"
                    type="date"
                    value={deliveryDate}
                    min={getTodayDateKey(currentTime)}
                    max={getMaxDeliveryDate()}
                    onChange={handleDeliveryDateChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Bạn có thể đặt trước ngày giao hàng để hẹn shop giao vào
                    ngày mong muốn.
                  </p>
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="deliveryTimeSlot"
                    className="mb-2 block text-sm font-medium text-gray-700"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  >
                    <option value="">Chọn khung giờ</option>

                    {availableTimeSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 rounded-xl border border-gray-200 p-4">
                  {shippingCalculation.success ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-gray-600">Số km</span>

                        <span className="font-semibold text-gray-800">
                          {Number(shippingCalculation.distanceKm).toFixed(2)} km
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-gray-600">
                          Thời gian giao hàng dự kiến
                        </span>

                        <span className="text-right font-semibold text-gray-800">
                          {shippingCalculation.estimatedDeliveryTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-gray-600">Hình thức giao</span>

                        <span className="font-medium text-gray-800">
                          {shippingCalculation.deliveryModeLabel}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-gray-600">Phí giao hàng</span>

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

                      {shippingCalculation.freeShippingApplied &&
                        shippingCalculation.deliveryMode !==
                          DELIVERY_MODE.EXPRESS && (
                          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                            {shippingCalculation.freeShippingReason}
                          </div>
                        )}

                      {deliveryMode === DELIVERY_MODE.EXPRESS && (
                        <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700">
                          Giao hỏa tốc luôn tính phí giao hàng 50.000đ.
                        </div>
                      )}
                    </div>
                  ) : shippingLoading ? (
                    <p className="text-sm text-gray-500">
                      Đang tính phí giao hàng...
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {shippingCalculation.message}
                    </p>
                  )}
                </div>

                <div className="mt-6 rounded-xl border border-pink-100 bg-pink-50 px-4 py-3 text-sm leading-6 text-gray-700">
                  <strong>Lưu ý:</strong> Để shop có thể chuẩn bị sản phẩm tốt
                  nhất, quý khách vui lòng chọn mẫu và đặt trước từ 2 tiếng đối
                  với các mẫu hoa cắm theo yêu cầu.
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="deliveryNote"
                    className="mb-2 block text-sm font-medium text-gray-700"
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
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                <PaymentMethod
                  value={formData.paymentMethod}
                  onChange={handlePaymentChange}
                />

                {formData.paymentMethod === BANK_TRANSFER_PAYMENT_METHOD && (
                  <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <h3 className="font-semibold text-gray-800">
                      Thông tin thanh toán chuyển khoản
                    </h3>

                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Ngân hàng</span>

                        <span className="font-medium text-gray-800">
                          {BANK_TRANSFER_INFO.bankName || "Chưa cấu hình"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Số tài khoản</span>

                        <span className="font-medium text-gray-800">
                          {BANK_TRANSFER_INFO.accountNumber || "Chưa cấu hình"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Chủ tài khoản</span>

                        <span className="font-medium text-gray-800">
                          {BANK_TRANSFER_INFO.accountName || "Chưa cấu hình"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Số tiền</span>

                        <span className="font-semibold text-pink-600">
                          {formatShippingMoney(grandTotal)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">
                          Nội dung chuyển khoản
                        </span>

                        <span className="font-medium text-gray-800">
                          {BANK_TRANSFER_INFO.transferContentPrefix}
                        </span>
                      </div>
                    </div>

                    <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-blue-200 bg-white p-4">
                      <input
                        type="checkbox"
                        checked={bankTransferConfirmed}
                        onChange={(event) =>
                          setBankTransferConfirmed(event.target.checked)
                        }
                        className="mt-1"
                      />

                      <span className="text-sm leading-6 text-gray-700">
                        Tôi xác nhận đã hoàn tất thanh toán chuyển khoản theo
                        thông tin trên.
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8 lg:sticky lg:top-24">
                <h2 className="text-xl font-semibold text-gray-800">
                  Đơn hàng
                </h2>

                <div className="mt-6 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            Hoa
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-medium text-gray-800">
                          {item.name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {item.quantity} × {formatShippingMoney(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3 border-t border-gray-200 pt-6">
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

                  <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-3">
                    <span className="font-semibold text-gray-800">
                      Tổng cộng
                    </span>

                    <span className="text-xl font-bold text-pink-600">
                      {formatShippingMoney(grandTotal)}
                    </span>
                  </div>
                </div>

                {formData.paymentMethod === BANK_TRANSFER_PAYMENT_METHOD &&
                  !bankTransferConfirmed && (
                    <p className="mt-4 text-sm text-orange-600">
                      Vui lòng hoàn tất thanh toán chuyển khoản và xác nhận đã
                      thanh toán trước khi đặt hàng.
                    </p>
                  )}

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    shippingLoading ||
                    !shippingCalculation.success ||
                    (formData.paymentMethod === BANK_TRANSFER_PAYMENT_METHOD &&
                      !bankTransferConfirmed)
                  }
                  className="mt-6 w-full rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {submitting ? "Đang đặt hàng..." : "Đặt hàng"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {showExpressFallbackModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-xl text-orange-600">
                !
              </div>

              <h3 className="mt-4 text-lg font-bold text-gray-800">
                Giao hỏa tốc không khả dụng
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Hình thức giao hàng Giao hỏa tốc không khả dụng với đơn hàng đặt
                giao từ 18h00 trở về cuối ngày.
              </p>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Hệ thống đã tự động chuyển sang <strong>Giao tiêu chuẩn</strong>
                .
              </p>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                Để shop có thể chuẩn bị sản phẩm tốt nhất, quý khách vui lòng
                chọn mẫu và đặt trước từ 2 tiếng đối với các mẫu hoa cắm theo
                yêu cầu.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowExpressFallbackModal(false)}
              className="mt-6 w-full rounded-lg bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700"
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;
