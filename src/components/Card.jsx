import React from "react";

const Card = ({ fieldName, value, icon }) => {
  return (
    <div className="bg-white shadow-md rounded-xl flex items-center p-4 max-w-xs">
      <div className="bg-[#f0f4fd] rounded-full p-3">
        {icon ? (
          <img src={icon} alt="icon" className="h-6 w-6 text-indigo-600" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16l-4-4m0 0l4-4m-4 4h16M20 12c0 4.418-3.582 8-8 8m0-16c4.418 0 8 3.582 8 8"
            />
          </svg>
        )}
      </div>

      <div className="ml-4">
        <p className="text-sm text-gray-500">{fieldName}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div> 
    </div>
  );
};

export default Card;
