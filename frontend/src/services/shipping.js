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

export const SHOP_LOCATION = {
  name: "Flower Shop",

  address: "40 Nguyễn Chí Thanh, phường Hải Châu, thành phố Đà Nẵng",

  provinceCode: "48",

  provinceName: "Đà Nẵng",

  /*
   * Tọa độ fallback.
   * Hệ thống ưu tiên geocode địa chỉ shop.
   */
  latitude: 16.06778,

  longitude: 108.22083,
};

export const SHIPPING_CONFIG = {
  freeShippingThreshold: 500000,

  freeShippingDistanceKm: 7,

  deliveryFees: {
    [DELIVERY_MODE.ECONOMY]: 20000,
    [DELIVERY_MODE.STANDARD]: 30000,
    [DELIVERY_MODE.EXPRESS]: 50000,
  },

  deliveryProvinces: [
    {
      code: "48",
      keywords: ["da nang"],
    },
  ],

  deliveryProvinceKeywords: ["da nang"],

  /*
   * Tất cả hình thức đều giao trong ngày.
   */
  sameDayDelivery: true,

  /*
   * Sau 18:00 không nhận hỏa tốc.
   */
  expressCutoffHour: 18,

  /*
   * Hỏa tốc cần tối thiểu 2 giờ chuẩn bị.
   */
  expressMinimumLeadMinutes: 120,

  /*
   * Tiêu chuẩn nhanh hơn tiết kiệm.
   */
  standardMinimumLeadMinutes: 120,

  /*
   * Tiết kiệm có thời gian chuẩn bị dài hơn.
   */
  economyMinimumLeadMinutes: 180,

  geocodingUrl: "https://photon.komoot.io/api/",

  fallbackGeocodingUrl: "https://nominatim.openstreetmap.org/search",

  routingUrl: "https://router.project-osrm.org/route/v1/driving",

  requestTimeoutMs: 10000,

  geocodingLimit: 5,

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
    .replace(/\s+/g, " ")
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

  return [
    target.getFullYear(),
    String(target.getMonth() + 1).padStart(2, "0"),
    String(target.getDate()).padStart(2, "0"),
  ].join("-");
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

/*
 * Tất cả hình thức đều giao trong ngày.
 */
export const getDefaultDeliveryDate = () => getTodayDateKey();

export const getMaxDeliveryDate = () => getTodayDateKey();

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

  const slotText = slot?.label || "trong ngày";

  if (deliveryMode === DELIVERY_MODE.EXPRESS) {
    return `Trong khoảng 1 - 2 giờ, ${slotText}`;
  }

  if (deliveryMode === DELIVERY_MODE.STANDARD) {
    return `Trong khoảng 2 - 4 giờ, ${slotText}`;
  }

  return `Trong khoảng 4 - 6 giờ, ${slotText}`;
};

/*
============================================================
ZONE
============================================================
*/

const isDaNangAddress = (address = {}) => {
  const provinceCode = String(address?.provinceCode || "").trim();

  const provinceName = normalizeText(address?.provinceName);

  return (
    provinceCode === "48" ||
    provinceName === "da nang" ||
    provinceName.includes("da nang")
  );
};

const findSupportedProvince = (address = {}) => {
  const provinceCode = String(address?.provinceCode || "").trim();

  const provinceName = normalizeText(address?.provinceName);

  return (
    SHIPPING_CONFIG.deliveryProvinces.find((province) => {
      if (provinceCode && String(province.code) === provinceCode) {
        return true;
      }

      return province.keywords.some((keyword) =>
        provinceName.includes(normalizeText(keyword))
      );
    }) || null
  );
};

