import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "@/context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-gray-500">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
