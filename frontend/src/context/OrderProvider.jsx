import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { OrderContext } from "./OrderContext";
import { AuthContext } from "./AuthContext";

import {
  createOrder as createOrderApi,
  listOrders,
  getOrder,
  updateOrderStatus as updateOrderStatusApi,
} from "@/services/orderApi";

import { normalizeOrderStatus } from "@/utils/orderStatus";
import { normalizePaymentStatus, PAYMENT_STATUS } from "@/utils/paymentStatus";

const EMPTY_RESULT = {
  success: false,
  message: "",
};

const normalizeAddress = (address = {}) => ({
  provinceCode: String(address?.provinceCode || ""),
  provinceName: String(address?.provinceName || ""),
  wardCode: String(address?.wardCode || ""),
  wardName: String(address?.wardName || ""),
  houseNumber: String(address?.houseNumber || ""),
  street: String(address?.street || ""),
  note: String(address?.note || ""),
});

const normalizeItem = (item = {}) => {
  const productId = String(item?.productId || item?.id || "").trim();

  const productName = String(
    item?.productName || item?.name || "Sản phẩm"
  ).trim();

  const productImage = String(item?.productImage || item?.image || "").trim();

  const unitPrice = Math.max(
    0,
    Number(item?.unitPrice ?? item?.price ?? 0) || 0
  );

  const quantity = Math.max(1, Math.floor(Number(item?.quantity) || 1));

  const subtotal = Math.max(
    0,
    Number(item?.subtotal ?? unitPrice * quantity) || 0
  );

  return {
    ...item,
    id: productId,
    productId,
    productName,
    productImage,
    name: productName,
    image: productImage,
    unitPrice,
    price: unitPrice,
    quantity,
    subtotal,
  };
};

const normalizeOrder = (order = {}) => {
  if (!order) {
    return null;
  }

  const id = String(
    order.id || order._id || order.orderId || order.orderCode || ""
  ).replace(/^#/, "");

  const rawItems = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.products)
      ? order.products
      : [];

  const items = rawItems.map(normalizeItem);

  const subtotal = Math.max(
    0,
    Number(
      order.subtotal ?? items.reduce((total, item) => total + item.subtotal, 0)
    ) || 0
  );

  const discountAmount = Math.max(
    0,
    Number(order.discountAmount ?? order.discount ?? 0) || 0
  );

  const shippingFee = Math.max(
    0,
    Number(order.shippingFee ?? order.shipping ?? 0) || 0
  );

  const grandTotal = Math.max(
    0,
    Number(
      order.grandTotal ??
        order.total ??
        Math.max(0, subtotal - discountAmount + shippingFee)
    ) || 0
  );

  const status = normalizeOrderStatus(
    order.status || order.orderStatus || "pending"
  );

  const paymentStatus = normalizePaymentStatus(
    order.paymentStatus || order.payment?.status || PAYMENT_STATUS.PENDING
  );

  const recipient =
    order.recipientSnapshot || order.customerSnapshot || order.customer || {};

  const address = normalizeAddress(
    recipient.address || order.shippingAddress || order.address || {}
  );

  return {
    ...order,

    id,
    orderId: id,
    _id: order._id || id,

    orderCode: String(order.orderCode || order.code || id),

    items,

    subtotal,
    discountAmount,
    discount: discountAmount,
    shippingFee,
    shipping: shippingFee,
    grandTotal,
    total: grandTotal,

    status,
    orderStatus: status,

    paymentStatus,

    paymentMethod: String(order.paymentMethod || order.payment?.method || ""),

    payment: order.payment || null,

    customerId: order.customerId || order.customerSnapshot?.id || "",

    customerSnapshot: order.customerSnapshot || null,

    recipientSnapshot: order.recipientSnapshot || null,

    shippingAddress: address,
    address,

    createdAt: order.createdAt || new Date().toISOString(),

    updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
  };
};

const normalizeListResponse = (response) => {
  if (!response) {
    return {
      items: [],
      total: 0,
      page: 1,
      limit: 50,
    };
  }

  const items = Array.isArray(response.items)
    ? response.items
    : Array.isArray(response.orders)
      ? response.orders
      : [];

  return {
    ...response,
    items: items.map(normalizeOrder).filter(Boolean),
    total: Number(response.total || items.length),
    page: Number(response.page || 1),
    limit: Number(response.limit || 50),
  };
};

