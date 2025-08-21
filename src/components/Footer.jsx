import React from "react";
import { Link } from "react-router"; // ✅ Fix: use react-router-dom
import logo from "../assets/logo.jpg";

const Footer = () => {
  return (
    <div className="bg-amber-50">
      <footer className="flex justify-around gap-5 mx-auto w-full md:w-11/12 text-base-content footer">
        <div className="flex justify-center items-center gap-4 p-1 h-full">
          <img className="rounded w-5 h-5" src={logo} alt="Symence Logo" />
          <div>
            <h1 className="font-bold text-gray-700 text-2xl">Aroma Skylark</h1>
            
          </div>
        </div>

        
        <nav className="flex flex-col gap-0">
          <h6 className="text-gray-700 footer-title">Company</h6>
          <div className="flex gap-5">
            <Link to="/" className="link link-hover">
              Home
            </Link>
            <Link to="/login" className="link link-hover">
              Login
            </Link>
          </div>
        </nav>

        {/* <nav className="flex flex-col space-y-2">
          <h6 className="text-gray-700 footer-title">Follow Us</h6>
          <div className="flex gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <i className="text-xl fab fa-facebook"></i>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <i className="text-xl fab fa-youtube"></i>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <i className="text-xl fab fa-linkedin"></i>
            </a>
          </div>
        </nav> */}
      </footer>

      <footer className="bg-amber-50 p-2 border-gray-200 border-t text-sm text-center">
        <p className="text-gray-600">
          © {new Date().getFullYear()} Aroma Skylark. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Footer;
