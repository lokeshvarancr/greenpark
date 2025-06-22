import React, { useState, useMemo } from "react";
import { Download, Eye } from "lucide-react";

// Dummy Data
const TESTS = ["Unit Test 1", "Unit Test 2", "Midterm", "Final"];
const SUBJECTS = ["Physics", "Chemistry", "Biology"];
const SECTIONS = ["11A", "11B", "11C", "11D", "11E"];
const NEET_TOPICS = [
  "Mechanics", "Thermodynamics", "Optics", "Electrodynamics", "Modern Physics",
  "Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry",
  "Diversity in Living World", "Structural Organisation in Animals and Plants", "Cell Structure and Function", "Plant Physiology", "Human Physiology", "Reproduction", "Genetics and Evolution", "Biology and Human Welfare", "Biotechnology", "Ecology and Environment"
];
const SUBTOPICS: Record<string, string[]> = {
  Mechanics: ["Kinematics", "Dynamics"],
  "Organic Chemistry": ["Hydrocarbons", "Alcohols"],
  Genetics: ["Mendelian Genetics", "Molecular Genetics"],
};

type Student = {
  name: string;
  marks: number;
  section: string;
  subject: string;
  topic: string;
  subtopic?: string;
  accuracy: number;
  incorrect: number;
};

const STUDENTS: Student[] = [
  { name: "Aarav Mehta", marks: 95, section: "11A", subject: "Physics", topic: "Mechanics", subtopic: "Kinematics", accuracy: 98, incorrect: 1 },
  { name: "Priya Sharma", marks: 92, section: "11B", subject: "Chemistry", topic: "Organic Chemistry", subtopic: "Hydrocarbons", accuracy: 95, incorrect: 2 },
  { name: "Rohan Patel", marks: 38, section: "11C", subject: "Biology", topic: "Genetics", subtopic: "Mendelian Genetics", accuracy: 35, incorrect: 8 },
  { name: "Simran Kaur", marks: 36, section: "11A", subject: "Physics", topic: "Optics", accuracy: 39, incorrect: 7 },
  { name: "Ishaan Gupta", marks: 91, section: "11D", subject: "Biology", topic: "Ecology", accuracy: 92, incorrect: 1 },
  { name: "Neha Verma", marks: 39, section: "11B", subject: "Chemistry", topic: "Inorganic Chemistry", accuracy: 37, incorrect: 9 },
  { name: "Rahul Singh", marks: 93, section: "11E", subject: "Physics", topic: "Thermodynamics", accuracy: 96, incorrect: 1 },
  { name: "Aditi Rao", marks: 37, section: "11C", subject: "Biology", topic: "Plant Physiology", accuracy: 38, incorrect: 6 },
  // ...more dummy students
];

