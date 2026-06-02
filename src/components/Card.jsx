import React from "react";

const Card = ({ fieldName, value, icon }) => {
  return (
    <div className="bg-white border border-gray-150 rounded-xl flex items-center p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:scale-[1.01]">
      <div className="bg-[#f0f4fd] rounded-lg p-3.5 flex items-center justify-center shrink-0">
        {icon ? (
          <img src={icon} alt="icon" className="h-6 w-6 object-contain" />
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

      <div className="ml-4 overflow-hidden">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{fieldName}</p>
        <p className="text-2xl font-bold text-gray-900 font-mono tracking-tight mt-0.5 whitespace-nowrap overflow-ellipsis">
          {value}
        </p>
      </div> 
    </div>
  );
};

export default Card;
