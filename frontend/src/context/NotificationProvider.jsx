// import { useCallback, useEffect, useRef, useState } from "react";

// import { createPortal } from "react-dom";

// import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

// import { NotificationContext } from "./notificationContext.js";

// const NOTIFICATION_DURATION = 2800;

// const notificationConfig = {
//   success: {
//     icon: FiCheckCircle,
//     wrapper: "border-green-100 bg-white text-green-700 shadow-2xl",
//     iconWrapper: "bg-green-50 text-green-600",
//   },

//   error: {
//     icon: FiAlertCircle,
//     wrapper: "border-red-100 bg-white text-red-700 shadow-2xl",
//     iconWrapper: "bg-red-50 text-red-600",
//   },

//   info: {
//     icon: FiInfo,
//     wrapper: "border-blue-100 bg-white text-blue-700 shadow-2xl",
//     iconWrapper: "bg-blue-50 text-blue-600",
//   },
// };

// export const NotificationProvider = ({ children }) => {
//   const [notification, setNotification] = useState(null);

//   const timerRef = useRef(null);

//   const dismissNotification = useCallback(() => {
//     if (timerRef.current) {
//       window.clearTimeout(timerRef.current);
//       timerRef.current = null;
//     }

//     setNotification(null);
//   }, []);

//   const notify = useCallback(
//     ({ message, type = "success", duration = NOTIFICATION_DURATION }) => {
//       if (!message) {
//         return;
//       }

//       if (timerRef.current) {
//         window.clearTimeout(timerRef.current);
//       }

//       const normalizedType = notificationConfig[type] ? type : "success";

//       setNotification({
//         id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
//         message: String(message),
//         type: normalizedType,
//       });

//       timerRef.current = window.setTimeout(() => {
//         setNotification(null);
//         timerRef.current = null;
//       }, duration);
//     },
//     []
//   );

//   const notifySuccess = useCallback(
//     (message, duration = NOTIFICATION_DURATION) => {
//       notify({
//         message,
//         type: "success",
//         duration,
//       });
//     },
//     [notify]
//   );

//   const notifyError = useCallback(
//     (message, duration = 3600) => {
//       notify({
//         message,
//         type: "error",
//         duration,
//       });
//     },
//     [notify]
//   );

//   const notifyInfo = useCallback(
//     (message, duration = NOTIFICATION_DURATION) => {
//       notify({
//         message,
//         type: "info",
//         duration,
//       });
//     },
//     [notify]
//   );

//   useEffect(() => {
//     return () => {
//       if (timerRef.current) {
//         window.clearTimeout(timerRef.current);
//       }
//     };
//   }, []);

//   return (
//     <NotificationContext.Provider
//       value={{
//         notification,
//         notify,
//         notifySuccess,
//         notifyError,
//         notifyInfo,
//         dismissNotification,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const NotificationToast = () => {
//   const { notification, dismissNotification } = ReactUseNotification();

//   if (!notification) {
//     return null;
//   }

//   const config =
//     notificationConfig[notification.type] || notificationConfig.success;

//   const Icon = config.icon;

//   const toast = (
//     <div
//       className="pointer-events-none fixed left-1/2 top-1/2 z-[99999] w-full -translate-x-1/2 -translate-y-1/2 px-4"
//       aria-live="polite"
//       aria-atomic="true"
//     >
//       <div
//         key={notification.id}
//         className={`pointer-events-auto mx-auto flex w-full max-w-md items-center gap-4 rounded-2xl border px-5 py-4 ${config.wrapper}`}
//         role={notification.type === "error" ? "alert" : "status"}
//       >
//         <div
//           className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${config.iconWrapper}`}
//         >
//           <Icon size={23} />
//         </div>

//         <p className="flex-1 text-sm font-semibold leading-6">
//           {notification.message}
//         </p>

//         <button
//           type="button"
//           onClick={dismissNotification}
//           className="shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
//           aria-label="Đóng thông báo"
//         >
//           <FiX size={18} />
//         </button>
//       </div>
//     </div>
//   );

//   return createPortal(toast, document.body);
// };

// const ReactUseNotification = () => {
//   const context = React.useContext(NotificationContext);

//   if (!context) {
//     throw new Error(
//       "NotificationToast phải được sử dụng bên trong NotificationProvider."
//     );
//   }

//   return context;
// };

// export default NotificationProvider;

import { useCallback, useContext, useEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";

import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

import { NotificationContext } from "./NotificationContext.js";

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

      const normalizedType = notificationConfig[type] ? type : "success";

      setNotification({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        message: String(message),
        type: normalizedType,
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

export const NotificationToast = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "NotificationToast phải được sử dụng bên trong NotificationProvider."
    );
  }

  const { notification, dismissNotification } = context;

  if (!notification) {
    return null;
  }

  const config =
    notificationConfig[notification.type] || notificationConfig.success;

  const Icon = config.icon;

  const toast = (
    <div
      className="pointer-events-none fixed left-1/2 top-1/2 z-[99999] w-full -translate-x-1/2 -translate-y-1/2 px-4"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        key={notification.id}
        className={`pointer-events-auto mx-auto flex w-full max-w-md items-center gap-4 rounded-2xl border px-5 py-4 ${config.wrapper}`}
        role={notification.type === "error" ? "alert" : "status"}
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

  return createPortal(toast, document.body);
};

export default NotificationProvider;
