import React from "react";
import { Link } from "react-router"; // ✅ Fix: use react-router-dom
import logo from "../assets/logo.jpg";

const Footer = () => {
  return (
    <div className="bg-amber-50">
     

      <footer className="bg-amber-50 p-2 border-gray-200 text-sm text-center">
        <p className="text-gray-600">
          © {new Date().getFullYear()} Aroma Skylark. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Footer;
