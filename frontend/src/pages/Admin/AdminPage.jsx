// // // import { useContext, useMemo } from "react";
// // // import { FiPackage, FiClock, FiCheckCircle } from "react-icons/fi";

// // // import { OrderContext } from "@/context/OrderContext";
// // // import OrderList from "./AdminOrderList";

// // // const STATUS_OPTIONS = [
// // //   {
// // //     value: "pending",
// // //     label: "Chờ xác nhận",
// // //   },
// // //   {
// // //     value: "confirmed",
// // //     label: "Đã xác nhận",
// // //   },
// // //   {
// // //     value: "preparing",
// // //     label: "Đang chuẩn bị",
// // //   },
// // //   {
// // //     value: "shipping",
// // //     label: "Đang giao",
// // //   },
// // //   {
// // //     value: "completed",
// // //     label: "Đã giao",
// // //   },
// // //   {
// // //     value: "cancelled",
// // //     label: "Đã hủy",
// // //   },
// // // ];

// // // const formatCurrency = (value = 0) => {
// // //   return Number(value || 0).toLocaleString("vi-VN") + " ₫";
// // // };

// // // const getOrderTotal = (order) => {
// // //   return (
// // //     Number(
// // //       order?.total ??
// // //         order?.totalAmount ??
// // //         order?.cartTotal ??
// // //         order?.grandTotal ??
// // //         order?.subtotal ??
// // //         0
// // //     ) || 0
// // //   );
// // // };

// // // const normalizeStatus = (status) => {
// // //   if (status === "Đã đặt hàng") {
// // //     return "pending";
// // //   }

// // //   return status || "pending";
// // // };

// // // const AdminPage = () => {
// // //   const { orders = [] } = useContext(OrderContext);

// // //   const totalOrders = orders.length;

// // //   const pendingOrders = useMemo(() => {
// // //     return orders.filter(
// // //       (order) => normalizeStatus(order?.status) === "pending"
// // //     ).length;
// // //   }, [orders]);

// // //   const completedOrders = useMemo(() => {
// // //     return orders.filter(
// // //       (order) => normalizeStatus(order?.status) === "completed"
// // //     ).length;
// // //   }, [orders]);

// // //   const totalRevenue = useMemo(() => {
// // //     return orders
// // //       .filter((order) => normalizeStatus(order?.status) === "completed")
// // //       .reduce((total, order) => total + getOrderTotal(order), 0);
// // //   }, [orders]);

// // //   return (
// // //     <div className="min-h-screen bg-gray-50 py-8">
// // //       <div className="max-w-7xl mx-auto px-4">
// // //         {/* ================================
// // //             HEADER
// // //         ================================= */}
// // //         <div className="mb-8">
// // //           <div className="flex items-center gap-3">
// // //             <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
// // //               <FiPackage size={22} />
// // //             </div>

// // //             <div>
// // //               <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
// // //                 Quản lý đơn hàng
// // //               </h1>

// // //               <p className="text-sm text-gray-500 mt-1">
// // //                 Theo dõi và quản lý các đơn hàng của cửa hàng
// // //               </p>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* ================================
// // //             THỐNG KÊ
// // //         ================================= */}
// // //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
// // //           {/* TỔNG ĐƠN */}
// // //           <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
// // //             <div className="flex items-center justify-between">
// // //               <div>
// // //                 <p className="text-sm text-gray-500">Tổng đơn hàng</p>

// // //                 <p className="text-2xl font-bold text-gray-800 mt-2">
// // //                   {totalOrders}
// // //                 </p>
// // //               </div>

// // //               <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
// // //                 <FiPackage size={21} />
// // //               </div>
// // //             </div>
// // //           </div>

// // //           {/* CHỜ XÁC NHẬN */}
// // //           <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
// // //             <div className="flex items-center justify-between">
// // //               <div>
// // //                 <p className="text-sm text-gray-500">Chờ xác nhận</p>

// // //                 <p className="text-2xl font-bold text-yellow-600 mt-2">
// // //                   {pendingOrders}
// // //                 </p>
// // //               </div>

// // //               <div className="w-11 h-11 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
// // //                 <FiClock size={21} />
// // //               </div>
// // //             </div>
// // //           </div>

// // //           {/* ĐÃ GIAO */}
// // //           <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
// // //             <div className="flex items-center justify-between">
// // //               <div>
// // //                 <p className="text-sm text-gray-500">Đã giao</p>

// // //                 <p className="text-2xl font-bold text-green-600 mt-2">
// // //                   {completedOrders}
// // //                 </p>
// // //               </div>

