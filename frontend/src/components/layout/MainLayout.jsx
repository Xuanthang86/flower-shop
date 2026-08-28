/*
============================================================
FLOWER SHOP — MAIN LAYOUT
============================================================

CẤU TRÚC HEADER:

AnnouncementBar
      ↓
Header
      ↓
Page Content
      ↓
Footer

AnnouncementBar được đặt ngoài Header để tránh việc
Header tự quản lý nhiều nguồn dữ liệu giao diện.
============================================================
*/

import { Outlet } from "react-router-dom";

import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />

      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
