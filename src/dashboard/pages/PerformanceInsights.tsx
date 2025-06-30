import React, { useState, useMemo, useRef, useEffect } from "react";
import { allStudents, studentCounts } from "@/DummyData/PerformanceInsightsData";

// --- Filter Bar Constants ---
const TEST_TYPES = ["Weekly", "Cumulative", "Grand Test"] as const;
type TestType = (typeof TEST_TYPES)[number];
const INSTITUTIONS = ["North Campus", "South Campus", "East Campus", "West Campus"];
const MONTHS = [
  "June 2025", "July 2025", "August 2025", "September 2025", "October 2025", "November 2025",
  "December 2025", "January 2026", "February 2026", "March 2026", "April 2026", "May 2026"
];
const SECTIONS = ["11A", "11B", "12A", "12B"];

// --- Helpers ---
function getWeeksInMonth(month: string): string[] {
  const [monthName, yearStr] = month.split(" ");
  const monthIndex = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ].indexOf(monthName);
  const year = parseInt(yearStr, 10);
  if (monthIndex === -1) return [];
  const lastDay = new Date(year, monthIndex + 1, 0);
  const weeks: string[] = [];
  let week = 1;
  let day = 1;
  while (day <= lastDay.getDate()) {
    weeks.push(`Week ${week} ${monthName}`);
    const date = new Date(year, monthIndex, day);
    const daysToNextMonday = (8 - date.getDay()) % 7 || 7;
    day += daysToNextMonday;
    week++;
  }
  return weeks;
}

