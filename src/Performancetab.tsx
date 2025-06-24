import React, { useState, useMemo } from "react";
import FilterRow from "@/components/ui/FilterRow";
import { format, subDays } from "date-fns";

// Dummy Data
const TESTS = ["Unit Test 1", "Unit Test 2", "Midterm", "Final"];
const SUBJECTS = ["Physics", "Chemistry", "Biology"];
const SECTIONS = ["11A", "11B", "11C", "11D", "11E"];

type Student = {
  name: string;
  marks: number;
  section: string;
  subject: string;
  accuracy: number;
  incorrect: number;
};

const STUDENTS: Student[] = [
  { name: "Aarav Mehta", marks: 95, section: "11A", subject: "Physics", accuracy: 98, incorrect: 1 },
  { name: "Priya Sharma", marks: 92, section: "11B", subject: "Chemistry", accuracy: 95, incorrect: 2 },
  { name: "Rohan Patel", marks: 38, section: "11C", subject: "Biology", accuracy: 35, incorrect: 8 },
  { name: "Simran Kaur", marks: 36, section: "11A", subject: "Physics", accuracy: 39, incorrect: 7 },
  { name: "Ishaan Gupta", marks: 91, section: "11D", subject: "Biology", accuracy: 92, incorrect: 1 },
  { name: "Neha Verma", marks: 39, section: "11B", subject: "Chemistry", accuracy: 37, incorrect: 9 },
  { name: "Rahul Singh", marks: 93, section: "11E", subject: "Physics", accuracy: 96, incorrect: 1 },
  { name: "Aditi Rao", marks: 37, section: "11C", subject: "Biology", accuracy: 38, incorrect: 6 },
  // ...more dummy students
];

