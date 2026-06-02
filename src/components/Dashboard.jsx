import React from "react";
import { Line } from "react-chartjs-2";
import Card from "./Card";
import temperatureIcon from "../assets/temperature.png";
import voltageIcon from "../assets/voltage.png";
import irradianceIcon from "../assets/irradiance.png";
import azimuthIcon from "../assets/azimuth.png";
import zenithIcon from "../assets/zenith.png";
import { useIoTData } from "../context/IoTDataContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const {
    feeds1,
    feeds2,
    channelData1,
    channelData2,
    isLoading,
    error,
    isDemoMode,
    toggleDemoMode,
  } = useIoTData();

  // Extracting data for the first group (Irradiance, Temperature, Voltage)
  const timeLabels1 = feeds1.map((feed) =>
    new Date(feed.created_at).toLocaleTimeString()
  );
  const timeLabels2 = feeds2.map((feed) =>
    new Date(feed.created_at).toLocaleTimeString()
  );
  const field1Data = feeds1.map((feed) => parseFloat(feed.field1) || 0); // Irradiance
  const field2Data = feeds1.map((feed) => parseFloat(feed.field2) || 0); // Temperature
  const field3Data = feeds1.map((feed) => parseFloat(feed.field3) || 0); // Voltage

  // Extracting data for the second group (Azimuth, Zenith)
  const field4Data = feeds2.map((feed) => parseFloat(feed.field1) || 0); // Azimuth
  const field5Data = feeds2.map((feed) => parseFloat(feed.field2) || 0); // Zenith

  const chartOptions = (fieldLabel, data, roundingStep, min) => {
    const maxValue = Math.max(...data);
    const padding = maxValue * 0.1;

    const roundedMaxValue =
      maxValue > 0
        ? Math.ceil((maxValue + padding) / roundingStep) * roundingStep
        : roundingStep;

    return {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: `${fieldLabel} vs Time`,
          font: {
            size: 18,
            weight: "bold",
          },
          padding: { top: 0, bottom: 15 },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Time",
          },
          ticks: {
            autoSkip: false,
            maxTicksLimit: 20,
            callback: function (value, index) {
              if (index % 2 === 0) {
                return value;
              }
              return "";
            },
          },
        },
        y: {
          title: {
            display: true,
            text: fieldLabel,
          },
          min: min,
          suggestedMax: roundedMaxValue,
        },
      },
    };
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Dashboard Top Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">KIRAN Solar Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">
            Telemetry Source: <span className="font-semibold text-gray-700">{isDemoMode ? (channelData1.name || "Solar Core Simulator") : `ThingSpeak Channels #${import.meta.env.VITE_CHANNEL_ID1 || "2782626"} & #${import.meta.env.VITE_CHANNEL_ID2 || "2782626"}`}</span>
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {/* Demo Mode Toggle Switch */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-3">
              {isDemoMode ? "Simulated Telemetry" : "Live IoT Feed"}
            </span>
            <button
              onClick={toggleDemoMode}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDemoMode ? "bg-[#3b82f6]" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDemoMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center shadow-sm">
          <i className="fas fa-exclamation-triangle mr-3 text-amber-600"></i>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card
          fieldName="Irradiance"
          value={field1Data[field1Data.length - 1]?.toFixed(2) + " W/m²"}
          icon={irradianceIcon}
        />
        <Card
          fieldName="Temperature"
          value={field2Data[field2Data.length - 1]?.toFixed(2) + " °C"}
          icon={temperatureIcon}
        />
        <Card
          fieldName="Voltage"
          value={field3Data[field3Data.length - 1]?.toFixed(2) + " V"}
          icon={voltageIcon}
        />
        <Card
          fieldName="Azimuth"
          value={field4Data[field4Data.length - 1]?.toFixed(2) + "°"}
          icon={azimuthIcon}
        />
        <Card
          fieldName="Zenith"
          value={field5Data[field5Data.length - 1]?.toFixed(2) + "°"}
          icon={zenithIcon}
        />
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500">Loading data...</p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Render only if feeds1 has data */}
          {feeds1.length > 0 && (
            <>
              <div className="bg-white shadow-md rounded-xl p-3">
                <Line
                  data={{
                    labels: timeLabels1,
                    datasets: [
                      {
                        label: "Irradiance",
                        data: field1Data,
                        borderColor: "rgba(75, 192, 192, 1)",
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={chartOptions("Irradiance", field1Data, 100, 0)}
                />
              </div>
              <div className="bg-white shadow-md rounded-xl p-3">
                <Line
                  data={{
                    labels: timeLabels1,
                    datasets: [
                      {
                        label: "Temperature",
                        data: field2Data,
                        borderColor: "rgba(153, 102, 255, 1)",
                        backgroundColor: "rgba(153, 102, 255, 0.2)",
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={chartOptions("Temperature", field2Data, 10, 0)}
                />
              </div>
              <div className="bg-white shadow-md rounded-xl p-3">
                <Line
                  data={{
                    labels: timeLabels1,
                    datasets: [
                      {
                        label: "Voltage",
                        data: field3Data,
                        borderColor: "rgba(255, 159, 64, 1)",
                        backgroundColor: "rgba(255, 159, 64, 0.2)",
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={chartOptions("Voltage", field3Data, 100, 0)}
                />
              </div>
            </>
          )}

          {/* Render only if feeds2 has data */}
          {feeds2.length > 0 && (
            <>
              <div className="bg-white shadow-md rounded-xl p-3">
                <Line
                  data={{
                    labels: timeLabels2,
                    datasets: [
                      {
                        label: "Azimuth",
                        data: field4Data,
                        borderColor: "rgba(255, 99, 132, 1)",
                        backgroundColor: "rgba(255, 99, 132, 0.2)",
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={chartOptions("Azimuth", field4Data, 10)}
                />
              </div>
              <div className="bg-white shadow-md rounded-xl p-3">
                <Line
                  data={{
                    labels: timeLabels2,
                    datasets: [
                      {
                        label: "Zenith",
                        data: field5Data,
                        borderColor: "rgba(54, 162, 235, 1)",
                        backgroundColor: "rgba(54, 162, 235, 0.2)",
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={chartOptions("Zenith", field5Data, 10)}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;