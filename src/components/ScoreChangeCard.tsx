import React from "react";

interface ScoreChangeCardProps {
  summary: Array<{
    subject: string;
    improved: number;
    declined: number;
    same: number;
  }>;
}

const subjectColors: Record<string, string> = {
  Physics: "bg-blue-50 border-blue-200",
  Chemistry: "bg-yellow-50 border-yellow-200",
  Botany: "bg-green-50 border-green-200",
  Zoology: "bg-pink-50 border-pink-200",
};

const ScoreChangeCard: React.FC<ScoreChangeCardProps> = ({ summary }) => {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {summary.map((s) => (
        <div
          key={s.subject}
          className={`rounded-2xl shadow border p-5 flex flex-col items-center ${subjectColors[s.subject] || "bg-gray-50 border-gray-200"}`}
        >
          <div className="text-lg font-semibold mb-2 text-gray-700">{s.subject}</div>
          <div className="flex items-center gap-3 text-2xl font-bold">
            <span className="text-green-600">+{s.improved}</span>
            <span className="text-red-500">-{s.declined}</span>
            <span className="text-gray-500">0:{s.same}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">Score Change</div>
        </div>
      ))}
    </div>
  );
};

export default ScoreChangeCard;
