import { Line } from "react-chartjs-2";

const Card = ({ fieldName, value, icon, sparklineData }) => {
  const chartData = {
    labels: sparklineData ? sparklineData.map((_, i) => i) : [],
    datasets: [
      {
        data: sparklineData || [],
        borderColor: "rgba(59, 130, 246, 0.8)", // Blue-500
        backgroundColor: "rgba(59, 130, 246, 0.1)",
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
  return (
    <div className="bg-white border border-slate-200 rounded-xl flex items-center p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300 hover:scale-[1.01]">
      <div className="bg-[#f0f4fd] rounded-lg p-3.5 flex items-center justify-center shrink-0">
        {icon ? (
          <img src={icon} alt="icon" className="h-6 w-6 object-contain" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-400"
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

      <div className="ml-4 overflow-hidden flex-grow">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{fieldName}</p>
        <div className="flex items-end justify-between mt-0.5">
          <p className="text-2xl font-bold text-slate-900 font-mono tracking-tight whitespace-nowrap overflow-ellipsis">
            {value}
          </p>
          {sparklineData && sparklineData.length > 0 && (
            <div className="w-20 h-8 ml-2">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div> 
    </div>
  );
};

export default Card;
