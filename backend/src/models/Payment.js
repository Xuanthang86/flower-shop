const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },

    provider: {
      type: String,
      default: "",
    },

    method: {
      type: String,
      required: true,
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

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "cancelled"],
      default: "pending",
      index: true,
    },

    transactionId: {
      type: String,
      default: "",
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    rawResponse: {
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
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
