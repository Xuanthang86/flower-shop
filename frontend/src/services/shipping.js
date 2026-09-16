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

  address: "40 Nguyễn Chí Thanh, phường Hải Châu, thành phố Đà Nẵng",

  provinceCode: "48",

  provinceName: "Đà Nẵng",

  /*
   * Tọa độ fallback của shop.
   *
   * Hệ thống ưu tiên geocode lại địa chỉ shop.
   * Nếu geocode thất bại thì dùng tọa độ này.
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
   * Đúng 7 km không thuộc diện miễn phí
   * theo điều kiện khoảng cách.
   */
  freeShippingDistanceKm: 7,

  /*
   * Phí giao hàng.
   */
  deliveryFees: {
    [DELIVERY_MODE.ECONOMY]: 20000,
    [DELIVERY_MODE.STANDARD]: 30000,
    [DELIVERY_MODE.EXPRESS]: 50000,
  },

  /*
   * Các tỉnh/thành được phép giao.
   *
   * Hiện tại chỉ Đà Nẵng.
   *
   * Khi mở rộng toàn quốc có thể bổ sung:
   * {
   *   code: "46",
   *   keywords: ["hue", "thua thien hue"]
   * }
   */
  deliveryProvinces: [
    {
      code: "48",
      keywords: ["da nang"],
    },
  ],

  /*
   * Giữ lại API cũ để tương thích nếu có code
   * khác trong hệ thống đang sử dụng.
   */
  deliveryProvinceKeywords: ["da nang"],

  /*
   * Số ngày được đặt trước.
   */
  maxAdvanceDays: 30,

  /*
   * Hỏa tốc chỉ nhận trong ngày.
   */
  expressCutoffHour: 17,

  /*
   * Tối thiểu 120 phút chuẩn bị cho hỏa tốc.
   */
  expressMinimumLeadMinutes: 120,

  /*
   * API geocoding chính.
   */
  geocodingUrl: "https://photon.komoot.io/api/",

  /*
   * API geocoding dự phòng.
   */
  fallbackGeocodingUrl: "https://nominatim.openstreetmap.org/search",

  /*
   * API routing.
   */
  routingUrl: "https://router.project-osrm.org/route/v1/driving",

  /*
   * Timeout cho từng request.
   */
  requestTimeoutMs: 10000,

  /*
   * Giới hạn kết quả geocoding.
   */
  geocodingLimit: 5,

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

const normalizeText = (value = "") => {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
};

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
PROVINCE / ZONE
============================================================
*/

/*
 * Xác định Đà Nẵng bằng cả mã tỉnh và tên.
 *
 * Mã 48 là mã tỉnh/thành phố Đà Nẵng trong
 * bộ dữ liệu địa giới hiện tại của project.
 */
