import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import Card from "./Card";
import temperatureIcon from "../assets/temperature.png";
import voltageIcon from "../assets/voltage.png";
import irradianceIcon from "../assets/irradiance.png";
import azimuthIcon from "../assets/azimuth.png";
import zenithIcon from "../assets/zenith.png";
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

// Fetch data for a given channel
const fetchThingSpeakData = async (
  setFeeds,
  setChannelData,
  setIsLoading,
  channelID,
  readAPIKey
) => {
  const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=30`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    setFeeds(data.feeds || []);
    setChannelData(data.channel || {});
    setIsLoading(false);
  } catch (error) {
    console.error("Error fetching data from ThingSpeak:", error);
    setIsLoading(false);
  }
};

const Dashboard = () => {
  const [feeds1, setFeeds1] = useState([]); // Irradiance, Temperature, Voltage
  const [feeds2, setFeeds2] = useState([]); // Azimuth, Zenith
  const [channelData1, setChannelData1] = useState({});
  const [channelData2, setChannelData2] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Set your channel IDs and API keys
  const channelID1 = import.meta.env.VITE_CHANNEL_ID1;
  const channelID2 = import.meta.env.VITE_CHANNEL_ID2;
  const readAPIKey1 = import.meta.env.VITE_READ_API_KEY1;
  const readAPIKey2 = import.meta.env.VITE_READ_API_KEY2;

  useEffect(() => {
    fetchThingSpeakData(
      setFeeds1,
      setChannelData1,
      setIsLoading,
      channelID1,
      readAPIKey1
    );
    fetchThingSpeakData(
      setFeeds2,
      setChannelData2,
      setIsLoading,
      channelID2,
      readAPIKey2
    );

    const intervalId = setInterval(() => {
      fetchThingSpeakData(
        setFeeds1,
        setChannelData1,
        setIsLoading,
        channelID1,
        readAPIKey1
      );
      fetchThingSpeakData(
        setFeeds2,
        setChannelData2,
        setIsLoading,
        channelID2,
        readAPIKey2
      );
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

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
      <div className="grid grid-cols-3 gap-6 mb-6">
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