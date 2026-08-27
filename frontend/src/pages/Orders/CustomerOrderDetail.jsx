import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiMapPin,
  FiPackage,
  FiCreditCard,
  FiClock,
} from "react-icons/fi";

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

const normalizeStatus = (status) => {
  if (status === "Đã đặt hàng") {
    return "pending";
  }

  return status || "pending";
};

const getStatusLabel = (status) => {
  const normalizedStatus = normalizeStatus(status);

  const found = STATUS_OPTIONS.find((item) => item.value === normalizedStatus);

  return found ? found.label : "Chờ xác nhận";
};

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

    case "completed":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

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

const getCustomer = (order) => {
  return order?.customer || {};
};

const getAddress = (order) => {
  const customer = getCustomer(order);

  return customer?.address || order?.shippingAddress || order?.address || {};
};

const getItems = (order) => {
  if (Array.isArray(order?.items)) {
    return order.items;
  }

  if (Array.isArray(order?.products)) {
    return order.products;
  }

  return [];
};

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

const getCustomerName = (order) => {
  const customer = getCustomer(order);
  const address = getAddress(order);

  return (
    customer?.name ||
    customer?.fullName ||
    order?.customerName ||
    order?.name ||
    address?.name ||
    "Khách hàng"
  );
};

const getCustomerPhone = (order) => {
  const customer = getCustomer(order);
  const address = getAddress(order);

  return (
    customer?.phone ||
    order?.customerPhone ||
    order?.phone ||
    address?.phone ||
    "—"
  );
};

const getCustomerEmail = (order) => {
  const customer = getCustomer(order);

  return customer?.email || order?.email || "—";
};

const getProvince = (address) => {
  return (
    address?.provinceName ||
    address?.province ||
    address?.cityName ||
    address?.city ||
    "—"
  );
};

const getWard = (address) => {
  return (
    address?.wardName ||
    address?.ward ||
    address?.communeName ||
    address?.commune ||
    "—"
  );
};

const getStreet = (address) => {
  return (
    address?.street ||
    address?.streetName ||
    address?.addressLine ||
    address?.detail ||
    address?.fullAddress ||
    "—"
  );
};

const CustomerOrderDetail = ({ order }) => {
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="text-5xl mb-4">📦</div>

            <h1 className="text-xl font-bold text-gray-800">
              Không tìm thấy đơn hàng
            </h1>

            <p className="text-gray-500 mt-2">
              Đơn hàng không tồn tại hoặc mã đơn hàng không chính xác.
            </p>

            <Link
              to="/orders"
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-pink-600 text-white font-medium hover:bg-pink-700 transition"
            >
              <FiArrowLeft size={17} />
              Quay lại đơn hàng của tôi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const customer = getCustomer(order);
  const address = getAddress(order);
  const items = getItems(order);
  const total = getOrderTotal(order);

  const orderId = order?.id || order?.orderId;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* BACK */}
        <div className="mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-pink-600 transition"
          >
            <FiArrowLeft size={17} />
            Quay lại đơn hàng của tôi
          </Link>
        </div>

        {/* HEADER */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-sm text-gray-500">Mã đơn hàng</p>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                {orderId}
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                Ngày đặt: {formatDate(order.createdAt)}
              </p>
            </div>

            <span
              className={`inline-flex w-fit px-4 py-2 rounded-full text-sm font-semibold ${getStatusClass(
                order.status
              )}`}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        {/* CUSTOMER + ADDRESS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* CUSTOMER */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                <FiUser size={20} />
              </div>

              <h2 className="text-lg font-semibold text-gray-800">
                Thông tin người nhận
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Họ và tên</p>

                <p className="font-medium text-gray-800 mt-1">
                  {getCustomerName(order)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>

                <p className="font-medium text-gray-800 mt-1">
                  {getCustomerPhone(order)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>

                <p className="font-medium text-gray-800 mt-1 break-all">
                  {getCustomerEmail(order)}
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

          {/* ADDRESS */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
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
                  {getProvince(address)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phường/Xã</p>

                <p className="font-medium text-gray-800 mt-1">
                  {getWard(address)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Số nhà, tên đường</p>

                <p className="font-medium text-gray-800 mt-1">
                  {getStreet(address)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <FiPackage size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800">Sản phẩm</h2>

              <p className="text-sm text-gray-500 mt-1">
                {items.length} sản phẩm
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Không có thông tin sản phẩm.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const itemId =
                  item?.id ||
                  item?.productId ||
                  `${item?.name || "item"}-${index}`;

                const quantity = Number(item?.quantity || 1);

                const price = Number(item?.price || 0);

                return (
                  <div
                    key={itemId}
                    className="flex gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {item?.image ? (
                        <img
                          src={item.image}
                          alt={item?.name || "Sản phẩm"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiPackage size={25} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800">
                        {item?.name || "Sản phẩm"}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        Số lượng: {quantity}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Đơn giá: {formatCurrency(price)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-semibold text-pink-600">
                        {formatCurrency(price * quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PAYMENT */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <FiCreditCard size={20} />
            </div>

            <h2 className="text-lg font-semibold text-gray-800">Thanh toán</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Phương thức thanh toán</p>

              <p className="font-medium text-gray-800 mt-1">
                {order?.paymentMethod === "cod"
                  ? "Thanh toán khi nhận hàng (COD)"
                  : order?.paymentMethod || "—"}
              </p>
            </div>

            <div className="md:text-right">
              <p className="text-sm text-gray-500">Tổng cộng</p>

              <p className="text-2xl font-bold text-pink-600 mt-1">
                {formatCurrency(total)}
              </p>
            </div>
          </div>
        </div>

        {/* STATUS NOTE */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
              <FiClock size={19} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">
                Trạng thái đơn hàng
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Đơn hàng hiện đang ở trạng thái:{" "}
                <span className="font-medium text-gray-700">
                  {getStatusLabel(order.status)}
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderDetail;
