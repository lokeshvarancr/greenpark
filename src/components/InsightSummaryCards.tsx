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

// Use a single blue color for all icons
const ICON_CLASS = "w-9 h-9 text-blue-600";

const ICON_MAPPING: Record<string, React.ReactNode> = {
  PieChart: <PieChart className={ICON_CLASS} />,
  BarChart2: <BarChart2 className={ICON_CLASS} />,
  TrendingUp: <TrendingUp className={ICON_CLASS} />,
  Users: <Users className={ICON_CLASS} />,
  AlertTriangle: <AlertTriangle className={ICON_CLASS} />,
  ArrowDownCircle: <ArrowDownCircle className={ICON_CLASS} />,
  Default: <Info className={ICON_CLASS} />,
};

function formatStatValue(value: any) {
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "string") return value;
  return value ?? "-";
}

/**
 * SummaryCards Component
 *
 * Displays a collection of summary statistic cards. Each card shows an icon,
 * a title, and a formatted value. The layout adapts to different screen sizes
 * (vertical on small screens, horizontal on larger screens).
 */
const InsightSummaryCards = ({
  fullAttemptCoverage = 92,
  aggregateAccuracy = 78,
  accuracyDistribution = { High: 12, Medium: 8, Low: 5 },
  engagementConsistency = 3.2,
  improvementOpportunities = 4,
  avgIncorrectPerQuestion = 1.7,
}) => {
  // Cards config (static order, only value changes)
  const cards = [
    {
      icon: "PieChart",
      title: "Full Attempt Coverage",
      value: `${fullAttemptCoverage}%`,
    },
    {
      icon: "BarChart2",
      title: "Aggregate Accuracy",
      value: `${aggregateAccuracy}%`,
    },
    {
      icon: "TrendingUp",
      title: "Accuracy Distribution",
      value: `${accuracyDistribution.High} High / ${accuracyDistribution.Medium} Medium / ${accuracyDistribution.Low} Low`,
    },
    {
      icon: "Users",
      title: "Engagement Consistency",
      value: engagementConsistency,
    },
    {
      icon: "AlertTriangle",
      title: "Improvement Opportunity",
      value: improvementOpportunities,
    },
    {
      icon: "ArrowDownCircle",
      title: "Avg. Incorrect per Question",
      value: avgIncorrectPerQuestion,
    },
  ];

  return (
    <div
      className="w-full flex flex-col shadow-lg rounded-2xl overflow-hidden"
      style={{ marginTop: 16 }}
    >
      {/* First row */}
      <div className="flex flex-row w-full">
        {cards.slice(0, 3).map((card, idx) => (
          <div
            key={card.title}
            className={`flex flex-1 items-center py-6 px-8 min-w-0 bg-white ${
              idx === 0
                ? "rounded-l-2xl"
                : "border-l border-[#E9E9E9]"
            } ${idx === 2 ? "rounded-r-none" : ""}`}
          >
            <div className="flex flex-col min-w-0">
              <span className="text-base font-semibold text-gray-900 truncate">
                {card.title}
              </span>
              {/* Reduce text size for Accuracy Distribution value */}
              <span
                className={`mt-1 truncate font-extrabold text-gray-900 ${card.title === "Accuracy Distribution" ? "text-lg" : "text-2xl"}`}
              >
                {formatStatValue(card.value)}
              </span>
            </div>
            <div className="flex items-center justify-center ml-auto">
              <span className="inline-flex items-center justify-center rounded-full border border-blue-400 bg-white w-16 h-16">
                {ICON_MAPPING[card.icon]}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Second row */}
      <div className="flex flex-row w-full border-t border-[#E9E9E9]">
        {cards.slice(3, 6).map((card, idx) => (
          <div
            key={card.title}
            className={`flex flex-1 items-center py-6 px-8 min-w-0 bg-white ${
              idx === 0
                ? "rounded-bl-2xl"
                : "border-l border-[#E9E9E9]"
            } ${idx === 2 ? "rounded-br-2xl" : ""}`}
          >
            <div className="flex flex-col min-w-0">
              <span className="text-base font-semibold text-gray-900 truncate">
                {card.title}
              </span>
              {/* Reduce text size for Accuracy Distribution value in second row if needed */}
              <span
                className={`mt-1 truncate font-extrabold text-gray-900 ${card.title === "Accuracy Distribution" ? "text-lg" : "text-2xl"}`}
              >
                {formatStatValue(card.value)}
              </span>
            </div>
            <div className="flex items-center justify-center ml-auto">
              <span className="inline-flex items-center justify-center rounded-full border border-blue-400 bg-white w-16 h-16">
                {ICON_MAPPING[card.icon]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightSummaryCards;