export const getShippingZone = (address = {}) => {
  if (!address?.provinceCode && !address?.provinceName) {
    return {
      zone: SHIPPING_ZONE.NON_DELIVERY,

      label: "Chưa xác định khu vực giao hàng",

      available: false,

      reason: "Vui lòng chọn tỉnh/thành phố.",
    };
  }

  /*
   * Đà Nẵng:
   * mọi phường/xã đều nội thành.
   */
  if (isDaNangAddress(address)) {
    return {
      zone: SHIPPING_ZONE.INTRA_CITY,

      label: "Nội thành Đà Nẵng",

      available: true,

      reason: "",
    };
  }

  const supportedProvince = findSupportedProvince(address);

  if (supportedProvince) {
    return {
      zone: SHIPPING_ZONE.INTRA_CITY,

      label: address?.provinceName || "Khu vực giao hàng",

      available: true,

      reason: "",
    };
  }

  return {
    zone: SHIPPING_ZONE.NON_DELIVERY,

    label: "Ngoài khu vực giao hàng",

    available: false,

    reason: "Địa chỉ hiện chưa thuộc khu vực giao hàng.",
  };
};

/*
============================================================
DELIVERY FEE
============================================================
*/

export const getDeliveryModeFee = (deliveryMode) =>
  Number(SHIPPING_CONFIG.deliveryFees?.[deliveryMode]) || 0;

/*
============================================================
TIME SLOT
============================================================
*/

const getSlotById = (slotId) =>
  SHIPPING_CONFIG.deliveryTimeSlots.find(
    (slot) => String(slot.id) === String(slotId)
  ) || null;

const getModeMinimumLeadMinutes = (deliveryMode) => {
  if (deliveryMode === DELIVERY_MODE.EXPRESS) {
    return SHIPPING_CONFIG.expressMinimumLeadMinutes;
  }

  if (deliveryMode === DELIVERY_MODE.ECONOMY) {
    return SHIPPING_CONFIG.economyMinimumLeadMinutes;
  }

  return SHIPPING_CONFIG.standardMinimumLeadMinutes;
};

