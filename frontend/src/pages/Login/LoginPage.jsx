import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/auth/PasswordInput";

const EMAIL_DOMAIN = "@flowershop.vn";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    emailPrefix: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleEmailPrefixChange = (event) => {
    const value = event.target.value;

    setFormData((currentData) => ({
      ...currentData,
      emailPrefix: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const emailPrefix = formData.emailPrefix.trim().toLowerCase();
    const password = formData.password;

    // ==============================
    // KIỂM TRA TÊN EMAIL
    // ==============================

    if (!emailPrefix) {
      setError("Vui lòng nhập tên email.");
      return;
    }

    /*
     * Người dùng chỉ nhập phần trước @flowershop.vn.
     *
     * Ví dụ:
     * thang
     * admin
     * sales
     *
     * Hệ thống sẽ tự ghép thành:
     * thang@flowershop.vn
     * admin@flowershop.vn
     * sales@flowershop.vn
     */
    if (!/^[a-zA-Z0-9._-]+$/.test(emailPrefix)) {
      setError(
        "Tên email chỉ được gồm chữ cái không dấu, số, dấu chấm, gạch ngang hoặc gạch dưới."
      );
      return;
    }

    // ==============================
    // TẠO EMAIL HOÀN CHỈNH
    // ==============================

    const email = `${emailPrefix}${EMAIL_DOMAIN}`;

    // ==============================
    // KIỂM TRA MẬT KHẨU
    // ==============================

    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);

      // ========================================
      // ĐĂNG NHẬP THẤT BẠI
      // ========================================

      if (!result || result.success !== true) {
        setError(
          result?.message ||
            "Đăng nhập thất bại. Vui lòng kiểm tra tên email và mật khẩu."
        );

        return;
      }

      // ========================================
      // ĐĂNG NHẬP THÀNH CÔNG
      // ========================================

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
    <section className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* ==============================
              TIÊU ĐỀ
          ============================== */}

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Đăng nhập</h1>

            <p className="mt-2 text-gray-500">
              Đăng nhập để tiếp tục mua sắm tại Flower Shop
            </p>
          </div>

          {/* ==============================
              THÔNG BÁO LỖI
          ============================== */}

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="
                mb-6
                rounded-lg
                border border-red-200
                bg-red-50
                px-4 py-3
                text-sm
                text-red-600
              "
            >
              {error}
            </div>
          )}

          {/* ==============================
              FORM
          ============================== */}

          <form onSubmit={handleSubmit} noValidate>
            {/* EMAIL */}

            <div className="mb-5">
              <label
                htmlFor="emailPrefix"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>

              <div
                className="
                  flex
                  w-full
                  overflow-hidden
                  rounded-lg
                  border border-gray-300
                  bg-white
                  transition
                  focus-within:border-pink-500
                  focus-within:ring-1
                  focus-within:ring-pink-500
                "
              >
                <input
                  id="emailPrefix"
                  name="emailPrefix"
                  type="text"
                  value={formData.emailPrefix}
                  onChange={handleEmailPrefixChange}
                  placeholder="Tên email"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={loading}
                  aria-describedby="email-help"
                  className="
                    min-w-0
                    flex-1
                    border-0
                    bg-transparent
                    px-4 py-3
                    outline-none
                    focus:ring-0
                    disabled:bg-gray-100
                  "
                />

                <span
                  aria-hidden="true"
                  className="
                    flex
                    shrink-0
                    items-center
                    border-l border-gray-200
                    bg-gray-50
                    px-3
                    text-sm
                    text-gray-500
                  "
                >
                  {EMAIL_DOMAIN}
                </span>
              </div>

              <p id="email-help" className="mt-1.5 text-xs text-gray-400">
                Chỉ cần nhập phần trước {EMAIL_DOMAIN}.
              </p>
            </div>

            {/* MẬT KHẨU */}

            <div className="mb-5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
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

            {/* NÚT ĐĂNG NHẬP */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-pink-600
                text-white
                py-3
                rounded-lg
                font-semibold
                transition
                hover:bg-pink-700
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* ==============================
              ĐĂNG KÝ
          ============================== */}

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
