/**
 * Weather profiles modifying nominal atmospheric solar values.
 */
export const WEATHER_MODES = {
  CLEAR: { name: "Sunny / Clear", cloudCover: 0.0, tempModifier: 1.0, lightAbs: 1.0 },
  OVERCAST: { name: "Heavy Overcast", cloudCover: 0.7, tempModifier: 0.85, lightAbs: 0.35 },
  STORM: { name: "Thunderstorm / Rain", cloudCover: 0.9, tempModifier: 0.7, lightAbs: 0.12 },
  SANDSTORM: { name: "Desert Sandstorm (Dust)", cloudCover: 0.5, tempModifier: 1.05, lightAbs: 0.25 }
};

/**
 * Diagnostic hardware fault profiles.
 */
export const DEVICE_FAULTS = {
  NOMINAL: { code: "OK", label: "Nominal Performance" },
  LDR_DRIFT: { code: "E_LDR_DRIFT", label: "LDR Calibration Drift" },
  MOTOR_JAM: { code: "E_MOTOR_JAM", label: "Actuator Motor Jam" },
  THERMAL_STRESS: { code: "E_THERMAL_STRESS", label: "Thermal Dissipation Failure" }
};

/**
 * Generates highly realistic, physically correlated solar array telemetry frames.
 * Correlates solar elevation, tracking angles, dust, temperature, voltage, current,
 * MPPT efficiency, and standard vs NIBB converter performance.
 * 
 * @param {Date} date - The target timestamp for simulation.
 * @param {string} weather - Current active weather mode (default: CLEAR).
 * @param {string} fault - Current hardware fault code (default: NOMINAL).
 * @param {number} dustLevel - Current dust accumulation percentage (0.0 to 1.0).
 * @returns {Object} Physical telemetry data frame.
 */
