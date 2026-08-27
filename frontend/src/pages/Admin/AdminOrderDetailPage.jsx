// // import { useMemo } from "react";
// // import { Link, useNavigate, useParams } from "react-router-dom";
// // import { useOrder } from "@/context/OrderContext";
// // import OrderAddress from "@/components/orders/OrderAddress";

// // const STATUS_OPTIONS = [
// //   { value: "pending", label: "Chờ xác nhận" },
// //   { value: "confirmed", label: "Đã xác nhận" },
// //   { value: "preparing", label: "Đang chuẩn bị" },
// //   { value: "shipping", label: "Đang giao" },
// //   { value: "delivered", label: "Đã giao" },
// //   { value: "cancelled", label: "Đã hủy" },
// // ];

// // const normalizeStatus = (status) => {
// //   const v = String(status || "")
// //     .trim()
// //     .toLowerCase();
// //   if (["delivered", "completed", "đã giao"].includes(v)) return "delivered";
// //   if (["shipping", "đang giao"].includes(v)) return "shipping";
// //   if (["preparing", "đang chuẩn bị"].includes(v)) return "preparing";
// //   if (["confirmed", "đã xác nhận"].includes(v)) return "confirmed";
// //   if (["cancelled", "canceled", "đã hủy"].includes(v)) return "cancelled";
// //   return "pending";
// // };
// // const statusLabel = (status) =>
// //   STATUS_OPTIONS.find((x) => x.value === normalizeStatus(status))?.label ||
// //   "Chờ xác nhận";
// // const formatDate = (date) => {
// //   if (!date) return "—";
// //   const d = new Date(date);
// //   return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("vi-VN");
// // };
// // const money = (v) => `${Number(v || 0).toLocaleString("vi-VN")} ₫`;
// // const getAddress = (order) => {
// //   const c = order?.customer || {};
// //   return (
// //     c.address ||
// //     order?.shippingAddress ||
// //     order?.customerAddress ||
// //     order?.address ||
// //     {}
// //   );
// // };

// // const AdminOrderDetailPage = () => {
// //   const { orderId } = useParams();
// //   const navigate = useNavigate();
// //   const { getOrderById, updateOrderStatus } = useOrder();
// //   const order = useMemo(() => getOrderById(orderId), [getOrderById, orderId]);

// //   if (!order)
// //     return (
// //       <section className="p-8 bg-gray-50 min-h-[70vh]">
// //         <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 text-center">
// //           <h1 className="text-2xl font-bold">Không tìm thấy đơn hàng</h1>
// //           <button
// //             onClick={() => navigate("/admin/orders")}
// //             className="mt-6 px-5 py-3 rounded-lg bg-pink-600 text-white"
// //           >
// //             Quay lại quản lý đơn hàng
// //           </button>
// //         </div>
// //       </section>
// //     );

// //   const customer = order.customer || {};
// //   const address = getAddress(order);
// //   const items = Array.isArray(order.items)
// //     ? order.items
// //     : Array.isArray(order.products)
// //       ? order.products
// //       : [];
// //   const total = Number(
// //     order.total ??
// //       order.totalAmount ??
// //       order.cartTotal ??
// //       order.grandTotal ??
// //       order.subtotal ??
// //       0
// //   );
// //   const currentStatus = normalizeStatus(order.status);

