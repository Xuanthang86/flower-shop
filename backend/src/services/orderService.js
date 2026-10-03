const crypto = require("crypto");

const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Payment = require("../models/Payment");
const User = require("../models/User");
const {
  sendNewOrderNotification,
  sendOrderStatusNotification,
} = require("./emailService");

const ALLOWED_CHANNELS = [
  "website",
  "facebook",
  "shopee",
  "zalo",
  "hotline",
  "store",
  "other",
];

const ALLOWED_PAYMENT_METHODS = ["cod", "bank_transfer"];

const generateOrderCode = async (preferredCode = "") => {
  const normalizedPreferred = String(preferredCode || "")
    .trim()
    .toUpperCase();

  if (normalizedPreferred) {
    const exists = await Order.exists({
      orderCode: normalizedPreferred,
    });

    if (!exists) {
      return normalizedPreferred;
    }

    throw Object.assign(new Error("Mã đơn hàng đã tồn tại."), {
      status: 409,
    });
  }

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

    if (
      !(await Order.exists({
        orderCode: code,
      }))
    ) {
      return code;
    }
  }

  throw new Error("Không thể tạo mã đơn hàng duy nhất.");
};

const normalizeItems = (items) => {
  if (!Array.isArray(items) || !items.length) {
    throw Object.assign(new Error("Đơn hàng phải có ít nhất một sản phẩm."), {
      status: 400,
    });
  }

  return items.map((item) => {
    const productId = String(item?.productId || item?.id || "").trim();

    const quantity = Math.floor(Number(item?.quantity) || 0);

    if (!productId) {
      throw Object.assign(new Error("Sản phẩm trong đơn hàng không hợp lệ."), {
        status: 400,
      });
    }

    if (quantity < 1) {
      throw Object.assign(new Error("Số lượng sản phẩm phải lớn hơn 0."), {
        status: 400,
      });
    }

    return {
      productId,
      quantity,
    };
  });
};

const calculateOrder = async ({ items, couponCode = "", shippingFee = 0 }) => {
  const requested = normalizeItems(items);

  const ids = requested.map((item) => item.productId);

  const products = await Product.find({
    _id: {
      $in: ids,
    },
    active: true,
  }).lean();

  const byId = new Map(
    products.map((product) => [String(product._id), product]),
  );

  const normalizedItems = requested.map((item) => {
    const product = byId.get(item.productId);

    if (!product) {
      throw Object.assign(
        new Error("Một sản phẩm không còn tồn tại hoặc đã ngừng bán."),
        {
          status: 400,
        },
      );
    }

    if (Number(product.stockQuantity) < item.quantity) {
      throw Object.assign(
        new Error(`Sản phẩm "${product.name}" không đủ tồn kho.`),
        {
          status: 400,
        },
      );
    }

    const unitPrice = Math.max(0, Math.round(Number(product.price) || 0));

    return {
      productId: product._id,
      productName: String(product.name || "").trim(),
      productImage: String(product.image || "").trim(),
      unitPrice,
      quantity: item.quantity,
      subtotal: unitPrice * item.quantity,
    };
  });

  const subtotal = normalizedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );

  let discount = 0;
  let coupon = null;

  const normalizedCouponCode = String(couponCode || "")
    .trim()
    .toUpperCase();

  if (normalizedCouponCode) {
    coupon = await Coupon.findOne({
      code: normalizedCouponCode,
      active: true,
    }).lean();

    if (!coupon) {
      throw Object.assign(new Error("Mã giảm giá không hợp lệ."), {
        status: 400,
      });
    }

    const now = new Date();

    if (coupon.startsAt && now < new Date(coupon.startsAt)) {
      throw Object.assign(new Error("Mã giảm giá chưa bắt đầu."), {
        status: 400,
      });
    }

    if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
      throw Object.assign(new Error("Mã giảm giá đã hết hạn."), {
        status: 400,
      });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      throw Object.assign(new Error("Mã giảm giá đã hết lượt sử dụng."), {
        status: 400,
      });
    }

    if (subtotal < Number(coupon.minOrderValue || 0)) {
      throw Object.assign(
        new Error(
          "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã giảm giá.",
        ),
        {
          status: 400,
        },
      );
    }

    discount =
      coupon.discountType === "percentage"
        ? Math.round((subtotal * Number(coupon.discountValue || 0)) / 100)
        : Math.max(0, Math.round(Number(coupon.discountValue || 0)));

    if (Number(coupon.maxDiscount || 0) > 0) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }

    discount = Math.min(discount, subtotal);
  }

  const normalizedShippingFee = Math.max(
    0,
    Math.round(Number(shippingFee) || 0),
  );

  if (!Number.isFinite(Number(shippingFee)) || Number(shippingFee) < 0) {
    throw Object.assign(new Error("Phí giao hàng không hợp lệ."), {
      status: 400,
    });
  }

  const grandTotal = Math.max(0, subtotal - discount + normalizedShippingFee);

  return {
    items: normalizedItems,
    subtotal,
    discount,
    shippingFee: normalizedShippingFee,
    grandTotal,
    coupon,
  };
};

