const crypto = require("crypto");
const mongoose = require("mongoose");

const Payment = require("../models/Payment");
const PaymentTransaction = require("../models/PaymentTransaction");
const PaymentIntent = require("../models/PaymentIntent");
const Order = require("../models/Order");

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

const createIntent = async ({ orderId, depositPercent, user }) => {
  ensureObjectId(orderId, "Order ID không hợp lệ.");

  const order = await Order.findById(orderId);

  ensureOrderOwnership(order, user);

  if (order.status === "cancelled") {
    throw Object.assign(
      new Error("Không thể tạo thanh toán cho đơn hàng đã hủy."),
      {
        status: 400,
      },
    );
  }

  if (
    !["pending", "confirmed", "processing", "shipping"].includes(
      String(order.status),
    )
  ) {
    throw Object.assign(
      new Error("Đơn hàng hiện không ở trạng thái cho phép thanh toán."),
      {
        status: 400,
      },
    );
  }

  if (String(order.paymentMethod || "") !== "bank_transfer") {
    throw Object.assign(
      new Error("Payment Intent chỉ được tạo cho đơn hàng chuyển khoản."),
      {
        status: 400,
      },
    );
  }

  const normalizedDepositPercent =
    Number(order.paymentDepositPercent) === 50 ? 50 : 100;

  /*
   * Không tin depositPercent từ Frontend.
   * Order trong MongoDB mới là nguồn sự thật.
   */
  if (
    depositPercent !== undefined &&
    Number(depositPercent) !== normalizedDepositPercent
  ) {
    throw Object.assign(
      new Error("Tỷ lệ thanh toán không khớp với cấu hình của đơn hàng."),
      {
        status: 400,
      },
    );
  }

  const grandTotal = Math.max(0, Math.round(Number(order.grandTotal) || 0));

  if (grandTotal <= 0) {
    throw Object.assign(new Error("Tổng tiền đơn hàng không hợp lệ."), {
      status: 400,
    });
  }

  const calculatedDepositAmount = Math.round(
    (grandTotal * normalizedDepositPercent) / 100,
  );

  const paymentAmount = Math.max(0, calculatedDepositAmount);

  if (paymentAmount <= 0) {
    throw Object.assign(new Error("Số tiền thanh toán không hợp lệ."), {
      status: 400,
    });
  }

  const paymentRemainingAmount = Math.max(0, grandTotal - paymentAmount);

  if (
    Number(order.paymentDepositAmount) !== paymentAmount ||
    Number(order.paymentRemainingAmount) !== paymentRemainingAmount
  ) {
    order.paymentDepositAmount = paymentAmount;
    order.paymentRemainingAmount = paymentRemainingAmount;

    await order.save();
  }

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  let intent = await PaymentIntent.findOne({
    orderId: order._id,
  });

  if (
    intent &&
    intent.status === "pending" &&
    intent.expiresAt &&
    new Date(intent.expiresAt).getTime() > Date.now()
  ) {
    return intent.toObject();
  }

  const intentId = crypto.randomUUID();

  if (intent) {
    intent.intentId = intentId;
    intent.customerId = order.customerId;
    intent.orderCode = order.orderCode;
    intent.reference = order.orderCode;
    intent.amount = paymentAmount;
    intent.currency = "VND";
    intent.paymentMethod = "bank_transfer";
    intent.depositPercent = normalizedDepositPercent;
    intent.status = "pending";
    intent.expiresAt = expiresAt;
    intent.paidAt = null;
    intent.paymentAttemptedAt = null;
    intent.transactionId = "";
    intent.transaction = null;

    await intent.save();
  } else {
    intent = await PaymentIntent.create({
      intentId,
      orderId: order._id,
      customerId: order.customerId,
      orderCode: order.orderCode,
      reference: order.orderCode,
      amount: paymentAmount,
      currency: "VND",
      paymentMethod: "bank_transfer",
      depositPercent: normalizedDepositPercent,
      status: "pending",
      expiresAt,
    });
  }

  order.paymentIntentId = intent.intentId;

  await order.save();

  await Payment.updateOne(
    {
      orderId: order._id,
    },
    {
      $set: {
        paymentIntentId: intent.intentId,
        amount: paymentAmount,
        currency: "VND",
        status: "pending",
      },
    },
  );

  return intent.toObject();
};

const serializeIntent = (intent) => ({
  id: intent.intentId,
  orderId: intent.orderId,
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

  const order = await Order.findById(intent.orderId).lean();

  ensureOrderOwnership(order, user);

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

  const order = await Order.findById(intent.orderId).lean();

  ensureOrderOwnership(order, user);

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

  const order = await Order.findById(intent.orderId);

  if (!order) {
    return {
      duplicate: false,
      matched: false,
      transactionId: transaction._id,
    };
  }

  const paidAt = new Date();

  intent.status = "paid";
  intent.paidAt = paidAt;
  intent.transactionId = providerTransactionId;

  intent.transaction = {
    provider: "sepay",
    providerTransactionId,
    amount,
    content,
    referenceCode: String(payload?.referenceCode || ""),
    transactionDate: payload?.transactionDate || null,
  };

  await intent.save();

  transaction.matched = true;
  transaction.paymentIntentId = intent.intentId;
  transaction.orderId = order._id;
  transaction.orderCode = order.orderCode;

  await transaction.save();

  const depositPercent = Number(intent.depositPercent) === 50 ? 50 : 100;

  order.paymentStatus = depositPercent === 50 ? "partially_paid" : "paid";

  order.paymentIntentId = intent.intentId;

  const payment = await Payment.findOne({
    orderId: order._id,
  });

  if (payment) {
    payment.paymentIntentId = intent.intentId;

    payment.status = "paid";

    payment.transactionId = providerTransactionId;

    payment.paidAt = paidAt;

    payment.rawResponse = payload;

    payment.amount = Number(intent.amount);

    await payment.save();

    order.paymentId = payment._id;
  } else {
    const createdPayment = await Payment.create({
      orderId: order._id,
      provider: "sepay",
      method: order.paymentMethod || "bank_transfer",
      amount: Number(intent.amount),
      currency: "VND",
      status: "paid",
      paymentIntentId: intent.intentId,
      transactionId: providerTransactionId,
      paidAt,
      rawResponse: payload,
    });

    order.paymentId = createdPayment._id;
  }

  await order.save();

  return {
    duplicate: false,
    matched: true,
    transactionId: transaction._id,
  };
};

module.exports = {
  PaymentIntent,
  createIntent,
  getIntent,
  markStarted,
  applySePayWebhook,
  serializeIntent,
};