export const generateSimulatedFrame = (
  date = new Date(),
  weather = "CLEAR",
  fault = "NOMINAL",
  dustLevel = 0.05
) => {
  const weatherProfile = WEATHER_MODES[weather] || WEATHER_MODES.CLEAR;
  const faultProfile = DEVICE_FAULTS[fault] || DEVICE_FAULTS.NOMINAL;

  // Track local time during the day, after sunset fallback to slow peak day emulation
  const realHours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  const isDaytime = realHours >= 6.0 && realHours <= 18.0;

  let hours = realHours;
  let isNightFallback = false;

  if (!isDaytime) {
    isNightFallback = true;
    // Map night hours (18:00 to 06:00) to a slow-moving daylight peak window (11:00 AM to 3:00 PM)
    // Night lasts 12 hours. We map this 12-hour span to a 4-hour peak span.
    const nightProgress = (realHours >= 18) ? (realHours - 18) / 12 : (realHours + 6) / 12;
    hours = 11.0 + nightProgress * 4.0;
  }

  // 1. Astronomic Solar Path Calculation
  // Azimuth path: Sun rises in East (90 deg) at 06:00, crosses South (180 deg) at 12:00, sets in West (270 deg) at 18:00
  const solarAzimuth = 90 + ((hours - 6) / 12) * 180;
  
  // Elevation path (Zenith is 90 - Elevation). Peak elevation at 12:00.
  const baseElevation = Math.max(0, 75 * Math.sin((Math.PI * (hours - 6)) / 12));
  const solarZenith = 90 - baseElevation;

  // Nominal solar irradiance (W/m^2) hitting outer atmosphere
  const baseIrradiance = baseElevation > 0 ? 1000 * Math.sin((Math.PI * (hours - 6)) / 12) : 0;
  // Apply atmospheric cloud absorption
  const nominalSunlight = baseIrradiance * weatherProfile.lightAbs;

  // 2. Tracking Angle Calculation and Cosine Loss
  // A single-axis tracker tracks Azimuth.
  let panelAzimuth = solarAzimuth;
  let panelElevation = 45; // Fixed seasonal tilt

  if (fault === "MOTOR_JAM") {
    // Actuator motor is stuck at morning angle (110 degrees)
    panelAzimuth = 110;
  } else if (fault === "LDR_DRIFT") {
    // LDR sensors have a 25 degree calibration error, drifting away from optimal tracker line
    panelAzimuth = solarAzimuth - 25;
  }

  // Calculate angle of incidence (theta) between panel normal and solar vectors
  const radSolarZenith = (solarZenith * Math.PI) / 180;
  const radSolarAzimuth = (solarAzimuth * Math.PI) / 180;
  const radPanelTilt = ((90 - panelElevation) * Math.PI) / 180;
  const radPanelAzimuth = (panelAzimuth * Math.PI) / 180;

  const cosTheta = Math.max(
    0,
    Math.sin(radSolarZenith) * Math.sin(radPanelTilt) * Math.cos(radSolarAzimuth - radPanelAzimuth) +
      Math.cos(radSolarZenith) * Math.cos(radPanelTilt)
  );

  // Time-based smooth sine wave fluctuation + very tiny random jitter (±0.2% max)
  const timeSec = date.getTime() / 1000;
  const smoothFluctuation = Math.sin(timeSec / 45) * 0.002 + Math.cos(timeSec / 100) * 0.001;
  const irradianceNoise = 1 + smoothFluctuation + (Math.random() * 0.002 - 0.001);
  const actualIrradiance = nominalSunlight * cosTheta * (1 - dustLevel) * irradianceNoise;

  // 3. Thermal Coefficients Modeling
  const baseAmbientTemp = 22 + 8 * Math.sin((Math.PI * (hours - 8)) / 12);
  const thermalAbsorptionFactor = fault === "THERMAL_STRESS" ? 0.055 : 0.035;
  const panelTemp = (baseAmbientTemp * weatherProfile.tempModifier + actualIrradiance * thermalAbsorptionFactor) + (Math.random() * 0.2 - 0.1);

  // 4. Panel Electrical Characteristics (Voc: 22V, Isc: 10A at nominal conditions)
  const thermalVocDerating = 0.004 * (panelTemp - 25);
  const panelVoc = Math.max(0, 22 * (1 - thermalVocDerating));
  const panelIsc = Math.max(0, 10 * (actualIrradiance / 1000));

  // 5. MPPT Algorithm & Fuzzy Logic Tracking (Max Power Point modeling)
  const mppTrackingPrecision = fault === "LDR_DRIFT" ? 0.92 : 0.995;
  // Smooth micro-jitter for charts
  const voltageJitter = 1 + (Math.sin(timeSec / 15) * 0.001) + (Math.random() * 0.001 - 0.0005);
  const currentJitter = 1 + (Math.cos(timeSec / 20) * 0.002) + (Math.random() * 0.001 - 0.0005);
  const voltage = actualIrradiance > 10 ? panelVoc * 0.82 * voltageJitter : 0;
  const current = actualIrradiance > 10 ? panelIsc * 0.88 * mppTrackingPrecision * currentJitter : 0;

  const actualPower = voltage * current;

  // 6. Converter Efficiency Modeling: NIBB vs. Conventional Standard
  const nibbEfficiency = actualPower > 5 ? 0.94 - (panelTemp - 25) * 0.0005 : 0;
  const standardEfficiency = actualPower > 5 ? 0.86 - (panelTemp - 25) * 0.001 : 0;

  const gridPowerNIBB = actualPower * nibbEfficiency;
  const gridPowerStandard = actualPower * standardEfficiency;

  // Calculate cumulative generation estimates
  const generationWhNIBB = gridPowerNIBB * (15 / 3600);
  const generationWhStandard = gridPowerStandard * (15 / 3600);

  // Simulated Fixed-Tilt comparison payload
  const radFixedTilt = (45 * Math.PI) / 180;
  const radFixedAzimuth = (180 * Math.PI) / 180;
  const cosThetaFixed = Math.max(
    0,
    Math.sin(radSolarZenith) * Math.sin(radFixedTilt) * Math.cos(radSolarAzimuth - radFixedAzimuth) +
      Math.cos(radSolarZenith) * Math.cos(radFixedTilt)
  );
  const fixedIrradiance = nominalSunlight * cosThetaFixed * (1 - dustLevel);
  const fixedPanelTemp = baseAmbientTemp * weatherProfile.tempModifier + fixedIrradiance * 0.035;
  const fixedVoc = Math.max(0, 22 * (1 - 0.004 * (fixedPanelTemp - 25)));
  const fixedIsc = Math.max(0, 10 * (fixedIrradiance / 1000));
  const fixedPower = (fixedVoc * 0.82) * (fixedIsc * 0.88 * 0.95);
  const gridPowerFixed = fixedPower * 0.86;

  // 7. ML Complexity Layer Simulation
  const aiPredictedPower = (panelVoc * 0.82) * (panelIsc * 0.88 * 0.995) * 0.94;
  
  // Real-time Anomaly Detection
  let isAnomaly = false;
  let anomalyScore = 0.01;
  if (fault !== "NOMINAL") {
    isAnomaly = Math.random() > 0.4;
    anomalyScore = 0.85 + (Math.random() * 0.14);
  } else if (dustLevel > 0.15) {
    isAnomaly = Math.random() > 0.7;
    anomalyScore = 0.65 + (Math.random() * 0.1);
  } else {
    isAnomaly = Math.random() > 0.98;
    anomalyScore = isAnomaly ? 0.70 + (Math.random() * 0.2) : 0.05 + (Math.random() * 0.1);
  }

  return {
    created_at: date.toISOString(),
    field1: actualIrradiance.toFixed(2),
    field2: panelTemp.toFixed(2),
    field3: voltage.toFixed(2),
    field4: panelAzimuth.toFixed(2),
    field5: solarZenith.toFixed(2),
    current: current.toFixed(2),
    powerNIBB: gridPowerNIBB.toFixed(2),
    powerFixed: gridPowerFixed.toFixed(2),
    aiPredictedPower: aiPredictedPower.toFixed(2),
    isAnomaly,
    anomalyScore: anomalyScore.toFixed(3),
    efficiencyNIBB: (nibbEfficiency * 100).toFixed(1),
    generationWhNIBB,
    generationWhStandard,
    faultCode: faultProfile.code,
    faultLabel: faultProfile.label,
    weatherLabel: weatherProfile.name,
    solarAzimuth: solarAzimuth.toFixed(2),
    solarElevation: baseElevation.toFixed(2),
    isNightFallback
  };
};

/**
 * Generates historical seed data.
 * @param {number} dataPointsCount - Total telemetry nodes.
 * @param {string} weather - Initial weather profile.
 * @param {string} fault - Initial hardware state.
 * @returns {Array} Array of telemetry feed frames.
 */
export const generateHistoricalSeed = (dataPointsCount = 30, weather = "CLEAR", fault = "NOMINAL", dustLevel = 0.05) => {
  const list = [];
  let currentTimestamp = Date.now() - dataPointsCount * 15000;

  for (let i = 0; i < dataPointsCount; i++) {
    list.push(generateSimulatedFrame(new Date(currentTimestamp), weather, fault, dustLevel));
    currentTimestamp += 15000;
  }
  return list;
};
