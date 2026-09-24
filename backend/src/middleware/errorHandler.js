const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error("API error:", error);

  if (error?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ.",
      errors: Object.fromEntries(
        Object.entries(error.errors || {}).map(([key, value]) => [
          key,
          value.message,
        ]),
      ),
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Dữ liệu bị trùng.",
      fields: error.keyValue || {},
    });
  }

  const status = Number(error?.status || error?.statusCode);
  const safeStatus = status >= 400 && status < 600 ? status : 500;

  return res.status(safeStatus).json({
    success: false,
    message:
      safeStatus === 500
        ? "Đã xảy ra lỗi máy chủ."
        : error?.message || "Yêu cầu không hợp lệ.",
  });
};

module.exports = errorHandler;
