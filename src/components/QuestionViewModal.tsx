import React, { useMemo, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Question, StudentResponse } from "@/DummyData/IndividualQuestionsData";

interface QuestionViewModalProps {
  open: boolean;
  onClose: () => void;
  question: Question | null;
  studentResponses?: StudentResponse[];
  modalClassName?: string; // Add modalClassName prop
}

const TOTAL_ATTEMPTS = 2000;

const QuestionViewModal: React.FC<QuestionViewModalProps> = ({ open, onClose, question, studentResponses = [], modalClassName }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Always call hooks in the same order, regardless of props
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (open && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  // Option-wise counts (simulate or use real data if available)
  const responses = useMemo(
    () => {
      if (!open || !question) return [];
      return studentResponses.filter(
        (r) => r.questionNo === question.number && r.subject === question.subject
      );
    },
    [studentResponses, question, open]
  );

  if (!open || !question) {
    return null;
  }

  let optionCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  if (responses.length >= TOTAL_ATTEMPTS) {
    responses.forEach((r) => {
      if (optionCounts[r.selectedOption] !== undefined) optionCounts[r.selectedOption]++;
    });
  } else {
    const base = [550, 720, 480, 250];
    ["A", "B", "C", "D"].forEach((opt, i) => (optionCounts[opt] = base[i]));
  }

  const correctOpt = question.correctAnswer;
  const incorrectCounts = { ...optionCounts };
  delete incorrectCounts[correctOpt];
  const mostCommonIncorrect = Object.entries(incorrectCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

  const correctCount = optionCounts[correctOpt];
  const correctPct = Math.round((correctCount / TOTAL_ATTEMPTS) * 100);
  const incorrectPct = 100 - correctPct;

  const chartData = ["A", "B", "C", "D"].map((opt) => ({
    option: opt,
    count: optionCounts[opt] ?? 0,
    isCorrect: opt === correctOpt,
    isMostWrong: opt === mostCommonIncorrect,
    percent: Math.round(((optionCounts[opt] ?? 0) / TOTAL_ATTEMPTS) * 100),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        ref={modalRef}
        className={modalClassName ? modalClassName : "bg-white rounded-3xl shadow-2xl w-[1100px] h-[80vh] max-w-none min-h-[750px] p-0 relative animate-fadeIn overflow-x-auto flex flex-col gap-0 md:gap-8"}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b bg-white/80 sticky top-0 z-10">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-3xl text-gray-900 leading-tight">Q{question.number}</span>
            <span className="text-lg text-gray-700 font-medium max-w-2xl truncate">{question.text}</span>
            <div className="flex gap-6 mt-2 text-base text-gray-600">
              <span><span className="font-semibold">Subject:</span> {question.subject}</span>
              <span><span className="font-semibold">Total Attempts:</span> {TOTAL_ATTEMPTS}</span>
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="w-7 h-7" />
          </button>
        </div>
        {/* Content */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between px-8 py-8 overflow-y-auto">
          {/* Chart Section */}
          <div className="flex-1 min-w-[320px]">
            <span className="font-semibold text-gray-700 mb-2 block">Option-wise Response Distribution</span>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                <XAxis dataKey="option" label={{ value: "Option", position: "insideBottom", offset: -5 }} />
                <YAxis allowDecimals={false} label={{ value: "Responses", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value: number, _name: string, props: any) =>
                    [
                      `${value} students (${props.payload.percent}%)`,
                      props.payload.isCorrect
                        ? "Correct Option"
                        : props.payload.isMostWrong
                        ? "Most Common Wrong Option"
                        : "Option",
                    ]
                  }
                />
                <Bar dataKey="count" label={{ position: "top" }}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.option}
                      fill={
                        entry.isCorrect
                          ? "#22c55e"
                          : entry.isMostWrong
                          ? "#ef4444"
                          : "#60a5fa"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-4 text-sm">
              <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Correct Option</span>
              <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Most Common Wrong</span>
              <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-400 inline-block" /> Other Options</span>
            </div>
          </div>
          {/* Analytics Section */}
          <div className="flex-1 min-w-[320px] flex flex-col gap-4 bg-gray-50 rounded-xl p-6 border shadow-sm">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-gray-700">% Correct</span>
              <span className="text-3xl font-bold text-green-600">{correctPct}%</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-gray-700">% Incorrect</span>
              <span className="text-3xl font-bold text-red-500">{incorrectPct}%</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-gray-700">Most Common Incorrect Option</span>
              <span className="text-xl font-bold text-red-600">{mostCommonIncorrect}</span>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <span className="font-semibold text-gray-700">Option-wise Distribution</span>
              <div className="flex flex-col gap-1">
                {chartData.map((opt) => (
                  <span key={opt.option} className="flex gap-2 items-center">
                    <span className={`w-3 h-3 rounded inline-block ${
                      opt.isCorrect
                        ? "bg-green-500"
                        : opt.isMostWrong
                        ? "bg-red-500"
                        : "bg-blue-400"
                    }`} />
                    <span className="font-mono font-bold">{opt.option}</span>
                    <span className="ml-2">{opt.count} students</span>
                    <span className="ml-2 text-xs text-gray-500">({opt.percent}%)</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionViewModal;
