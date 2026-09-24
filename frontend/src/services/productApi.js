import api from "./api";

export const listProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params });
  return data;
};

export const getProduct = async (id) => {
  const { data } = await api.get(`/products/${encodeURIComponent(id)}`);
  return data?.item;
};

export const createProduct = async (payload) => {
  const { data } = await api.post("/products", payload);
  return data?.item;
};

export const updateProduct = async (id, payload) => {
  const { data } = await api.patch(`/products/${encodeURIComponent(id)}`, payload);
  return data?.item;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${encodeURIComponent(id)}`);
  return data?.item;
};
