// import { useContext, useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import { FiPackage, FiEye, FiSearch, FiFilter } from "react-icons/fi";

// import { OrderContext } from "@/context/OrderContext";

// /* =====================================================
//    TRẠNG THÁI ĐƠN HÀNG
// ===================================================== */

// const STATUS_OPTIONS = [
//   {
//     value: "all",
//     label: "Tất cả trạng thái",
//   },
//   {
//     value: "pending",
//     label: "Chờ xác nhận",
//   },
//   {
//     value: "confirmed",
//     label: "Đã xác nhận",
//   },
//   {
//     value: "preparing",
//     label: "Đang chuẩn bị",
//   },
//   {
//     value: "shipping",
//     label: "Đang giao",
//   },
//   {
//     value: "completed",
//     label: "Đã giao",
//   },
//   {
//     value: "cancelled",
//     label: "Đã hủy",
//   },
// ];

// /* =====================================================
//    CHUẨN HÓA TRẠNG THÁI
// ===================================================== */

// const normalizeStatus = (status) => {
//   if (status === "Đã đặt hàng") {
//     return "pending";
//   }

//   return status || "pending";
// };

// /* =====================================================
//    LẤY TÊN TRẠNG THÁI
// ===================================================== */

// const getStatusLabel = (status) => {
//   const normalizedStatus = normalizeStatus(status);

//   const item = STATUS_OPTIONS.find(
//     (option) => option.value === normalizedStatus
//   );

//   return item?.label || "Chờ xác nhận";
// };

// /* =====================================================
//    CLASS TRẠNG THÁI
// ===================================================== */

// const getStatusClass = (status) => {
//   const normalizedStatus = normalizeStatus(status);

//   switch (normalizedStatus) {
//     case "pending":
//       return "bg-yellow-100 text-yellow-700";

//     case "confirmed":
//       return "bg-blue-100 text-blue-700";

//     case "preparing":
//       return "bg-purple-100 text-purple-700";

//     case "shipping":
//       return "bg-orange-100 text-orange-700";

//     case "completed":
//       return "bg-green-100 text-green-700";

//     case "cancelled":
//       return "bg-red-100 text-red-700";

//     default:
//       return "bg-gray-100 text-gray-600";
//   }
// };

// /* =====================================================
//    FORMAT TIỀN VIỆT NAM
// ===================================================== */

// const formatCurrency = (value = 0) => {
//   const number = Number(value || 0);

//   return `${number.toLocaleString("vi-VN")} ₫`;
// };

// /* =====================================================
//    FORMAT NGÀY GIỜ
// ===================================================== */

// const formatDate = (value) => {
//   if (!value) {
//     return "—";
//   }

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return "—";
//   }

//   return date.toLocaleString("vi-VN");
// };

// /* =====================================================
//    LẤY MÃ ĐƠN HÀNG
// ===================================================== */

// const getOrderId = (order) => {
//   const id = order?.id || order?.orderId || "";

//   return String(id).replace(/^#/, "");
// };

// /* =====================================================
//    LẤY TÊN KHÁCH HÀNG
// ===================================================== */

// const getCustomerName = (order) => {
//   return (
//     order?.customer?.name ||
//     order?.customer?.fullName ||
//     order?.customerName ||
//     order?.shippingAddress?.name ||
//     order?.shippingAddress?.fullName ||
//     "Khách hàng"
//   );
// };

// /* =====================================================
//    LẤY TỔNG TIỀN ĐƠN HÀNG
// ===================================================== */

// const getOrderTotal = (order) => {
//   return (
//     Number(
//       order?.total ??
//         order?.totalAmount ??
//         order?.cartTotal ??
//         order?.grandTotal ??
//         order?.subtotal ??
//         0
//     ) || 0
//   );
// };

// /* =====================================================
//    ĐẾM SẢN PHẨM
// ===================================================== */

// const getItemsCount = (order) => {
//   if (Array.isArray(order?.items)) {
//     return order.items.reduce(
//       (total, item) => total + Number(item?.quantity || 0),
//       0
//     );
//   }

