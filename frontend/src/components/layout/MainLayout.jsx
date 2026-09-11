import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import {
  NotificationProvider,
  NotificationToast,
} from "@/context/NotificationProvider";

import { startSharedDataSync } from "@/services/sharedDataSync";

const MainLayout = () => {
  useEffect(() => {
    const stop = startSharedDataSync();

    return () => {
      stop?.();
    };
  }, []);

  return (
    <NotificationProvider>
      <div className="flex min-h-screen flex-col">
        <AnnouncementBar />

        <Header />

        <main className="flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>

      <NotificationToast />
    </NotificationProvider>
  );
};

export default MainLayout;
