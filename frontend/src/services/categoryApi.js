import api from "./api";

export const listCategories = async (params = {}) => {
  const { data } = await api.get("/categories", { params });
  return data?.items || [];
};

export const getCategory = async (id) => {
  const { data } = await api.get(`/categories/${encodeURIComponent(id)}`);
  return data?.item;
};

export const createCategory = async (payload) => {
  const { data } = await api.post("/categories", payload);
  return data?.item;
};

export const updateCategory = async (id, payload) => {
  const { data } = await api.patch(`/categories/${encodeURIComponent(id)}`, payload);
  return data?.item;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/categories/${encodeURIComponent(id)}`);
  return data?.item;
};
