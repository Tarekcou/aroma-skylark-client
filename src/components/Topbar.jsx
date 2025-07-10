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
    <div className="flex justify-between items-center bg-white shadow-sm p-4 border-b">
      <div className="flex items-center space-x-3">
        {/* Hamburger menu for mobile */}
        <button className="lg:hidden btn btn-sm btn-outline" onClick={onToggleSidebar}>
          <FaBars />
        </button>
        <button
          onClick={handleBack}
          className="hidden sm:inline btn-outline text-sm btn btn-sm"
        >
          {!bookName ? "Summary" : "← Back to Dashboard"}
        </button>
      </div>

      <div className="font-semibold text-lg text-center flex-1">
        {bookName || "Dashboard"}
      </div>

      <div className="flex items-center space-x-4">
        <button onClick={handleLogout} className="btn-outline text-red-500 btn btn-sm">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Topbar;
