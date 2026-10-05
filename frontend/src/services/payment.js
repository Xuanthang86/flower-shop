import api from "./api";

export const createBankTransferPaymentIntent = async ({
  depositPercent = 100,
  draft = {},
  checkoutSignature = "",
}) => {
  const normalizedDepositPercent = Number(depositPercent) === 50 ? 50 : 100;

  const { data } = await api.post("/payments/intents", {
    depositPercent: normalizedDepositPercent,

    draft,

    checkoutSignature: String(checkoutSignature || "").trim(),
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

export const finalizeBankTransferOrder = async (intentId) => {
  const normalizedId = String(intentId || "").trim();

  if (!normalizedId) {
    throw new Error("Thiếu mã Payment Intent.");
  }

  const { data } = await api.post(
    `/payments/intents/${encodeURIComponent(normalizedId)}/order`
  );

  return data;
};
