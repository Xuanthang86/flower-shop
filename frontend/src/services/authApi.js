import api from "./api";

export const loginApi = async (email, password) => {
  const { data } = await api.post("/auth/login", {
    email,
    password,
  });

  return data;
};

export const registerApi = async (payload) => {
  const { data } = await api.post("/auth/register", payload);

  return data;
};

export const googleLoginApi = async (credential) => {
  const { data } = await api.post("/auth/google", {
    credential,
  });

  return data;
};

export const getCurrentAuthUserApi = async () => {
  const { data } = await api.get("/auth/me");

  return data?.user || null;
};

export const logoutApi = async () => {
  const { data } = await api.post("/auth/logout");

  return data;
};