// //   return (
// //     <section className="p-4 md:p-8 bg-gray-50 min-h-[70vh]">
// //       <div className="max-w-7xl mx-auto">
// //         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
// //           <div>
// //             <Link
// //               to="/admin/orders"
// //               className="text-sm text-gray-500 hover:text-pink-600"
// //             >
// //               ← Quay lại quản lý đơn hàng
// //             </Link>
// //             <h1 className="text-3xl font-bold text-gray-900 mt-3">
// //               Chi tiết đơn hàng #{order.id}
// //             </h1>
// //             <p className="text-sm text-gray-500 mt-2">
// //               Đặt ngày: {formatDate(order.createdAt)}
// //             </p>
// //           </div>
// //           <div className="min-w-[220px]">
// //             <label
// //               htmlFor="orderStatus"
// //               className="block text-sm font-medium text-gray-700 mb-2"
// //             >
// //               Trạng thái đơn hàng
// //             </label>
// //             <select
// //               id="orderStatus"
// //               value={currentStatus}
// //               onChange={(e) => updateOrderStatus(order.id, e.target.value)}
// //               className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
// //             >
// //               {STATUS_OPTIONS.map((s) => (
// //                 <option key={s.value} value={s.value}>
// //                   {s.label}
// //                 </option>
// //               ))}
// //             </select>
// //             <p className="text-xs text-gray-500 mt-2">
// //               Trạng thái hiện tại: {statusLabel(currentStatus)}
// //             </p>
// //           </div>
// //         </div>

// //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
// //           <div className="bg-white rounded-2xl p-6 shadow-sm">
// //             <h2 className="text-lg font-semibold text-gray-800 mb-5">
// //               Thông tin người nhận
// //             </h2>
// //             <div className="space-y-4">
// //               <div>
// //                 <p className="text-sm text-gray-500">Họ và tên</p>
// //                 <p className="font-medium mt-1">
// //                   {customer.fullName || customer.name || "—"}
// //                 </p>
// //               </div>
// //               <div>
// //                 <p className="text-sm text-gray-500">Số điện thoại</p>
// //                 <p className="font-medium mt-1">
// //                   {customer.phone || customer.phoneNumber || "—"}
// //                 </p>
// //               </div>
// //               <div>
// //                 <p className="text-sm text-gray-500">Email</p>
// //                 <p className="font-medium mt-1">{customer.email || "—"}</p>
// //               </div>
// //               <div>
// //                 <p className="text-sm text-gray-500 mb-1">Địa chỉ giao hàng</p>
// //                 <OrderAddress address={address} />
// //               </div>
// //             </div>
// //           </div>

// //           <div className="bg-white rounded-2xl p-6 shadow-sm">
// //             <h2 className="text-lg font-semibold text-gray-800 mb-5">
// //               Thông tin đơn hàng
// //             </h2>
// //             <div className="space-y-4">
// //               <div className="flex justify-between gap-4">
// //                 <span className="text-gray-500">Mã đơn hàng</span>
// //                 <span className="font-medium">#{order.id}</span>
// //               </div>
// //               <div className="flex justify-between gap-4">
// //                 <span className="text-gray-500">Trạng thái</span>
// //                 <span className="font-semibold text-pink-600">
// //                   {statusLabel(order.status)}
// //                 </span>
// //               </div>
// //               <div className="flex justify-between gap-4">
// //                 <span className="text-gray-500">Thanh toán</span>
// //                 <span>
// //                   {order.paymentMethod === "cod"
// //                     ? "Thanh toán khi nhận hàng (COD)"
// //                     : order.paymentMethod || "—"}
// //                 </span>
// //               </div>
// //               <div className="flex justify-between gap-4 pt-4 border-t">
// //                 <span className="font-medium">Tổng cộng</span>
// //                 <span className="text-xl font-bold text-pink-600">
// //                   {money(total)}
// //                 </span>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="bg-white rounded-2xl p-6 shadow-sm">
// //           <h2 className="text-lg font-semibold text-gray-800 mb-5">
// //             Sản phẩm trong đơn hàng
// //           </h2>
// //           {items.length === 0 ? (
// //             <p className="text-gray-500">Không có sản phẩm.</p>
// //           ) : (
// //             <div className="space-y-4">
// //               {items.map((item, index) => (
// //                 <div
// //                   key={item.id || item.productId || index}
// //                   className="flex gap-4 border-b border-gray-100 pb-4 last:border-0"
// //                 >
// //                   <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
// //                     {item.image && (
// //                       <img
// //                         src={item.image}
// //                         alt={item.name || "Sản phẩm"}
// //                         className="w-full h-full object-cover"
// //                       />
// //                     )}
// //                   </div>
// //                   <div className="flex-1">
// //                     <p className="font-semibold">{item.name || "Sản phẩm"}</p>
// //                     <p className="text-sm text-gray-500 mt-1">
// //                       Số lượng: {Number(item.quantity || 0)}
// //                     </p>
// //                     <p className="text-sm text-gray-500 mt-1">
// //                       Đơn giá: {money(item.price)}
// //                     </p>
// //                   </div>
// //                   <div className="font-semibold text-pink-600">
// //                     {money(
// //                       Number(item.price || 0) * Number(item.quantity || 0)
// //                     )}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </section>
// //   );
// // };
// // export default AdminOrderDetailPage;

