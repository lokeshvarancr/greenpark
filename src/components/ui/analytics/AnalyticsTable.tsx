import React from "react";
import type { Question } from "@/types/questions";

interface AnalyticsTableProps {
  questions: Question[];
  sortDir: "asc" | "desc";
  setSortKey: (key: keyof Question) => void;
  setSortDir: (dir: "asc" | "desc") => void;
  getAccuracyColor: (accuracy: number) => string;
}

const AnalyticsTable: React.FC<AnalyticsTableProps> = ({
  questions,
  sortDir,
  setSortKey,
  setSortDir,
  getAccuracyColor,
}) => (
  <div className="md:col-span-2 bg-white rounded-lg shadow p-4 overflow-x-auto">
    <h3 className="font-semibold mb-2">Question-Level Analytics</h3>
    <table className="min-w-full text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 cursor-pointer" onClick={() => { setSortKey("questionId"); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>Q#</th>
          <th className="p-2 cursor-pointer" onClick={() => { setSortKey("attempts"); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>Attempted</th>
          <th className="p-2">Correct</th>
          <th className="p-2">Incorrect</th>
          <th className="p-2 cursor-pointer" onClick={() => { setSortKey("accuracy"); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>Accuracy %</th>
        </tr>
      </thead>
      <tbody>
        {questions.map(q => (
          <tr key={q.questionId} className={`transition-colors ${getAccuracyColor(q.accuracy)}`}>
            <td className="p-2 font-semibold">{q.questionId}</td>
            <td className="p-2">{q.attempts}</td>
            <td className="p-2 relative group">
              {q.correct}
              <span className="ml-1 text-gray-400 cursor-help group-hover:underline relative">
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                  {q.correct} of {q.attempts} students got this right
                </span>
                ℹ️
              </span>
            </td>
            <td className="p-2">{q.incorrect}</td>
            <td className="p-2 font-bold">{q.accuracy}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AnalyticsTable;
