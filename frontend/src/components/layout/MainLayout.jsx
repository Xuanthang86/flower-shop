import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <Header />

      {/* NỘI DUNG */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default MainLayout;