const isDaNangAddress = (address = {}) => {
  const provinceCode = String(address?.provinceCode || "").trim();

  const provinceName = normalizeText(address?.provinceName);

  if (provinceCode === "48") {
    return true;
  }

  if (provinceName === "da nang" || provinceName.includes("da nang")) {
    return true;
  }

  return false;
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
  const provinceCode = String(address?.provinceCode || "").trim();

  const provinceName = normalizeText(address?.provinceName);

  if (!provinceCode && !provinceName) {
    return {
      zone: SHIPPING_ZONE.NON_DELIVERY,

      label: "Chưa xác định khu vực giao hàng",

      available: false,

      reason: "Vui lòng chọn tỉnh/thành phố.",
    };
  }

  /*
   * Đà Nẵng luôn được phép giao.
   *
   * Không phân biệt phường hay xã để tính vùng phí.
   * Khoảng cách thực tế mới quyết định miễn phí.
   */
  if (isDaNangAddress(address)) {
    return {
      zone: SHIPPING_ZONE.INTRA_CITY,

      label: "Nội thành Đà Nẵng",

      available: true,

      reason: "",
    };
  }

  /*
   * Kiểm tra kiến trúc mở rộng cho các tỉnh/thành sau này.
   */
  const supportedProvince = findSupportedProvince(address);

  if (supportedProvince) {
    return {
      zone: SHIPPING_ZONE.INTRA_CITY,

      label: provinceName
        ? `Khu vực giao hàng ${address.provinceName}`
        : "Khu vực giao hàng",

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
ADDRESS VALIDATION
============================================================
*/

const getAddressParts = (address = {}) => {
  return {
    houseNumber: String(address?.houseNumber || "").trim(),

    street: String(address?.street || "").trim(),

    wardName: String(address?.wardName || "").trim(),

    provinceName: String(address?.provinceName || "").trim(),
  };
};

/*
============================================================
BUILD GEOCODING QUERIES
============================================================
*/

/*
 * Không chỉ gửi một query.
 *
 * Ví dụ:
 *
 * 58 Nam Cao, Phường Liên Chiểu, Đà Nẵng, Việt Nam
 *
 * nếu Photon không nhận thì thử:
 *
 * 58 Nam Cao, Đà Nẵng, Việt Nam
 *
 * rồi:
 *
 * Nam Cao, Phường Liên Chiểu, Đà Nẵng, Việt Nam
 *
 * Điều này giúp xử lý tốt hơn các địa chỉ mà API
 * chưa cập nhật hoàn toàn tên phường/xã mới.
 */
const buildAddressQueries = (address = {}) => {
  const { houseNumber, street, wardName, provinceName } =
    getAddressParts(address);

  const province = provinceName || "Đà Nẵng";

  const queries = [];

  if (houseNumber && street && wardName && province) {
    queries.push(
      `${houseNumber} ${street}, ${wardName}, ${province}, Việt Nam`
    );
  }

  if (houseNumber && street && province) {
    queries.push(`${houseNumber} ${street}, ${province}, Việt Nam`);
  }

  if (street && wardName && province) {
    queries.push(`${street}, ${wardName}, ${province}, Việt Nam`);
  }

  if (street && province) {
    queries.push(`${street}, ${province}, Việt Nam`);
  }

  if (houseNumber && street) {
    queries.push(`${houseNumber} ${street}, Đà Nẵng, Việt Nam`);
  }

  return [...new Set(queries.map((query) => query.trim()).filter(Boolean))];
};

/*
============================================================
COORDINATE VALIDATION
============================================================
*/

const isValidCoordinate = (latitude, longitude) => {
  return (
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    Number(latitude) >= -90 &&
    Number(latitude) <= 90 &&
    Number(longitude) >= -180 &&
    Number(longitude) <= 180
  );
};

/*
 * Giới hạn kết quả trong khu vực Đà Nẵng.
 *
 * Mục đích:
 * tránh trường hợp API trả về một đường Nam Cao
 * hoặc địa điểm cùng tên ở tỉnh khác.
 */
const isCoordinateInDaNang = (latitude, longitude) => {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (!isValidCoordinate(lat, lon)) {
    return false;
  }

  return lat >= 15.8 && lat <= 16.35 && lon >= 107.85 && lon <= 108.45;
};

/*
============================================================
PHOTON RESULT
============================================================
*/

const getCoordinatesFromPhoton = (data) => {
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
        feature?.properties?.name ||
        feature?.properties?.street ||
        feature?.properties?.city ||
        "",
    };
  }

  return null;
};

/*
============================================================
NOMINATIM RESULT
============================================================
*/

const getCoordinatesFromNominatim = (data) => {
  const results = Array.isArray(data) ? data : [];

  for (const result of results) {
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

/*
============================================================
GEOCODE WITH PHOTON
============================================================
*/

const geocodeWithPhoton = async (query) => {
  const url =
    `${SHIPPING_CONFIG.geocodingUrl}` +
    `?q=${encodeURIComponent(query)}` +
    `&limit=${SHIPPING_CONFIG.geocodingLimit}` +
    `&lang=vi`;

  const data = await fetchJsonWithTimeout(url);

  return getCoordinatesFromPhoton(data);
};

/*
============================================================
GEOCODE WITH NOMINATIM
============================================================
*/

const geocodeWithNominatim = async (query) => {
  const url =
    `${SHIPPING_CONFIG.fallbackGeocodingUrl}` +
    `?format=jsonv2` +
    `&addressdetails=1` +
    `&limit=${SHIPPING_CONFIG.geocodingLimit}` +
    `&countrycodes=vn` +
    `&q=${encodeURIComponent(query)}`;

  const data = await fetchJsonWithTimeout(url);

  return getCoordinatesFromNominatim(data);
};

/*
============================================================
GEOCODE ADDRESS
============================================================
*/

export const geocodeAddress = async (address) => {
  const queries = buildAddressQueries(address);

  if (queries.length === 0) {
    throw new Error("Không có đủ thông tin địa chỉ để xác định vị trí.");
  }

  let lastError = null;

  /*
   * Thử Photon trước.
   */
  for (const query of queries) {
    try {
      const coordinates = await geocodeWithPhoton(query);

      if (coordinates) {
        return coordinates;
      }
    } catch (error) {
      lastError = error;
    }
  }

  /*
   * Photon không tìm thấy:
   * thử Nominatim.
   */
  for (const query of queries) {
    try {
      const coordinates = await geocodeWithNominatim(query);

      if (coordinates) {
        return coordinates;
      }
    } catch (error) {
      lastError = error;
    }
  }

  console.error("Không geocode được địa chỉ:", lastError);

  throw new Error(
    "Không xác định được vị trí địa chỉ nhận hàng. Vui lòng kiểm tra lại số nhà, tên đường và phường/xã."
  );
};

/*
============================================================
SHOP COORDINATES
============================================================
*/

/*
 * API cũ vẫn trả tọa độ fallback đồng bộ.
 *
 * Khi tính khoảng cách thực tế, hệ thống sẽ ưu tiên
 * geocode địa chỉ shop để lấy vị trí chính xác hơn.
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

  const latitudeA = Number(pointA.latitude);

  const longitudeA = Number(pointA.longitude);

  const latitudeB = Number(pointB.latitude);

  const longitudeB = Number(pointB.longitude);

  if (
    !isValidCoordinate(latitudeA, longitudeA) ||
    !isValidCoordinate(latitudeB, longitudeB)
  ) {
    return null;
  }

  const earthRadiusKm = 6371;

  const latitudeDifference = toRadians(latitudeB - latitudeA);

  const longitudeDifference = toRadians(longitudeB - longitudeA);

  const latitudeARadians = toRadians(latitudeA);

  const latitudeBRadians = toRadians(latitudeB);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(latitudeARadians) *
      Math.cos(latitudeBRadians) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

/*
============================================================
GET SHOP GEOCODE
============================================================
*/

let shopCoordinatesPromise = null;

const getResolvedShopCoordinates = async () => {
  /*
   * Chỉ geocode shop một lần trong một
   * vòng đời trang.
   */
  if (!shopCoordinatesPromise) {
    shopCoordinatesPromise = geocodeAddress({
      houseNumber: "40",

      street: "Nguyễn Chí Thanh",

      wardName: "Phường Hải Châu",

      provinceName: "Đà Nẵng",
    }).catch(() => {
      return getShopCoordinates();
    });
  }

  return shopCoordinatesPromise;
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
    getResolvedShopCoordinates(),

    geocodeAddress(address),
  ]);

  /*
   * Khai báo nhưng không gán giá trị
   * để tránh cảnh báo biến được gán nhưng
   * không sử dụng.
   */
  let distanceKm;

  let distanceType = "road";

  /*
   * Ưu tiên khoảng cách đường bộ.
   */
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

  /*
   * Kiểm tra khu vực.
   *
   * Đà Nẵng được nhận diện bằng mã 48
   * hoặc tên Đà Nẵng.
   */
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

      distanceKm: null,

      distanceAvailable: false,
    };
  }

  /*
   * Kiểm tra địa chỉ.
   */
  if (!String(address?.houseNumber || "").trim()) {
    return {
      success: false,

      message: "Vui lòng nhập số nhà.",

      distanceKm: null,

      distanceAvailable: false,
    };
  }

  if (!String(address?.street || "").trim()) {
    return {
      success: false,

      message: "Vui lòng nhập tên đường.",

      distanceKm: null,

      distanceAvailable: false,
    };
  }

  if (!address?.wardCode || !address?.wardName) {
    return {
      success: false,

      message: "Vui lòng chọn phường/xã.",

      distanceKm: null,

      distanceAvailable: false,
    };
  }

  /*
   * Ngày giao.
   */
  if (!deliveryDate) {
    return {
      success: false,

      message: "Vui lòng chọn ngày giao hàng.",

      distanceKm: null,

      distanceAvailable: false,
    };
  }

  const today = formatDateKey(now);

  const maxDate = addDaysToDateKey(today, SHIPPING_CONFIG.maxAdvanceDays);

  if (deliveryDate < today) {
    return {
      success: false,

      message: "Ngày giao hàng không hợp lệ.",

      distanceKm: null,

      distanceAvailable: false,
    };
  }

  if (deliveryDate > maxDate) {
    return {
      success: false,

      message: `Chỉ có thể đặt giao hàng tối đa ${SHIPPING_CONFIG.maxAdvanceDays} ngày.`,

      distanceKm: null,

      distanceAvailable: false,
    };
  }

  /*
   * Kiểm tra hình thức giao.
   */
  const deliveryValidation = validateDeliveryMode(
    deliveryMode,
    deliveryDate,
    now
  );

  if (!deliveryValidation.success) {
    return {
      success: false,

      message: deliveryValidation.message,

      distanceKm: null,

      distanceAvailable: false,
    };
  }

  /*
   * Kiểm tra khung giờ.
   */
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

      distanceKm: null,

      distanceAvailable: false,
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

      distanceKm: null,

      distanceAvailable: false,
    };
  }

  /*
   * TÍNH KHOẢNG CÁCH.
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

      shippingFee: 0,

      subtotal: normalizedSubtotal,

      total: normalizedSubtotal,

      distanceKm: null,

      distanceAvailable: false,
    };
  }

  const distanceKm = Number(distanceResult.distanceKm) || 0;

  /*
   * MIỄN PHÍ:
   *
   * 1. Đơn >= 500.000đ
   * HOẶC
   * 2. Khoảng cách < 7 km
   */
  const freeBySubtotal =
    normalizedSubtotal >= SHIPPING_CONFIG.freeShippingThreshold;

  const freeByDistance = distanceKm < SHIPPING_CONFIG.freeShippingDistanceKm;

  const freeShippingApplied = freeBySubtotal || freeByDistance;

  /*
   * Phí theo hình thức giao.
   */
  const originalDeliveryFee = getDeliveryModeFee(deliveryMode);

  const shippingFee = freeShippingApplied ? 0 : originalDeliveryFee;

  /*
   * Lý do miễn phí.
   */
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

  /*
   * Thời gian giao dự kiến.
   */
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
     * KHOẢNG CÁCH
     */
    distanceKm,

    distanceType: distanceResult.distanceType,

    distanceAvailable: true,

    shopAddress: SHOP_LOCATION.address,

    shopCoordinates: distanceResult.shopCoordinates,

    customerCoordinates: distanceResult.customerCoordinates,

    /*
     * GIAO HÀNG
     */
    deliveryMode,

    deliveryModeLabel: DELIVERY_MODE_LABELS[deliveryMode],

    deliveryDate,

    deliveryTimeSlot: selectedSlot.id,

    deliveryTimeSlotLabel: selectedSlot.label,

    estimatedDeliveryTime,

    /*
     * PHÍ
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

  /*
   * Hàm đồng bộ chỉ tính miễn phí
   * theo giá trị đơn.
   *
   * Khoảng cách cần calculateShippingAsync.
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
    version: 4,

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
