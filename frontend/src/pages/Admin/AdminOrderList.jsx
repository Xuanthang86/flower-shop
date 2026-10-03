import { useEffect, useState } from "react";
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
  const { orders = [], pagination, loading, refreshOrders } = useOrder();

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(20);

  const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshOrders({
        page,
        limit: pageSize,
        status: statusFilter === "all" ? "" : statusFilter,
        search: searchTerm,
      });
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [page, pageSize, statusFilter, searchTerm, refreshOrders]);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách đơn hàng
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Hiển thị {orders.length} / {pagination.total} đơn hàng
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
                <th className="px-5 py-4 text-center">Mã đơn</th>

                <th className="px-5 py-4">Khách hàng</th>

                <th className="px-5 py-4 text-center">Sản phẩm</th>

                <th className="px-5 py-4 text-center">Tổng tiền</th>

                <th className="px-5 py-4 text-center">Hình thức thanh toán</th>

                <th className="px-5 py-4 text-center">Trạng thái</th>

                <th className="px-5 py-4 text-center">Thời gian đặt hàng</th>

                <th className="px-5 py-4 text-center">Chi tiết</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
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

                    <td className="px-5 py-4 text-center">
                      {getProductCount(order)}
                    </td>

                    <td className="px-5 py-4 text-center font-semibold text-pink-600">
                      {formatCurrency(getOrderTotal(order))}
                    </td>

                    <td className="px-5 py-4 text-sm text-center">
                      {order.paymentMethod === "cod"
                        ? "COD"
                        : order.paymentMethod || "COD"}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                          status
                        )}`}
                      >
                        {getStatusLabel(status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center text-sm text-gray-500">
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
          {pagination.total > 0 && (
            <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Hiển thị</span>

                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-pink-400"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size} đơn hàng
                    </option>
                  ))}
                </select>

                <span>/ trang</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || loading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white font-semibold hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Trang trước"
                >
                  &lt;
                </button>

                <span className="min-w-[100px] text-center text-sm text-gray-600">
                  Trang {page} / {pagination.totalPages || 1}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(pagination.totalPages || 1, current + 1)
                    )
                  }
                  disabled={page >= (pagination.totalPages || 1) || loading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white font-semibold hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Trang sau"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrderList;
