import { createContext, useContext } from "react";

export const OrderContext = createContext(null);

export const useOrder = () => {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrder phải được sử dụng bên trong OrderProvider");
  }

  return context;
};