const HighLowPerformers: React.FC = () => {
  // Performance Overview filters
  const [perfTest, setPerfTest] = useState<string>("");
  const [perfSubject, setPerfSubject] = useState<string>("");
  const [perfSection, setPerfSection] = useState<string>("");
  const [perfLimit, setPerfLimit] = useState<number>(20);
  // Modal state (unused for this dashboard)
  // Date range and pagination
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Simulate global filter state (Institution, Batch, etc.)
  // For now, only class, subject, and date are used, as dummy data lacks institution/batch

  // Filter students by all global filters
  const filteredStudents = useMemo(() => {
    let filtered = STUDENTS;
    if (perfSection) filtered = filtered.filter(s => s.section === perfSection);
    if (perfSubject) filtered = filtered.filter(s => s.subject === perfSubject);
    // Date range filter would go here if data had dates
    return filtered;
  }, [perfSection, perfSubject, dateRange]);

  // Metric calculations
  const avgScore = filteredStudents.length ? (filteredStudents.reduce((a, b) => a + b.marks, 0) / filteredStudents.length).toFixed(1) : "-";
  const avgAccuracy = filteredStudents.length ? (filteredStudents.reduce((a, b) => a + b.accuracy, 0) / filteredStudents.length).toFixed(1) : "-";
  const avgAttempt = filteredStudents.length ? (filteredStudents.reduce((a, b) => a + (b.marks + b.incorrect), 0) / (filteredStudents.length * 100) * 100).toFixed(1) : "-";
  const sorted = [...filteredStudents].sort((a, b) => b.marks - a.marks);
  const top10 = sorted.slice(0, Math.ceil(filteredStudents.length * 0.1));
  const bottom10 = sorted.slice(-Math.ceil(filteredStudents.length * 0.1));
  const top10Avg = top10.length ? (top10.reduce((a, b) => a + b.marks, 0) / top10.length).toFixed(1) : "-";
  const bottom10Avg = bottom10.length ? (bottom10.reduce((a, b) => a + b.marks, 0) / bottom10.length).toFixed(1) : "-";

  // Attempt Rate vs Accuracy by Test (X-axis: TESTS)
  const testMetrics = TESTS.map(test => {
    const testStudents = filteredStudents.filter(s => s.subject === perfSubject || !perfSubject).filter(s => s.subject && test);
    // For demo, just use all filtered students (since no test info in dummy data)
    return {
      test,
      attempt: avgAttempt === "-" ? 0 : Number(avgAttempt),
      accuracy: avgAccuracy === "-" ? 0 : Number(avgAccuracy)
    };
  });

  // High performers: top 10 by score
  const highPerformers = sorted.slice(0, 10);
  const totalPages = Math.ceil(highPerformers.length / pageSize);
  const paged = highPerformers.slice((page-1)*pageSize, page*pageSize);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Filter Row */}
      <div className="w-full max-w-6xl mx-auto pt-8 pb-2">
        <FilterRow
          dateFrom={format(dateRange.from, "yyyy-MM-dd")}
          dateTo={format(dateRange.to, "yyyy-MM-dd")}
          onDateFromChange={val => setDateRange(r => ({ ...r, from: new Date(val) }))}
          onDateToChange={val => setDateRange(r => ({ ...r, to: new Date(val) }))}
          institution={"All"}
          onInstitutionChange={() => {}}
          institutions={[]}
          batch={"All"}
          onBatchChange={() => {}}
          batches={[]}
          clazz={perfSection}
          onClassChange={setPerfSection}
          classes={SECTIONS}
          subject={perfSubject}
          onSubjectChange={setPerfSubject}
          subjects={SUBJECTS}
          examType="All"
          onExamTypeChange={() => {}}
        />
      </div>

      {/* Metric Cards */}
      <div className="w-full max-w-6xl mx-auto mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        <div className="rounded-xl shadow border p-6 flex flex-col items-center bg-white min-w-[150px]">
          <span className="text-3xl font-extrabold text-blue-700 mb-1">{avgScore}</span>
          <span className="text-sm font-semibold text-slate-600">Average Score</span>
        </div>
        <div className="rounded-xl shadow border p-6 flex flex-col items-center bg-white min-w-[150px]">
          <span className="text-3xl font-extrabold text-green-700 mb-1">{avgAccuracy}</span>
          <span className="text-sm font-semibold text-slate-600">Average Accuracy (%)</span>
        </div>
        <div className="rounded-xl shadow border p-6 flex flex-col items-center bg-white min-w-[150px]">
          <span className="text-3xl font-extrabold text-orange-600 mb-1">{avgAttempt}</span>
          <span className="text-sm font-semibold text-slate-600">Average Attempt Rate (%)</span>
        </div>
        <div className="rounded-xl shadow border p-6 flex flex-col items-center bg-white min-w-[150px]">
          <span className="text-3xl font-extrabold text-blue-900 mb-1">{top10Avg}</span>
          <span className="text-sm font-semibold text-slate-600">Top 10% Avg Score</span>
        </div>
        <div className="rounded-xl shadow border p-6 flex flex-col items-center bg-white min-w-[150px]">
          <span className="text-3xl font-extrabold text-red-700 mb-1">{bottom10Avg}</span>
          <span className="text-sm font-semibold text-slate-600">Bottom 10% Avg Score</span>
        </div>
      </div>

      {/* Attempt Rate vs Accuracy Graph + Histogram Row */}
      <div className="w-full max-w-6xl mx-auto mb-8 flex flex-col md:flex-row gap-8">
        {/* Attempt Rate vs Accuracy Graph */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center min-w-[320px]">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Attempt Rate vs Accuracy %</h3>
          <div className="relative w-full max-w-xl h-56">
            {/* Simple dual line chart, X: TESTS, Y: 0-100% */}
            <svg viewBox="0 0 320 180" width="100%" height="180" className="w-full h-44">
              {/* Y axis grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                <line key={i} x1="40" x2="300" y1={30 + v*120} y2={30 + v*120} stroke="#e5e7eb" strokeDasharray="2 2" strokeWidth="1" />
              ))}
              {/* Y axis labels */}
              {[0, 25, 50, 75, 100].map((v, i) => (
                <text key={i} x="20" y={150 - v*1.2 + 30} fontSize="13" fontWeight="bold" fill="#64748b" textAnchor="end">{v}%</text>
              ))}
              {/* X axis labels */}
              {testMetrics.map((tm, i) => (
                <text key={tm.test} x={60 + i*60} y={170} fontSize="15" fontWeight="bold" fill="#2563eb" textAnchor="middle">{tm.test}</text>
              ))}
              {/* Axis titles */}
              <text x="10" y="20" fontSize="13" fontWeight="bold" fill="#64748b" textAnchor="start">%</text>
              <text x="160" y="178" fontSize="13" fontWeight="bold" fill="#64748b" textAnchor="middle">Test</text>
              {/* Attempt Rate Line */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="3.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={testMetrics.map((tm, i) => `${60 + i*60},${150 - tm.attempt*1.2 + 30}`).join(' ')}
              />
              {/* Accuracy Line */}
              <polyline
                fill="none"
                stroke="#f59e42"
                strokeWidth="3.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={testMetrics.map((tm, i) => `${60 + i*60},${150 - tm.accuracy*1.2 + 30}`).join(' ')}
              />
              {/* Dots and tooltips */}
              {testMetrics.map((tm, i) => (
                <g key={tm.test}>
                  <circle
                    cx={60 + i*60}
                    cy={150 - tm.attempt*1.2 + 30}
                    r={7}
                    fill="#2563eb"
                  />
                  <circle
                    cx={60 + i*60}
                    cy={150 - tm.accuracy*1.2 + 30}
                    r={7}
                    fill="#f59e42"
                  />
                </g>
              ))}
            </svg>
            {/* Legend */}
            <div className="flex gap-8 mt-4 justify-center">
              <span className="flex items-center gap-2 text-base font-semibold"><span className="inline-block w-5 h-2 rounded bg-[#2563eb]" />Attempt Rate</span>
              <span className="flex items-center gap-2 text-base font-semibold"><span className="inline-block w-5 h-2 rounded bg-[#f59e42]" />Accuracy</span>
            </div>
          </div>
        </div>
        {/* HISTOGRAM BAR CHART */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center min-w-[320px]">
          <h3 className="text-lg font-bold mb-4 text-slate-800">
            {`Score Distribution — ${perfSubject ? perfSubject : 'All Subjects'}`}
          </h3>
          <HistogramChart students={filteredStudents} subject={perfSubject} />
        </div>
      </div>

      {/* High Performance Student List */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4">Top Performing Students</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[420px] w-full text-sm rounded-xl overflow-hidden border border-slate-100 mb-2">
            <thead>
              <tr className="bg-slate-50">
                <th className="py-3 px-4 font-bold text-slate-700 text-left">Name</th>
                <th className="py-3 px-4 font-bold text-slate-700 text-center">Class</th>
                <th className="py-3 px-4 font-bold text-slate-700 text-center">Score</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={3} className="text-center text-gray-400 py-4">No data</td></tr>
              )}
              {paged.map((s, idx) => (
                <tr key={s.name + s.section + s.subject} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="py-3 px-4 font-medium text-slate-900">{s.name}</td>
                  <td className="py-3 px-4 text-center">{s.section}</td>
                  <td className="py-3 px-4 text-center font-mono">{s.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex gap-2 justify-end items-center mt-2">
              <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-3 py-1 rounded bg-slate-100 text-slate-700 font-semibold disabled:opacity-50">Prev</button>
              <span className="text-sm font-semibold">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-3 py-1 rounded bg-slate-100 text-slate-700 font-semibold disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// HISTOGRAM COMPONENT
const HistogramChart: React.FC<{ students: Student[]; subject: string }> = ({ students, subject }) => {
  // Determine score range and buckets
  let maxScore = 720, bucketSize = 60, buckets = 12;
  if (subject && subject !== "") {
    maxScore = 180;
    bucketSize = 30;
    buckets = 6;
  }
  // Prepare scores
  let scores: number[] = [];
  if (!subject || subject === "") {
    // All Subjects: sum all subject scores per student
    // For demo, sum all available marks for each student (since dummy data is per subject)
    // In real data, would sum all subjects per student
    // Here, group by name and sum marks
    const nameMap: { [name: string]: number } = {};
    students.forEach(s => {
      nameMap[s.name] = (nameMap[s.name] || 0) + s.marks;
    });
    scores = Object.values(nameMap);
  } else {
    // Single subject: just use marks for that subject
    scores = students.filter(s => s.subject === subject).map(s => s.marks);
  }
  // Bucketize
  const bucketCounts = Array(buckets).fill(0);
  scores.forEach(score => {
    let idx = Math.floor(score / bucketSize);
    if (idx >= buckets) idx = buckets - 1;
    bucketCounts[idx]++;
  });
  // Tooltip state
  const [hoverIdx, setHoverIdx] = React.useState(-1);
  // Responsive SVG
  const chartW = 320, chartH = 180, barW = 32, gap = 12, baseY = 150, maxBarH = 120;
  const maxCount = Math.max(...bucketCounts, 1);
  return (
    <div className="w-full flex flex-col items-center">
      <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height="180" className="w-full h-44">
        {/* X axis labels and bars */}
        {bucketCounts.map((count, i) => {
          const x = 24 + i * (barW + gap);
          const h = (count / maxCount) * maxBarH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={baseY - h}
                width={barW}
                height={h}
                rx={8}
                fill={hoverIdx === i ? '#2563eb' : '#60a5fa'}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(-1)}
              />
              {/* X label */}
              <text x={x + barW/2} y={baseY + 18} fontSize="13" fontWeight="bold" fill="#64748b" textAnchor="middle">
                {i * bucketSize + 1}-{(i+1) * bucketSize}
              </text>
              {/* Tooltip */}
              {hoverIdx === i && (
                <foreignObject x={x - 20} y={baseY - h - 40} width="72" height="32">
                  <div className="pointer-events-none animate-fade-in rounded-xl shadow bg-white/95 border border-blue-100 px-3 py-1 text-xs text-blue-900 flex flex-col items-center min-w-[60px]">
                    <div className="font-bold text-base mb-1">{count}</div>
                    <div>students</div>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
        {/* Y axis label */}
        <text x="10" y="20" fontSize="13" fontWeight="bold" fill="#64748b" textAnchor="start">#</text>
      </svg>
    </div>
  );
};

export default HighLowPerformers;
