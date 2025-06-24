import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Type for OMR response
export type OMRResponse = {
  studentId: string;
  subject: string;
  questionNo: number;
  selectedOption: "A" | "B" | "C" | "D";
  isCorrect: boolean;
};

type Props = {
  data: OMRResponse[];
};

const optionColors = {
  A: "#60a5fa",
  B: "#fbbf24",
  C: "#34d399",
  D: "#f87171",
};

function getAnalytics(responses: OMRResponse[]) {
  const total = responses.length;
  const correct = responses.filter(r => r.isCorrect).length;
  const incorrect = total - correct;
  const optionCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  responses.forEach(r => optionCounts[r.selectedOption]++);
  // Most chosen wrong option
  const wrongOptions = responses.filter(r => !r.isCorrect).map(r => r.selectedOption);
  const wrongOptionCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  wrongOptions.forEach(opt => wrongOptionCounts[opt]++);
  let mostChosenWrong = "-";
  let maxWrong = 0;
  Object.entries(wrongOptionCounts).forEach(([opt, count]) => {
    if (count > maxWrong) {
      maxWrong = count;
      mostChosenWrong = opt;
    }
  });
  return {
    total,
    correct,
    incorrect,
    correctPct: total ? Math.round((correct / total) * 100) : 0,
    incorrectPct: total ? Math.round((incorrect / total) * 100) : 0,
    optionCounts,
    mostChosenWrong,
  };
}

const OMRQuestionTable: React.FC<Props> = ({ data }) => {
  // Group by questionNo for table rows
  const questions = Array.from(new Set(data.map(d => d.questionNo))).sort((a, b) => a - b);
  const [modal, setModal] = useState<{ open: boolean; questionNo: number | null }>({ open: false, questionNo: null });

  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <h2 className="text-lg font-bold mb-4">OMR Question Analysis</h2>
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-2 text-left">Q#</th>
              <th className="py-2 px-2 text-left">Subject</th>
              <th className="py-2 px-2 text-center">View</th>
            </tr>
          </thead>
          <tbody>
            {questions.map(qNo => {
              const row = data.find(d => d.questionNo === qNo);
              return (
                <tr key={qNo} className="border-b hover:bg-blue-50 transition">
                  <td className="py-2 px-2">{qNo}</td>
                  <td className="py-2 px-2">{row?.subject}</td>
                  <td className="py-2 px-2 text-center">
                    <button
                      className="text-blue-600 hover:underline flex items-center gap-1 px-3 py-1 rounded bg-blue-100 hover:bg-blue-200"
                      onClick={() => setModal({ open: true, questionNo: qNo })}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Modal */}
      {modal.open && modal.questionNo !== null && (
        <OMRQuestionModal
          questionNo={modal.questionNo}
          responses={data.filter(d => d.questionNo === modal.questionNo)}
          onClose={() => setModal({ open: false, questionNo: null })}
        />
      )}
    </div>
  );
};

// Modal Component
const OMRQuestionModal: React.FC<{
  questionNo: number;
  responses: OMRResponse[];
  onClose: () => void;
}> = ({ questionNo, responses, onClose }) => {
  if (!responses.length) return null;
  const subject = responses[0].subject;
  const analytics = getAnalytics(responses);
  const chartData = [
    { name: "A", value: analytics.optionCounts.A, fill: optionColors.A },
    { name: "B", value: analytics.optionCounts.B, fill: optionColors.B },
    { name: "C", value: analytics.optionCounts.C, fill: optionColors.C },
    { name: "D", value: analytics.optionCounts.D, fill: optionColors.D },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 relative animate-fadeIn flex flex-col max-h-[95vh] overflow-y-auto">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold" onClick={onClose}>×</button>
        <div className="flex flex-col md:flex-row gap-8 mb-6">
          {/* Metadata */}
          <div className="flex-1 space-y-2">
            <div className="text-2xl font-bold text-blue-700">Q{questionNo}</div>
            <div className="text-lg font-semibold text-gray-700">Subject: <span className="text-blue-600">{subject}</span></div>
            <div className="flex gap-4 mt-2">
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded font-semibold text-sm">Correct: {analytics.correctPct}%</div>
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded font-semibold text-sm">Incorrect: {analytics.incorrectPct}%</div>
              <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded font-semibold text-sm">Most Chosen Wrong: {analytics.mostChosenWrong}</div>
            </div>
          </div>
          {/* Chart */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="font-semibold mb-2">Option Distribution</span>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value">
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Student Breakdown */}
        <div className="bg-gray-50 rounded-xl p-4 mt-2">
          <h3 className="text-lg font-bold mb-2">Student-wise Breakdown</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-2 text-left">Student ID</th>
                <th className="py-2 px-2 text-left">Option Selected</th>
                <th className="py-2 px-2 text-left">Correct?</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r, idx) => (
                <tr key={r.studentId + idx} className="border-b">
                  <td className="py-2 px-2 font-mono">{r.studentId}</td>
                  <td className="py-2 px-2">
                    <span className={`inline-block px-2 py-1 rounded font-semibold text-white bg-blue-400`} style={{ background: optionColors[r.selectedOption] }}>{r.selectedOption}</span>
                  </td>
                  <td className="py-2 px-2">
                    {r.isCorrect ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Yes</span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OMRQuestionTable;