//   if (Array.isArray(order?.products)) {
//     return order.products.reduce(
//       (total, item) => total + Number(item?.quantity || 0),
//       0
//     );
//   }

//   return 0;
// };

// /* =====================================================
//    PHƯƠNG THỨC THANH TOÁN
// ===================================================== */

// const getPaymentMethod = (order) => {
//   const method = order?.paymentMethod;

//   if (!method) {
//     return "—";
//   }

//   switch (String(method).toLowerCase()) {
//     case "cod":
//       return "COD";

//     case "bank":
//     case "bank_transfer":
//     case "bank-transfer":
//       return "Chuyển khoản";

//     case "momo":
//       return "MoMo";

//     case "vnpay":
//       return "VNPay";

//     default:
//       return method;
//   }
// };

// /* =====================================================
//    COMPONENT
// ===================================================== */

// const OrdersPage = () => {
//   const { getMyOrders } = useContext(OrderContext);

//   const orders = getMyOrders();

//   const [searchKeyword, setSearchKeyword] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");

//   /* ===================================================
//      LỌC ĐƠN HÀNG
//   =================================================== */

//   const filteredOrders = useMemo(() => {
//     const keyword = searchKeyword.trim().toLowerCase();

//     return orders.filter((order) => {
//       const orderId = getOrderId(order).toLowerCase();

//       const customerName = getCustomerName(order).toLowerCase();

//       const normalizedStatus = normalizeStatus(order?.status);

//       const matchesKeyword =
//         !keyword || orderId.includes(keyword) || customerName.includes(keyword);

//       const matchesStatus =
//         statusFilter === "all" || normalizedStatus === statusFilter;

//       return matchesKeyword && matchesStatus;
//     });
//   }, [orders, searchKeyword, statusFilter]);

//   /* ===================================================
//      RENDER
//   =================================================== */

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 md:py-10">
//       <div className="max-w-6xl mx-auto px-4 md:px-6">
//         {/* =================================================
//             HEADER
//         ================================================== */}

//         <div className="mb-8">
//           <div className="flex items-center gap-3">
//             <div
//               className="
//                 w-11
//                 h-11
//                 rounded-xl
//                 bg-pink-100
//                 text-pink-600
//                 flex
//                 items-center
//                 justify-center
//                 flex-shrink-0
//               "
//             >
//               <FiPackage size={22} />
//             </div>

//             <div>
//               <h1
//                 className="
//                   text-2xl
//                   md:text-3xl
//                   font-bold
//                   text-gray-900
//                 "
//               >
//                 Đơn hàng của tôi
//               </h1>

//               <p className="text-sm text-gray-500 mt-1">
//                 Theo dõi các đơn hàng bạn đã đặt tại Flower Shop.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* =================================================
//             BỘ LỌC
//         ================================================== */}

//         <div
//           className="
//             bg-white
//             rounded-2xl
//             border
//             border-gray-100
//             shadow-sm
//             p-4
//             mb-6
//           "
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* TÌM KIẾM */}

//             <div className="relative">
//               <FiSearch
//                 size={18}
//                 className="
//                   absolute
//                   left-3
//                   top-1/2
//                   -translate-y-1/2
//                   text-gray-400
//                 "
//               />

//               <input
//                 type="text"
//                 value={searchKeyword}
//                 onChange={(event) => setSearchKeyword(event.target.value)}
//                 placeholder="Tìm theo mã đơn hàng hoặc tên khách hàng..."
//                 className="
//                   w-full
//                   border
//                   border-gray-200
//                   rounded-xl
//                   pl-10
//                   pr-4
//                   py-3
//                   text-sm
//                   outline-none
//                   focus:border-pink-500
//                   focus:ring-1
//                   focus:ring-pink-100
//                 "
//               />
//             </div>

//             {/* LỌC TRẠNG THÁI */}

//             <div className="relative">
//               <FiFilter
//                 size={17}
//                 className="
//                   absolute
//                   left-3
//                   top-1/2
//                   -translate-y-1/2
//                   text-gray-400
//                   pointer-events-none
//                 "
//               />

