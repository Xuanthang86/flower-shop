import axios from "axios";

const normalizeApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const base = String(configured).replace(/\/+$/, "");

  return base.endsWith("/api") ? base : `${base}/api`;
};

const api = axios.create({
  baseURL: normalizeApiBaseUrl(),

  timeout: 10000,

  /*
   * Cho phép browser gửi httpOnly accessToken
   * cookie tới backend.
   */
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
