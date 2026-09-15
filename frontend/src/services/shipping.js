/*
============================================================
SHIPPING SERVICE
NỘI DUNG 14 — SHIPPING / GIAO HOA
============================================================

Nguồn sự thật cho:

- Phí giao hàng
- Miễn phí giao hàng
- Ngưỡng miễn phí
- Khu vực giao hàng
- Nội thành
- Ngoại thành
- Khu vực không giao
- Same-day delivery
- Delivery date
- Delivery time slot
- Giao hỏa tốc
- Phụ phí
- Tính phí trước khi đặt
- Shipping snapshot trong Order

QUAN TRỌNG:

Tất cả cấu hình phí nằm ở SHIPPING_CONFIG.

Sau này nếu thay đổi phí chỉ cần sửa file này.
============================================================
*/

export const SHIPPING_ZONE = {
  INTRA_CITY: "intra_city",
  SUBURBAN: "suburban",
  NON_DELIVERY: "non_delivery",
};

export const DELIVERY_MODE = {
  STANDARD: "standard",
  SAME_DAY: "same_day",
  EXPRESS: "express",
};

export const DELIVERY_MODE_LABELS = {
  [DELIVERY_MODE.STANDARD]: "Giao tiêu chuẩn",
  [DELIVERY_MODE.SAME_DAY]: "Giao trong ngày",
  [DELIVERY_MODE.EXPRESS]: "Giao hỏa tốc",
};

/*
============================================================
CẤU HÌNH SHIPPING
============================================================
*/

export const SHIPPING_CONFIG = {
  /*
   * Phí cơ bản
   */
  intraCityFee: 30000,

  suburbanFee: 50000,

  /*
   * Miễn phí giao hàng khi subtotal đạt ngưỡng.
   *
   * Chỉ miễn phí PHÍ GIAO CƠ BẢN.
   * Phụ phí same-day / express vẫn được tính.
   */
  freeShippingThreshold: 500000,

  /*
   * Phụ phí dịch vụ
   */
  sameDaySurcharge: 20000,

  expressSurcharge: 40000,

  /*
   * Same-day cutoff:
   *
   * Sau 15:00 không nhận giao trong ngày.
   */
  sameDayCutoffHour: 15,

  /*
   * Hỏa tốc:
   *
   * Sau 17:00 không nhận hỏa tốc.
   */
  expressCutoffHour: 17,

  /*
   * Hỏa tốc yêu cầu tối thiểu số phút chuẩn bị.
   */
  expressMinimumLeadMinutes: 120,

  /*
   * Số ngày tối đa cho phép đặt trước.
   */
  maxAdvanceDays: 30,

  /*
   * Các tỉnh/thành ngoài Đà Nẵng không thuộc vùng giao.
   */
  deliveryProvinceKeywords: ["da nang"],

  /*
   * Các phường/xã không giao.
   *
   * Để trống mặc định.
   *
   * Khi cần chặn khu vực cụ thể chỉ cần thêm tên
   * đã chuẩn hóa vào mảng này.
   *
   * Ví dụ:
   *
   * blockedWardKeywords: [
   *   "hoang sa",
   * ],
   */
  blockedWardKeywords: [],

  /*
   * Khung giờ giao hàng.
   */
  deliveryTimeSlots: [
    {
      id: "08-10",
      label: "08:00 - 10:00",
      startHour: 8,
      endHour: 10,
    },
    {
      id: "10-12",
      label: "10:00 - 12:00",
      startHour: 10,
      endHour: 12,
    },
    {
      id: "13-15",
      label: "13:00 - 15:00",
      startHour: 13,
      endHour: 15,
    },
    {
      id: "15-17",
      label: "15:00 - 17:00",
      startHour: 15,
      endHour: 17,
    },
    {
      id: "17-19",
      label: "17:00 - 19:00",
      startHour: 17,
      endHour: 19,
    },
    {
      id: "19-21",
      label: "19:00 - 21:00",
      startHour: 19,
      endHour: 21,
    },
  ],
};

/*
============================================================
TEXT
============================================================
*/

const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/*
============================================================
DATE
============================================================
*/