// Modal for combined performance visualization
function CombinedVisualModal({ open, onClose, topic, subtopic, subject, test, students }: {
  open: boolean;
  onClose: () => void;
  topic: string;
  subtopic: string;
  subject: string;
  test: string;
  students: Student[];
}) {
  if (!open) return null;
  // High: >=75% accuracy, Low: <40% accuracy
  const high = students.filter(s => s.accuracy >= 75);
  const low = students.filter(s => s.accuracy < 40);
  // Group by section for bar chart
  const sectionSet = new Set(students.map(s => s.section));
  const sections = Array.from(sectionSet).sort();
  const highBySection = sections.map(sec => high.filter(s => s.section === sec).length);
  const lowBySection = sections.map(sec => low.filter(s => s.section === sec).length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6 relative animate-fadeIn flex flex-col max-h-[95vh] overflow-y-auto">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>×</button>
        {/* Header */}
        <div className="flex flex-wrap gap-3 mb-4 items-center border-b pb-3">
          <span className="font-bold text-lg">{topic}</span>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">Subtopic: {subtopic || '-'}</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">Subject: {subject || 'All'}</span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Test: {test || 'All'}</span>
        </div>
        {/* Mid Section: Student Lists */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1 min-w-[220px] max-h-64 overflow-y-auto bg-blue-50 rounded-lg p-3">
            <h3 className="font-semibold text-blue-700 mb-2">High Performers (≥75%)</h3>
            <ul>
              {high.length === 0 && <li className="text-center text-gray-400 py-4">No data</li>}
              {high.map((s, idx) => (
                <li key={idx} className="flex items-center justify-between border-b py-2">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-gray-500">{s.section}</span>
                  <span className="text-xs text-gray-600">Score: {s.marks}</span>
                  <span className="text-xs text-gray-600">Accuracy: {s.accuracy}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 min-w-[220px] max-h-64 overflow-y-auto bg-red-50 rounded-lg p-3">
            <h3 className="font-semibold text-red-700 mb-2">Low Performers (&lt;40%)</h3>
            <ul>
              {low.length === 0 && <li className="text-center text-gray-400 py-4">No data</li>}
              {low.map((s, idx) => (
                <li key={idx} className="flex items-center justify-between border-b py-2">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-gray-500">{s.section}</span>
                  <span className="text-xs text-gray-600">Score: {s.marks}</span>
                  <span className="text-xs text-gray-600">Accuracy: {s.accuracy}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Bottom Section: Combined Visual */}
        <div className="w-full overflow-x-auto mt-2">
          <h4 className="font-semibold mb-2">High vs Low Distribution by Section</h4>
          <div className="flex gap-2 min-w-[400px]">
            {sections.map((sec, idx) => (
              <div key={sec} className="flex flex-col items-center w-16">
                <div className="flex flex-col-reverse h-32 w-8 relative">
                  <div className="bg-green-400 rounded-t" style={{ height: `${highBySection[idx] * 18}px` }} title={`High: ${highBySection[idx]}`}></div>
                  <div className="bg-red-400 rounded-t absolute bottom-0 left-0 w-8" style={{ height: `${lowBySection[idx] * 18}px`, opacity: 0.7 }} title={`Low: ${lowBySection[idx]}`}></div>
                </div>
                <span className="text-xs mt-1">{sec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const HighLowPerformers: React.FC = () => {
  // Performance Overview filters
  const [perfTest, setPerfTest] = useState<string>("");
  const [perfSubject, setPerfSubject] = useState<string>("");
  const [perfSection, setPerfSection] = useState<string>("");
  const [perfLimit, setPerfLimit] = useState<number>(20);

  // Areas Needing Improvement filters
  const [aniTest, setAniTest] = useState<string>("");
  const [aniSubject, setAniSubject] = useState<string>("");
  const [aniTopic, setAniTopic] = useState<string>("");
  const [aniSection, setAniSection] = useState<string>(""); // NEW: Section filter

  // Modal state
  const [visualOpen, setVisualOpen] = useState(false);
  const [visualTopic, setVisualTopic] = useState("");
  const [visualSubtopic, setVisualSubtopic] = useState("");
  const [visualSubject, setVisualSubject] = useState("");
  const [visualTest, setVisualTest] = useState("");
  const [visualStudents, setVisualStudents] = useState<Student[]>([]);

  // Filtered lists for Performance Overview
  const highList = useMemo(() => {
    let filtered = STUDENTS.filter(s => s.marks >= 90);
    if (perfTest) filtered = filtered.filter(s => s.topic && perfTest ? s.topic : true);
    if (perfSubject) filtered = filtered.filter(s => s.subject === perfSubject);
    if (perfSection) filtered = filtered.filter(s => s.section === perfSection);
    return filtered.slice(0, perfLimit);
  }, [perfTest, perfSubject, perfSection, perfLimit]);

  const lowList = useMemo(() => {
    let filtered = STUDENTS.filter(s => s.accuracy < 40);
    if (perfTest) filtered = filtered.filter(s => s.topic && perfTest ? s.topic : true);
    if (perfSubject) filtered = filtered.filter(s => s.subject === perfSubject);
    if (perfSection) filtered = filtered.filter(s => s.section === perfSection);
    return filtered.slice(0, perfLimit);
  }, [perfTest, perfSubject, perfSection, perfLimit]);

  // Areas Needing Improvement Table Data
  const aniTableData = useMemo(() => {
    // Group by topic and subtopic
    const result: Array<{ topic: string; subtopic: string; high: number; low: number; attempted: number }> = [];
    const topics = aniTopic ? [aniTopic] : NEET_TOPICS;
    topics.forEach(topic => {
      const subtopics = SUBTOPICS[topic] || [""];
      subtopics.forEach(subtopic => {
        let students = STUDENTS.filter(s => s.topic === topic && (!subtopic || s.subtopic === subtopic));
        if (aniTest) students = students.filter(s => s.topic && aniTest ? s.topic : true);
        if (aniSubject) students = students.filter(s => s.subject === aniSubject);
        if (aniSection) students = students.filter(s => s.section === aniSection);
        const high = students.filter(s => s.accuracy >= 75).length;
        const low = students.filter(s => s.accuracy < 40).length;
        const attempted = students.length;
        result.push({ topic, subtopic, high, low, attempted });
      });
    });
    return result;
  }, [aniTest, aniSubject, aniTopic, aniSection]);

  // Modal handler
  const handleVisual = (topic: string, subtopic: string) => {
    let students = STUDENTS.filter(s => s.topic === topic && (!subtopic || s.subtopic === subtopic));
    if (aniTest) students = students.filter(s => s.topic && aniTest ? s.topic : true);
    if (aniSubject) students = students.filter(s => s.subject === aniSubject);
    if (aniSection) students = students.filter(s => s.section === aniSection);
    setVisualTopic(topic);
    setVisualSubtopic(subtopic);
    setVisualSubject(aniSubject);
    setVisualTest(aniTest);
    setVisualStudents(students);
    setVisualOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Performance Overview Section */}
      <div className="w-full max-w-6xl mx-auto mt-8 mb-8">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-bold mb-4">Performance Overview</h2>
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <div className="relative">
              <select className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={perfTest} onChange={e => setPerfTest(e.target.value)}>
                <option value="">All Tests</option>
                {TESTS.map(test => <option key={test} value={test}>{test}</option>)}
              </select>
            </div>
            <div className="relative">
              <select className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={perfSubject} onChange={e => setPerfSubject(e.target.value)}>
                <option value="">All Subjects</option>
                {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
            <div className="relative">
              <select className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={perfSection} onChange={e => setPerfSection(e.target.value)}>
                <option value="">All Sections</option>
                {SECTIONS.map(sec => <option key={sec} value={sec}>{sec}</option>)}
              </select>
            </div>
            <div className="relative">
              <select className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={perfLimit} onChange={e => setPerfLimit(Number(e.target.value))}>
                {[20, 50, 100].map(n => <option key={n} value={n}>{n} Students</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            {/* High Performers */}
            <div className="flex-1 bg-blue-50 rounded-lg p-4 shadow max-h-96 overflow-y-auto">
              <h3 className="font-semibold text-blue-700 mb-2">High Performers</h3>
              <ul>
                {highList.length === 0 && <li className="text-center text-gray-400 py-4">No data</li>}
                {highList.map((s, idx) => (
                  <li key={idx} className="flex items-center justify-between border-b py-2">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-gray-500">{s.section}</span>
                    <span className="text-xs text-gray-600">Score: {s.marks}</span>
                    <span className="text-xs text-gray-600">Accuracy: {s.accuracy}%</span>
                    <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold ml-2">High</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Low Performers */}
            <div className="flex-1 bg-red-50 rounded-lg p-4 shadow max-h-96 overflow-y-auto">
              <h3 className="font-semibold text-red-700 mb-2">Low Performers</h3>
              <ul>
                {lowList.length === 0 && <li className="text-center text-gray-400 py-4">No data</li>}
                {lowList.map((s, idx) => (
                  <li key={idx} className="flex items-center justify-between border-b py-2">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-gray-500">{s.section}</span>
                    <span className="text-xs text-gray-600">Score: {s.marks}</span>
                    <span className="text-xs text-gray-600">Accuracy: {s.accuracy}%</span>
                    <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold ml-2">Low</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Areas Needing Improvement Section */}
      <div className="w-full max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
          <h2 className="text-lg font-bold mb-4">Areas Needing Improvement</h2>
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <div className="relative">
              <select className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={aniTest} onChange={e => setAniTest(e.target.value)}>
                <option value="">All Tests</option>
                {TESTS.map(test => <option key={test} value={test}>{test}</option>)}
              </select>
            </div>
            <div className="relative">
              <select className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={aniSubject} onChange={e => setAniSubject(e.target.value)}>
                <option value="">All Subjects</option>
                {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
            <div className="relative">
              <select className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={aniSection} onChange={e => setAniSection(e.target.value)}>
                <option value="">All Sections</option>
                {SECTIONS.map(sec => <option key={sec} value={sec}>{sec}</option>)}
              </select>
            </div>
            <div className="relative">
              <select className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" value={aniTopic} onChange={e => setAniTopic(e.target.value)}>
                <option value="">All Topics</option>
                {NEET_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-2 text-left">Topic</th>
                  <th className="py-2 px-2 text-left">Subtopic</th>
                  <th className="py-2 px-2 text-center">High Performer Count</th>
                  <th className="py-2 px-2 text-center">Low Performer Count</th>
                  <th className="py-2 px-2 text-center">High %</th>
                  <th className="py-2 px-2 text-center">Low %</th>
                  <th className="py-2 px-2 text-center">Visual</th>
                </tr>
              </thead>
              <tbody>
                {aniTableData.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-gray-400 py-4">No data</td></tr>
                )}
                {aniTableData.map((row, idx) => {
                  const highPct = row.attempted ? Math.round((row.high / row.attempted) * 100) : 0;
                  const lowPct = row.attempted ? Math.round((row.low / row.attempted) * 100) : 0;
                  return (
                    <tr key={idx} className="border-b hover:bg-blue-50 transition">
                      <td className="py-2 px-2 font-medium">{row.topic}</td>
                      <td className="py-2 px-2">{row.subtopic || <span className="text-gray-400 italic">-</span>}</td>
                      <td className="py-2 px-2 text-center">{row.high}</td>
                      <td className="py-2 px-2 text-center">{row.low}</td>
                      <td className="py-2 px-2 text-center">{highPct}%</td>
                      <td className="py-2 px-2 text-center">{lowPct}%</td>
                      <td className="py-2 px-2 text-center">
                        <button onClick={() => handleVisual(row.topic, row.subtopic)}>
                          <Eye className="w-5 h-5 text-blue-600 hover:text-blue-800" />
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

      {/* Combined Visual Modal */}
      <CombinedVisualModal open={visualOpen} onClose={() => setVisualOpen(false)} topic={visualTopic} subtopic={visualSubtopic} subject={visualSubject} test={visualTest} students={visualStudents} />
    </div>
  );
};

export default HighLowPerformers;
