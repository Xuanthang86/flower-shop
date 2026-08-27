import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/auth/PasswordInput";
import { validatePassword } from "@/utils/passwordValidation";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();
    const password = formData.password;

    if (!name) return setError("Vui lòng nhập họ và tên.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Email không đúng định dạng.");
    if (!phone) return setError("Vui lòng nhập số điện thoại.");

    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) return setError(passwordResult.errors.join(" "));
    if (!formData.confirmPassword) return setError("Vui lòng nhập lại mật khẩu.");
    if (password !== formData.confirmPassword) return setError("Mật khẩu nhập lại không trùng khớp.");

    setLoading(true);
    try {
      const result = await register({ name, email, phone, password });
      if (!result?.success) {
        setError(result?.message || "Đăng ký tài khoản thất bại. Vui lòng thử lại.");
        return;
      }
      setSuccess("Đăng ký tài khoản thành công. Đang chuyển đến trang đăng nhập...");
      setTimeout(() => navigate("/login", { replace: true, state: { registered: true, email } }), 700);
    } catch (registerError) {
      console.error("Lỗi đăng ký:", registerError);
      setError(registerError?.message || "Đã xảy ra lỗi khi đăng ký tài khoản. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Tạo tài khoản</h1>
            <p className="mt-2 text-gray-500">Đăng ký tài khoản để sử dụng Flower Shop</p>
          </div>
          {error && <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          {success && <div role="status" className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">{success}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {[['name', 'Họ và tên', 'text', 'Nhập họ và tên', 'name'], ['email', 'Email', 'email', 'example@gmail.com', 'email'], ['phone', 'Số điện thoại', 'tel', 'Nhập số điện thoại', 'tel']].map(([id, label, type, placeholder, autoComplete]) => (
              <div className="mb-5" key={id}>
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <input id={id} name={id} type={type} value={formData[id]} onChange={handleChange} placeholder={placeholder} autoComplete={autoComplete} disabled={loading} className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500 disabled:bg-gray-100" />
              </div>
            ))}

            <div className="mb-5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <PasswordInput id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Nhập mật khẩu" required autoComplete="new-password" disabled={loading} />
            </div>
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Nhập lại mật khẩu</label>
              <PasswordInput id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu" required autoComplete="new-password" disabled={loading} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold transition hover:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed">{loading ? "Đang đăng ký..." : "Đăng ký"}</button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Đã có tài khoản? <Link to="/login" className="font-semibold text-pink-600 hover:text-pink-700">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
