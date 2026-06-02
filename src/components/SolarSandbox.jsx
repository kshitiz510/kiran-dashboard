import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// A simple procedural Solar Panel Component
const SolarPanel = ({ azimuth, zenith }) => {
  const group = useRef();

  // Convert azimuth and zenith from degrees to radians for 3D rotation
  // Azimuth maps to Y rotation. Zenith maps to X rotation.
  const radAzimuth = THREE.MathUtils.degToRad(-azimuth); 
  // Fix panel facing down: negative zenith rotates the panel upwards towards the sky
  const radZenith = THREE.MathUtils.degToRad(-zenith);
  
  // Smooth interpolation
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, radAzimuth, 0.05);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, radZenith, 0.05);
    }
  });

  return (
    <group ref={group}>
      {/* Base Pole */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 4, 32]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Bracket / Mount */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[0.5, 0.5, 0.4]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Solar Panel Surface */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[4, 6, 0.1]} />
        {/* Front surface (dark blue/glassy) */}
        <meshPhysicalMaterial 
          color="#0f172a" 
          metalness={0.9} 
          roughness={0.1} 
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Panel Frame */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[4.2, 6.2, 0.1]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Grid Lines to simulate photovoltaic cells */}
      <gridHelper args={[4, 8, "#1e293b", "#334155"]} position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
};

const Sun = ({ solarAzimuth, solarZenith }) => {
  const sunRef = useRef();
  
  // Calculate position based on spherical coordinates
  // Adjusted mapping so it matches the panel's coordinate system
  const radius = 10;
  const phi = THREE.MathUtils.degToRad(solarZenith || 45); // Elevation
  const theta = THREE.MathUtils.degToRad(-(solarAzimuth || 180) + 90); 
  
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  // Smooth interpolation for the sun
  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.position.x = THREE.MathUtils.lerp(sunRef.current.position.x, x, 0.02);
      sunRef.current.position.y = THREE.MathUtils.lerp(sunRef.current.position.y, y, 0.02);
      sunRef.current.position.z = THREE.MathUtils.lerp(sunRef.current.position.z, z, 0.02);
    }
  });

  return (
    <mesh position={[0, 10, 0]} ref={sunRef}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial color="#fcd34d" />
      <pointLight color="#fef3c7" intensity={400} distance={100} decay={2} castShadow />
    </mesh>
  );
};

const SolarSandbox = ({ panelAzimuth = 0, panelZenith = 0, solarAzimuth = 0, solarZenith = 45 }) => {
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
    <div className="w-full h-[650px] bg-slate-950 rounded-xl overflow-hidden shadow-2xl relative border border-slate-800 animate-fadeIn">
      {/* HUD Info */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md p-5 rounded-xl border border-white/10 text-white shadow-xl pointer-events-none w-80 flex flex-col space-y-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase block mb-1">
            Sandbox Controller
          </span>
          <h3 className="text-md font-extrabold text-white font-outfit">
            Solar Physics Digital Twin
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-3 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Sun Pos (Az/Zen)</span>
            <span className="text-sm font-bold text-amber-400">
              {currentSunAzimuth.toFixed(0)}° / {currentSunZenith.toFixed(0)}°
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Panel Pos (Az/Zen)</span>
            <span className="text-sm font-bold text-blue-400">
              {currentPanelAzimuth.toFixed(0)}° / {currentPanelZenith.toFixed(0)}°
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Incident Angle</span>
            <span className="text-sm font-bold text-white">
              {incidenceAngle.toFixed(1)}°
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Alignment Efficiency</span>
            <span className={`text-sm font-bold ${alignmentEfficiency > 85 ? "text-emerald-400" : alignmentEfficiency > 50 ? "text-amber-400" : "text-red-400"}`}>
              {alignmentEfficiency.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3 flex flex-col space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Effective Irradiance:</span>
            <span className="font-bold font-mono text-white">{effectiveIrradiance.toFixed(0)} W/m²</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Panel Temperature:</span>
            <span className="font-bold font-mono text-white">{panelTemp.toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Operating Voltage:</span>
            <span className="font-bold font-mono text-white">{voltage.toFixed(1)} V</span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
            <span className="text-slate-300 font-bold">Simulated Power Output:</span>
            <span className="font-extrabold font-mono text-emerald-400 text-lg">
              {powerOutput.toFixed(1)} W
            </span>
          </div>
        </div>
      </div>
      
      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-10 w-72 bg-slate-900/80 backdrop-blur-md p-5 rounded-xl border border-white/10 text-white shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Manual Override</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Toggle to control panel/sun angles</p>
          </div>
          <button
            onClick={toggleManual}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isManual ? "bg-blue-600" : "bg-slate-700"
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
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                <span>Panel Azimuth (Yaw)</span>
                <span className="text-blue-400 font-mono">{mPanelAzimuth}°</span>
              </div>
              <input type="range" min="0" max="360" value={mPanelAzimuth} onChange={(e) => setMPanelAzimuth(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                <span>Panel Zenith (Tilt)</span>
                <span className="text-blue-400 font-mono">{mPanelZenith}°</span>
              </div>
              <input type="range" min="0" max="90" value={mPanelZenith} onChange={(e) => setMPanelZenith(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                <span>Sun Azimuth</span>
                <span className="font-mono">{mSunAzimuth}°</span>
              </div>
              <input type="range" min="0" max="360" value={mSunAzimuth} onChange={(e) => setMSunAzimuth(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                <span>Sun Zenith</span>
                <span className="font-mono">{mSunZenith}°</span>
              </div>
              <input type="range" min="0" max="90" value={mSunZenith} onChange={(e) => setMSunZenith(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-white/5 font-sans">
            <span className="font-bold text-emerald-400">Automatic Solar Tracking Active.</span> The panel is automatically rotating on its single axis to track the simulated sun vector. Toggle Manual Override above to perform calibration tests and scenario analysis.
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 text-slate-300 text-xs shadow-lg pointer-events-none">
        <span className="font-bold text-white mr-1">Controls:</span> Left-Click + Drag to rotate view, Scroll to Zoom
      </div>

      <Canvas shadows camera={{ position: [8, 5, 8], fov: 45 }}>
        <color attach="background" args={['#0f172a']} />
        
        {/* Soft ambient light */}
        <ambientLight intensity={0.5} color="#94a3b8" />
        
        {/* Environment mapping for reflections */}
        <Environment preset="city" />
        
        {/* The dynamic sun acting as the main light source */}
        <Sun solarAzimuth={currentSunAzimuth} solarZenith={currentSunZenith} />
        
        {/* The Solar Panel Group */}
        <SolarPanel azimuth={currentPanelAzimuth} zenith={currentPanelZenith} />
        
        {/* Ground Plane with shadows */}
        <ContactShadows position={[0, -2, 0]} opacity={0.7} scale={20} blur={2.5} far={4} />
        <mesh position={[0, -2.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        
        <gridHelper args={[50, 50, "#334155", "#0f172a"]} position={[0, -1.99, 0]} />
        
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} minDistance={4} maxDistance={30} />
      </Canvas>
    </div>
  );
};

export default SolarSandbox;
