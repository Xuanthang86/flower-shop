/*
============================================================
FLOWER SHOP — MAIN ENTRY
============================================================

Mục đích:
- Điểm khởi động duy nhất của ứng dụng React.
- Thiết lập BrowserRouter.
- Khởi tạo ThemeProvider.
- Khởi tạo AuthProvider.
- Khởi tạo OrderProvider.
- Khởi tạo CartProvider.

Thứ tự Provider:
BrowserRouter
    ↓
ThemeProvider
    ↓
AuthProvider
    ↓
OrderProvider
    ↓
CartProvider
    ↓
App
============================================================
*/

import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./index.css";
import "./styles/global.css";

import AuthProvider from "./context/AuthProvider";
import OrderProvider from "./context/OrderProvider";
import CartProvider from "./context/CartProvider";
import { ThemeProvider } from "./context/ThemeProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <OrderProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </OrderProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
