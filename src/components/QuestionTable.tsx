import React from "react";
import { Eye } from "lucide-react";
import AccuracyBadge from "./AccuracyBadge";
import type { Question } from "@/DummyData/IndividualQuestionsData";

interface QuestionTableProps {
  questions: Question[];
  getSectionStats: (q: Question) => any;
  onView: (q: Question) => void;
}

const QuestionTable: React.FC<QuestionTableProps> = ({ questions, getSectionStats, onView }) => (
  <div className="w-full max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
    <div className="overflow-x-auto">
      <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="sticky top-0 z-10 bg-gray-100 shadow-sm">
            <tr>
              <th className="py-2 px-2 text-left font-semibold text-slate-700">Q#</th>
              <th className="py-2 px-2 text-left font-semibold text-slate-700">Subject</th>
              <th className="py-2 px-2 text-center font-semibold text-slate-700">Total Count</th>
              <th className="py-2 px-2 text-center font-semibold text-slate-700">Attempts</th>
              <th className="py-2 px-2 text-center font-semibold text-slate-700">Correct</th>
              <th className="py-2 px-2 text-center font-semibold text-slate-700">Incorrect</th>
              <th className="py-2 px-2 text-center font-semibold text-slate-700">Accuracy</th>
              <th className="py-2 px-2 text-center font-semibold text-slate-700">View</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, idx) => {
              const stats = getSectionStats(q);
              return (
                <tr key={q.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50" + " border-b hover:bg-blue-50 transition"}>
                  <td className="py-2 px-2 align-middle">{q.number}</td>
                  <td className="py-2 px-2 align-middle">{q.subject}</td>
                  <td className="py-2 px-2 text-center align-middle">{stats.count}</td>
                  <td className="py-2 px-2 text-center align-middle">{stats.attempts}</td>
                  <td className="py-2 px-2 text-center align-middle">{stats.correct}</td>
                  <td className="py-2 px-2 text-center align-middle">{stats.incorrect}</td>
                  <td className="py-2 px-2 text-center align-middle"><AccuracyBadge accuracy={stats.accuracy} /></td>
                  <td className="py-2 px-2 text-center align-middle">
                    <button className="text-blue-600 hover:underline flex items-center gap-1" onClick={() => onView(q)}>
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default QuestionTable;
