import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import { startSharedDataSync } from "@/services/sharedDataSync";

const MainLayout = () => {
  useEffect(() => {
    const stop = startSharedDataSync();

    return () => {
      stop?.();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
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