const create = async ({ payload = {}, user }) => {
  if (!user?._id) {
    throw Object.assign(new Error("Bạn cần đăng nhập để tạo đơn hàng."), {
      status: 401,
    });
  }

  const calculation = await calculateOrder({
    items: payload.items,
    couponCode: payload.couponCode,
    shippingFee: payload.shippingFee,
  });

  const paymentMethod = String(payload.paymentMethod || "")
    .trim()
    .toLowerCase();

  if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
    throw Object.assign(new Error("Phương thức thanh toán không hợp lệ."), {
      status: 400,
    });
  }

  const channel = String(payload.channel || "website")
    .trim()
    .toLowerCase();

  if (!ALLOWED_CHANNELS.includes(channel)) {
    throw Object.assign(new Error("Kênh đơn hàng không hợp lệ."), {
      status: 400,
    });
  }

  const orderCode = await generateOrderCode(payload.orderCode);

  const customer = await User.findById(user._id).lean();

  if (!customer) {
    throw Object.assign(new Error("Không tìm thấy tài khoản khách hàng."), {
      status: 401,
    });
  }

  const recipient = payload.recipient || payload.address || {};

  const sender = payload.sender || {};

  const paymentDepositPercent =
    Number(payload.paymentDepositPercent) === 50 ? 50 : 100;

  const paymentDepositAmount = Math.round(
    (calculation.grandTotal * paymentDepositPercent) / 100,
  );

  const paymentRemainingAmount = Math.max(
    0,
    calculation.grandTotal - paymentDepositAmount,
  );

  const order = await Order.create({
    orderCode,

    customerId: customer._id,

    customerSnapshot: {
      fullName: String(customer.name || "").trim(),

      phone: String(customer.phone || "").trim(),

      email: String(customer.email || "")
        .trim()
        .toLowerCase(),
    },

    senderSnapshot: {
      fullName: String(sender.name || "").trim(),

      phone: String(sender.phone || "").trim(),

      email: String(sender.email || "")
        .trim()
        .toLowerCase(),

      isHiddenFromRecipient: sender.isHiddenFromRecipient !== false,
    },

    recipientSnapshot: {
      fullName: String(recipient.fullName || recipient.name || "").trim(),

      phone: String(recipient.phone || "").trim(),

      email: String(recipient.email || "")
        .trim()
        .toLowerCase(),

      provinceCode: String(
        recipient.provinceCode || recipient.address?.provinceCode || "",
      ).trim(),

      provinceName: String(
        recipient.provinceName || recipient.address?.provinceName || "",
      ).trim(),

      wardCode: String(
        recipient.wardCode || recipient.address?.wardCode || "",
      ).trim(),

      wardName: String(
        recipient.wardName || recipient.address?.wardName || "",
      ).trim(),

      houseNumber: String(
        recipient.houseNumber || recipient.address?.houseNumber || "",
      ).trim(),

      street: String(
        recipient.street || recipient.address?.street || "",
      ).trim(),

      note: String(recipient.note || payload.notes || "").trim(),

      address: String(
        recipient.addressLine || recipient.address || payload.addressLine || "",
      ).trim(),
    },

    items: calculation.items,

    subtotal: calculation.subtotal,

    discount: calculation.discount,

    shippingFee: calculation.shippingFee,

    grandTotal: calculation.grandTotal,

    couponCode: calculation.coupon?.code || "",

    paymentMethod,

    /*
     * Payment status luôn do backend
     * kiểm soát.
     *
     * Không nhận paymentStatus từ Frontend.
     */
    paymentStatus: "pending",

    status: "pending",

    channel,

    deliveryDate: payload.deliveryDate || null,

    deliveryTimeSlot: String(payload.deliveryTimeSlot || "").trim(),

    deliveryMode: String(payload.deliveryMode || "").trim(),

    deliveryModeLabel: String(payload.deliveryModeLabel || "").trim(),

    deliveryTimeSlotLabel: String(payload.deliveryTimeSlotLabel || "").trim(),

    estimatedDeliveryTime: String(payload.estimatedDeliveryTime || "").trim(),

    deliveryDistanceKm: Number.isFinite(Number(payload.deliveryDistanceKm))
      ? Number(payload.deliveryDistanceKm)
      : null,

    deliveryNote: String(payload.deliveryNote || "").trim(),

    shippingSnapshot:
      payload.shippingSnapshot && typeof payload.shippingSnapshot === "object"
        ? payload.shippingSnapshot
        : null,

    notes: String(payload.notes || "").trim(),

    paymentDepositPercent,

    paymentDepositAmount,

    paymentRemainingAmount,

    /*
     * Không nhận paymentIntentId
     * từ Frontend ở bước create order.
     *
     * PaymentIntent sẽ được backend
     * tạo/ràng buộc sau.
     */
    paymentIntentId: "",
  });

  if (calculation.coupon) {
    await Coupon.updateOne(
      {
        _id: calculation.coupon._id,
      },
      {
        $inc: {
          usedCount: 1,
        },
      },
    );
  }

  for (const item of calculation.items) {
    const stockUpdate = await Product.updateOne(
      {
        _id: item.productId,
        active: true,
        stockQuantity: {
          $gte: item.quantity,
        },
      },
      {
        $inc: {
          stockQuantity: -item.quantity,
          salesCount: item.quantity,
        },
      },
    );

    if (stockUpdate.modifiedCount !== 1) {
      await Order.deleteOne({
        _id: order._id,
      });

      throw Object.assign(
        new Error(
          `Sản phẩm "${item.productName}" không còn đủ tồn kho. Vui lòng thử lại.`,
        ),
        {
          status: 409,
        },
      );
    }
  }

  const payment = await Payment.create({
    orderId: order._id,

    provider: "",

    method: paymentMethod,

    amount: paymentDepositAmount,

    currency: "VND",

    status: "pending",

    transactionId: "",

    paidAt: null,

    paymentIntentId: "",
  });

  order.paymentId = payment._id;

  await order.save();

  const finalOrder = await Order.findById(order._id).lean();
  void sendNewOrderNotification(finalOrder);

  return {
    order: finalOrder,
    payment: payment.toObject(),
  };
};

