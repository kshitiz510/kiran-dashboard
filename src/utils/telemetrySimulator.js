/**
 * Generates realistic solar tracking telemetry based on time of day.
 * @param {Date} date - The simulated timestamp.
 * @returns {Object} Simulated telemetry frame.
 */
export const generateSimulatedFrame = (date = new Date()) => {
  const hours = date.getHours() + date.getMinutes() / 60;
  
  // Irradiance follows a sine wave peak at midday (13:00) and is zero at night
  const baseIrradiance = Math.max(0, 1000 * Math.sin((Math.PI * (hours - 6)) / 12));
  const noiseIrradiance = (Math.random() - 0.5) * 30;
  const irradiance = baseIrradiance > 0 ? parseFloat((baseIrradiance + noiseIrradiance).toFixed(2)) : 0;

  // Temperature lags behind sunlight peaking at 15:00
  const ambientTemp = 20 + 8 * Math.sin((Math.PI * (hours - 8)) / 12);
  const internalHeating = irradiance * 0.015; // Panel heats up under direct light
  const noiseTemp = (Math.random() - 0.5) * 1.5;
  const temperature = parseFloat((ambientTemp + internalHeating + noiseTemp).toFixed(2));

  // Voltage correlates with sunlight, plateauing under nominal load
  const nominalVoltage = irradiance > 50 ? 18 + Math.log(irradiance) * 0.5 : 0;
  const noiseVoltage = irradiance > 50 ? (Math.random() - 0.5) * 0.4 : 0;
  const voltage = parseFloat((nominalVoltage + noiseVoltage).toFixed(2));

  // Solar position paths (Azimuth 90° East to 270° West)
  const azimuth = parseFloat((90 + (hours / 24) * 180).toFixed(2));
  const zenith = parseFloat((Math.abs(90 - Math.abs(12 - hours) * 7.5)).toFixed(2));

  return {
    created_at: date.toISOString(),
    field1: irradiance.toString(),  // Irradiance
    field2: temperature.toString(), // Temperature
    field3: voltage.toString(),     // Voltage
    field4: azimuth.toString(),     // Azimuth (from Channel 2 source)
    field5: zenith.toString()       // Zenith (from Channel 2 source)
  };
};

/**
 * Generates historical seed data.
 * @param {number} dataPointsCount - Total telemetry nodes.
 * @returns {Array} Array of telemetry feed frames.
 */
export const generateHistoricalSeed = (dataPointsCount = 30) => {
  const list = [];
  let currentTimestamp = Date.now() - dataPointsCount * 15000;

  for (let i = 0; i < dataPointsCount; i++) {
    list.push(generateSimulatedFrame(new Date(currentTimestamp)));
    currentTimestamp += 15000;
  }
  return list;
};
