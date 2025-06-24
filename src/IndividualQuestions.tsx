import React, { useState, useMemo } from "react";
import { Download, FileText, Eye, X, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// --------------------
// NEET Topics & Subjects
// --------------------

const NEET_SUBJECTS = ["Physics", "Chemistry", "Biology"];
const CLASSES = ["Overall Class", "11A", "11B", "11C", "11D", "11E"];
const TESTS = ["Unit Test 1", "Unit Test 2", "Midterm", "Final"];
const EXAM_TYPES = ["Weekly", "Cumulative", "Grant"];

// --------------------
// Types
// --------------------
type Option = { option: string; count: number };
export type Question = {
	id: number;
	number: number;
	subject: string;
	text: string;
	attempts: number;
	correct: number;
	incorrect: number;
	accuracy: number; // percentage (0-100)
	difficulty: "Easy" | "Medium" | "Hard";
	correctAnswer: string;
	options: Option[];
	class: string;
	test: string;
};

type StudentResponse = {
  studentId: string;
  subject: string;
  questionNo: number;
  selectedOption: string;
  isCorrect: boolean;
};

export type TopicAnalytics = {
  topic: string;
  avgAccuracy: number;
  totalQuestions: number;
};

// --------------------
// Generate 180 Dummy Questions
// --------------------
function getRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
const QUESTIONS: Question[] = Array.from({ length: 180 }, (_, i) => {
	const subject = getRandom(NEET_SUBJECTS);
	return {
		id: i + 1,
		number: i + 1,
		subject,
		text: `Sample NEET Question ${i + 1} (${subject})?`,
		attempts: Math.floor(Math.random() * 50) + 10,
		correct: Math.floor(Math.random() * 30),
		incorrect: Math.floor(Math.random() * 20),
		accuracy: Math.floor(Math.random() * 100),
		difficulty: getRandom(["Easy", "Medium", "Hard"]),
		correctAnswer: getRandom(["A", "B", "C", "D"]),
		options: [
			{ option: "A", count: Math.floor(Math.random() * 20) },
			{ option: "B", count: Math.floor(Math.random() * 20) },
			{ option: "C", count: Math.floor(Math.random() * 20) },
			{ option: "D", count: Math.floor(Math.random() * 20) },
		],
		class: getRandom(CLASSES.slice(1)), // Exclude 'Overall Class' for data
		test: getRandom(TESTS),
	};
});

// --------------------
// Helpers
// --------------------
function getAccuracyBadge(accuracy: number) {
	if (accuracy < 40)
		return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">{accuracy}%</span>;
	if (accuracy <= 60)
		return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">{accuracy}%</span>;
	return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">{accuracy}%</span>;
}

// --------------------
// View Modal
// --------------------
// Enhanced modal with analytics and improved UI/UX

function QuestionViewModal({
  open,
  onClose,
  question,
  studentResponses = [],
}: {
  open: boolean;
  onClose: () => void;
  question: Question | null;
  studentResponses?: StudentResponse[];
}) {
  if (!open || !question) return null;

  // Simulate 2000 attempts for analytics
  const TOTAL_ATTEMPTS = 2000;
  // Option-wise counts (simulate or use real data if available)
  const responses = useMemo(
    () =>
      studentResponses.filter(
        (r) => r.questionNo === question.number && r.subject === question.subject
      ),
    [studentResponses, question]
  );

  // If real data is available, use it; otherwise, simulate
  let optionCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  if (responses.length >= TOTAL_ATTEMPTS) {
    responses.forEach((r) => {
      if (optionCounts[r.selectedOption] !== undefined) optionCounts[r.selectedOption]++;
    });
  } else {
    // Simulate a distribution for demo if not enough data
    const base = [550, 720, 480, 250];
    ["A", "B", "C", "D"].forEach((opt, i) => (optionCounts[opt] = base[i]));
  }

  // Most common incorrect option
  const correctOpt = question.correctAnswer;
  const incorrectCounts = { ...optionCounts };
  delete incorrectCounts[correctOpt];
  const mostCommonIncorrect = Object.entries(incorrectCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

  // Stats
  const correctCount = optionCounts[correctOpt];
  const correctPct = Math.round((correctCount / TOTAL_ATTEMPTS) * 100);
  const incorrectPct = 100 - correctPct;

  // Chart data for options
  const chartData = ["A", "B", "C", "D"].map((opt) => ({
    option: opt,
    count: optionCounts[opt] ?? 0,
    isCorrect: opt === correctOpt,
    isMostWrong: opt === mostCommonIncorrect,
    percent: Math.round(((optionCounts[opt] ?? 0) / TOTAL_ATTEMPTS) * 100),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl min-h-[600px] p-10 relative animate-fadeIn overflow-x-auto flex flex-col gap-8">
        <button
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="w-7 h-7" />
        </button>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-3xl text-gray-900 leading-tight">
              Q{question.number}
            </span>
            <span className="text-lg text-gray-700 font-medium">{question.text}</span>
            <div className="flex gap-6 mt-2 text-base text-gray-600">
              <span><span className="font-semibold">Subject:</span> {question.subject}</span>
              <span><span className="font-semibold">Total Attempts:</span> {TOTAL_ATTEMPTS}</span>
            </div>
          </div>
        </div>
        {/* Chart Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
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
}

// --------------------
// Main Component
// --------------------
const IndividualQuestions: React.FC<{ studentResponses?: StudentResponse[] }> = ({ studentResponses = [] }) => {
	// Top bar filters
	const [selectedClass, setSelectedClass] = useState<string>(CLASSES[0]);
	const [selectedTest, setSelectedTest] = useState<string>("");
	const [selectedSubject, setSelectedSubject] = useState<string>("");
	const [selectedExamType, setSelectedExamType] = useState<string>(EXAM_TYPES[0]);
	const [viewModalQuestion, setViewModalQuestion] = useState<Question | null>(null);

	// Dummy handlers for download
	const handleDownload = (type: string) => {
		alert(`Download as ${type} (dummy)`);
	};

	// Filtered questions
	const questionsToShow = useMemo(() => {
		return QUESTIONS.filter(q =>
			(selectedClass === "Overall Class" || q.class === selectedClass) &&
			(!selectedTest || q.test === selectedTest) &&
			(!selectedSubject || q.subject === selectedSubject)
		);
	}, [selectedClass, selectedTest, selectedSubject]);

	return (
		<div className="min-h-screen bg-gray-50 pb-8">
			{/* Top Bar Filters */}
			<div className="sticky top-0 z-30 bg-white shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-3 border-b">
				<div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
					{/* Class Dropdown */}
					<div className="relative">
						<select className="appearance-none border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
							{CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
						</select>
						<ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
					</div>
					{/* Exam Type Dropdown */}
					<div className="relative">
						<select className="appearance-none border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={selectedExamType} onChange={e => setSelectedExamType(e.target.value)}>
							<option value="">All Exams</option>
							{EXAM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
						</select>
						<ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
					</div>
					{/* Test Dropdown */}
					<div className="relative">
						<select className="appearance-none border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={selectedTest} onChange={e => setSelectedTest(e.target.value)}>
							{TESTS.map(test => <option key={test} value={test}>{test}</option>)}
						</select>
						<ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
					</div>
					{/* Subject Dropdown */}
					<div className="relative">
						<select className="appearance-none border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
							<option value="">All Subjects</option>
							{NEET_SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
						</select>
						<ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
					</div>
				</div>
				{/* Download Buttons */}
				<div className="flex gap-2">
					<button className="flex items-center gap-1 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition shadow" onClick={() => handleDownload("CSV")}> <Download className="w-4 h-4" /> CSV </button>
					<button className="flex items-center gap-1 px-3 py-2 rounded bg-gray-700 text-white hover:bg-gray-800 transition shadow" onClick={() => handleDownload("PDF")}> <FileText className="w-4 h-4" /> PDF </button>
				</div>
			</div>

			{/* Per-Question Analysis (full-width, scrollable) */}
			<div className="w-full max-w-7xl mx-auto px-2 md:px-6 mt-6">
				<div className="bg-white rounded-xl shadow p-4 overflow-x-auto max-h-[70vh] overflow-y-auto">
					<h2 className="text-lg font-bold mb-4">Per-Question Analysis <span className="text-xs text-gray-400">({questionsToShow.length} questions)</span></h2>
					<div className="w-full min-w-[1100px]">
						<table className="w-full text-sm whitespace-nowrap">
							<thead>
								<tr className="bg-gray-100">
									<th className="py-2 px-2 text-left">Q#</th>
									<th className="py-2 px-2 text-left">Subject</th>
									<th className="py-2 px-2 text-center">Attempts</th>
									<th className="py-2 px-2 text-center">Correct</th>
									<th className="py-2 px-2 text-center">Incorrect</th>
									<th className="py-2 px-2 text-center">Accuracy</th>
									<th className="py-2 px-2 text-center">View</th>
								</tr>
							</thead>
							<tbody>
								{questionsToShow.map(q => (
									<tr key={q.id} className="border-b hover:bg-blue-50 transition">
										<td className="py-2 px-2">{q.number}</td>
										<td className="py-2 px-2">{q.subject}</td>
										<td className="py-2 px-2 text-center">{q.attempts}</td>
										<td className="py-2 px-2 text-center">{q.correct}</td>
										<td className="py-2 px-2 text-center">{q.incorrect}</td>
										<td className="py-2 px-2 text-center">{getAccuracyBadge(q.accuracy)}</td>
										<td className="py-2 px-2 text-center">
											<button className="text-blue-600 hover:underline flex items-center gap-1" onClick={() => setViewModalQuestion(q)}>
												<Eye className="w-4 h-4" /> View
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* View Modal */}
			<QuestionViewModal
				open={!!viewModalQuestion}
				onClose={() => setViewModalQuestion(null)}
				question={viewModalQuestion}
				studentResponses={studentResponses}
			/>
		</div>
	);
};

export default IndividualQuestions;
