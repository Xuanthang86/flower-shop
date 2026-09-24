import api from "./api";

export const validateCoupon = async ({ code, subtotal }) => {
  const { data } = await api.post("/coupons/validate", { code, subtotal });
  return data;
};

export const listCoupons = async () => {
  const { data } = await api.get("/coupons");
  return data?.items || [];
};

export const createCoupon = async (payload) => {
  const { data } = await api.post("/coupons", payload);
  return data?.item;
};

export const updateCoupon = async (id, payload) => {
  const { data } = await api.patch(`/coupons/${encodeURIComponent(id)}`, payload);
  return data?.item;
};
