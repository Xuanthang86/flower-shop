import { createContext, useContext } from "react";

export const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification phải được sử dụng bên trong NotificationProvider."
    );
  }

  return context;
};
