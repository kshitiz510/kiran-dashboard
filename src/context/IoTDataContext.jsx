/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from "react";
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

  // Simulation controls
  const [weather, setWeather] = useState("CLEAR");
  const [fault, setFault] = useState("NOMINAL");
  const [dustLevel, setDustLevel] = useState(0.05); // 5% base dust level

  const [feeds1, setFeeds1] = useState([]);
  const [feeds2, setFeeds2] = useState([]);
  const [channelData1, setChannelData1] = useState({});
  const [channelData2, setChannelData2] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cumulative energy calculation states (in Wh)
  const [cumulativeEnergyNIBB, setCumulativeEnergyNIBB] = useState(0);
  const [cumulativeEnergyStandard, setCumulativeEnergyStandard] = useState(0);
  const [cumulativeEnergyFixed, setCumulativeEnergyFixed] = useState(0);

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

      const f1 = data1.feeds || [];
      const f2 = data2.feeds || [];

      // For live data, compute cumulative energy based on live values.
      // Since live feeds don't have cumulative data fields, we calculate them on-the-fly.
      let energyNIBB = 0;
      let energyStandard = 0;
      let energyFixed = 0;

      f1.forEach((feed) => {
        const irr = parseFloat(feed.field1) || 0;
        const temp = parseFloat(feed.field2) || 0;
        const volt = parseFloat(feed.field3) || 0;
        // Reconstruct approximate electrical current and power calculations
        const isc = 10 * (irr / 1000);
        const curr = isc * 0.88 * 0.995;
        const rawPower = volt * curr;
        
        const effNIBB = rawPower > 5 ? 0.94 - (temp - 25) * 0.0005 : 0;
        const effStandard = rawPower > 5 ? 0.86 - (temp - 25) * 0.001 : 0;
        
        energyNIBB += rawPower * effNIBB * (15 / 3600);
        energyStandard += rawPower * effStandard * (15 / 3600);
        
        // Approximate static fixed tilt baseline for live comparison
        const azimuthDiff = Math.abs(180 - (parseFloat(feed.field4) || 180));
        const thetaFixedFactor = Math.cos((azimuthDiff * Math.PI) / 180);
        const irrFixed = irr * Math.max(0.2, thetaFixedFactor);
        const fixedPower = (volt * 0.9) * (10 * (irrFixed / 1000) * 0.88 * 0.92);
        energyFixed += fixedPower * 0.86 * (15 / 3600);
      });

      setCumulativeEnergyNIBB(energyNIBB);
      setCumulativeEnergyStandard(energyStandard);
      setCumulativeEnergyFixed(energyFixed);

      setFeeds1(f1);
      setFeeds2(f2);
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
    const historicalData = generateHistoricalSeed(30, weather, fault, dustLevel);
    
    // Accumulate total initial simulated energy
    let energyNIBB = 0;
    let energyStandard = 0;
    let energyFixed = 0;

    historicalData.forEach((frame) => {
      energyNIBB += frame.generationWhNIBB;
      energyStandard += frame.generationWhStandard;
      energyFixed += parseFloat(frame.powerFixed) * (15 / 3600);
    });

    setCumulativeEnergyNIBB(energyNIBB);
    setCumulativeEnergyStandard(energyStandard);
    setCumulativeEnergyFixed(energyFixed);

    setFeeds1(historicalData);
    setFeeds2(historicalData);
    setChannelData1({ name: "Solar Core Simulator" });
    setChannelData2({ name: "Solar Position Simulator" });
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
        const nextFrame = generateSimulatedFrame(new Date(), weather, fault, dustLevel);
        
        setCumulativeEnergyNIBB((prev) => prev + nextFrame.generationWhNIBB);
        setCumulativeEnergyStandard((prev) => prev + nextFrame.generationWhStandard);
        setCumulativeEnergyFixed((prev) => prev + parseFloat(nextFrame.powerFixed) * (15 / 3600));

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, weather, fault, dustLevel]);

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
        weather,
        setWeather,
        fault,
        setFault,
        dustLevel,
        setDustLevel,
        cumulativeEnergyNIBB,
        cumulativeEnergyStandard,
        cumulativeEnergyFixed,
        refetch: isDemoMode ? loadSimulatedData : fetchLiveTelemetry,
      }}
    >
      {children}
    </IoTDataContext.Provider>
  );
};
