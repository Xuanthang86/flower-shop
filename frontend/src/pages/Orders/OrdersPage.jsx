import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCheck,
  FiChevronDown,
  FiEye,
  FiFilter,
  FiPackage,
  FiSearch,
} from "react-icons/fi";

import { OrderContext } from "@/context/OrderContext";

/* =====================================================
   TRẠNG THÁI ĐƠN HÀNG
===================================================== */

const STATUS_OPTIONS = [
  {
    value: "all",
    label: "Tất cả trạng thái",
  },
  {
    value: "pending",
    label: "Chờ xác nhận",
  },
  {
    value: "confirmed",
    label: "Đã xác nhận",
  },
  {
    value: "processing",
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

   Trạng thái nội bộ chuẩn:

   pending
   confirmed
   processing
   shipping
   delivered
   cancelled

   preparing chỉ hỗ trợ dữ liệu cũ.
   completed chỉ hỗ trợ dữ liệu cũ.
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

    processing: "processing",
    preparing: "processing",
    "đang chuẩn bị": "processing",

    shipping: "shipping",
    "đang giao": "shipping",

    delivered: "delivered",
    "đã giao": "delivered",

    // Dữ liệu cũ
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

    case "processing":
      return "bg-purple-100 text-purple-700";

    case "shipping":
      return "bg-orange-100 text-orange-700";

    case "delivered":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

/* =====================================================
   TIỀN
===================================================== */

const formatCurrency = (value = 0) => {
  return `${Number(value || 0).toLocaleString("vi-VN")} ₫`;
};

/* =====================================================
   NGÀY
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
   KHÁCH HÀNG
===================================================== */

const getCustomerName = (order) => {
  return (
    order?.customer?.name ||
    order?.customer?.fullName ||
    order?.customerName ||
    "Khách hàng"
  );
};

/* =====================================================
   SỐ SẢN PHẨM
===================================================== */

const getProductCount = (order) => {
  const items = Array.isArray(order?.items)
    ? order.items
    : Array.isArray(order?.products)
      ? order.products
      : [];

  return items.reduce((total, item) => total + Number(item?.quantity || 0), 0);
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
   PAYMENT
===================================================== */

const getPaymentMethod = (order) => {
  const method = String(order?.paymentMethod || "").toLowerCase();

  switch (method) {
    case "cod":
      return "COD";

    case "bank":
    case "bank_transfer":
    case "bank-transfer":
      return "Chuyển khoản";

    case "momo":
      return "MoMo";

    case "vnpay":
      return "VNPay";

    default:
      return order?.paymentMethod || "—";
  }
};

/* =====================================================
   COMPONENT
===================================================== */

const OrdersPage = () => {
  const { getMyOrders } = useContext(OrderContext);

  const orders = typeof getMyOrders === "function" ? getMyOrders() : [];

  const [searchKeyword, setSearchKeyword] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [statusOpen, setStatusOpen] = useState(false);

  const statusMenuRef = useRef(null);

  /* ===================================================
     ĐÓNG DROPDOWN KHI CLICK RA NGOÀI
  =================================================== */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(event.target)
      ) {
        setStatusOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* ===================================================
     LỌC
  =================================================== */

  const filteredOrders = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return orders.filter((order) => {
      const orderId = getOrderId(order).toLowerCase();

      const customerName = getCustomerName(order).toLowerCase();

      const status = normalizeStatus(order?.status);

      const matchesKeyword =
        !keyword || orderId.includes(keyword) || customerName.includes(keyword);

      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [orders, searchKeyword, statusFilter]);

  const selectedStatus =
    STATUS_OPTIONS.find((item) => item.value === statusFilter) ||
    STATUS_OPTIONS[0];

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-10">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* HEADER */}

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
              <FiPackage size={22} />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                Đơn hàng của tôi
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Theo dõi các đơn hàng bạn đã đặt tại T Flower Shop.
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH + FILTER */}

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            {/* SEARCH */}

            <div className="relative min-w-0">
              <FiSearch
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder="Tìm theo mã đơn hàng hoặc tên..."
                className="w-full min-w-0 rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
            </div>

            {/* STATUS DROPDOWN */}

            <div ref={statusMenuRef} className="relative min-w-0">
              <FiFilter
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
              />

              <button
                type="button"
                onClick={() => setStatusOpen((value) => !value)}
                className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-left text-sm text-gray-700 outline-none transition hover:border-pink-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                aria-haspopup="listbox"
                aria-expanded={statusOpen}
              >
                <span className="min-w-0 flex-1 truncate">
                  {selectedStatus.label}
                </span>

                <FiChevronDown
                  size={18}
                  className={`shrink-0 transition-transform ${
                    statusOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {statusOpen && (
                <div
                  className="
                    absolute left-0 right-0 top-full z-[80]
                    mt-2 max-h-[min(360px,60vh)]
                    overflow-y-auto overflow-x-hidden
                    rounded-xl border border-gray-100
                    bg-white p-2 shadow-xl
                  "
                  role="listbox"
                  aria-label="Lọc theo trạng thái đơn hàng"
                >
                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = option.value === statusFilter;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setStatusFilter(option.value);

                          setStatusOpen(false);
                        }}
                        className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                          isSelected
                            ? "bg-pink-50 font-semibold text-pink-600"
                            : "text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {option.label}
                        </span>

                        {isSelected && (
                          <FiCheck
                            size={17}
                            className="shrink-0 text-pink-600"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DANH SÁCH */}

        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <FiPackage size={50} className="mx-auto mb-4 text-gray-300" />

            <h2 className="text-xl font-semibold text-gray-800">
              Không có đơn hàng
            </h2>

            <p className="mt-2 text-gray-500">
              Không tìm thấy đơn hàng phù hợp.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const status = normalizeStatus(order?.status);

              return (
                <div
                  key={getOrderId(order)}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">Mã đơn hàng</p>

                      <h2 className="mt-1 text-lg font-bold text-gray-900">
                        #{getOrderId(order)}
                      </h2>

                      <p className="mt-2 text-sm text-gray-500">
                        Thời gian đặt hàng: {formatDate(order?.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit max-w-full shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${getStatusClass(
                        status
                      )}`}
                    >
                      <span className="truncate">{getStatusLabel(status)}</span>
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 md:grid-cols-4">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Người nhận</p>

                      <p className="mt-1 truncate font-medium text-gray-800">
                        {getCustomerName(order)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Sản phẩm</p>

                      <p className="mt-1 font-medium text-gray-800">
                        {getProductCount(order)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Thanh toán</p>

                      <p className="mt-1 truncate font-medium text-gray-800">
                        {getPaymentMethod(order)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Tổng cộng</p>

                      <p className="mt-1 truncate font-bold text-pink-600">
                        {formatCurrency(getOrderTotal(order))}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <Link
                      to={`/orders/${getOrderId(order)}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-gray-700 transition hover:border-pink-300 hover:text-pink-600"
                    >
                      <FiEye size={17} />

                      <span>Xem chi tiết</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
