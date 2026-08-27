// // // // import { useContext, useEffect, useMemo, useState } from "react";

// // // // import { OrderContext } from "./OrderContext";
// // // // import { AuthContext } from "./AuthContext";

// // // // const STORAGE_KEY = "flower-shop-orders";

// // // // /*
// // // // =====================================================
// // // // CHUẨN HÓA ĐỊA CHỈ
// // // // =====================================================
// // // // */
// // // // const normalizeAddress = (address = {}) => {
// // // //   if (!address || typeof address !== "object") {
// // // //     return {
// // // //       provinceCode: "",
// // // //       provinceName: "",
// // // //       wardCode: "",
// // // //       wardName: "",
// // // //       houseNumber: "",
// // // //       street: "",
// // // //     };
// // // //   }

// // // //   return {
// // // //     provinceCode: address.provinceCode ? String(address.provinceCode) : "",

// // // //     provinceName: address.provinceName || address.province || "",

// // // //     wardCode: address.wardCode ? String(address.wardCode) : "",

// // // //     wardName: address.wardName || address.ward || "",

// // // //     houseNumber: address.houseNumber || "",

// // // //     street: address.street || address.streetName || "",
// // // //   };
// // // // };

// // // // /*
// // // // =====================================================
// // // // CHUẨN HÓA CUSTOMER
// // // // =====================================================
// // // // */
// // // // const normalizeCustomer = (customer = {}) => {
// // // //   return {
// // // //     ...customer,

// // // //     name: customer.name || customer.fullName || "",

// // // //     fullName: customer.fullName || customer.name || "",

// // // //     phone: customer.phone || "",

// // // //     email: customer.email || "",

// // // //     address: normalizeAddress(customer.address),

// // // //     note: customer.note || "",
// // // //   };
// // // // };

// // // // /*
// // // // =====================================================
// // // // CHUẨN HÓA ĐƠN
// // // // =====================================================
// // // // */
// // // // const normalizeOrder = (order) => {
// // // //   if (!order) {
// // // //     return order;
// // // //   }

// // // //   const id = String(order.id || order.orderId || "").replace(/^#/, "");

// // // //   return {
// // // //     ...order,

// // // //     id,

// // // //     customer: normalizeCustomer(order.customer),

// // // //     items: Array.isArray(order.items) ? order.items : [],

// // // //     total: Number(order.total) || 0,

// // // //     status: order.status || "pending",
// // // //   };
// // // // };

// // // // /*
// // // // =====================================================
// // // // TẠO MÃ ĐƠN HÀNG
// // // // =====================================================
// // // // */
// // // // const generateOrderCode = (orders) => {
// // // //   const now = new Date();

// // // //   const year = now.getFullYear();

// // // //   const month = String(now.getMonth() + 1).padStart(2, "0");

// // // //   const day = String(now.getDate()).padStart(2, "0");

// // // //   const datePrefix = `FS-${year}${month}${day}`;

// // // //   const todayOrders = orders.filter((order) => {
// // // //     const createdAt = order?.createdAt;

// // // //     if (!createdAt) {
// // // //       return false;
// // // //     }

// // // //     const date = new Date(createdAt);

// // // //     if (Number.isNaN(date.getTime())) {
// // // //       return false;
// // // //     }

// // // //     const orderYear = date.getFullYear();

// // // //     const orderMonth = String(date.getMonth() + 1).padStart(2, "0");

// // // //     const orderDay = String(date.getDate()).padStart(2, "0");

// // // //     return `${orderYear}${orderMonth}${orderDay}` === `${year}${month}${day}`;
// // // //   });

// // // //   const sequence = String(todayOrders.length + 1).padStart(2, "0");

// // // //   return `${datePrefix}${sequence}`;
// // // // };

// // // // /*
// // // // =====================================================
// // // // ORDER PROVIDER
// // // // =====================================================
// // // // */
// // // // const OrderProvider = ({ children }) => {
// // // //   const auth = useContext(AuthContext);

// // // //   if (!auth) {
// // // //     throw new Error("OrderProvider phải được đặt bên trong AuthProvider.");
// // // //   }

// // // //   const { user } = auth;

// // // //   /*
// // // //   ===================================================
// // // //   KHỞI TẠO
// // // //   ===================================================
// // // //   */
// // // //   const [orders, setOrders] = useState(() => {
// // // //     try {
// // // //       const savedOrders = localStorage.getItem(STORAGE_KEY);

// // // //       if (!savedOrders) {
// // // //         return [];
// // // //       }

// // // //       const parsedOrders = JSON.parse(savedOrders);

// // // //       if (!Array.isArray(parsedOrders)) {
// // // //         return [];
// // // //       }

// // // //       return parsedOrders.map(normalizeOrder);
// // // //     } catch (error) {
// // // //       console.error("Lỗi khi đọc đơn hàng:", error);

// // // //       return [];
// // // //     }
// // // //   });

// // // //   /*
// // // //   ===================================================
// // // //   LƯU LOCAL STORAGE
// // // //   ===================================================
// // // //   */
// // // //   useEffect(() => {
// // // //     try {
// // // //       localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
// // // //     } catch (error) {
// // // //       console.error("Lỗi khi lưu đơn hàng:", error);
// // // //     }
// // // //   }, [orders]);

// // // //   /*
// // // //   ===================================================
// // // //   TẠO ĐƠN
// // // //   ===================================================
// // // //   */
// // // //   const createOrder = (orderData) => {
// // // //     if (!user) {
// // // //       return {
// // // //         success: false,
// // // //         message: "Bạn cần đăng nhập trước khi đặt hàng.",
// // // //       };
// // // //     }

// // // //     const createdAt = new Date().toISOString();

// // // //     let createdOrder = null;

// // // //     setOrders((currentOrders) => {
// // // //       const orderCode = generateOrderCode(currentOrders);

// // // //       const customer = normalizeCustomer(orderData?.customer);

// // // //       createdOrder = {
// // // //         ...orderData,

// // // //         id: orderCode,

