import React from "react";
import {
  BarChart2,
  PieChart,
  TrendingUp,
  AlertTriangle,
  Users,
  ArrowDownCircle,
  Info,
} from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";

interface InsightMetric {
  value: string;
  label: string;
  icon: React.ReactNode;
  tooltip: string;
  gradient: string;
}

const metrics: InsightMetric[] = [
  {
    value: "93%",
    label: "Full Attempt Coverage",
    icon: <PieChart className="w-7 h-7 text-blue-500" />,
    tooltip: "% of questions attempted by all students",
    gradient: "from-blue-100 to-blue-300",
  },
  {
    value: "47.2%",
    label: "Aggregate Accuracy",
    icon: <BarChart2 className="w-7 h-7 text-green-500" />,
    tooltip: "Average accuracy across all questions",
    gradient: "from-green-100 to-green-300",
  },
  {
    value: "3 High / 2 Medium / 5 Low",
    label: "Accuracy Distribution",
    icon: <TrendingUp className="w-7 h-7 text-purple-500" />,
    tooltip: "Number of questions in each accuracy band",
    gradient: "from-purple-100 to-purple-300",
  },
  {
    value: "14",
    label: "Engagement Consistency",
    icon: <Users className="w-7 h-7 text-yellow-500" />,
    tooltip: "Average attempts per question",
    gradient: "from-yellow-100 to-yellow-300",
  },
  {
    value: "6",
    label: "Improvement Opportunity",
    icon: <AlertTriangle className="w-7 h-7 text-red-500" />,
    tooltip: "Questions below 50% accuracy",
    gradient: "from-red-100 to-red-300",
  },
  {
    value: "5.4",
    label: "Avg. Incorrect per Question",
    icon: <ArrowDownCircle className="w-7 h-7 text-pink-500" />,
    tooltip: "Average number of incorrect responses per question",
    gradient: "from-pink-100 to-pink-300",
  },
];

const InsightCard: React.FC<InsightMetric> = ({
  value,
  label,
  icon,
  tooltip,
  gradient,
}) => {
  const isDistribution = label === "Accuracy Distribution";
  return (
    <div
      className={`relative flex flex-col justify-between items-center bg-gradient-to-br ${gradient} rounded-2xl shadow-md hover:shadow-lg transition-all p-5 min-h-[200px] group cursor-pointer hover:scale-[1.03] ${
        isDistribution ? "ring-2 ring-purple-400/60" : ""
      }`}
    >
      {/* Tooltip icon at top right */}
      <div className="absolute top-3 right-3 z-20">
        <Tooltip content={tooltip}>
          <Info className="w-4 h-4 text-gray-400 hover:text-purple-500 transition" />
        </Tooltip>
      </div>
      <div className="mb-2">{icon}</div>

      {isDistribution ? (
        <div className="flex flex-col items-center w-full mt-2 mb-2">
          <div className="flex gap-3 justify-center items-end mb-1">
            <span className="flex flex-col items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mb-1"></span>
              <span className="text-xl font-bold text-green-700 leading-none">
                3
              </span>
              <span className="text-xs text-gray-600 font-medium">High</span>
            </span>
            <span className="flex flex-col items-center">
              <span className="w-3 h-3 rounded-full bg-yellow-400 mb-1"></span>
              <span className="text-xl font-bold text-yellow-700 leading-none">
                2
              </span>
              <span className="text-xs text-gray-600 font-medium">Medium</span>
            </span>
            <span className="flex flex-col items-center">
              <span className="w-3 h-3 rounded-full bg-red-500 mb-1"></span>
              <span className="text-xl font-bold text-red-700 leading-none">5</span>
              <span className="text-xs text-gray-600 font-medium">Low</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="text-3xl font-extrabold text-gray-800 drop-shadow-sm mb-1">
          {value}
        </div>
      )}

      <div className="text-sm text-gray-800 text-center font-semibold mt-2 leading-snug">
        {label}
      </div>
    </div>
  );
};

const InsightSummaryCards: React.FC = () => (
  <div className="w-full px-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
      {metrics.map((m, i) => (
        <InsightCard key={i} {...m} />
      ))}
    </div>
  </div>
);

export default InsightSummaryCards;
