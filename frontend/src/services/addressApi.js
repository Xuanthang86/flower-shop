import api from "./api";

export const listAddresses = async () => {
  const { data } = await api.get("/addresses");
  return data?.items || [];
};

export const createAddress = async (payload) => {
  const { data } = await api.post("/addresses", payload);
  return data?.item;
};

export const updateAddress = async (id, payload) => {
  const { data } = await api.patch(`/addresses/${encodeURIComponent(id)}`, payload);
  return data?.item;
};

export const deleteAddress = async (id) => {
  const { data } = await api.delete(`/addresses/${encodeURIComponent(id)}`);
  return data;
};