//               <select
//                 value={statusFilter}
//                 onChange={(event) => setStatusFilter(event.target.value)}
//                 className="
//                   w-full
//                   border
//                   border-gray-200
//                   rounded-xl
//                   pl-10
//                   pr-4
//                   py-3
//                   text-sm
//                   bg-white
//                   outline-none
//                   focus:border-pink-500
//                   focus:ring-1
//                   focus:ring-pink-100
//                   appearance-none
//                 "
//               >
//                 {STATUS_OPTIONS.map((status) => (
//                   <option key={status.value} value={status.value}>
//                     {status.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* =================================================
//             THÔNG TIN SỐ LƯỢNG
//         ================================================== */}

//         <div className="mb-4">
//           <p className="text-sm text-gray-500">
//             Hiển thị{" "}
//             <span className="font-semibold text-gray-800">
//               {filteredOrders.length}
//             </span>{" "}
//             /{" "}
//             <span className="font-semibold text-gray-800">{orders.length}</span>{" "}
//             đơn hàng
//           </p>
//         </div>

//         {/* =================================================
//             KHÔNG CÓ ĐƠN HÀNG
//         ================================================== */}

//         {filteredOrders.length === 0 ? (
//           <div
//             className="
//               bg-white
//               rounded-2xl
//               border
//               border-gray-100
//               shadow-sm
//               px-6
//               py-16
//               text-center
//             "
//           >
//             <FiPackage size={48} className="mx-auto text-gray-300 mb-4" />

//             <h2 className="text-lg font-semibold text-gray-800">
//               {orders.length === 0
//                 ? "Bạn chưa có đơn hàng"
//                 : "Không tìm thấy đơn hàng"}
//             </h2>

//             <p className="text-sm text-gray-500 mt-2">
//               {orders.length === 0
//                 ? "Các đơn hàng bạn đặt sẽ được hiển thị tại đây."
//                 : "Hãy thử thay đổi từ khóa tìm kiếm hoặc trạng thái."}
//             </p>

//             <Link
//               to="/products"
//               className="
//                 inline-flex
//                 items-center
//                 justify-center
//                 mt-6
//                 px-5
//                 py-3
//                 rounded-xl
//                 bg-pink-600
//                 text-white
//                 font-medium
//                 hover:bg-pink-700
//                 transition
//               "
//             >
//               Tiếp tục mua hàng
//             </Link>
//           </div>
//         ) : (
//           /* =================================================
//              DANH SÁCH ĐƠN HÀNG
//           ================================================== */

//           <div className="space-y-4">
//             {filteredOrders.map((order) => {
//               const orderId = getOrderId(order);

//               const normalizedStatus = normalizeStatus(order?.status);

//               return (
//                 <div
//                   key={orderId}
//                   className="
//                     bg-white
//                     rounded-2xl
//                     border
//                     border-gray-100
//                     shadow-sm
//                     overflow-hidden
//                   "
//                 >
//                   {/* =======================================
//                       HEADER ĐƠN HÀNG
//                   ======================================== */}

//                   <div
//                     className="
//                       px-5
//                       py-4
//                       border-b
//                       border-gray-100
//                     "
//                   >
//                     <div
//                       className="
//                         flex
//                         flex-col
//                         sm:flex-row
//                         sm:items-center
//                         sm:justify-between
//                         gap-3
//                       "
//                     >
//                       <div>
//                         <p className="text-xs text-gray-400">Mã đơn hàng</p>

//                         <p
//                           className="
//                             font-bold
//                             text-gray-900
//                             mt-1
//                           "
//                         >
//                           #{orderId}
//                         </p>

//                         <p className="text-sm text-gray-500 mt-1">
//                           Đặt ngày: {formatDate(order?.createdAt)}
//                         </p>
//                       </div>

//                       <span
//                         className={`
//                           inline-flex
//                           w-fit
//                           px-3
//                           py-1.5
//                           rounded-full
//                           text-xs
//                           font-semibold
//                           ${getStatusClass(normalizedStatus)}
//                         `}
//                       >
//                         {getStatusLabel(normalizedStatus)}
//                       </span>
//                     </div>
//                   </div>

