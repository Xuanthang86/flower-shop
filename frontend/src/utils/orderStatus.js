export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  SHIPPING: "shipping",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const STATUS_OPTIONS = [
  {
    value: ORDER_STATUS.PENDING,
    label: "Chờ xác nhận",
  },
  {
    value: ORDER_STATUS.CONFIRMED,
    label: "Đã xác nhận",
  },
  {
    value: ORDER_STATUS.PREPARING,
    label: "Đang chuẩn bị",
  },
  {
    value: ORDER_STATUS.SHIPPING,
    label: "Đang giao",
  },
  {
    value: ORDER_STATUS.DELIVERED,
    label: "Đã giao",
  },
  {
    value: ORDER_STATUS.CANCELLED,
    label: "Đã hủy",
  },
];

export const normalizeOrderStatus = (status) => {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  const map = {
    "": ORDER_STATUS.PENDING,

    pending: ORDER_STATUS.PENDING,
    "chờ xác nhận": ORDER_STATUS.PENDING,
    "đã đặt hàng": ORDER_STATUS.PENDING,

    confirmed: ORDER_STATUS.CONFIRMED,
    "đã xác nhận": ORDER_STATUS.CONFIRMED,

    preparing: ORDER_STATUS.PREPARING,
    "đang chuẩn bị": ORDER_STATUS.PREPARING,

    shipping: ORDER_STATUS.SHIPPING,
    "đang giao": ORDER_STATUS.SHIPPING,

    delivered: ORDER_STATUS.DELIVERED,
    "đã giao": ORDER_STATUS.DELIVERED,

    // Dữ liệu cũ của website
    completed: ORDER_STATUS.DELIVERED,
    "hoàn thành": ORDER_STATUS.DELIVERED,

    cancelled: ORDER_STATUS.CANCELLED,
    canceled: ORDER_STATUS.CANCELLED,
    "đã hủy": ORDER_STATUS.CANCELLED,
  };

  return map[value] || ORDER_STATUS.PENDING;
};

export const getStatusLabel = (status) => {
  const normalized = normalizeOrderStatus(status);

  return (
    STATUS_OPTIONS.find((item) => item.value === normalized)?.label ||
    "Chờ xác nhận"
  );
};

export const getStatusClass = (status) => {
  switch (normalizeOrderStatus(status)) {
    case ORDER_STATUS.PENDING:
      return "bg-yellow-100 text-yellow-700";

    case ORDER_STATUS.CONFIRMED:
      return "bg-blue-100 text-blue-700";

    case ORDER_STATUS.PREPARING:
      return "bg-purple-100 text-purple-700";

    case ORDER_STATUS.SHIPPING:
      return "bg-orange-100 text-orange-700";

    case ORDER_STATUS.DELIVERED:
      return "bg-green-100 text-green-700";

    case ORDER_STATUS.CANCELLED:
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};
