/*
============================================================
SHIPPING SERVICE
NỘI DUNG 14 — SHIPPING / GIAO HOA
============================================================

NGUYÊN TẮC HIỆN TẠI

1. Điểm xuất phát của shop:
   40 Nguyễn Chí Thanh, Đà Nẵng.

2. Địa chỉ giao hàng của khách:
   - Tỉnh/thành phố
   - Phường/xã
   - Số nhà
   - Tên đường

3. Khoảng cách:
   - Geocode địa chỉ giao hàng.
   - Tính khoảng cách đường bộ từ shop tới khách.
   - Dùng OSRM để lấy khoảng cách lái xe.
   - Nếu OSRM không trả được tuyến thì dùng khoảng cách
     đường thẳng Haversine làm fallback.

4. Miễn phí:
   - subtotal >= 500.000đ
   HOẶC
   - khoảng cách < 7 km.

5. Nếu không được miễn phí:
   - Giao tiết kiệm: 20.000đ
   - Giao tiêu chuẩn: 30.000đ
   - Giao hỏa tốc: 50.000đ

6. Hiện tại chỉ hỗ trợ Đà Nẵng.
   Kiến trúc được tách riêng để sau này mở rộng toàn quốc.

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
};

/*
============================================================
SHIPPING CONFIG
============================================================
*/

export const SHIPPING_CONFIG = {
  /*
   * Ngưỡng miễn phí theo giá trị đơn hàng.
   */
  freeShippingThreshold: 500000,

  /*
   * Khoảng cách dưới 7 km được miễn phí.
   *
   * Lưu ý:
   * < 7 km mới miễn phí.
   * Đúng 7 km không được xem là miễn phí theo khoảng cách.
   */
  freeShippingDistanceKm: 7,

  /*
   * Phí của 3 hình thức giao hàng.
   */
  deliveryFees: {
    [DELIVERY_MODE.ECONOMY]: 20000,
    [DELIVERY_MODE.STANDARD]: 30000,
    [DELIVERY_MODE.EXPRESS]: 50000,
  },

  /*
   * Đà Nẵng là khu vực đang hỗ trợ.
   *
   * Sau này có thể thêm:
   *
   * deliveryProvinceKeywords: [
   *   "da nang",
   *   "hue",
   *   "quang nam",
   *   ...
   * ]
   */
  deliveryProvinceKeywords: ["da nang"],

  /*
   * Tối đa số ngày đặt trước.
   */
  maxAdvanceDays: 30,

  /*
   * Giao hỏa tốc chỉ giao trong ngày.
   */
  expressCutoffHour: 17,

  /*
   * Tối thiểu 120 phút để chuẩn bị giao hỏa tốc.
   */
  expressMinimumLeadMinutes: 120,

  /*
   * API geocoding.
   *
   * Photon:
   * - không cần API key
   * - dùng để chuyển địa chỉ thành tọa độ.
   */
  geocodingUrl: "https://photon.komoot.io/api/",

  /*
   * API routing.
   *
   * OSRM trả về khoảng cách đường bộ.
   */
  routingUrl: "https://router.project-osrm.org/route/v1/driving",

  /*
   * Timeout API.
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
      reason:
        "Hiện tại Flower Shop đang hỗ trợ giao hàng tại Đà Nẵng. Hệ thống được thiết kế để mở rộng thêm các tỉnh/thành phố trong giai đoạn tiếp theo.",
    };
  }

  /*
   * Không phân biệt Phường/Xã để tính phí.
   *
   * Tất cả địa chỉ thuộc Đà Nẵng hiện được xem là nội thành.
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
   * toàn bộ khung giờ đều có thể chọn.
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
      const slotStartMinutes = slot.startHour * 60;

      return (
        slotStartMinutes >
        currentMinutes + SHIPPING_CONFIG.expressMinimumLeadMinutes
      );
    });
  }

  /*
   * Tiêu chuẩn / tiết kiệm giao trong ngày.
   */
  return allSlots.filter((slot) => {
    const slotStartMinutes = slot.startHour * 60;

    return slotStartMinutes > currentMinutes + 30;
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
FETCH JSON WITH TIMEOUT
============================================================
*/

const fetchJsonWithTimeout = async (url) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, SHIPPING_CONFIG.requestTimeoutMs);

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
GEOCODE
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

const buildShopQuery = () => {
  return `${SHOP_LOCATION.address}, Việt Nam`;
};

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
      "Không xác định được vị trí của địa chỉ nhận hàng. Vui lòng kiểm tra lại số nhà và tên đường."
    );
  }

  return coordinates;
};

