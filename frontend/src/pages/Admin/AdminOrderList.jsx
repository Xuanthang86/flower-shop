import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useOrder } from "@/context/OrderContext";

import {
  STATUS_OPTIONS,
  normalizeOrderStatus,
  getStatusLabel,
  getStatusClass,
} from "@/utils/orderStatus";

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));

const getOrderTotal = (order) =>
  Number(
    order?.total ??
      order?.totalAmount ??
      order?.cartTotal ??
      order?.grandTotal ??
      order?.subtotal ??
      0
  );

const getCustomerName = (order) =>
  order?.customer?.name ||
  order?.customer?.fullName ||
  order?.customerName ||
  "Khách hàng";

const getCustomerPhone = (order) =>
  order?.customer?.phone || order?.customerPhone || order?.phone || "";

const getProductCount = (order) => {
  const items = Array.isArray(order?.items)
    ? order.items
    : Array.isArray(order?.products)
      ? order.products
      : [];

  return items.reduce((total, item) => total + Number(item?.quantity || 1), 0);
};

const getOrderId = (order) =>
  String(order?.id || order?.orderId || "").replace(/^#/, "");

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString("vi-VN");
};

const AdminOrderList = () => {
  const { orders = [] } = useOrder();

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const status = normalizeOrderStatus(order?.status);

      const name = getCustomerName(order).toLowerCase();

      const phone = getCustomerPhone(order).toLowerCase();

      const id = getOrderId(order).toLowerCase();

      const matchesSearch =
        !keyword ||
        id.includes(keyword) ||
        name.includes(keyword) ||
        phone.includes(keyword);

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách đơn hàng
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm mã đơn, khách hàng, số điện thoại..."
              className="w-full sm:w-80 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-100"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-pink-500"
            >
              <option value="all">Tất cả trạng thái</option>

              {STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="text-4xl mb-4">📦</div>

          <h3 className="text-lg font-semibold text-gray-800">
            Không tìm thấy đơn hàng
          </h3>

          <p className="text-sm text-gray-500 mt-2">
            Chưa có đơn hàng phù hợp.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-5 py-4">Mã đơn</th>

                <th className="px-5 py-4">Khách hàng</th>

                <th className="px-5 py-4">Sản phẩm</th>

                <th className="px-5 py-4">Tổng tiền</th>

                <th className="px-5 py-4">Thanh toán</th>

                <th className="px-5 py-4">Trạng thái</th>

                <th className="px-5 py-4">Ngày đặt</th>

                <th className="px-5 py-4 text-center">Chi tiết</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const orderId = getOrderId(order);

                const status = normalizeOrderStatus(order.status);

                return (
                  <tr key={orderId} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-semibold">#{orderId}</td>

                    <td className="px-5 py-4">
                      <p className="font-medium">{getCustomerName(order)}</p>

                      <p className="text-sm text-gray-500 mt-1">
                        {getCustomerPhone(order)}
                      </p>
                    </td>

                    <td className="px-5 py-4">{getProductCount(order)}</td>

                    <td className="px-5 py-4 font-semibold text-pink-600">
                      {formatCurrency(getOrderTotal(order))}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {order.paymentMethod === "cod"
                        ? "COD"
                        : order.paymentMethod || "COD"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                          status
                        )}`}
                      >
                        {getStatusLabel(status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <Link
                        to={`/admin/orders/${orderId}`}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600"
                        title="Xem chi tiết"
                      >
                        👁️
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrderList;
