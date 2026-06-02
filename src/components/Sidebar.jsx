import logo from "../assets/logo.png";
import { useIoTData } from "../context/IoTDataContext";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { isLoading, error, isDemoMode, toggleDemoMode } = useIoTData();

  return (
    <div className="w-72 fixed h-full bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col justify-between z-20 font-sans text-zinc-300">
      <div>
        {/* Brand/Logo */}
        <div className="flex items-center space-x-3 mt-4 mb-6">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-extrabold text-2xl tracking-tight text-white font-outfit">
            KIRAN
          </span>
        </div>

        <div className="h-[1px] bg-zinc-800 w-full my-4"></div>

        {/* Telemetry Source Info */}
        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
            Telemetry Source
          </span>
          <p className="text-xs text-zinc-400 leading-relaxed font-mono">
            {isDemoMode ? (
              <span className="text-blue-400 font-semibold">Solar Core Simulation</span>
            ) : (
              <span className="text-emerald-400 font-semibold">
                ThingSpeak #{import.meta.env.VITE_CHANNEL_ID1 || "2782626"}
              </span>
            )}
          </p>
        </div>

        {/* Data Ingestion Mode Switch */}
        <div className="flex flex-col mb-6 bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
            Data Ingestion Mode
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">
              {isDemoMode ? "Simulated Mode" : "Live IoT Feed"}
            </span>
            <button
              onClick={toggleDemoMode}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDemoMode ? "bg-blue-600" : "bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDemoMode ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="h-[1px] bg-zinc-800 w-full my-4"></div>

        {/* Navigation Views */}
        <div className="flex flex-col space-y-2 mt-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 ml-1">
            Views
          </span>
          <button
            onClick={() => setActiveTab("OPERATIONS")}
            className={`flex items-center space-x-3 text-left py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "OPERATIONS"
                ? "bg-blue-600 text-white shadow-md"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
              />
            </svg>
            <span>Operations</span>
          </button>
          <button
            onClick={() => setActiveTab("ANALYTICS")}
            className={`flex items-center space-x-3 text-left py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "ANALYTICS"
                ? "bg-blue-600 text-white shadow-md"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"
              />
            </svg>
            <span>Data Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab("SANDBOX")}
            className={`flex items-center space-x-3 text-left py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "SANDBOX"
                ? "bg-blue-600 text-white shadow-md"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>3D Sandbox</span>
          </button>
        </div>
      </div>

      {/* Telemetry Status Bar */}
      <div className="mt-auto pt-6 border-t border-zinc-800 flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          {error && !isDemoMode ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-xs text-red-500 font-semibold">Telemetry Offline</span>
            </>
          ) : isLoading ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-xs text-amber-500 font-semibold">Connecting...</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-emerald-500 font-semibold">System Online</span>
            </>
          )}
        </div>
        <p className="text-[10px] text-zinc-500 font-mono">KIRAN IoT Core v1.2.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
