import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth, PERMISSIONS, ROLES } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";

import HomePage from "@/pages/Home/HomePage";
import ProductsPage from "@/pages/Products/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetail/ProductDetailPage";
import CartPage from "@/pages/Cart/CartPage";
import BlogPage from "@/pages/Blog/BlogPage";
import ContactPage from "@/pages/Contact/ContactPage";

import LoginPage from "@/components/auth/LoginPage";
import RegisterPage from "@/components/auth/RegisterPage";

import CheckoutPage from "@/pages/Checkout/CheckoutPage";
import OrderSuccessPage from "@/pages/OrderSuccess/OrderSuccessPage";
import ProfilePage from "@/pages/Profile/ProfilePage";
import ChangePasswordPage from "@/pages/Profile/ChangePasswordPage";
import OrdersPage from "@/pages/Orders/OrdersPage";
import CustomerOrderDetailPage from "@/pages/Orders/CustomerOrderDetailPage";
import WishlistPage from "@/pages/Wishlist/WishlistPage";

import AdminPage from "@/pages/Admin/AdminPage";
import AdminOrderDetailPage from "@/pages/Admin/AdminOrderDetailPage";
import AdminUsersPage from "@/pages/Admin/AdminUsersPage";
import AdminProductsPage from "@/pages/Admin/AdminProductsPage";

import NotFoundPage from "@/pages/NotFound/NotFoundPage";

const LoadingPage = ({ text }) => (
  <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingPage text="Đang kiểm tra tài khoản..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.disabled) return <Navigate to="/login" replace />;

  return children;
};

const PermissionRoute = ({ permission, children }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) return <LoadingPage text="Đang kiểm tra quyền truy cập..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.disabled) return <Navigate to="/login" replace />;
  if (!hasPermission(permission)) return <Navigate to="/" replace />;

  return children;
};

const AdminOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingPage text="Đang kiểm tra quyền quản trị..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.disabled) return <Navigate to="/login" replace />;
  if (user.role !== ROLES.ADMIN) return <Navigate to="/" replace />;

  return children;
};

const AdminEntry = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingPage text="Đang tải khu vực quản trị..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.disabled) return <Navigate to="/login" replace />;

  if (user.role === ROLES.PRODUCT_MANAGER) {
    return <Navigate to="/admin/products" replace />;
  }

  if (user.role === ROLES.ADMIN || user.role === ROLES.MANAGER) {
    return <Navigate to="/admin/orders" replace />;
  }

  return <Navigate to="/" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/category/:categorySlug" element={<ProductsPage />} />
      <Route path="/products/:productId" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/contact" element={<ContactPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/orders/:orderId" element={<ProtectedRoute><CustomerOrderDetailPage /></ProtectedRoute>} />

      <Route path="/admin" element={<AdminEntry />} />
      <Route
        path="/admin/orders"
        element={
          <PermissionRoute permission={PERMISSIONS.MANAGE_ORDERS}>
            <AdminPage />
          </PermissionRoute>
        }
      />
      <Route
        path="/admin/orders/:orderId"
        element={
          <PermissionRoute permission={PERMISSIONS.MANAGE_ORDERS}>
            <AdminOrderDetailPage />
          </PermissionRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <PermissionRoute permission={PERMISSIONS.MANAGE_PRODUCTS}>
            <AdminProductsPage />
          </PermissionRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminOnlyRoute>
            <AdminUsersPage />
          </AdminOnlyRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default AppRoutes;
