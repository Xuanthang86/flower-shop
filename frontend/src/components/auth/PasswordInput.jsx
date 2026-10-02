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
    <div className="relative password-input-wrapper">
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
        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 disabled:bg-gray-100"
      />

      <button
        type="button"
        onClick={() => setShowPassword((current) => !current)}
        disabled={disabled}
        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-gray-500 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {showPassword ? <FiEyeOff size={19} /> : <FiEye size={19} />}
      </button>

      <style>{`
        .password-input-wrapper input::-ms-reveal,
        .password-input-wrapper input::-ms-clear {
          display: none;
        }

        .password-input-wrapper input::-webkit-textfield-decoration-container {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default PasswordInput;
