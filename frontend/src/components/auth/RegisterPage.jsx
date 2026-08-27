// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "@/context/AuthContext";
// import PasswordInput from "@/components/auth/PasswordInput";

// const RegisterPage = () => {
//   const navigate = useNavigate();

//   const { register } = useAuth();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setFormData((current) => ({
//       ...current,
//       [name]: value,
//     }));

//     setError("");
//     setSuccess("");
//   };

//   const handleSubmit = (event) => {
//     event.preventDefault();

//     setError("");
//     setSuccess("");

//     if (formData.password !== formData.confirmPassword) {
//       setError("Mật khẩu xác nhận không khớp.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const result = register({
//         name: formData.name,
//         email: formData.email,
//         phone: formData.phone,
//         password: formData.password,
//       });

//       if (!result.success) {
//         setError(result.message);
//         return;
//       }

//       setSuccess(
//         "Tạo tài khoản thành công. Đang chuyển đến trang đăng nhập..."
//       );

//       setTimeout(() => {
//         navigate("/login", {
//           replace: true,
//           state: {
//             email: formData.email.trim().toLowerCase(),
//           },
//         });
//       }, 700);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center py-12 px-4">
//       <div className="w-full max-w-md">
//         <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-gray-800">Đăng ký</h1>

//             <p className="mt-2 text-gray-500">Tạo tài khoản khách hàng</p>
//           </div>

//           {error && (
//             <div className="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
//               {error}
//             </div>
//           )}

//           {success && (
//             <div className="mb-5 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
//               {success}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Họ và tên *
//               </label>

//               <input
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 disabled={loading}
//                 required
//                 className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email *
//               </label>

//               <input
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 disabled={loading}
//                 required
//                 className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Số điện thoại *
//               </label>

//               <input
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 disabled={loading}
//                 required
//                 className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Mật khẩu *
//               </label>

//               <PasswordInput
//                 id="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 disabled={loading}
//                 required
//                 autoComplete="new-password"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Nhập lại mật khẩu *
//               </label>

//               <PasswordInput
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 disabled={loading}
//                 required
//                 autoComplete="new-password"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-60"
//             >
//               {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
//             </button>
//           </form>

//           <div className="mt-6 text-center text-sm text-gray-600">
//             Đã có tài khoản?{" "}
//             <Link
//               to="/login"
//               className="font-semibold text-pink-600 hover:text-pink-700"
//             >
//               Đăng nhập
//             </Link>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default RegisterPage;

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/auth/PasswordInput";

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { register, validatePassword } = useAuth();

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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    const passwordCheck = validatePassword(formData.password);

    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }

    setLoading(true);

    try {
      const result = register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSuccess(
        "Tạo tài khoản thành công. Đang chuyển đến trang đăng nhập..."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            email: formData.email.trim().toLowerCase(),
            from: location.state?.from || null,
          },
        });
      }, 700);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Đăng ký</h1>

            <p className="mt-2 text-gray-500">Tạo tài khoản khách hàng</p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên *
              </label>

              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                required
                autoComplete="name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
                autoComplete="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại *
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                required
                autoComplete="tel"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mật khẩu *
              </label>

              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
                autoComplete="new-password"
              />

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc
                biệt.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nhập lại mật khẩu *
              </label>

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </form>

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
