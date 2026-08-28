import { Outlet } from "react-router-dom";
import TopHeader from "@/components/layout/TopHeader";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Footer from "@/components/layout/Footer";

const MainLayout = () => (
  <div className="min-h-screen flex flex-col">
    <AnnouncementBar />
    <TopHeader />
    <main className="flex-1"><Outlet /></main>
    <Footer />
  </div>
);

export default MainLayout;
