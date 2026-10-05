const crypto = require("crypto");
const mongoose = require("mongoose");

const Payment = require("../models/Payment");
const PaymentTransaction = require("../models/PaymentTransaction");
const PaymentIntent = require("../models/PaymentIntent");
const Order = require("../models/Order");
const { calculateOrder, create: createOrder } = require("./orderService");

const { sendNewOrderNotification } = require("./emailService");

const isStaff = (user) =>
  ["admin", "manager"].includes(String(user?.role || ""));

const ensureObjectId = (value, message = "ID không hợp lệ.") => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw Object.assign(new Error(message), {
      status: 400,
    });
  }
};

const ensureOrderOwnership = (order, user) => {
  if (!order) {
    throw Object.assign(new Error("Không tìm thấy đơn hàng."), {
      status: 404,
    });
  }

  if (
    !isStaff(user) &&
    String(order.customerId || "") !== String(user?._id || "")
  ) {
    throw Object.assign(
      new Error("Bạn không có quyền truy cập đơn hàng này."),
      {
        status: 403,
      },
    );
  }
};

const generatePaymentOrderCode = async () => {
  const vietnamDateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const vietnamDate = Object.fromEntries(
    vietnamDateParts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const prefix = `HTH${String(vietnamDate.year).slice(-2)}${String(
    vietnamDate.month,
  ).padStart(2, "0")}${String(vietnamDate.day).padStart(2, "0")}`;

  for (let i = 0; i < 100; i += 1) {
    const code = `${prefix}-${String(crypto.randomInt(0, 10000)).padStart(
      4,
      "0",
    )}`;

    const [orderExists, intentExists] = await Promise.all([
      Order.exists({
        orderCode: code,
      }),

      PaymentIntent.exists({
        orderCode: code,
      }),
    ]);

    if (!orderExists && !intentExists) {
      return code;
    }
  }

  throw new Error("Không thể tạo mã thanh toán duy nhất.");
};

const normalizePaymentDraft = (draft = {}) => ({
  paymentMethod: "bank_transfer",

  items: Array.isArray(draft.items) ? draft.items : [],

  couponCode: String(draft.couponCode || "")
    .trim()
    .toUpperCase(),

  shippingFee: Math.max(0, Math.round(Number(draft.shippingFee) || 0)),

  sender: draft.sender && typeof draft.sender === "object" ? draft.sender : {},

  recipient:
    draft.recipient && typeof draft.recipient === "object"
      ? draft.recipient
      : {},

  shippingAddress:
    draft.shippingAddress && typeof draft.shippingAddress === "object"
      ? draft.shippingAddress
      : draft.address && typeof draft.address === "object"
        ? draft.address
        : {},

  address:
    draft.address && typeof draft.address === "object"
      ? draft.address
      : draft.shippingAddress && typeof draft.shippingAddress === "object"
        ? draft.shippingAddress
        : {},

  deliveryDate: draft.deliveryDate || null,

  deliveryTimeSlot: String(draft.deliveryTimeSlot || "").trim(),

  deliveryMode: String(draft.deliveryMode || "").trim(),

  deliveryModeLabel: String(draft.deliveryModeLabel || "").trim(),

  deliveryTimeSlotLabel: String(draft.deliveryTimeSlotLabel || "").trim(),

  estimatedDeliveryTime: String(draft.estimatedDeliveryTime || "").trim(),

  deliveryDistanceKm: Number.isFinite(Number(draft.deliveryDistanceKm))
    ? Number(draft.deliveryDistanceKm)
    : null,

  deliveryNote: String(draft.deliveryNote || "").trim(),

  shippingSnapshot:
    draft.shippingSnapshot && typeof draft.shippingSnapshot === "object"
      ? draft.shippingSnapshot
      : null,

  notes: String(draft.notes || "").trim(),

  channel: String(draft.channel || "website")
    .trim()
    .toLowerCase(),
});

const createIntent = async ({
  depositPercent,
  draft = {},
  checkoutSignature = "",
  user,
}) => {
  if (!user?._id) {
    throw Object.assign(new Error("Bạn cần đăng nhập để tạo thanh toán."), {
      status: 401,
    });
  }

  const normalizedDraft = normalizePaymentDraft(draft);

  if (normalizedDraft.paymentMethod !== "bank_transfer") {
    throw Object.assign(
      new Error("Payment Intent chỉ được tạo cho thanh toán chuyển khoản."),
      {
        status: 400,
      },
    );
  }

  const normalizedDepositPercent = Number(depositPercent) === 50 ? 50 : 100;

  /*
   * BACKEND là nguồn sự thật.
   *
   * Không tin grandTotal / amount từ Frontend.
   */
  const calculation = await calculateOrder({
    items: normalizedDraft.items,

    couponCode: normalizedDraft.couponCode,

    shippingFee: normalizedDraft.shippingFee,
  });

  const grandTotal = Math.max(
    0,
    Math.round(Number(calculation.grandTotal) || 0),
  );

  if (grandTotal <= 0) {
    throw Object.assign(new Error("Tổng tiền thanh toán không hợp lệ."), {
      status: 400,
    });
  }

  const paymentAmount = Math.round(
    (grandTotal * normalizedDepositPercent) / 100,
  );

  const paymentRemainingAmount = Math.max(0, grandTotal - paymentAmount);

  if (paymentAmount <= 0) {
    throw Object.assign(new Error("Số tiền thanh toán không hợp lệ."), {
      status: 400,
    });
  }

  /*
   * Nếu cùng Checkout + cùng deposit + cùng signature
   * và PaymentIntent vẫn còn hạn:
   *
   * → GIỮ NGUYÊN QR / mã đơn.
   */
  if (checkoutSignature) {
    const existingIntent = await PaymentIntent.findOne({
      customerId: user._id,

      checkoutSignature,

      depositPercent: normalizedDepositPercent,

      status: "pending",

      expiresAt: {
        $gt: new Date(),
      },
    });

    if (existingIntent) {
      return existingIntent.toObject();
    }
  }

  const orderCode = await generatePaymentOrderCode();

  /*
   * Snapshot dùng để tạo Order sau khi payment confirmed.
   *
   * Dùng kết quả calculateOrder của backend,
   * không dùng giá frontend gửi.
   */
  const checkoutSnapshot = {
    ...normalizedDraft,

    items: calculation.items.map((item) => ({
      productId: String(item.productId),

      productName: item.productName,

      productImage: item.productImage,

      unitPrice: item.unitPrice,

      quantity: item.quantity,

      subtotal: item.subtotal,
    })),

    subtotal: calculation.subtotal,

    discount: calculation.discount,

    shippingFee: calculation.shippingFee,

    grandTotal,

    couponCode: calculation.coupon?.code || normalizedDraft.couponCode || "",

    paymentDepositPercent: normalizedDepositPercent,

    paymentDepositAmount: paymentAmount,

    paymentRemainingAmount,

    channel: "website",
  };

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const intent = await PaymentIntent.create({
    intentId: crypto.randomUUID(),

    orderId: null,

    customerId: user._id,

    orderCode,

    reference: orderCode,

    amount: paymentAmount,

    currency: "VND",

    paymentMethod: "bank_transfer",

    depositPercent: normalizedDepositPercent,

    checkoutSignature: String(checkoutSignature || "").trim(),

    checkoutSnapshot,

    status: "pending",

    expiresAt,
  });

  return intent.toObject();
};

const serializeIntent = (intent) => ({
  id: intent.intentId,

  orderId: intent.orderId || null,

  orderCode: intent.orderCode,

  reference: intent.reference || intent.orderCode,

  amount: intent.amount,

  currency: intent.currency,

  status: intent.status,

  depositPercent: Number(intent.depositPercent) === 50 ? 50 : 100,

  expiresAt: intent.expiresAt,

  paidAt: intent.paidAt || null,

  paymentAttemptedAt: intent.paymentAttemptedAt || null,

  transactionId: intent.transactionId || "",

  transaction: intent.status === "paid" ? intent.transaction : null,
});

const getIntent = async (intentId, user) => {
  const intent = await PaymentIntent.findOne({
    intentId: String(intentId || "").trim(),
  });

  if (!intent) {
    throw Object.assign(new Error("Không tìm thấy Payment Intent."), {
      status: 404,
    });
  }

  if (
    !isStaff(user) &&
    String(intent.customerId || "") !== String(user?._id || "")
  ) {
    throw Object.assign(
      new Error("Bạn không có quyền truy cập Payment Intent này."),
      {
        status: 403,
      },
    );
  }

  if (
    intent.status === "pending" &&
    intent.expiresAt &&
    new Date(intent.expiresAt).getTime() < Date.now()
  ) {
    intent.status = "expired";

    await intent.save();
  }

  return serializeIntent(intent);
};

const markStarted = async (intentId, user) => {
  const intent = await PaymentIntent.findOne({
    intentId: String(intentId || "").trim(),
  });

  if (!intent) {
    throw Object.assign(new Error("Không tìm thấy Payment Intent."), {
      status: 404,
    });
  }

  if (
    !isStaff(user) &&
    String(intent.customerId || "") !== String(user?._id || "")
  ) {
    throw Object.assign(
      new Error("Bạn không có quyền truy cập Payment Intent này."),
      {
        status: 403,
      },
    );
  }

  if (
    intent.status === "pending" &&
    intent.expiresAt &&
    new Date(intent.expiresAt).getTime() < Date.now()
  ) {
    intent.status = "expired";

    await intent.save();

    return serializeIntent(intent);
  }

  if (intent.status !== "pending") {
    return serializeIntent(intent);
  }

  intent.paymentAttemptedAt = new Date();

  await intent.save();

  return serializeIntent(intent);
};

const applySePayWebhook = async (payload) => {
  const providerTransactionId = String(
    payload?.id ??
      payload?.transactionId ??
      payload?.referenceCode ??
      crypto.randomUUID(),
  ).trim();

  const existing = await PaymentTransaction.findOne({
    providerTransactionId,
  });

  if (existing) {
    return {
      duplicate: true,
      transactionId: existing._id,
    };
  }

  const content = String(payload?.content || payload?.description || "").trim();

  const amount = Math.max(
    0,
    Math.round(Number(payload?.transferAmount ?? payload?.amount ?? 0) || 0),
  );

  const transferType = String(payload?.transferType || "").toLowerCase();

  const match = content.match(/HTH\d{6}-\d{4}/i);

  const orderCode = match?.[0] || String(payload?.code || "").trim();

  const intent = orderCode
    ? await PaymentIntent.findOne({
        orderCode: new RegExp(
          `^${orderCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i",
        ),
      })
    : null;

  const transaction = await PaymentTransaction.create({
    provider: "sepay",
    providerTransactionId,
    paymentIntentId: intent?.intentId || "",
    orderId: intent?.orderId || null,
    orderCode: intent?.orderCode || orderCode,
    amount,
    content,
    referenceCode: String(payload?.referenceCode || ""),
    transactionDate: payload?.transactionDate
      ? new Date(payload.transactionDate)
      : null,
    rawPayload: payload,
    matched: false,
  });

  if (transferType !== "in" || !intent || intent.status !== "pending") {
    return {
      duplicate: false,
      matched: false,
      transactionId: transaction._id,
    };
  }

  if (intent.expiresAt && new Date(intent.expiresAt).getTime() < Date.now()) {
    intent.status = "expired";
    await intent.save();

    return {
      duplicate: false,
      matched: false,
      transactionId: transaction._id,
    };
  }

  if (amount < Number(intent.amount || 0)) {
    return {
      duplicate: false,
      matched: false,
      transactionId: transaction._id,
    };
  }

  const normalizedContent = content.toUpperCase().replace(/[^A-Z0-9]/g, "");

  const normalizedOrderCode = String(intent.orderCode || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (
    !normalizedOrderCode ||
    !normalizedContent.includes(normalizedOrderCode)
  ) {
    return {
      duplicate: false,
      matched: false,
      transactionId: transaction._id,
    };
  }

  return {
    duplicate: false,
    matched: true,
    transactionId: transaction._id,
  };
};

const finalizePaidBankTransferOrder = async (intentId, user) => {
  const intent = await PaymentIntent.findOne({
    intentId: String(intentId || "").trim(),
  });

  if (!intent) {
    throw Object.assign(new Error("Không tìm thấy Payment Intent."), {
      status: 404,
    });
  }

  if (
    !isStaff(user) &&
    String(intent.customerId || "") !== String(user?._id || "")
  ) {
    throw Object.assign(
      new Error("Bạn không có quyền hoàn tất đơn thanh toán này."),
      {
        status: 403,
      },
    );
  }

  if (intent.status !== "paid") {
    throw Object.assign(new Error("Thanh toán chưa được hệ thống xác nhận."), {
      status: 400,
    });
  }

  /*
   * Idempotency:
   * Nếu Order đã được tạo trước đó,
   * không tạo lần thứ hai.
   */
  if (intent.orderId) {
    const existingOrder = await Order.findById(intent.orderId).lean();

    if (existingOrder) {
      return existingOrder;
    }

    intent.orderId = null;

    await intent.save();
  }

  const draft =
    intent.checkoutSnapshot && typeof intent.checkoutSnapshot === "object"
      ? intent.checkoutSnapshot
      : null;

  if (!draft) {
    throw Object.assign(
      new Error("Không tìm thấy dữ liệu Checkout để tạo đơn hàng."),
      {
        status: 400,
      },
    );
  }

  const orderPayload = {
    ...draft,

    paymentMethod: "bank_transfer",

    paymentDepositPercent: Number(intent.depositPercent) === 50 ? 50 : 100,

    orderCode: intent.orderCode,

    channel: "website",
  };

  let result;

  try {
    result = await createOrder({
      payload: orderPayload,

      user,

      suppressNewOrderEmail: true,
    });
  } catch (error) {
    /*
     * Nếu webhook/Browser retry sau khi Order đã tạo
     * nhưng bước cuối chưa kịp cập nhật PaymentIntent,
     * tìm lại bằng orderCode.
     */
    if (
      error?.status === 409 ||
      String(error?.message || "").includes("Mã đơn hàng đã tồn tại")
    ) {
      const existingOrder = await Order.findOne({
        orderCode: intent.orderCode,

        customerId: intent.customerId,
      });

      if (!existingOrder) {
        throw error;
      }

      result = {
        order: existingOrder.toObject(),
      };
    } else {
      throw error;
    }
  }

  const orderId = result?.order?._id || result?.order?.id;

  if (!orderId) {
    throw new Error("Không thể xác định Order ID sau khi tạo đơn hàng.");
  }

  const depositPercent = Number(intent.depositPercent) === 50 ? 50 : 100;

  const paymentStatus = depositPercent === 50 ? "partially_paid" : "paid";

  const payment = await Payment.findOne({
    orderId,
  });

  if (payment) {
    payment.paymentIntentId = intent.intentId;

    payment.status = "paid";

    payment.transactionId = intent.transactionId || "";

    payment.paidAt = intent.paidAt || new Date();

    payment.amount = Number(intent.amount) || 0;

    payment.rawResponse = intent.transaction || null;

    await payment.save();
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        paymentStatus,

        paymentIntentId: intent.intentId,

        ...(payment
          ? {
              paymentId: payment._id,
            }
          : {}),
      },
    },
    {
      new: true,

      runValidators: true,
    },
  ).lean();

  intent.orderId = updatedOrder._id;

  await intent.save();

  /*
   * Chỉ gửi email SAU KHI:
   *
   * - PaymentIntent paid
   * - Order đã tồn tại
   * - Payment đã paid
   */
  void sendNewOrderNotification(updatedOrder);

  return updatedOrder;
};

module.exports = {
  PaymentIntent,

  createIntent,

  getIntent,

  markStarted,

  applySePayWebhook,

  finalizePaidBankTransferOrder,

  serializeIntent,
};
