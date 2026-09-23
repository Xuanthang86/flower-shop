const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      index: true,
    },

    providerTransactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    orderCode: {
      type: String,
      default: "",
      index: true,
    },

    amount: {
      type: Number,
      default: 0,
    },

    content: {
      type: String,
      default: "",
    },

    referenceCode: {
      type: String,
      default: "",
    },

    transactionDate: {
      type: Date,
      default: null,
    },

    matched: {
      type: Boolean,
      default: false,
      index: true,
    },

    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

module.exports =
  mongoose.models.PaymentTransaction ||
  mongoose.model("PaymentTransaction", paymentTransactionSchema);
