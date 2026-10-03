import api from "./api";

export const createPaymentIntent = async ({
  orderId,
  depositPercent = 100,
}) => {
  const { data } = await api.post("/payments/intents", {
    orderId,
    depositPercent: Number(depositPercent) === 50 ? 50 : 100,
  });

  return data?.paymentIntent;
};

export const getPaymentIntent = async (intentId) => {
  const { data } = await api.get(
    `/payments/intents/${encodeURIComponent(intentId)}`
  );

  return data?.paymentIntent;
};

export const markPaymentStarted = async (intentId) => {
  const { data } = await api.post(
    `/payments/intents/${encodeURIComponent(intentId)}/started`
  );

  return data?.paymentIntent;
};
