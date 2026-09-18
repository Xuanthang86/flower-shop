import { useMemo } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiPackage,
  FiMapPin,
  FiClock,
  FiCreditCard,
} from "react-icons/fi";

import { useOrder } from "@/context/OrderContext";

import OrderAddress from "@/components/orders/OrderAddress";

import {
  STATUS_OPTIONS,
  normalizeOrderStatus,
  getStatusLabel,
} from "@/utils/orderStatus";

import {
  PAYMENT_STATUS,
  PAYMENT_STATUS_OPTIONS,
  getPaymentStatusLabel,
  getPaymentStatusClass,
} from "@/utils/paymentStatus";

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

const formatDistance = (value) => {
  const distance = Number(value);

  if (!Number.isFinite(distance)) {
    return "—";
  }

  return `${distance.toFixed(2)} km`;
};

const getPaymentLabel = (paymentMethod) => {
  if (paymentMethod === "cod") {
    return "Thanh toán khi nhận hàng (COD)";
  }

  if (paymentMethod === "bank_transfer") {
    return "Chuyển khoản ngân hàng";
  }

  return paymentMethod || "—";
};

const AdminOrderDetailPage = () => {
  const { orderId } = useParams();

  const navigate = useNavigate();

  const {
    getOrderById,
    getPaymentByOrderId,
    updateOrderStatus,
    updateOrderPaymentStatus,
  } = useOrder();

  const order = useMemo(() => getOrderById(orderId), [getOrderById, orderId]);

  const payment = useMemo(
    () => getPaymentByOrderId(orderId),
    [getPaymentByOrderId, orderId]
  );

  if (!order) {
    return (
      <section className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">
            Không tìm thấy đơn hàng
          </h1>

          <button
            type="button"
            onClick={() => navigate("/admin/orders")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-pink-50 hover:text-pink-600"
          >
            <FiArrowLeft />
            Quay lại Quản lý đơn hàng
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
    order.grandTotal ??
      order.total ??
      order.totalAmount ??
      order.cartTotal ??
      order.subtotal ??
      0
  );

  const subtotal = Number(order.subtotal || 0);

  const discountAmount = Math.max(
    0,
    Number(
      order.discountAmount ??
        order.couponSnapshot?.discountAmount ??
        0
    ) || 0
  );

  const shippingFee = Number(order.shippingFee || 0);

  const status = normalizeOrderStatus(order.status);

  const paymentStatus = payment?.status || PAYMENT_STATUS.PENDING;

  const shippingSnapshot = order.shippingSnapshot || {};

  const deliveryModeLabel =
    shippingSnapshot.deliveryModeLabel || order.deliveryModeLabel || "—";

  const deliveryDate =
    shippingSnapshot.deliveryDate || order.deliveryDate || "";

  const deliveryTimeSlotLabel =
    shippingSnapshot.deliveryTimeSlotLabel || order.deliveryTimeSlotLabel || "";

  const estimatedDeliveryTime =
    shippingSnapshot.estimatedDeliveryTime || order.estimatedDeliveryTime || "";

  const distanceKm =
    shippingSnapshot.distanceKm ?? order.deliveryDistanceKm ?? null;

  const deliveryNote =
    shippingSnapshot.deliveryNote || order.deliveryNote || "";

  const handleStatusChange = async (event) => {
    const result = await updateOrderStatus(order.id, event.target.value);

    if (result?.success === false) {
      window.alert(result.message || "Không thể cập nhật trạng thái.");
    }
  };

  const handlePaymentStatusChange = async (event) => {
    const nextStatus = event.target.value;

    const result = await updateOrderPaymentStatus(order.id, nextStatus, {
      reference: payment?.reference || order.paymentReference || "",

      transactionId: payment?.transactionId || order.paymentTransactionId || "",

      transaction: payment?.transaction || order.paymentTransaction || null,

      paidAt: payment?.paidAt || null,

      failedAt: payment?.failedAt || null,

      refundedAt: payment?.refundedAt || null,

      failureReason: payment?.failureReason || "",

      refundAmount: payment?.refundAmount || 0,
    });

    if (result?.success === false) {
      window.alert(
        result.message || "Không thể cập nhật trạng thái thanh toán."
      );
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-pink-50 hover:text-pink-600"
          >
            <FiArrowLeft size={17} />
            Quay lại Quản lý đơn hàng
          </Link>

          <div className="mt-5">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Chi tiết đơn hàng #{order.id}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Đặt ngày: {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* ORDER STATUS */}

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Trạng thái đơn hàng</p>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="font-semibold text-gray-800">
                {getStatusLabel(status)}
              </span>

              <select
                value={status}
                onChange={handleStatusChange}
                className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-pink-200"
              >
                {STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PAYMENT STATUS */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <FiCreditCard className="text-pink-600" />

              <div>
                <p className="text-sm text-gray-500">Trạng thái thanh toán</p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${getPaymentStatusClass(
                    paymentStatus
                  )}`}
                >
                  {getPaymentStatusLabel(paymentStatus)}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="paymentStatus"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Cập nhật Payment Status
              </label>

              <select
                id="paymentStatus"
                value={paymentStatus}
                onChange={handlePaymentStatusChange}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              >
                {PAYMENT_STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CUSTOMER + ADDRESS */}

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800">
              Thông tin người nhận
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Họ và tên</p>

                <p className="mt-1 font-medium">
                  {customer.fullName || customer.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>

                <p className="mt-1 font-medium">{customer.phone || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>

                <p className="mt-1 break-all font-medium">
                  {customer.email || "—"}
                </p>
              </div>

              {customer.note && (
                <div>
                  <p className="text-sm text-gray-500">Ghi chú</p>

                  <p className="mt-1 font-medium">{customer.note}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <FiMapPin className="text-pink-600" />

              <h2 className="text-lg font-semibold text-gray-800">
                Địa chỉ giao hàng
              </h2>
            </div>

            <div className="mt-5">
              <OrderAddress address={address} />
            </div>
          </div>
        </div>

        {/* DELIVERY */}

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <FiClock className="text-pink-600" />

            <h2 className="text-lg font-semibold text-gray-800">
              Thông tin giao hàng
            </h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500">Hình thức giao</p>

              <p className="mt-1 font-semibold text-gray-800">
                {deliveryModeLabel}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Ngày giao</p>

              <p className="mt-1 font-semibold text-gray-800">
                {deliveryDate || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Khung giờ</p>

              <p className="mt-1 font-semibold text-gray-800">
                {deliveryTimeSlotLabel || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Khoảng cách</p>

              <p className="mt-1 font-semibold text-gray-800">
                {formatDistance(distanceKm)}
              </p>
            </div>
          </div>

          {estimatedDeliveryTime && (
            <div className="mt-5 rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Thời gian giao dự kiến</p>

              <p className="mt-1 font-semibold text-gray-800">
                {estimatedDeliveryTime}
              </p>
            </div>
          )}

          {deliveryNote && (
            <div className="mt-4 rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Ghi chú giao hàng</p>

              <p className="mt-1 text-gray-800">{deliveryNote}</p>
            </div>
          )}
        </div>

        {/* PRODUCTS */}

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <FiPackage className="text-pink-600" />

            <h2 className="text-lg font-semibold text-gray-800">Sản phẩm</h2>
          </div>

          <div className="mt-5 space-y-4">
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
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                      {item?.image ? (
                        <img
                          src={item.image}
                          alt={item.name || "Sản phẩm"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          <FiPackage />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800">
                        {item.name || "Sản phẩm"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Số lượng: {quantity}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
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

        {/* PAYMENT DETAIL */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">
            Chi tiết thanh toán
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Phương thức</span>

              <span className="font-medium text-gray-800">
                {getPaymentLabel(payment?.method || order.paymentMethod)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Nhà cung cấp</span>

              <span className="font-medium text-gray-800">
                {payment?.provider || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Số tiền thanh toán</span>

              <span className="font-semibold text-gray-800">
                {formatCurrency(payment?.amount || total)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Reference</span>

              <span className="break-all text-right font-semibold text-gray-800">
                {payment?.reference || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Transaction ID</span>

              <span className="break-all text-right font-semibold text-gray-800">
                {payment?.transactionId || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Thời gian thanh toán</span>

              <span className="text-right font-medium text-gray-800">
                {formatDate(payment?.paidAt)}
              </span>
            </div>

            {payment?.paymentAttemptedAt && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">Bắt đầu thanh toán</span>

                <span className="text-right font-medium text-gray-800">
                  {formatDate(payment.paymentAttemptedAt)}
                </span>
              </div>
            )}

            {payment?.transferContent && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-gray-500">Nội dung chuyển khoản</span>

                <span className="max-w-[60%] break-words text-right font-medium text-gray-800">
                  {payment.transferContent}
                </span>
              </div>
            )}

            {payment?.failureReason && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Lý do thất bại
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {payment.failureReason}
                </p>
              </div>
            )}

            {paymentStatus === PAYMENT_STATUS.REFUNDED && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">Số tiền hoàn</span>

                <span className="font-semibold text-purple-700">
                  {formatCurrency(payment?.refundAmount || 0)}
                </span>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">Tạm tính</span>

                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-gray-500">Giảm giá</span>

                  <span className="font-semibold text-green-600">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-gray-500">Phí giao hàng</span>

                <span className="font-medium">
                  {shippingFee > 0 ? formatCurrency(shippingFee) : "Miễn phí"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-200 pt-4">
                <span className="font-semibold text-gray-800">Tổng cộng</span>

                <span className="text-2xl font-bold text-pink-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminOrderDetailPage;
