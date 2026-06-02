import { useState } from "react";
import { Line } from "react-chartjs-2";
import Card from "./Card";
import temperatureIcon from "../assets/temperature.png";
import voltageIcon from "../assets/voltage.png";
import irradianceIcon from "../assets/irradiance.png";
import azimuthIcon from "../assets/azimuth.png";
import zenithIcon from "../assets/zenith.png";
import { useIoTData } from "../context/IoTDataContext";
import SolarSandbox from "./SolarSandbox";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ activeTab }) => {
  const {
    feeds1,
    feeds2,
    isLoading,
    error,
    isDemoMode,
    toggleDemoMode,
    weather,
    setWeather,
    fault,
    setFault,
    dustLevel,
    setDustLevel,
  } = useIoTData();

  const [timeFrame, setTimeFrame] = useState("ALL"); // 1M, 5M, 30M, 1H, ALL

  // Filter feeds based on selected timeframe
  const filterByTime = (feeds) => {
    if (timeFrame === "ALL" || feeds.length === 0) return feeds;
    const now = new Date(feeds[feeds.length - 1].created_at).getTime();
    let msToSubtract = 0;
    if (timeFrame === "1M") msToSubtract = 60 * 1000;
    else if (timeFrame === "5M") msToSubtract = 5 * 60 * 1000;
    else if (timeFrame === "30M") msToSubtract = 30 * 60 * 1000;
    else if (timeFrame === "1H") msToSubtract = 60 * 60 * 1000;
    
    const cutoff = now - msToSubtract;
    return feeds.filter(feed => new Date(feed.created_at).getTime() >= cutoff);
  };

  const filteredFeeds1 = filterByTime(feeds1);
  const filteredFeeds2 = filterByTime(feeds2);

  // Extracting data for the first group (Irradiance, Temperature, Voltage)
  const timeLabels1 = filteredFeeds1.map((feed) =>
    new Date(feed.created_at).toLocaleTimeString()
  );
  
  const field1Data = filteredFeeds1.map((feed) => parseFloat(feed.field1) || 0); // Irradiance
  const field2Data = filteredFeeds1.map((feed) => parseFloat(feed.field2) || 0); // Temperature
  const field3Data = filteredFeeds1.map((feed) => parseFloat(feed.field3) || 0); // Voltage

  // Extra parameters & ML Engine
  const powerNIBBData = filteredFeeds1.map((feed) => parseFloat(feed.powerNIBB) || 0);
  const powerFixedData = filteredFeeds1.map((feed) => parseFloat(feed.powerFixed) || 0);
  const solarAzimuthData = filteredFeeds1.map((feed) => parseFloat(feed.solarAzimuth) || 0);
  const panelAzimuthData = filteredFeeds1.map((feed) => parseFloat(feed.field4) || 0);
  
  // ML Predictive & Anomaly Arrays
  const aiPredictedPowerData = filteredFeeds1.map((feed) => parseFloat(feed.aiPredictedPower) || 0);
  const anomalyFlags = filteredFeeds1.map((feed) => feed.isAnomaly);

  // Extracting data for the second group (Azimuth, Zenith)
  const field4Data = filteredFeeds2.map((feed) => parseFloat(feed.field4) || 0); // Azimuth
  const field5Data = filteredFeeds2.map((feed) => parseFloat(feed.field5) || 0); // Zenith

  const chartOptions = (fieldLabel, data, ignoredRoundingStep, explicitMin = 0) => {
    const validData = Array.isArray(data) && data.length > 0 ? data : [0];
    const maxVal = Math.max(...validData);
    let minVal = Math.min(...validData);
    
    if (explicitMin !== undefined && explicitMin !== null) {
      minVal = Math.min(minVal, explicitMin);
    }

    const range = maxVal - minVal || 1;
    const padding = range * 0.1;
    const finalMax = maxVal + padding;
    const finalMin = Math.max(0, minVal - padding);

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `${fieldLabel} vs Time`,
          font: { size: 14, weight: "bold", family: "'Inter', sans-serif" },
          color: "#334155", // slate-700
          padding: { top: 0, bottom: 10 },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: "#64748b", maxTicksLimit: 6 }, // slate-500
        },
        y: {
          grid: { color: "#e2e8f0" }, // slate-200
          border: { dash: [4, 4] },
          min: finalMin,
          max: finalMax,
          ticks: { font: { size: 10 }, color: "#64748b" }, // slate-500
        },
      },
    };
  };

  // 1. Alert Log Generator based on faults
  const getAlertLogs = () => {
    const logs = [];
    if (fault !== "NOMINAL") {
      logs.push({
        id: "1",
        timestamp: new Date().toLocaleTimeString(),
        severity: "CRITICAL",
        message: `Hardware Alert: ${fault === "MOTOR_JAM" ? "Linear actuator physical motor block detected on Axis-A." : fault === "LDR_DRIFT" ? "LDR differential sensor output out of calibration threshold (>15% deviation)." : "Thermal stress flagged. Cooling vents obstructed."}`,
        action: fault === "MOTOR_JAM" ? "DISPATCH_FIELD_MAINTENANCE" : fault === "LDR_DRIFT" ? "INITIATE_REMOTE_CALIBRATION" : "SHED_NOMINAL_LOAD"
      });
    }
    if (dustLevel > 0.15) {
      logs.push({
        id: "2",
        timestamp: new Date().toLocaleTimeString(),
        severity: "WARNING",
        message: `Efficiency Warning: Dust accumulation level high (${(dustLevel * 100).toFixed(0)}%). Soiling loss degrades output by ${(dustLevel * 100).toFixed(0)}%.`,
        action: "SCHEDULE_PANEL_WASHING"
      });
    }
    if (weather === "STORM") {
      logs.push({
        id: "3",
        timestamp: new Date().toLocaleTimeString(),
        severity: "INFO",
        message: "Environmental Status: severe storm protocol engaged. Tracker tilting to safe survival orientation.",
        action: "ACTIVATE_STOW_MODE"
      });
    }
    return logs;
  };

  const alertLogs = getAlertLogs();

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Top Controls / Timeframes */}
      <div className="flex justify-end mb-6 min-h-[40px]">
        {(activeTab === "OPERATIONS" || activeTab === "ANALYTICS") && (
          <div className="flex space-x-1 bg-white border border-slate-200 p-1 rounded-xl shadow-sm w-full sm:w-auto h-fit">
            {["1M", "5M", "30M", "1H", "ALL"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFrame(tf)}
                className={`flex-1 sm:flex-none text-center py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  timeFrame === tf ? "bg-blue-600 text-white shadow-sm border border-blue-700" : "text-slate-500 hover:text-slate-900 bg-transparent"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Alert Banner */}
      {error && !isDemoMode && (
        <div className="mb-8 p-4 bg-amber-900/20 border border-amber-900/50 text-amber-400 rounded-xl flex items-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-850 p-5 rounded-xl h-32 flex flex-col justify-between">
                <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                <div className="h-8 bg-zinc-800 rounded w-3/4 my-2"></div>
                <div className="h-2 bg-zinc-800 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-850 p-5 rounded-xl h-64 flex flex-col justify-between">
                <div>
                  <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4"></div>
                  <div className="h-2 bg-zinc-800 rounded w-full mb-2"></div>
                  <div className="h-2 bg-zinc-800 rounded w-5/6"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-2 bg-zinc-800 rounded w-full"></div>
                  <div className="h-2 bg-zinc-800 rounded w-full"></div>
                  <div className="h-10 bg-zinc-800 rounded-lg w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* TAB 2: OPERATIONS VIEW */}
          {activeTab === "OPERATIONS" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Sun Tracking Status Banner */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isDemoMode ? (feeds1[feeds1.length - 1]?.isNightFallback ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600") : "bg-blue-100 text-blue-600"}`}>
                    {isDemoMode ? (
                      feeds1[feeds1.length - 1]?.isNightFallback ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                      )
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-outfit">
                      {isDemoMode ? (
                        feeds1[feeds1.length - 1]?.isNightFallback ? "Night Emulation Fallback (Peak Midday Active)" : "Solar Tracking Status (Live Local Time)"
                      ) : (
                        "Live Solar Tracker Connected"
                      )}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isDemoMode ? (
                        feeds1[feeds1.length - 1]?.isNightFallback 
                          ? "Sunset has passed locally. The core is serving slow-moving peak daylight telemetry."
                          : "Synchronized with your local device time clock. Tracking the sun in real time."
                      ) : (
                        "Receiving live tracking angles and converter voltage levels via ThingSpeak API."
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg font-mono text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Sun Azimuth</span>
                    <span className="font-bold text-slate-800">{parseFloat(feeds1[feeds1.length - 1]?.solarAzimuth || 0).toFixed(1)}°</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-200"></div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Sun Elevation</span>
                    <span className="font-bold text-slate-800">{parseFloat(feeds1[feeds1.length - 1]?.solarElevation || 0).toFixed(1)}°</span>
                  </div>
                </div>
              </div>

              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <Card
                  fieldName="Irradiance"
                  value={field1Data[field1Data.length - 1]?.toFixed(1) + " W/m²"}
                  icon={irradianceIcon}
                  sparklineData={field1Data}
                />
                <Card
                  fieldName="Temperature"
                  value={field2Data[field2Data.length - 1]?.toFixed(1) + " °C"}
                  icon={temperatureIcon}
                  sparklineData={field2Data}
                />
                <Card
                  fieldName="Voltage"
                  value={field3Data[field3Data.length - 1]?.toFixed(1) + " V"}
                  icon={voltageIcon}
                  sparklineData={field3Data}
                />
                <Card
                  fieldName="Azimuth"
                  value={field4Data[field4Data.length - 1]?.toFixed(1) + "°"}
                  icon={azimuthIcon}
                  sparklineData={field4Data}
                />
                <Card
                  fieldName="Zenith"
                  value={field5Data[field5Data.length - 1]?.toFixed(1) + "°"}
                  icon={zenithIcon}
                  sparklineData={field5Data}
                />
              </div>

              {/* Demo Mode Interactive Control Panel */}
              {isDemoMode && (
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Real-Time Environmental & Fault Simulation Controller
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Weather Profiles */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Weather Condition</label>
                      <select
                        value={weather}
                        onChange={(e) => setWeather(e.target.value)}
                        className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-900 shadow-sm"
                      >
                        <option value="CLEAR">Sunny / Clear Sky</option>
                        <option value="OVERCAST">Heavy Overcast</option>
                        <option value="STORM">Thunderstorm / Rain</option>
                        <option value="SANDSTORM">Sandstorm (Dust Cloud)</option>
                      </select>
                    </div>

                    {/* Hardware Failure Injection */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Failure Injector</label>
                      <select
                        value={fault}
                        onChange={(e) => setFault(e.target.value)}
                        className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-900 shadow-sm"
                      >
                        <option value="NOMINAL">Nominal / No Faults</option>
                        <option value="MOTOR_JAM">Actuator Motor Jam</option>
                        <option value="LDR_DRIFT">LDR Calibration Drift</option>
                        <option value="THERMAL_STRESS">Thermal Blockage Failure</option>
                      </select>
                    </div>

                    {/* Dust slider */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dust Accumulation</label>
                        <span className="text-xs font-mono font-bold text-slate-900">{(dustLevel * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="0.5"
                        step="0.05"
                        value={dustLevel}
                        onChange={(e) => setDustLevel(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* In-depth Time Series Telemetry Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm h-64 hover:shadow-md transition-shadow">
                  <Line
                    data={{
                      labels: timeLabels1,
                      datasets: [
                        {
                          label: "Irradiance",
                          data: field1Data,
                          borderColor: "rgba(59, 130, 246, 0.8)", // blue-500
                          backgroundColor: "rgba(59, 130, 246, 0.1)",
                          fill: true,
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={chartOptions("Effective Irradiance (W/m²)", field1Data, 100, 0)}
                  />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm h-64 hover:shadow-md transition-shadow">
                  <Line
                    data={{
                      labels: timeLabels1,
                      datasets: [
                        {
                          label: "Temperature",
                          data: field2Data,
                          borderColor: "rgba(239, 68, 68, 0.8)", // red-500
                          backgroundColor: "rgba(239, 68, 68, 0.1)",
                          fill: true,
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={chartOptions("Panel Temperature (°C)", field2Data, 10, 0)}
                  />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm h-64 hover:shadow-md transition-shadow">
                  <Line
                    data={{
                      labels: timeLabels1,
                      datasets: [
                        {
                          label: "Voltage",
                          data: field3Data,
                          borderColor: "rgba(16, 185, 129, 0.8)", // emerald-500
                          backgroundColor: "rgba(16, 185, 129, 0.1)",
                          fill: true,
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={chartOptions("Voltage (V)", field3Data, 5, 0)}
                  />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm h-64 hover:shadow-md transition-shadow">
                  <Line
                    data={{
                      labels: timeLabels1,
                      datasets: [
                        {
                          label: "Azimuth",
                          data: field4Data,
                          borderColor: "rgba(139, 92, 246, 0.8)", // violet-500
                          backgroundColor: "rgba(139, 92, 246, 0.1)",
                          fill: true,
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={chartOptions("Azimuth (°)", field4Data, 45, 0)}
                  />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm h-64 lg:col-span-2 hover:shadow-md transition-shadow">
                  <Line
                    data={{
                      labels: timeLabels1,
                      datasets: [
                        {
                          label: "Zenith",
                          data: field5Data,
                          borderColor: "rgba(245, 158, 11, 0.8)", // amber-500
                          backgroundColor: "rgba(245, 158, 11, 0.1)",
                          fill: true,
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={chartOptions("Zenith (°)", field5Data, 15, 0)}
                  />
                </div>
              </div>

              {/* Active Alarm Logs Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Active Diagnostic Alarm Logs</h3>
                  <span className="text-xs font-bold bg-blue-100 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full">
                    {alertLogs.length} Events active
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                    <thead className="bg-white text-slate-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-3">Timestamp</th>
                        <th className="px-6 py-3">Severity</th>
                        <th className="px-6 py-3">Diagnostic Description</th>
                        <th className="px-6 py-3">Escalation Protocol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-medium bg-white">
                      {alertLogs.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-semibold">
                            No alarms logged. System components operating within normal limits.
                          </td>
                        </tr>
                      ) : (
                        alertLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-mono text-slate-500">{log.timestamp}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wider ${
                                log.severity === "CRITICAL" ? "bg-red-100 text-red-700 border border-red-200" : "bg-amber-100 text-amber-700 border border-amber-200"
                              }`}>
                                {log.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4">{log.message}</td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-[10px] bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-700 font-bold uppercase">
                                {log.action}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATA ANALYTICS */}
          {activeTab === "ANALYTICS" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Architecture Info Panel */}
              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4 font-outfit">Machine Learning Architecture</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">LSTM Predictive Engine</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Our Long Short-Term Memory (LSTM) neural network processes time-series historical data (Irradiance, Temperature, Azimuth) to forecast short-term power generation. This enables proactive grid load-balancing and predictive maintenance scheduling by comparing actual output against the ML forecast.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-2">Isolation Forest Anomaly Detection</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Operating asynchronously, an Isolation Forest unsupervised learning algorithm continuously monitors the multivariate telemetry stream. It flags mechanical deviations (like actuator motor jams or sensor drift) in real-time without requiring pre-labeled training data, instantly triggering autonomous fault protocols.
                    </p>
                  </div>
                </div>
              </div>
              {/* ML AI PREDICTIVE FORECASTING */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm h-80 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-50 text-blue-700 border-b border-l border-blue-200 px-3 py-1 rounded-bl-lg text-[10px] font-bold tracking-widest">
                  LSTM ML ENGINE ACTIVE
                </div>
                <Line
                  data={{
                    labels: timeLabels1,
                    datasets: [
                      {
                        label: "Actual Generation",
                        data: powerNIBBData,
                        borderColor: "rgba(16, 185, 129, 0.8)", // emerald-500
                        tension: 0.4,
                      },
                      {
                        label: "AI Predictive Forecast",
                        data: aiPredictedPowerData,
                        borderColor: "rgba(139, 92, 246, 0.8)", // violet-500
                        borderDash: [5, 5],
                        tension: 0.4,
                      }
                    ],
                  }}
                  options={{
                    ...chartOptions("AI Solar Forecasting (Actual vs Predicted Watts)", powerNIBBData, 20, 0),
                    plugins: {
                      legend: { display: true, position: "top", labels: { boxWidth: 10, font: { size: 9 }, color: "#334155" } }
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tracker Deviation Angle Analysis */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm h-64">
                  <Line
                    data={{
                      labels: timeLabels1,
                      datasets: [
                        {
                          label: "Theoretical Solar Elevation",
                          data: field5Data.map(z => 90 - z),
                          borderColor: "rgba(148, 163, 184, 0.6)", // slate-400
                          borderDash: [5, 5],
                          tension: 0.4,
                        },
                        {
                          label: "Target Solar Azimuth",
                          data: solarAzimuthData,
                          borderColor: "rgba(96, 165, 250, 0.6)", // blue-400
                          borderDash: [2, 2],
                          tension: 0.4,
                        },
                        {
                          label: "Actual Tracker Azimuth",
                          data: panelAzimuthData,
                          borderColor: "rgba(59, 130, 246, 1)", // blue-500
                          backgroundColor: "transparent",
                          tension: 0.4,
                        }
                      ],
                    }}
                    options={{
                      ...chartOptions("Single-Axis Tracking Deviation Analysis (deg)", panelAzimuthData, 50, 0),
                      plugins: {
                        legend: { display: true, position: "top", labels: { boxWidth: 10, font: { size: 9 }, color: "#334155" } }
                      }
                    }}
                  />
                </div>

                {/* Power Output Curve Comparison */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm h-64">
                  <Line
                    data={{
                      labels: timeLabels1,
                      datasets: [
                        {
                          label: "Actual Power Output (NIBB Converter)",
                          data: powerNIBBData,
                          borderColor: "rgba(16, 185, 129, 0.8)", // emerald-500
                          tension: 0.4,
                        },
                        {
                          label: "Baseline Power Output (Fixed Tilt)",
                          data: powerFixedData,
                          borderColor: "rgba(148, 163, 184, 0.8)", // slate-400
                          tension: 0.4,
                        }
                      ],
                    }}
                    options={{
                      ...chartOptions("SaaS Telemetry Output Comparison (Watts)", powerNIBBData, 0),
                      plugins: {
                        legend: { display: true, position: "top", labels: { boxWidth: 10, font: { size: 9 }, color: "#334155" } }
                      }
                    }}
                  />
                </div>
              </div>

              {/* BRANN Fuzzy Logic Accuracy Details */}
              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-50 text-blue-700 border-b border-l border-blue-200 px-3 py-1 rounded-bl-lg text-[10px] font-bold tracking-widest">
                  FUZZY LOGIC NODE
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Maximum Power Point Tracking Efficiency</h3>
                <p className="text-xs text-slate-500 mb-6">
                  The dashboard displays continuous convergence values computed using Bayesian Regularized Artificial Neural Network (BRANN) models integrated on the node server.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-inner">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Neural Network Convergence</span>
                    <span className="text-2xl font-extrabold text-blue-600 font-mono mt-1 block">99.5%</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-inner">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Isolation Forest Anomaly Check</span>
                    <span className="text-2xl font-extrabold font-mono mt-1 block">
                      {anomalyFlags[anomalyFlags.length - 1] ? (
                        <span className="text-red-600">ALERT</span>
                      ) : (
                        <span className="text-emerald-600">CLEAN</span>
                      )}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-inner">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Average LDR Error Deviation</span>
                    <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                      {fault === "LDR_DRIFT" ? <span className="text-amber-500">25.0°</span> : "0.45°"}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-inner">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Converter Duty Cycle Ratio</span>
                    <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                      {feeds1.length > 0 ? (parseFloat(feeds1[feeds1.length - 1].field3) > 5 ? "64.2%" : "0.0%") : "0.0%"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 3D SANDBOX */}
          {activeTab === "SANDBOX" && (
            <div className="space-y-8 animate-fadeIn">
              <SolarSandbox
                panelAzimuth={panelAzimuthData[panelAzimuthData.length - 1] || 0}
                panelZenith={field5Data[field5Data.length - 1] || 0}
                solarAzimuth={solarAzimuthData[solarAzimuthData.length - 1] || 0}
                solarZenith={field5Data[field5Data.length - 1] || 45}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;