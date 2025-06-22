import React, { useState, useMemo } from "react";
import { Download, FileText, ChevronDown, Eye, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

// --------------------
// NEET Topics & Subjects
// --------------------

const NEET_SUBJECTS = ["Physics", "Chemistry", "Biology"];
const CLASSES = ["Overall Class", "11A", "11B", "11C", "11D", "11E"];
const TESTS = ["Unit Test 1", "Unit Test 2", "Midterm", "Final"];

// --------------------
// Types
// --------------------
type Option = { option: string; count: number };
type Question = {
	id: number;
	number: number;
	subject: string;
	topic: string;
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

// --------------------
// Generate 180 Dummy Questions
// --------------------
function getRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
const QUESTIONS: Question[] = Array.from({ length: 180 }, (_, i) => {
	const subject = getRandom(NEET_SUBJECTS);
	let topic = "";
	if (subject === "Physics") topic = getRandom(["Mechanics", "Thermodynamics", "Optics", "Electrodynamics", "Modern Physics"]);
	if (subject === "Chemistry") topic = getRandom(["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry"]);
	if (subject === "Biology") topic = getRandom([
		"Diversity in Living World", "Structural Organisation in Animals and Plants", "Cell Structure and Function", "Plant Physiology", "Human Physiology", "Reproduction", "Genetics and Evolution", "Biology and Human Welfare", "Biotechnology", "Ecology and Environment"
	]);
	return {
		id: i + 1,
		number: i + 1,
		subject,
		topic,
		text: `Sample NEET Question ${i + 1} (${subject} - ${topic})?`,
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
function QuestionViewModal({ open, onClose, question }: { open: boolean; onClose: () => void; question: Question | null }) {
	if (!open || !question) return null;
	const perfData = [
		{ name: "Correct", value: question.correct, fill: "#22c55e" },
		{ name: "Incorrect", value: question.incorrect, fill: "#ef4444" },
		{ name: "Unattempted", value: Math.max(0, question.attempts - question.correct - question.incorrect), fill: "#a3a3a3" },
	];
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative animate-fadeIn overflow-x-auto">
				<button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>
					<X className="w-5 h-5" />
				</button>
				<div className="flex flex-col gap-4 min-w-[700px]">
					<div className="flex gap-4 items-center">
						<span className="font-bold text-lg">Q{question.number}:</span>
						<span className="text-base font-medium whitespace-nowrap overflow-x-auto max-w-[600px]">{question.text}</span>
					</div>
					<div className="flex gap-4 items-center">
						<span className="font-semibold">Options:</span>
						<div className="flex gap-2">
							{question.options.map((opt) => (
								<span key={opt.option} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs font-mono border border-gray-200">{opt.option}</span>
							))}
						</div>
						<span className="ml-4 font-semibold text-green-700">Correct: {question.correctAnswer}</span>
					</div>
					<div className="flex gap-6 items-center mt-2">
						<span className="text-sm">Attempts: <b>{question.attempts}</b></span>
						<span className="text-sm">Correct: <b>{question.correct}</b></span>
						<span className="text-sm">Incorrect: <b>{question.incorrect}</b></span>
						<span className="text-sm">Accuracy: {getAccuracyBadge(question.accuracy)}</span>
						<span className="text-sm">Difficulty: <b>{question.difficulty}</b></span>
						<span className="text-sm">Subject: <b>{question.subject}</b></span>
						<span className="text-sm">Topic: <b>{question.topic}</b></span>
					</div>
					<div className="w-full mt-4 flex flex-col md:flex-row gap-6 items-center">
						<div className="flex-1">
							<span className="font-semibold">Performance:</span>
							<ResponsiveContainer width="100%" height={180}>
								<BarChart data={perfData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
									<XAxis type="number" hide />
									<YAxis dataKey="name" type="category" width={80} />
									<Tooltip />
									<Bar dataKey="value">
										{perfData.map((d, idx) => (
											<Cell key={d.name} fill={d.fill} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
						<div className="flex-1">
							<span className="font-semibold">Accuracy Pie:</span>
							<ResponsiveContainer width="100%" height={180}>
								<PieChart>
									<Pie data={perfData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
										{perfData.map((entry, idx) => (
											<Cell key={entry.name} fill={entry.fill} />
										))}
									</Pie>
									<Legend />
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
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
const IndividualQuestions: React.FC = () => {
	// Top bar filters
	const [selectedClass, setSelectedClass] = useState<string>(CLASSES[0]);
	const [selectedTest, setSelectedTest] = useState<string>("");
	const [selectedSubject, setSelectedSubject] = useState<string>("");
	const [selectedTopic, setSelectedTopic] = useState<string>("");
	const [viewModalQuestion, setViewModalQuestion] = useState<Question | null>(null);

	// Dummy handlers for download
	const handleDownload = (type: string) => {
		alert(`Download as ${type} (dummy)`);
	};

	// Unique topics from data (filtered by class/test/subject)
	const dynamicTopics = useMemo(() => {
		return Array.from(new Set(
			QUESTIONS.filter(q =>
				(selectedClass === "Overall Class" || q.class === selectedClass) &&
				(!selectedTest || q.test === selectedTest) &&
				(!selectedSubject || q.subject === selectedSubject)
			).map(q => q.topic)
		)).sort();
	}, [selectedClass, selectedTest, selectedSubject]);

	// Filtered questions
	const questionsToShow = useMemo(() => {
		return QUESTIONS.filter(q =>
			(selectedClass === "Overall Class" || q.class === selectedClass) &&
			(!selectedTest || q.test === selectedTest) &&
			(!selectedSubject || q.subject === selectedSubject) &&
			(!selectedTopic || q.topic === selectedTopic)
		);
	}, [selectedClass, selectedTest, selectedSubject, selectedTopic]);

	return (
		<div className="min-h-screen bg-gray-50 pb-8">
			{/* Top Bar Filters */}
			<div className="sticky top-0 z-30 bg-white shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-3 border-b">
				<div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
					{/* Class Dropdown */}
					<div className="relative">
						<select className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
							{CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
						</select>
						<ChevronDown className="absolute right-2 top-2 w-4 h-4 pointer-events-none text-gray-400" />
					</div>
					{/* Test Dropdown */}
					<div className="relative">
						<select className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={selectedTest} onChange={e => setSelectedTest(e.target.value)}>
							<option value="">All Tests</option>
							{TESTS.map(test => <option key={test} value={test}>{test}</option>)}
						</select>
						<ChevronDown className="absolute right-2 top-2 w-4 h-4 pointer-events-none text-gray-400" />
					</div>
					{/* Subject Dropdown */}
					<div className="relative">
						<select className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
							<option value="">All Subjects</option>
							{NEET_SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
						</select>
						<ChevronDown className="absolute right-2 top-2 w-4 h-4 pointer-events-none text-gray-400" />
					</div>
					{/* Topic Dropdown */}
					<div className="relative">
						<select className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}>
							<option value="">All Topics</option>
							{dynamicTopics.map(t => <option key={t} value={t}>{t}</option>)}
						</select>
						<ChevronDown className="absolute right-2 top-2 w-4 h-4 pointer-events-none text-gray-400" />
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
									<th className="py-2 px-2 text-left">Topic</th>
									<th className="py-2 px-2 text-center">Attempts</th>
									<th className="py-2 px-2 text-center">Correct</th>
									<th className="py-2 px-2 text-center">Incorrect</th>
									<th className="py-2 px-2 text-center">Accuracy</th>
									<th className="py-2 px-2 text-center">Difficulty</th>
									<th className="py-2 px-2 text-center">View</th>
								</tr>
							</thead>
							<tbody>
								{questionsToShow.map(q => (
									<tr key={q.id} className="border-b hover:bg-blue-50 transition">
										<td className="py-2 px-2">{q.number}</td>
										<td className="py-2 px-2">{q.subject}</td>
										<td className="py-2 px-2">{q.topic}</td>
										<td className="py-2 px-2 text-center">{q.attempts}</td>
										<td className="py-2 px-2 text-center">{q.correct}</td>
										<td className="py-2 px-2 text-center">{q.incorrect}</td>
										<td className="py-2 px-2 text-center">{getAccuracyBadge(q.accuracy)}</td>
										<td className="py-2 px-2 text-center">{q.difficulty}</td>
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
			<QuestionViewModal open={!!viewModalQuestion} onClose={() => setViewModalQuestion(null)} question={viewModalQuestion} />
		</div>
	);
};

export default IndividualQuestions;
