/*
============================================================
SHIPPING SERVICE
NỘI DUNG 14 — SHIPPING / GIAO HOA
============================================================
*/

export const SHIPPING_ZONE = {
  INTRA_CITY: "intra_city",
  NON_DELIVERY: "non_delivery",
};

export const DELIVERY_MODE = {
  ECONOMY: "economy",
  STANDARD: "standard",
  EXPRESS: "express",
};

export const DELIVERY_MODE_LABELS = {
  [DELIVERY_MODE.ECONOMY]: "Giao tiết kiệm",
  [DELIVERY_MODE.STANDARD]: "Giao tiêu chuẩn",
  [DELIVERY_MODE.EXPRESS]: "Giao hỏa tốc",
};

/*
============================================================
SHOP LOCATION
============================================================
*/

export const SHOP_LOCATION = {
  name: "Flower Shop",

  address: "40 Nguyễn Chí Thanh, Đà Nẵng, Việt Nam",

  provinceName: "Đà Nẵng",

  /*
   * Tọa độ trung tâm dùng làm fallback.
   *
   * Khi routing API hoạt động, hệ thống sẽ dùng
   * tọa độ chính xác được cấu hình dưới đây.
   *
   * Đây là điểm xuất phát của shop.
   */
  latitude: 16.06778,
  longitude: 108.22083,
};

/*
============================================================
SHIPPING CONFIG
============================================================
*/

