import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// An authentic procedural Solar Panel Component with proper mechanical hierarchy
const SolarPanel = ({ azimuth, zenith }) => {
  const rotationYGroup = useRef(); // Azimuth / Yaw (Y rotation)
  const rotationXGroup = useRef(); // Zenith / Pitch (X rotation)

  // Convert azimuth and zenith from degrees to radians for 3D rotation
  const radAzimuth = THREE.MathUtils.degToRad(-azimuth); 
  const radZenith = THREE.MathUtils.degToRad(zenith);
  
  // Smooth mechanical tracking simulation
  useFrame(() => {
    if (rotationYGroup.current) {
      rotationYGroup.current.rotation.y = THREE.MathUtils.lerp(rotationYGroup.current.rotation.y, radAzimuth, 0.05);
    }
    if (rotationXGroup.current) {
      rotationXGroup.current.rotation.x = THREE.MathUtils.lerp(rotationXGroup.current.rotation.x, radZenith, 0.05);
    }
  });

  return (
    <group>
      {/* 1. FIXED MECHANICAL BASE (Does not rotate or tilt) */}
      {/* Ground Anchor Flange Plate */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.06, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Main Structural Pedestal (Heavy steel support column) */}
      <mesh position={[0, -1.0, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 2.0, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* 2. AZIMUTH / YAW AXIS (Rotates horizontally around Y-axis) */}
      <group ref={rotationYGroup} position={[0, 0.0, 0]}>
        {/* Heavy rotating collar cap */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.4, 32]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.25} />
        </mesh>
        
        {/* Dual vertical support arms extending upwards to hold the pivot shaft */}
        <mesh position={[-0.35, 0.35, 0]}>
          <boxGeometry args={[0.08, 0.7, 0.24]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.35, 0.35, 0]}>
          <boxGeometry args={[0.08, 0.7, 0.24]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* 3. TILT / ELEVATION AXIS (Tilts around local X-axis) */}
        {/* Position is centered at the pivot point of the support arms */}
        <group ref={rotationXGroup} position={[0, 0.55, 0]}>
          {/* Main Horizontal Pivot Shaft */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.8, 24]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.15} />
          </mesh>

          {/* Under-panel mounting frame structural beams (X and H layout) */}
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[2.8, 0.1, 0.16]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[-1.1, 0.12, 0]}>
            <boxGeometry args={[0.12, 0.1, 3.8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[1.1, 0.12, 0]}>
            <boxGeometry args={[0.12, 0.1, 3.8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* THE PHOTOCONVERTER ARRAY (Lying flat, facing sky Y-axis) */}
          <group position={[0, 0.2, 0]}>
            {/* Panel Backboard */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[3.2, 0.06, 4.4]} />
              <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.6} />
            </mesh>

            {/* Premium Photovoltaic Glass Surface (highly reflective, dark blue, glass-clearcoat) */}
            <mesh position={[0, 0.04, 0]} castShadow>
              <boxGeometry args={[3.1, 0.02, 4.3]} />
              <meshPhysicalMaterial 
                color="#030712" 
                metalness={0.9} 
                roughness={0.06} 
                clearcoat={1.0}
                clearcoatRoughness={0.04}
              />
            </mesh>

            {/* Aluminum Protective Edge Frames */}
            {/* Left Frame border */}
            <mesh position={[-1.61, 0.02, 0]}>
              <boxGeometry args={[0.03, 0.06, 4.4]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.25} />
            </mesh>
            {/* Right Frame border */}
            <mesh position={[1.61, 0.02, 0]}>
              <boxGeometry args={[0.03, 0.06, 4.4]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.25} />
            </mesh>
            {/* Top Frame border */}
            <mesh position={[0, 0.02, 2.21]}>
              <boxGeometry args={[3.25, 0.06, 0.03]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.25} />
            </mesh>
            {/* Bottom Frame border */}
            <mesh position={[0, 0.02, -2.21]}>
              <boxGeometry args={[3.25, 0.06, 0.03]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.25} />
            </mesh>

            {/* Cell Dividing Grid Lines (Subtle horizontal/vertical cell separators) */}
            {Array.from({ length: 5 }).map((_, idx) => {
              const x = -1.35 + (idx + 1) * (2.7 / 6);
              return (
                <mesh key={`grid-v-${idx}`} position={[x, 0.051, 0]}>
                  <boxGeometry args={[0.008, 0.002, 4.25]} />
                  <meshBasicMaterial color="#334155" transparent opacity={0.65} />
                </mesh>
              );
            })}
            {Array.from({ length: 7 }).map((_, idx) => {
              const z = -1.9 + (idx + 1) * (3.8 / 8);
              return (
                <mesh key={`grid-h-${idx}`} position={[0, 0.051, z]}>
                  <boxGeometry args={[3.05, 0.002, 0.008]} />
                  <meshBasicMaterial color="#334155" transparent opacity={0.65} />
                </mesh>
              );
            })}
          </group>
        </group>
      </group>
    </group>
  );
};

