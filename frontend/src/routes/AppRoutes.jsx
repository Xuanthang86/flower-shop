import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import MainLayout from "@/components/layout/MainLayout";

/* =========================================================
   PUBLIC PAGES
========================================================= */

import HomePage from "@/pages/Home/HomePage";
import ProductsPage from "@/pages/Products/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetail/ProductDetailPage";

import CartPage from "@/pages/Cart/CartPage";
import BlogPage from "@/pages/Blog/BlogPage";
import ContactPage from "@/pages/Contact/ContactPage";

/* =========================================================
   AUTH
========================================================= */

import LoginPage from "@/components/auth/LoginPage";
import RegisterPage from "@/components/auth/RegisterPage";

/* =========================================================
   CUSTOMER
========================================================= */

import CheckoutPage from "@/pages/Checkout/CheckoutPage";
import OrderSuccessPage from "@/pages/OrderSuccess/OrderSuccessPage";

import ProfilePage from "@/pages/Profile/ProfilePage";
import ChangePasswordPage from "@/pages/Profile/ChangePasswordPage";

import OrdersPage from "@/pages/Orders/OrdersPage";
import CustomerOrderDetailPage from "@/pages/Orders/CustomerOrderDetailPage";

import WishlistPage from "@/pages/Wishlist/WishlistPage";

/* =========================================================
   ADMIN
========================================================= */

import AdminPage from "@/pages/Admin/AdminPage";
import AdminOrderDetailPage from "@/pages/Admin/AdminOrderDetailPage";
import AdminUsersPage from "@/pages/Admin/AdminUsersPage";
import AdminProductsPage from "@/pages/Admin/AdminProductsPage";

/* =========================================================
   404
========================================================= */

import NotFoundPage from "@/pages/NotFound/NotFoundPage";

/* =========================================================
   LOADING
========================================================= */

const LoadingPage = ({ text = "Đang kiểm tra quyền..." }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />

        <p className="text-gray-500 text-sm">{text}</p>
      </div>
    </div>
  );
};

/* =========================================================
   PROTECTED ROUTE
   Dành cho các trang bắt buộc đăng nhập
========================================================= */

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage text="Đang kiểm tra tài khoản..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /*
   * Nếu tài khoản bị khóa/vô hiệu hóa
   * thì đưa về trang đăng nhập.
   */
  if (user.disabled) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/* =========================================================
   PERMISSION ROUTE
========================================================= */

const PermissionRoute = ({ permission, children }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return <LoadingPage text="Đang kiểm tra quyền truy cập..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.disabled) {
    return <Navigate to="/login" replace />;
  }

  if (typeof hasPermission !== "function") {
    return <LoadingPage text="Đang tải quyền tài khoản..." />;
  }

  if (!hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/* =========================================================
   SUPER ADMIN ROUTE
   Chỉ tài khoản admin mới được truy cập
========================================================= */

const SuperAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage text="Đang kiểm tra quyền quản trị..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.disabled) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

/* =========================================================
   ADMIN ENTRY
=========================================================

   /admin chỉ là điểm vào khu quản trị.

   ADMIN
      -> /admin/orders

   MANAGER
      -> /admin/orders

   PRODUCT_MANAGER
      -> /admin/products
========================================================= */

const AdminEntry = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage text="Đang tải khu vực quản trị..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.disabled) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "product_manager") {
    return <Navigate to="/admin/products" replace />;
  }

  if (user.role === "admin" || user.role === "manager") {
    return <Navigate to="/admin/orders" replace />;
  }

  return <Navigate to="/" replace />;
};

/* =========================================================
   APP ROUTES
========================================================= */

const AppRoutes = () => {
  return (
    <Routes>
      {/* ===================================================
          MAIN LAYOUT

          MainLayout chứa:
          - Header
          - Outlet
          - Footer

          Vì vậy Header/Footer vẫn giữ nguyên
          khi chuyển giữa các trang.
      =================================================== */}

      <Route element={<MainLayout />}>
        {/* =================================================
            TRANG CHỦ
        ================================================= */}

        <Route path="/" element={<HomePage />} />

        {/* =================================================
            SẢN PHẨM

            TẤT CẢ SẢN PHẨM
            /products

            Ví dụ:
            /products
        ================================================= */}

        <Route path="/products" element={<ProductsPage />} />

        {/* =================================================
            SẢN PHẨM THEO DANH MỤC

            Ví dụ:

            /products/category/hoa-khai-truong

            /products/category/hoa-sinh-nhat

            /products/category/hoa-cuoi

            /products/category/hoa-tot-nghiep

            /products/category/hoa-chia-buon
        ================================================= */}

        <Route
          path="/products/category/:categorySlug"
          element={<ProductsPage />}
        />

        {/* =================================================
            CHI TIẾT SẢN PHẨM

            Ví dụ:

            /products/1
            /products/2
            /products/25
        ================================================= */}

        <Route path="/products/:productId" element={<ProductDetailPage />} />

        {/* =================================================
            GIỎ HÀNG
        ================================================= */}

        <Route path="/cart" element={<CartPage />} />

        {/* =================================================
            BLOG
        ================================================= */}

        <Route path="/blog" element={<BlogPage />} />

        {/* =================================================
            LIÊN HỆ
        ================================================= */}

        <Route path="/contact" element={<ContactPage />} />

        {/* =================================================
            AUTH
        ================================================= */}

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        {/* =================================================
            CHECKOUT
        ================================================= */}

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ORDER SUCCESS
        ================================================= */}

        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            WISHLIST
        ================================================= */}

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            THÔNG TIN TÀI KHOẢN

            Đây là trang RIÊNG.
            Không còn dùng tab.
        ================================================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ĐỔI MẬT KHẨU

            Đây là trang RIÊNG.
            Không nằm chung ProfilePage.
        ================================================= */}

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ĐƠN HÀNG CỦA TÔI
        ================================================= */}

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            CHI TIẾT ĐƠN HÀNG CỦA KHÁCH
        ================================================= */}

        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <CustomerOrderDetailPage />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ADMIN ENTRY
        ================================================= */}

        <Route path="/admin" element={<AdminEntry />} />

        {/* =================================================
            ADMIN - QUẢN LÝ ĐƠN HÀNG
        ================================================= */}

        <Route
          path="/admin/orders"
          element={
            <PermissionRoute permission="manage_orders">
              <AdminPage />
            </PermissionRoute>
          }
        />

        {/* =================================================
            ADMIN - CHI TIẾT ĐƠN HÀNG
        ================================================= */}

        <Route
          path="/admin/orders/:orderId"
          element={
            <PermissionRoute permission="manage_orders">
              <AdminOrderDetailPage />
            </PermissionRoute>
          }
        />

        {/* =================================================
            ADMIN - QUẢN LÝ SẢN PHẨM

            Admin
            Product Manager
        ================================================= */}

        <Route
          path="/admin/products"
          element={
            <PermissionRoute permission="manage_products">
              <AdminProductsPage />
            </PermissionRoute>
          }
        />

        {/* =================================================
            ADMIN - QUẢN LÝ TÀI KHOẢN

            Chỉ ADMIN
        ================================================= */}

        <Route
          path="/admin/users"
          element={
            <SuperAdminRoute>
              <AdminUsersPage />
            </SuperAdminRoute>
          }
        />

        {/* =================================================
            404
        ================================================= */}

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
