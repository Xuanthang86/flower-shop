const authorize = (...allowedRoles) => {
  const roles = allowedRoles.flat().filter(Boolean);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập.",
      });
    }

    if (!roles.length || roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền thực hiện thao tác này.",
    });
  };
};

module.exports = authorize;
