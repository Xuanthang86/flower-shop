import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { OrderContext } from "./OrderContext";
import { AuthContext } from "./AuthContext";

import { ORDER_STATUS, normalizeOrderStatus } from "@/utils/orderStatus";

import { PAYMENT_STATUS, normalizePaymentStatus } from "@/utils/paymentStatus";

import { consumeStockForItems, restockOrderItems } from "@/services/inventory";

const STORAGE_KEY = "flower-shop-orders";

const ORDERS_UPDATED_EVENT = "flower-shop-orders-updated";

const EMPTY_ADDRESS = {
  provinceCode: "",
  provinceName: "",
  wardCode: "",
  wardName: "",
  houseNumber: "",
  street: "",
};

const normalizeAddress = (address = {}) => {
  if (!address || typeof address !== "object") {
    return {
      ...EMPTY_ADDRESS,
    };
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

const getOrderAddressSource = (order = {}) =>
  order?.customer?.address ||
  order?.shippingAddress ||
  order?.customerAddress ||
  order?.address ||
  {};

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

const normalizePayment = (payment = {}, order = {}) => {
  const paymentMethod = String(payment?.method || order?.paymentMethod || "cod")
    .trim()
    .toLowerCase();

  const rawStatus =
    payment?.status || order?.paymentStatus || PAYMENT_STATUS.PENDING;

  const normalizedStatus = normalizePaymentStatus(rawStatus);

  const amount = Math.max(
    0,
    Number(
      payment?.amount ??
        order?.grandTotal ??
        order?.total ??
        order?.subtotal ??
        0
    ) || 0
  );

  const reference = String(
    payment?.reference ||
      payment?.paymentReference ||
      order?.paymentReference ||
      order?.paymentOrderCode ||
      ""
  ).trim();

  const transactionId = String(
    payment?.transactionId ||
      payment?.providerTransactionId ||
      order?.paymentTransactionId ||
      ""
  ).trim();

  const provider = String(
    payment?.provider ||
      (paymentMethod === "bank_transfer" ? "bank_transfer" : "cod")
  ).trim();

  const transaction =
    payment?.transaction && typeof payment.transaction === "object"
      ? payment.transaction
      : order?.paymentTransaction &&
          typeof order.paymentTransaction === "object"
        ? order.paymentTransaction
        : null;

  return {
    id: String(payment?.id || payment?.paymentId || "").trim(),

    reference,

    method: paymentMethod,

    provider,

    status: normalizedStatus,

    amount,

    currency: String(payment?.currency || "VND")
      .trim()
      .toUpperCase(),

    transactionId,

    transaction,

    transferContent: String(
      payment?.transferContent || order?.paymentTransferContent || ""
    ).trim(),

    paidAt: payment?.paidAt || order?.paymentPaidAt || null,

    failedAt: payment?.failedAt || order?.paymentFailedAt || null,

    refundedAt: payment?.refundedAt || order?.paymentRefundedAt || null,

    failureReason: String(
      payment?.failureReason || order?.paymentFailureReason || ""
    ).trim(),

    refundAmount: Math.max(
      0,
      Number(payment?.refundAmount ?? order?.refundAmount ?? 0) || 0
    ),

    paymentAttemptedAt:
      payment?.paymentAttemptedAt || order?.paymentAttemptedAt || null,
  };
};

const normalizeOrder = (order) => {
  if (!order) {
    return order;
  }

  const id = String(order.id || order.orderId || "").replace(/^#/, "");

  const address = normalizeAddress(getOrderAddressSource(order));

  const customer = normalizeCustomer(order.customer, address);

  const payment = normalizePayment(order.payment, order);

  return {
    ...order,

    couponSnapshot:
      order?.couponSnapshot && typeof order.couponSnapshot === "object"
        ? {
            ...order.couponSnapshot,

            code: String(order.couponSnapshot.code || "")
              .trim()
              .toUpperCase(),

            discountAmount: Math.max(
              0,
              Number(order.couponSnapshot.discountAmount) || 0
            ),

            eligibleSubtotal: Math.max(
              0,
              Number(order.couponSnapshot.eligibleSubtotal) || 0
            ),

            categoryRestriction: Array.isArray(
              order.couponSnapshot.categoryRestriction
            )
              ? [...order.couponSnapshot.categoryRestriction]
              : [],

            productRestriction: Array.isArray(
              order.couponSnapshot.productRestriction
            )
              ? [...order.couponSnapshot.productRestriction]
              : [],
          }
        : null,

    couponCode: String(order?.couponCode || order?.couponSnapshot?.code || "")
      .trim()
      .toUpperCase(),

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

    subtotal: Math.max(0, Number(order?.subtotal) || 0),

    shippingFee: Math.max(0, Number(order?.shippingFee) || 0),

    discountAmount: Math.max(
      0,
      Number(
        order?.discountAmount ??
          order?.couponSnapshot?.discountAmount ??
          0
      ) || 0
    ),

    grandTotal: Math.max(
      0,
      Number(order?.grandTotal ?? order?.total ?? order?.totalAmount ?? 0) || 0
    ),

    total: Math.max(
      0,
      Number(order?.grandTotal ?? order?.total ?? order?.totalAmount ?? 0) || 0
    ),

    status: normalizeOrderStatus(order.status),

    inventoryConsumed: Boolean(order.inventoryConsumed),

    inventoryRestocked: Boolean(order.inventoryRestocked),

    inventorySnapshots: Array.isArray(order.inventorySnapshots)
      ? order.inventorySnapshots
      : [],

    inventoryRestockSnapshots: Array.isArray(order.inventoryRestockSnapshots)
      ? order.inventoryRestockSnapshots
      : [],

    payment,

    paymentMethod: payment.method,

    paymentStatus: payment.status,

    paymentReference: payment.reference,

    paymentTransactionId: payment.transactionId,

    paymentTransaction: payment.transaction,

    paymentPaidAt: payment.paidAt,

    paymentFailedAt: payment.failedAt,

    paymentRefundedAt: payment.refundedAt,

    paymentFailureReason: payment.failureReason,

    paymentAttemptedAt: payment.paymentAttemptedAt,

    refundAmount: payment.refundAmount,
  };
};

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

const writeOrdersToStorage = (orders) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

const notifyOrdersUpdated = () => {
  window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
};

const OrderProvider = ({ children }) => {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("OrderProvider phải được đặt bên trong AuthProvider.");
  }

  const { user } = auth;

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

  useEffect(() => {
    try {
      writeOrdersToStorage(orders);
    } catch (error) {
      console.error("Lỗi lưu đơn hàng:", error);
    }
  }, [orders]);

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

    window.addEventListener(ORDERS_UPDATED_EVENT, handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener(ORDERS_UPDATED_EVENT, handleCustomUpdate);
    };
  }, [readOrders]);

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

      const currentOrders = readOrders();

      const suppliedOrderId = String(orderData.orderId || orderData.id || "")
        .replace(/^#/, "")
        .trim();

      const orderId = suppliedOrderId || generateOrderCode(currentOrders);

      const paymentInput = orderData.payment || {};

      const payment = {
        id: paymentInput.id || "",

        reference: paymentInput.reference || orderData.paymentOrderCode || "",

        method: paymentInput.method || orderData.paymentMethod || "cod",

        provider:
          paymentInput.provider ||
          (orderData.paymentMethod === "bank_transfer"
            ? "bank_transfer"
            : "cod"),

        status: normalizePaymentStatus(
          paymentInput.status ||
            orderData.paymentStatus ||
            PAYMENT_STATUS.PENDING
        ),

        amount: Math.max(
          0,
          Number(
            paymentInput.amount ?? orderData.grandTotal ?? orderData.total ?? 0
          ) || 0
        ),

        currency: paymentInput.currency || "VND",

        transactionId:
          paymentInput.transactionId || orderData.paymentTransactionId || "",

        transaction:
          paymentInput.transaction || orderData.paymentTransaction || null,

        transferContent:
          paymentInput.transferContent ||
          orderData.paymentTransferContent ||
          "",

        paidAt: paymentInput.paidAt || orderData.paymentPaidAt || null,

        failedAt: paymentInput.failedAt || orderData.paymentFailedAt || null,

        refundedAt:
          paymentInput.refundedAt || orderData.paymentRefundedAt || null,

        failureReason:
          paymentInput.failureReason || orderData.paymentFailureReason || "",

        refundAmount: Math.max(
          0,
          Number(paymentInput.refundAmount ?? orderData.refundAmount ?? 0) || 0
        ),

        paymentAttemptedAt:
          paymentInput.paymentAttemptedAt ||
          orderData.paymentAttemptedAt ||
          null,
      };

      const createdOrder = normalizeOrder({
        ...orderData,

        id: orderId,

        orderId,

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

        subtotal: Number(orderData.subtotal) || 0,

        shippingFee: Number(orderData.shippingFee) || 0,

        discountAmount: Math.max(0, Number(orderData.discountAmount) || 0),

        grandTotal: Math.max(
          0,
          Number(orderData.grandTotal ?? orderData.total ?? 0) || 0
        ),

        total: Math.max(
          0,
          Number(orderData.grandTotal ?? orderData.total ?? 0) || 0
        ),

        payment,

        paymentMethod: payment.method,

        paymentStatus: payment.status,

        paymentReference: payment.reference,

        paymentTransactionId: payment.transactionId,

        paymentTransaction: payment.transaction,

        paymentPaidAt: payment.paidAt,

        paymentFailedAt: payment.failedAt,

        paymentRefundedAt: payment.refundedAt,

        paymentFailureReason: payment.failureReason,

        paymentAttemptedAt: payment.paymentAttemptedAt,

        refundAmount: payment.refundAmount,

        inventoryConsumed: true,

        inventoryRestocked: false,

        inventorySnapshots: inventoryResult.snapshots,

        inventoryRestockSnapshots: [],
      });

      const nextOrders = [createdOrder, ...currentOrders];

      try {
        writeOrdersToStorage(nextOrders);
      } catch (storageError) {
        const rollback = await restockOrderItems(snapshotItems);

        if (!rollback.success) {
          console.error(
            "LỖI NGHIÊM TRỌNG: Không thể rollback tồn kho sau khi ghi order thất bại.",
            rollback
          );
        }

        return {
          success: false,

          message:
            "Không thể lưu đơn hàng. Hệ thống đã thực hiện hoàn tồn kho.",

          error: storageError,
        };
      }

      setOrders(nextOrders);

      notifyOrdersUpdated();

      return {
        success: true,

        order: createdOrder,

        ...createdOrder,
      };
    },
    [user, readOrders]
  );

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

  const getPaymentByOrderId = useCallback(
    (orderId) => {
      const order = getOrderById(orderId);

      if (!order) {
        return null;
      }

      return normalizePayment(order.payment, order);
    },
    [getOrderById]
  );

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

      if (currentStatus === status) {
        return {
          success: true,
          status,

          found: true,

          inventoryRestocked: Boolean(currentOrder.inventoryRestocked),
        };
      }

      if (
        status === ORDER_STATUS.CANCELLED &&
        currentStatus !== ORDER_STATUS.CANCELLED
      ) {
        if (currentOrder.inventoryRestocked) {
          const nextOrders = orders.map((order) => {
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

              updatedAt: new Date().toISOString(),
            };
          });

          try {
            writeOrdersToStorage(nextOrders);

            setOrders(nextOrders);

            notifyOrdersUpdated();

            return {
              success: true,

              status,

              found: true,

              inventoryRestocked: true,
            };
          } catch (error) {
            return {
              success: false,

              message: "Không thể cập nhật trạng thái đơn hàng.",

              error,
            };
          }
        }

        const restockResult = await restockOrderItems(currentOrder.items);

        if (!restockResult.success) {
          return {
            success: false,

            message: restockResult.message || "Không thể hoàn tồn kho.",
          };
        }

        const nextOrders = orders.map((order) => {
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
        });

        try {
          writeOrdersToStorage(nextOrders);

          setOrders(nextOrders);

          notifyOrdersUpdated();

          return {
            success: true,

            status,

            found: true,

            inventoryRestocked: true,
          };
        } catch (storageError) {
          return {
            success: false,

            message:
              "Đã hoàn tồn kho nhưng không thể lưu trạng thái hủy đơn. Vui lòng tải lại trang để đồng bộ đơn hàng.",

            error: storageError,
          };
        }
      }

      const nextOrders = orders.map((order) => {
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

          updatedAt: new Date().toISOString(),
        };
      });

      const found = nextOrders.some(
        (order) =>
          String(order?.id || order?.orderId || "").replace(/^#/, "") ===
          normalizedId
      );

      if (!found) {
        return {
          success: false,
          message: "Không tìm thấy đơn hàng.",
        };
      }

      try {
        writeOrdersToStorage(nextOrders);

        setOrders(nextOrders);

        notifyOrdersUpdated();

        return {
          success: true,

          status,

          found: true,
        };
      } catch (storageError) {
        return {
          success: false,

          message: "Không thể lưu trạng thái đơn hàng.",

          error: storageError,
        };
      }
    },
    [orders]
  );

  const updateOrderPaymentStatus = useCallback(
    async (orderId, nextPaymentStatus, paymentData = {}) => {
      if (!orderId) {
        return {
          success: false,
          message: "Thiếu mã đơn hàng.",
        };
      }

      const normalizedId = String(orderId).replace(/^#/, "").trim();

      const status = normalizePaymentStatus(nextPaymentStatus);

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

      const currentPayment = normalizePayment(
        currentOrder.payment,
        currentOrder
      );

      const now = new Date().toISOString();

      const nextPayment = {
        ...currentPayment,

        status,

        reference:
          paymentData.reference ||
          currentPayment.reference ||
          currentOrder.paymentReference ||
          "",

        transactionId:
          paymentData.transactionId ||
          currentPayment.transactionId ||
          currentOrder.paymentTransactionId ||
          "",

        transaction:
          paymentData.transaction || currentPayment.transaction || null,

        paidAt:
          status === PAYMENT_STATUS.PAID
            ? paymentData.paidAt || currentPayment.paidAt || now
            : currentPayment.paidAt || null,

        failedAt:
          status === PAYMENT_STATUS.FAILED
            ? paymentData.failedAt || currentPayment.failedAt || now
            : currentPayment.failedAt || null,

        refundedAt:
          status === PAYMENT_STATUS.REFUNDED
            ? paymentData.refundedAt || currentPayment.refundedAt || now
            : currentPayment.refundedAt || null,

        failureReason:
          status === PAYMENT_STATUS.FAILED
            ? String(
                paymentData.failureReason || currentPayment.failureReason || ""
              ).trim()
            : currentPayment.failureReason || "",

        refundAmount:
          status === PAYMENT_STATUS.REFUNDED
            ? Math.max(
                0,
                Number(
                  paymentData.refundAmount ??
                    currentPayment.refundAmount ??
                    currentOrder.grandTotal ??
                    currentOrder.total ??
                    0
                ) || 0
              )
            : Number(currentPayment.refundAmount || 0),

        paymentAttemptedAt:
          paymentData.paymentAttemptedAt ||
          currentPayment.paymentAttemptedAt ||
          null,
      };

      const nextOrders = orders.map((order) => {
        const currentId = String(order?.id || order?.orderId || "").replace(
          /^#/,
          ""
        );

        if (currentId !== normalizedId) {
          return order;
        }

        return {
          ...order,

          payment: nextPayment,

          paymentStatus: status,

          paymentReference: nextPayment.reference,

          paymentTransactionId: nextPayment.transactionId,

          paymentTransaction: nextPayment.transaction,

          paymentPaidAt: nextPayment.paidAt,

          paymentFailedAt: nextPayment.failedAt,

          paymentRefundedAt: nextPayment.refundedAt,

          paymentFailureReason: nextPayment.failureReason,

          paymentAttemptedAt: nextPayment.paymentAttemptedAt,

          refundAmount: nextPayment.refundAmount,

          updatedAt: now,
        };
      });

      try {
        writeOrdersToStorage(nextOrders);

        setOrders(nextOrders);

        notifyOrdersUpdated();

        return {
          success: true,

          status,

          payment: nextPayment,
        };
      } catch (error) {
        return {
          success: false,

          message: "Không thể lưu trạng thái thanh toán.",

          error,
        };
      }
    },
    [orders]
  );

  const removeOrder = useCallback(
    (orderId) => {
      const normalizedId = String(orderId || "").replace(/^#/, "");

      const nextOrders = orders.filter(
        (order) =>
          String(order?.id || order?.orderId || "").replace(/^#/, "") !==
          normalizedId
      );

      try {
        writeOrdersToStorage(nextOrders);

        setOrders(nextOrders);

        notifyOrdersUpdated();
      } catch (error) {
        console.error("Lỗi xóa đơn hàng:", error);
      }
    },
    [orders]
  );

  const value = useMemo(
    () => ({
      orders,

      createOrder,

      getOrderById,

      getPaymentByOrderId,

      getMyOrders,

      canViewOrder,

      updateOrderStatus,

      updateOrderPaymentStatus,

      removeOrder,
    }),
    [
      orders,

      createOrder,

      getOrderById,

      getPaymentByOrderId,

      getMyOrders,

      canViewOrder,

      updateOrderStatus,

      updateOrderPaymentStatus,

      removeOrder,
    ]
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

export default OrderProvider;
