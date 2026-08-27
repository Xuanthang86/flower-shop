// // import { useMemo, useState } from "react";
// // import { Link } from "react-router-dom";
// // import { useContext } from "react";

// // import { OrderContext } from "@/context/OrderContext";

// // const STATUS_OPTIONS = [
// //   "Tất cả trạng thái",
// //   "Chờ xác nhận",
// //   "Đã xác nhận",
// //   "Đang chuẩn bị",
// //   "Đang giao",
// //   "Đã giao",
// //   "Đã hủy",
// // ];

// // const normalizeStatus = (status) => {
// //   if (status === "Đã đặt hàng") {
// //     return "Chờ xác nhận";
// //   }

// //   const statusMap = {
// //     pending: "Chờ xác nhận",
// //     confirmed: "Đã xác nhận",
// //     preparing: "Đang chuẩn bị",
// //     shipping: "Đang giao",
// //     completed: "Đã giao",
// //     cancelled: "Đã hủy",
// //   };

// //   return statusMap[status] || status || "Chờ xác nhận";
// // };

// // const getStatusClass = (status) => {
// //   switch (normalizeStatus(status)) {
// //     case "Chờ xác nhận":
// //       return "bg-yellow-100 text-yellow-700";

// //     case "Đã xác nhận":
// //       return "bg-blue-100 text-blue-700";

// //     case "Đang chuẩn bị":
// //       return "bg-purple-100 text-purple-700";

// //     case "Đang giao":
// //       return "bg-orange-100 text-orange-700";

// //     case "Đã giao":
// //       return "bg-green-100 text-green-700";

// //     case "Đã hủy":
// //       return "bg-red-100 text-red-700";

// //     default:
// //       return "bg-gray-100 text-gray-700";
// //   }
// // };

// // const formatCurrency = (value) => {
// //   const number = Number(value || 0);

// //   return new Intl.NumberFormat("vi-VN", {
// //     style: "currency",
// //     currency: "VND",
// //   }).format(number);
// // };

// // const getOrderTotal = (order) => {
// //   if (order?.total !== undefined) {
// //     return Number(order.total || 0);
// //   }

// //   if (order?.totalAmount !== undefined) {
// //     return Number(order.totalAmount || 0);
// //   }

// //   if (order?.subtotal !== undefined) {
// //     return Number(order.subtotal || 0);
// //   }

// //   if (order?.cartTotal !== undefined) {
// //     return Number(order.cartTotal || 0);
// //   }

// //   if (order?.grandTotal !== undefined) {
// //     return Number(order.grandTotal || 0);
// //   }

// //   return 0;
// // };

// // const getCustomerName = (order) => {
// //   return (
// //     order?.customer?.name ||
// //     order?.customer?.fullName ||
// //     order?.customerName ||
// //     order?.name ||
// //     order?.shippingAddress?.name ||
// //     "Khách hàng"
// //   );
// // };

// // const getCustomerPhone = (order) => {
// //   return (
// //     order?.customer?.phone ||
// //     order?.customerPhone ||
// //     order?.phone ||
// //     order?.shippingAddress?.phone ||
// //     ""
// //   );
// // };

// // const getProductCount = (order) => {
// //   if (Array.isArray(order?.items)) {
// //     return order.items.reduce(
// //       (total, item) => total + Number(item.quantity || 1),
// //       0
// //     );
// //   }

// //   if (Array.isArray(order?.products)) {
// //     return order.products.reduce(
// //       (total, item) => total + Number(item.quantity || 1),
// //       0
// //     );
// //   }

// //   return 0;
// // };

// // const formatDate = (date) => {
// //   if (!date) {
// //     return "--";
// //   }

// //   const parsedDate = new Date(date);

// //   if (Number.isNaN(parsedDate.getTime())) {
// //     return "--";
// //   }

// //   return parsedDate.toLocaleString("vi-VN");
// // };

// // const getOrderId = (order) => {
// //   return String(order?.id || order?.orderId || "").replace(/^#/, "");
// // };

// // const OrderList = () => {
// //   const { orders = [] } = useContext(OrderContext);

// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái");

// //   const filteredOrders = useMemo(() => {
// //     const keyword = searchTerm.trim().toLowerCase();

// //     return orders.filter((order) => {
// //       const status = normalizeStatus(order.status);

// //       const customerName = getCustomerName(order).toLowerCase();

