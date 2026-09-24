const express = require("express");
const { body } = require("express-validator");
const { register, login, upsertGoogleUser, sanitizeUser } = require("../services/authService");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.post("/register",
  body("email").isEmail().withMessage("Email không hợp lệ."),
  body("password").isLength({ min: 6 }).withMessage("Mật khẩu tối thiểu 6 ký tự."),
  validate,
  async (req, res, next) => {
    try {
      const result = await register(req.body);
      res.status(201).json({ success: true, ...result });
    } catch (error) { next(error); }
  },
);

router.post("/login",
  body("email").isEmail().withMessage("Email không hợp lệ."),
  body("password").notEmpty().withMessage("Mật khẩu là bắt buộc."),
  validate,
  async (req, res, next) => {
    try {
      const result = await login(req.body);
      res.cookie("accessToken", result.token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({ success: true, user: result.user, token: result.token });
    } catch (error) { next(error); }
  },
);

router.post("/google", async (req, res, next) => {
  try {
    const credential = String(req.body?.credential || "").trim();
    if (!credential) return res.status(400).json({ success: false, message: "Thiếu Google credential." });

    const clientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
    if (!clientId) return res.status(503).json({ success: false, message: "GOOGLE_CLIENT_ID chưa được cấu hình." });

    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!response.ok) return res.status(401).json({ success: false, message: "Google credential không hợp lệ." });

    const googleUser = await response.json();
    if (String(googleUser.aud || "") !== clientId) {
      return res.status(401).json({ success: false, message: "Google Client ID không khớp." });
    }
    if (String(googleUser.email_verified || "").toLowerCase() !== "true") {
      return res.status(401).json({ success: false, message: "Email Google chưa được xác minh." });
    }

    const result = await upsertGoogleUser({
      email: googleUser.email,
      name: googleUser.name || googleUser.given_name,
      avatar: googleUser.picture,
      providerId: googleUser.sub,
    });

    res.cookie("accessToken", result.token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, user: result.user, token: result.token });
  } catch (error) { next(error); }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

router.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.json({ success: true });
});

module.exports = router;