// // // //         createdAt,

// // // //         updatedAt: createdAt,

// // // //         status: orderData?.status || "pending",

// // // //         customer,

// // // //         /*
// // // //          * Chủ sở hữu đơn hàng
// // // //          */
// // // //         customerId: user.id,

// // // //         customerEmail: user.email,

// // // //         customerName: user.name || customer.fullName || customer.name || "",
// // // //       };

// // // //       return [createdOrder, ...currentOrders];
// // // //     });

// // // //     /*
// // // //      * Hỗ trợ cả kiểu sử dụng:
// // // //      *
// // // //      * const result = createOrder(...)
// // // //      * result.order
// // // //      *
// // // //      * và code cũ:
// // // //      *
// // // //      * const newOrder = createOrder(...)
// // // //      * newOrder.id
// // // //      *
// // // //      * để tránh làm hỏng CheckoutPage hiện tại.
// // // //      */
// // // //     return {
// // // //       success: true,

// // // //       order: createdOrder,

// // // //       ...(createdOrder || {}),
// // // //     };
// // // //   };

// // // //   /*
// // // //   ===================================================
// // // //   LẤY ĐƠN THEO ID
// // // //   ===================================================
// // // //   */
// // // //   const getOrderById = (orderId) => {
// // // //     if (!orderId) {
// // // //       return undefined;
// // // //     }

// // // //     const normalizedId = String(orderId).replace(/^#/, "");

// // // //     return orders.find((order) => {
// // // //       const currentId = String(order?.id || order?.orderId || "").replace(
// // // //         /^#/,
// // // //         ""
// // // //       );

// // // //       return currentId === normalizedId;
// // // //     });
// // // //   };

// // // //   /*
// // // //   ===================================================
// // // //   LẤY ĐƠN CỦA USER
// // // //   ===================================================
// // // //   */
// // // //   const getMyOrders = () => {
// // // //     if (!user) {
// // // //       return [];
// // // //     }

// // // //     if (user.role === "admin") {
// // // //       return orders;
// // // //     }

// // // //     return orders.filter(
// // // //       (order) => String(order?.customerId || "") === String(user.id || "")
// // // //     );
// // // //   };

// // // //   /*
// // // //   ===================================================
// // // //   QUYỀN XEM
// // // //   ===================================================
// // // //   */
// // // //   const canViewOrder = (order) => {
// // // //     if (!order || !user) {
// // // //       return false;
// // // //     }

// // // //     if (user.role === "admin") {
// // // //       return true;
// // // //     }

// // // //     return String(order.customerId || "") === String(user.id || "");
// // // //   };

// // // //   /*
// // // //   ===================================================
// // // //   CẬP NHẬT TRẠNG THÁI
// // // //   ===================================================
// // // //   */
// // // //   const updateOrderStatus = (orderId, newStatus) => {
// // // //     if (!orderId) {
// // // //       return;
// // // //     }

// // // //     const normalizedId = String(orderId).replace(/^#/, "");

// // // //     setOrders((currentOrders) =>
// // // //       currentOrders.map((order) => {
// // // //         const currentId = String(order?.id || order?.orderId || "").replace(
// // // //           /^#/,
// // // //           ""
// // // //         );

// // // //         if (currentId !== normalizedId) {
// // // //           return order;
// // // //         }

// // // //         return {
// // // //           ...order,

// // // //           id: currentId,

// // // //           status: newStatus,

// // // //           updatedAt: new Date().toISOString(),
// // // //         };
// // // //       })
// // // //     );
// // // //   };

// // // //   /*
// // // //   ===================================================
// // // //   XÓA ĐƠN
// // // //   ===================================================
// // // //   */
// // // //   const removeOrder = (orderId) => {
// // // //     const normalizedId = String(orderId || "").replace(/^#/, "");

// // // //     setOrders((currentOrders) =>
// // // //       currentOrders.filter((order) => {
// // // //         const currentId = String(order?.id || order?.orderId || "").replace(
// // // //           /^#/,
// // // //           ""
// // // //         );

// // // //         return currentId !== normalizedId;
// // // //       })
// // // //     );
// // // //   };

// // // //   /*
// // // //   ===================================================
// // // //   CONTEXT VALUE
// // // //   ===================================================
// // // //   */
// // // //   const value = useMemo(
// // // //     () => ({
// // // //       orders,

// // // //       createOrder,

// // // //       getOrderById,

// // // //       getMyOrders,

// // // //       canViewOrder,

// // // //       updateOrderStatus,

// // // //       removeOrder,
// // // //     }),
// // // //     [orders, user]
// // // //   );

// // // //   return (
// // // //     <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
// // // //   );
// // // // };

// // // // export default OrderProvider;

// // // import { useContext, useEffect, useMemo, useState } from "react";
// // // import { OrderContext } from "./OrderContext";
// // // import { AuthContext } from "./AuthContext";

// // // const STORAGE_KEY = "flower-shop-orders";

// // // const normalizeAddress = (address = {}) => {
// // //   if (!address || typeof address !== "object") {
// // //     return {
// // //       provinceCode: "",
// // //       provinceName: "",
// // //       wardCode: "",
// // //       wardName: "",
// // //       houseNumber: "",
// // //       street: "",
// // //     };
// // //   }

// // //   return {
// // //     provinceCode: address.provinceCode ? String(address.provinceCode) : "",
// // //     provinceName: address.provinceName || address.province || "",
// // //     wardCode: address.wardCode ? String(address.wardCode) : "",
// // //     wardName: address.wardName || address.ward || "",
// // //     houseNumber: address.houseNumber || "",
// // //     street: address.street || address.streetName || "",
// // //   };
// // // };

// // // const normalizeCustomer = (customer = {}) => ({
// // //   ...customer,
// // //   name: customer.name || customer.fullName || "",
// // //   fullName: customer.fullName || customer.name || "",
// // //   phone: customer.phone || "",
// // //   email: customer.email || "",
// // //   address: normalizeAddress(customer.address),
// // //   note: customer.note || "",
// // // });