// //       const customerPhone = getCustomerPhone(order).toLowerCase();

// //       const orderId = getOrderId(order).toLowerCase();

// //       const matchesSearch =
// //         !keyword ||
// //         orderId.includes(keyword) ||
// //         customerName.includes(keyword) ||
// //         customerPhone.includes(keyword);

// //       const matchesStatus =
// //         statusFilter === "Tất cả trạng thái" || status === statusFilter;

// //       return matchesSearch && matchesStatus;
// //     });
// //   }, [orders, searchTerm, statusFilter]);

// //   return (
// //     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
// //       {/* HEADER */}

// //       <div className="px-5 py-5 border-b border-gray-100">
// //         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
// //           <div>
// //             <h2 className="text-lg font-semibold text-gray-900">
// //               Danh sách đơn hàng
// //             </h2>

// //             <p className="text-sm text-gray-500 mt-1">
// //               Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
// //             </p>
// //           </div>

// //           <div className="flex flex-col sm:flex-row gap-3">
// //             {/* TÌM KIẾM */}

// //             <input
// //               type="text"
// //               value={searchTerm}
// //               onChange={(event) => setSearchTerm(event.target.value)}
// //               placeholder="Tìm mã đơn, khách hàng, số điện thoại..."
// //               className="w-full sm:w-80 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-100"
// //             />

// //             {/* LỌC */}

// //             <select
// //               value={statusFilter}
// //               onChange={(event) => setStatusFilter(event.target.value)}
// //               className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-100"
// //             >
// //               {STATUS_OPTIONS.map((status) => (
// //                 <option key={status} value={status}>
// //                   {status}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>
// //         </div>
// //       </div>

// //       {/* EMPTY */}

// //       {filteredOrders.length === 0 ? (
// //         <div className="px-6 py-16 text-center">
// //           <div className="text-4xl mb-4">📦</div>

// //           <h3 className="text-lg font-semibold text-gray-800">
// //             Không tìm thấy đơn hàng
// //           </h3>

// //           <p className="text-sm text-gray-500 mt-2">
// //             Chưa có đơn hàng phù hợp với điều kiện tìm kiếm.
// //           </p>
// //         </div>
// //       ) : (
// //         <>
// //           {/* DESKTOP */}

// //           <div className="hidden md:block overflow-x-auto">
// //             <table className="w-full">
// //               <thead>
// //                 <tr className="bg-gray-50 text-left text-sm text-gray-500">
// //                   <th className="px-5 py-4 font-medium">Mã đơn</th>

// //                   <th className="px-5 py-4 font-medium">Khách hàng</th>

// //                   <th className="px-5 py-4 font-medium">Sản phẩm</th>

// //                   <th className="px-5 py-4 font-medium">Tổng tiền</th>

// //                   <th className="px-5 py-4 font-medium">Thanh toán</th>

// //                   <th className="px-5 py-4 font-medium">Trạng thái</th>

// //                   <th className="px-5 py-4 font-medium">Ngày đặt</th>

// //                   <th className="px-5 py-4 font-medium text-center">
// //                     Chi tiết
// //                   </th>
// //                 </tr>
// //               </thead>

// //               <tbody className="divide-y divide-gray-100">
// //                 {filteredOrders.map((order) => {
// //                   const status = normalizeStatus(order.status);

// //                   const orderId = getOrderId(order);

// //                   return (
// //                     <tr key={orderId} className="hover:bg-gray-50 transition">
// //                       {/* MÃ ĐƠN */}

// //                       <td className="px-5 py-4">
// //                         <span className="font-semibold text-gray-900">
// //                           #{orderId}
// //                         </span>
// //                       </td>

// //                       {/* KHÁCH */}

// //                       <td className="px-5 py-4">
// //                         <div>
// //                           <p className="font-medium text-gray-900">
// //                             {getCustomerName(order)}
// //                           </p>

// //                           <p className="text-sm text-gray-500 mt-1">
// //                             {getCustomerPhone(order)}
// //                           </p>
// //                         </div>
// //                       </td>

// //                       {/* SẢN PHẨM */}

// //                       <td className="px-5 py-4 text-gray-700">
// //                         {getProductCount(order)}
// //                       </td>

// //                       {/* TỔNG TIỀN */}

// //                       <td className="px-5 py-4">
// //                         <span className="font-semibold text-pink-600">
// //                           {formatCurrency(getOrderTotal(order))}
// //                         </span>
// //                       </td>

