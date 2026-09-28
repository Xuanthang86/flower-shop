const crypto = require("crypto");
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const PaymentTransaction = require("../models/PaymentTransaction");
const Order = require("../models/Order");

const paymentIntentSchema = new mongoose.Schema(
  {
    intentId: { type: String, required: true, unique: true, index: true },
    orderCode: { type: String, required: true, unique: true, index: true },
    reference: { type: String, default: "" },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "VND" },
    paymentMethod: { type: String, default: "bank_transfer" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "expired", "cancelled"],
      default: "pending",
      index: true,
    },
    expiresAt: { type: Date, required: true },
    paidAt: { type: Date, default: null },
    paymentAttemptedAt: { type: Date, default: null },
    transactionId: { type: String, default: "" },
    transaction: { type: mongoose.Schema.Types.Mixed, default: null },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

const PaymentIntent =
  mongoose.models.PaymentIntent ||
  mongoose.model("PaymentIntent", paymentIntentSchema);

const createIntent = async ({ orderId, amount }) => {
  const numericAmount = Math.round(Number(amount) || 0);

  if (!orderId) {
    throw Object.assign(
      new Error("Payment Intent phải được liên kết với đơn hàng."),
      { status: 400 },
    );
  }

  if (numericAmount <= 0) {
    throw Object.assign(new Error("Số tiền thanh toán không hợp lệ."), {
      status: 400,
    });
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw Object.assign(
      new Error("Không tìm thấy đơn hàng để tạo Payment Intent."),
      { status: 404 },
    );
  }

  if (Number(order.grandTotal) !== numericAmount) {
    throw Object.assign(
      new Error("Số tiền Payment Intent không khớp với đơn hàng."),
      { status: 400 },
    );
  }

  const existingPaymentIntent = await PaymentIntent.findOne({
    orderId: order._id,
  });

  if (existingPaymentIntent) {
    return existingPaymentIntent.toObject();
  }

  const intent = await PaymentIntent.create({
    intentId: crypto.randomUUID(),

    orderId: order._id,

    orderCode: order.orderCode,

    reference: order.orderCode,

    amount: numericAmount,

    currency: "VND",

    paymentMethod: order.paymentMethod || "bank_transfer",

    expiresAt: new Date(Date.now() + 30 * 60 * 1000),

    status: "pending",
  });

  await Payment.updateOne(
    { orderId: order._id },
    {
      $set: {
        paymentIntentId: intent.intentId,
      },
    },
  );

  return intent.toObject();
};

const serializeIntent = (intent) => ({
  id: intent.intentId,
  orderCode: intent.orderCode,
  reference: intent.reference || intent.orderCode,
  amount: intent.amount,
  currency: intent.currency,
  status: intent.status,
  expiresAt: intent.expiresAt,
  paidAt: intent.paidAt || null,
  paymentAttemptedAt: intent.paymentAttemptedAt || null,
  transactionId: intent.transactionId || "",
  transaction: intent.status === "paid" ? intent.transaction : null,
});

const getIntent = async (intentId) => {
  const intent = await PaymentIntent.findOne({ intentId });
  if (!intent)
    throw Object.assign(new Error("Không tìm thấy Payment Intent."), {
      status: 404,
    });

  if (
    intent.status === "pending" &&
    new Date(intent.expiresAt).getTime() < Date.now()
  ) {
    intent.status = "expired";
    await intent.save();
  }
  return serializeIntent(intent);
};

const markStarted = async (intentId) => {
  const intent = await PaymentIntent.findOne({ intentId });
  if (!intent)
    throw Object.assign(new Error("Không tìm thấy Payment Intent."), {
      status: 404,
    });
  if (intent.status !== "pending") return serializeIntent(intent);
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

  const exists = await PaymentTransaction.findOne({ providerTransactionId });
  if (exists) return { duplicate: true };

  const content = String(payload?.content || payload?.description || "").trim();
  const amount = Number(payload?.transferAmount ?? payload?.amount ?? 0);
  const transferType = String(payload?.transferType || "").toLowerCase();

  const match = content.match(/FS-\d{8}-\d{4,12}/i);
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
    return { duplicate: false, matched: false, transactionId: transaction._id };
  }

  if (
    amount < intent.amount ||
    (intent.expiresAt && new Date(intent.expiresAt) < new Date())
  ) {
    return { duplicate: false, matched: false, transactionId: transaction._id };
  }

  const normalizedContent = content.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const normalizedOrderCode = intent.orderCode
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (!normalizedContent.includes(normalizedOrderCode)) {
    return { duplicate: false, matched: false, transactionId: transaction._id };
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

  await PaymentTransaction.updateOne(
    { _id: transaction._id },
    { $set: { matched: true } },
  );

  const order = await Order.findOne({ orderCode: intent.orderCode });
  if (order) {
    order.paymentStatus = "paid";
    await order.save();
    await Payment.updateOne(
      { orderId: order._id },
      {
        $set: { status: "paid", transactionId: providerTransactionId, paidAt },
      },
    );
  }

  return { duplicate: false, matched: true, transactionId: transaction._id };
};

module.exports = {
  PaymentIntent,
  createIntent,
  getIntent,
  markStarted,
  applySePayWebhook,
  serializeIntent,
};
