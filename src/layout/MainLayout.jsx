import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col bg-gray-50 overflow-hidden">
      <Navbar />
      <div className="flex mt-18 min-h-screen">
        {/* Sidebar - show/hide based on screen size */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} /> */}

          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;
