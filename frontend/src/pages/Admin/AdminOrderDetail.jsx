import { useEffect, useState } from "react";
import {
  FiUser,
  FiMapPin,
  FiPackage,
  FiCreditCard,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";

import { useContext } from "react";
import { OrderContext } from "@/context/OrderContext";

const STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Chờ xác nhận",
  },
  {
    value: "confirmed",
    label: "Đã xác nhận",
  },
  {
    value: "preparing",
    label: "Đang chuẩn bị",
  },
  {
    value: "shipping",
    label: "Đang giao",
  },
  {
    value: "completed",
    label: "Đã giao",
  },
  {
    value: "cancelled",
    label: "Đã hủy",
  },
];

const formatCurrency = (value = 0) => {
  return Number(value || 0).toLocaleString("vi-VN") + " ₫";
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN");
};

const getStatusClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";

    case "confirmed":
      return "bg-blue-100 text-blue-700";

    case "preparing":
      return "bg-purple-100 text-purple-700";

    case "shipping":
      return "bg-orange-100 text-orange-700";

    case "completed":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

const OrderDetail = ({ order }) => {
  const { updateOrderStatus } = useContext(OrderContext);

  const [selectedStatus, setSelectedStatus] = useState(
    order?.status || "pending"
  );

  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    setSelectedStatus(order?.status || "pending");
  }, [order?.status]);

  if (!order) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Không tìm thấy đơn hàng
        </h2>

        <p className="text-gray-500 mt-2">
          Đơn hàng có thể đã bị xóa hoặc mã đơn không chính xác.
        </p>
      </div>
    );
  }

  const customer = order.customer || {};

  const address =
    customer.address || order.shippingAddress || order.address || {};

  const items = Array.isArray(order.items) ? order.items : [];

  const total =
    Number(order.total ?? order.cartTotal ?? order.grandTotal ?? 0) || 0;

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
    setSavedMessage("");
  };

  const handleSaveStatus = () => {
    updateOrderStatus(order.id || order.orderId, selectedStatus);

    setSavedMessage("Đã cập nhật trạng thái đơn hàng.");

    setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* THÔNG TIN ĐƠN */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Mã đơn hàng</p>

            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              {order.id || order.orderId}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Ngày đặt: {formatDate(order.createdAt)}
            </p>
          </div>

          <span
            className={`inline-flex w-fit px-4 py-2 rounded-full text-sm font-semibold ${getStatusClass(
              order.status
            )}`}
          >
            {STATUS_OPTIONS.find((item) => item.value === order.status)
              ?.label || "Chờ xác nhận"}
          </span>
        </div>
      </div>

      {/* CẬP NHẬT TRẠNG THÁI */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
            <FiClock size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Cập nhật trạng thái
            </h2>

            <p className="text-sm text-gray-500">
              Thay đổi tiến trình xử lý đơn hàng
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleSaveStatus}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition"
          >
            Cập nhật
          </button>
        </div>

        {savedMessage && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
            <FiCheckCircle />
            {savedMessage}
          </div>
        )}
      </div>

      {/* KHÁCH HÀNG + ĐỊA CHỈ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KHÁCH HÀNG */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
              <FiUser size={20} />
            </div>

            <h2 className="text-lg font-semibold text-gray-800">
              Thông tin khách hàng
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Họ và tên</p>

              <p className="font-medium text-gray-800 mt-1">
                {customer.name || customer.fullName || "Khách hàng"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Số điện thoại</p>

              <p className="font-medium text-gray-800 mt-1">
                {customer.phone || order.phone || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>

              <p className="font-medium text-gray-800 mt-1 break-all">
                {customer.email || order.email || "—"}
              </p>
            </div>

            {customer.note && (
              <div>
                <p className="text-sm text-gray-500">Ghi chú</p>

                <p className="font-medium text-gray-800 mt-1">
                  {customer.note}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ĐỊA CHỈ */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
              <FiMapPin size={20} />
            </div>

            <h2 className="text-lg font-semibold text-gray-800">
              Địa chỉ nhận hàng
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Thành phố</p>

              <p className="font-medium text-gray-800 mt-1">
                {address.provinceName || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Phường/Xã</p>

              <p className="font-medium text-gray-800 mt-1">
                {address.wardName || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Số nhà, tên đường</p>

              <p className="font-medium text-gray-800 mt-1">
                {address.street || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SẢN PHẨM */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
            <FiPackage size={20} />
          </div>

          <h2 className="text-lg font-semibold text-gray-800">Sản phẩm</h2>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-lg object-cover bg-gray-100"
              />

              <div className="flex-1">
                <p className="font-semibold text-gray-800">{item.name}</p>

                <p className="text-sm text-gray-500 mt-1">
                  Số lượng: {item.quantity}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Đơn giá: {formatCurrency(item.price)}
                </p>
              </div>

              <div className="font-semibold text-pink-600">
                {formatCurrency(
                  Number(item.price || 0) * Number(item.quantity || 0)
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* THANH TOÁN */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
            <FiCreditCard size={20} />
          </div>

          <h2 className="text-lg font-semibold text-gray-800">Thanh toán</h2>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Phương thức thanh toán</p>

            <p className="font-medium text-gray-800 mt-1">
              {order.paymentMethod === "cod"
                ? "Thanh toán khi nhận hàng (COD)"
                : order.paymentMethod || "—"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">Tổng cộng</p>

            <p className="text-2xl font-bold text-pink-600 mt-1">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