// //                       {/* THANH TOÁN */}

// //                       <td className="px-5 py-4 text-sm text-gray-600">
// //                         {order.paymentMethod === "cod"
// //                           ? "COD"
// //                           : order.paymentMethod || "COD"}
// //                       </td>

// //                       {/* TRẠNG THÁI */}

// //                       <td className="px-5 py-4">
// //                         <span
// //                           className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
// //                             status
// //                           )}`}
// //                         >
// //                           {status}
// //                         </span>
// //                       </td>

// //                       {/* NGÀY */}

// //                       <td className="px-5 py-4 text-sm text-gray-500">
// //                         {formatDate(order.createdAt)}
// //                       </td>

// //                       {/* CHI TIẾT */}

// //                       <td className="px-5 py-4 text-center">
// //                         <Link
// //                           to={`/admin/orders/${orderId}`}
// //                           className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600 transition"
// //                           title="Xem chi tiết"
// //                           aria-label={`Xem chi tiết đơn hàng #${orderId}`}
// //                         >
// //                           👁
// //                         </Link>
// //                       </td>
// //                     </tr>
// //                   );
// //                 })}
// //               </tbody>
// //             </table>
// //           </div>

// //           {/* MOBILE */}

// //           <div className="md:hidden divide-y divide-gray-100">
// //             {filteredOrders.map((order) => {
// //               const status = normalizeStatus(order.status);

// //               const orderId = getOrderId(order);

// //               return (
// //                 <div key={orderId} className="p-5">
// //                   <div className="flex items-start justify-between gap-3">
// //                     <div>
// //                       <p className="font-semibold text-gray-900">#{orderId}</p>

// //                       <p className="text-sm text-gray-500 mt-1">
// //                         {formatDate(order.createdAt)}
// //                       </p>
// //                     </div>

// //                     <span
// //                       className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
// //                         status
// //                       )}`}
// //                     >
// //                       {status}
// //                     </span>
// //                   </div>

// //                   <div className="mt-4 space-y-2 text-sm">
// //                     <div className="flex justify-between gap-4">
// //                       <span className="text-gray-500">Khách hàng</span>

// //                       <span className="font-medium text-gray-800 text-right">
// //                         {getCustomerName(order)}
// //                       </span>
// //                     </div>

// //                     <div className="flex justify-between gap-4">
// //                       <span className="text-gray-500">Số điện thoại</span>

// //                       <span className="text-gray-800">
// //                         {getCustomerPhone(order)}
// //                       </span>
// //                     </div>

// //                     <div className="flex justify-between gap-4">
// //                       <span className="text-gray-500">Sản phẩm</span>

// //                       <span className="text-gray-800">
// //                         {getProductCount(order)}
// //                       </span>
// //                     </div>

// //                     <div className="flex justify-between gap-4">
// //                       <span className="text-gray-500">Tổng tiền</span>

// //                       <span className="font-semibold text-pink-600">
// //                         {formatCurrency(getOrderTotal(order))}
// //                       </span>
// //                     </div>
// //                   </div>

// //                   <Link
// //                     to={`/admin/orders/${orderId}`}
// //                     className="mt-4 w-full inline-flex items-center justify-center rounded-xl bg-pink-600 hover:bg-pink-700 text-white py-3 font-medium transition"
// //                   >
// //                     Xem chi tiết
// //                   </Link>
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default OrderList;

// import { useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import { useContext } from "react";
// import { OrderContext } from "@/context/OrderContext";

// const STATUS_OPTIONS = [
//   "Tất cả trạng thái",
//   "Chờ xác nhận",
//   "Đã xác nhận",
//   "Đang chuẩn bị",
//   "Đang giao",
//   "Đã giao",
//   "Đã hủy",
// ];

// const normalizeStatus = (status) => {
//   const value = String(status || "")
//     .trim()
//     .toLowerCase();
//   const map = {
//     "": "Chờ xác nhận",
//     pending: "Chờ xác nhận",
//     "chờ xác nhận": "Chờ xác nhận",
//     "đã đặt hàng": "Chờ xác nhận",
//     confirmed: "Đã xác nhận",
//     "đã xác nhận": "Đã xác nhận",
//     preparing: "Đang chuẩn bị",
//     "đang chuẩn bị": "Đang chuẩn bị",
//     shipping: "Đang giao",
//     "đang giao": "Đang giao",
//     delivered: "Đã giao",
//     "đã giao": "Đã giao",
//     completed: "Đã giao",
//     cancelled: "Đã hủy",
//     canceled: "Đã hủy",
//     "đã hủy": "Đã hủy",
//   };
//   return map[value] || "Chờ xác nhận";
// };

