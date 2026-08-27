import { useContext, useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiPackage,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";

import { OrderContext } from "@/context/OrderContext";
import { AuthContext } from "@/context/AuthContext";

/* =====================================================
   TRẠNG THÁI ĐƠN HÀNG

   delivered = Đã giao
===================================================== */

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
    value: "delivered",
    label: "Đã giao",
  },
  {
    value: "cancelled",
    label: "Đã hủy",
  },
];

/* =====================================================
   CHUẨN HÓA TRẠNG THÁI
===================================================== */

const normalizeStatus = (status) => {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  const map = {
    "": "pending",

    pending: "pending",
    "chờ xác nhận": "pending",
    "đã đặt hàng": "pending",

    confirmed: "confirmed",
    "đã xác nhận": "confirmed",

    preparing: "preparing",
    "đang chuẩn bị": "preparing",

    shipping: "shipping",
    "đang giao": "shipping",

    delivered: "delivered",
    "đã giao": "delivered",

    // Tương thích dữ liệu cũ
    completed: "delivered",
    "hoàn thành": "delivered",

    cancelled: "cancelled",
    canceled: "cancelled",
    "đã hủy": "cancelled",
  };

  return map[value] || "pending";
};

/* =====================================================
   TÊN TRẠNG THÁI
===================================================== */

const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);

  return (
    STATUS_OPTIONS.find((item) => item.value === normalized)?.label ||
    "Chờ xác nhận"
  );
};

/* =====================================================
   MÀU TRẠNG THÁI
===================================================== */

const getStatusClass = (status) => {
  switch (normalizeStatus(status)) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";

    case "confirmed":
      return "bg-blue-100 text-blue-700";

    case "preparing":
      return "bg-purple-100 text-purple-700";

    case "shipping":
      return "bg-orange-100 text-orange-700";

    case "delivered":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

/* =====================================================
   FORMAT TIỀN
===================================================== */

const formatCurrency = (value = 0) => {
  return `${Number(value || 0).toLocaleString("vi-VN")} ₫`;
};

/* =====================================================
   FORMAT NGÀY
===================================================== */

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("vi-VN");
};

/* =====================================================
   MÃ ĐƠN
===================================================== */

