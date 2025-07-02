interface SubjectSummary {
  subject: string;
  improved: number;
  declined: number;
  same: number;
}

interface PerformanceSummaryCardsProps {
  summary: SubjectSummary[];
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

// --- Card Design & Layout from InsightSummaryCards ---
const CARD_ICON_MAPPING: Record<string, React.ReactNode> = {
  Physics: "🧲",
  Chemistry: "⚗️",
  Botany: "🌱",
  Zoology: "🦋",
};

const PerformanceTabCards = ({ summary }: { summary: SubjectSummary[] }) => (
  <div className="w-full flex flex-col shadow-lg rounded-2xl overflow-hidden mt-4">
    <div className="flex flex-row w-full">
      {summary.slice(0, 2).map((s, idx) => (
        <div
          key={s.subject}
          className={`flex flex-1 items-center py-6 px-8 min-w-0 bg-white ${
            idx === 0 ? "rounded-l-2xl" : "border-l border-[#E9E9E9]"
          } ${idx === 1 ? "rounded-r-none" : ""}`}
        >
          <div className="flex flex-col min-w-0">
            <span className="text-base font-semibold text-gray-900 truncate">
              {s.subject}
            </span>
            <span className="text-lg font-extrabold text-gray-900 mt-1 truncate">
              Improved: {s.improved}, Declined: {s.declined}, No Change: {s.same}
            </span>
          </div>
          <div className="flex items-center justify-center ml-auto">
            <span className="inline-flex items-center justify-center rounded-full border border-blue-400 bg-white w-16 h-16 text-3xl">
              {CARD_ICON_MAPPING[s.subject] || "📊"}
            </span>
          </div>
        </div>
      ))}
    </div>
    <div className="flex flex-row w-full border-t border-[#E9E9E9]">
      {summary.slice(2, 4).map((s, idx) => (
        <div
          key={s.subject}
          className={`flex flex-1 items-center py-6 px-8 min-w-0 bg-white ${
            idx === 0 ? "rounded-bl-2xl" : "border-l border-[#E9E9E9]"
          } ${idx === 1 ? "rounded-br-2xl" : ""}`}
        >
          <div className="flex flex-col min-w-0">
            <span className="text-base font-semibold text-gray-900 truncate">
              {s.subject}
            </span>
            <span className="text-lg font-extrabold text-gray-900 mt-1 truncate">
              Improved: {s.improved}, Declined: {s.declined}, No Change: {s.same}
            </span>
          </div>
          <div className="flex items-center justify-center ml-auto">
            <span className="inline-flex items-center justify-center rounded-full border border-blue-400 bg-white w-16 h-16 text-3xl">
              {CARD_ICON_MAPPING[s.subject] || "📊"}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PerformanceSummaryCards: React.FC<PerformanceSummaryCardsProps> = ({
  summary,
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
  </div>
);

export { PerformanceTabCards };
export default PerformanceSummaryCards;