// const getStatusClass = (status) => {
//   switch (normalizeStatus(status)) {
//     case "Chờ xác nhận":
//       return "bg-yellow-100 text-yellow-700";
//     case "Đã xác nhận":
//       return "bg-blue-100 text-blue-700";
//     case "Đang chuẩn bị":
//       return "bg-purple-100 text-purple-700";
//     case "Đang giao":
//       return "bg-orange-100 text-orange-700";
//     case "Đã giao":
//       return "bg-green-100 text-green-700";
//     case "Đã hủy":
//       return "bg-red-100 text-red-700";
//     default:
//       return "bg-gray-100 text-gray-700";
//   }
// };

// const formatCurrency = (value) =>
//   new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
//     Number(value || 0)
//   );

// const getOrderTotal = (order) =>
//   Number(
//     order?.total ??
//       order?.totalAmount ??
//       order?.subtotal ??
//       order?.cartTotal ??
//       order?.grandTotal ??
//       0
//   ) || 0;

// const getCustomerName = (order) =>
//   order?.customer?.name ||
//   order?.customer?.fullName ||
//   order?.customerName ||
//   order?.name ||
//   order?.shippingAddress?.name ||
//   "Khách hàng";

// const getCustomerPhone = (order) =>
//   order?.customer?.phone ||
//   order?.customerPhone ||
//   order?.phone ||
//   order?.shippingAddress?.phone ||
//   "";

// const getProductCount = (order) => {
//   const items = Array.isArray(order?.items)
//     ? order.items
//     : Array.isArray(order?.products)
//       ? order.products
//       : [];
//   return items.reduce((total, item) => total + Number(item?.quantity || 1), 0);
// };

// const formatDate = (date) => {
//   if (!date) return "--";
//   const parsed = new Date(date);
//   return Number.isNaN(parsed.getTime()) ? "--" : parsed.toLocaleString("vi-VN");
// };

// const getOrderId = (order) =>
//   String(order?.id || order?.orderId || "").replace(/^#/, "");

// const AdminOrderList = () => {
//   const { orders = [] } = useContext(OrderContext);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái");

//   const filteredOrders = useMemo(() => {
//     const keyword = searchTerm.trim().toLowerCase();
//     return orders.filter((order) => {
//       const status = normalizeStatus(order?.status);
//       const name = getCustomerName(order).toLowerCase();
//       const phone = getCustomerPhone(order).toLowerCase();
//       const id = getOrderId(order).toLowerCase();
//       const matchesSearch =
//         !keyword ||
//         id.includes(keyword) ||
//         name.includes(keyword) ||
//         phone.includes(keyword);
//       const matchesStatus =
//         statusFilter === "Tất cả trạng thái" || status === statusFilter;
//       return matchesSearch && matchesStatus;
//     });
//   }, [orders, searchTerm, statusFilter]);

