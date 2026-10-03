import api from "./api";

export const getServerCart = async () => {
  const response = await api.get("/users/me/cart");

  if (response.data?.success !== true) {
    throw new Error(
      response.data?.message || "Không thể tải giỏ hàng từ máy chủ."
    );
  }

  return Array.isArray(response.data.cart) ? response.data.cart : [];
};

export const saveServerCart = async (cart) => {
  const response = await api.put("/users/me/cart", {
    cart: Array.isArray(cart) ? cart : [],
  });

  if (response.data?.success !== true) {
    throw new Error(
      response.data?.message || "Không thể đồng bộ giỏ hàng với máy chủ."
    );
  }

  return Array.isArray(response.data.cart) ? response.data.cart : [];
};
