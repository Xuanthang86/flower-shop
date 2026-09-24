import api from "./api";

export const createPaymentIntent = async ({ amount }) => {
  const { data } = await api.post("/payments/intents", { amount });
  return data?.paymentIntent;
};

export const getPaymentIntent = async (intentId) => {
  const { data } = await api.get(`/payments/intents/${encodeURIComponent(intentId)}`);
  return data?.paymentIntent;
};

export const markPaymentStarted = async (intentId) => {
  const { data } = await api.post(`/payments/intents/${encodeURIComponent(intentId)}/started`);
  return data?.paymentIntent;
};
