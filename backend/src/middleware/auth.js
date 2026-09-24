const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getTokenFromRequest = (req) => {
  const authorization = String(req.headers.authorization || "").trim();

  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  const cookieToken = req.cookies?.accessToken;
  return String(cookieToken || "").trim();
};

const requireAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để thực hiện thao tác này.",
      });
    }

    const secret = String(process.env.JWT_SECRET || "").trim();

    if (!secret) {
      return res.status(503).json({
        success: false,
        message: "JWT_SECRET chưa được cấu hình.",
      });
    }

    const payload = jwt.verify(token, secret);

    const user = await User.findById(payload.sub).lean();

    if (!user || user.disabled) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản không tồn tại hoặc đã bị khóa.",
      });
    }

    req.user = user;
    req.auth = payload;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
    });
  }
};

module.exports = requireAuth;
module.exports.requireAuth = requireAuth;
module.exports.getTokenFromRequest = getTokenFromRequest;
