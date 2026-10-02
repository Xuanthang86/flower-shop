import { useState } from "react";
import { Link } from "react-router-dom";

import PasswordInput from "@/components/auth/PasswordInput";

import { requestPasswordResetApi, resetPasswordApi } from "@/services/authApi";

import { useAuth } from "@/context/AuthContext";

const ForgotPasswordPage = () => {
  const { validatePassword } = useAuth();

  const [identifier, setIdentifier] = useState("");

  const [code, setCode] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState(1);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const requestCode = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!identifier.trim()) {
      setError("Vui lòng nhập email hoặc số điện thoại.");

      return;
    }

    setLoading(true);

    try {
      const result = await requestPasswordResetApi(identifier.trim());

      if (!result?.success) {
        setError(result?.message || "Không thể gửi mã xác minh.");

        return;
      }

      setMessage("Mã xác minh đã được gửi đến email của tài khoản.");

      setStep(2);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Không thể gửi mã xác minh."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!code.trim()) {
      setError("Vui lòng nhập mã xác minh.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    const passwordCheck = validatePassword(password);

    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }

    setLoading(true);

    try {
      const result = await resetPasswordApi(
        identifier.trim(),
        code.trim(),
        password
      );

      if (!result?.success) {
        setError(result?.message || "Không thể đặt lại mật khẩu.");

        return;
      }

      setMessage(
        "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới."
      );

      setStep(3);
    } catch (resetError) {
      setError(
        resetError?.response?.data?.message ||
          resetError?.message ||
          "Không thể đặt lại mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-center text-3xl font-bold text-gray-800">
            Quên mật khẩu
          </h1>

          <p className="mt-2 text-center text-sm text-gray-500">
            Khôi phục mật khẩu bằng email hoặc số điện thoại đã đăng ký.
          </p>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={requestCode} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email hoặc số điện thoại
                </label>

                <input
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  disabled={loading}
                  autoComplete="username"
                  placeholder="example@gmail.com hoặc 090..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-pink-600 py-3 font-semibold text-white hover:bg-pink-700 disabled:opacity-60"
              >
                {loading ? "Đang gửi..." : "Gửi mã xác minh"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={resetPassword} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Mã xác minh
                </label>

                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  disabled={loading}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Nhập 6 số"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center tracking-[0.4em] outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Mật khẩu mới
                </label>

                <PasswordInput
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nhập lại mật khẩu
                </label>

                <PasswordInput
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-pink-600 py-3 font-semibold text-white hover:bg-pink-700 disabled:opacity-60"
              >
                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="mt-6">
              <Link
                to="/login"
                className="block w-full rounded-lg bg-pink-600 py-3 text-center font-semibold text-white hover:bg-pink-700"
              >
                Đăng nhập
              </Link>
            </div>
          )}

          {step !== 3 && (
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm font-semibold text-pink-600 hover:text-pink-700"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ForgotPasswordPage;
