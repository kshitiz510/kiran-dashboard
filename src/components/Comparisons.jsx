import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useParams } from "react-router-dom";
import { useIoTData } from "../context/IoTDataContext";
import { generateHistoricalSeed } from "../utils/telemetrySimulator";
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

const fetchThingSpeakData = async (setFeeds, setChannelData) => {
  const channelID = import.meta.env.VITE_COMPARISONS_CHANNEL_ID || "2782626";
  const readAPIKey = import.meta.env.VITE_COMPARISONS_READ_API_KEY || "SQU9YF8XL91D9G8F";
  const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=30`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    setFeeds(data.feeds || []);
    setChannelData(data.channel || {});
  } catch (error) {
    console.error("Error fetching data from ThingSpeak:", error);
  }
};

const Comparisons = () => {
  const { optionId } = useParams();
  const { isDemoMode, toggleDemoMode } = useIoTData();
  const [feeds, setFeeds] = useState([]);
  const [channelData, setChannelData] = useState({});

  useEffect(() => {
    if (isDemoMode) {
      const mockFeeds = generateHistoricalSeed(30);
      setFeeds(mockFeeds);
      setChannelData({ name: "Solar Core Simulator" });
    } else {
      fetchThingSpeakData(setFeeds, setChannelData);

      const intervalId = setInterval(() => {
        fetchThingSpeakData(setFeeds, setChannelData);
      }, 15000);

      return () => clearInterval(intervalId);
    }
  }, [isDemoMode]);

  const timeLabels = feeds.map((feed) =>
    new Date(feed.created_at).toLocaleTimeString()
  );
  const field1Data = feeds.map((feed) => parseFloat(feed.field1) || 0);
  const field2Data = feeds.map((feed) => parseFloat(feed.field2) || 0);
  const field3Data = feeds.map((feed) => parseFloat(feed.field3) || 0);

  const calculateCumulativeData = (data) => {
    return data.reduce((acc, value, index) => {
      const cumulativeValue = index === 0 ? value : value + acc[index - 1];
      acc.push(cumulativeValue);
      return acc;
    }, []);
  };

  const cumulativeField1Data = calculateCumulativeData(field1Data);
  const cumulativeField2Data = calculateCumulativeData(field2Data);
  const cumulativeField3Data = calculateCumulativeData(field3Data);

  const chartOptions = (fieldLabel, data, roundingStep, min) => {
    const maxValue = Math.max(...data);
    const padding = maxValue * 0.1;

    const roundedMaxValue =
      Math.ceil((maxValue + padding) / roundingStep) * roundingStep;

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
            callback: function (value, index, values) {
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

  const showOption1 = !optionId || optionId === "option1";
  const showOption2 = !optionId || optionId === "option2";
  const showOption3 = !optionId || optionId === "option3";

  const gridClass = optionId ? "grid-cols-1 max-w-4xl mx-auto" : "grid-cols-2";

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Top Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Comparisons {optionId ? `- Comparison ${optionId.replace("option", "")}` : ""}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Telemetry Source: <span className="font-semibold text-gray-700">{isDemoMode ? "Solar Core Simulator" : `ThingSpeak Channel #${import.meta.env.VITE_COMPARISONS_CHANNEL_ID || "2782626"}`}</span>
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

      <div className={`grid gap-6 ${gridClass}`}>
        {/* First Comparison Graph */}
        {showOption1 && (
          <div className="bg-white shadow-md rounded-xl p-3">
            <Line
              data={{
                labels: timeLabels,
                datasets: [
                  {
                    label: "Cumulative Irradiance",
                    data: cumulativeField1Data,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    tension: 0.4,
                  },
                ],
              }}
              options={chartOptions(
                "Cumulative Irradiance",
                cumulativeField1Data,
                100,
                0
              )}
            />
          </div>
        )}

        {/* Second Comparison Graph */}
        {showOption2 && (
          <div className="bg-white shadow-md rounded-xl p-3">
            <Line
              data={{
                labels: timeLabels,
                datasets: [
                  {
                    label: "Cumulative Temperature",
                    data: cumulativeField2Data,
                    borderColor: "rgba(153, 102, 255, 1)",
                    backgroundColor: "rgba(153, 102, 255, 0.2)",
                    tension: 0.4,
                  },
                ],
              }}
              options={chartOptions(
                "Cumulative Temperature",
                cumulativeField2Data,
                10,
                12
              )}
            />
          </div>
        )}

        {/* Third Comparison Graph */}
        {showOption3 && (
          <div className="bg-white shadow-md rounded-xl p-3">
            <Line
              data={{
                labels: timeLabels,
                datasets: [
                  {
                    label: "Cumulative Voltage",
                    data: cumulativeField3Data,
                    borderColor: "rgba(255, 159, 64, 1)",
                    backgroundColor: "rgba(255, 159, 64, 0.2)",
                    tension: 0.4,
                  },
                ],
              }}
              options={chartOptions(
                "Cumulative Voltage",
                cumulativeField3Data,
                100,
                0
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Comparisons;
