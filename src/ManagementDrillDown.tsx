import React, { useState, useMemo } from "react";

// Dummy Data
const TESTS = ["Unit Test 1", "Unit Test 2", "Midterm", "Final"];
const CLASSES = ["11", "12"];
const SECTIONS = ["Regular", "Repeaters", "Re-Repeaters"];
const SUBJECTS = ["Physics", "Chemistry", "Biology"];
const TOPICS = ["Mechanics", "Thermodynamics", "Genetics", "Organic Chemistry"];
const TEACHERS = ["Dr. Rao", "Ms. Sharma", "Mr. Singh", "Ms. Patel"];

const PERFORMANCE_DATA = [
  {
    subject: "Physics",
    topic: "Mechanics",
    avgScore: 48,
    weaknessIndex: 0.8,
    teacher: "Dr. Rao",
    section: "Regular",
    class: "11",
    test: "Unit Test 1",
    questions: [
      { id: "Q101", accuracy: 35, attempts: 120 },
      { id: "Q102", accuracy: 42, attempts: 110 },
    ],
    remediation: "Focus on Newton's Laws and problem-solving drills."
  },
  {
    subject: "Chemistry",
    topic: "Organic Chemistry",
    avgScore: 77,
    weaknessIndex: 0.2,
    teacher: "Ms. Sharma",
    section: "Repeaters",
    class: "12",
    test: "Final",
    questions: [
      { id: "Q201", accuracy: 80, attempts: 90 },
      { id: "Q202", accuracy: 75, attempts: 85 },
    ],
    remediation: "Revise reaction mechanisms and practice MCQs."
  },
  {
    subject: "Biology",
    topic: "Genetics",
    avgScore: 62,
    weaknessIndex: 0.5,
    teacher: "Mr. Singh",
    section: "Re-Repeaters",
    class: "11",
    test: "Midterm",
    questions: [
      { id: "Q301", accuracy: 60, attempts: 100 },
      { id: "Q302", accuracy: 65, attempts: 95 },
    ],
    remediation: "Emphasize Mendelian genetics and Punnett squares."
  },
  {
    subject: "Physics",
    topic: "Thermodynamics",
    avgScore: 82,
    weaknessIndex: 0.1,
    teacher: "Ms. Patel",
    section: "Regular",
    class: "12",
    test: "Unit Test 2",
    questions: [
      { id: "Q401", accuracy: 85, attempts: 105 },
      { id: "Q402", accuracy: 80, attempts: 100 },
    ],
    remediation: "Continue with advanced problem sets."
  },
];

function getBadgeColor(score: number) {
  if (score > 75) return "bg-green-100 text-green-700";
  if (score >= 50) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-700";
}

function getWeaknessLabel(score: number) {
  if (score > 75) return "Low";
  if (score >= 50) return "Medium";
  return "High";
}