const OrderProvider = ({ children }) => {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("OrderProvider phải được đặt bên trong AuthProvider.");
  }

  const { user } = auth;

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
  });

  const loadOrders = useCallback(
    async (params = {}) => {
      if (!user) {
        setOrders([]);
        setPagination({
          total: 0,
          page: 1,
          limit: 50,
        });
        return {
          success: true,
          items: [],
          total: 0,
        };
      }

      setLoading(true);
      setError("");

      try {
        const response = await listOrders({
          page: params.page || 1,

          limit: params.limit || 50,

          ...(params.status
            ? {
                status: params.status,
              }
            : {}),

          ...(params.search?.trim()
            ? {
                search: params.search.trim(),
              }
            : {}),
        });

        const normalized = normalizeListResponse(response);

        setOrders(normalized.items);

        setPagination({
          total: normalized.total,
          page: normalized.page,
          limit: normalized.limit,
        });

        return {
          success: true,
          ...normalized,
        };
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          requestError?.message ||
          "Không thể tải danh sách đơn hàng.";

        setError(message);

        setOrders([]);

        return {
          success: false,
          message,
          items: [],
          total: 0,
        };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const createOrder = useCallback(
    async (orderData = {}) => {
      if (!user) {
        return {
          ...EMPTY_RESULT,
          message: "Bạn cần đăng nhập trước khi đặt hàng.",
        };
      }

      const items = Array.isArray(orderData.items) ? orderData.items : [];

      if (!items.length) {
        return {
          ...EMPTY_RESULT,
          message: "Đơn hàng không có sản phẩm.",
        };
      }

      setLoading(true);
      setError("");

      try {
        const payload = {
          ...orderData,

          items: items.map(normalizeItem),

          customerId: orderData.customerId || user.id || user._id || "",

          customerName: orderData.customerName || user.name || "",

          customerEmail: orderData.customerEmail || user.email || "",

          phone: orderData.phone || user.phone || "",

          customer: {
            ...(orderData.customer || {}),
            id: orderData.customer?.id || user.id || user._id || "",
            name: orderData.customer?.name || user.name || "",
            email: orderData.customer?.email || user.email || "",
            phone: orderData.customer?.phone || user.phone || "",
          },

          shippingAddress: normalizeAddress(
            orderData.shippingAddress ||
              orderData.customer?.address ||
              orderData.address ||
              {}
          ),
        };

        const response = await createOrderApi(payload);

        const createdOrder = normalizeOrder(
          response?.order || response?.item || response
        );

        if (createdOrder) {
          setOrders((previous) => [
            createdOrder,
            ...previous.filter(
              (item) => String(item.id) !== String(createdOrder.id)
            ),
          ]);
        }

        return {
          success: true,
          order: createdOrder,
          payment: response?.payment || null,
          paymentIntent: response?.paymentIntent || null,
          message: response?.message || "Đặt hàng thành công.",
        };
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          requestError?.message ||
          "Không thể tạo đơn hàng.";

        setError(message);

        return {
          success: false,
          message,
        };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const getOrderById = useCallback(async (id) => {
    if (!id) {
      return {
        success: false,
        message: "Thiếu mã đơn hàng.",
      };
    }

    try {
      const response = await getOrder(id);

      const normalized = normalizeOrder(response);

      if (normalized) {
        setOrders((previous) => {
          const exists = previous.some(
            (item) => String(item.id) === String(normalized.id)
          );

          if (!exists) {
            return [normalized, ...previous];
          }

          return previous.map((item) =>
            String(item.id) === String(normalized.id) ? normalized : item
          );
        });
      }

      return {
        success: true,
        order: normalized,
      };
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Không thể tải đơn hàng.";

      return {
        success: false,
        message,
      };
    }
  }, []);

  const updateOrderStatus = useCallback(async (id, payload = {}) => {
    if (!id) {
      return {
        success: false,
        message: "Thiếu mã đơn hàng.",
      };
    }

    try {
      const response = await updateOrderStatusApi(id, {
        status: normalizeOrderStatus(payload.status),
        ...(payload.paymentStatus
          ? {
              paymentStatus: normalizePaymentStatus(payload.paymentStatus),
            }
          : {}),
      });

      const updatedOrder = normalizeOrder(response);

      if (updatedOrder) {
        setOrders((previous) =>
          previous.map((item) =>
            String(item.id) === String(updatedOrder.id) ? updatedOrder : item
          )
        );
      }

      return {
        success: true,
        order: updatedOrder,
      };
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Không thể cập nhật trạng thái đơn hàng.";

      return {
        success: false,
        message,
      };
    }
  }, []);

  const refreshOrders = useCallback(
    (params = {}) => loadOrders(params),
    [loadOrders]
  );

  const cancelOrder = useCallback(
    async (id) =>
      updateOrderStatus(id, {
        status: "cancelled",
      }),
    [updateOrderStatus]
  );

  const getOrdersByStatus = useCallback(
    (status) =>
      orders.filter(
        (order) =>
          normalizeOrderStatus(order.status) === normalizeOrderStatus(status)
      ),
    [orders]
  );

  const value = useMemo(
    () => ({
      orders,

      loading,

      error,

      pagination,

      createOrder,

      getOrderById,

      updateOrderStatus,

      cancelOrder,

      loadOrders,

      refreshOrders,

      getOrdersByStatus,
    }),
    [
      orders,
      loading,
      error,
      pagination,
      createOrder,
      getOrderById,
      updateOrderStatus,
      cancelOrder,
      loadOrders,
      refreshOrders,
      getOrdersByStatus,
    ]
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

export default OrderProvider;