export const geocodeShop = async () => {
  const url =
    `${SHIPPING_CONFIG.geocodingUrl}` +
    `?q=${encodeURIComponent(buildShopQuery())}` +
    `&limit=1` +
    `&lang=vi`;

  const data = await fetchJsonWithTimeout(url);

  const coordinates = getCoordinatesFromPhoton(data);

  if (!coordinates) {
    throw new Error("Không xác định được vị trí của cửa hàng.");
  }

  return coordinates;
};

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
  const [shopCoordinates, customerCoordinates] = await Promise.all([
    geocodeShop(),
    geocodeAddress(address),
  ]);

  let distanceKm = null;
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
ASYNC SHIPPING CALCULATION
============================================================

Đây là hàm Checkout sử dụng.

Không dùng calculateShipping() đồng bộ
để tránh việc UI tính phí trước khi biết số km.
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
      message:
        `Chỉ có thể đặt giao hàng tối đa ` +
        `${SHIPPING_CONFIG.maxAdvanceDays} ngày.`,
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
   * Xác định khoảng cách.
   */
  let distanceResult;

  try {
    distanceResult = await calculateDeliveryDistance(address);
  } catch (distanceError) {
    console.error("Lỗi xác định khoảng cách giao hàng:", distanceError);

    return {
      success: false,
      message:
        distanceError?.message ||
        "Không thể xác định khoảng cách giao hàng. Vui lòng kiểm tra lại địa chỉ.",
      distanceAvailable: false,
    };
  }

  const distanceKm = Number(distanceResult.distanceKm) || 0;

  /*
   * MIỄN PHÍ:
   *
   * 1. Đơn >= 500.000đ
   * HOẶC
   * 2. Khoảng cách < 7km
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
     * Thông tin khoảng cách.
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
BACKWARD-COMPATIBLE SYNC FUNCTION
============================================================

Giữ lại export cũ để các file khác không bị lỗi import.

Lưu ý:
Hàm này chỉ dùng cho những trường hợp không cần
xác định khoảng cách.

Checkout phải dùng calculateShippingAsync().
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

  /*
   * Không thể xác định free-by-distance
   * trong hàm synchronous.
   *
   * Chỉ áp dụng free-by-order-value ở đây.
   */
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
    version: 2,

    zone: calculation.zone || "",

    zoneLabel: calculation.zoneLabel || "",

    shopAddress: calculation.shopAddress || SHOP_LOCATION.address,

    address: {
      ...(calculation.address || {}),
    },

    /*
     * Khoảng cách là dữ liệu snapshot quan trọng.
     */
    distanceKm: Number(calculation.distanceKm) || 0,

    distanceType: calculation.distanceType || "",

    shopCoordinates: calculation.shopCoordinates || null,

    customerCoordinates: calculation.customerCoordinates || null,

    /*
     * Hình thức giao.
     */
    deliveryMode: calculation.deliveryMode || "",

    deliveryModeLabel: calculation.deliveryModeLabel || "",

    deliveryDate: calculation.deliveryDate || "",

    deliveryTimeSlot: calculation.deliveryTimeSlot || "",

    deliveryTimeSlotLabel: calculation.deliveryTimeSlotLabel || "",

    /*
     * Phí.
     */
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