const ManagementDrilldownPage: React.FC = () => {
  // Filter states
  const [test, setTest] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [sortKey, setSortKey] = useState("avgScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRow, setModalRow] = useState<any>(null);

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let data = [...PERFORMANCE_DATA];
    if (test) data = data.filter(d => d.test === test);
    if (className) data = data.filter(d => d.class === className);
    if (section) data = data.filter(d => d.section === section);
    if (subject) data = data.filter(d => d.subject === subject);
    if (topic) data = data.filter(d => d.topic === topic);
    data.sort((a, b) => {
      let valA, valB;
      if (sortKey === "avgScore") {
        valA = a.avgScore;
        valB = b.avgScore;
      } else if (sortKey === "weaknessIndex") {
        valA = a.weaknessIndex;
        valB = b.weaknessIndex;
      } else if (sortKey === "teacher") {
        valA = a.teacher.toLowerCase();
        valB = b.teacher.toLowerCase();
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [test, className, section, subject, topic, sortKey, sortDir]);

  // Modal handler
  const openModal = (row: any) => {
    setModalRow(row);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalRow(null);
  };

  // Sorting handler
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-10 bg-white shadow rounded-xl p-4 flex flex-wrap gap-3 items-center mb-6">
        <select className="border rounded px-3 py-2 text-sm" value={test} onChange={e => setTest(e.target.value)}>
          <option value="">Test Name</option>
          {TESTS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="border rounded px-3 py-2 text-sm" value={className} onChange={e => setClassName(e.target.value)}>
          <option value="">Class</option>
          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="border rounded px-3 py-2 text-sm" value={section} onChange={e => setSection(e.target.value)}>
          <option value="">Section</option>
          {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border rounded px-3 py-2 text-sm" value={subject} onChange={e => setSubject(e.target.value)}>
          <option value="">Subject</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border rounded px-3 py-2 text-sm" value={topic} onChange={e => setTopic(e.target.value)}>
          <option value="">Topic</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="ml-auto bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 text-sm">Search</button>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-end gap-2 mb-2">
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded shadow text-xs">CSV Download</button>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded shadow text-xs">PDF Export</button>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded shadow text-xs">Print View</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-2 text-left">Subject</th>
              <th className="py-2 px-2 text-left">Topic</th>
              <th className="py-2 px-2 text-center cursor-pointer" onClick={() => handleSort("avgScore")}>Avg. Score (%) {sortKey === "avgScore" && (sortDir === "asc" ? "▲" : "▼")}</th>
              <th className="py-2 px-2 text-center cursor-pointer" onClick={() => handleSort("weaknessIndex")}>Weakness Index {sortKey === "weaknessIndex" && (sortDir === "asc" ? "▲" : "▼")}</th>
              <th className="py-2 px-2 text-center cursor-pointer" onClick={() => handleSort("teacher")}>Teacher Assigned {sortKey === "teacher" && (sortDir === "asc" ? "▲" : "▼")}</th>
              <th className="py-2 px-2 text-center">Section</th>
              <th className="py-2 px-2 text-center">Re-teach Flag</th>
              <th className="py-2 px-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 && (
              <tr><td colSpan={8} className="text-center text-gray-400 py-4">No data</td></tr>
            )}
            {filteredData.map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-blue-50 transition">
                <td className="py-2 px-2 font-medium">{row.subject}</td>
                <td className="py-2 px-2">{row.topic}</td>
                <td className="py-2 px-2 text-center">
                  <span className={`px-2 py-1 rounded font-semibold text-xs ${getBadgeColor(row.avgScore)}`}>{row.avgScore}%</span>
                </td>
                <td className="py-2 px-2 text-center">
                  <span className={`px-2 py-1 rounded font-semibold text-xs ${getBadgeColor(row.avgScore)}`}>{getWeaknessLabel(row.avgScore)}</span>
                </td>
                <td className="py-2 px-2 text-center">{row.teacher}</td>
                <td className="py-2 px-2 text-center">{row.section}</td>
                <td className="py-2 px-2 text-center">
                  {row.avgScore < 50 ? <span className="text-green-600 font-bold">✅</span> : <span className="text-gray-400">—</span>}
                </td>
                <td className="py-2 px-2 text-center">
                  <button onClick={() => openModal(row)} className="text-blue-600 hover:text-blue-800 text-lg" title="Drilldown"><span role="img" aria-label="Drilldown">🔍</span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal/Drawer */}
      {modalOpen && modalRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative animate-fadeIn flex flex-col max-h-[95vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={closeModal}>×</button>
            <h2 className="font-bold text-lg mb-2">Drilldown: {modalRow.subject} - {modalRow.topic}</h2>
            <div className="mb-3">
              <span className="font-semibold">Teacher:</span> {modalRow.teacher}<br />
              <span className="font-semibold">Section:</span> {modalRow.section}<br />
              <span className="font-semibold">Test:</span> {modalRow.test}<br />
              <span className="font-semibold">Class:</span> {modalRow.class}
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mb-1">Linked Questions</h3>
              <table className="w-full text-xs mb-2">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-1 px-1 text-left">ID</th>
                    <th className="py-1 px-1 text-center">Accuracy (%)</th>
                    <th className="py-1 px-1 text-center">Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {modalRow.questions.map((q: any, i: number) => (
                    <tr key={i} className="border-b">
                      <td className="py-1 px-1">{q.id}</td>
                      <td className="py-1 px-1 text-center">{q.accuracy}</td>
                      <td className="py-1 px-1 text-center">{q.attempts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mb-2">
                <span className="font-semibold">Suggested Remediation:</span>
                <div className="bg-blue-50 rounded p-2 mt-1 text-xs">{modalRow.remediation}</div>
              </div>
              <button className="bg-green-600 text-white px-3 py-1 rounded shadow hover:bg-green-700 text-xs">Assign Instruction Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementDrilldownPage;
