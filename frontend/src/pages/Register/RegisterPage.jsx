import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/auth/PasswordInput";

const RegisterPage = () => {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // THAY ĐỔI INPUT
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // ==========================================
  // ĐĂNG KÝ
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // ==========================================
    // KIỂM TRA HỌ TÊN
    // ==========================================

    if (!name) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }

    // ==========================================
    // KIỂM TRA EMAIL
    // ==========================================

    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Email không đúng định dạng.");
      return;
    }

    // ==========================================
    // KIỂM TRA SỐ ĐIỆN THOẠI
    // ==========================================

    if (!phone) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }

    // ==========================================
    // KIỂM TRA MẬT KHẨU
    // ==========================================

    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    // ==========================================
    // KIỂM TRA NHẬP LẠI MẬT KHẨU
    // ==========================================

    if (!confirmPassword) {
      setError("Vui lòng nhập lại mật khẩu.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không trùng khớp.");
      return;
    }

    setLoading(true);

    try {
      // ========================================
      // GỌI REGISTER
      // ========================================

      const result = await register({
        name,
        email,
        phone,
        password,
      });

      // ========================================
      // ĐĂNG KÝ THẤT BẠI
      // ========================================

      if (!result || result.success !== true) {
        setError(
          result?.message || "Đăng ký tài khoản thất bại. Vui lòng thử lại."
        );

        return;
      }

      // ========================================
      // ĐĂNG KÝ THÀNH CÔNG
      // ========================================

      setSuccess(
        "Đăng ký tài khoản thành công. Đang chuyển đến trang đăng nhập..."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            registered: true,
            email,
          },
        });
      }, 700);
    } catch (registerError) {
      console.error("Lỗi đăng ký:", registerError);

      setError(
        registerError?.message ||
          "Đã xảy ra lỗi khi đăng ký tài khoản. Vui lòng thử lại."
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
            <h1 className="text-3xl font-bold text-gray-800">Tạo tài khoản</h1>

            <p className="mt-2 text-gray-500">
              Đăng ký tài khoản để sử dụng Flower Shop
            </p>
          </div>

          {/* ==============================
              LỖI
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
              THÀNH CÔNG
          ============================== */}

          {success && (
            <div
              role="status"
              className="
                mb-6
                rounded-lg
                border border-green-200
                bg-green-50
                px-4 py-3
                text-sm
                text-green-600
              "
            >
              {success}
            </div>
          )}

          {/* ==============================
              FORM
          ============================== */}

          <form onSubmit={handleSubmit} noValidate>
            {/* HỌ TÊN */}

            <div className="mb-5">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Họ và tên
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                autoComplete="name"
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

            {/* SỐ ĐIỆN THOẠI */}

            <div className="mb-5">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Số điện thoại
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                autoComplete="tel"
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
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            {/* NHẬP LẠI MẬT KHẨU */}

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nhập lại mật khẩu
              </label>

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                required
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            {/* NÚT */}

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
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          {/* ==============================
              ĐĂNG NHẬP
          ============================== */}

          <div className="mt-6 text-center text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="font-semibold text-pink-600 hover:text-pink-700"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