// // // const normalizeStatus = (status) => {
// // //   if (status === "Đã đặt hàng") return "pending";
// // //   if (status === "completed") return "delivered";
// // //   return status || "pending";
// // // };

// // // const normalizeOrder = (order) => {
// // //   if (!order) return order;

// // //   const id = String(order.id || order.orderId || "").replace(/^#/, "");

// // //   return {
// // //     ...order,
// // //     id,
// // //     customer: normalizeCustomer(order.customer),
// // //     items: Array.isArray(order.items) ? order.items : [],
// // //     total: Number(
// // //       order.total ??
// // //         order.totalAmount ??
// // //         order.cartTotal ??
// // //         order.grandTotal ??
// // //         order.subtotal ??
// // //         0
// // //     ),
// // //     status: normalizeStatus(order.status),
// // //   };
// // // };

// // // const generateOrderCode = (orders) => {
// // //   const now = new Date();
// // //   const year = now.getFullYear();
// // //   const month = String(now.getMonth() + 1).padStart(2, "0");
// // //   const day = String(now.getDate()).padStart(2, "0");
// // //   const prefix = `FS-${year}${month}${day}`;

// // //   const todayCount = orders.filter((order) => {
// // //     if (!order?.createdAt) return false;

// // //     const date = new Date(order.createdAt);
// // //     if (Number.isNaN(date.getTime())) return false;

// // //     return (
// // //       date.getFullYear() === year &&
// // //       String(date.getMonth() + 1).padStart(2, "0") === month &&
// // //       String(date.getDate()).padStart(2, "0") === day
// // //     );
// // //   }).length;

// // //   return `${prefix}${String(todayCount + 1).padStart(2, "0")}`;
// // // };

// // // const OrderProvider = ({ children }) => {
// // //   const auth = useContext(AuthContext);

// // //   if (!auth) {
// // //     throw new Error("OrderProvider phải được đặt bên trong AuthProvider.");
// // //   }

// // //   const { user } = auth;

// // //   const [orders, setOrders] = useState(() => {
// // //     try {
// // //       const saved = localStorage.getItem(STORAGE_KEY);
// // //       if (!saved) return [];

// // //       const parsed = JSON.parse(saved);
// // //       return Array.isArray(parsed) ? parsed.map(normalizeOrder) : [];
// // //     } catch (error) {
// // //       console.error("Lỗi khi đọc đơn hàng:", error);
// // //       return [];
// // //     }
// // //   });

// // //   useEffect(() => {
// // //     try {
// // //       localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
// // //     } catch (error) {
// // //       console.error("Lỗi khi lưu đơn hàng:", error);
// // //     }
// // //   }, [orders]);

// // //   const createOrder = (orderData) => {
// // //     if (!user) {
// // //       return {
// // //         success: false,
// // //         message: "Bạn cần đăng nhập trước khi đặt hàng.",
// // //       };
// // //     }

// // //     const createdAt = new Date().toISOString();
// // //     const customer = normalizeCustomer(orderData?.customer);

// // //     let createdOrder = null;

// // //     setOrders((currentOrders) => {
// // //       createdOrder = {
// // //         ...orderData,
// // //         id: generateOrderCode(currentOrders),
// // //         createdAt,
// // //         updatedAt: createdAt,
// // //         status: normalizeStatus(orderData?.status || "pending"),
// // //         customer,
// // //         customerId: user.id,
// // //         customerEmail: user.email,
// // //         customerName: user.name || customer.fullName || customer.name || "",
// // //       };

// // //       return [createdOrder, ...currentOrders];
// // //     });

// // //     return {
// // //       success: true,
// // //       order: createdOrder,
// // //       ...(createdOrder || {}),
// // //     };
// // //   };

// // //   const getOrderById = (orderId) => {
// // //     if (!orderId) return undefined;

// // //     const normalizedId = String(orderId).replace(/^#/, "");

// // //     return orders.find((order) => {
// // //       const currentId = String(order?.id || order?.orderId || "").replace(
// // //         /^#/,
// // //         ""
// // //       );

// // //       return currentId === normalizedId;
// // //     });
// // //   };

// // //   const getMyOrders = () => {
// // //     if (!user) return [];

// // //     if (user.role === "admin") {
// // //       return orders;
// // //     }

// // //     return orders.filter(
// // //       (order) => String(order?.customerId || "") === String(user.id || "")
// // //     );
// // //   };

// // //   const canViewOrder = (order) => {
// // //     if (!order || !user) return false;

// // //     if (user.role === "admin" || user.role === "manager") {
// // //       return true;
// // //     }

// // //     return String(order.customerId || "") === String(user.id || "");
// // //   };

// // //   /*
// // //    * Trạng thái chuẩn hóa:
// // //    * delivered = Đã giao
// // //    *
// // //    * AdminPage dùng cùng giá trị này để tính:
// // //    * - số đơn đã giao
// // //    * - doanh thu
// // //    */
// // //   const updateOrderStatus = (orderId, newStatus) => {
// // //     if (!orderId) {
// // //       return {
// // //         success: false,
// // //         message: "Thiếu mã đơn hàng.",
// // //       };
// // //     }

// // //     const normalizedId = String(orderId).replace(/^#/, "");
// // //     const status = normalizeStatus(newStatus);

// // //     setOrders((currentOrders) =>
// // //       currentOrders.map((order) => {
// // //         const currentId = String(order?.id || order?.orderId || "").replace(
// // //           /^#/,
// // //           ""
// // //         );

// // //         if (currentId !== normalizedId) {
// // //           return order;
// // //         }

// // //         return {
// // //           ...order,
// // //           id: currentId,
// // //           status,
// // //           updatedAt: new Date().toISOString(),
// // //         };
// // //       })
// // //     );

// // //     return {
// // //       success: true,
// // //       status,
// // //     };
// // //   };

// // //   const removeOrder = (orderId) => {
// // //     const normalizedId = String(orderId || "").replace(/^#/, "");

