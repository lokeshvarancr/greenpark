import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface SubjectSummary {
  subject: string;
  improved: number;
  declined: number;
  same: number;
}

interface PerformanceSummaryCardsProps {
  summary: SubjectSummary[];
  groupedBarChartData: {
    subject: string;
    Improved: number;
    Declined: number;
    NoChange: number;
  }[];
  rankBarChartData: any[]; // Add the correct type if known
}

const subjectIcons: Record<string, string> = {
  Physics: "🧲",
  Chemistry: "⚗️",
  Botany: "🌱",
  Zoology: "🦋",
};

const cardGradients: Record<string, string> = {
  Physics: "from-blue-400 to-blue-600",
  Chemistry: "from-pink-400 to-pink-600",
  Botany: "from-green-400 to-green-600",
  Zoology: "from-yellow-400 to-yellow-600",
};

const GroupedBarChart = ({
  data,
}: {
  data: {
    subject: string;
    Improved: number;
    Declined: number;
    NoChange: number;
  }[];
}) => (
  <div className="w-full h-[360px]">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
        barCategoryGap={20}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend verticalAlign="top" height={36} />
        <Bar dataKey="Improved" fill="#22c55e" radius={[6, 6, 0, 0]} />
        <Bar dataKey="Declined" fill="#ef4444" radius={[6, 6, 0, 0]} />
        <Bar dataKey="NoChange" fill="#facc15" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const PerformanceSummaryCards: React.FC<PerformanceSummaryCardsProps> = ({
  summary,
  groupedBarChartData,
}) => (
  <div className="flex flex-col lg:flex-row gap-6 mb-8">
    {/* Left: 2x2 Card Grid */}
    <div className="grid grid-cols-2 gap-6 flex-shrink-0 w-full lg:w-1/2">
      {summary.map((s) => (
        <div
          key={s.subject}
          className={`relative bg-gradient-to-br ${
            cardGradients[s.subject] || "from-gray-300 to-gray-500"
          } p-6 rounded-2xl shadow-xl flex flex-col items-center gap-2 overflow-hidden group transition-transform hover:scale-[1.03]`}
        >
          <div className="absolute right-3 top-3 text-4xl opacity-20 group-hover:opacity-30 transition">
            {subjectIcons[s.subject] || "📊"}
          </div>
          <div className="text-white text-lg font-semibold drop-shadow-sm z-10">
            {s.subject}
          </div>
          <div className="flex gap-4 z-10 mt-2">
            <div className="flex flex-col items-center">
              <span className="text-xs text-green-100 font-medium">Improved</span>
              <span className="font-bold text-green-50 text-lg">{s.improved}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-red-100 font-medium">Declined</span>
              <span className="font-bold text-red-50 text-lg">{s.declined}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-100 font-medium">No Change</span>
              <span className="font-bold text-gray-50 text-lg">{s.same}</span>
            </div>
          </div>
          <div className="w-16 h-1 rounded-full bg-white/30 mt-3 z-10"></div>
        </div>
      ))}
    </div>

    {/* Right: Stylish Vertical Chart */}
    <div className="flex-grow bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-6 flex flex-col items-center min-w-[350px]">
      <div className="text-lg font-semibold text-green-700 mb-4 tracking-wide">
        Subject-wise Change
      </div>
      <GroupedBarChart data={groupedBarChartData} />
    </div>
  </div>
);

export default PerformanceSummaryCards;
