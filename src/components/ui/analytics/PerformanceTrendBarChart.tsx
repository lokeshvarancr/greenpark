import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PerformanceTrendBarChartProps {
  trendData: { month: string; score: number }[];
  maxMarks: number;
  subject?: string;
}

const PerformanceTrendBarChart: React.FC<PerformanceTrendBarChartProps> = ({ trendData, maxMarks, subject }) => {
  const labels = trendData.map((d) => d.month);
  const data = trendData.map((d) => d.score);

  const chartData = {
    labels,
    datasets: [
      {
        label: subject ? `${subject} Score` : "Score",
        data,
        backgroundColor: "#003cff",
        borderRadius: 8,
        maxBarThickness: 36,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#4A4A4A",
        bodyColor: "#4A4A4A",
        borderColor: "#01B7F0",
        borderWidth: 1,
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y} / ${maxMarks}`,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#6B7280",
          font: { size: 12 },
        },
      },
      y: {
        grid: { color: "#F3F4F6" },
        ticks: {
          color: "#6B7280",
          font: { size: 12 },
          stepSize: 20,
          beginAtZero: true,
          max: maxMarks,
        },
      },
    },
    barPercentage: 0.5,
    categoryPercentage: 0.6,
  };

  return (
    <div className="w-full border border-blue-100 rounded-lg p-4 bg-white/90">
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-bold text-blue-900">Performance Trend</span>
        {/* Subject label shown if not grandTest */}
        {subject && subject !== "Grand" && (
          <span className="ml-2 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700">{subject}</span>
        )}
      </div>
      {trendData.length ? (
        <Bar data={chartData} options={options} />
      ) : (
        <p className="text-gray-500">No performance trend data available.</p>
      )}
    </div>
  );
};

export default PerformanceTrendBarChart;