const getOrderId = (order) => {
  return String(order?.id || order?.orderId || "").replace(/^#/, "");
};

/* =====================================================
   TỔNG TIỀN
===================================================== */

const getOrderTotal = (order) => {
  return (
    Number(
      order?.total ??
        order?.totalAmount ??
        order?.cartTotal ??
        order?.grandTotal ??
        order?.subtotal ??
        0
    ) || 0
  );
};

/* =====================================================
   ĐỊA CHỈ

   Hỗ trợ cả:
   customer.address
   shippingAddress
   customerAddress
   address
===================================================== */

const getOrderAddress = (order) => {
  const customer = order?.customer || {};

  const address =
    customer?.address ||
    order?.shippingAddress ||
    order?.customerAddress ||
    order?.address ||
    {};

  return {
    provinceCode:
      address?.provinceCode ||
      address?.province_id ||
      address?.provinceId ||
      "",

    provinceName:
      address?.provinceName ||
      address?.province ||
      address?.province_name ||
      "",

    wardCode: address?.wardCode || address?.ward_id || address?.wardId || "",

    wardName:
      address?.wardName ||
      address?.ward ||
      address?.ward_name ||
      address?.communeName ||
      "",

    houseNumber:
      address?.houseNumber || address?.house_number || address?.house || "",

    street:
      address?.street || address?.streetName || address?.street_name || "",

    note: address?.note || "",
  };
};

/* =====================================================
   ĐỊA CHỈ ĐẦY ĐỦ
===================================================== */

const getFullAddress = (address) => {
  const parts = [
    address?.houseNumber,
    address?.street,
    address?.wardName,
    address?.provinceName,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "—";
};

/* =====================================================
   COMPONENT
===================================================== */

const CustomerOrderDetailPage = () => {
  const { orderId } = useParams();

  const orderContext = useContext(OrderContext);

  const authContext = useContext(AuthContext);

  const { orders = [], canViewOrder } = orderContext || {};

  const { user } = authContext || {};

  /* ===================================================
     TÌM ĐƠN
  =================================================== */

  const order = useMemo(() => {
    if (!orderId || !Array.isArray(orders)) {
      return null;
    }

    const normalizedOrderId = String(orderId).replace(/^#/, "");

    return (
      orders.find((item) => {
        const currentId = String(item?.id || item?.orderId || "").replace(
          /^#/,
          ""
        );

        return currentId === normalizedOrderId;
      }) || null
    );
  }, [orders, orderId]);

  /* ===================================================
     KHÔNG TÌM THẤY
  =================================================== */

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FiPackage size={52} className="mx-auto text-gray-300 mb-4" />

            <h1 className="text-xl font-bold text-gray-800">
              Không tìm thấy đơn hàng
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Đơn hàng không tồn tại hoặc mã đơn hàng không chính xác.
            </p>

            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-2 mt-6 px-5 py-3 rounded-xl bg-pink-600 text-white font-medium hover:bg-pink-700 transition"
            >
              <FiArrowLeft size={17} />
              Quay lại đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ===================================================
     QUYỀN XEM
  =================================================== */

  const hasPermission =
    typeof canViewOrder === "function"
      ? canViewOrder(order)
      : user?.role === "admin" ||
        user?.role === "manager" ||
        String(order?.customerId || "") === String(user?.id || "");

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FiUser size={52} className="mx-auto text-gray-300 mb-4" />

            <h1 className="text-xl font-bold text-gray-800">
              Bạn không có quyền xem đơn hàng này
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Đơn hàng này không thuộc tài khoản hiện tại.
            </p>

            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-2 mt-6 px-5 py-3 rounded-xl bg-pink-600 text-white font-medium hover:bg-pink-700 transition"
            >
              <FiArrowLeft size={17} />
              Quay lại đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ===================================================
     DỮ LIỆU
  =================================================== */

  const customer = order?.customer || {};

  const address = getOrderAddress(order);

  const items = Array.isArray(order?.items)
    ? order.items
    : Array.isArray(order?.products)
      ? order.products
      : [];

  const total = getOrderTotal(order);

  const customerName =
    customer?.name || customer?.fullName || order?.customerName || "Khách hàng";

  const phone = customer?.phone || order?.phone || "—";

  const email = customer?.email || order?.email || "—";

  const fullAddress = getFullAddress(address);

  const normalizedStatus = normalizeStatus(order?.status);

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-10">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* QUAY LẠI */}
        <div className="mb-5">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition"
          >
            <FiArrowLeft size={17} />
            Quay lại đơn hàng của tôi
          </Link>
        </div>

        {/* HEADER */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Mã đơn hàng</p>

              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                #{getOrderId(order)}
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                Ngày đặt: {formatDate(order?.createdAt)}
              </p>

              {order?.updatedAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Cập nhật: {formatDate(order.updatedAt)}
                </p>
              )}
            </div>

            <span
              className={`inline-flex w-fit px-4 py-2 rounded-full text-sm font-semibold ${getStatusClass(
                normalizedStatus
              )}`}
            >
              {getStatusLabel(normalizedStatus)}
            </span>
          </div>
        </div>

        {/* KHÁCH HÀNG + ĐỊA CHỈ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* KHÁCH HÀNG */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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

                <p className="font-medium text-gray-800 mt-1">{customerName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>

                <p className="font-medium text-gray-800 mt-1">{phone}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>

                <p className="font-medium text-gray-800 mt-1 break-all">
                  {email}
                </p>
              </div>

              {customer?.note && (
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                <FiMapPin size={20} />
              </div>

              <h2 className="text-lg font-semibold text-gray-800">
                Địa chỉ giao hàng
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Số nhà</p>

                <p className="font-medium text-gray-800 mt-1">
                  {address.houseNumber || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Tên đường</p>

                <p className="font-medium text-gray-800 mt-1">
                  {address.street || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phường/Xã</p>

                <p className="font-medium text-gray-800 mt-1">
                  {address.wardName || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Tỉnh/Thành phố</p>

                <p className="font-medium text-gray-800 mt-1">
                  {address.provinceName || "—"}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">Địa chỉ đầy đủ</p>

                <p className="font-semibold text-gray-900 mt-1">
                  {fullAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SẢN PHẨM */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
              <FiPackage size={20} />
            </div>

            <h2 className="text-lg font-semibold text-gray-800">Sản phẩm</h2>
          </div>

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
                    <img
                      src={item?.image}
                      alt={item?.name || "Sản phẩm"}
                      className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                    />

                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {item?.name || "Sản phẩm"}
                      </p>

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

        {/* THANH TOÁN */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
              <FiCreditCard size={20} />
            </div>

            <h2 className="text-lg font-semibold text-gray-800">Thanh toán</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Phương thức thanh toán</p>

              <p className="font-medium text-gray-800 mt-1">
                {order?.paymentMethod === "cod"
                  ? "Thanh toán khi nhận hàng (COD)"
                  : order?.paymentMethod || "—"}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-sm text-gray-500">Tổng cộng</p>

              <p className="text-2xl font-bold text-pink-600 mt-1">
                {formatCurrency(total)}
              </p>
            </div>
          </div>
        </div>

        {/* TRẠNG THÁI */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                normalizedStatus === "delivered"
                  ? "bg-green-100 text-green-600"
                  : "bg-pink-100 text-pink-600"
              }`}
            >
              {normalizedStatus === "delivered" ? (
                <FiCheckCircle size={20} />
              ) : (
                <FiClock size={20} />
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500">Trạng thái đơn hàng</p>

              <p className="font-semibold text-gray-800 mt-1">
                {getStatusLabel(normalizedStatus)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderDetailPage;
