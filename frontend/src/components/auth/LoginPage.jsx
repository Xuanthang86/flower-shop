import { useEffect, useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import PasswordInput from "@/components/auth/PasswordInput";

import {
  getGoogleClientId,
  isGoogleLoginConfigured,
} from "@/services/googleAuth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GOOGLE_SCRIPT_URL = "https://accounts.google.com/gsi/client";

const LoginPage = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const { login, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const googleConfigured = isGoogleLoginConfigured();

  const googleClientId = getGoogleClientId();

  useEffect(() => {
    if (!googleConfigured || !googleClientId) {
      return undefined;
    }

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id) {
        return;
      }

      const container = document.getElementById("google-login-button");

      if (!container) {
        return;
      }

      container.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: googleClientId,

        callback: async (response) => {
          if (!response?.credential) {
            setError("Google không trả về thông tin xác thực.");

            return;
          }

          setError("");

          setLoading(true);

          try {
            const result = await loginWithGoogle(response.credential);

            if (!result || result.success !== true) {
              setError(result?.message || "Không thể đăng nhập bằng Google.");

              return;
            }

            const redirectPath = location.state?.from || "/";

            navigate(redirectPath, {
              replace: true,
            });
          } catch (googleError) {
            console.error("Lỗi đăng nhập Google:", googleError);

            setError(
              googleError?.message || "Không thể đăng nhập bằng Google."
            );
          } finally {
            setLoading(false);
          }
        },
      });

      window.google.accounts.id.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: 360,
        locale: "vi",
      });
    };

    const existingScript = document.querySelector(
      `script[src="${GOOGLE_SCRIPT_URL}"]`
    );

    if (existingScript) {
      if (window.google?.accounts?.id) {
        renderGoogleButton();
      } else {
        existingScript.addEventListener("load", renderGoogleButton, {
          once: true,
        });
      }

      return () => {
        existingScript.removeEventListener("load", renderGoogleButton);
      };
    }

    const script = document.createElement("script");

    script.src = GOOGLE_SCRIPT_URL;

    script.async = true;

    script.defer = true;

    script.onload = renderGoogleButton;

    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [
    googleClientId,
    googleConfigured,
    location.state,
    loginWithGoogle,
    navigate,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,

      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const email = formData.email.trim().toLowerCase();

    const password = formData.password;

    if (!email) {
      setError("Vui lòng nhập email.");

      return;
    }

    if (!EMAIL_PATTERN.test(email)) {
      setError("Vui lòng nhập email đúng định dạng.");

      return;
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu.");

      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);

      if (!result || result.success !== true) {
        setError(
          result?.message ||
            "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu."
        );

        return;
      }

      const redirectPath = location.state?.from || "/";

      navigate(redirectPath, {
        replace: true,
      });
    } catch (loginError) {
      console.error("Lỗi đăng nhập:", loginError);

      setError(
        loginError?.message || "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800">Đăng nhập</h1>

            <p className="mt-2 text-gray-500">
              Đăng nhập để tiếp tục mua sắm tại HTH Flower Shop
            </p>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <p className="mt-1.5 text-xs text-gray-400">
                Nhập email đầy đủ, ví dụ: example@gmail.com
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Mật khẩu
              </label>

              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-pink-600 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {googleConfigured && (
            <>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />

                <span className="text-xs font-medium text-gray-400">HOẶC</span>

                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="flex min-h-[44px] justify-center">
                <div
                  id="google-login-button"
                  className="flex min-h-[44px] justify-center"
                />
              </div>
            </>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-semibold text-pink-600 hover:text-pink-700"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
