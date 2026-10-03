const mongoose = require("mongoose");

const paymentIntentSchema = new mongoose.Schema(
  {
    intentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    reference: {
      type: String,
      default: "",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "VND",
    },

    paymentMethod: {
      type: String,
      default: "bank_transfer",
    },

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

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    paymentAttemptedAt: {
      type: Date,
      default: null,
    },

    transactionId: {
      type: String,
      default: "",
      index: true,
    },

    transaction: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

module.exports =
  mongoose.models.PaymentIntent ||
  mongoose.model("PaymentIntent", paymentIntentSchema);
