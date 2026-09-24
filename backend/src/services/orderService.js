const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Payment = require("../models/Payment");
const User = require("../models/User");

const generateOrderCode = async () => {
  const d = new Date();
  const prefix = `FS-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  for (let i = 0; i < 30; i += 1) {
    const code = `${prefix}-${String(crypto.randomInt(0, 1000000)).padStart(6, "0")}`;
    if (!(await Order.exists({ orderCode: code }))) return code;
  }
  throw new Error("Không thể tạo mã đơn hàng duy nhất.");
};

const normalizeItems = (items) => {
  if (!Array.isArray(items) || !items.length) {
    throw Object.assign(new Error("Đơn hàng phải có ít nhất một sản phẩm."), { status: 400 });
  }
  return items.map((item) => ({
    productId: item.productId || item.id || null,
    quantity: Math.max(1, Math.floor(Number(item.quantity) || 0)),
  }));
};

const calculateOrder = async ({ items, couponCode = "", shippingFee = 0 }) => {
  const requested = normalizeItems(items);
  const ids = requested.map((x) => x.productId).filter(Boolean);
  const products = await Product.find({ _id: { $in: ids }, active: true }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const normalizedItems = requested.map((item) => {
    const product = byId.get(String(item.productId));
    if (!product) throw Object.assign(new Error("Một sản phẩm không còn tồn tại."), { status: 400 });
    if (Number(product.stockQuantity) < item.quantity) {
      throw Object.assign(new Error(`Sản phẩm "${product.name}" không đủ tồn kho.`), { status: 400 });
    }
    const unitPrice = Number(product.price) || 0;
    return {
      productId: product._id,
      productName: product.name,
      productImage: product.image || "",
      unitPrice,
      quantity: item.quantity,
      subtotal: unitPrice * item.quantity,
    };
  });

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);
  let discount = 0;
  let coupon = null;

  if (String(couponCode || "").trim()) {
    coupon = await Coupon.findOne({
      code: String(couponCode).trim().toUpperCase(),
      active: true,
    }).lean();

    if (!coupon) throw Object.assign(new Error("Mã giảm giá không hợp lệ."), { status: 400 });

    const now = new Date();
    if ((coupon.startsAt && now < new Date(coupon.startsAt)) ||
        (coupon.expiresAt && now > new Date(coupon.expiresAt)) ||
        (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) ||
        subtotal < Number(coupon.minOrderValue || 0)) {
      throw Object.assign(new Error("Mã giảm giá không đủ điều kiện áp dụng."), { status: 400 });
    }

    discount = coupon.discountType === "percentage"
      ? Math.round(subtotal * Number(coupon.discountValue || 0) / 100)
      : Math.max(0, Number(coupon.discountValue || 0));

    if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.min(discount, subtotal);
  }

  const shipping = Math.max(0, Number(shippingFee) || 0);
  return {
    items: normalizedItems,
    subtotal,
    discount,
    shippingFee: shipping,
    grandTotal: Math.max(0, subtotal - discount + shipping),
    coupon,
  };
};

const create = async ({ payload, user }) => {
  const calculation = await calculateOrder(payload);
  const orderCode = await generateOrderCode();
  const customer = user
    ? await User.findById(user._id).lean()
    : null;

  const recipient = payload.recipient || payload.address || {};
  const order = await Order.create({
    orderCode,
    customerId: user?._id || null,
    customerSnapshot: {
      fullName: customer?.name || user?.name || "",
      phone: customer?.phone || user?.phone || "",
      email: customer?.email || user?.email || "",
    },
    recipientSnapshot: {
      fullName: String(recipient.fullName || recipient.recipientName || payload.fullName || "").trim(),
      phone: String(recipient.phone || payload.phone || "").trim(),
      email: String(recipient.email || payload.email || "").trim(),
      address: String(recipient.addressLine || recipient.address || payload.addressLine || "").trim(),
    },
    items: calculation.items,
    subtotal: calculation.subtotal,
    discount: calculation.discount,
    shippingFee: calculation.shippingFee,
    grandTotal: calculation.grandTotal,
    couponCode: calculation.coupon?.code || "",
    paymentMethod: String(payload.paymentMethod || "").trim(),
    paymentStatus: "pending",
    status: "pending",
    channel: String(payload.channel || "website"),
    deliveryDate: payload.deliveryDate || null,
    deliveryTimeSlot: String(payload.deliveryTimeSlot || "").trim(),
    notes: String(payload.notes || "").trim(),
  });

  if (calculation.coupon) {
    await Coupon.updateOne({ _id: calculation.coupon._id }, { $inc: { usedCount: 1 } });
  }

  for (const item of calculation.items) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stockQuantity: -item.quantity, salesCount: item.quantity } },
    );
  }

  const payment = await Payment.create({
    orderId: order._id,
    provider: String(payload.paymentProvider || "").trim(),
    method: String(payload.paymentMethod || "").trim(),
    amount: calculation.grandTotal,
    currency: "VND",
    status: "pending",
  });

  return { order: order.toObject(), payment: payment.toObject() };
};

const getById = async (id, user) => {
  const filter = { _id: id };
  if (user?.role === "customer") filter.customerId = user._id;
  const order = await Order.findOne(filter).lean();
  if (!order) throw Object.assign(new Error("Không tìm thấy đơn hàng."), { status: 404 });
  return order;
};

const list = async ({ user, page = 1, limit = 50, status = "" }) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
  const filter = {};
  if (user?.role === "customer") filter.customerId = user._id;
  if (status) filter.status = status;

  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    Order.countDocuments(filter),
  ]);
  return { items, total, page: safePage, limit: safeLimit };
};

const updateStatus = async (id, status, paymentStatus) => {
  const allowed = ["pending", "confirmed", "processing", "shipping", "delivered", "cancelled"];
  if (!allowed.includes(status)) throw Object.assign(new Error("Trạng thái đơn hàng không hợp lệ."), { status: 400 });

  const update = { status };
  if (status === "delivered") update.deliveredAt = new Date();
  if (status === "cancelled") update.cancelledAt = new Date();
  if (paymentStatus) update.paymentStatus = paymentStatus;

  const order = await Order.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  if (!order) throw Object.assign(new Error("Không tìm thấy đơn hàng."), { status: 404 });
  return order;
};

module.exports = { generateOrderCode, calculateOrder, create, getById, list, updateStatus };
