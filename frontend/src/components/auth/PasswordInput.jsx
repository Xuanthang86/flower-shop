import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const PasswordInput = ({
  id,
  name,
  value,
  onChange,
  placeholder = "Nhập mật khẩu",
  required = false,
  autoComplete = "current-password",
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 disabled:bg-gray-100"
      />
      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        disabled={disabled}
        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-600"
      >
        {showPassword ? <FiEyeOff size={19} /> : <FiEye size={19} />}
      </button>
    </div>
  );
};
export default PasswordInput;
