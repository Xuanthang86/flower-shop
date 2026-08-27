import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/auth/PasswordInput";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
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

    // Khi người dùng nhập lại thì xóa lỗi cũ
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const email = formData.email.trim();
    const password = formData.password;

    // ==============================
    // KIỂM TRA EMAIL
    // ==============================

    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }

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
            "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu."
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
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
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
                autoComplete="email"
                disabled={loading}
                className="
                  w-full
                  border border-gray-300
                  rounded-lg
                  px-4 py-3
                  outline-none
                  transition
                  focus:border-pink-500
                  focus:ring-1
                  focus:ring-pink-500
                  disabled:bg-gray-100
                "
              />
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