export const SHIPPING_CONFIG = {
  /*
   * Đơn từ 500.000đ miễn phí.
   */
  freeShippingThreshold: 500000,

  /*
   * Dưới 7 km miễn phí.
   *
   * Đúng 7 km KHÔNG thuộc diện miễn phí theo khoảng cách.
   */
  freeShippingDistanceKm: 7,

  /*
   * Phí 3 hình thức giao hàng.
   */
  deliveryFees: {
    [DELIVERY_MODE.ECONOMY]: 20000,
    [DELIVERY_MODE.STANDARD]: 30000,
    [DELIVERY_MODE.EXPRESS]: 50000,
  },

  /*
   * Hiện tại Đà Nẵng.
   *
   * Sau này có thể mở rộng:
   *
   * [
   *   "da nang",
   *   "hue",
   *   "ha noi",
   *   "ho chi minh",
   *   ...
   * ]
   */
  deliveryProvinceKeywords: ["da nang"],

  /*
   * Số ngày được đặt trước.
   */
  maxAdvanceDays: 30,

  /*
   * Giao hỏa tốc chỉ nhận trong ngày.
   */
  expressCutoffHour: 17,

  /*
   * Tối thiểu 120 phút chuẩn bị.
   */
  expressMinimumLeadMinutes: 120,

  /*
   * Photon geocoding.
   */
  geocodingUrl: "https://photon.komoot.io/api/",

  /*
   * OSRM routing.
   */
  routingUrl: "https://router.project-osrm.org/route/v1/driving",

  /*
   * Timeout.
   */
  requestTimeoutMs: 10000,

  /*
   * Khung giờ giao.
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
MONEY
============================================================
*/

export const formatShippingMoney = (value = 0) => {
  const amount = Number(value) || 0;

  return `${amount.toLocaleString("vi-VN")}đ`;
};

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

export const getTodayDateKey = () => {
  return formatDateKey(new Date());
};

export const addDaysToDateKey = (dateKey, days) => {
  const date = new Date(`${dateKey}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(date.getDate() + Number(days || 0));

  return formatDateKey(date);
};

export const getDefaultDeliveryDate = (
  deliveryMode = DELIVERY_MODE.STANDARD
) => {
  if (deliveryMode === DELIVERY_MODE.EXPRESS) {
    return getTodayDateKey();
  }

  if (deliveryMode === DELIVERY_MODE.ECONOMY) {
    return addDaysToDateKey(getTodayDateKey(), 2);
  }

  return addDaysToDateKey(getTodayDateKey(), 1);
};

export const getMaxDeliveryDate = () => {
  return addDaysToDateKey(getTodayDateKey(), SHIPPING_CONFIG.maxAdvanceDays);
};

/*
============================================================
ESTIMATED DELIVERY
============================================================
*/

export const getEstimatedDeliveryTime = (
  deliveryMode,
  deliveryDate,
  deliveryTimeSlot
) => {
  if (!deliveryDate) {
    return "";
  }

  const slot = SHIPPING_CONFIG.deliveryTimeSlots.find(
    (item) => String(item.id) === String(deliveryTimeSlot)
  );

  if (deliveryMode === DELIVERY_MODE.EXPRESS) {
    if (slot) {
      return `Trong ngày, ${slot.label}`;
    }

    return "Trong ngày";
  }

  if (deliveryMode === DELIVERY_MODE.ECONOMY) {
    if (slot) {
      return `Dự kiến trong 2 ngày, ${slot.label}`;
    }

    return "Dự kiến trong 2 ngày";
  }

  if (slot) {
    return `Dự kiến trong 1 ngày, ${slot.label}`;
  }

  return "Dự kiến trong 1 ngày";
};

/*
============================================================
ZONE
============================================================
*/

export const getShippingZone = (address = {}) => {
  const provinceName = normalizeText(address?.provinceName);

  if (!provinceName) {
    return {
      zone: SHIPPING_ZONE.NON_DELIVERY,

      label: "Chưa xác định khu vực giao hàng",

      available: false,

      reason: "Vui lòng chọn tỉnh/thành phố.",
    };
  }

  const supported = SHIPPING_CONFIG.deliveryProvinceKeywords.some((keyword) =>
    provinceName.includes(normalizeText(keyword))
  );

  if (!supported) {
    return {
      zone: SHIPPING_ZONE.NON_DELIVERY,

      label: "Ngoài khu vực giao hàng",

      available: false,

      reason: "Địa chỉ hiện chưa thuộc khu vực giao hàng.",
    };
  }

  /*
   * Tất cả Phường/Xã của Đà Nẵng
   * hiện được xem là nội thành.
   */
  return {
    zone: SHIPPING_ZONE.INTRA_CITY,

    label: "Nội thành Đà Nẵng",

    available: true,

    reason: "",
  };
};

/*
============================================================
DELIVERY FEE
============================================================
*/

export const getDeliveryModeFee = (deliveryMode) => {
  return Number(SHIPPING_CONFIG.deliveryFees?.[deliveryMode]) || 0;
};

/*
============================================================
TIME SLOT
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
   * Ngày tương lai:
   * toàn bộ khung giờ.
   */
  if (deliveryDate !== today) {
    return allSlots;
  }

  const currentHour = now.getHours();

  const currentMinute = now.getMinutes();

  const currentMinutes = currentHour * 60 + currentMinute;

  /*
   * Hỏa tốc.
   */
  if (deliveryMode === DELIVERY_MODE.EXPRESS) {
    if (currentHour >= SHIPPING_CONFIG.expressCutoffHour) {
      return [];
    }

    return allSlots.filter((slot) => {
      const startMinutes = slot.startHour * 60;

      return (
        startMinutes >
        currentMinutes + SHIPPING_CONFIG.expressMinimumLeadMinutes
      );
    });
  }

  /*
   * Tiêu chuẩn / tiết kiệm.
   */
  return allSlots.filter((slot) => {
    const startMinutes = slot.startHour * 60;

    return startMinutes > currentMinutes + 30;
  });
};

/*
============================================================
VALIDATE DELIVERY MODE
============================================================
*/

export const validateDeliveryMode = (
  deliveryMode,
  deliveryDate,
  now = new Date()
) => {
  if (!Object.values(DELIVERY_MODE).includes(deliveryMode)) {
    return {
      success: false,
      message: "Hình thức giao hàng không hợp lệ.",
    };
  }

  const today = formatDateKey(now);

  if (deliveryMode === DELIVERY_MODE.EXPRESS) {
    if (deliveryDate !== today) {
      return {
        success: false,
        message: "Giao hỏa tốc chỉ áp dụng cho hôm nay.",
      };
    }

    if (now.getHours() >= SHIPPING_CONFIG.expressCutoffHour) {
      return {
        success: false,
        message: "Đã quá giờ nhận đơn giao hỏa tốc hôm nay.",
      };
    }
  }

  return {
    success: true,
    message: "",
  };
};

/*
============================================================
FETCH JSON
============================================================
*/

const fetchJsonWithTimeout = async (url) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(
    () => controller.abort(),
    SHIPPING_CONFIG.requestTimeoutMs
  );

  try {
    const response = await fetch(url, {
      method: "GET",

      headers: {
        Accept: "application/json",
      },

      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Shipping API trả về HTTP ${response.status}.`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

/*
============================================================
ADDRESS QUERY
============================================================
*/

const buildAddressQuery = (address = {}) => {
  const parts = [
    address?.houseNumber,
    address?.street,
    address?.wardName,
    address?.provinceName,
    "Việt Nam",
  ].filter(Boolean);

  return parts.join(", ");
};

/*
============================================================
GEOCODING
============================================================
*/

const getCoordinatesFromPhoton = (data) => {
  const feature = data?.features?.[0];

  const coordinates = feature?.geometry?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return null;
  }

  const longitude = Number(coordinates[0]);

  const latitude = Number(coordinates[1]);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,

    displayName: feature?.properties?.name || feature?.properties?.street || "",
  };
};

export const geocodeAddress = async (address) => {
  const query = buildAddressQuery(address);

  if (!query) {
    throw new Error("Không có đủ thông tin địa chỉ để xác định vị trí.");
  }

  const url =
    `${SHIPPING_CONFIG.geocodingUrl}` +
    `?q=${encodeURIComponent(query)}` +
    `&limit=1` +
    `&lang=vi`;

  const data = await fetchJsonWithTimeout(url);

  const coordinates = getCoordinatesFromPhoton(data);

  if (!coordinates) {
    throw new Error(
      "Không xác định được vị trí địa chỉ nhận hàng. Vui lòng kiểm tra lại số nhà và tên đường."
    );
  }

  return coordinates;
};

/*
============================================================
SHOP COORDINATES
============================================================

Không gọi geocoding API cho shop nữa.
Điểm shop được cấu hình cố định.
============================================================
*/

export const getShopCoordinates = () => ({
  latitude: SHOP_LOCATION.latitude,

  longitude: SHOP_LOCATION.longitude,
});

/*
============================================================
HAVERSINE
============================================================
*/

const toRadians = (value) => {
  return (Number(value) * Math.PI) / 180;
};

export const calculateHaversineDistanceKm = (pointA, pointB) => {
  if (!pointA || !pointB) {
    return null;
  }

  const earthRadiusKm = 6371;

  const latitudeDifference = toRadians(
    Number(pointB.latitude) - Number(pointA.latitude)
  );

  const longitudeDifference = toRadians(
    Number(pointB.longitude) - Number(pointA.longitude)
  );

  const latitudeA = toRadians(Number(pointA.latitude));

  const latitudeB = toRadians(Number(pointB.latitude));

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

/*
============================================================
ROAD DISTANCE — OSRM
============================================================
*/

export const getRoadDistanceKm = async (
  shopCoordinates,
  customerCoordinates
) => {
  if (!shopCoordinates || !customerCoordinates) {
    throw new Error("Thiếu tọa độ để tính khoảng cách.");
  }

  const coordinates =
    `${shopCoordinates.longitude},${shopCoordinates.latitude};` +
    `${customerCoordinates.longitude},${customerCoordinates.latitude}`;

  const url =
    `${SHIPPING_CONFIG.routingUrl}/${coordinates}` +
    `?overview=false&alternatives=false&steps=false`;

  const data = await fetchJsonWithTimeout(url);

  const distanceMeters = Number(data?.routes?.[0]?.distance);

  if (!Number.isFinite(distanceMeters)) {
    throw new Error("Không xác định được khoảng cách đường bộ.");
  }

  return distanceMeters / 1000;
};

/*
============================================================
CALCULATE DISTANCE
============================================================
*/

export const calculateDeliveryDistance = async (address) => {
  /*
   * Shop dùng tọa độ cố định.
   * Chỉ geocode địa chỉ khách.
   */
  const shopCoordinates = getShopCoordinates();

  const customerCoordinates = await geocodeAddress(address);

  /*
   * Không khởi tạo null.
   *
   * Điều này cũng xử lý cảnh báo:
   * "The value assigned to distanceKm
   * is not used in subsequent statement".
   */
  let distanceKm;

  let distanceType = "road";

  try {
    distanceKm = await getRoadDistanceKm(shopCoordinates, customerCoordinates);
  } catch (routeError) {
    console.warn(
      "Không lấy được khoảng cách đường bộ, chuyển sang khoảng cách đường thẳng:",
      routeError
    );

    distanceKm = calculateHaversineDistanceKm(
      shopCoordinates,
      customerCoordinates
    );

    distanceType = "straight_line_fallback";
  }

  if (!Number.isFinite(distanceKm)) {
    throw new Error("Không thể xác định khoảng cách giao hàng.");
  }

  return {
    distanceKm: Number(distanceKm.toFixed(2)),

    distanceType,

    shopCoordinates,

    customerCoordinates,
  };
};

/*
============================================================
CALCULATE SHIPPING ASYNC
============================================================
*/

export const calculateShippingAsync = async ({
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

      shippingFee: 0,

      subtotal: normalizedSubtotal,

      total: normalizedSubtotal,
    };
  }

  if (!address?.houseNumber?.trim()) {
    return {
      success: false,
      message: "Vui lòng nhập số nhà.",
    };
  }

  if (!address?.street?.trim()) {
    return {
      success: false,
      message: "Vui lòng nhập tên đường.",
    };
  }

  if (!address?.wardCode || !address?.wardName) {
    return {
      success: false,
      message: "Vui lòng chọn phường/xã.",
    };
  }

  if (!deliveryDate) {
    return {
      success: false,
      message: "Vui lòng chọn ngày giao hàng.",
    };
  }

  const today = getTodayDateKey();

  const maxDate = getMaxDeliveryDate();

  if (deliveryDate < today) {
    return {
      success: false,
      message: "Ngày giao hàng không hợp lệ.",
    };
  }

  if (deliveryDate > maxDate) {
    return {
      success: false,
      message: `Chỉ có thể đặt giao hàng tối đa ${SHIPPING_CONFIG.maxAdvanceDays} ngày.`,
    };
  }

  const deliveryValidation = validateDeliveryMode(
    deliveryMode,
    deliveryDate,
    now
  );

  if (!deliveryValidation.success) {
    return {
      success: false,
      message: deliveryValidation.message,
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
    };
  }

  const slotAvailable = availableSlots.some(
    (slot) => String(slot.id) === String(selectedSlot.id)
  );

  if (!slotAvailable) {
    return {
      success: false,
      message:
        "Khung giờ giao hàng đã qua hoặc không còn phù hợp với hình thức giao đã chọn.",
    };
  }

  /*
   * Tính khoảng cách.
   */
  let distanceResult;

  try {
    distanceResult = await calculateDeliveryDistance(address);
  } catch (distanceError) {
    console.error("Lỗi xác định khoảng cách giao hàng:", distanceError);

    return {
      success: false,

      message:
        distanceError?.message || "Không thể xác định khoảng cách giao hàng.",

      distanceAvailable: false,
    };
  }

  const distanceKm = Number(distanceResult.distanceKm) || 0;

  /*
   * Miễn phí:
   *
   * - đơn >= 500.000đ
   * HOẶC
   * - khoảng cách < 7 km
   */
  const freeBySubtotal =
    normalizedSubtotal >= SHIPPING_CONFIG.freeShippingThreshold;

  const freeByDistance = distanceKm < SHIPPING_CONFIG.freeShippingDistanceKm;

  const freeShippingApplied = freeBySubtotal || freeByDistance;

  const originalDeliveryFee = getDeliveryModeFee(deliveryMode);

  const shippingFee = freeShippingApplied ? 0 : originalDeliveryFee;

  let freeShippingReason = "";

  if (freeBySubtotal && freeByDistance) {
    freeShippingReason =
      "Miễn phí do đơn hàng từ 500.000đ và khoảng cách dưới 7 km.";
  } else if (freeBySubtotal) {
    freeShippingReason = "Miễn phí do đơn hàng từ 500.000đ.";
  } else if (freeByDistance) {
    freeShippingReason = "Miễn phí do khoảng cách giao hàng dưới 7 km.";
  }

  const total = normalizedSubtotal + shippingFee;

  const estimatedDeliveryTime = getEstimatedDeliveryTime(
    deliveryMode,
    deliveryDate,
    selectedSlot.id
  );

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

    /*
     * Khoảng cách.
     */
    distanceKm,

    distanceType: distanceResult.distanceType,

    shopAddress: SHOP_LOCATION.address,

    shopCoordinates: distanceResult.shopCoordinates,

    customerCoordinates: distanceResult.customerCoordinates,

    /*
     * Giao hàng.
     */
    deliveryMode,

    deliveryModeLabel: DELIVERY_MODE_LABELS[deliveryMode],

    deliveryDate,

    deliveryTimeSlot: selectedSlot.id,

    deliveryTimeSlotLabel: selectedSlot.label,

    estimatedDeliveryTime,

    /*
     * Phí.
     */
    originalDeliveryFee,

    deliveryFee: originalDeliveryFee,

    shippingFee,

    freeShippingApplied,

    freeShippingReason,

    freeShippingThreshold: SHIPPING_CONFIG.freeShippingThreshold,

    freeShippingDistanceKm: SHIPPING_CONFIG.freeShippingDistanceKm,

    subtotal: normalizedSubtotal,

    total,

    deliveryNote: String(deliveryNote || "").trim(),

    calculatedAt: new Date(now).toISOString(),
  };
};

