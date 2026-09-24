import api from "./api";

export const getCurrentUser = async () => {
  const { data } = await api.get("/users/me");
  return data?.user;
};

export const updateCurrentUser = async (payload) => {
  const { data } = await api.patch("/users/me", payload);
  return data?.user;
};

export const listUsers = async () => {
  const { data } = await api.get("/users");
  return data?.items || [];
};

export const updateUser = async (id, payload) => {
  const { data } = await api.patch(`/users/${encodeURIComponent(id)}`, payload);
  return data?.user;
};
