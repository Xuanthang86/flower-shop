import { Navigate, Route, Routes } from "react-router-dom";

import {
  MANAGEMENT_PERMISSIONS,
  useAuth,
  PERMISSIONS,
  ROLES,
} from "@/context/AuthContext";

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

import AdminManagementPage from "@/pages/Admin/AdminManagementPage";
import AdminManagementBackButton from "@/pages/Admin/AdminManagementBackButton";
import AdminPage from "@/pages/Admin/AdminPage";
import AdminOrderDetailPage from "@/pages/Admin/AdminOrderDetailPage";
import AdminUsersPage from "@/pages/Admin/AdminUsersPage";
import AdminProductsPage from "@/pages/Admin/AdminProductsPage";
import AdminAppearancePage from "@/pages/Admin/AdminAppearancePage";
import AdminImageManagementPage from "@/pages/Admin/AdminImageManagementPage";
import AdminBlogManagementPage from "@/pages/Admin/AdminBlogManagementPage";
import AdminContactManagementPage from "@/pages/Admin/AdminContactManagementPage";
import AdminContentManagementPage from "@/pages/Admin/AdminContentManagementPage";

import NotFoundPage from "@/pages/NotFound/NotFoundPage";

import UnsavedChangesGuard from "@/utils/unsavedChanges";

const LoadingPage = ({ text }) => (
  <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />

      <p className="text-sm text-gray-500">{text}</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage text="Đang kiểm tra tài khoản..." />;
  }

  if (!user || user.disabled) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PermissionRoute = ({ permission, children }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return <LoadingPage text="Đang kiểm tra quyền truy cập..." />;
  }

  if (!user || user.disabled) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(permission)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

const AdminOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage text="Đang kiểm tra quyền quản trị..." />;
  }

  if (!user || user.disabled) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== ROLES.ADMIN) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

const AdminEntry = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage text="Đang tải khu vực quản lý..." />;
  }

  if (!user || user.disabled) {
    return <Navigate to="/login" replace />;
  }

  if (
    ![ROLES.ADMIN, ROLES.MANAGER, ROLES.PRODUCT_MANAGER].includes(user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return <AdminManagementPage />;
};

const AdminSubPage = ({ children }) => {
  const { user, hasPermission } = useAuth();

  const isAdmin = user?.role === ROLES.ADMIN;

  const accessibleModuleCount = MANAGEMENT_PERMISSIONS.filter((permission) =>
    hasPermission(permission)
  ).length;

  const showBackButton = isAdmin || accessibleModuleCount > 1;

  return (
    <div className="w-full bg-gray-50 pb-1 pt-1">
      {showBackButton && (
        <div className="mx-auto w-full max-w-7xl px-4">
          <AdminManagementBackButton />
        </div>
      )}

      {/*
       * Header và nút Quay lại đều dùng max-w-7xl.
       *
       * Một số page cũ có container max-w-5xl.
       * Wrapper này chỉ mở rộng container chính của page quản lý
       * lên max-w-7xl, không thay đổi bố cục bên trong.
       */}
      <div className="w-full [&_main>div.mx-auto]:!max-w-7xl">{children}</div>
    </div>
  );
};

const AppRoutes = () => (
  <>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/products" element={<ProductsPage />} />

        <Route
          path="/products/category/:categorySlug"
          element={<ProductsPage />}
        />

        <Route path="/products/:productId" element={<ProductDetailPage />} />

        <Route path="/cart" element={<CartPage />} />

        <Route path="/blog" element={<BlogPage />} />

        <Route path="/blog/:postId" element={<BlogPage />} />

        <Route path="/contact" element={<ContactPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <CustomerOrderDetailPage />
            </ProtectedRoute>
          }
        />

        <Route path="/admin" element={<AdminEntry />} />

        <Route
          path="/admin/orders"
          element={
            <PermissionRoute permission={PERMISSIONS.MANAGE_ORDERS}>
              <AdminSubPage>
                <AdminPage />
              </AdminSubPage>
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
              <AdminSubPage>
                <AdminProductsPage />
              </AdminSubPage>
            </PermissionRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminOnlyRoute>
              <AdminSubPage>
                <AdminUsersPage />
              </AdminSubPage>
            </AdminOnlyRoute>
          }
        />

        <Route
          path="/admin/blog"
          element={
            <PermissionRoute permission={PERMISSIONS.MANAGE_BLOG}>
              <AdminSubPage>
                <AdminBlogManagementPage />
              </AdminSubPage>
            </PermissionRoute>
          }
        />

        <Route
          path="/admin/images"
          element={
            <PermissionRoute permission={PERMISSIONS.MANAGE_IMAGES}>
              <AdminSubPage>
                <AdminImageManagementPage />
              </AdminSubPage>
            </PermissionRoute>
          }
        />

        <Route
          path="/admin/contact"
          element={
            <PermissionRoute permission={PERMISSIONS.MANAGE_CONTACT}>
              <AdminSubPage>
                <AdminContactManagementPage />
              </AdminSubPage>
            </PermissionRoute>
          }
        />

        <Route
          path="/admin/content"
          element={
            <PermissionRoute permission={PERMISSIONS.MANAGE_CONTENT}>
              <AdminSubPage>
                <AdminContentManagementPage />
              </AdminSubPage>
            </PermissionRoute>
          }
        />

        <Route
          path="/admin/appearance"
          element={
            <AdminOnlyRoute>
              <AdminSubPage>
                <AdminAppearancePage />
              </AdminSubPage>
            </AdminOnlyRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>

    <UnsavedChangesGuard />
  </>
);

export default AppRoutes;
