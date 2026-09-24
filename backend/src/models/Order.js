const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    productImage: {
      type: String,
      default: "",
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    customerSnapshot: {
      fullName: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      email: {
        type: String,
        default: "",
      },
    },

    recipientSnapshot: {
      fullName: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      email: {
        type: String,
        default: "",
      },

      provinceCode: {
        type: String,
        default: "",
      },

      provinceName: {
        type: String,
        default: "",
      },

      wardCode: {
        type: String,
        default: "",
      },

      wardName: {
        type: String,
        default: "",
      },

      houseNumber: {
        type: String,
        default: "",
      },

      street: {
        type: String,
        default: "",
      },

      note: {
        type: String,
        default: "",
      },
      address: {
        type: String,
        default: "",
      },
    },

    items: {
      type: [orderItemSchema],
      default: [],
    },

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    couponCode: {
      type: String,
      default: "",
    },

    paymentMethod: {
      type: String,
      default: "",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "cancelled"],
      default: "pending",
      index: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipping",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    channel: {
      type: String,
      enum: [
        "website",
        "facebook",
        "shopee",
        "zalo",
        "hotline",
        "store",
        "other",
      ],
      default: "website",
      index: true,
    },

    deliveryDate: {
      type: Date,
      default: null,
      index: true,
    },

    deliveryTimeSlot: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({
  createdAt: -1,
});

orderSchema.index({
  status: 1,
  createdAt: -1,
});

orderSchema.index({
  channel: 1,
  createdAt: -1,
});

orderSchema.index({
  deliveryDate: 1,
  status: 1,
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
