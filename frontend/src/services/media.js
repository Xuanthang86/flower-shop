const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const fileToDataUri = (file) =>
  new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Vui lòng chọn đúng file hình ảnh."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));

    reader.onerror = () => reject(new Error("Không thể đọc file hình ảnh."));

    reader.readAsDataURL(file);
  });

export const uploadImageFile = async (
  file,
  { folder = "flower-shop" } = {}
) => {
  const dataUri = await fileToDataUri(file);

  const response = await fetch(`${API_BASE_URL}/media/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dataUri,
      folder,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.message || "Không thể tải hình ảnh lên kho dữ liệu dùng chung."
    );
  }

  if (!payload.url) {
    throw new Error("Máy chủ không trả về URL hình ảnh.");
  }

  return payload.url;
};
