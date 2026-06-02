import logo from "../assets/logo.png";
import { useIoTData } from "../context/IoTDataContext";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { isLoading, error, isDemoMode, toggleDemoMode } = useIoTData();

  return (
    <div className="w-72 fixed h-full bg-[#0d0f14] border-r border-white/[0.06] p-6 flex flex-col justify-between z-20 font-sans text-zinc-400">
      <div className="flex flex-col h-full justify-between">
        <div>
          {/* Brand/Logo */}
          <div className="flex items-center space-x-3 mt-3 mb-8 px-1">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 opacity-30 blur-sm"></div>
              <img src={logo} alt="Logo" className="relative w-10 h-10 object-contain drop-shadow-[0_2px_8px_rgba(245,158,11,0.2)]" />
            </div>
            <span className="font-black text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 font-outfit">
              KIRAN
            </span>
          </div>

          {/* Telemetry Control Panel Card */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 mb-6 shadow-xl backdrop-blur-md">
            {/* Telemetry Source Info */}
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1.5">
                Telemetry Source
              </span>
              <div className="flex items-center space-x-2">
                <span className={`h-1.5 w-1.5 rounded-full ${isDemoMode ? "bg-blue-400 animate-pulse" : "bg-emerald-400 animate-pulse"}`} />
                <p className="text-xs font-medium leading-none font-mono">
                  {isDemoMode ? (
                    <span className="text-blue-400/90">Solar Core Sim</span>
                  ) : (
                    <span className="text-emerald-400/90">
                      ThingSpeak #{import.meta.env.VITE_CHANNEL_ID1 || "2782626"}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Ingestion Mode Switch */}
            <div className="pt-3 border-t border-white/[0.06]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">
                Data Ingestion Mode
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200 transition-colors">
                  {isDemoMode ? "Simulated Mode" : "Live IoT Feed"}
                </span>
                <button
                  onClick={toggleDemoMode}
                  className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-all duration-300 ease-in-out focus:outline-none ${
                    isDemoMode ? "bg-gradient-to-r from-blue-600 to-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.4)]" : "bg-zinc-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                      isDemoMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Views */}
          <div className="flex flex-col space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 ml-1 block">
              Views
            </span>
            
            {/* Tab: Operations */}
            <button
              onClick={() => setActiveTab("OPERATIONS")}
              className={`group flex items-center space-x-3 text-left py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 border-l-2 relative overflow-hidden ${
                activeTab === "OPERATIONS"
                  ? "bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-blue-500 text-white shadow-sm"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${activeTab === "OPERATIONS" ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"}`}
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
              <span className="relative z-10">Operations</span>
              {activeTab === "OPERATIONS" && (
                <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-blue-500/30 blur-sm" />
              )}
            </button>

            {/* Tab: Data Analytics */}
            <button
              onClick={() => setActiveTab("ANALYTICS")}
              className={`group flex items-center space-x-3 text-left py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 border-l-2 relative overflow-hidden ${
                activeTab === "ANALYTICS"
                  ? "bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-blue-500 text-white shadow-sm"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${activeTab === "ANALYTICS" ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"}`}
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
              <span className="relative z-10">Data Analytics</span>
              {activeTab === "ANALYTICS" && (
                <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-blue-500/30 blur-sm" />
              )}
            </button>

            {/* Tab: 3D Sandbox */}
            <button
              onClick={() => setActiveTab("SANDBOX")}
              className={`group flex items-center space-x-3 text-left py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 border-l-2 relative overflow-hidden ${
                activeTab === "SANDBOX"
                  ? "bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-blue-500 text-white shadow-sm"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${activeTab === "SANDBOX" ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300"}`}
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
              <span className="relative z-10">3D Sandbox</span>
              {activeTab === "SANDBOX" && (
                <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-blue-500/30 blur-sm" />
              )}
            </button>
          </div>
        </div>

        {/* Telemetry Status Bar */}
        <div className="mt-8 pt-5 border-t border-white/[0.06] flex flex-col space-y-2">
          <div className="flex items-center space-x-2.5">
            {error && !isDemoMode ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-xs text-red-400 font-semibold tracking-wide">Telemetry Offline</span>
              </>
            ) : isLoading ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-xs text-amber-400 font-semibold tracking-wide">Connecting...</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-emerald-400 font-semibold tracking-wide">System Online</span>
              </>
            )}
          </div>
          <p className="text-[10px] text-zinc-600 font-mono tracking-wider">KIRAN IoT Core v1.2.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