// import { useMemo } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useOrder } from "@/context/OrderContext";
// import OrderAddress from "@/components/orders/OrderAddress";

// const STATUS_OPTIONS = [
//   { value: "pending", label: "Chờ xác nhận" },
//   { value: "confirmed", label: "Đã xác nhận" },
//   { value: "preparing", label: "Đang chuẩn bị" },
//   { value: "shipping", label: "Đang giao" },
//   { value: "delivered", label: "Đã giao" },
//   { value: "cancelled", label: "Đã hủy" },
// ];

// const formatDate = (date) => {
//   if (!date) return "—";
//   const parsed = new Date(date);
//   return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleString("vi-VN");
// };

// const formatCurrency = (value = 0) =>
//   `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

// const normalizeStatus = (status) => {
//   const value = String(status || "")
//     .trim()
//     .toLowerCase();
//   const map = {
//     "": "pending",
//     pending: "pending",
//     "chờ xác nhận": "pending",
//     "đã đặt hàng": "pending",
//     confirmed: "confirmed",
//     "đã xác nhận": "confirmed",
//     preparing: "preparing",
//     "đang chuẩn bị": "preparing",
//     shipping: "shipping",
//     "đang giao": "shipping",
//     delivered: "delivered",
//     "đã giao": "delivered",
//     completed: "delivered",
//     cancelled: "cancelled",
//     canceled: "cancelled",
//     "đã hủy": "cancelled",
//   };
//   return map[value] || "pending";
// };

// const getStatusLabel = (status) =>
//   STATUS_OPTIONS.find((item) => item.value === normalizeStatus(status))
//     ?.label || "Chờ xác nhận";

// const getAddress = (order) => {
//   const customer = order?.customer || {};
//   return (
//     customer.address ||
//     order?.shippingAddress ||
//     order?.customerAddress ||
//     order?.address ||
//     {}
//   );
// };

// const AdminOrderDetailPage = () => {
//   const { orderId } = useParams();
//   const navigate = useNavigate();
//   const { getOrderById, updateOrderStatus } = useOrder();

//   const order = useMemo(() => getOrderById(orderId), [getOrderById, orderId]);

//   if (!order) {
//     return (
//       <section className="p-8 bg-gray-50 min-h-screen">
//         <div className="max-w-5xl mx-auto bg-white rounded-2xl p-8 text-center shadow-sm">
//           <h1 className="text-2xl font-bold text-gray-800">
//             Không tìm thấy đơn hàng
//           </h1>
//           <button
//             type="button"
//             onClick={() => navigate("/admin/orders")}
//             className="mt-6 px-5 py-3 rounded-lg bg-pink-600 text-white"
//           >
//             Quay lại quản trị
//           </button>
//         </div>
//       </section>
//     );
//   }

//   const customer = order.customer || {};
//   const address = getAddress(order);
//   const items = Array.isArray(order.items) ? order.items : [];
//   const total = Number(
//     order.total ??
//       order.totalAmount ??
//       order.cartTotal ??
//       order.grandTotal ??
//       order.subtotal ??
//       0
//   );

//   const handleStatusChange = (event) => {
//     updateOrderStatus(order.id, event.target.value);
//   };

