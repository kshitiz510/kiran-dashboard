import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { generateSimulatedFrame, generateHistoricalSeed } from "../utils/telemetrySimulator";

const IoTDataContext = createContext();

export const useIoTData = () => {
  const context = useContext(IoTDataContext);
  if (!context) {
    throw new Error("useIoTData must be used within an IoTDataProvider");
  }
  return context;
};

export const IoTDataProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const saved = localStorage.getItem("kiran_demo_mode");
    return saved ? JSON.parse(saved) : true; // Default to true for robust presentation out-of-the-box
  });

  const [feeds1, setFeeds1] = useState([]);
  const [feeds2, setFeeds2] = useState([]);
  const [channelData1, setChannelData1] = useState({});
  const [channelData2, setChannelData2] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const pollIntervalRef = useRef(null);

  const channelID1 = import.meta.env.VITE_CHANNEL_ID1 || "2782626";
  const channelID2 = import.meta.env.VITE_CHANNEL_ID2 || "2782626";
  const readAPIKey1 = import.meta.env.VITE_READ_API_KEY1 || "SQU9YF8XL91D9G8F";
  const readAPIKey2 = import.meta.env.VITE_READ_API_KEY2 || "SQU9YF8XL91D9G8F";

  const fetchLiveTelemetry = async () => {
    const url1 = `https://api.thingspeak.com/channels/${channelID1}/feeds.json?api_key=${readAPIKey1}&results=30`;
    const url2 = `https://api.thingspeak.com/channels/${channelID2}/feeds.json?api_key=${readAPIKey2}&results=30`;

    try {
      const [res1, res2] = await Promise.all([fetch(url1), fetch(url2)]);
      
      if (!res1.ok || !res2.ok) {
        throw new Error(`API fetch failed with status: ${res1.status} / ${res2.status}`);
      }

      const data1 = await res1.json();
      const data2 = await res2.json();

      setFeeds1(data1.feeds || []);
      setFeeds2(data2.feeds || []);
      setChannelData1(data1.channel || {});
      setChannelData2(data2.channel || {});
      setError(null);
    } catch (err) {
      console.error("ThingSpeak Telemetry Sync Error:", err);
      setError("Unable to sync live IoT telemetry. Retrying...");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSimulatedData = () => {
    const historicalData = generateHistoricalSeed(30);
    setFeeds1(historicalData);
    setFeeds2(historicalData); // Re-use the same structure for azimuth/zenith mapping
    setChannelData1({ name: "Solar Core Simulator - Node A" });
    setChannelData2({ name: "Solar Position Simulator - Node B" });
    setError(null);
    setIsLoading(false);
  };

  // Run initial loading and interval subscriptions
  useEffect(() => {
    localStorage.setItem("kiran_demo_mode", JSON.stringify(isDemoMode));
    setIsLoading(true);

    if (isDemoMode) {
      loadSimulatedData();
      
      pollIntervalRef.current = setInterval(() => {
        const nextFrame = generateSimulatedFrame(new Date());
        setFeeds1((prev) => [...prev.slice(1), nextFrame]);
        setFeeds2((prev) => [...prev.slice(1), nextFrame]);
      }, 15000);
    } else {
      fetchLiveTelemetry();
      
      pollIntervalRef.current = setInterval(() => {
        fetchLiveTelemetry();
      }, 15000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isDemoMode]);

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  return (
    <IoTDataContext.Provider
      value={{
        feeds1,
        feeds2,
        channelData1,
        channelData2,
        isLoading,
        error,
        isDemoMode,
        toggleDemoMode,
        refetch: isDemoMode ? loadSimulatedData : fetchLiveTelemetry,
      }}
    >
      {children}
    </IoTDataContext.Provider>
  );
};
