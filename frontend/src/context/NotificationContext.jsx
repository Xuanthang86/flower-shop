import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

const NotificationContext = createContext(null);

const NOTIFICATION_DURATION = 2800;

const notificationConfig = {
  success: {
    icon: FiCheckCircle,
    wrapper: "border-green-100 bg-white text-green-700 shadow-2xl",
    iconWrapper: "bg-green-50 text-green-600",
  },
  error: {
    icon: FiAlertCircle,
    wrapper: "border-red-100 bg-white text-red-700 shadow-2xl",
    iconWrapper: "bg-red-50 text-red-600",
  },
  info: {
    icon: FiInfo,
    wrapper: "border-blue-100 bg-white text-blue-700 shadow-2xl",
    iconWrapper: "bg-blue-50 text-blue-600",
  },
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const timerRef = useRef(null);

  const dismissNotification = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setNotification(null);
  }, []);

  const notify = useCallback(
    ({ message, type = "success", duration = NOTIFICATION_DURATION }) => {
      if (!message) {
        return;
      }

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      setNotification({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        message: String(message),
        type: notificationConfig[type] ? type : "success",
      });

      timerRef.current = window.setTimeout(() => {
        setNotification(null);
        timerRef.current = null;
      }, duration);
    },
    []
  );

  const notifySuccess = useCallback(
    (message, duration = NOTIFICATION_DURATION) => {
      notify({
        message,
        type: "success",
        duration,
      });
    },
    [notify]
  );

  const notifyError = useCallback(
    (message, duration = 3600) => {
      notify({
        message,
        type: "error",
        duration,
      });
    },
    [notify]
  );

  const notifyInfo = useCallback(
    (message, duration = NOTIFICATION_DURATION) => {
      notify({
        message,
        type: "info",
        duration,
      });
    },
    [notify]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notification,
        notify,
        notifySuccess,
        notifyError,
        notifyInfo,
        dismissNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification phải được sử dụng bên trong NotificationProvider."
    );
  }

  return context;
};

export const NotificationToast = () => {
  const { notification, dismissNotification } = useNotification();

  if (!notification) {
    return null;
  }

  const config =
    notificationConfig[notification.type] || notificationConfig.success;

  const Icon = config.icon;

  return (
    <div className="pointer-events-none fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className={`pointer-events-auto flex w-full max-w-md items-center gap-4 rounded-2xl border px-5 py-4 ${config.wrapper}`}
        role="status"
        aria-live="polite"
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${config.iconWrapper}`}
        >
          <Icon size={23} />
        </div>

        <p className="flex-1 text-sm font-semibold leading-6">
          {notification.message}
        </p>

        <button
          type="button"
          onClick={dismissNotification}
          className="shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Đóng thông báo"
        >
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
};