/*
============================================================
BACKWARD COMPATIBLE SYNC FUNCTION
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

      shippingFee: 0,

      subtotal: normalizedSubtotal,

      total: normalizedSubtotal,
    };
  }

  const deliveryFee = getDeliveryModeFee(deliveryMode);

  const freeShippingApplied =
    normalizedSubtotal >= SHIPPING_CONFIG.freeShippingThreshold;

  const shippingFee = freeShippingApplied ? 0 : deliveryFee;

  const selectedSlot = getSlotById(deliveryTimeSlot);

  return {
    success: Boolean(deliveryDate && selectedSlot),

    message: !deliveryDate
      ? "Vui lòng chọn ngày giao hàng."
      : !selectedSlot
        ? "Vui lòng chọn khung giờ giao hàng."
        : "",

    zone: zoneResult.zone,

    zoneLabel: zoneResult.label,

    deliveryMode,

    deliveryModeLabel: DELIVERY_MODE_LABELS[deliveryMode],

    deliveryDate,

    deliveryTimeSlot: selectedSlot?.id || "",

    deliveryTimeSlotLabel: selectedSlot?.label || "",

    originalDeliveryFee: deliveryFee,

    deliveryFee,

    shippingFee,

    freeShippingApplied,

    freeShippingReason: freeShippingApplied
      ? "Miễn phí do đơn hàng từ 500.000đ."
      : "",

    subtotal: normalizedSubtotal,

    total: normalizedSubtotal + shippingFee,

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
    version: 3,

    zone: calculation.zone || "",

    zoneLabel: calculation.zoneLabel || "",

    shopAddress: calculation.shopAddress || SHOP_LOCATION.address,

    address: {
      ...(calculation.address || {}),
    },

    distanceKm: Number(calculation.distanceKm) || 0,

    distanceType: calculation.distanceType || "",

    shopCoordinates: calculation.shopCoordinates || null,

    customerCoordinates: calculation.customerCoordinates || null,

    deliveryMode: calculation.deliveryMode || "",

    deliveryModeLabel: calculation.deliveryModeLabel || "",

    deliveryDate: calculation.deliveryDate || "",

    deliveryTimeSlot: calculation.deliveryTimeSlot || "",

    deliveryTimeSlotLabel: calculation.deliveryTimeSlotLabel || "",

    estimatedDeliveryTime: calculation.estimatedDeliveryTime || "",

    originalDeliveryFee: Number(calculation.originalDeliveryFee) || 0,

    deliveryFee: Number(calculation.deliveryFee) || 0,

    shippingFee: Number(calculation.shippingFee) || 0,

    freeShippingApplied: Boolean(calculation.freeShippingApplied),

    freeShippingReason: calculation.freeShippingReason || "",

    freeShippingThreshold:
      Number(calculation.freeShippingThreshold) ||
      SHIPPING_CONFIG.freeShippingThreshold,

    freeShippingDistanceKm:
      Number(calculation.freeShippingDistanceKm) ||
      SHIPPING_CONFIG.freeShippingDistanceKm,

    subtotal: Number(calculation.subtotal) || 0,

    total: Number(calculation.total) || 0,

    deliveryNote: calculation.deliveryNote || "",

    calculatedAt: calculation.calculatedAt || new Date().toISOString(),
  };
};
