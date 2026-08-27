import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { FiPackage } from "react-icons/fi";

import { useOrder } from "@/context/OrderContext";

import OrderAddress from "@/components/orders/OrderAddress";

import {
  STATUS_OPTIONS,
  normalizeOrderStatus,
  getStatusLabel,
  getStatusClass,
} from "@/utils/orderStatus";

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

const formatCurrency = (value = 0) =>
  `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const AdminOrderDetailPage = () => {
  const { orderId } = useParams();

  const navigate = useNavigate();

  const { getOrderById, updateOrderStatus } = useOrder();

  const order = useMemo(() => getOrderById(orderId), [getOrderById, orderId]);

  if (!order) {
    return (
      <section className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">
            Không tìm thấy đơn hàng
          </h1>

          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="mt-6 px-5 py-3 rounded-lg bg-pink-600 text-white"
          >
            Quay lại quản trị
          </button>
        </div>
      </section>
    );
  }

  const customer = order.customer || {};

  const address =
    customer.address ||
    order.shippingAddress ||
    order.customerAddress ||
    order.address ||
    {};

  const items = Array.isArray(order.items) ? order.items : [];

  const total = Number(
    order.total ??
      order.totalAmount ??
      order.cartTotal ??
      order.grandTotal ??
      order.subtotal ??
      0
  );

  const status = normalizeOrderStatus(order.status);

  const handleStatusChange = (event) => {
    updateOrderStatus(order.id, event.target.value);
  };

  return (
    <section className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <Link
              to="/admin/orders"
              className="text-sm text-gray-500 hover:text-pink-600"
            >
              ← Quay lại Quản lý đơn hàng
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 mt-3">
              Chi tiết đơn hàng #{order.id}
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Đặt ngày: {formatDate(order.createdAt)}
            </p>
          </div>

          <div>
            <label
              htmlFor="orderStatus"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Trạng thái đơn hàng
            </label>

            <select
              id="orderStatus"
              value={status}
              onChange={handleStatusChange}
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
            >
              {STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Thông tin người nhận
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Họ và tên</p>

                <p className="font-medium mt-1">
                  {customer.fullName || customer.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>

                <p className="font-medium mt-1">{customer.phone || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>

                <p className="font-medium mt-1 break-all">
                  {customer.email || "—"}
                </p>
              </div>

              {customer.note && (
                <div>
                  <p className="text-sm text-gray-500">Ghi chú</p>

                  <p className="font-medium mt-1">{customer.note}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Địa chỉ giao hàng
            </h2>

            <OrderAddress address={address} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Sản phẩm</h2>

          <div className="space-y-4">
            {items.length === 0 ? (
              <p className="text-gray-500">Không có sản phẩm.</p>
            ) : (
              items.map((item, index) => {
                const quantity = Number(item?.quantity || 0);

                const price = Number(item?.price || 0);

                return (
                  <div
                    key={item?.id || item?.productId || index}
                    className="flex gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item?.image ? (
                        <img
                          src={item.image}
                          alt={item.name || "Sản phẩm"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiPackage />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold">{item.name || "Sản phẩm"}</p>

                      <p className="text-sm text-gray-500 mt-1">
                        Số lượng: {quantity}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Đơn giá: {formatCurrency(price)}
                      </p>
                    </div>

                    <div className="font-semibold text-pink-600">
                      {formatCurrency(price * quantity)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Phương thức thanh toán</p>

              <p className="font-medium mt-1">
                {order.paymentMethod === "cod"
                  ? "Thanh toán khi nhận hàng (COD)"
                  : order.paymentMethod || "—"}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-sm text-gray-500">Trạng thái</p>

              <p className={`font-semibold mt-1`}>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs ${getStatusClass(
                    status
                  )}`}
                >
                  {getStatusLabel(status)}
                </span>
              </p>

              <p className="text-sm text-gray-500 mt-3">Tổng cộng</p>

              <p className="text-2xl font-bold text-pink-600 mt-1">
                {formatCurrency(total)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminOrderDetailPage;