// // //     setOrders((currentOrders) =>
// // //       currentOrders.filter((order) => {
// // //         const currentId = String(order?.id || order?.orderId || "").replace(
// // //           /^#/,
// // //           ""
// // //         );

// // //         return currentId !== normalizedId;
// // //       })
// // //     );
// // //   };

// // //   const value = useMemo(
// // //     () => ({
// // //       orders,
// // //       createOrder,
// // //       getOrderById,
// // //       getMyOrders,
// // //       canViewOrder,
// // //       updateOrderStatus,
// // //       removeOrder,
// // //     }),
// // //     [orders, user]
// // //   );

// // //   return (
// // //     <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
// // //   );
// // // };

// // // export default OrderProvider;

// // import { useContext, useEffect, useMemo, useState } from "react";
// // import { OrderContext } from "./OrderContext";
// // import { AuthContext } from "./AuthContext";

// // const STORAGE_KEY = "flower-shop-orders";

// // const normalizeAddress = (address = {}) => {
// //   if (!address || typeof address !== "object") {
// //     return {
// //       provinceCode: "",
// //       provinceName: "",
// //       wardCode: "",
// //       wardName: "",
// //       houseNumber: "",
// //       street: "",
// //     };
// //   }

// //   return {
// //     provinceCode: address.provinceCode ? String(address.provinceCode) : "",
// //     provinceName: address.provinceName || address.province || "",
// //     wardCode: address.wardCode ? String(address.wardCode) : "",
// //     wardName: address.wardName || address.ward || "",
// //     houseNumber: address.houseNumber || "",
// //     street: address.street || address.streetName || "",
// //   };
// // };

// // const normalizeCustomer = (customer = {}) => ({
// //   ...customer,
// //   name: customer.name || customer.fullName || "",
// //   fullName: customer.fullName || customer.name || "",
// //   phone: customer.phone || "",
// //   email: customer.email || "",
// //   address: normalizeAddress(customer.address),
// //   note: customer.note || "",
// // });

// // const normalizeStatus = (status) => {
// //   const value = String(status || "")
// //     .trim()
// //     .toLowerCase();

// //   const map = {
// //     "": "pending",
// //     pending: "pending",
// //     "chờ xác nhận": "pending",
// //     "đã đặt hàng": "pending",
// //     confirmed: "confirmed",
// //     "đã xác nhận": "confirmed",
// //     preparing: "preparing",
// //     "đang chuẩn bị": "preparing",
// //     shipping: "shipping",
// //     "đang giao": "shipping",
// //     delivered: "delivered",
// //     "đã giao": "delivered",
// //     completed: "delivered",
// //     cancelled: "cancelled",
// //     canceled: "cancelled",
// //     "đã hủy": "cancelled",
// //   };

// //   return map[value] || "pending";
// // };

// // const normalizeOrder = (order) => {
// //   if (!order) return order;

// //   const id = String(order.id || order.orderId || "").replace(/^#/, "");

// //   return {
// //     ...order,
// //     id,
// //     customer: normalizeCustomer(order.customer),
// //     items: Array.isArray(order.items) ? order.items : [],
// //     total: Number(
// //       order.total ??
// //         order.totalAmount ??
// //         order.cartTotal ??
// //         order.grandTotal ??
// //         order.subtotal ??
// //         0
// //     ),
// //     status: normalizeStatus(order.status),
// //   };
// // };

// // const generateOrderCode = (orders) => {
// //   const now = new Date();
// //   const year = now.getFullYear();
// //   const month = String(now.getMonth() + 1).padStart(2, "0");
// //   const day = String(now.getDate()).padStart(2, "0");
// //   const prefix = `FS-${year}${month}${day}`;

// //   const todayCount = orders.filter((order) => {
// //     if (!order?.createdAt) return false;

// //     const date = new Date(order.createdAt);
// //     if (Number.isNaN(date.getTime())) return false;

// //     return (
// //       date.getFullYear() === year &&
// //       String(date.getMonth() + 1).padStart(2, "0") === month &&
// //       String(date.getDate()).padStart(2, "0") === day
// //     );
// //   }).length;

// //   return `${prefix}${String(todayCount + 1).padStart(2, "0")}`;
// // };

// // const OrderProvider = ({ children }) => {
// //   const auth = useContext(AuthContext);

// //   if (!auth) {
// //     throw new Error("OrderProvider phải được đặt bên trong AuthProvider.");
// //   }

// //   const { user } = auth;

// //   const [orders, setOrders] = useState(() => {
// //     try {
// //       const saved = localStorage.getItem(STORAGE_KEY);
// //       if (!saved) return [];

// //       const parsed = JSON.parse(saved);
// //       return Array.isArray(parsed) ? parsed.map(normalizeOrder) : [];
// //     } catch (error) {
// //       console.error("Lỗi khi đọc đơn hàng:", error);
// //       return [];
// //     }
// //   });

// //   useEffect(() => {
// //     try {
// //       localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
// //     } catch (error) {
// //       console.error("Lỗi khi lưu đơn hàng:", error);
// //     }
// //   }, [orders]);

// //   const createOrder = (orderData) => {
// //     if (!user) {
// //       return {
// //         success: false,
// //         message: "Bạn cần đăng nhập trước khi đặt hàng.",
// //       };
// //     }

// //     const createdAt = new Date().toISOString();
// //     const customer = normalizeCustomer(orderData?.customer);

// //     let createdOrder = null;

// //     setOrders((currentOrders) => {
// //       createdOrder = {
// //         ...orderData,
// //         id: generateOrderCode(currentOrders),
// //         createdAt,
// //         updatedAt: createdAt,
// //         status: normalizeStatus(orderData?.status || "pending"),
// //         customer,
// //         customerId: user.id,
// //         customerEmail: user.email,
// //         customerName: user.name || customer.fullName || customer.name || "",
// //       };

// //       return [createdOrder, ...currentOrders];
// //     });

// //     return {
// //       success: true,
// //       order: createdOrder,
// //       ...(createdOrder || {}),
// //     };
// //   };

