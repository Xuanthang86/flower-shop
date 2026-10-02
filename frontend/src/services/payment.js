const normalizeApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const base = String(configured).replace(/\/+$/, "");

  return base.endsWith("/api") ? base : `${base}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl();

const request = async (path, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,

      headers: {
        "Content-Type": "application/json",

        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(
      "Không thể kết nối backend để kiểm tra thanh toán. Vui lòng kiểm tra backend."
    );
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload?.message || "Không thể thực hiện yêu cầu thanh toán với máy chủ."
    );
  }

  return payload;
};

export const createBankTransferPaymentIntent = async ({
  orderId,
  amount,
  depositPercent = 100,
}) => {
  const normalizedOrderId = String(orderId || "").trim();

  const numericAmount = Math.round(Number(amount) || 0);

  const normalizedDepositPercent = Number(depositPercent) === 50 ? 50 : 100;

  if (!normalizedOrderId) {
    throw new Error("Thiếu mã Order ID để tạo Payment Intent.");
  }

  if (numericAmount <= 0) {
    throw new Error("Số tiền thanh toán không hợp lệ.");
  }

  return request("/payments/intents", {
    method: "POST",

    body: JSON.stringify({
      orderId: normalizedOrderId,
      amount: numericAmount,
      depositPercent: normalizedDepositPercent,
    }),
  });
};

export const getBankTransferPaymentStatus = async (intentId) => {
  const normalizedId = String(intentId || "").trim();

  if (!normalizedId) {
    throw new Error("Thiếu mã Payment Intent.");
  }

  return request(`/payments/intents/${encodeURIComponent(normalizedId)}`, {
    method: "GET",
  });
};

export const markBankTransferPaymentStarted = async (intentId) => {
  const normalizedId = String(intentId || "").trim();

  if (!normalizedId) {
    throw new Error("Thiếu mã Payment Intent.");
  }

  return request(
    `/payments/intents/${encodeURIComponent(normalizedId)}/started`,
    {
      method: "POST",
    }
  );
};
