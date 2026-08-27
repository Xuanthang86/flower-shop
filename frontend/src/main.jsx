import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

import AuthProvider from "./context/AuthProvider";
import OrderProvider from "./context/OrderProvider";
import CartProvider from "./context/CartProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OrderProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </OrderProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
