const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return res.status(422).json({
    success: false,
    message: "Dữ liệu gửi lên không hợp lệ.",
    errors: result.array().map((item) => ({
      field: item.path || item.param,
      message: item.msg,
      value: item.value,
    })),
  });
};

module.exports = validate;
