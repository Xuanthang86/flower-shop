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
  try {
    const { data } = await api.get("/auth/me");

    return data?.user || null;
  } catch (error) {
    if (error?.response?.status === 401) {
      return null;
    }

    throw error;
  }
};

export const logoutApi = async () => {
  const { data } = await api.post("/auth/logout");

  return data;
};

export const changePasswordApi = async (currentPassword, newPassword) => {
  const { data } = await api.post("/auth/password", {
    currentPassword,
    newPassword,
  });

  return data;
};

export const requestPasswordResetApi = async (identifier) => {
  const { data } = await api.post("/auth/forgot-password/request", {
    identifier,
  });

  return data;
};

export const resetPasswordApi = async (identifier, code, newPassword) => {
  const { data } = await api.post("/auth/forgot-password/reset", {
    identifier,
    code,
    newPassword,
  });

  return data;
};

export const listUsersApi = async () => {
  const { data } = await api.get("/users");

  return data;
};

export const createStaffApi = async (payload) => {
  const { data } = await api.post("/users", payload);

  return data;
};

export const updateUserApi = async (userId, payload) => {
  const { data } = await api.patch(
    `/users/${encodeURIComponent(userId)}`,
    payload
  );

  return data;
};

export const deleteUserApi = async (userId) => {
  const { data } = await api.delete(`/users/${encodeURIComponent(userId)}`);

  return data;
};

export const resetUserPasswordApi = async (userId, password) => {
  const { data } = await api.patch(
    `/users/${encodeURIComponent(userId)}/password`,
    {
      password,
    }
  );

  return data;
};
