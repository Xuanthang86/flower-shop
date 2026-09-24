import api from "./api";

export const createOrder = async (payload) => {
  const { data } = await api.post("/orders", payload);
  return data;
};

export const listOrders = async (params = {}) => {
  const { data } = await api.get("/orders", { params });
  return data;
};

export const getOrder = async (id) => {
  const { data } = await api.get(`/orders/${encodeURIComponent(id)}`);
  return data?.item;
};

export const updateOrderStatus = async (id, payload) => {
  const { data } = await api.patch(`/orders/${encodeURIComponent(id)}/status`, payload);
  return data?.item;
};
