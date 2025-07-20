import React from "react";
import { useNavigate } from "react-router";
import { useBook } from "../context/BookContext";
import { useAuth } from "../context/AuthContext";
import { FaBars } from "react-icons/fa";

const Topbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { bookName, setBookName } = useBook();
  const { logout } = useAuth();

  const handleBack = () => {
    navigate("/dashboard");
    setBookName("");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center bg-white shadow-sm px-4">
      <div className="flex items-center space-x-3">
        {/* Hamburger menu for mobile */}
        <button className="lg:hidden btn-outline btn btn-sm" onClick={onToggleSidebar}>
          <FaBars />
        </button>
        {/* <button
          onClick={handleBack}
          className="hidden sm:inline btn-outline text-sm btn btn-sm"
        >
          {!bookName ? "Summary" : "← Back to Dashboard"}
        </button> */}
      </div>

      {/* <div className="flex-1 font-semibold text-lg text-center">
        {bookName || "Dashboard"}
      </div> */}

      {/* <div className="flex items-center space-x-4">
        <button onClick={handleLogout} className="btn-outline text-red-500 btn btn-sm">
          Logout
        </button>
      </div> */}
    </div>
  );
};

export default Topbar;