//   return (
//     <section className="p-4 md:p-8 bg-gray-50 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
//           <div>
//             <Link
//               to="/admin/orders"
//               className="text-sm text-gray-500 hover:text-pink-600"
//             >
//               ← Quay lại quản trị
//             </Link>
//             <h1 className="text-3xl font-bold text-gray-900 mt-3">
//               Chi tiết đơn hàng #{order.id}
//             </h1>
//             <p className="text-sm text-gray-500 mt-2">
//               Đặt ngày: {formatDate(order.createdAt)}
//             </p>
//           </div>

//           <div>
//             <label
//               htmlFor="orderStatus"
//               className="block text-sm font-medium text-gray-700 mb-2"
//             >
//               Trạng thái đơn hàng
//             </label>
//             <select
//               id="orderStatus"
//               value={normalizeStatus(order.status)}
//               onChange={handleStatusChange}
//               className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
//             >
//               {STATUS_OPTIONS.map((item) => (
//                 <option key={item.value} value={item.value}>
//                   {item.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//             <h2 className="text-lg font-semibold text-gray-800 mb-5">
//               Thông tin người nhận
//             </h2>
//             <div className="space-y-4">
//               <div>
//                 <p className="text-sm text-gray-500">Họ và tên</p>
//                 <p className="font-medium text-gray-800 mt-1">
//                   {customer.fullName || customer.name || "—"}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Số điện thoại</p>
//                 <p className="font-medium text-gray-800 mt-1">
//                   {customer.phone || "—"}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Email</p>
//                 <p className="font-medium text-gray-800 mt-1 break-all">
//                   {customer.email || "—"}
//                 </p>
//               </div>
//               {customer.note && (
//                 <div>
//                   <p className="text-sm text-gray-500">Ghi chú</p>
//                   <p className="font-medium text-gray-800 mt-1">
//                     {customer.note}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//             <h2 className="text-lg font-semibold text-gray-800 mb-5">
//               Địa chỉ giao hàng
//             </h2>
//             <OrderAddress address={address} />
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
//           <h2 className="text-lg font-semibold text-gray-800 mb-5">Sản phẩm</h2>
//           <div className="space-y-4">
//             {items.length === 0 ? (
//               <p className="text-gray-500">Không có sản phẩm.</p>
//             ) : (
//               items.map((item, index) => {
//                 const quantity = Number(item.quantity || 0);
//                 const price = Number(item.price || 0);

//                 return (
//                   <div
//                     key={item.id || item.productId || index}
//                     className="flex gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
//                   >
//                     <img
//                       src={item.image}
//                       alt={item.name || "Sản phẩm"}
//                       className="w-20 h-20 rounded-lg object-cover bg-gray-100"
//                     />
//                     <div className="flex-1">
//                       <p className="font-semibold text-gray-800">
//                         {item.name || "Sản phẩm"}
//                       </p>
//                       <p className="text-sm text-gray-500 mt-1">
//                         Số lượng: {quantity}
//                       </p>
//                       <p className="text-sm text-gray-500 mt-1">
//                         Đơn giá: {formatCurrency(price)}
//                       </p>
//                     </div>
//                     <div className="font-semibold text-pink-600">
//                       {formatCurrency(price * quantity)}
//                     </div>
//                   </div>
//                 );
//               })
//             )}
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <p className="text-sm text-gray-500">Phương thức thanh toán</p>
//               <p className="font-medium text-gray-800 mt-1">
//                 {order.paymentMethod === "cod"
//                   ? "Thanh toán khi nhận hàng (COD)"
//                   : order.paymentMethod || "—"}
//               </p>
//             </div>
//             <div className="sm:text-right">
//               <p className="text-sm text-gray-500">Trạng thái</p>
//               <p className="font-semibold text-gray-800 mt-1">
//                 {getStatusLabel(order.status)}
//               </p>
//               <p className="text-sm text-gray-500 mt-3">Tổng cộng</p>
//               <p className="text-2xl font-bold text-pink-600 mt-1">
//                 {formatCurrency(total)}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AdminOrderDetailPage;

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