// // //               <div className="w-11 h-11 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
// // //                 <FiCheckCircle size={21} />
// // //               </div>
// // //             </div>
// // //           </div>

// // //           {/* DOANH THU */}
// // //           <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
// // //             <div className="flex items-center justify-between">
// // //               <div>
// // //                 <p className="text-sm text-gray-500">Doanh thu</p>

// // //                 <p className="text-2xl font-bold text-pink-600 mt-2">
// // //                   {formatCurrency(totalRevenue)}
// // //                 </p>
// // //               </div>

// // //               {/* KÝ HIỆU TIỀN VIỆT NAM */}
// // //               <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
// // //                 <span className="text-xl font-bold">₫</span>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         {/* ================================
// // //             DANH SÁCH ĐƠN HÀNG
// // //         ================================= */}
// // //         <OrderList />
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default AdminPage;

// // import { useContext, useMemo } from "react";
// // import { FiPackage, FiClock, FiCheckCircle } from "react-icons/fi";
// // import { OrderContext } from "@/context/OrderContext";
// // import OrderList from "./AdminOrderList";

// // const formatCurrency = (value = 0) =>
// //   `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

// // const getOrderTotal = (order) =>
// //   Number(
// //     order?.total ??
// //       order?.totalAmount ??
// //       order?.cartTotal ??
// //       order?.grandTotal ??
// //       order?.subtotal ??
// //       0
// //   ) || 0;

// // const normalizeStatus = (status) => {
// //   if (status === "Đã đặt hàng") return "pending";
// //   if (status === "completed") return "delivered";
// //   return status || "pending";
// // };

// // const AdminPage = () => {
// //   const { orders = [] } = useContext(OrderContext);

// //   const totalOrders = orders.length;

// //   const pendingOrders = useMemo(
// //     () =>
// //       orders.filter((order) => normalizeStatus(order?.status) === "pending")
// //         .length,
// //     [orders]
// //   );

// //   const completedOrders = useMemo(
// //     () =>
// //       orders.filter((order) => normalizeStatus(order?.status) === "delivered")
// //         .length,
// //     [orders]
// //   );

// //   const totalRevenue = useMemo(
// //     () =>
// //       orders
// //         .filter((order) => normalizeStatus(order?.status) === "delivered")
// //         .reduce((total, order) => total + getOrderTotal(order), 0),
// //     [orders]
// //   );

// //   return (
// //     <div className="min-h-screen bg-gray-50 py-8">
// //       <div className="max-w-7xl mx-auto px-4">
// //         <div className="mb-8">
// //           <div className="flex items-center gap-3">
// //             <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
// //               <FiPackage size={22} />
// //             </div>

// //             <div>
// //               <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
// //                 Quản lý đơn hàng
// //               </h1>
// //               <p className="text-sm text-gray-500 mt-1">
// //                 Theo dõi và quản lý các đơn hàng của cửa hàng
// //               </p>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
// //           <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-gray-500">Tổng đơn hàng</p>
// //                 <p className="text-2xl font-bold text-gray-800 mt-2">
// //                   {totalOrders}
// //                 </p>
// //               </div>

// //               <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
// //                 <FiPackage size={21} />
// //               </div>
// //             </div>
// //           </div>

// //           <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-gray-500">Chờ xác nhận</p>
// //                 <p className="text-2xl font-bold text-yellow-600 mt-2">
// //                   {pendingOrders}
// //                 </p>
// //               </div>

// //               <div className="w-11 h-11 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
// //                 <FiClock size={21} />
// //               </div>
// //             </div>
// //           </div>

// //           <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-gray-500">Đã giao</p>
// //                 <p className="text-2xl font-bold text-green-600 mt-2">
// //                   {completedOrders}
// //                 </p>
// //               </div>

// //               <div className="w-11 h-11 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
// //                 <FiCheckCircle size={21} />
// //               </div>
// //             </div>
// //           </div>

// //           <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-gray-500">Doanh thu</p>
// //                 <p className="text-2xl font-bold text-pink-600 mt-2">
// //                   {formatCurrency(totalRevenue)}
// //                 </p>
// //               </div>

// //               <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
// //                 <span className="text-xl font-bold">₫</span>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         <OrderList />
// //       </div>
// //     </div>
// //   );
// // };

// // export default AdminPage;

// import { useContext, useMemo } from "react";
// import { FiPackage, FiClock, FiCheckCircle } from "react-icons/fi";
// import { OrderContext } from "@/context/OrderContext";
// import OrderList from "./AdminOrderList";

// const formatCurrency = (value = 0) =>
//   `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

