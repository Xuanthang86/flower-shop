import api from "./api";

export const createBankTransferPaymentIntent = async ({
  orderId,
  depositPercent = 100,
}) => {
  const normalizedOrderId = String(orderId || "").trim();

  if (!normalizedOrderId) {
    throw new Error("Thiếu mã Order ID để tạo Payment Intent.");
  }

  const normalizedDepositPercent = Number(depositPercent) === 50 ? 50 : 100;

  const { data } = await api.post("/payments/intents", {
    orderId: normalizedOrderId,
    depositPercent: normalizedDepositPercent,
  });

  return data;
};

export const getBankTransferPaymentStatus = async (intentId) => {
  const normalizedId = String(intentId || "").trim();

  if (!normalizedId) {
    throw new Error("Thiếu mã Payment Intent.");
  }

  const { data } = await api.get(
    `/payments/intents/${encodeURIComponent(normalizedId)}`
  );

  return data;
};

export const markBankTransferPaymentStarted = async (intentId) => {
  const normalizedId = String(intentId || "").trim();

  if (!normalizedId) {
    throw new Error("Thiếu mã Payment Intent.");
  }

  const { data } = await api.post(
    `/payments/intents/${encodeURIComponent(normalizedId)}/started`
  );

  return data;
};
