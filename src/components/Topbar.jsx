import React from "react";
import { useNavigate } from "react-router";
import { useBook } from "../context/BookContext";
import { useAuth } from "../context/AuthContext";

const Topbar = () => {
  const navigate = useNavigate();
   const { bookName, setBookName } = useBook();

const handleBack = () => {
  navigate("/dashboard"); // Go back to BookList
  setBookName(""); // Clear the book name

};
 const { logout } = useAuth();

 const handleLogout = () => {
   logout();
   navigate("/");
 };

  return (
    <div className="flex justify-between items-center bg-white shadow-sm p-4 border-b">
      <button
        onClick={handleBack}
        className="mb-4 btn-outline text-sm btn btn-sm"
      >
        {!bookName ? "All Books" : "← Back to Dashboard"}
      </button>
      <div className="font-semibold text-lg">{bookName || "Dashboard"}</div>
      <div className="flex items-center space-x-4">
        <button onClick={handleLogout} className="btn-outline text-red-500 btn btn-sm">
          Logout
        </button>
        
      </div>
    </div>
  );
};

export default Topbar;
