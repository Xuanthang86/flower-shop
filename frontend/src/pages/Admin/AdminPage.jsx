import { useMemo } from "react";

import { FiPackage, FiClock, FiCheckCircle } from "react-icons/fi";

import { useOrder } from "@/context/OrderContext";

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
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <FiPackage size={22} />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Quản lý đơn hàng
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Theo dõi và quản lý các đơn hàng của cửa hàng
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Tổng đơn hàng</p>

            <p className="text-2xl font-bold text-gray-800 mt-2">
              {totalOrders}
            </p>

            <FiPackage className="mt-4 text-pink-600" size={21} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Chờ xác nhận</p>

            <p className="text-2xl font-bold text-yellow-600 mt-2">
              {pendingOrders}
            </p>

            <FiClock className="mt-4 text-yellow-600" size={21} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Đã giao</p>

            <p className="text-2xl font-bold text-green-600 mt-2">
              {completedOrders}
            </p>

            <FiCheckCircle className="mt-4 text-green-600" size={21} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Doanh thu</p>

            <p className="text-2xl font-bold text-pink-600 mt-2">
              {formatCurrency(totalRevenue)}
            </p>

            <span className="block mt-4 text-xl font-bold text-pink-600">
              ₫
            </span>
          </div>
        </div>

        <AdminOrderList />
      </div>
    </section>
  );
};

export default AdminPage;