// //   const getOrderById = (orderId) => {
// //     if (!orderId) return undefined;

// //     const normalizedId = String(orderId).replace(/^#/, "");

// //     return orders.find((order) => {
// //       const currentId = String(order?.id || order?.orderId || "").replace(
// //         /^#/,
// //         ""
// //       );

// //       return currentId === normalizedId;
// //     });
// //   };

// //   const getMyOrders = () => {
// //     if (!user) return [];

// //     if (user.role === "admin") {
// //       return orders;
// //     }

// //     return orders.filter(
// //       (order) => String(order?.customerId || "") === String(user.id || "")
// //     );
// //   };

// //   const canViewOrder = (order) => {
// //     if (!order || !user) return false;

// //     if (user.role === "admin" || user.role === "manager") {
// //       return true;
// //     }

// //     return String(order.customerId || "") === String(user.id || "");
// //   };

// //   /*
// //    * Trạng thái chuẩn hóa:
// //    * delivered = Đã giao
// //    *
// //    * AdminPage dùng cùng giá trị này để tính:
// //    * - số đơn đã giao
// //    * - doanh thu
// //    */
// //   const updateOrderStatus = (orderId, newStatus) => {
// //     if (!orderId) {
// //       return {
// //         success: false,
// //         message: "Thiếu mã đơn hàng.",
// //       };
// //     }

// //     const normalizedId = String(orderId).replace(/^#/, "");
// //     const status = normalizeStatus(newStatus);

// //     setOrders((currentOrders) =>
// //       currentOrders.map((order) => {
// //         const currentId = String(order?.id || order?.orderId || "").replace(
// //           /^#/,
// //           ""
// //         );

// //         if (currentId !== normalizedId) {
// //           return order;
// //         }

// //         return {
// //           ...order,
// //           id: currentId,
// //           status,
// //           updatedAt: new Date().toISOString(),
// //         };
// //       })
// //     );

// //     return {
// //       success: true,
// //       status,
// //     };
// //   };

// //   const removeOrder = (orderId) => {
// //     const normalizedId = String(orderId || "").replace(/^#/, "");

// //     setOrders((currentOrders) =>
// //       currentOrders.filter((order) => {
// //         const currentId = String(order?.id || order?.orderId || "").replace(
// //           /^#/,
// //           ""
// //         );

// //         return currentId !== normalizedId;
// //       })
// //     );
// //   };

// //   const value = useMemo(
// //     () => ({
// //       orders,
// //       createOrder,
// //       getOrderById,
// //       getMyOrders,
// //       canViewOrder,
// //       updateOrderStatus,
// //       removeOrder,
// //     }),
// //     [orders, user]
// //   );

// //   return (
// //     <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
// //   );
// // };

// // export default OrderProvider;

import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { OrderContext } from "./OrderContext";
import { AuthContext } from "./AuthContext";

import { ORDER_STATUS, normalizeOrderStatus } from "@/utils/orderStatus";

const STORAGE_KEY = "flower-shop-orders";

/* =========================================================
   ĐỊA CHỈ MẶC ĐỊNH
========================================================= */

const EMPTY_ADDRESS = {
  provinceCode: "",
  provinceName: "",
  wardCode: "",
  wardName: "",
  houseNumber: "",
  street: "",
};

/* =========================================================
   CHUẨN HÓA ĐỊA CHỈ
========================================================= */

const normalizeAddress = (address = {}) => {
  if (!address || typeof address !== "object") {
    return { ...EMPTY_ADDRESS };
  }

  return {
    provinceCode: String(
      address.provinceCode ?? address.province_id ?? address.provinceId ?? ""
    ),

    provinceName:
      address.provinceName || address.province || address.province_name || "",

    wardCode: String(
      address.wardCode ?? address.ward_id ?? address.wardId ?? ""
    ),

    wardName:
      address.wardName ||
      address.ward ||
      address.ward_name ||
      address.communeName ||
      "",

    houseNumber:
      address.houseNumber || address.house_number || address.house || "",

    street: address.street || address.streetName || address.street_name || "",

    note: address.note || "",
  };
};

/* =========================================================
   LẤY ĐỊA CHỈ TỪ MỌI CẤU TRÚC CŨ
========================================================= */

const getOrderAddressSource = (order = {}) => {
  return (
    order?.customer?.address ||
    order?.shippingAddress ||
    order?.customerAddress ||
    order?.address ||
    {}
  );
};

/* =========================================================
   CHUẨN HÓA CUSTOMER
========================================================= */

const normalizeCustomer = (customer = {}, fallbackAddress = {}) => {
  const addressSource =
    customer?.address && typeof customer.address === "object"
      ? customer.address
      : fallbackAddress;

  return {
    ...customer,

    name: customer.name || customer.fullName || "",

    fullName: customer.fullName || customer.name || "",

    phone: customer.phone || "",

    email: customer.email || "",

    address: normalizeAddress(addressSource),

    note: customer.note || "",
  };
};

/* =========================================================
   CHUẨN HÓA ORDER
========================================================= */

