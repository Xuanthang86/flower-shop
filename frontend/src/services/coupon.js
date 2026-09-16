const COUPON_STORAGE_KEY = "flower-shop-coupons";

export const COUPONS_UPDATED_EVENT = "flower-shop-coupons-updated";

const ORDERS_STORAGE_KEY = "flower-shop-orders";

const COUPON_TYPE = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
};

export const COUPON_TYPES = COUPON_TYPE;

const clone = (value) => JSON.parse(JSON.stringify(value));

const normalizeCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

const normalizeIdArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean)),
  ];
};

const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const normalizeDate = (value) => {
  const source = String(value || "").trim();

  if (!source) {
    return "";
  }

  const date = new Date(source);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
};

export const normalizeCoupon = (coupon = {}) => {
  const type =
    coupon.type === COUPON_TYPE.FIXED
      ? COUPON_TYPE.FIXED
      : COUPON_TYPE.PERCENTAGE;

  const percentageValue = Math.min(
    100,
    Math.max(0, normalizeNumber(coupon.value, 0))
  );

  const fixedValue = Math.max(0, normalizeNumber(coupon.value, 0));

  return {
    id:
      String(coupon.id || "").trim() ||
      `coupon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

    code: normalizeCode(coupon.code),

    name: String(coupon.name || "").trim(),

    type,

    value: type === COUPON_TYPE.PERCENTAGE ? percentageValue : fixedValue,

    minimumOrder: Math.max(0, normalizeNumber(coupon.minimumOrder, 0)),

    maximumDiscount: Math.max(0, normalizeNumber(coupon.maximumDiscount, 0)),

    startDate: normalizeDate(coupon.startDate),

    endDate: normalizeDate(coupon.endDate),

    active: coupon.active !== false,

    usageLimit: Math.max(0, Math.floor(normalizeNumber(coupon.usageLimit, 0))),

    perUserLimit: Math.max(
      0,
      Math.floor(normalizeNumber(coupon.perUserLimit, 0))
    ),

    categoryRestriction: normalizeIdArray(coupon.categoryRestriction),

    productRestriction: normalizeIdArray(coupon.productRestriction),

    createdAt: normalizeDate(coupon.createdAt) || new Date().toISOString(),

    updatedAt: normalizeDate(coupon.updatedAt) || new Date().toISOString(),
  };
};

const readRawCoupons = () => {
  try {
    const raw = localStorage.getItem(COUPON_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error("Lỗi đọc coupon:", error);

    return [];
  }
};

export const readCoupons = () =>
  readRawCoupons()
    .map(normalizeCoupon)
    .filter((coupon) => coupon.code);

const writeCoupons = (coupons) => {
  localStorage.setItem(
    COUPON_STORAGE_KEY,
    JSON.stringify(coupons.map(normalizeCoupon))
  );

  window.dispatchEvent(new Event(COUPONS_UPDATED_EVENT));
};

export const saveCoupon = (coupon) => {
  const normalized = normalizeCoupon(coupon);

  if (!normalized.code) {
    throw new Error("Vui lòng nhập mã coupon.");
  }

  if (!normalized.name) {
    throw new Error("Vui lòng nhập tên chương trình khuyến mãi.");
  }

  if (normalized.type === COUPON_TYPE.PERCENTAGE) {
    if (normalized.value <= 0 || normalized.value > 100) {
      throw new Error("Phần trăm giảm phải lớn hơn 0 và không vượt quá 100%.");
    }
  } else if (normalized.value <= 0) {
    throw new Error("Số tiền giảm phải lớn hơn 0.");
  }

  const coupons = readCoupons();

  const duplicate = coupons.find(
    (item) => item.code === normalized.code && item.id !== normalized.id
  );

  if (duplicate) {
    throw new Error("Mã coupon đã tồn tại.");
  }

  const now = new Date().toISOString();

  const nextCoupon = {
    ...normalized,
    updatedAt: now,
    createdAt: normalized.createdAt || now,
  };

  const index = coupons.findIndex((item) => item.id === nextCoupon.id);

  const nextCoupons =
    index >= 0
      ? coupons.map((item, itemIndex) =>
          itemIndex === index ? nextCoupon : item
        )
      : [nextCoupon, ...coupons];

  writeCoupons(nextCoupons);

  return nextCoupon;
};

export const deleteCoupon = (couponId) => {
  const id = String(couponId || "").trim();

  if (!id) {
    return false;
  }

  const coupons = readCoupons();

  const nextCoupons = coupons.filter((coupon) => String(coupon.id) !== id);

  if (nextCoupons.length === coupons.length) {
    return false;
  }

  writeCoupons(nextCoupons);

  return true;
};

export const toggleCouponActive = (couponId) => {
  const coupons = readCoupons();

  const nextCoupons = coupons.map((coupon) => {
    if (String(coupon.id) !== String(couponId)) {
      return coupon;
    }

    return normalizeCoupon({
      ...coupon,
      active: !coupon.active,
      updatedAt: new Date().toISOString(),
    });
  });

  writeCoupons(nextCoupons);

  return nextCoupons.find((coupon) => String(coupon.id) === String(couponId));
};

const readOrdersForUsage = () => {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Lỗi đọc đơn hàng để kiểm tra coupon:", error);

    return [];
  }
};

export const getCouponUsage = (couponCode, userId = "") => {
  const code = normalizeCode(couponCode);

  if (!code) {
    return {
      total: 0,
      user: 0,
    };
  }

  const normalizedUserId = String(userId || "").trim();

  const orders = readOrdersForUsage();

  const couponOrders = orders.filter(
    (order) => normalizeCode(order?.couponSnapshot?.code) === code
  );

  const userOrders = normalizedUserId
    ? couponOrders.filter(
        (order) => String(order?.customerId || "").trim() === normalizedUserId
      )
    : [];

  return {
    total: couponOrders.length,
    user: userOrders.length,
  };
};

const getProductCategory = (product) =>
  String(
    product?.category || product?.categorySlug || product?.categoryId || ""
  ).trim();

const itemMatchesRestriction = (item, coupon, productLookup) => {
  const categoryRestriction = coupon.categoryRestriction || [];
  const productRestriction = coupon.productRestriction || [];

  const hasCategoryRestriction = categoryRestriction.length > 0;

  const hasProductRestriction = productRestriction.length > 0;

  if (!hasCategoryRestriction && !hasProductRestriction) {
    return true;
  }

  const product = productLookup?.(item?.id) || item?.product || item;

  const productId = String(product?.id ?? item?.id ?? "").trim();

  const category = getProductCategory(product);

  const categoryMatches =
    !hasCategoryRestriction || categoryRestriction.includes(category);

  const productMatches =
    !hasProductRestriction || productRestriction.includes(productId);

  return categoryMatches && productMatches;
};

const getEligibleSubtotal = ({ items = [], coupon, productLookup }) => {
  return items.reduce((total, item) => {
    const quantity = Math.max(0, Number(item?.quantity) || 0);

    const price = Math.max(0, Number(item?.price) || 0);

    if (!itemMatchesRestriction(item, coupon, productLookup)) {
      return total;
    }

    return total + price * quantity;
  }, 0);
};

const isDateOutsideRange = (now, startDate, endDate) => {
  const nowTime = now.getTime();

  if (startDate) {
    const start = new Date(startDate);

    if (!Number.isNaN(start.getTime()) && nowTime < start.getTime()) {
      return true;
    }
  }

  if (endDate) {
    const end = new Date(endDate);

    if (!Number.isNaN(end.getTime()) && nowTime > end.getTime()) {
      return true;
    }
  }

  return false;
};

export const calculateCouponDiscount = ({
  coupon,
  subtotal = 0,
  eligibleSubtotal = subtotal,
}) => {
  if (!coupon) {
    return 0;
  }

  const eligibleAmount = Math.max(0, Number(eligibleSubtotal) || 0);

  if (eligibleAmount <= 0) {
    return 0;
  }

  const baseDiscount =
    coupon.type === COUPON_TYPE.PERCENTAGE
      ? (eligibleAmount * Number(coupon.value || 0)) / 100
      : Number(coupon.value || 0);

  const cappedDiscount =
    coupon.maximumDiscount > 0
      ? Math.min(baseDiscount, Number(coupon.maximumDiscount))
      : baseDiscount;

  return Math.min(
    Math.max(0, cappedDiscount),
    Math.max(0, Number(subtotal) || 0),
    eligibleAmount
  );
};

export const createCouponSnapshot = ({
  coupon,
  discountAmount,
  eligibleSubtotal,
  appliedAt = new Date().toISOString(),
}) => {
  if (!coupon) {
    return null;
  }

  return {
    id: coupon.id,

    code: coupon.code,

    name: coupon.name,

    type: coupon.type,

    value: coupon.value,

    minimumOrder: coupon.minimumOrder,

    maximumDiscount: coupon.maximumDiscount,

    discountAmount: Math.max(0, Number(discountAmount) || 0),

    eligibleSubtotal: Math.max(0, Number(eligibleSubtotal) || 0),

    categoryRestriction: [...(coupon.categoryRestriction || [])],

    productRestriction: [...(coupon.productRestriction || [])],

    appliedAt,
  };
};

export const validateCoupon = ({
  code,
  items = [],
  subtotal = 0,
  userId = "",
  now = new Date(),
  productLookup,
}) => {
  const normalizedCode = normalizeCode(code);

  if (!normalizedCode) {
    return {
      success: false,
      message: "Vui lòng nhập mã giảm giá.",
    };
  }

  const coupon = readCoupons().find((item) => item.code === normalizedCode);

  if (!coupon) {
    return {
      success: false,
      message: "Mã giảm giá không tồn tại.",
    };
  }

  if (!coupon.active) {
    return {
      success: false,
      message: "Mã giảm giá hiện không hoạt động.",
    };
  }

  if (isDateOutsideRange(now, coupon.startDate, coupon.endDate)) {
    return {
      success: false,
      message: "Mã giảm giá chưa đến thời gian áp dụng hoặc đã hết hạn.",
    };
  }

  const orderSubtotal = Math.max(0, Number(subtotal) || 0);

  if (coupon.minimumOrder > 0 && orderSubtotal < coupon.minimumOrder) {
    return {
      success: false,
      message: `Đơn hàng tối thiểu ${coupon.minimumOrder.toLocaleString(
        "vi-VN"
      )}đ để sử dụng mã này.`,
    };
  }

  const usage = getCouponUsage(coupon.code, userId);

  if (coupon.usageLimit > 0 && usage.total >= coupon.usageLimit) {
    return {
      success: false,
      message: "Mã giảm giá đã hết lượt sử dụng.",
    };
  }

  if (coupon.perUserLimit > 0 && usage.user >= coupon.perUserLimit) {
    return {
      success: false,
      message: "Bạn đã sử dụng mã giảm giá này đủ số lần cho phép.",
    };
  }

  const eligibleSubtotal = getEligibleSubtotal({
    items,
    coupon,
    productLookup,
  });

  if (eligibleSubtotal <= 0) {
    return {
      success: false,
      message:
        "Mã giảm giá không áp dụng cho sản phẩm trong đơn hàng hiện tại.",
    };
  }

  const discountAmount = calculateCouponDiscount({
    coupon,
    subtotal: orderSubtotal,
    eligibleSubtotal,
  });

  if (discountAmount <= 0) {
    return {
      success: false,
      message: "Mã giảm giá không tạo ra mức giảm hợp lệ.",
    };
  }

  const couponSnapshot = createCouponSnapshot({
    coupon,
    discountAmount,
    eligibleSubtotal,
  });

  return {
    success: true,
    coupon,
    couponSnapshot,
    discountAmount,
    eligibleSubtotal,
    usage,
    message: `Áp dụng mã ${coupon.code} thành công.`,
  };
};

export const formatCouponDiscount = (amount = 0) =>
  `${Math.max(0, Number(amount) || 0).toLocaleString("vi-VN")}đ`;

export const formatCouponValue = (coupon) => {
  if (!coupon) {
    return "";
  }

  if (coupon.type === COUPON_TYPE.PERCENTAGE) {
    return `${coupon.value}%`;
  }

  return formatCouponDiscount(coupon.value);
};

export const getCouponSummary = (coupon) => {
  const usage = getCouponUsage(coupon?.code);

  return {
    ...clone(coupon),
    usageCount: usage.total,
  };
};
