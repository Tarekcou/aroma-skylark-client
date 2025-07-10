import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import BookList from "../components/CategoryList";
import { Outlet } from "react-router";

const Dashboard = () => {

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div> */}
      dashboard
    </div>
  );
};

export default Dashboard;
