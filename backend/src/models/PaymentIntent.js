const mongoose = require("mongoose");

const paymentIntentSchema = new mongoose.Schema(
  {
    intentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /*
     * Order CHƯA tồn tại khi PaymentIntent được tạo.
     *
     * Sau khi SePay xác nhận giao dịch và khách bấm
     * "Đặt hàng", backend mới gắn Order._id vào đây.
     */
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
      sparse: true,
      unique: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
     * Mã này được tạo NGAY KHI tạo PaymentIntent.
     *
     * Ví dụ:
     * HTH261005-4821
     */
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

    /*
     * Signature của Checkout tại thời điểm tạo PaymentIntent.
     *
     * Dùng để tránh tạo lại QR/PaymentIntent liên tục
     * khi React render lại.
     */
    checkoutSignature: {
      type: String,
      default: "",
      index: true,
    },

    /*
     * Toàn bộ snapshot Checkout dùng để tạo Order
     * SAU KHI thanh toán đã được xác minh.
     *
     * Không tạo Order tại thời điểm này.
     */
    checkoutSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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
