import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { FiCheckCircle, FiEye, FiEyeOff, FiLock } from "react-icons/fi";

import { useAuth } from "@/context/AuthContext";

const ChangePasswordPage = () => {
  const { user, changePassword, validatePassword } = useAuth();

  const navigate = useNavigate();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);

  const [showNew, setShowNew] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");

  const [passwordError, setPasswordError] = useState("");

  /*
   * ==========================================================
   * KIỂM TRA USER
   * ==========================================================
   */

  useEffect(() => {
    if (!user) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  /*
   * ==========================================================
   * CHANGE PASSWORD
   * ==========================================================
   */

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!passwordData.currentPassword) {
      setPasswordError("Vui lòng nhập mật khẩu hiện tại.");

      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError("Vui lòng nhập mật khẩu mới.");

      return;
    }

    const checked = validatePassword(passwordData.newPassword);

    if (!checked.valid) {
      setPasswordError(checked.message);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp.");

      return;
    }

    const result = changePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    );

    if (!result?.success) {
      setPasswordError(result?.message || "Không thể đổi mật khẩu.");

      return;
    }

    setPasswordMessage("Đổi mật khẩu thành công.");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  /*
   * ==========================================================
   * PASSWORD INPUT
   * ==========================================================
   */

  const passwordFields = [
    {
      name: "currentPassword",
      label: "Mật khẩu hiện tại",
      visible: showCurrent,
      setVisible: setShowCurrent,
      autoComplete: "current-password",
    },
    {
      name: "newPassword",
      label: "Mật khẩu mới",
      visible: showNew,
      setVisible: setShowNew,
      autoComplete: "new-password",
    },
    {
      name: "confirmPassword",
      label: "Xác nhận mật khẩu mới",
      visible: showConfirm,
      setVisible: setShowConfirm,
      autoComplete: "new-password",
    },
  ];

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <section className="min-h-[70vh] bg-gray-50 py-10 md:py-14">
      <div className="max-w-3xl mx-auto px-4">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 text-pink-600 mb-4">
            <FiLock size={22} />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Đổi mật khẩu
          </h1>

          <p className="mt-2 text-gray-500">
            Cập nhật mật khẩu để bảo vệ tài khoản của bạn.
          </p>
        </div>

        {/* =================================================
            CARD
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 md:p-10">
            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handlePasswordSubmit} className="max-w-2xl mx-auto">
              {/* =================================================
                  SUCCESS
              ================================================= */}

              {passwordMessage && (
                <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
                  <FiCheckCircle className="mt-0.5 flex-shrink-0" size={18} />

                  <span className="text-sm">{passwordMessage}</span>
                </div>
              )}

              {/* =================================================
                  ERROR
              ================================================= */}

              {passwordError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {passwordError}
                </div>
              )}

              {/* =================================================
                  FIELDS
              ================================================= */}

              <div className="space-y-5">
                {passwordFields.map(
                  ({ name, label, visible, setVisible, autoComplete }) => (
                    <div key={name}>
                      <label
                        htmlFor={name}
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        {label} <span className="text-pink-600">*</span>
                      </label>

                      <div className="relative">
                        <input
                          id={name}
                          type={visible ? "text" : "password"}
                          value={passwordData[name]}
                          onChange={(event) =>
                            setPasswordData((current) => ({
                              ...current,
                              [name]: event.target.value,
                            }))
                          }
                          required
                          autoComplete={autoComplete}
                          className="w-full h-12 border border-gray-300 rounded-xl px-4 pr-12 text-gray-800 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                        />

                        <button
                          type="button"
                          onClick={() => setVisible((value) => !value)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-pink-600 hover:bg-pink-50 transition"
                          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {visible ? (
                            <FiEyeOff size={18} />
                          ) : (
                            <FiEye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* =================================================
                  PASSWORD RULE
              ================================================= */}

              <div className="mt-5 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Yêu cầu mật khẩu
                </p>

                <p className="text-xs leading-5 text-gray-500">
                  Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường,
                  số và ký tự đặc biệt.
                </p>
              </div>

              {/* =================================================
                  BUTTON
              ================================================= */}

              <div className="pt-6 flex justify-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 min-w-[180px] px-6 py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 active:bg-pink-800 transition shadow-sm hover:shadow-md"
                >
                  <FiLock size={18} />
                  Đổi mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChangePasswordPage;