// Procedural Glowing Sun Sphere
const Sun = ({ solarAzimuth, solarZenith }) => {
  const sunRef = useRef();
  
  const radius = 6.5;
  const phi = THREE.MathUtils.degToRad(solarZenith || 45); 
  const theta = THREE.MathUtils.degToRad(-(solarAzimuth || 180) + 90); 
  
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.position.x = THREE.MathUtils.lerp(sunRef.current.position.x, x, 0.02);
      sunRef.current.position.y = THREE.MathUtils.lerp(sunRef.current.position.y, y, 0.02);
      sunRef.current.position.z = THREE.MathUtils.lerp(sunRef.current.position.z, z, 0.02);
    }
  });

  return (
    <mesh position={[0, 6.5, 0]} ref={sunRef}>
      <sphereGeometry args={[0.3, 32, 32]} />
      {/* Basic material with warm amber tone to represent glowing core */}
      <meshBasicMaterial color="#f59e0b" />
      <pointLight color="#fbbf24" intensity={200} distance={50} decay={2.0} castShadow />
    </mesh>
  );
};

const SolarSandbox = ({ panelAzimuth = 0, panelZenith = 0, solarAzimuth = 0, solarZenith = 45, isNightFallback = false }) => {
  const [isManual, setIsManual] = useState(false);
  const [mPanelAzimuth, setMPanelAzimuth] = useState(180);
  const [mPanelZenith, setMPanelZenith] = useState(45);
  const [mSunAzimuth, setMSunAzimuth] = useState(180);
  const [mSunZenith, setMSunZenith] = useState(45);

  const currentPanelAzimuth = isManual ? mPanelAzimuth : panelAzimuth;
  const currentPanelZenith = isManual ? mPanelZenith : panelZenith;
  const currentSunAzimuth = isManual ? mSunAzimuth : solarAzimuth;
  const currentSunZenith = isManual ? mSunZenith : solarZenith;

  const toggleManual = () => {
    if (!isManual) {
      setMPanelAzimuth(panelAzimuth);
      setMPanelZenith(panelZenith);
      setMSunAzimuth(solarAzimuth);
      setMSunZenith(solarZenith);
    }
    setIsManual(!isManual);
  };

  // --- Real-time Solar Physics Modeling ---
  const radPanelAz = (currentPanelAzimuth * Math.PI) / 180;
  const radPanelZen = (currentPanelZenith * Math.PI) / 180;
  const radSunAz = (currentSunAzimuth * Math.PI) / 180;
  const radSunZen = (currentSunZenith * Math.PI) / 180;

  // cosTheta (dot product between normal of panel and solar ray)
  const cosTheta = Math.max(
    0,
    Math.sin(radSunZen) * Math.sin(radPanelZen) * Math.cos(radSunAz - radPanelAz) +
      Math.cos(radSunZen) * Math.cos(radPanelZen)
  );

  const incidenceAngle = (Math.acos(cosTheta) * 180) / Math.PI;
  const alignmentEfficiency = cosTheta * 100;

  // Clear-sky solar irradiance model (1000 W/m2 direct sunlight at noon / zenith = 0)
  const sunElevation = Math.max(0, 90 - currentSunZenith);
  const baseIrradiance = 1000 * Math.sin((sunElevation * Math.PI) / 180);
  const effectiveIrradiance = baseIrradiance * cosTheta;

  // Thermal modeling: panel heats up under direct sunlight (0.035 degC per W/m2)
  const panelTemp = 25 + effectiveIrradiance * 0.035;

  // Voc Open-Circuit Voltage drops with temperature (-0.4% per degC above 25C)
  const Voc = Math.max(0, 22 * (1 - 0.004 * (panelTemp - 25)));
  // Isc Short-Circuit Current is proportional to effective irradiance
  const Isc = Math.max(0, 10 * (effectiveIrradiance / 1000));

  // Operating electrical point under MPPT load (Vmpp ~ 82% Voc, Impp ~ 88% Isc)
  const voltage = Voc * 0.82;
  const current = Isc * 0.88;
  const powerOutput = voltage * current;

  return (
    <div className="w-full h-[650px] bg-slate-100 rounded-xl overflow-hidden shadow-sm relative border border-slate-200 animate-fadeIn">
      {/* HUD Info Panel (Clean Light Frosted Design) */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md p-5 rounded-xl border border-slate-200/80 text-slate-800 shadow-lg pointer-events-none w-80 flex flex-col space-y-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase block mb-1">
            Sandbox Controller
          </span>
          <h3 className="text-md font-extrabold text-slate-900 font-outfit">
            Solar Physics Digital Twin
          </h3>
          {/* Tracking Mode Indicator */}
          <div className="mt-2 flex items-center space-x-1.5 bg-slate-50 border border-slate-100 rounded-lg py-1 px-2.5 w-fit">
            <span className="relative flex h-1.5 w-1.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isManual ? "bg-blue-400" : isNightFallback ? "bg-indigo-400" : "bg-emerald-400"
              }`}></span>
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                isManual ? "bg-blue-600" : isNightFallback ? "bg-indigo-600" : "bg-emerald-600"
              }`}></span>
            </span>
            <span className="text-[9px] font-bold text-slate-600 tracking-wide uppercase font-sans">
              {isManual ? (
                "Manual Override Mode 🛠️"
              ) : isNightFallback ? (
                "Night Emulation Fallback 🌙"
              ) : (
                "Daytime Live Tracking ☀️"
              )}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-200/80 pt-3 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Sun Pos (Az/Zen)</span>
            <span className="text-sm font-bold text-amber-600">
              {currentSunAzimuth.toFixed(0)}° / {currentSunZenith.toFixed(0)}°
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Panel Pos (Az/Zen)</span>
            <span className="text-sm font-bold text-blue-600">
              {currentPanelAzimuth.toFixed(0)}° / {currentPanelZenith.toFixed(0)}°
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Incident Angle</span>
            <span className="text-sm font-bold text-slate-800">
              {incidenceAngle.toFixed(1)}°
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Alignment Rating</span>
            <span className={`text-sm font-bold ${alignmentEfficiency > 85 ? "text-emerald-600" : alignmentEfficiency > 50 ? "text-amber-600" : "text-red-500"}`}>
              {alignmentEfficiency.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="border-t border-slate-200/80 pt-3 flex flex-col space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Effective Irradiance:</span>
            <span className="font-bold font-mono text-slate-800">{effectiveIrradiance.toFixed(0)} W/m²</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Panel Temperature:</span>
            <span className="font-bold font-mono text-slate-800">{panelTemp.toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Operating Voltage:</span>
            <span className="font-bold font-mono text-slate-800">{voltage.toFixed(1)} V</span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-slate-200/50 pt-2">
            <span className="text-slate-700 font-bold">Simulated Power Output:</span>
            <span className="font-extrabold font-mono text-emerald-600 text-lg">
              {powerOutput.toFixed(1)} W
            </span>
          </div>
        </div>
      </div>
      
      {/* Control Panel (Clean Light Frosted Design) */}
      <div className="absolute top-4 right-4 z-10 w-72 bg-white/90 backdrop-blur-md p-5 rounded-xl border border-slate-200/80 text-slate-800 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Manual Override</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Control panel & sun vectors</p>
          </div>
          <button
            onClick={toggleManual}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isManual ? "bg-blue-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isManual ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {isManual ? (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <span>Panel Azimuth (Yaw)</span>
                <span className="text-blue-600 font-mono">{mPanelAzimuth}°</span>
              </div>
              <input type="range" min="0" max="360" value={mPanelAzimuth} onChange={(e) => setMPanelAzimuth(Number(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                <span>Panel Zenith (Tilt)</span>
                <span className="text-blue-600 font-mono">{mPanelZenith}°</span>
              </div>
              <input type="range" min="0" max="90" value={mPanelZenith} onChange={(e) => setMPanelZenith(Number(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>
            <div className="border-t border-slate-200/80 pt-3">
              <div className="flex justify-between text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                <span>Sun Azimuth</span>
                <span className="font-mono">{mSunAzimuth}°</span>
              </div>
              <input type="range" min="0" max="360" value={mSunAzimuth} onChange={(e) => setMSunAzimuth(Number(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                <span>Sun Zenith</span>
                <span className="font-mono">{mSunZenith}°</span>
              </div>
              <input type="range" min="0" max="90" value={mSunZenith} onChange={(e) => setMSunZenith(Number(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-lg font-sans">
            <span className="font-bold text-emerald-600">Auto Tracking Active.</span> The panel is automatically adjusting on its horizontal Cap and vertical Shaft axis. Toggle Manual Override to execute misalignment experiments.
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 text-slate-300 text-xs shadow-lg pointer-events-none">
        <span className="font-bold text-white mr-1">Controls:</span> Left-Click + Drag to rotate view, Scroll to Zoom
      </div>

      <Canvas shadows camera={{ position: [8, 5, 8], fov: 45 }}>
        {/* Soft daylight blue sky background */}
        <color attach="background" args={['#f0f9ff']} />
        
        {/* Soft ambient lighting */}
        <ambientLight intensity={0.65} color="#cbd5e1" />
        
        {/* Hemispherical light (Sky color + Ground color reflection) */}
        <hemisphereLight intensity={0.5} color="#f0f9ff" groundColor="#1e293b" />
        
        {/* Environment map for realistic metals/glass reflections */}
        <Environment preset="city" />
        
        {/* The dynamic sun acting as the main light source */}
        <Sun solarAzimuth={currentSunAzimuth} solarZenith={currentSunZenith} />
        
        {/* The Solar Panel assembly */}
        <SolarPanel azimuth={currentPanelAzimuth} zenith={currentPanelZenith} />
        
        {/* Ground Plane with shadows */}
        <ContactShadows position={[0, -2.02, 0]} opacity={0.6} scale={20} blur={2.5} far={4} />
        <mesh position={[0, -2.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        
        <gridHelper args={[50, 50, "#334155", "#1e293b"]} position={[0, -2.01, 0]} />
        
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.05} minDistance={4} maxDistance={45} />
      </Canvas>
    </div>
  );
};

export default SolarSandbox;
