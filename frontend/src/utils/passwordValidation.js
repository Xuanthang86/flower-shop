export const PASSWORD_RULES = {
  minLength: 12,
  maxLength: 64,
};

export const validatePassword = (password) => {
  const value = String(password || "");

  const errors = [];

  if (value.length < PASSWORD_RULES.minLength) {
    errors.push(`Mật khẩu phải có ít nhất ${PASSWORD_RULES.minLength} ký tự.`);
  }

  if (value.length > PASSWORD_RULES.maxLength) {
    errors.push(
      `Mật khẩu không được vượt quá ${PASSWORD_RULES.maxLength} ký tự.`
    );
  }

  if (!/[A-Z]/.test(value)) {
    errors.push("Mật khẩu phải có ít nhất 1 chữ cái viết hoa.");
  }

  if (!/[a-z]/.test(value)) {
    errors.push("Mật khẩu phải có ít nhất 1 chữ cái viết thường.");
  }

  if (!/[0-9]/.test(value)) {
    errors.push("Mật khẩu phải có ít nhất 1 chữ số.");
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    errors.push("Mật khẩu phải có ít nhất 1 ký tự đặc biệt.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const getPasswordStrength = (password) => {
  const value = String(password || "");

  let score = 0;

  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  if (score <= 2) {
    return "Yếu";
  }

  if (score === 3) {
    return "Trung bình";
  }

  if (score === 4) {
    return "Khá";
  }

  return "Mạnh";
};
