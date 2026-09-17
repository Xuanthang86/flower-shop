import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

import { formatCouponDiscount, validateCoupon } from "@/services/coupon";

import { getProductById, getProductsSnapshot } from "@/services/catalog";

import { useNavigate } from "react-router-dom";

import { useCart } from "@/context/CartContext";
import { OrderContext } from "@/context/OrderContext";

import AddressForm from "@/components/checkout/AddressForm";
import PaymentMethod from "@/components/checkout/PaymentMethod";

import {
  addDaysToDateKey,
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
  getDeliveryDateNextDayCutoffHour,
} from "@/services/shipping";

import {
  readPaymentSettings,
  buildTransferContent,
  buildVietQrUrl,
} from "@/services/paymentSettings";

import {
  createBankTransferPaymentIntent,
  getBankTransferPaymentStatus,
} from "@/services/payment";

const EMPTY_SHIPPING_RESULT = {
  success: false,

  message: "Vui lòng nhập đầy đủ thông tin giao hàng.",

  shippingFee: 0,

  distanceKm: null,

  freeShippingApplied: false,
};

const CHECKOUT_PAYMENT_METHOD = "cod";

const BANK_TRANSFER_PAYMENT_METHOD = "bank_transfer";

const EMPTY_PAYMENT_INTENT = {
  id: "",
  orderCode: "",
  reference: "",
  amount: 0,
  currency: "VND",
  status: "pending",
  transactionId: "",
  paidAt: null,
  transaction: null,
};

