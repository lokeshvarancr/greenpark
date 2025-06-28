import React from "react";
import SubjectCard from "./SubjectCard";
import ScoreChart from "./ScoreChart";

interface PerformanceComparisonProps {
  summary: Array<{
    subject: string;
    improved: number;
    declined: number;
    same: number;
  }>;
}

const subjectColors: Record<string, string> = {
  Physics: "blue",
  Chemistry: "yellow",
  Botany: "green",
  Zoology: "pink",
};

const PerformanceComparison: React.FC<PerformanceComparisonProps> = ({ summary }) => {
  return (
    <section className="w-full max-w-full px-2 md:px-4 mt-6">
      <div className="flex flex-row gap-4 items-stretch w-full flex-wrap md:flex-nowrap">
        {/* Subject Cards */}
        <div className="flex flex-row gap-4 flex-1 min-w-0 max-w-[600px]">
          {summary.map((s) => (
            <SubjectCard
              key={s.subject}
              subject={s.subject}
              improved={s.improved}
              declined={s.declined}
              same={s.same}
              color={subjectColors[s.subject] || "gray"}
            />
          ))}
        </div>
        {/* Chart */}
        <div className="flex-shrink-0 w-full md:w-auto max-w-[500px]">
          <ScoreChart summary={summary} />
        </div>
      </div>
    </section>
  );
};

export default PerformanceComparison;