//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//       <div className="px-5 py-5 border-b border-gray-100">
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//           <div>
//             <h2 className="text-lg font-semibold text-gray-900">
//               Danh sách đơn hàng
//             </h2>
//             <p className="text-sm text-gray-500 mt-1">
//               Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
//             </p>
//           </div>
//           <div className="flex flex-col sm:flex-row gap-3">
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Tìm mã đơn, khách hàng, số điện thoại..."
//               className="w-full sm:w-80 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-100"
//             />
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-100"
//             >
//               {STATUS_OPTIONS.map((status) => (
//                 <option key={status} value={status}>
//                   {status}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {filteredOrders.length === 0 ? (
//         <div className="px-6 py-16 text-center">
//           <div className="text-4xl mb-4">📦</div>
//           <h3 className="text-lg font-semibold text-gray-800">
//             Không tìm thấy đơn hàng
//           </h3>
//           <p className="text-sm text-gray-500 mt-2">
//             Chưa có đơn hàng phù hợp với điều kiện tìm kiếm.
//           </p>
//         </div>
//       ) : (
//         <>
//           <div className="hidden md:block overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-gray-50 text-left text-sm text-gray-500">
//                   <th className="px-5 py-4 font-medium">Mã đơn</th>
//                   <th className="px-5 py-4 font-medium">Khách hàng</th>
//                   <th className="px-5 py-4 font-medium">Sản phẩm</th>
//                   <th className="px-5 py-4 font-medium">Tổng tiền</th>
//                   <th className="px-5 py-4 font-medium">Thanh toán</th>
//                   <th className="px-5 py-4 font-medium">Trạng thái</th>
//                   <th className="px-5 py-4 font-medium">Ngày đặt</th>
//                   <th className="px-5 py-4 font-medium text-center">
//                     Chi tiết
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {filteredOrders.map((order) => {
//                   const status = normalizeStatus(order?.status);
//                   const orderId = getOrderId(order);
//                   return (
//                     <tr key={orderId} className="hover:bg-gray-50 transition">
//                       <td className="px-5 py-4">
//                         <span className="font-semibold text-gray-900">
//                           #{orderId}
//                         </span>
//                       </td>
//                       <td className="px-5 py-4">
//                         <p className="font-medium text-gray-900">
//                           {getCustomerName(order)}
//                         </p>
//                         <p className="text-sm text-gray-500 mt-1">
//                           {getCustomerPhone(order)}
//                         </p>
//                       </td>
//                       <td className="px-5 py-4 text-gray-700">
//                         {getProductCount(order)}
//                       </td>
//                       <td className="px-5 py-4">
//                         <span className="font-semibold text-pink-600">
//                           {formatCurrency(getOrderTotal(order))}
//                         </span>
//                       </td>
//                       <td className="px-5 py-4 text-sm text-gray-600">
//                         {order?.paymentMethod === "cod"
//                           ? "COD"
//                           : order?.paymentMethod || "COD"}
//                       </td>
//                       <td className="px-5 py-4">
//                         <span
//                           className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(status)}`}
//                         >
//                           {status}
//                         </span>
//                       </td>
//                       <td className="px-5 py-4 text-sm text-gray-500">
//                         {formatDate(order?.createdAt)}
//                       </td>
//                       <td className="px-5 py-4 text-center">
//                         <Link
//                           to={`/admin/orders/${orderId}`}
//                           className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600 transition"
//                           title="Xem chi tiết"
//                           aria-label={`Xem chi tiết đơn hàng #${orderId}`}
//                         >
//                           👁️
//                         </Link>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           <div className="md:hidden divide-y divide-gray-100">
//             {filteredOrders.map((order) => {
//               const status = normalizeStatus(order?.status);
//               const orderId = getOrderId(order);
//               return (
//                 <div key={orderId} className="p-5">
//                   <div className="flex items-start justify-between gap-3">
//                     <div>
//                       <p className="font-semibold text-gray-900">#{orderId}</p>
//                       <p className="text-sm text-gray-500 mt-1">
//                         {formatDate(order?.createdAt)}
//                       </p>
//                     </div>
//                     <span
//                       className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(status)}`}
//                     >
//                       {status}
//                     </span>
//                   </div>
//                   <div className="mt-4 space-y-2 text-sm">
//                     <div className="flex justify-between gap-4">
//                       <span className="text-gray-500">Khách hàng</span>
//                       <span className="font-medium text-gray-800 text-right">
//                         {getCustomerName(order)}
//                       </span>
//                     </div>
//                     <div className="flex justify-between gap-4">
//                       <span className="text-gray-500">Số điện thoại</span>
//                       <span className="text-gray-800">
//                         {getCustomerPhone(order)}
//                       </span>
//                     </div>
//                     <div className="flex justify-between gap-4">
//                       <span className="text-gray-500">Sản phẩm</span>
//                       <span className="text-gray-800">
//                         {getProductCount(order)}
//                       </span>
//                     </div>
//                     <div className="flex justify-between gap-4">
//                       <span className="text-gray-500">Tổng tiền</span>
//                       <span className="font-semibold text-pink-600">
//                         {formatCurrency(getOrderTotal(order))}
//                       </span>
//                     </div>
//                   </div>
//                   <Link
//                     to={`/admin/orders/${orderId}`}
//                     className="mt-4 w-full inline-flex items-center justify-center rounded-xl bg-pink-600 hover:bg-pink-700 text-white py-3 font-medium transition"
//                   >
//                     Xem chi tiết
//                   </Link>
//                 </div>
//               );
//             })}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default AdminOrderList;

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
