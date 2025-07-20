import React from "react";
import { FaBook, FaUsers, FaCog, FaQuestionCircle, FaTimes, FaPlus } from "react-icons/fa";
import { NavLink } from "react-router";
import { TbTransactionDollar } from "react-icons/tb";
import { BiCategory } from "react-icons/bi";

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <div className="">
      {/* Overlay for small screens */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden transition-opacity  ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed z-40 top-0 left-0 h-full min-h-full  bg-white w-64 p-5  shadow transform transition-transform duration-300 ease-in-out pt-20 lg:pt-10
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:block`}
      >
        {/* Close Button for Mobile */}
        <div className="lg:hidden flex justify-end items-center mb-4">
          {/* <h2 className="font-bold text-primary text-xl">Aroma Skylark</h2> */}
          <button onClick={onClose}>
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        {/* <h2 className="hidden lg:block mb-4 font-bold text-primary text-2xl">Aroma Skylark</h2> */}

        <nav className="space-y-4">
          {/* <div className="font-semibold text-gray-500 text-sm">Book Keeping</div> */}
          <NavLink to="/dashboard" end className="flex items-center space-x-2 font-medium">
            <FaBook />
            <h1 >Dashboard</h1>
          </NavLink>

          <div className="mt-4 font-semibold text-gray-500 text-sm">Transaction</div>
          <NavLink to="/dashboard/transactions" className="flex items-center space-x-2">
            <TbTransactionDollar />

            <h1 >All Transactions</h1>
          </NavLink>
          <NavLink to="/dashboard/categories" className="flex items-center space-x-2">
            <BiCategory />

            <h1 >Categories</h1>
          </NavLink>
          <NavLink to="/dashboard/products" className="flex items-center space-x-2">
            <BiCategory />

            <h1 >Products</h1>
          </NavLink>
          <NavLink to="/dashboard/members" className="flex items-center space-x-2">
            <FaUsers />
            <h1 >Members</h1>
          </NavLink>
          <NavLink to="/dashboard/installment" className="flex items-center space-x-2">
            <span className="text-green-500"><FaPlus /></span>
            <h1 >Installment</h1>
          </NavLink>
          {/* <NavLink to={"/settings"} className="flex items-center space-x-2">
            <FaCog />
            <span> Settings</span>
          </NavLink> */}

          {/* <div className="mt-4 font-semibold text-gray-500 text-sm">Others</div>
          <div className="flex items-center space-x-2">
            <FaQuestionCircle />
            <span>Help & Support</span>
          </div> */}
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
