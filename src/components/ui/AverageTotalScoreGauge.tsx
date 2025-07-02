import React from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface AverageTotalScoreGaugeProps {
  avgScore: number;
  maxMarks: number;
  className?: string;
}

const AverageTotalScoreGauge: React.FC<AverageTotalScoreGaugeProps> = ({
  avgScore,
  maxMarks,
  className = "",
}) => {
  // Validate and sanitize inputs
  const safeMaxMarks = Math.max(Number(maxMarks), 1);
  const clampedAvgScore = Math.min(Math.max(Number(avgScore), 0), safeMaxMarks);
  const percentage = clampedAvgScore / safeMaxMarks;

  // Prepare data for the radial chart
  const chartData = [
    {
      name: "Max",
      value: 100,
      fill: "#f3f4f6" // light gray background
    },
    {
      name: "Score",
      value: percentage * 100,
      fill: getGradientColor(percentage)
    }
  ];

  // Color gradient for the gauge
  function getGradientColor(pct: number): string {
    if (pct >= 0.8) return "#10B981"; // green
    if (pct >= 0.6) return "#06B6D4"; // cyan
    if (pct >= 0.4) return "#3B82F6"; // blue
    if (pct >= 0.2) return "#F59E0B"; // amber
    return "#EF4444"; // red
  }

  // Performance rating text
  const getRatingText = (pct: number) => {
    if (pct >= 0.8) return "Excellent";
    if (pct >= 0.6) return "Good";
    if (pct >= 0.4) return "Average";
    if (pct >= 0.2) return "Needs Improvement";
    return "Poor";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl p-6 shadow-sm flex flex-col items-center w-full ${className}`}
      role="figure"
      aria-label={`Average score: ${clampedAvgScore} out of ${safeMaxMarks}`}
    >

      <div className="relative w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            barSize={14}
            data={chartData}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              background
              dataKey="value"
              cornerRadius={7}
              animationDuration={1500}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-gray-900">
              {clampedAvgScore.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              out of {safeMaxMarks}
            </div>
            <div
              className="text-sm font-semibold mt-2"
              style={{ color: getGradientColor(percentage) }}
            >
              {Math.round(percentage * 100)}% • {getRatingText(percentage)}
            </div>
          </motion.div>
        </div>
      </div>

      {/* <div className="mt-6 w-full">
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage * 100}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full rounded-full"
            style={{ backgroundColor: getGradientColor(percentage) }}
          />
        </div>
      </div> */}
    </motion.div>
  );
};

export default AverageTotalScoreGauge;