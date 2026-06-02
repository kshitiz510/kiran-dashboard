import { Line } from "react-chartjs-2";

const Card = ({ fieldName, value, icon, sparklineData }) => {
  // Determine color theme based on fieldName
  let themeColor = "rgba(59, 130, 246, 0.8)"; // Default blue
  let themeBg = "rgba(59, 130, 246, 0.05)";
  let iconBg = "bg-blue-50";

  const lowerName = fieldName.toLowerCase();
  if (lowerName.includes("irradiance")) {
    themeColor = "rgba(245, 158, 11, 0.8)"; // Amber
    themeBg = "rgba(245, 158, 11, 0.05)";
    iconBg = "bg-amber-50";
  } else if (lowerName.includes("temperature")) {
    themeColor = "rgba(239, 68, 68, 0.8)"; // Red
    themeBg = "rgba(239, 68, 68, 0.05)";
    iconBg = "bg-red-50";
  } else if (lowerName.includes("voltage")) {
    themeColor = "rgba(16, 185, 129, 0.8)"; // Emerald
    themeBg = "rgba(16, 185, 129, 0.05)";
    iconBg = "bg-emerald-50";
  } else if (lowerName.includes("azimuth")) {
    themeColor = "rgba(139, 92, 246, 0.8)"; // Violet
    themeBg = "rgba(139, 92, 246, 0.05)";
    iconBg = "bg-violet-50";
  } else if (lowerName.includes("zenith")) {
    themeColor = "rgba(14, 165, 233, 0.8)"; // Sky
    themeBg = "rgba(14, 165, 233, 0.05)";
    iconBg = "bg-sky-50";
  }

  const chartData = {
    labels: sparklineData ? sparklineData.map((_, i) => i) : [],
    datasets: [
      {
        data: sparklineData || [],
        borderColor: themeColor,
        backgroundColor: themeBg,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  // Parse numerical part and unit part to avoid cuts and style unit cleanly
  const match = value ? String(value).match(/^([\d.-]+)\s*(.*)$/) : null;
  const number = match ? match[1] : value;
  const unit = match ? match[2] : "";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300 hover:scale-[1.01] flex flex-col justify-between h-32 min-w-0">
      {/* Top Row: Icon and Field Name */}
      <div className="flex items-center space-x-2 min-w-0">
        <div className={`${iconBg} rounded-lg p-1.5 flex items-center justify-center shrink-0`}>
          {icon ? (
            <img src={icon} alt="icon" className="h-4 w-4 object-contain" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16l-4-4m0 0l4-4m-4 4h16M20 12c0 4.418-3.582 8-8 8m0-16c4.418 0 8 3.582 8 8"
              />
            </svg>
          )}
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{fieldName}</p>
      </div>

      {/* Middle Row: Value & Unit */}
      <div className="flex items-baseline mt-2 mb-1 min-w-0">
        <span className="text-xl font-bold text-slate-800 font-mono tracking-tight leading-none">
          {number}
        </span>
        {unit && (
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider ml-1 shrink-0 font-sans leading-none">
            {unit}
          </span>
        )}
      </div>

      {/* Bottom Row: Full-width Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="w-full h-8 mt-auto">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default Card;
