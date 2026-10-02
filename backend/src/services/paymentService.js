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
    depositPercent: {
      type: Number,
      enum: [50, 100],
      default: 100,
    },
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

const createIntent = async ({ orderId, amount, depositPercent = 100 }) => {
  const numericAmount = Math.round(Number(amount) || 0);

  const normalizedDepositPercent = Number(depositPercent) === 50 ? 50 : 100;

  if (numericAmount <= 0) {
    throw Object.assign(new Error("Số tiền thanh toán không hợp lệ."), {
      status: 400,
    });
  }

  const existingIntent = await PaymentIntent.findOne({
    orderCode: {
      $regex: /^HTH\d{6}-\d{4}$/,
      $options: "i",
    },
  }).sort({ createdAt: -1 });

  let orderCode;

  if (orderId) {
    const order = await Order.findById(orderId);

    if (!order) {
      throw Object.assign(new Error("Không tìm thấy đơn hàng."), {
        status: 404,
      });
    }

    orderCode = order.orderCode;
  }

  if (!orderCode) {
    const d = new Date();

    const prefix = `HTH${String(d.getFullYear()).slice(-2)}${String(
      d.getMonth() + 1,
    ).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

    for (let i = 0; i < 100; i += 1) {
      const candidate = `${prefix}-${String(
        crypto.randomInt(0, 10000),
      ).padStart(4, "0")}`;

      const exists = await PaymentIntent.exists({
        orderCode: candidate,
      });

      if (!exists) {
        orderCode = candidate;
        break;
      }
    }
  }

  if (!orderCode) {
    throw new Error("Không thể tạo mã thanh toán.");
  }

  const intent = await PaymentIntent.create({
    intentId: crypto.randomUUID(),

    orderCode,

    reference: orderCode,

    amount: numericAmount,

    currency: "VND",

    paymentMethod: "bank_transfer",

    depositPercent: normalizedDepositPercent,

    expiresAt: new Date(Date.now() + 30 * 60 * 1000),

    status: "pending",

    orderId: orderId || null,
  });

  return intent.toObject();
};

const serializeIntent = (intent) => ({
  id: intent.intentId,
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
    order.paymentStatus =
      Number(intent.depositPercent) === 50 ? "partially_paid" : "paid";
    order.paymentIntentId = intent.intentId;

    const payment = await Payment.findOne({
      orderId: order._id,
    });

    if (payment) {
      order.paymentId = payment._id;
      await order.save();

      payment.paymentIntentId = intent.intentId;
      payment.status = "paid";
      payment.transactionId = providerTransactionId;
      payment.paidAt = paidAt;
      payment.rawResponse = payload;

      await payment.save();
    } else {
      const createdPayment = await Payment.create({
        orderId: order._id,
        provider: "sepay",
        method: order.paymentMethod || "bank_transfer",
        amount: intent.amount,
        currency: "VND",
        status: "paid",
        paymentIntentId: intent.intentId,
        transactionId: providerTransactionId,
        paidAt,
        rawResponse: payload,
      });

      order.paymentId = createdPayment._id;

      await order.save();
    }
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