const normalizeOrder = (order) => {
  if (!order) {
    return order;
  }

  const id = String(order.id || order.orderId || "").replace(/^#/, "");

  const address = normalizeAddress(getOrderAddressSource(order));

  const customer = normalizeCustomer(order.customer, address);

  return {
    ...order,

    id,

    orderId: id,

    customer,

    customerId: order.customerId || customer.id || "",

    customerEmail: order.customerEmail || customer.email || "",

    customerName:
      order.customerName || customer.name || customer.fullName || "",

    shippingAddress: address,

    customerAddress: address,

    address,

    items: Array.isArray(order.items)
      ? order.items
      : Array.isArray(order.products)
        ? order.products
        : [],

    total: Number(
      order.total ??
        order.totalAmount ??
        order.cartTotal ??
        order.grandTotal ??
        order.subtotal ??
        0
    ),

    status: normalizeOrderStatus(order.status),
  };
};

/* =========================================================
   TẠO MÃ ĐƠN HÀNG
========================================================= */

const generateOrderCode = (orders) => {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  const prefix = `FS-${year}${month}${day}`;

  const todayOrders = orders.filter((order) => {
    if (!order?.createdAt) {
      return false;
    }

    const date = new Date(order.createdAt);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return (
      date.getFullYear() === year &&
      String(date.getMonth() + 1).padStart(2, "0") === month &&
      String(date.getDate()).padStart(2, "0") === day
    );
  });

  return `${prefix}${String(todayOrders.length + 1).padStart(2, "0")}`;
};

/* =========================================================
   PROVIDER
========================================================= */

const OrderProvider = ({ children }) => {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("OrderProvider phải được đặt bên trong AuthProvider.");
  }

  const { user } = auth;

  /* =======================================================
     ĐỌC ĐƠN HÀNG
  ======================================================= */

  const readOrders = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map(normalizeOrder).filter(Boolean);
    } catch (error) {
      console.error("Lỗi đọc đơn hàng:", error);

      return [];
    }
  }, []);

  const [orders, setOrders] = useState(() => readOrders());

  /* =======================================================
     LƯU ĐƠN HÀNG
  ======================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error("Lỗi lưu đơn hàng:", error);
    }
  }, [orders]);

  /* =======================================================
     ĐỒNG BỘ GIỮA CÁC TAB
  ======================================================= */

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        setOrders(readOrders());
      }
    };

    const handleCustomUpdate = () => {
      setOrders(readOrders());
    };

    window.addEventListener("storage", handleStorage);

    window.addEventListener("flower-shop-orders-updated", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener(
        "flower-shop-orders-updated",
        handleCustomUpdate
      );
    };
  }, [readOrders]);

  /* =======================================================
     TẠO ĐƠN HÀNG
  ======================================================= */

  const createOrder = useCallback(
    (orderData = {}) => {
      if (!user) {
        return {
          success: false,
          message: "Bạn cần đăng nhập trước khi đặt hàng.",
        };
      }

      const createdAt = new Date().toISOString();

      const address = normalizeAddress(
        orderData?.customer?.address ||
          orderData?.shippingAddress ||
          orderData?.customerAddress ||
          orderData?.address ||
          {}
      );

      const customer = normalizeCustomer(
        {
          ...(orderData.customer || {}),

          name:
            orderData.customer?.name ||
            orderData.customer?.fullName ||
            orderData.customerName ||
            user.name ||
            "",

          fullName:
            orderData.customer?.fullName ||
            orderData.customer?.name ||
            orderData.customerName ||
            user.name ||
            "",

          phone:
            orderData.customer?.phone || orderData.phone || user.phone || "",

          email:
            orderData.customer?.email ||
            orderData.customerEmail ||
            user.email ||
            "",
        },
        address
      );

      let createdOrder = null;

      setOrders((currentOrders) => {
        createdOrder = normalizeOrder({
          ...orderData,

          id: generateOrderCode(currentOrders),

          createdAt,

          updatedAt: createdAt,

          status: ORDER_STATUS.PENDING,

          customer,

          customerId: user.id,

          customerEmail: user.email,

          customerName: user.name || customer.name || customer.fullName || "",

          shippingAddress: address,

          customerAddress: address,

          address,

          items: Array.isArray(orderData.items) ? orderData.items : [],

          total:
            orderData.total ??
            orderData.totalAmount ??
            orderData.cartTotal ??
            orderData.grandTotal ??
            orderData.subtotal ??
            0,
        });

        return [createdOrder, ...currentOrders];
      });

      return {
        success: true,
        order: createdOrder,
        ...(createdOrder || {}),
      };
    },
    [user]
  );

  /* =======================================================
     LẤY ĐƠN THEO ID
  ======================================================= */

  const getOrderById = useCallback(
    (orderId) => {
      if (!orderId) {
        return undefined;
      }

      const normalizedId = String(orderId).replace(/^#/, "");

      return orders.find(
        (order) =>
          String(order?.id || order?.orderId || "").replace(/^#/, "") ===
          normalizedId
      );
    },
    [orders]
  );

  /* =======================================================
     ĐƠN CỦA KHÁCH HÀNG
  ======================================================= */

  const getMyOrders = useCallback(() => {
    if (!user) {
      return [];
    }

    if (user.role === "admin") {
      return orders;
    }

    return orders.filter(
      (order) => String(order?.customerId || "") === String(user.id || "")
    );
  }, [orders, user]);

  /* =======================================================
     QUYỀN XEM ĐƠN
  ======================================================= */

  const canViewOrder = useCallback(
    (order) => {
      if (!order || !user) {
        return false;
      }

      if (user.role === "admin" || user.role === "manager") {
        return true;
      }

      return String(order.customerId || "") === String(user.id || "");
    },
    [user]
  );

  /* =======================================================
     CẬP NHẬT TRẠNG THÁI
  ======================================================= */

  const updateOrderStatus = useCallback((orderId, newStatus) => {
    if (!orderId) {
      return {
        success: false,
        message: "Thiếu mã đơn hàng.",
      };
    }

    const normalizedId = String(orderId).replace(/^#/, "");

    const status = normalizeOrderStatus(newStatus);

    let found = false;

    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        const currentId = String(order?.id || order?.orderId || "").replace(
          /^#/,
          ""
        );

        if (currentId !== normalizedId) {
          return order;
        }

        found = true;

        return {
          ...order,

          id: currentId,

          orderId: currentId,

          status,

          updatedAt: new Date().toISOString(),
        };
      })
    );

    window.setTimeout(() => {
      window.dispatchEvent(new Event("flower-shop-orders-updated"));
    }, 0);

    return {
      success: true,
      status,
      found,
    };
  }, []);

  /* =======================================================
     XÓA ĐƠN
  ======================================================= */

  const removeOrder = useCallback((orderId) => {
    const normalizedId = String(orderId || "").replace(/^#/, "");

    setOrders((currentOrders) =>
      currentOrders.filter(
        (order) =>
          String(order?.id || order?.orderId || "").replace(/^#/, "") !==
          normalizedId
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      orders,
      createOrder,
      getOrderById,
      getMyOrders,
      canViewOrder,
      updateOrderStatus,
      removeOrder,
    }),
    [
      orders,
      createOrder,
      getOrderById,
      getMyOrders,
      canViewOrder,
      updateOrderStatus,
      removeOrder,
    ]
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

export default OrderProvider;

// import { useContext, useEffect, useMemo, useState } from "react";
// import { OrderContext } from "./OrderContext";
// import { AuthContext } from "./AuthContext";

// const STORAGE_KEY = "flower-shop-orders";

// /* =====================================================
//    CHUẨN HÓA ĐỊA CHỈ
// ===================================================== */

// const normalizeAddress = (address = {}) => {
//   if (!address || typeof address !== "object") {
//     return {
//       provinceCode: "",
//       provinceName: "",
//       wardCode: "",
//       wardName: "",
//       houseNumber: "",
//       street: "",
//     };
//   }

//   return {
//     provinceCode: address.provinceCode
//       ? String(address.provinceCode)
//       : address.province_id
//         ? String(address.province_id)
//         : "",

//     provinceName:
//       address.provinceName || address.province || address.province_name || "",

//     wardCode: address.wardCode
//       ? String(address.wardCode)
//       : address.ward_id
//         ? String(address.ward_id)
//         : "",

//     wardName:
//       address.wardName ||
//       address.ward ||
//       address.ward_name ||
//       address.communeName ||
//       "",

//     houseNumber:
//       address.houseNumber || address.house_number || address.house || "",

//     street: address.street || address.streetName || address.street_name || "",

//     note: address.note || "",
//   };
// };

// /* =====================================================
//    CHUẨN HÓA KHÁCH HÀNG
// ===================================================== */

// const normalizeCustomer = (customer = {}) => ({
//   ...customer,

//   name: customer.name || customer.fullName || "",

//   fullName: customer.fullName || customer.name || "",

//   phone: customer.phone || "",

//   email: customer.email || "",

//   address: normalizeAddress(customer.address),

//   note: customer.note || "",
// });

// /* =====================================================
//    CHUẨN HÓA TRẠNG THÁI

//    QUAN TRỌNG:
//    delivered = Đã giao

//    completed chỉ được giữ để tương thích dữ liệu cũ.
// ===================================================== */

// export const normalizeOrderStatus = (status) => {
//   const value = String(status || "")
//     .trim()
//     .toLowerCase();

//   const STATUS_MAP = {
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

//     // Tương thích dữ liệu cũ
//     completed: "delivered",
//     "hoàn thành": "delivered",

//     cancelled: "cancelled",
//     canceled: "cancelled",
//     "đã hủy": "cancelled",
//   };

//   return STATUS_MAP[value] || "pending";
// };

// /* =====================================================
//    CHUẨN HÓA ĐƠN HÀNG
// ===================================================== */

// const normalizeOrder = (order) => {
//   if (!order || typeof order !== "object") {
//     return null;
//   }

//   const id = String(order.id || order.orderId || "").replace(/^#/, "");

//   return {
//     ...order,

//     id,

//     customer: normalizeCustomer(order.customer),

//     items: Array.isArray(order.items)
//       ? order.items
//       : Array.isArray(order.products)
//         ? order.products
//         : [],

//     total: Number(
//       order.total ??
//         order.totalAmount ??
//         order.cartTotal ??
//         order.grandTotal ??
//         order.subtotal ??
//         0
//     ),

//     status: normalizeOrderStatus(order.status),
//   };
// };

// /* =====================================================
//    ĐỌC ĐƠN HÀNG TỪ LOCAL STORAGE
// ===================================================== */

// const readOrdersFromStorage = () => {
//   try {
//     const savedOrders = localStorage.getItem(STORAGE_KEY);

//     if (!savedOrders) {
//       return [];
//     }

//     const parsedOrders = JSON.parse(savedOrders);

//     if (!Array.isArray(parsedOrders)) {
//       return [];
//     }

//     return parsedOrders.map(normalizeOrder).filter(Boolean);
//   } catch (error) {
//     console.error("Lỗi khi đọc đơn hàng từ LocalStorage:", error);

//     return [];
//   }
// };

// /* =====================================================
//    TẠO MÃ ĐƠN HÀNG
// ===================================================== */

// const generateOrderCode = (orders) => {
//   const now = new Date();

//   const year = now.getFullYear();

//   const month = String(now.getMonth() + 1).padStart(2, "0");

//   const day = String(now.getDate()).padStart(2, "0");

//   const prefix = `FS-${year}${month}${day}`;

//   const todayOrders = orders.filter((order) => {
//     if (!order?.createdAt) {
//       return false;
//     }

//     const date = new Date(order.createdAt);

//     if (Number.isNaN(date.getTime())) {
//       return false;
//     }

//     return (
//       date.getFullYear() === year &&
//       String(date.getMonth() + 1).padStart(2, "0") === month &&
//       String(date.getDate()).padStart(2, "0") === day
//     );
//   });

//   const sequence = String(todayOrders.length + 1).padStart(2, "0");

//   return `${prefix}${sequence}`;
// };

// /* =====================================================
//    PROVIDER
// ===================================================== */

// const OrderProvider = ({ children }) => {
//   const auth = useContext(AuthContext);

//   if (!auth) {
//     throw new Error("OrderProvider phải được đặt bên trong AuthProvider.");
//   }

//   const { user } = auth;

//   /* ===================================================
//      STATE
//   =================================================== */

//   const [orders, setOrders] = useState(() => readOrdersFromStorage());

//   /* ===================================================
//      GHI ORDERS VÀO LOCAL STORAGE

//      Chỉ ghi khi state orders thay đổi.
//   =================================================== */

//   useEffect(() => {
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
//     } catch (error) {
//       console.error("Lỗi khi lưu đơn hàng:", error);
//     }
//   }, [orders]);

//   /* ===================================================
//      ĐỒNG BỘ ĐƠN HÀNG GIỮA CÁC TAB

//      Admin tab cập nhật:
//        localStorage

//      Customer tab:
//        nhận storage event
//        → đọc lại orders
//        → setOrders
//        → giao diện cập nhật.
//   =================================================== */

//   useEffect(() => {
//     const reloadOrders = () => {
//       const latestOrders = readOrdersFromStorage();

//       setOrders((currentOrders) => {
//         const currentJson = JSON.stringify(currentOrders);

//         const latestJson = JSON.stringify(latestOrders);

//         if (currentJson === latestJson) {
//           return currentOrders;
//         }

//         return latestOrders;
//       });
//     };

//     const handleStorage = (event) => {
//       if (event.key === STORAGE_KEY) {
//         reloadOrders();
//       }
//     };

//     const handleFocus = () => {
//       reloadOrders();
//     };

//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "visible") {
//         reloadOrders();
//       }
//     };

//     window.addEventListener("storage", handleStorage);

//     window.addEventListener("focus", handleFocus);

//     document.addEventListener("visibilitychange", handleVisibilityChange);

//     return () => {
//       window.removeEventListener("storage", handleStorage);

//       window.removeEventListener("focus", handleFocus);

//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//     };
//   }, []);

//   /* ===================================================
//      TẠO ĐƠN HÀNG
//   =================================================== */

//   const createOrder = (orderData) => {
//     if (!user) {
//       return {
//         success: false,
//         message: "Bạn cần đăng nhập trước khi đặt hàng.",
//       };
//     }

//     const createdAt = new Date().toISOString();

//     const customer = normalizeCustomer(orderData?.customer);

//     let createdOrder = null;

//     setOrders((currentOrders) => {
//       createdOrder = {
//         ...orderData,

//         id: generateOrderCode(currentOrders),

//         createdAt,

//         updatedAt: createdAt,

//         status: normalizeOrderStatus(orderData?.status || "pending"),

//         customer,

//         customerId: user.id,

//         customerEmail: user.email,

//         customerName: user.name || customer.fullName || customer.name || "",
//       };

//       return [createdOrder, ...currentOrders];
//     });

//     return {
//       success: true,
//       order: createdOrder,
//       ...(createdOrder || {}),
//     };
//   };

//   /* ===================================================
//      LẤY ĐƠN THEO ID
//   =================================================== */

//   const getOrderById = (orderId) => {
//     if (!orderId) {
//       return undefined;
//     }

//     const normalizedId = String(orderId).replace(/^#/, "");

//     return orders.find((order) => {
//       const currentId = String(order?.id || order?.orderId || "").replace(
//         /^#/,
//         ""
//       );

//       return currentId === normalizedId;
//     });
//   };

//   /* ===================================================
//      LẤY ĐƠN CỦA USER HIỆN TẠI
//   =================================================== */

//   const getMyOrders = () => {
//     if (!user) {
//       return [];
//     }

//     if (user.role === "admin") {
//       return orders;
//     }

//     return orders.filter(
//       (order) => String(order?.customerId || "") === String(user.id || "")
//     );
//   };

//   /* ===================================================
//      KIỂM TRA QUYỀN XEM ĐƠN
//   =================================================== */

//   const canViewOrder = (order) => {
//     if (!order || !user) {
//       return false;
//     }

//     if (user.role === "admin" || user.role === "manager") {
//       return true;
//     }

//     return String(order.customerId || "") === String(user.id || "");
//   };

//   /* ===================================================
//      CẬP NHẬT TRẠNG THÁI

//      Đây là phần quan trọng nhất.
//   =================================================== */

//   const updateOrderStatus = (orderId, newStatus) => {
//     if (!orderId) {
//       return {
//         success: false,
//         message: "Thiếu mã đơn hàng.",
//       };
//     }

//     const normalizedId = String(orderId).replace(/^#/, "");

//     const status = normalizeOrderStatus(newStatus);

//     const updatedAt = new Date().toISOString();

//     let updated = false;

//     setOrders((currentOrders) => {
//       const nextOrders = currentOrders.map((order) => {
//         const currentId = String(order?.id || order?.orderId || "").replace(
//           /^#/,
//           ""
//         );

//         if (currentId !== normalizedId) {
//           return order;
//         }

//         updated = true;

//         return {
//           ...order,

//           id: currentId,

//           status,

//           updatedAt,
//         };
//       });

//       /*
//        * Ghi NGAY vào LocalStorage.
//        *
//        * Không chờ useEffect.
//        * Điều này giúp tab khách hàng
//        * nhận được thay đổi sớm nhất.
//        */
//       try {
//         localStorage.setItem(STORAGE_KEY, JSON.stringify(nextOrders));
//       } catch (error) {
//         console.error("Lỗi khi ghi trạng thái đơn hàng:", error);
//       }

//       return nextOrders;
//     });

//     if (!updated) {
//       return {
//         success: false,
//         message: "Không tìm thấy đơn hàng.",
//       };
//     }

//     return {
//       success: true,
//       status,
//     };
//   };

//   /* ===================================================
//      XÓA ĐƠN
//   =================================================== */

//   const removeOrder = (orderId) => {
//     const normalizedId = String(orderId || "").replace(/^#/, "");

//     setOrders((currentOrders) =>
//       currentOrders.filter((order) => {
//         const currentId = String(order?.id || order?.orderId || "").replace(
//           /^#/,
//           ""
//         );

//         return currentId !== normalizedId;
//       })
//     );
//   };

//   /* ===================================================
//      CONTEXT VALUE
//   =================================================== */

//   const value = useMemo(
//     () => ({
//       orders,

//       createOrder,

//       getOrderById,

//       getMyOrders,

//       canViewOrder,

//       updateOrderStatus,

//       removeOrder,

//       normalizeOrderStatus,
//     }),
//     [orders, user]
//   );

//   return (
//     <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
//   );
// };

// export default OrderProvider;