export const getAvailableDeliveryTimeSlots = (
  deliveryDate,
  deliveryMode = DELIVERY_MODE.STANDARD,
  now = new Date()
) => {
  if (!deliveryDate) {
    return [];
  }

  const today = formatDateKey(now);

  /*
   * Tất cả hình thức chỉ giao trong ngày.
   */
  if (deliveryDate !== today) {
    return [];
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  /*
   * Sau 18h hỏa tốc không còn slot.
   */
  if (
    deliveryMode === DELIVERY_MODE.EXPRESS &&
    now.getHours() >= SHIPPING_CONFIG.expressCutoffHour
  ) {
    return [];
  }

  const minimumLead = getModeMinimumLeadMinutes(deliveryMode);

  /*
   * Tìm các khung giờ còn đủ thời gian
   * để shop chuẩn bị.
   */
  return SHIPPING_CONFIG.deliveryTimeSlots.filter((slot) => {
    const slotStart = slot.startHour * 60;

    return slotStart >= currentMinutes + minimumLead;
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

  if (deliveryDate !== formatDateKey(now)) {
    return {
      success: false,
      message: "Các hình thức giao hàng hiện chỉ áp dụng trong ngày hôm nay.",
    };
  }

  if (
    deliveryMode === DELIVERY_MODE.EXPRESS &&
    now.getHours() >= SHIPPING_CONFIG.expressCutoffHour
  ) {
    return {
      success: false,

      message: "Giao hỏa tốc không còn áp dụng sau 18:00.",
    };
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
GEOCODING
============================================================
*/

const getAddressParts = (address = {}) => ({
  houseNumber: String(address?.houseNumber || "").trim(),

  street: String(address?.street || "").trim(),

  wardName: String(address?.wardName || "").trim(),

  provinceName: String(address?.provinceName || "Đà Nẵng").trim(),
});

const buildAddressQueries = (address = {}) => {
  const { houseNumber, street, wardName, provinceName } =
    getAddressParts(address);

  const queries = [];

  if (houseNumber && street && wardName) {
    queries.push(
      `${houseNumber} ${street}, ${wardName}, ${provinceName}, Việt Nam`
    );
  }

  if (houseNumber && street) {
    queries.push(`${houseNumber} ${street}, ${provinceName}, Việt Nam`);
  }

  if (street && wardName) {
    queries.push(`${street}, ${wardName}, ${provinceName}, Việt Nam`);
  }

  if (street) {
    queries.push(`${street}, ${provinceName}, Việt Nam`);
  }

  return [...new Set(queries.filter(Boolean))];
};

const isValidCoordinate = (latitude, longitude) =>
  Number.isFinite(Number(latitude)) &&
  Number.isFinite(Number(longitude)) &&
  Number(latitude) >= -90 &&
  Number(latitude) <= 90 &&
  Number(longitude) >= -180 &&
  Number(longitude) <= 180;

const isCoordinateInDaNang = (latitude, longitude) => {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (!isValidCoordinate(lat, lon)) {
    return false;
  }

  /*
   * Bounding box rộng của Đà Nẵng.
   */
  return lat >= 15.7 && lat <= 16.5 && lon >= 107.7 && lon <= 108.6;
};

const getPhotonCoordinates = (data) => {
  const features = Array.isArray(data?.features) ? data.features : [];

  for (const feature of features) {
    const coordinates = feature?.geometry?.coordinates;

    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      continue;
    }

    const longitude = Number(coordinates[0]);

    const latitude = Number(coordinates[1]);

    if (!isCoordinateInDaNang(latitude, longitude)) {
      continue;
    }

    return {
      latitude,
      longitude,
      displayName:
        feature?.properties?.name || feature?.properties?.street || "",
    };
  }

  return null;
};

const getNominatimCoordinates = (data) => {
  if (!Array.isArray(data)) {
    return null;
  }

  for (const result of data) {
    const latitude = Number(result?.lat);

    const longitude = Number(result?.lon);

    if (!isCoordinateInDaNang(latitude, longitude)) {
      continue;
    }

    return {
      latitude,
      longitude,
      displayName: result?.display_name || "",
    };
  }

  return null;
};

const geocodeWithPhoton = async (query) => {
  const url =
    `${SHIPPING_CONFIG.geocodingUrl}` +
    `?q=${encodeURIComponent(query)}` +
    `&limit=${SHIPPING_CONFIG.geocodingLimit}` +
    `&lang=vi`;

  const data = await fetchJsonWithTimeout(url);

  return getPhotonCoordinates(data);
};

const geocodeWithNominatim = async (query) => {
  const url =
    `${SHIPPING_CONFIG.fallbackGeocodingUrl}` +
    `?format=jsonv2` +
    `&addressdetails=1` +
    `&limit=${SHIPPING_CONFIG.geocodingLimit}` +
    `&countrycodes=vn` +
    `&q=${encodeURIComponent(query)}`;

  const data = await fetchJsonWithTimeout(url);

  return getNominatimCoordinates(data);
};

export const geocodeAddress = async (address) => {
  const queries = buildAddressQueries(address);

  if (!queries.length) {
    throw new Error("Vui lòng nhập đầy đủ địa chỉ để xác định khoảng cách.");
  }

  let lastError = null;

  for (const query of queries) {
    try {
      const result = await geocodeWithPhoton(query);

      if (result) {
        return result;
      }
    } catch (error) {
      lastError = error;
    }
  }

  for (const query of queries) {
    try {
      const result = await geocodeWithNominatim(query);

      if (result) {
        return result;
      }
    } catch (error) {
      lastError = error;
    }
  }

  console.error("Không thể geocode địa chỉ:", lastError);

  throw new Error(
    "Không xác định được vị trí địa chỉ nhận hàng. Vui lòng kiểm tra lại số nhà và tên đường."
  );
};

/*
============================================================
DISTANCE
============================================================
*/

export const getShopCoordinates = () => ({
  latitude: SHOP_LOCATION.latitude,

  longitude: SHOP_LOCATION.longitude,
});

const toRadians = (value) => (Number(value) * Math.PI) / 180;

export const calculateHaversineDistanceKm = (pointA, pointB) => {
  if (!pointA || !pointB) {
    return null;
  }

  const lat1 = Number(pointA.latitude);

  const lon1 = Number(pointA.longitude);

  const lat2 = Number(pointB.latitude);

  const lon2 = Number(pointB.longitude);

  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    return null;
  }

  const radius = 6371;

  const dLat = toRadians(lat2 - lat1);

  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

let shopCoordinatesPromise = null;

const getResolvedShopCoordinates = async () => {
  if (!shopCoordinatesPromise) {
    shopCoordinatesPromise = geocodeAddress({
      houseNumber: "40",

      street: "Nguyễn Chí Thanh",

      wardName: "Phường Hải Châu",

      provinceName: "Đà Nẵng",
    }).catch(() => getShopCoordinates());
  }

  return shopCoordinatesPromise;
};

export const getRoadDistanceKm = async (
  shopCoordinates,
  customerCoordinates
) => {
  const coordinates =
    `${shopCoordinates.longitude},${shopCoordinates.latitude};` +
    `${customerCoordinates.longitude},${customerCoordinates.latitude}`;

  const url =
    `${SHIPPING_CONFIG.routingUrl}/${coordinates}` +
    `?overview=false&alternatives=false&steps=false`;

  const data = await fetchJsonWithTimeout(url);

  const meters = Number(data?.routes?.[0]?.distance);

  if (!Number.isFinite(meters)) {
    throw new Error("Không xác định được khoảng cách đường bộ.");
  }

  return meters / 1000;
};

export const calculateDeliveryDistance = async (address) => {
  const shopCoordinates = await getResolvedShopCoordinates();

  const customerCoordinates = await geocodeAddress(address);

  let distanceKm;

  let distanceType = "road";

  try {
    distanceKm = await getRoadDistanceKm(shopCoordinates, customerCoordinates);
  } catch (error) {
    console.warn(
      "Không lấy được khoảng cách đường bộ, sử dụng khoảng cách đường thẳng.",
      error
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
CALCULATE SHIPPING
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

  const zone = getShippingZone(address);

  if (!zone.available) {
    return {
      success: false,

      message: zone.reason,

      shippingFee: 0,

      distanceKm: null,

      distanceAvailable: false,

      subtotal: normalizedSubtotal,

      total: normalizedSubtotal,
    };
  }

  if (!String(address?.houseNumber || "").trim()) {
    return {
      success: false,

      message: "Vui lòng nhập số nhà.",

      shippingFee: 0,

      distanceKm: null,
    };
  }

  if (!String(address?.street || "").trim()) {
    return {
      success: false,

      message: "Vui lòng nhập tên đường.",

      shippingFee: 0,

      distanceKm: null,
    };
  }

  const modeValidation = validateDeliveryMode(deliveryMode, deliveryDate, now);

  if (!modeValidation.success) {
    return {
      success: false,

      message: modeValidation.message,

      shippingFee: 0,

      distanceKm: null,
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

      shippingFee: 0,

      distanceKm: null,
    };
  }

  if (
    !availableSlots.some((slot) => String(slot.id) === String(selectedSlot.id))
  ) {
    return {
      success: false,

      message:
        "Khung giờ này không còn đủ thời gian để shop chuẩn bị sản phẩm.",

      shippingFee: 0,

      distanceKm: null,
    };
  }

  let distanceResult;

  try {
    distanceResult = await calculateDeliveryDistance(address);
  } catch (error) {
    return {
      success: false,

      message: error?.message || "Không thể xác định khoảng cách giao hàng.",

      shippingFee: 0,

      distanceKm: null,

      distanceAvailable: false,
    };
  }

  const distanceKm = Number(distanceResult.distanceKm) || 0;

  const freeByDistance = distanceKm < SHIPPING_CONFIG.freeShippingDistanceKm;

  const freeBySubtotal =
    normalizedSubtotal >= SHIPPING_CONFIG.freeShippingThreshold;

  const freeShippingApplied = freeByDistance || freeBySubtotal;

  const originalDeliveryFee = getDeliveryModeFee(deliveryMode);

  const shippingFee = freeShippingApplied ? 0 : originalDeliveryFee;

  let freeShippingReason = "";

  if (freeByDistance && freeBySubtotal) {
    freeShippingReason =
      "Miễn phí phí giao hàng đơn hàng từ 500.000đ và khoảng cách dưới 7 km.";
  } else if (freeBySubtotal) {
    freeShippingReason = "Miễn phí phí giao hàng đơn hàng từ 500.000đ.";
  } else if (freeByDistance) {
    freeShippingReason = "Miễn phí phí giao hàng do khoảng cách dưới 7 km.";
  }

  const total = normalizedSubtotal + shippingFee;

  return {
    success: true,

    zone: zone.zone,

    zoneLabel: zone.label,

    address: {
      provinceCode: address?.provinceCode || "",

      provinceName: address?.provinceName || "",

      wardCode: address?.wardCode || "",

      wardName: address?.wardName || "",

      houseNumber: address?.houseNumber || "",

      street: address?.street || "",
    },

    distanceKm,

    distanceType: distanceResult.distanceType,

    distanceAvailable: true,

    shopAddress: SHOP_LOCATION.address,

    shopCoordinates: distanceResult.shopCoordinates,

    customerCoordinates: distanceResult.customerCoordinates,

    deliveryMode,

    deliveryModeLabel: DELIVERY_MODE_LABELS[deliveryMode],

    deliveryDate,

    deliveryTimeSlot: selectedSlot.id,

    deliveryTimeSlotLabel: selectedSlot.label,

    estimatedDeliveryTime: getEstimatedDeliveryTime(
      deliveryMode,
      deliveryDate,
      selectedSlot.id
    ),

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
BACKWARD COMPATIBILITY
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

  const zone = getShippingZone(address);

  if (!zone.available) {
    return {
      success: false,

      message: zone.reason,

      shippingFee: 0,

      subtotal: normalizedSubtotal,

      total: normalizedSubtotal,
    };
  }

  const slot = getSlotById(deliveryTimeSlot);

  const fee = getDeliveryModeFee(deliveryMode);

  const free = normalizedSubtotal >= SHIPPING_CONFIG.freeShippingThreshold;

  return {
    success: Boolean(deliveryDate && slot),

    message: !deliveryDate
      ? "Vui lòng chọn ngày giao hàng."
      : !slot
        ? "Vui lòng chọn khung giờ giao hàng."
        : "",

    zone: zone.zone,

    zoneLabel: zone.label,

    deliveryMode,

    deliveryModeLabel: DELIVERY_MODE_LABELS[deliveryMode],

    deliveryDate,

    deliveryTimeSlot: slot?.id || "",

    deliveryTimeSlotLabel: slot?.label || "",

    originalDeliveryFee: fee,

    deliveryFee: fee,

    shippingFee: free ? 0 : fee,

    freeShippingApplied: free,

    freeShippingReason: free
      ? "Miễn phí phí giao hàng đơn hàng từ 500.000đ."
      : "",

    subtotal: normalizedSubtotal,

    total: normalizedSubtotal + (free ? 0 : fee),

    deliveryNote: String(deliveryNote || "").trim(),

    calculatedAt: new Date(now).toISOString(),
  };
};

/*
============================================================
SNAPSHOT
============================================================
*/

export const createShippingSnapshot = (calculation) => {
  if (!calculation?.success) {
    return null;
  }

  return {
    version: 5,

    zone: calculation.zone || "",

    zoneLabel: calculation.zoneLabel || "",

    shopAddress: calculation.shopAddress || SHOP_LOCATION.address,

    address: {
      ...(calculation.address || {}),
    },

    distanceKm: Number(calculation.distanceKm) || 0,

    distanceType: calculation.distanceType || "",

    distanceAvailable: calculation.distanceAvailable !== false,

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

    freeShippingThreshold: SHIPPING_CONFIG.freeShippingThreshold,

    freeShippingDistanceKm: SHIPPING_CONFIG.freeShippingDistanceKm,

    subtotal: Number(calculation.subtotal) || 0,

    total: Number(calculation.total) || 0,

    deliveryNote: calculation.deliveryNote || "",

    calculatedAt: calculation.calculatedAt || new Date().toISOString(),
  };
};
