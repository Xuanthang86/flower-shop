export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const PAYMENT_STATUS_OPTIONS = [
  {
    value: PAYMENT_STATUS.PENDING,
    label: "Chờ thanh toán",
  },
  {
    value: PAYMENT_STATUS.PAID,
    label: "Đã thanh toán",
  },
  {
    value: PAYMENT_STATUS.FAILED,
    label: "Thanh toán thất bại",
  },
  {
    value: PAYMENT_STATUS.REFUNDED,
    label: "Đã hoàn tiền",
  },
];

export const normalizePaymentStatus = (status) => {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  const map = {
    "": PAYMENT_STATUS.PENDING,

    pending: PAYMENT_STATUS.PENDING,
    pending_payment: PAYMENT_STATUS.PENDING,
    pending_cod: PAYMENT_STATUS.PENDING,
    processing: PAYMENT_STATUS.PENDING,
    expired: PAYMENT_STATUS.FAILED,
    cancelled: PAYMENT_STATUS.FAILED,
    canceled: PAYMENT_STATUS.FAILED,

    "chờ thanh toán": PAYMENT_STATUS.PENDING,

    paid: PAYMENT_STATUS.PAID,
    success: PAYMENT_STATUS.PAID,
    successful: PAYMENT_STATUS.PAID,
    captured: PAYMENT_STATUS.PAID,
    completed: PAYMENT_STATUS.PAID,

    "đã thanh toán": PAYMENT_STATUS.PAID,

    failed: PAYMENT_STATUS.FAILED,
    error: PAYMENT_STATUS.FAILED,
    declined: PAYMENT_STATUS.FAILED,

    "thanh toán thất bại": PAYMENT_STATUS.FAILED,

    refunded: PAYMENT_STATUS.REFUNDED,
    refund: PAYMENT_STATUS.REFUNDED,

    "đã hoàn tiền": PAYMENT_STATUS.REFUNDED,
  };

  return map[value] || PAYMENT_STATUS.PENDING;
};

export const getPaymentStatusLabel = (status) => {
  const normalized = normalizePaymentStatus(status);

  return (
    PAYMENT_STATUS_OPTIONS.find((item) => item.value === normalized)?.label ||
    "Chờ thanh toán"
  );
};

export const getPaymentStatusClass = (status) => {
  switch (normalizePaymentStatus(status)) {
    case PAYMENT_STATUS.PENDING:
      return "bg-yellow-100 text-yellow-700";

    case PAYMENT_STATUS.PAID:
      return "bg-green-100 text-green-700";

    case PAYMENT_STATUS.FAILED:
      return "bg-red-100 text-red-700";

    case PAYMENT_STATUS.REFUNDED:
      return "bg-purple-100 text-purple-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const isPaymentPaid = (status) =>
  normalizePaymentStatus(status) === PAYMENT_STATUS.PAID;

export const isPaymentPending = (status) =>
  normalizePaymentStatus(status) === PAYMENT_STATUS.PENDING;

export const isPaymentFailed = (status) =>
  normalizePaymentStatus(status) === PAYMENT_STATUS.FAILED;

export const isPaymentRefunded = (status) =>
  normalizePaymentStatus(status) === PAYMENT_STATUS.REFUNDED;
