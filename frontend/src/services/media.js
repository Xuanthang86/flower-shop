const normalizeApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL || "http://localhost:5000";

  return String(configured).replace(/\/+$/, "").endsWith("/api")
    ? String(configured).replace(/\/+$/, "")
    : `${String(configured).replace(/\/+$/, "")}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl();

const readImageDimensions = (file) =>
  new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Vui lòng chọn đúng file hình ảnh."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
          ratio:
            image.naturalHeight > 0
              ? image.naturalWidth / image.naturalHeight
              : 0,
        });
      };

      image.onerror = () =>
        reject(new Error("Không thể đọc kích thước hình ảnh."));

      image.src = String(reader.result || "");
    };

    reader.onerror = () => reject(new Error("Không thể đọc file hình ảnh."));

    reader.readAsDataURL(file);
  });

const fileToCompressedDataUri = (
  file,
  { maxWidth = 2000, maxHeight = 1400, quality = 0.82 } = {}
) =>
  new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Vui lòng chọn đúng file hình ảnh."));
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      reject(
        new Error("File hình ảnh quá lớn. Vui lòng chọn file không quá 15MB.")
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const ratio = Math.min(
          1,
          maxWidth / image.width,
          maxHeight / image.height
        );

        const canvas = document.createElement("canvas");

        canvas.width = Math.max(1, Math.round(image.width * ratio));

        canvas.height = Math.max(1, Math.round(image.height * ratio));

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Không thể xử lý hình ảnh."));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/webp", quality));
      };

      image.onerror = () => reject(new Error("Không thể đọc hình ảnh."));

      image.src = String(reader.result || "");
    };

    reader.onerror = () => reject(new Error("Không thể đọc file hình ảnh."));

    reader.readAsDataURL(file);
  });

export const getImageDimensions = readImageDimensions;

export const uploadImageFile = async (
  file,
  {
    folder = "flower-shop",
    maxWidth = 2000,
    maxHeight = 1400,
    quality = 0.82,
  } = {}
) => {
  const dataUri = await fileToCompressedDataUri(file, {
    maxWidth,
    maxHeight,
    quality,
  });

  let response;

  try {
    response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dataUri,
        folder,
      }),
    });
  } catch {
    throw new Error(
      "Không thể kết nối backend. Hãy kiểm tra server backend đang chạy tại http://localhost:5000."
    );
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload?.message || "Không thể tải hình ảnh lên Cloudinary."
    );
  }

  if (!payload?.url) {
    throw new Error("Backend không trả về URL hình ảnh Cloudinary.");
  }

  return payload.url;
};
