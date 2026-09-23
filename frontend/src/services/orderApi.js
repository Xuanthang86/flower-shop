const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Không thể thực hiện yêu cầu đơn hàng.");
  }

  return data;
};

export const getOrders = (params = {}) => {
  const query = new URLSearchParams(params);

  return request(`/orders?${query.toString()}`);
};

export const getOrderById = (id) =>
  request(`/orders/${encodeURIComponent(id)}`);

export const createOrder = (payload) =>
  request("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateOrderStatus = (id, status) =>
  request(`/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const cancelOrder = (id) => updateOrderStatus(id, "cancelled");
