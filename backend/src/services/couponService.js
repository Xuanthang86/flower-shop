const Coupon = require("../models/Coupon");

const normalizeCode = (value) => String(value || "").trim().toUpperCase();

const calculateDiscount = (coupon, subtotal) => {
  const base = Math.max(0, Number(subtotal) || 0);
  if (coupon.discountType === "percentage") {
    const raw = Math.round((base * Number(coupon.discountValue || 0)) / 100);
    return Math.min(raw, Number(coupon.maxDiscount || 0) > 0 ? Number(coupon.maxDiscount) : raw);
  }
  return Math.min(base, Math.max(0, Number(coupon.discountValue) || 0));
};

const validateCoupon = async ({ code, subtotal, userId = null }) => {
  const normalized = normalizeCode(code);
  if (!normalized) throw Object.assign(new Error("Mã giảm giá không hợp lệ."), { status: 400 });

  const coupon = await Coupon.findOne({ code: normalized }).lean();
  if (!coupon || !coupon.active) throw Object.assign(new Error("Mã giảm giá không tồn tại hoặc đã tắt."), { status: 400 });

  const now = new Date();
  if (coupon.startsAt && now < new Date(coupon.startsAt)) {
    throw Object.assign(new Error("Mã giảm giá chưa bắt đầu hiệu lực."), { status: 400 });
  }
  if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
    throw Object.assign(new Error("Mã giảm giá đã hết hạn."), { status: 400 });
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw Object.assign(new Error("Mã giảm giá đã hết lượt sử dụng."), { status: 400 });
  }

  const base = Math.max(0, Number(subtotal) || 0);
  if (base < Number(coupon.minOrderValue || 0)) {
    throw Object.assign(
      new Error(`Đơn tối thiểu để dùng mã là ${Number(coupon.minOrderValue).toLocaleString("vi-VN")}đ.`),
      { status: 400 },
    );
  }

  return {
    coupon,
    code: coupon.code,
    discount: calculateDiscount(coupon, base),
    userId: userId || null,
  };
};

const list = async () => Coupon.find({}).sort({ createdAt: -1 }).lean();

const create = async (payload) => Coupon.create({
  code: normalizeCode(payload.code),
  description: String(payload.description || "").trim(),
  discountType: payload.discountType,
  discountValue: Math.max(0, Number(payload.discountValue) || 0),
  minOrderValue: Math.max(0, Number(payload.minOrderValue || payload.minimumOrder || 0)),
  maxDiscount: Math.max(0, Number(payload.maxDiscount || payload.maximumDiscount || 0)),
  startsAt: payload.startsAt || payload.startDate || null,
  expiresAt: payload.expiresAt || payload.endDate || null,
  usageLimit: Math.max(0, Number(payload.usageLimit || 0)),
  active: payload.active !== false,
});

const update = async (id, payload) => {
  const updated = await Coupon.findByIdAndUpdate(
    id,
    {
      $set: {
        ...payload,
        code: normalizeCode(payload.code),
        discountValue: Math.max(0, Number(payload.discountValue || 0)),
        minOrderValue: Math.max(0, Number(payload.minOrderValue || 0)),
        maxDiscount: Math.max(0, Number(payload.maxDiscount || 0)),
      },
    },
    { new: true, runValidators: true },
  ).lean();

  if (!updated) throw Object.assign(new Error("Không tìm thấy mã giảm giá."), { status: 404 });
  return updated;
};

module.exports = { normalizeCode, calculateDiscount, validateCoupon, list, create, update };
