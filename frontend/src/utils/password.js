export const PASSWORD_RULES = {
  minLength: 8,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

export const validatePassword = (password = "") => {
  if (password.length < PASSWORD_RULES.minLength) {
    return "Mật khẩu phải có ít nhất 8 ký tự.";
  }
  if (!PASSWORD_RULES.uppercase.test(password)) {
    return "Mật khẩu phải có ít nhất 1 chữ cái viết hoa (A-Z).";
  }
  if (!PASSWORD_RULES.lowercase.test(password)) {
    return "Mật khẩu phải có ít nhất 1 chữ cái viết thường (a-z).";
  }
  if (!PASSWORD_RULES.number.test(password)) {
    return "Mật khẩu phải có ít nhất 1 chữ số (0-9).";
  }
  if (!PASSWORD_RULES.special.test(password)) {
    return "Mật khẩu phải có ít nhất 1 ký hiệu đặc biệt (!@#$%...).";
  }
  return "";
};

export const passwordRules = [
  { label: "Ít nhất 8 ký tự", test: (v) => v.length >= 8 },
  { label: "Có chữ hoa (A-Z)", test: (v) => /[A-Z]/.test(v) },
  { label: "Có chữ thường (a-z)", test: (v) => /[a-z]/.test(v) },
  { label: "Có số (0-9)", test: (v) => /[0-9]/.test(v) },
  { label: "Có ký hiệu đặc biệt", test: (v) => /[^A-Za-z0-9]/.test(v) },
];
