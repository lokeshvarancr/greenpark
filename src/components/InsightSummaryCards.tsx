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
import type { Metrics } from "../types/questions";

interface InsightMetric {
  value: string;
  label: string;
  icon: React.ReactNode;
  tooltip: string;
  gradient: string;
}

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
      className={`relative flex flex-col justify-between items-center bg-gradient-to-br ${gradient} rounded-2xl shadow-md hover:shadow-lg transition-all p-6 min-h-[220px] group cursor-pointer hover:scale-[1.03] ${
        isDistribution ? "ring-2 ring-purple-400/60" : ""
      }`}
      style={{ minWidth: 0, flex: 1, maxWidth: '100%', width: '100%' }}
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
                {value.split("/")[0].replace(/[^0-9]/g, "")}
              </span>
              <span className="text-xs text-gray-600 font-medium">High</span>
            </span>
            <span className="flex flex-col items-center">
              <span className="w-3 h-3 rounded-full bg-yellow-400 mb-1"></span>
              <span className="text-xl font-bold text-yellow-700 leading-none">
                {value.split("/")[1]?.replace(/[^0-9]/g, "")}
              </span>
              <span className="text-xs text-gray-600 font-medium">Medium</span>
            </span>
            <span className="flex flex-col items-center">
              <span className="w-3 h-3 rounded-full bg-red-500 mb-1"></span>
              <span className="text-xl font-bold text-red-700 leading-none">
                {value.split("/")[2]?.replace(/[^0-9]/g, "")}
              </span>
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

// Accepts metrics as prop for dynamic rendering
interface InsightSummaryCardsProps {
  metrics: Metrics;
}

const InsightSummaryCards: React.FC<InsightSummaryCardsProps> = ({ metrics }) => {
  const distribution = metrics.accuracyDistribution;
  return (
    <div className="w-full px-2 md:px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <InsightCard
          value={`${metrics.fullAttemptCoverage}%`}
          label="Full Attempt Coverage"
          icon={<PieChart className="w-7 h-7 text-blue-500" />}
          tooltip="% of questions attempted by all students"
          gradient="from-blue-100 to-blue-300"
        />
        <InsightCard
          value={`${metrics.aggregateAccuracy}%`}
          label="Aggregate Accuracy"
          icon={<BarChart2 className="w-7 h-7 text-green-500" />}
          tooltip="Average accuracy across all questions"
          gradient="from-green-100 to-green-300"
        />
        <InsightCard
          value={`${distribution.find(b => b.band === 'High')?.count ?? 0} High / ${distribution.find(b => b.band === 'Medium')?.count ?? 0} Medium / ${distribution.find(b => b.band === 'Low')?.count ?? 0} Low`}
          label="Accuracy Distribution"
          icon={<TrendingUp className="w-7 h-7 text-purple-500" />}
          tooltip="Number of questions in each accuracy band"
          gradient="from-purple-100 to-purple-300"
        />
        <InsightCard
          value={metrics.engagementConsistency.toString()}
          label="Engagement Consistency"
          icon={<Users className="w-7 h-7 text-yellow-500" />}
          tooltip="Average attempts per question"
          gradient="from-yellow-100 to-yellow-300"
        />
        <InsightCard
          value={metrics.improvementOpportunities.toString()}
          label="Improvement Opportunity"
          icon={<AlertTriangle className="w-7 h-7 text-red-500" />}
          tooltip="Questions below 50% accuracy"
          gradient="from-red-100 to-red-300"
        />
        <InsightCard
          value={metrics.avgIncorrectPerQuestion.toString()}
          label="Avg. Incorrect per Question"
          icon={<ArrowDownCircle className="w-7 h-7 text-pink-500" />}
          tooltip="Average number of incorrect responses per question"
          gradient="from-pink-100 to-pink-300"
        />
      </div>
    </div>
  );
};

export default InsightSummaryCards;