// const getOrderTotal = (order) =>
//   Number(
//     order?.total ??
//       order?.totalAmount ??
//       order?.cartTotal ??
//       order?.grandTotal ??
//       order?.subtotal ??
//       0
//   ) || 0;

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

// const AdminPage = () => {
//   const { orders = [] } = useContext(OrderContext);

//   const totalOrders = orders.length;

//   const pendingOrders = useMemo(
//     () =>
//       orders.filter((order) => normalizeStatus(order?.status) === "pending")
//         .length,
//     [orders]
//   );

//   const completedOrders = useMemo(
//     () =>
//       orders.filter((order) => normalizeStatus(order?.status) === "delivered")
//         .length,
//     [orders]
//   );

//   const totalRevenue = useMemo(
//     () =>
//       orders
//         .filter((order) => normalizeStatus(order?.status) === "delivered")
//         .reduce((total, order) => total + getOrderTotal(order), 0),
//     [orders]
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="mb-8">
//           <div className="flex items-center gap-3">
//             <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
//               <FiPackage size={22} />
//             </div>

//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
//                 Quản lý đơn hàng
//               </h1>
//               <p className="text-sm text-gray-500 mt-1">
//                 Theo dõi và quản lý các đơn hàng của cửa hàng
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Tổng đơn hàng</p>
//                 <p className="text-2xl font-bold text-gray-800 mt-2">
//                   {totalOrders}
//                 </p>
//               </div>

//               <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
//                 <FiPackage size={21} />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Chờ xác nhận</p>
//                 <p className="text-2xl font-bold text-yellow-600 mt-2">
//                   {pendingOrders}
//                 </p>
//               </div>

//               <div className="w-11 h-11 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
//                 <FiClock size={21} />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Đã giao</p>
//                 <p className="text-2xl font-bold text-green-600 mt-2">
//                   {completedOrders}
//                 </p>
//               </div>

//               <div className="w-11 h-11 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
//                 <FiCheckCircle size={21} />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Doanh thu</p>
//                 <p className="text-2xl font-bold text-pink-600 mt-2">
//                   {formatCurrency(totalRevenue)}
//                 </p>
//               </div>

//               <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
//                 <span className="text-xl font-bold">₫</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <OrderList />
//       </div>
//     </div>
//   );
// };

// export default AdminPage;

import { useMemo } from "react";

import { FiPackage, FiClock, FiCheckCircle } from "react-icons/fi";

import { useOrder } from "@/context/OrderContext";

import AdminOrderList from "./AdminOrderList";

import { ORDER_STATUS, normalizeOrderStatus } from "@/utils/orderStatus";

const formatCurrency = (value = 0) =>
  `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const getOrderTotal = (order) =>
  Number(
    order?.total ??
      order?.totalAmount ??
      order?.cartTotal ??
      order?.grandTotal ??
      order?.subtotal ??
      0
  );

const AdminPage = () => {
  const { orders = [] } = useOrder();

  const totalOrders = orders.length;

  const pendingOrders = useMemo(
    () =>
      orders.filter(
        (order) => normalizeOrderStatus(order?.status) === ORDER_STATUS.PENDING
      ).length,
    [orders]
  );

  const completedOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          normalizeOrderStatus(order?.status) === ORDER_STATUS.DELIVERED
      ).length,
    [orders]
  );

  const totalRevenue = useMemo(
    () =>
      orders
        .filter(
          (order) =>
            normalizeOrderStatus(order?.status) === ORDER_STATUS.DELIVERED
        )
        .reduce((total, order) => total + getOrderTotal(order), 0),
    [orders]
  );

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <FiPackage size={22} />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Quản lý đơn hàng
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Theo dõi và quản lý các đơn hàng của cửa hàng
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Tổng đơn hàng</p>

            <p className="text-2xl font-bold text-gray-800 mt-2">
              {totalOrders}
            </p>

            <FiPackage className="mt-4 text-pink-600" size={21} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Chờ xác nhận</p>

            <p className="text-2xl font-bold text-yellow-600 mt-2">
              {pendingOrders}
            </p>

            <FiClock className="mt-4 text-yellow-600" size={21} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Đã giao</p>

            <p className="text-2xl font-bold text-green-600 mt-2">
              {completedOrders}
            </p>

            <FiCheckCircle className="mt-4 text-green-600" size={21} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Doanh thu</p>

            <p className="text-2xl font-bold text-pink-600 mt-2">
              {formatCurrency(totalRevenue)}
            </p>

            <span className="block mt-4 text-xl font-bold text-pink-600">
              ₫
            </span>
          </div>
        </div>

        <AdminOrderList />
      </div>
    </section>
  );
};

export default AdminPage;
