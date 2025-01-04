import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
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
  const channelID = "2782626";
  const readAPIKey = "SQU9YF8XL91D9G8F";
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
  const [feeds, setFeeds] = useState([]);
  const [channelData, setChannelData] = useState({});

  useEffect(() => {
    fetchThingSpeakData(setFeeds, setChannelData);

    const intervalId = setInterval(() => {
      fetchThingSpeakData(setFeeds, setChannelData);
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Comparisons</h1>
      <div className="grid grid-cols-2 gap-6">
        {/* First Comparison Graph */}
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

        {/* Second Comparison Graph */}
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

        {/* Third Comparison Graph */}
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
      </div>
    </div>
  );
};

export default Comparisons;