// --- Dropdown Components ---
const MultiCheckboxDropdown: React.FC<{
  options: string[];
  selected: string[];
  setSelected: (opts: string[]) => void;
  className?: string;
  selectAllLabel?: string;
}> = ({ options, selected, setSelected, className, selectAllLabel }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  const allSelected = selected.length === options.length;
  const toggleAll = () => setSelected(allSelected ? [] : [...options]);
  const toggleOption = (opt: string) =>
    setSelected(selected.includes(opt) ? selected.filter(o => o !== opt) : [...selected, opt]);
  useEffect(() => {
    if (selectAllLabel && selected.length === 0) setSelected([...options]);
    // eslint-disable-next-line
  }, [selected.length]);
  return (
    <div className={`relative min-w-[160px] ${className || ""}`} ref={ref}>
      <button
        type="button"
        className="w-full border rounded-lg px-4 py-2 text-sm bg-white shadow-sm flex items-center justify-between hover:border-blue-400 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => setOpen(v => !v)}
      >
        <span className="truncate text-left">
          {selected.length === options.length
            ? selectAllLabel || "All"
            : selected.length === 1
            ? selected[0]
            : `${selected.length} Selected`}
        </span>
        <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto flex flex-col gap-1 p-2 animate-fade-in"
          style={{ zIndex: 9999 }}>
          <label className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-100">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            <span className="text-sm font-medium">{selectAllLabel || "Select All"}</span>
          </label>
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-100">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggleOption(opt)} />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
const SingleSelectDropdown: React.FC<{
  options: string[];
  selected: string;
  setSelected: (opt: string) => void;
  className?: string;
}> = ({ options, selected, setSelected, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  return (
    <div className={`relative min-w-[160px] ${className || ""}`} ref={ref}>
      <button
        type="button"
        className="w-full border rounded-lg px-4 py-2 text-sm bg-white shadow-sm flex items-center justify-between hover:border-blue-400 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => setOpen(v => !v)}
      >
        <span className="truncate text-left">{selected}</span>
        <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto flex flex-col gap-1 p-2 animate-fade-in"
          style={{ zIndex: 9999 }}>
          {options.map(opt => (
            <button
              key={opt}
              className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm ${selected === opt ? "font-semibold text-blue-700" : ""}`}
              onClick={() => { setSelected(opt); setOpen(false); }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PerformanceInsights: React.FC = () => {
  // --- Filter Bar State ---
  const [testType, setTestType] = useState<TestType>("Weekly");
  const [institutions, setInstitutions] = useState([...INSTITUTIONS]);
  const [monthsState, setMonthsState] = useState([...MONTHS]);
  const [sectionsState, setSectionsState] = useState([...SECTIONS]);
  const [performerCount, setPerformerCount] = useState<number>(50);
  // Weekly
  const weekOptions = useMemo(() => {
    if (testType !== "Weekly") return [];
    return monthsState.flatMap(month => getWeeksInMonth(month));
  }, [testType, monthsState]);
  const [weeksState, setWeeksState] = useState<string[]>([]);
  useEffect(() => {
    if (testType === "Weekly") setWeeksState([...weekOptions]);
  }, [weekOptions.join(","), testType]);
  // Cumulative
  const cumulativeOptions = useMemo(() => {
    if (testType !== "Cumulative") return [];
    // Use the actual test names for Cumulative
    return [
      "Cumulative Test 1",
      "Cumulative Test 2",
      "Cumulative Test 3"
    ];
  }, [testType]);
  const [cumulativesState, setCumulativesState] = useState<string[]>([]);
  useEffect(() => {
    if (testType === "Cumulative") setCumulativesState([...cumulativeOptions]);
  }, [cumulativeOptions.join(","), testType]);
  // Section select-all fallback
  useEffect(() => {
    if (sectionsState.length === 0) setSectionsState([...SECTIONS]);
  }, [sectionsState.length]);

  // Filter students based on all filters (relaxed for week/test)
  const filteredStudents = useMemo(() =>
    allStudents.filter(s =>
      monthsState.includes(s.month) &&
      institutions.includes(s.campus) &&
      sectionsState.includes(s.section) &&
      s.testType === testType &&
      (
        (testType === "Weekly" ? (weeksState.length === 0 || weeksState.some(w => s.week && w.includes(s.week))) :
        testType === "Cumulative" ? (cumulativesState.length === 0 || cumulativesState.includes(s.test)) :
        true)
      )
    ),
    [monthsState, weeksState, cumulativesState, institutions, sectionsState, testType]
  );

  // --- Dynamic subject cards ---
  const subjectAverages = useMemo(() => {
    const subjectMap: Record<string, { sum: number; count: number }> = {};
    filteredStudents.forEach(s => {
      if (!subjectMap[s.subject]) subjectMap[s.subject] = { sum: 0, count: 0 };
      subjectMap[s.subject].sum += Math.min(100, s.percent);
      subjectMap[s.subject].count++;
    });
    return Object.entries(subjectMap).map(([subject, { sum, count }]) => ({
      subject,
      avg: count ? (sum / count) : 0
    }));
  }, [filteredStudents]);

  // Remove subjectFiltered, use filteredStudents directly
  const topPerformers = [...filteredStudents]
    .sort((a, b) => Math.min(100, b.percent) - Math.min(100, a.percent))
    .slice(0, performerCount);
  const bottomPerformers = [...filteredStudents]
    .sort((a, b) => Math.min(100, a.percent) - Math.min(100, b.percent))
    .slice(0, performerCount);

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-12 py-10 flex flex-col gap-8">
      {/* FILTER PANEL (TOP BAR) */}
      <div className="bg-white shadow rounded-2xl p-4 md:p-6 flex gap-4 md:gap-6 items-center overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50" style={{ overflow: "visible" }}>
        {/* Test Type Dropdown (single select) */}
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs font-semibold mb-2 text-gray-600">Test Type</span>
          <SingleSelectDropdown
            options={TEST_TYPES as unknown as string[]}
            selected={testType}
            setSelected={opt => setTestType(opt as TestType)}
          />
        </div>
        {/* Institution */}
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs font-semibold mb-2 text-gray-600">Institution</span>
          <MultiCheckboxDropdown
            options={INSTITUTIONS}
            selected={institutions}
            setSelected={setInstitutions}
            selectAllLabel="All Institutions"
          />
        </div>
        {/* Month */}
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs font-semibold mb-2 text-gray-600">Month</span>
          <MultiCheckboxDropdown
            options={MONTHS}
            selected={monthsState}
            setSelected={setMonthsState}
            selectAllLabel="All Months"
          />
        </div>
        {/* Weekly: Week */}
        {testType === "Weekly" && (
          <div className="flex flex-col min-w-[160px] flex-shrink-0">
            <span className="text-xs font-semibold mb-2 text-gray-600">Week</span>
            <MultiCheckboxDropdown
              options={weekOptions}
              selected={weeksState}
              setSelected={setWeeksState}
              selectAllLabel="All Weeks"
            />
          </div>
        )}
        {/* Cumulative: Cumulative */}
        {testType === "Cumulative" && (
          <div className="flex flex-col min-w-[160px] flex-shrink-0">
            <span className="text-xs font-semibold mb-2 text-gray-600">Cumulative</span>
            <MultiCheckboxDropdown
              options={cumulativeOptions}
              selected={cumulativesState}
              setSelected={setCumulativesState}
              selectAllLabel="All Cumulatives"
            />
          </div>
        )}
        {/* Section */}
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs font-semibold mb-2 text-gray-600">Section</span>
          <MultiCheckboxDropdown
            options={SECTIONS}
            selected={sectionsState}
            setSelected={setSectionsState}
            selectAllLabel="All Sections"
          />
        </div>
      </div>

      {/* AVERAGE SCORE PER SUBJECT (dynamic) */}
      <div>
        <h2 className="text-2xl font-extrabold mb-6 text-gray-800 tracking-tight text-center md:text-left">Average Score Per Subject</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {subjectAverages.map(card => {
            const color = card.subject === "Physics"
              ? "from-blue-400 to-blue-600"
              : card.subject === "Chemistry"
              ? "from-pink-400 to-pink-600"
              : card.subject === "Botany"
              ? "from-green-400 to-green-600"
              : card.subject === "Zoology"
              ? "from-yellow-400 to-yellow-600"
              : "from-gray-400 to-gray-600";
            const icon = card.subject === "Physics"
              ? "🧲"
              : card.subject === "Chemistry"
              ? "⚗️"
              : card.subject === "Botany"
              ? "🌱"
              : card.subject === "Zoology"
              ? "🦋"
              : "📚";
            return (
              <div key={card.subject} className={`relative bg-gradient-to-br ${color} p-6 rounded-2xl shadow-lg flex flex-col items-center gap-3 overflow-hidden group transition-transform hover:scale-[1.03]`}>
                <div className="absolute right-3 top-3 text-4xl opacity-20 group-hover:opacity-30 transition">{icon}</div>
                <div className="text-white text-lg font-semibold drop-shadow-sm z-10">{card.subject}</div>
                <div className="text-4xl font-extrabold text-white drop-shadow-lg z-10">{card.avg.toFixed(1)}%</div>
                <div className="w-16 h-1 rounded-full bg-white/30 mt-2 z-10"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TOP & BOTTOM PERFORMERS */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800 text-center md:text-left">Top & Bottom Performing Students</h2>
        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
          {/* Top Performers Card */}
          <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-base font-semibold text-gray-700">Top Performers</div>
              <div className="flex gap-2">
                <select
                  className="border rounded px-2 py-1 text-sm focus:outline-none bg-white"
                  value={performerCount}
                  onChange={e => setPerformerCount(Number(e.target.value))}
                >
                  {studentCounts.map(count => <option key={count} value={count}>{count}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
              {topPerformers.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No students match the selected filters.</div>
              ) : topPerformers.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-base">{s.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate text-base">{s.name}</div>
                    <span className="inline-block bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded mt-1">{s.section}</span>
                  </div>
                  <span className="text-gray-700 font-bold px-3 py-1 rounded-full text-sm">{Math.min(100, s.percent).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
          {/* Bottom Performers Card */}
          <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-base font-semibold text-gray-700">Bottom Performers</div>
              <div className="flex gap-2">
                <select
                  className="border rounded px-2 py-1 text-sm focus:outline-none bg-white"
                  value={performerCount}
                  onChange={e => setPerformerCount(Number(e.target.value))}
                >
                  {studentCounts.map(count => <option key={count} value={count}>{count}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
              {bottomPerformers.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No students match the selected filters.</div>
              ) : bottomPerformers.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-base">{s.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate text-base">{s.name}</div>
                    <span className="inline-block bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded mt-1">{s.section}</span>
                  </div>
                  <span className="text-gray-700 font-bold px-3 py-1 rounded-full text-sm">{Math.min(100, s.percent).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceInsights;
