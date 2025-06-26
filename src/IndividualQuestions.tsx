import React, { useState, useMemo } from "react";
import { Eye, X, ChevronDown, Download, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// --------------------
// NEET Topics & Subjects
// --------------------
const NEET_SUBJECTS = ["Physics", "Chemistry", "Botany", "Zoology"];
const CLASSES = ["11A", "11B", "11C", "11D", "11E", "11F"];
const TEST_TYPES = ["Weekly", "Cumulative", "Grand Test"];
const BATCHES = ["Batch A", "Batch B"];

// Add these constants above the main component
const CUMULATIVE_PAIRS: string[] = [
  "Physics + Botany",
  "Chemistry + Zoology"
];
const TOTAL_STUDENTS = 2000;
const SECTION_COUNT = 20;

// Helper: Generate months from June 2025 to May 2026
const MONTHS = (() => {
  const months = [];
  const start = new Date(2025, 5, 1); // June 2025
  for (let i = 0; i < 12; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    months.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("default", { month: "long", year: "numeric" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
})();

// Helper: Get weeks in a month (Sunday–Saturday)
function getWeeksInMonth(year: number, month: number) {
  const weeks = [];
  let date = new Date(year, month, 1);
  let week = [];
  while (date.getMonth() === month) {
    week.push(new Date(date));
    if (date.getDay() === 6) { // Saturday
      weeks.push(week);
      week = [];
    }
    date.setDate(date.getDate() + 1);
  }
  if (week.length) weeks.push(week);
  return weeks;
}

// Helper: Get subjects for a week
function getSubjectsForWeek(week: Date[]) {
  const dayToSubject: Record<number, string> = {
    3: "Physics",    // Wednesday
    4: "Chemistry",  // Thursday
    5: "Botany",     // Friday
    6: "Zoology",    // Saturday
  };
  return week
    .filter(d => dayToSubject[d.getDay()])
    .map(d => ({
      day: d,
      subject: dayToSubject[d.getDay()],
    }));
}

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
		test: getRandom(TEST_TYPES),
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
const SECTION_OPTIONS = [
  ...Array.from({ length: 10 }, (_, i) => `11${String.fromCharCode(65 + i)}`),
  ...Array.from({ length: 10 }, (_, i) => `12${String.fromCharCode(65 + i)}`),
];

const IndividualQuestions: React.FC<{ studentResponses?: StudentResponse[] }> = ({ studentResponses = [] }) => {
  // Top bar filters
  const [testType, setTestType] = useState<string>(TEST_TYPES[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[0].value);
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState<string>("Physics"); // Default to Physics for Weekly
  const [selectedBatch, setSelectedBatch] = useState<string>(BATCHES[0]);
  const [selectedPair, setSelectedPair] = useState<string>(CUMULATIVE_PAIRS[0]);
  const [selectedGrandTest, setSelectedGrandTest] = useState<string>("Grand Test 1");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([...CLASSES]);
  const [selectedSections, setSelectedSections] = useState<string[]>([...SECTION_OPTIONS]);
  const [viewModalQuestion, setViewModalQuestion] = useState<Question | null>(null);
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);

  // --- Weekly: Calculate weeks and subjects ---
  const selectedMonthObj = MONTHS.find(m => m.value === selectedMonth)!;
  const weeks = useMemo(() => getWeeksInMonth(selectedMonthObj.year, selectedMonthObj.month), [selectedMonthObj]);
  const weekSubjects = weeks[selectedWeekIdx] ? getSubjectsForWeek(weeks[selectedWeekIdx]) : [];
  const weekSubjectOptions = weekSubjects.map(ws => ws.subject);

  // --- Grand Test Names ---
  const grandTestNames = useMemo(() => Array.from({ length: 4 }, (_, i) => `Grand Test ${i + 1}`), [selectedMonth]);

  // --- Filtered questions logic ---
  const questionsToShow = useMemo(() => {
    let questions: Question[] = [];
    if (testType === "Weekly") {
      if (!selectedSubject) return [];
      let count = 0;
      if (selectedSubject === "Physics") count = 30;
      else if (selectedSubject === "Chemistry") count = 45;
      else if (selectedSubject === "Botany" || selectedSubject === "Zoology") count = 60;
      questions = QUESTIONS.filter(q => q.subject === selectedSubject).slice(0, count);
      // Always start numbering from 1
      questions = questions.map((q, i) => ({ ...q, number: i + 1 }));
    } else if (testType === "Cumulative") {
      const pair = selectedPair.split(" + ");
      let first = QUESTIONS.filter(q => q.subject === pair[0]).slice(0, 50).map((q, i) => ({ ...q, number: i + 1 }));
      let second = QUESTIONS.filter(q => q.subject === pair[1]).slice(0, 50).map((q, i) => ({ ...q, number: i + 51 }));
      questions = [...first, ...second];
    } else if (testType === "Grand Test") {
      // Physics: 1–30, Chemistry: 31–75, Botany: 76–135, Zoology: 136–180
      let idx = 1;
      let physics = QUESTIONS.filter(q => q.subject === "Physics").slice(0, 30).map((q, i) => ({ ...q, number: idx + i }));
      idx += 30;
      let chemistry = QUESTIONS.filter(q => q.subject === "Chemistry").slice(0, 45).map((q, i) => ({ ...q, number: idx + i }));
      idx += 45;
      let botany = QUESTIONS.filter(q => q.subject === "Botany").slice(0, 60).map((q, i) => ({ ...q, number: idx + i }));
      idx += 60;
      let zoology = QUESTIONS.filter(q => q.subject === "Zoology").slice(0, 45).map((q, i) => ({ ...q, number: idx + i }));
      questions = [...physics, ...chemistry, ...botany, ...zoology];
    }
    // Do NOT filter by section here; section affects only stats, not question count
    return questions;
  }, [testType, selectedSubject, selectedPair, selectedGrandTest, selectedWeekIdx, selectedMonth]);

  // --- Per-question stats based on selected sections ---
  // For demo, simulate per-question stats by section
  const getSectionStats = (q: Question) => {
    // Simulate: each section has 10-20 students per question
    const count = selectedSections.length * 15;
    // Simulate attempts/correct/incorrect as a function of count
    const attempts = Math.round(count * 0.95);
    const correct = Math.round(attempts * (q.accuracy / 100));
    const incorrect = attempts - correct;
    return { count, attempts, correct, incorrect, accuracy: q.accuracy };
  };

  // --- Export Handlers ---
  const handleExport = (type: "CSV" | "PDF") => {
    alert(`Export as ${type} (demo only)`);
  };

  // --- UI ---
  return (
    <div className="h-screen min-h-0 flex flex-col bg-gray-50">
      {/* Top Bar Filters */}
      <div className="sticky top-0 z-30 bg-white shadow flex flex-wrap items-center justify-between gap-4 px-4 py-4 rounded-b-2xl border-b">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Test Type Dropdown */}
          <div className="relative min-w-[140px]">
            <label className="block text-xs font-semibold mb-1 text-gray-600">Test Type</label>
            <select
              className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition"
              value={testType}
              onChange={e => {
                setTestType(e.target.value);
                setSelectedMonth(MONTHS[0].value);
                setSelectedWeekIdx(0);
                setSelectedSubject("Physics");
                setSelectedBatch(BATCHES[0]);
                setSelectedPair(CUMULATIVE_PAIRS[0]);
                setSelectedGrandTest("Grand Test 1");
              }}
            >
              {TEST_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-8 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          {/* Month Dropdown */}
          <div className="relative min-w-[160px]">
            <label className="block text-xs font-semibold mb-1 text-gray-600">Month</label>
            <select
              className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition"
              value={selectedMonth}
              onChange={e => {
                setSelectedMonth(e.target.value);
                setSelectedWeekIdx(0);
                setSelectedSubject("Physics");
              }}
            >
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-8 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          {/* Weekly Filters */}
          {testType === "Weekly" && (
            <>
              {/* Week Dropdown */}
              <div className="relative min-w-[140px]">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Week</label>
                <select
                  className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition"
                  value={selectedWeekIdx}
                  onChange={e => {
                    setSelectedWeekIdx(Number(e.target.value));
                    setSelectedSubject(weekSubjectOptions[0] || "");
                  }}
                >
                  {weeks.map((w, i) => (
                    <option key={i} value={i}>
                      {`Week ${i + 1} (${w[0].toLocaleDateString()} - ${w[w.length - 1].toLocaleDateString()})`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-8 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {/* Subject Dropdown */}
              <div className="relative min-w-[140px]">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Subject</label>
                <select
                  className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition"
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                >
                  {weekSubjectOptions.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-8 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </>
          )}
          {/* Cumulative Filters */}
          {testType === "Cumulative" && (
            <>
              {/* Batch Dropdown */}
              <div className="relative min-w-[140px]">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Batch</label>
                <select
                  className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition"
                  value={selectedBatch}
                  onChange={e => setSelectedBatch(e.target.value)}
                >
                  {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-8 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {/* Subject Pair Dropdown */}
              <div className="relative min-w-[180px]">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Subject Pair</label>
                <select
                  className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition"
                  value={selectedPair}
                  onChange={e => setSelectedPair(e.target.value)}
                >
                  {CUMULATIVE_PAIRS.map(pair => <option key={pair} value={pair}>{pair}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-8 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </>
          )}
          {/* Grand Test Filters */}
          {testType === "Grand Test" && (
            <>
              {/* Grand Test Name Dropdown */}
              <div className="relative min-w-[180px]">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Grand Test Name</label>
                <select
                  className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition"
                  value={selectedGrandTest}
                  onChange={e => setSelectedGrandTest(e.target.value)}
                >
                  {grandTestNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-8 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </>
          )}
        </div>
        {/* Section Dropdown */}
        <div className="relative min-w-[220px]">
          <label className="block text-xs font-semibold mb-1 text-gray-600">Section</label>
          <button
            type="button"
            className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8 w-full flex justify-between items-center bg-white hover:bg-blue-50 transition shadow-sm"
            onClick={() => setSectionDropdownOpen(v => !v)}
          >
            <span className="truncate text-left">{selectedSections.length === 0 ? "None" : selectedSections.length === SECTION_OPTIONS.length ? "All Sections" : selectedSections.join(", ")}</span>
            <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
          </button>
          {sectionDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 max-h-72 overflow-y-auto bg-white border rounded-xl shadow-lg z-50 p-2 animate-fadeIn">
              <div className="flex items-center gap-2 mb-2 px-2">
                <input
                  type="checkbox"
                  checked={selectedSections.length === SECTION_OPTIONS.length}
                  onChange={() => setSelectedSections(selectedSections.length === SECTION_OPTIONS.length ? [] : [...SECTION_OPTIONS])}
                  className="accent-blue-600 w-4 h-4 rounded"
                  id="select-all-sections"
                />
                <label htmlFor="select-all-sections" className="text-sm font-medium cursor-pointer">Select All</label>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {SECTION_OPTIONS.map(section => (
                  <label key={section} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section)}
                      onChange={() => setSelectedSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section])}
                      className="accent-blue-600 w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium">{section}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Export Buttons */}
        <div className="flex gap-2 ml-auto">
          <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow" onClick={() => handleExport("CSV")}> <Download className="w-4 h-4" /> CSV </button>
          <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition shadow" onClick={() => handleExport("PDF")}> <FileText className="w-4 h-4" /> PDF </button>
        </div>
      </div>

      {/* Per-Question Analysis Section */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-2 md:px-6 mt-6 flex flex-col">
        <div className="bg-white rounded-xl shadow p-0 overflow-hidden flex-1 flex flex-col">
          <div className="w-full min-w-[1100px] flex-1 flex flex-col">
            <table className="w-full text-sm whitespace-nowrap sticky top-0 z-10 bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-2 text-left">Q#</th>
                  <th className="py-2 px-2 text-left">Subject</th>
                  <th className="py-2 px-2 text-center">Total Count</th>
                  <th className="py-2 px-2 text-center">Attempts</th>
                  <th className="py-2 px-2 text-center">Correct</th>
                  <th className="py-2 px-2 text-center">Incorrect</th>
                  <th className="py-2 px-2 text-center">Accuracy</th>
                  <th className="py-2 px-2 text-center">View</th>
                </tr>
              </thead>
            </table>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm whitespace-nowrap">
                <tbody>
                  {questionsToShow.map(q => {
                    const stats = getSectionStats(q);
                    return (
                      <tr key={q.id} className="border-b hover:bg-blue-50 transition">
                        <td className="py-2 px-2">{q.number}</td>
                        <td className="py-2 px-2">{q.subject}</td>
                        <td className="py-2 px-2 text-center">{stats.count}</td>
                        <td className="py-2 px-2 text-center">{stats.attempts}</td>
                        <td className="py-2 px-2 text-center">{stats.correct}</td>
                        <td className="py-2 px-2 text-center">{stats.incorrect}</td>
                        <td className="py-2 px-2 text-center">{getAccuracyBadge(stats.accuracy)}</td>
                        <td className="py-2 px-2 text-center">
                          <button className="text-blue-600 hover:underline flex items-center gap-1" onClick={() => setViewModalQuestion(q)}>
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