const getById = async (id, user) => {
  const filter = {
    _id: id,
  };

  if (String(user?.role || "") === "customer") {
    filter.customerId = user._id;
  }

  const order = await Order.findOne(filter).lean();

  if (!order) {
    throw Object.assign(new Error("Không tìm thấy đơn hàng."), {
      status: 404,
    });
  }

  return order;
};

const list = async ({ user, page = 1, limit = 50, status = "" }) => {
  const safePage = Math.max(1, Number(page) || 1);

  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));

  const filter = {};

  if (String(user?.role || "") === "customer") {
    filter.customerId = user._id;
  }

  if (status) {
    filter.status = status;
  }

  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),

    Order.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: safePage,
    limit: safeLimit,
  };
};

const updateStatus = async (id, status, paymentStatus) => {
  const allowed = [
    "pending",
    "confirmed",
    "processing",
    "shipping",
    "delivered",
    "cancelled",
  ];

  if (!allowed.includes(status)) {
    throw Object.assign(new Error("Trạng thái đơn hàng không hợp lệ."), {
      status: 400,
    });
  }

  const existingOrder = await Order.findById(id).lean();

  if (!existingOrder) {
    throw Object.assign(new Error("Không tìm thấy đơn hàng."), {
      status: 404,
    });
  }

  const update = {
    status,
  };

  if (status === "delivered") {
    update.deliveredAt = new Date();
  }

  if (status === "cancelled") {
    update.cancelledAt = new Date();
  }

  if (paymentStatus) {
    const allowedPaymentStatus = [
      "pending",
      "partially_paid",
      "paid",
      "failed",
      "refunded",
      "cancelled",
    ];

    if (!allowedPaymentStatus.includes(paymentStatus)) {
      throw Object.assign(new Error("Trạng thái thanh toán không hợp lệ."), {
        status: 400,
      });
    }

    update.paymentStatus = paymentStatus;
  }

  const order = await Order.findByIdAndUpdate(
    id,
    {
      $set: update,
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  if (!order) {
    throw Object.assign(new Error("Không tìm thấy đơn hàng."), {
      status: 404,
    });
  }

  if (String(existingOrder.status || "") !== String(order.status || "")) {
    void sendOrderStatusNotification(order);
  }

  return order;
};

module.exports = {
  generateOrderCode,
  calculateOrder,
  create,
  getById,
  list,
  updateStatus,
};
