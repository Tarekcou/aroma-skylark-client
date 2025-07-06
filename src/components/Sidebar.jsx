import React from "react";
import { FaBook, FaUsers, FaCog, FaQuestionCircle } from "react-icons/fa";
import { NavLink } from "react-router";

const Sidebar = () => {
  return (
    <aside className="space-y-6 bg-white p-5 border-r w-64 min-h-screen">
      <h2 className="font-bold text-primary text-2xl">Aroma Skylark</h2>
      <nav className="space-y-2">
        <div className="font-semibold text-gray-500 text-sm">Book Keeping</div>
        <a className="flex items-center space-x-2 font-medium text-blue-600">
          <FaBook />
          <NavLink to={"/dashboard"}>Dashboard</NavLink>
        </a>

        <div className="mt-4 font-semibold text-gray-500 text-sm">Settings</div>
        <a className="flex items-center space-x-2">
          <FaUsers />
          <NavLink to={"/dashboard/members"}>Members</NavLink>
        </a>
        <a className="flex items-center space-x-2">
          <span className="text-green-500">➕</span>
          <NavLink to={"/dashboard/installment"}>Installment</NavLink>
        </a>
        <a className="flex items-center space-x-2">
          <FaCog />
          <span>Business Settings</span>
        </a>

        <div className="mt-4 font-semibold text-gray-500 text-sm">Others</div>
        <a className="flex items-center space-x-2">
          <FaQuestionCircle />
          <span>Help & Support</span>
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
