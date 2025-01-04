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
        200
      );
    } else {
      dropdownTimeoutRef.current = setTimeout(
        () => setIsDropdownOpen(false),
        200
      );
    }
  };

  const isActive = (path) => location.pathname === path;

  const isComparisonRoute = () => location.pathname.startsWith("/comparisons");

  const shouldKeepDropdownOpen = isComparisonRoute();

  return (
    <div className="w-72 fixed h-full bg-white p-6">
      <div className="flex items-center">
        <h2 className="mt-10 mr-8 mb-12 font-bold text-4xl font-inter">
          KIRAN
        </h2>
        <img src={logo} alt="Logo" className="w-20 mr-4 mb-4" />
      </div>
      <hr className="bg-gray-800 h-1 w-full rounded-full border-none my-4"/>
      <ul className="space-y-6 mt-24">
        <li>
          <Link
            to="/"
            className={`flex items-center space-x-3 text-lg transition-colors duration-300 p-2 rounded-md ${
              isActive("/") ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
          >
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
        </li>
        <li
          onMouseEnter={() => toggleDropdown(true)}
          onMouseLeave={() => toggleDropdown(false)}
        >
          <div
            className={`flex items-center justify-between duration-300 ease-in-out text-lg cursor-pointer p-2 rounded-md ${
              shouldKeepDropdownOpen ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center space-x-3">
              <i className="fas fa-cogs"></i>
              <span>Comparisons</span>
            </div>
          </div>
          {isDropdownOpen || shouldKeepDropdownOpen ? (
            <div className="relative mt-2">
              <div className="absolute left-2 top-0 h-full w-1 bg-gray-300"></div>
              <ul
                className={`pl-8 space-y-4 transition-all duration-300 ease-in-out transform ${
                  isDropdownOpen || shouldKeepDropdownOpen
                    ? "opacity-100 max-h-[500px]"
                    : "opacity-0 max-h-0 overflow-hidden"
                }`}
              >
                <li>
                  <Link
                    to="/comparisons/option1"
                    className={`flex items-center space-x-3 text-base transition-colors duration-300 ease-in-out p-2 rounded-md ${
                      isActive("/comparisons/option1")
                        ? "bg-gray-200"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span>Comparison 1</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/comparisons/option2"
                    className={`flex items-center space-x-3 text-base transition-colors duration-300 ease-in-out p-2 rounded-md ${
                      isActive("/comparisons/option2")
                        ? "bg-gray-200"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span>Comparison 2</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/comparisons/option3"
                    className={`flex items-center space-x-3 text-base transition-colors duration-300 ease-in-out p-2 rounded-md ${
                      isActive("/comparisons/option3")
                        ? "bg-gray-200"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span>Comparison 3</span>
                  </Link>
                </li>
              </ul>
            </div>
          ) : null}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
