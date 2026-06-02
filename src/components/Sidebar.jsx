import React, { useState, useRef } from "react";
import logo from "../assets/logo.png";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);
  const location = useLocation();

  const toggleDropdown = (hoverState) => {
    if (hoverState) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = setTimeout(
        () => setIsDropdownOpen(true),
        150
      );
    } else {
      dropdownTimeoutRef.current = setTimeout(
        () => setIsDropdownOpen(false),
        150
      );
    }
  };

  const isActive = (path) => location.pathname === path;

  const isComparisonRoute = () => location.pathname.startsWith("/comparisons");

  const shouldKeepDropdownOpen = isComparisonRoute();

  return (
    <div className="w-72 fixed h-full bg-white border-r border-gray-150 p-6 flex flex-col justify-between z-20">
      <div>
        <div className="flex items-center space-x-3 mt-4 mb-8">
          <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
          <span className="font-extrabold text-2xl tracking-tight text-gray-900 font-inter">
            KIRAN
          </span>
        </div>
        
        <div className="h-[1px] bg-gray-100 w-full my-6"></div>

        <ul className="space-y-2 mt-8">
          <li>
            <Link
              to="/"
              className={`flex items-center space-x-3 text-sm font-medium transition-all duration-200 p-2.5 rounded-lg ${
                isActive("/") 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>
          </li>
          <li
            onMouseEnter={() => toggleDropdown(true)}
            onMouseLeave={() => toggleDropdown(false)}
          >
            <div
              className={`flex items-center justify-between text-sm font-medium transition-all duration-200 cursor-pointer p-2.5 rounded-lg ${
                shouldKeepDropdownOpen 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
                <span>Comparisons</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen || shouldKeepDropdownOpen ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {(isDropdownOpen || shouldKeepDropdownOpen) && (
              <div className="relative mt-1 ml-4.5 pl-3 border-l border-gray-150">
                <ul className="space-y-1 mt-1">
                  <li>
                    <Link
                      to="/comparisons/option1"
                      className={`block text-xs transition-all duration-200 p-2 rounded-md ${
                        isActive("/comparisons/option1")
                          ? "bg-gray-100 text-gray-900 font-semibold"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span>Comparison 1 (Irradiance)</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/comparisons/option2"
                      className={`block text-xs transition-all duration-200 p-2 rounded-md ${
                        isActive("/comparisons/option2")
                          ? "bg-gray-100 text-gray-900 font-semibold"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span>Comparison 2 (Temperature)</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/comparisons/option3"
                      className={`block text-xs transition-all duration-200 p-2 rounded-md ${
                        isActive("/comparisons/option3")
                          ? "bg-gray-100 text-gray-900 font-semibold"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span>Comparison 3 (Voltage)</span>
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </li>
        </ul>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-gray-500 font-medium">System Telemetry Online</span>
        </div>
        <p className="text-[10px] text-gray-400">KIRAN IoT Core v1.1.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