//                   {/* =======================================
//                       BODY
//                   ======================================== */}

//                   <div className="px-5 py-5">
//                     <div
//                       className="
//                         grid
//                         grid-cols-2
//                         md:grid-cols-4
//                         gap-4
//                       "
//                     >
//                       {/* KHÁCH HÀNG */}

//                       <div>
//                         <p className="text-xs text-gray-400">Khách hàng</p>

//                         <p
//                           className="
//                             font-medium
//                             text-gray-800
//                             mt-1
//                             truncate
//                           "
//                           title={getCustomerName(order)}
//                         >
//                           {getCustomerName(order)}
//                         </p>
//                       </div>

//                       {/* SẢN PHẨM */}

//                       <div>
//                         <p className="text-xs text-gray-400">Sản phẩm</p>

//                         <p className="font-medium text-gray-800 mt-1">
//                           {getItemsCount(order)}
//                         </p>
//                       </div>

//                       {/* THANH TOÁN */}

//                       <div>
//                         <p className="text-xs text-gray-400">Thanh toán</p>

//                         <p className="font-medium text-gray-800 mt-1">
//                           {getPaymentMethod(order)}
//                         </p>
//                       </div>

//                       {/* TỔNG TIỀN */}

//                       <div>
//                         <p className="text-xs text-gray-400">Tổng tiền</p>

//                         <p
//                           className="
//                             font-bold
//                             text-pink-600
//                             mt-1
//                           "
//                         >
//                           {formatCurrency(getOrderTotal(order))}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* =======================================
//                       FOOTER
//                   ======================================== */}

//                   <div
//                     className="
//                       px-5
//                       py-4
//                       bg-gray-50
//                       border-t
//                       border-gray-100
//                       flex
//                       justify-end
//                     "
//                   >
//                     <Link
//                       to={`/orders/${orderId}`}
//                       className="
//                         inline-flex
//                         items-center
//                         justify-center
//                         gap-2
//                         px-4
//                         py-2.5
//                         rounded-xl
//                         bg-pink-600
//                         text-white
//                         text-sm
//                         font-medium
//                         hover:bg-pink-700
//                         transition
//                       "
//                     >
//                       <FiEye size={17} />
//                       Xem chi tiết
//                     </Link>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OrdersPage;

import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiEye, FiSearch, FiFilter } from "react-icons/fi";

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

   delivered là trạng thái chính.

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

    preparing: "preparing",
    "đang chuẩn bị": "preparing",

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

    case "preparing":
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

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-10">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <FiPackage size={22} />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Đơn hàng của tôi
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Theo dõi các đơn hàng bạn đã đặt tại Flower Shop.
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FiSearch
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder="Tìm theo mã đơn hàng hoặc tên..."
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
            </div>

            <div className="relative">
              <FiFilter
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 bg-white outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              >
                {STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* DANH SÁCH */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FiPackage size={50} className="mx-auto text-gray-300 mb-4" />

            <h2 className="text-xl font-semibold text-gray-800">
              Không có đơn hàng
            </h2>

            <p className="text-gray-500 mt-2">
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
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Mã đơn hàng</p>

                      <h2 className="text-lg font-bold text-gray-900 mt-1">
                        #{getOrderId(order)}
                      </h2>

                      <p className="text-sm text-gray-500 mt-2">
                        {formatDate(order?.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusClass(
                        status
                      )}`}
                    >
                      {getStatusLabel(status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Người nhận</p>

                      <p className="font-medium text-gray-800 mt-1 truncate">
                        {getCustomerName(order)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Sản phẩm</p>

                      <p className="font-medium text-gray-800 mt-1">
                        {getProductCount(order)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Thanh toán</p>

                      <p className="font-medium text-gray-800 mt-1">
                        {getPaymentMethod(order)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Tổng cộng</p>

                      <p className="font-bold text-pink-600 mt-1">
                        {formatCurrency(getOrderTotal(order))}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <Link
                      to={`/orders/${getOrderId(order)}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:border-pink-300 hover:text-pink-600 transition"
                    >
                      <FiEye size={17} />
                      Xem chi tiết
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
