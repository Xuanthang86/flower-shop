import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "@/context/AuthContext";

const AdminRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-gray-500">
            Đang kiểm tra quyền quản trị...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
