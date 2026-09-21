const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const isGoogleLoginConfigured = () => Boolean(GOOGLE_CLIENT_ID);

export const getGoogleClientId = () => GOOGLE_CLIENT_ID;

export const verifyGoogleCredential = async (credential) => {
  if (!credential) {
    throw new Error("Google không trả về thông tin xác thực.");
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      credential,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Không thể xác thực tài khoản Google.");
  }

  return data;
};