export const formatDateKey = (date) => {
  const target = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(target.getTime())) {
    return "";
  }

  const year = target.getFullYear();

  const month = String(target.getMonth() + 1).padStart(2, "0");

  const day = String(target.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getTodayDateKey = () => formatDateKey(new Date());

export const addDaysToDateKey = (dateKey, days) => {
  const date = new Date(`${dateKey}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(date.getDate() + Number(days || 0));

  return formatDateKey(date);
};

export const getDefaultDeliveryDate = () => {
  return addDaysToDateKey(getTodayDateKey(), 1);
};

export const getMaxDeliveryDate = () => {
  return addDaysToDateKey(getTodayDateKey(), SHIPPING_CONFIG.maxAdvanceDays);
};

export const isToday = (dateKey) => {
  return String(dateKey || "") === getTodayDateKey();
};

/*
============================================================
KHU VỰC GIAO
============================================================
*/

export const getShippingZone = (address = {}) => {
  const provinceName = normalizeText(address?.provinceName);

  const wardName = normalizeText(address?.wardName);

  if (!provinceName || !wardName) {
    return {
      zone: SHIPPING_ZONE.NON_DELIVERY,
      label: "Chưa xác định khu vực giao hàng",
      available: false,
      reason: "Vui lòng chọn tỉnh/thành phố và phường/xã.",
    };
  }

  const isSupportedProvince = SHIPPING_CONFIG.deliveryProvinceKeywords.some(
    (keyword) => provinceName.includes(normalizeText(keyword))
  );

  if (!isSupportedProvince) {
    return {
      zone: SHIPPING_ZONE.NON_DELIVERY,
      label: "Ngoài khu vực giao hàng",
      available: false,
      reason:
        "Hiện tại Flower Shop chỉ hỗ trợ giao hàng trong khu vực Đà Nẵng.",
    };
  }

  const isBlocked = SHIPPING_CONFIG.blockedWardKeywords.some((keyword) =>
    wardName.includes(normalizeText(keyword))
  );

  if (isBlocked) {
    return {
      zone: SHIPPING_ZONE.NON_DELIVERY,
      label: "Khu vực không giao",
      available: false,
      reason:
        "Địa chỉ này hiện nằm trong khu vực Flower Shop chưa hỗ trợ giao hàng.",
    };
  }

  /*
   * Quy ước hiện tại:
   *
   * Phường → Nội thành
   * Xã → Ngoại thành
   *
   * Nếu dữ liệu không có tiền tố rõ ràng,
   * mặc định vào Ngoại thành để tránh tính thiếu phí.
   */

  if (wardName.startsWith("phuong ")) {
    return {
      zone: SHIPPING_ZONE.INTRA_CITY,
      label: "Nội thành",
      available: true,
      reason: "",
    };
  }

  if (wardName.startsWith("xa ")) {
    return {
      zone: SHIPPING_ZONE.SUBURBAN,
      label: "Ngoại thành",
      available: true,
      reason: "",
    };
  }

  return {
    zone: SHIPPING_ZONE.SUBURBAN,
    label: "Ngoại thành",
    available: true,
    reason: "",
  };
};

/*
============================================================
PHÍ GIAO CƠ BẢN
============================================================
*/

export const getBaseShippingFee = (zone) => {
  if (zone === SHIPPING_ZONE.INTRA_CITY) {
    return SHIPPING_CONFIG.intraCityFee;
  }

  if (zone === SHIPPING_ZONE.SUBURBAN) {
    return SHIPPING_CONFIG.suburbanFee;
  }

  return 0;
};

/*
============================================================
PHỤ PHÍ
============================================================
*/

export const getDeliveryModeSurcharge = (deliveryMode) => {
  if (deliveryMode === DELIVERY_MODE.SAME_DAY) {
    return SHIPPING_CONFIG.sameDaySurcharge;
  }

  if (deliveryMode === DELIVERY_MODE.EXPRESS) {
    return SHIPPING_CONFIG.expressSurcharge;
  }

  return 0;
};

/*
============================================================
KHUNG GIỜ
============================================================
*/

const getSlotById = (slotId) => {
  return (
    SHIPPING_CONFIG.deliveryTimeSlots.find(
      (slot) => String(slot.id) === String(slotId)
    ) || null
  );
};

export const getAvailableDeliveryTimeSlots = (
  deliveryDate,
  deliveryMode = DELIVERY_MODE.STANDARD,
  now = new Date()
) => {
  const allSlots = SHIPPING_CONFIG.deliveryTimeSlots;

  if (!deliveryDate) {
    return [];
  }

  const today = formatDateKey(now);

  /*
   * Nếu không giao hôm nay:
   * toàn bộ khung giờ đều có thể chọn.
   */
  if (deliveryDate !== today) {
    return allSlots;
  }

  const currentHour = now.getHours();

  const currentMinute = now.getMinutes();

  const currentMinutes = currentHour * 60 + currentMinute;

  if (deliveryMode === DELIVERY_MODE.SAME_DAY) {
    if (currentHour >= SHIPPING_CONFIG.sameDayCutoffHour) {
      return [];
    }

    return allSlots.filter((slot) => {
      const slotStartMinutes = slot.startHour * 60;

      return slotStartMinutes > currentMinutes + 60;
    });
  }

  if (deliveryMode === DELIVERY_MODE.EXPRESS) {
    if (currentHour >= SHIPPING_CONFIG.expressCutoffHour) {
      return [];
    }

    return allSlots.filter((slot) => {
      const slotStartMinutes = slot.startHour * 60;

      return (
        slotStartMinutes >
        currentMinutes + SHIPPING_CONFIG.expressMinimumLeadMinutes
      );
    });
  }

  /*
   * Giao tiêu chuẩn trong ngày.
   */
  return allSlots.filter((slot) => {
    const slotStartMinutes = slot.startHour * 60;

    return slotStartMinutes > currentMinutes + 30;
  });
};

/*
============================================================
KIỂM TRA DELIVERY MODE
============================================================
*/

export const validateDeliveryMode = (
  deliveryMode,
  deliveryDate,
  now = new Date()
) => {
  if (deliveryMode === DELIVERY_MODE.STANDARD) {
    return {
      success: true,
      message: "",
    };
  }

  const today = formatDateKey(now);

  if (deliveryDate !== today) {
    return {
      success: false,
      message:
        deliveryMode === DELIVERY_MODE.SAME_DAY
          ? "Giao trong ngày chỉ áp dụng cho hôm nay."
          : "Giao hỏa tốc chỉ áp dụng cho hôm nay.",
    };
  }

  const currentHour = now.getHours();

  if (
    deliveryMode === DELIVERY_MODE.SAME_DAY &&
    currentHour >= SHIPPING_CONFIG.sameDayCutoffHour
  ) {
    return {
      success: false,
      message: "Đã quá giờ nhận đơn giao trong ngày hôm nay.",
    };
  }

  if (
    deliveryMode === DELIVERY_MODE.EXPRESS &&
    currentHour >= SHIPPING_CONFIG.expressCutoffHour
  ) {
    return {
      success: false,
      message: "Đã quá giờ nhận đơn giao hỏa tốc hôm nay.",
    };
  }

  return {
    success: true,
    message: "",
  };
};

/*
============================================================
TÍNH PHÍ SHIPPING
============================================================
*/

export const calculateShipping = ({
  address = {},
  subtotal = 0,
  deliveryDate = "",
  deliveryTimeSlot = "",
  deliveryMode = DELIVERY_MODE.STANDARD,
  deliveryNote = "",
  now = new Date(),
} = {}) => {
  const normalizedSubtotal = Math.max(0, Number(subtotal) || 0);

  const zoneResult = getShippingZone(address);

  if (!zoneResult.available) {
    return {
      success: false,
      message: zoneResult.reason,
      zone: zoneResult.zone,
      zoneLabel: zoneResult.label,
      baseFee: 0,
      surcharge: 0,
      shippingFee: 0,
      freeShippingApplied: false,
      freeShippingThreshold: SHIPPING_CONFIG.freeShippingThreshold,
      subtotal: normalizedSubtotal,
      total: normalizedSubtotal,
    };
  }

  if (!deliveryDate) {
    return {
      success: false,
      message: "Vui lòng chọn ngày giao hàng.",
      zone: zoneResult.zone,
      zoneLabel: zoneResult.label,
      baseFee: 0,
      surcharge: 0,
      shippingFee: 0,
      freeShippingApplied: false,
      freeShippingThreshold: SHIPPING_CONFIG.freeShippingThreshold,
      subtotal: normalizedSubtotal,
      total: normalizedSubtotal,
    };
  }

  const today = getTodayDateKey();

  const maxDate = getMaxDeliveryDate();

  if (deliveryDate < today) {
    return {
      success: false,
      message: "Ngày giao hàng không hợp lệ.",
      zone: zoneResult.zone,
      zoneLabel: zoneResult.label,
    };
  }

  if (deliveryDate > maxDate) {
    return {
      success: false,
      message: `Chỉ có thể đặt giao hàng tối đa ${SHIPPING_CONFIG.maxAdvanceDays} ngày.`,
      zone: zoneResult.zone,
      zoneLabel: zoneResult.label,
    };
  }

  const deliveryModeValidation = validateDeliveryMode(
    deliveryMode,
    deliveryDate,
    now
  );

  if (!deliveryModeValidation.success) {
    return {
      success: false,
      message: deliveryModeValidation.message,
      zone: zoneResult.zone,
      zoneLabel: zoneResult.label,
    };
  }

  const availableSlots = getAvailableDeliveryTimeSlots(
    deliveryDate,
    deliveryMode,
    now
  );

  const selectedSlot = getSlotById(deliveryTimeSlot);

  if (!selectedSlot) {
    return {
      success: false,
      message: "Vui lòng chọn khung giờ giao hàng.",
      zone: zoneResult.zone,
      zoneLabel: zoneResult.label,
    };
  }

  const slotIsAvailable = availableSlots.some(
    (slot) => String(slot.id) === String(selectedSlot.id)
  );

  if (!slotIsAvailable) {
    return {
      success: false,
      message:
        "Khung giờ giao hàng đã qua hoặc không còn phù hợp với hình thức giao đã chọn.",
      zone: zoneResult.zone,
      zoneLabel: zoneResult.label,
    };
  }

  const originalBaseFee = getBaseShippingFee(zoneResult.zone);

  const freeShippingApplied =
    normalizedSubtotal >= SHIPPING_CONFIG.freeShippingThreshold;

  const baseFee = freeShippingApplied ? 0 : originalBaseFee;

  const surcharge = getDeliveryModeSurcharge(deliveryMode);

  const shippingFee = baseFee + surcharge;

  const total = normalizedSubtotal + shippingFee;

  return {
    success: true,

    zone: zoneResult.zone,

    zoneLabel: zoneResult.label,

    address: {
      provinceCode: address?.provinceCode || "",
      provinceName: address?.provinceName || "",
      wardCode: address?.wardCode || "",
      wardName: address?.wardName || "",
      houseNumber: address?.houseNumber || "",
      street: address?.street || "",
    },

    deliveryMode,

    deliveryModeLabel:
      DELIVERY_MODE_LABELS[deliveryMode] ||
      DELIVERY_MODE_LABELS[DELIVERY_MODE.STANDARD],

    deliveryDate,

    deliveryTimeSlot: selectedSlot.id,

    deliveryTimeSlotLabel: selectedSlot.label,

    baseFee,

    originalBaseFee,

    surcharge,

    shippingFee,

    freeShippingApplied,

    freeShippingThreshold: SHIPPING_CONFIG.freeShippingThreshold,

    subtotal: normalizedSubtotal,

    total,

    deliveryNote: String(deliveryNote || "").trim(),

    calculatedAt: new Date(now).toISOString(),
  };
};

/*
============================================================
SHIPPING SNAPSHOT
============================================================
*/

export const createShippingSnapshot = (calculation) => {
  if (!calculation?.success) {
    return null;
  }

  return {
    version: 1,

    zone: calculation.zone,

    zoneLabel: calculation.zoneLabel,

    address: {
      ...calculation.address,
    },

    deliveryMode: calculation.deliveryMode,

    deliveryModeLabel: calculation.deliveryModeLabel,

    deliveryDate: calculation.deliveryDate,

    deliveryTimeSlot: calculation.deliveryTimeSlot,

    deliveryTimeSlotLabel: calculation.deliveryTimeSlotLabel,

    baseFee: calculation.baseFee,

    originalBaseFee: calculation.originalBaseFee,

    surcharge: calculation.surcharge,

    shippingFee: calculation.shippingFee,

    freeShippingApplied: calculation.freeShippingApplied,

    freeShippingThreshold: calculation.freeShippingThreshold,

    subtotal: calculation.subtotal,

    total: calculation.total,

    deliveryNote: calculation.deliveryNote,

    calculatedAt: calculation.calculatedAt,
  };
};

/*
============================================================
FORMAT TIỀN
============================================================
*/

export const formatShippingMoney = (value) => {
  return `${Number(value || 0).toLocaleString("vi-VN")} ₫`;
};
