import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { OrderContext } from "./OrderContext";
import { AuthContext } from "./AuthContext";

import { ORDER_STATUS, normalizeOrderStatus } from "@/utils/orderStatus";

import { consumeStockForItems, restockOrderItems } from "@/services/inventory";

const STORAGE_KEY = "flower-shop-orders";

/* =========================================================
   ĐỊA CHỈ
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
   NORMALIZE ADDRESS
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
   ORDER ADDRESS
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
   NORMALIZE CUSTOMER
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
   NORMALIZE ORDER
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

    inventoryConsumed: Boolean(order.inventoryConsumed),

    inventoryRestocked: Boolean(order.inventoryRestocked),

    inventorySnapshots: Array.isArray(order.inventorySnapshots)
      ? order.inventorySnapshots
      : [],
  };
};

/* =========================================================
   ORDER CODE
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
     READ ORDERS
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
     SAVE ORDERS
  ======================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error("Lỗi lưu đơn hàng:", error);
    }
  }, [orders]);

  /* =======================================================
     CROSS TAB
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
     CREATE ORDER
  ======================================================= */

  const createOrder = useCallback(
    async (orderData = {}) => {
      if (!user) {
        return {
          success: false,
          message: "Bạn cần đăng nhập trước khi đặt hàng.",
        };
      }

      const items = Array.isArray(orderData.items) ? orderData.items : [];

      if (items.length === 0) {
        return {
          success: false,
          message: "Đơn hàng không có sản phẩm.",
        };
      }

      /*
       * QUAN TRỌNG:
       * Kiểm tra và trừ tồn kho ở thời điểm
       * tạo đơn, không dựa vào stock trong cart.
       */
      const inventoryResult = await consumeStockForItems(items);

      if (!inventoryResult.success) {
        return {
          success: false,
          message:
            inventoryResult.message || "Tồn kho không đủ để hoàn tất đơn hàng.",
          errors: inventoryResult.errors || [],
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
        const orderId = generateOrderCode(currentOrders);

        const snapshotItems = items.map((item) => {
          const snapshot = inventoryResult.snapshots.find(
            (entry) => String(entry.productId) === String(item.id)
          );

          return {
            id: item.id,

            productId: item.id,

            name: item.name || "Sản phẩm",

            price: Number(item.price) || 0,

            quantity: Number(item.quantity) || 0,

            image: item.image || "",

            stockSnapshot: snapshot
              ? {
                  stockBefore: snapshot.stockBefore,

                  stockAfter: snapshot.stockAfter,

                  stockStatusBefore: snapshot.stockStatusBefore,
                }
              : null,
          };
        });

        createdOrder = normalizeOrder({
          ...orderData,

          id: orderId,

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

          items: snapshotItems,

          total:
            orderData.total ??
            orderData.totalAmount ??
            orderData.cartTotal ??
            orderData.grandTotal ??
            orderData.subtotal ??
            0,

          inventoryConsumed: true,

          inventoryRestocked: false,

          inventorySnapshots: inventoryResult.snapshots,
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
     GET ORDER
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
     MY ORDERS
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
     CAN VIEW
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
     UPDATE STATUS
  ======================================================= */

  const updateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      if (!orderId) {
        return {
          success: false,
          message: "Thiếu mã đơn hàng.",
        };
      }

      const normalizedId = String(orderId).replace(/^#/, "");

      const status = normalizeOrderStatus(newStatus);

      const currentOrder = orders.find(
        (order) =>
          String(order?.id || order?.orderId || "").replace(/^#/, "") ===
          normalizedId
      );

      if (!currentOrder) {
        return {
          success: false,
          message: "Không tìm thấy đơn hàng.",
        };
      }

      const currentStatus = normalizeOrderStatus(currentOrder.status);

      /*
       * Không cho đơn đã hủy quay lại trạng thái
       * đang xử lý vì tồn kho đã được hoàn.
       */
      if (
        currentStatus === ORDER_STATUS.CANCELLED &&
        status !== ORDER_STATUS.CANCELLED
      ) {
        return {
          success: false,
          message:
            "Đơn hàng đã hủy và tồn kho đã được hoàn. Không thể chuyển lại trạng thái xử lý.",
        };
      }

      /*
       * HỦY ĐƠN → HOÀN TỒN
       */
      if (
        status === ORDER_STATUS.CANCELLED &&
        currentStatus !== ORDER_STATUS.CANCELLED &&
        !currentOrder.inventoryRestocked
      ) {
        const restockResult = await restockOrderItems(currentOrder.items);

        if (!restockResult.success) {
          return {
            success: false,
            message: restockResult.message || "Không thể hoàn tồn kho.",
          };
        }

        setOrders((currentOrders) =>
          currentOrders.map((order) => {
            const currentId = String(order?.id || order?.orderId || "").replace(
              /^#/,
              ""
            );

            if (currentId !== normalizedId) {
              return order;
            }

            return {
              ...order,

              id: currentId,

              orderId: currentId,

              status,

              inventoryRestocked: true,

              inventoryRestockSnapshots: restockResult.snapshots,

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
          found: true,
          inventoryRestocked: true,
        };
      }

      /*
       * CÁC TRẠNG THÁI KHÁC
       */
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
    },
    [orders]
  );

  /* =======================================================
     REMOVE ORDER
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

  /* =======================================================
     VALUE
  ======================================================= */

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