const formatDeliveryDateDisplay = (dateKey) => {
  if (!dateKey) {
    return "";
  }

  const [year, month, day] = String(dateKey).split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${day}/${month}/${year}`;
};

const CheckoutPage = () => {
  const navigate = useNavigate();

  const { cartItems, cartTotal, clearCart } = useCart();

  const { createOrder } = useContext(OrderContext);

  const { user } = useAuth();

  const [paymentSettings, setPaymentSettings] = useState(() =>
    readPaymentSettings()
  );
  const [paymentQrVersion, setPaymentQrVersion] = useState(() => Date.now());

  const [formData, setFormData] = useState({
    sender: {
      name: "",
      phone: "",
      email: "",
      isHiddenFromRecipient: true,
    },

    recipient: {
      fullName: "",
      phone: "",
      email: "",
    },

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

  const getInitialDeliveryDate = () => {
    const now = new Date();

    if (now.getHours() >= getDeliveryDateNextDayCutoffHour()) {
      return (
        addDaysToDateKey(getTodayDateKey(now), 1) || getDefaultDeliveryDate()
      );
    }

    return getTodayDateKey(now) || getDefaultDeliveryDate();
  };

  const [deliveryDate, setDeliveryDate] = useState(getInitialDeliveryDate);

  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("");

  const [shippingCalculation, setShippingCalculation] = useState(
    EMPTY_SHIPPING_RESULT
  );

  const [shippingLoading, setShippingLoading] = useState(false);

  const [error, setError] = useState("");

  const [couponCode, setCouponCode] = useState("");

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [couponLoading, setCouponLoading] = useState(false);

  const [couponMessage, setCouponMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [showExpressFallbackModal, setShowExpressFallbackModal] =
    useState(false);

  const [paymentIntent, setPaymentIntent] = useState(EMPTY_PAYMENT_INTENT);

  const paymentIntentAmountRef = useRef(null);

  const [paymentIntentLoading, setPaymentIntentLoading] = useState(false);

  const [paymentVerified, setPaymentVerified] = useState(false);

  const [paymentError, setPaymentError] = useState("");

  const [currentTime, setCurrentTime] = useState(() => new Date());

  const subtotal = Number(cartTotal) || 0;

  const shippingFee = shippingCalculation.success
    ? Number(shippingCalculation.shippingFee) || 0
    : 0;

  const discountAmount = Math.min(
    subtotal,
    Math.max(0, Number(appliedCoupon?.discountAmount) || 0)
  );

  const grandTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  useEffect(() => {
    const refreshPaymentSettings = () => {
      setPaymentSettings(readPaymentSettings());
      setPaymentQrVersion(Date.now());
    };

    window.addEventListener(
      "flower-shop-payment-settings-updated",
      refreshPaymentSettings
    );

    window.addEventListener(
      "flower-shop-site-settings-updated",
      refreshPaymentSettings
    );

    window.addEventListener("storage", refreshPaymentSettings);

    return () => {
      window.removeEventListener(
        "flower-shop-payment-settings-updated",
        refreshPaymentSettings
      );

      window.removeEventListener(
        "flower-shop-site-settings-updated",
        refreshPaymentSettings
      );

      window.removeEventListener("storage", refreshPaymentSettings);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

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

    setShippingCalculation(EMPTY_SHIPPING_RESULT);

    setDeliveryTimeSlot("");
  };

  const handleSenderChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,

      sender: {
        ...currentData.sender,

        [name]: value,
      },
    }));
  };

  const handleSenderHiddenChange = (event) => {
    setFormData((currentData) => ({
      ...currentData,

      sender: {
        ...currentData.sender,

        isHiddenFromRecipient: event.target.checked,
      },
    }));
  };

  const handleRecipientChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,

      recipient: {
        ...currentData.recipient,

        [name]: value,
      },
    }));
  };

  const handleNoteChange = (event) => {
    setFormData((currentData) => ({
      ...currentData,

      note: event.target.value,
    }));

    setShippingCalculation(EMPTY_SHIPPING_RESULT);
  };

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

  const handlePaymentChange = (event) => {
    const value = event.target.value;

    setFormData((currentData) => ({
      ...currentData,

      paymentMethod: value,
    }));

    setPaymentIntent(EMPTY_PAYMENT_INTENT);

    setPaymentVerified(false);

    setPaymentError("");

    setError("");
  };

  const handleDeliveryDateChange = (event) => {
    const nextDate = event.target.value;

    setDeliveryDate(nextDate);

    setDeliveryTimeSlot("");

    setShippingCalculation(EMPTY_SHIPPING_RESULT);

    setPaymentIntent(EMPTY_PAYMENT_INTENT);

    setPaymentVerified(false);

    setPaymentError("");

    setError("");
  };

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
  PAYMENT INTENT
  ==========================================================
  */

  useEffect(() => {
    let cancelled = false;

    if (formData.paymentMethod !== BANK_TRANSFER_PAYMENT_METHOD) {
      return undefined;
    }

    if (paymentSettings?.bankTransfer?.enabled === false) {
      setPaymentError("Shop hiện chưa bật thanh toán chuyển khoản.");

      return undefined;
    }

    if (!shippingCalculation.success || grandTotal <= 0) {
      return undefined;
    }

    const normalizedAmount = Math.round(Number(grandTotal) || 0);

    /*
     * Nếu Payment Intent hiện tại đã được tạo cho đúng số tiền
     * thì KHÔNG tạo lại.
     *
     * Điều này giúp mã đơn hàng / mã thanh toán giữ nguyên
     * trong suốt thời gian khách đang thanh toán.
     */
    if (
      paymentIntent?.id &&
      paymentIntent?.orderCode &&
      Number(paymentIntent.amount) === normalizedAmount &&
      paymentIntentAmountRef.current === normalizedAmount
    ) {
      return undefined;
    }

    paymentIntentAmountRef.current = normalizedAmount;

    setPaymentIntentLoading(true);
    setPaymentError("");
    setPaymentVerified(false);

    createBankTransferPaymentIntent({
      amount: normalizedAmount,
    })
      .then((result) => {
        if (cancelled) {
          return;
        }

        const intent = result?.paymentIntent;

        if (!intent?.id || !intent?.orderCode) {
          throw new Error("Backend không trả về Payment Intent hợp lệ.");
        }

        setPaymentIntent(intent);
      })
      .catch((intentError) => {
        if (cancelled) {
          return;
        }

        paymentIntentAmountRef.current = null;

        setPaymentIntent(EMPTY_PAYMENT_INTENT);

        setPaymentError(
          intentError?.message ||
            "Không thể tạo yêu cầu thanh toán chuyển khoản."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setPaymentIntentLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    formData.paymentMethod,
    paymentSettings?.bankTransfer?.enabled,
    shippingCalculation.success,
    grandTotal,
    paymentIntent?.id,
    paymentIntent?.orderCode,
    paymentIntent?.amount,
  ]);

  /*
  ==========================================================
  PAYMENT POLLING
  ==========================================================
  */

  useEffect(() => {
    if (formData.paymentMethod !== BANK_TRANSFER_PAYMENT_METHOD) {
      return undefined;
    }

    if (!paymentIntent?.id) {
      return undefined;
    }

    let cancelled = false;

    let timer = null;

    const checkStatus = async () => {
      try {
        const result = await getBankTransferPaymentStatus(paymentIntent.id);

        if (cancelled) {
          return;
        }

        const status = result?.paymentIntent?.status || "pending";

        if (status === "paid") {
          setPaymentVerified(true);

          setPaymentError("");

          if (timer) {
            clearInterval(timer);
          }

          return;
        }

        setPaymentVerified(false);

        if (status === "expired" || status === "cancelled") {
          setPaymentError(
            "Yêu cầu thanh toán đã hết hạn. Vui lòng tạo lại thanh toán."
          );

          if (timer) {
            clearInterval(timer);
          }
        }
      } catch (statusError) {
        if (cancelled) {
          return;
        }

        setPaymentVerified(false);

        setPaymentError(
          statusError?.message || "Chưa thể kiểm tra trạng thái thanh toán."
        );
      }
    };

    checkStatus();

    timer = setInterval(checkStatus, 3000);

    return () => {
      cancelled = true;

      if (timer) {
        clearInterval(timer);
      }
    };
  }, [formData.paymentMethod, paymentIntent?.id]);

  const transferContent = buildTransferContent(
    paymentIntent?.orderCode,
    paymentSettings?.bankTransfer
  );

  const dynamicQrUrl = buildVietQrUrl({
    bankCode: paymentSettings?.bankTransfer?.bankCode,

    accountNumber: paymentSettings?.bankTransfer?.accountNumber,

    amount: grandTotal,

    accountName: paymentSettings?.bankTransfer?.accountName,

    transferContent,
  });

  const addQrCacheBust = (url, version) => {
    const normalizedUrl = String(url || "").trim();

    if (!normalizedUrl) {
      return "";
    }

    const separator = normalizedUrl.includes("?") ? "&" : "?";

    return `${normalizedUrl}${separator}v=${version}`;
  };

  const qrCodeUrl = dynamicQrUrl
    ? addQrCacheBust(dynamicQrUrl, paymentQrVersion)
    : "";

  const handleApplyCoupon = () => {
    const code = couponCode.trim();

    if (!code) {
      setCouponMessage("Vui lòng nhập mã giảm giá.");

      setAppliedCoupon(null);

      return;
    }

    setCouponLoading(true);

    try {
      const products = getProductsSnapshot();

      const result = validateCoupon({
        code,

        items: cartItems,

        subtotal,

        userId: user?.id,

        productLookup: (productId) => getProductById(productId, products),
      });

      if (!result.success) {
        setAppliedCoupon(null);

        setCouponMessage(result.message || "Mã giảm giá không hợp lệ.");

        return;
      }

      setAppliedCoupon(result);

      setCouponMessage(
        result.message || `Đã áp dụng mã ${result.coupon.code}.`
      );

      setError("");
    } catch (couponError) {
      setAppliedCoupon(null);

      setCouponMessage(
        couponError?.message || "Không thể kiểm tra mã giảm giá."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");

    setAppliedCoupon(null);

    setCouponMessage("");
  };

  useEffect(() => {
    if (!appliedCoupon?.coupon?.code) {
      return;
    }

    const products = getProductsSnapshot();

    const result = validateCoupon({
      code: appliedCoupon.coupon.code,

      items: cartItems,

      subtotal,

      userId: user?.id,

      productLookup: (productId) => getProductById(productId, products),
    });

    if (!result.success) {
      setAppliedCoupon(null);

      setCouponMessage(
        result.message || "Mã giảm giá không còn áp dụng cho đơn hàng hiện tại."
      );

      return;
    }

    setAppliedCoupon(result);

    setCouponMessage(result.message || `Đã áp dụng mã ${result.coupon.code}.`);
  }, [cartItems, subtotal, user?.id]);

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

    if (!formData.sender.name.trim()) {
      setError("Vui lòng nhập họ và tên người gửi.");

      return;
    }

    if (!formData.sender.phone.trim()) {
      setError("Vui lòng nhập số điện thoại người gửi.");

      return;
    }

    if (!formData.sender.email.trim()) {
      setError("Vui lòng nhập email người gửi.");

      return;
    }

    if (!formData.recipient.fullName.trim()) {
      setError("Vui lòng nhập họ và tên người nhận.");

      return;
    }

    if (!formData.recipient.phone.trim()) {
      setError("Vui lòng nhập số điện thoại người nhận.");

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
      !paymentVerified
    ) {
      setError(
        "Hệ thống đang xác nhận giao dịch chuyển khoản, xin vui lòng đợi…"
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

      let finalCouponResult = null;

      if (couponCode.trim()) {
        const products = getProductsSnapshot();

        finalCouponResult = validateCoupon({
          code: couponCode,

          items: cartItems,

          subtotal,

          userId: user?.id,

          productLookup: (productId) => getProductById(productId, products),
        });

        if (!finalCouponResult.success) {
          setAppliedCoupon(null);

          setCouponMessage(
            finalCouponResult.message || "Mã giảm giá không còn hợp lệ."
          );

          setError(
            finalCouponResult.message || "Mã giảm giá không còn hợp lệ."
          );

          return;
        }

        setAppliedCoupon(finalCouponResult);
      }

      const finalDiscountAmount = Math.min(
        subtotal,
        Math.max(
          0,
          Number(
            finalCouponResult?.discountAmount ??
              appliedCoupon?.discountAmount ??
              0
          )
        )
      );

      const finalGrandTotal = Math.max(
        0,
        subtotal + finalShippingFee - finalDiscountAmount
      );

      if (formData.paymentMethod === BANK_TRANSFER_PAYMENT_METHOD) {
        if (!paymentIntent?.id || !paymentIntent?.orderCode) {
          setError(
            "Chưa có mã thanh toán hợp lệ. Vui lòng chờ hệ thống tạo yêu cầu thanh toán."
          );

          return;
        }

        const latestPayment = await getBankTransferPaymentStatus(
          paymentIntent.id
        );

        if (latestPayment?.paymentIntent?.status !== "paid") {
          setPaymentVerified(false);

          setError(
            "Hệ thống đang xác nhận giao dịch chuyển khoản, xin vui lòng đợi…"
          );

          return;
        }
      }

      const paymentIsBankTransfer =
        formData.paymentMethod === BANK_TRANSFER_PAYMENT_METHOD;

      const result = await createOrder({
        orderId: paymentIsBankTransfer ? paymentIntent.orderCode : undefined,

        customer: {
          name: formData.recipient.fullName.trim(),

          fullName: formData.recipient.fullName.trim(),

          phone: formData.recipient.phone.trim(),

          email: formData.recipient.email.trim(),

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

        sender: {
          name: formData.sender.name.trim(),

          phone: formData.sender.phone.trim(),

          email: formData.sender.email.trim(),

          isHiddenFromRecipient:
            formData.sender.isHiddenFromRecipient !== false,
        },

        recipient: {
          name: formData.recipient.fullName.trim(),

          fullName: formData.recipient.fullName.trim(),

          phone: formData.recipient.phone.trim(),

          email: formData.recipient.email.trim(),
        },

        paymentMethod: formData.paymentMethod,

        paymentStatus: paymentIsBankTransfer ? "paid" : "pending",

        paymentConfirmed: paymentIsBankTransfer,

        paymentOrderCode: paymentIsBankTransfer ? paymentIntent.orderCode : "",

        paymentTransferContent: paymentIsBankTransfer ? transferContent : "",

        paymentTransaction: paymentIsBankTransfer
          ? paymentIntent.transaction || null
          : null,

        payment: {
          id: paymentIsBankTransfer ? paymentIntent?.id || "" : "",

          reference: paymentIsBankTransfer
            ? paymentIntent?.orderCode || ""
            : "",

          method: formData.paymentMethod,

          provider: paymentIsBankTransfer ? "bank_transfer" : "cod",

          status: paymentIsBankTransfer ? "paid" : "pending",

          amount: finalGrandTotal,

          currency: "VND",

          transactionId: paymentIsBankTransfer
            ? paymentIntent?.transactionId || ""
            : "",

          transaction: paymentIsBankTransfer
            ? paymentIntent?.transaction || null
            : null,

          transferContent: paymentIsBankTransfer ? transferContent : "",

          paidAt: paymentIsBankTransfer
            ? paymentIntent?.paidAt || new Date().toISOString()
            : null,

          failedAt: null,

          refundedAt: null,

          failureReason: "",

          refundAmount: 0,
        },

        items: cartItems.map((item) => ({
          id: item.id,

          name: item.name,

          price: Number(item.price) || 0,

          quantity: Number(item.quantity) || 0,

          image: item.image || "",
        })),

        subtotal,

        shippingFee: finalShippingFee,

        discountAmount: finalDiscountAmount,

        couponCode:
          finalCouponResult?.coupon?.code || appliedCoupon?.coupon?.code || "",

        couponSnapshot:
          finalCouponResult?.couponSnapshot ||
          appliedCoupon?.couponSnapshot ||
          null,

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
              Vui lòng nhập thông tin giao hàng để hoàn tất đơn hàng.
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
                  Thông tin người gửi
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Thông tin này có thể dùng để shop liên hệ khi giao hàng. Nếu
                  bật ẩn thông tin, người nhận sẽ không được hiển thị thông tin
                  người gửi.
                </p>

                <div className="mt-6 rounded-xl border border-pink-100 bg-pink-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏷️</span>

                    <h3 className="font-semibold text-gray-800">Mã giảm giá</h3>
                  </div>

                  {!appliedCoupon ? (
                    <>
                      <div className="mt-3 flex gap-2">
                        <input
                          value={couponCode}
                          onChange={(event) =>
                            setCouponCode(event.target.value.toUpperCase())
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          placeholder="Nhập mã giảm giá"
                          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                        />

                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading}
                          className="rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {couponLoading ? "..." : "Áp dụng"}
                        </button>
                      </div>

                      {couponMessage && (
                        <p className="mt-2 text-sm text-gray-600">
                          {couponMessage}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-green-700">
                            {appliedCoupon.coupon.code}
                          </p>

                          <p className="mt-1 text-sm text-green-700">
                            {appliedCoupon.coupon.name}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-green-700">
                            Giảm{" "}
                            {formatCouponDiscount(appliedCoupon.discountAmount)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="rounded-lg border border-green-200 bg-white px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="senderName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Họ và tên người gửi *
                    </label>

                    <input
                      id="senderName"
                      name="name"
                      type="text"
                      value={formData.sender.name}
                      onChange={handleSenderChange}
                      placeholder="Nhập họ và tên người gửi"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="senderPhone"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Số điện thoại người gửi *
                    </label>

                    <input
                      id="senderPhone"
                      name="phone"
                      type="tel"
                      value={formData.sender.phone}
                      onChange={handleSenderChange}
                      placeholder="Nhập số điện thoại"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="senderEmail"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Email người gửi *
                    </label>

                    <input
                      id="senderEmail"
                      name="email"
                      type="email"
                      value={formData.sender.email}
                      onChange={handleSenderChange}
                      placeholder="example@gmail.com"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <label
                  htmlFor="hideSenderInfo"
                  className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-pink-100 bg-pink-50 p-4"
                >
                  <input
                    id="hideSenderInfo"
                    type="checkbox"
                    checked={formData.sender.isHiddenFromRecipient}
                    onChange={handleSenderHiddenChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />

                  <span className="text-sm leading-6 text-gray-700">
                    <strong>Ẩn thông tin người gửi với người nhận</strong>
                    <br />
                    Shop vẫn lưu thông tin để phục vụ giao hàng và liên hệ khi
                    cần, nhưng không hiển thị thông tin người gửi cho người
                    nhận.
                  </span>
                </label>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
                <h2 className="text-xl font-semibold text-gray-800">
                  Thông tin người nhận
                </h2>

                <div className="mt-6 space-y-5">
                  <div>
                    <label
                      htmlFor="recipientFullName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Họ và tên người nhận *
                    </label>

                    <input
                      id="recipientFullName"
                      name="fullName"
                      type="text"
                      value={formData.recipient.fullName}
                      onChange={handleRecipientChange}
                      placeholder="Nhập họ và tên người nhận"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="recipientPhone"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Số điện thoại người nhận *
                    </label>

                    <input
                      id="recipientPhone"
                      name="phone"
                      type="tel"
                      value={formData.recipient.phone}
                      onChange={handleRecipientChange}
                      placeholder="Nhập số điện thoại người nhận"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="recipientEmail"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Email người nhận
                    </label>

                    <input
                      id="recipientEmail"
                      name="email"
                      type="email"
                      value={formData.recipient.email}
                      onChange={handleRecipientChange}
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
                                "Giao trong ngày, ưu tiên nhanh nhất."}
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
                        <span className="text-gray-600">Ngày giao hàng</span>

                        <span className="font-semibold text-gray-800">
                          {formatDeliveryDateDisplay(
                            shippingCalculation.deliveryDate
                          )}
                        </span>
                      </div>
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
                            Miễn phí phí giao hàng đơn hàng từ 500.000đ.
                          </div>
                        )}
                    </div>
                  ) : shippingLoading ? (
                    <div className="h-5" />
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
                    rows={4}
                    value={formData.note}
                    onChange={handleNoteChange}
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

                    {paymentIntentLoading ? (
                      <div className="mt-4 rounded-lg bg-white p-4 text-sm text-gray-600">
                        Đang tạo thông tin thanh toán...
                      </div>
                    ) : (
                      <>
                        <div className="mt-4 grid gap-5 md:grid-cols-[1fr_220px]">
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">Ngân hàng</span>

                              <span className="text-right font-medium text-gray-800">
                                {paymentSettings?.bankTransfer?.bankName}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">
                                Số tài khoản
                              </span>

                              <span className="text-right font-medium text-gray-800">
                                {paymentSettings?.bankTransfer?.accountNumber}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">
                                Chủ tài khoản
                              </span>

                              <span className="text-right font-medium text-gray-800">
                                {paymentSettings?.bankTransfer?.accountName}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">Số tiền</span>

                              <span className="text-right font-semibold text-pink-600">
                                {formatShippingMoney(grandTotal)}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">Mã đơn hàng</span>

                              <span className="text-right font-semibold text-gray-800">
                                {paymentIntent.orderCode}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">
                                Nội dung chuyển khoản
                              </span>

                              <span className="text-right font-semibold text-gray-800">
                                {transferContent}
                              </span>
                            </div>

                            <div className="rounded-lg border border-blue-200 bg-white p-3 text-sm leading-6 text-gray-700">
                              {paymentSettings?.bankTransfer?.instructions}
                            </div>
                          </div>

                          {qrCodeUrl ? (
                            <div className="flex flex-col items-center justify-start rounded-xl bg-white p-3">
                              <img
                                src={qrCodeUrl}
                                alt="Mã QR thanh toán"
                                className="h-48 w-48 object-contain"
                              />

                              <p className="mt-2 text-center text-xs text-gray-500">
                                Quét mã QR để thanh toán
                              </p>
                            </div>
                          ) : (
                            <div className="flex min-h-48 items-center justify-center rounded-xl bg-white p-4 text-center text-xs text-gray-500">
                              Admin chưa cấu hình QR hoặc mã ngân hàng.
                            </div>
                          )}
                        </div>

                        <div
                          className={`mt-5 rounded-xl border p-4 ${
                            paymentVerified
                              ? "border-green-200 bg-green-50"
                              : "border-orange-200 bg-orange-50"
                          }`}
                        >
                          {paymentVerified ? (
                            <>
                              <p className="font-semibold text-green-700">
                                Thanh toán đã được hệ thống xác nhận.
                              </p>

                              <p className="mt-1 text-sm text-green-700">
                                Bạn có thể bấm Đặt hàng.
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-semibold text-orange-700">
                                Đang chờ xác nhận thanh toán.
                              </p>
                            </>
                          )}
                        </div>

                        {paymentError && (
                          <p className="mt-3 text-sm text-red-600">
                            {paymentError}
                          </p>
                        )}
                      </>
                    )}
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

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-600">Giảm giá</span>

                      <span className="font-semibold text-green-600">
                        -{formatShippingMoney(discountAmount)}
                      </span>
                    </div>
                  )}

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
                  !paymentVerified && (
                    <p className="mt-4 text-sm text-orange-600">
                      Hệ thống đang xác nhận giao dịch chuyển khoản, xin vui
                      lòng đợi…
                    </p>
                  )}

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    shippingLoading ||
                    !shippingCalculation.success ||
                    (formData.paymentMethod === BANK_TRANSFER_PAYMENT_METHOD &&
                      !paymentVerified)
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
