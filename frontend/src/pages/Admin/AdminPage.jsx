/*
============================================================
FLOWER SHOP — ADMIN DASHBOARD
============================================================

CẬP NHẬT:
- Dashboard đơn hàng.
- Thêm khu vực truy cập nhanh.
- ADMIN có thể truy cập:
    + Quản lý đơn hàng
    + Quản lý sản phẩm
    + Quản lý tài khoản
    + Tùy chỉnh giao diện
- MANAGER chỉ thấy quyền phù hợp.
============================================================
*/

import { useMemo } from "react";

import { Link } from "react-router-dom";

import {
  FiCheckCircle,
  FiClock,
  FiLayout,
  FiPackage,
  FiSettings,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";

import { useOrder } from "@/context/OrderContext";

import { useAuth } from "@/context/AuthContext";

import AdminOrderList from "./AdminOrderList";

import { ORDER_STATUS, normalizeOrderStatus } from "@/utils/orderStatus";

const formatCurrency = (value = 0) =>
  `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const getOrderTotal = (order) =>
  Number(
    order?.total ??
      order?.totalAmount ??
      order?.cartTotal ??
      order?.grandTotal ??
      order?.subtotal ??
      0
  );

const AdminPage = () => {
  const { orders = [] } = useOrder();

  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const isManager = user?.role === "manager";

  const totalOrders = orders.length;

  const pendingOrders = useMemo(
    () =>
      orders.filter(
        (order) => normalizeOrderStatus(order?.status) === ORDER_STATUS.PENDING
      ).length,
    [orders]
  );

  const completedOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          normalizeOrderStatus(order?.status) === ORDER_STATUS.DELIVERED
      ).length,
    [orders]
  );

  const totalRevenue = useMemo(
    () =>
      orders
        .filter(
          (order) =>
            normalizeOrderStatus(order?.status) === ORDER_STATUS.DELIVERED
        )
        .reduce((total, order) => total + getOrderTotal(order), 0),
    [orders]
  );

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
              <FiPackage size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                Quản lý đơn hàng
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Theo dõi và quản lý các đơn hàng của cửa hàng
              </p>
            </div>
          </div>
        </div>

        {/* QUICK ACCESS */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-gray-800">
            Truy cập nhanh
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* ORDERS */}
            {(isAdmin || isManager) && (
              <Link
                to="/admin/orders"
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                  <FiPackage />
                </div>

                <h3 className="mt-4 font-bold text-gray-800">
                  Quản lý đơn hàng
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Theo dõi và xử lý đơn hàng.
                </p>
              </Link>
            )}

            {/* PRODUCTS */}
            {(isAdmin || isManager) && (
              <Link
                to="/admin/products"
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <FiShoppingBag />
                </div>

                <h3 className="mt-4 font-bold text-gray-800">
                  Quản lý sản phẩm
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Sản phẩm và danh mục.
                </p>
              </Link>
            )}

            {/* USERS */}
            {isAdmin && (
              <Link
                to="/admin/users"
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <FiUsers />
                </div>

                <h3 className="mt-4 font-bold text-gray-800">
                  Quản lý tài khoản
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Người dùng và phân quyền.
                </p>
              </Link>
            )}

            {/* APPEARANCE */}
            {isAdmin && (
              <Link
                to="/admin/appearance"
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                  <FiLayout />
                </div>

                <h3 className="mt-4 font-bold text-gray-800">
                  Tùy chỉnh giao diện
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Màu sắc, font chữ, cỡ chữ và bo góc.
                </p>
              </Link>
            )}
          </div>
        </div>

        {/* STATISTICS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Tổng đơn hàng</p>

            <p className="mt-2 text-2xl font-bold text-gray-800">
              {totalOrders}
            </p>

            <FiPackage className="mt-4 text-pink-600" size={21} />
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Chờ xác nhận</p>

            <p className="mt-2 text-2xl font-bold text-yellow-600">
              {pendingOrders}
            </p>

            <FiClock className="mt-4 text-yellow-600" size={21} />
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Đã giao</p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {completedOrders}
            </p>

            <FiCheckCircle className="mt-4 text-green-600" size={21} />
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Doanh thu</p>

            <p className="mt-2 text-2xl font-bold text-pink-600">
              {formatCurrency(totalRevenue)}
            </p>

            <FiSettings className="mt-4 text-pink-600" size={21} />
          </div>
        </div>

        <AdminOrderList />
      </div>
    </section>
  );
};

export default AdminPage;
