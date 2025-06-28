import React, { useState, useMemo, useRef } from "react";
import {
  months,
  weeks,
  campuses,
  sections,
  studentCounts,
  testTypeOptions,
  testTypeToLabel,
  testTypeToTests,
  allStudents
} from "@/DummyData/PerformanceInsightsData";
import type { TestType } from "@/DummyData/PerformanceInsightsData";

type SmartMultiSelectDropdownProps = {
  options: string[];
  selected: string[];
  setSelected: (opts: string[]) => void;
  className?: string;
};
const SmartMultiSelectDropdown: React.FC<SmartMultiSelectDropdownProps> = ({ options, selected, setSelected, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Smart label logic
  let displayLabel = "All";
  if (selected.length === 1) displayLabel = selected[0];
  else if (selected.length > 1 && selected.length < options.length) displayLabel = `${selected.length} Selected`;

  // Click outside to close
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const allSelected = selected.length === options.length;
  const toggleAll = () => setSelected(allSelected ? [] : [...options]);
  const toggleOption = (opt: string) => setSelected(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);

  return (
    <div className={`relative min-w-[160px] ${className || ""}`} ref={ref}>
      <button
        type="button"
        className="w-full border rounded-lg px-4 py-2 text-sm bg-white shadow-sm flex items-center justify-between hover:border-blue-400 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate text-left">{displayLabel}</span>
        <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto flex flex-col gap-1 p-2 animate-fade-in">
          <label className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-100">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            <span className="text-sm font-medium">Select All</span>
          </label>
          {options.map((opt) => (
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

const SmartSingleSelectDropdown: React.FC<{
  options: string[];
  selected: string;
  setSelected: (opt: string) => void;
  className?: string;
}> = ({ options, selected, setSelected, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Click outside to close
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className={`relative min-w-[160px] ${className || ""}`} ref={ref}>
      <button
        type="button"
        className="w-full border rounded-lg px-4 py-2 text-sm bg-white shadow-sm flex items-center justify-between hover:border-blue-400 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate text-left">{selected}</span>
        <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto flex flex-col gap-1 p-2 animate-fade-in">
          {options.map((opt) => (
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
  // Filter states
  const [testType, setTestType] = useState<TestType>(testTypeOptions[0]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([...months]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([...weeks]);
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([...campuses]);
  const [selectedSections, setSelectedSections] = useState<string[]>([...sections]);
  const [selectedTests, setSelectedTests] = useState<string[]>([...testTypeToTests[testTypeOptions[0]]]);
  const [performerCount, setPerformerCount] = useState<number>(50);
  const [selectedSubject, setSelectedSubject] = useState<string>('Physics');

  // Update test options when testType changes
  React.useEffect(() => {
    setSelectedTests([...testTypeToTests[testType]]);
  }, [testType]);

  // Filter students based on all filters
  const filteredStudents = useMemo(() =>
    allStudents.filter(s =>
      selectedMonths.includes(s.month) &&
      selectedWeeks.includes(s.week) &&
      selectedCampuses.includes(s.campus) &&
      selectedSections.includes(s.section) &&
      s.testType === testType &&
      selectedTests.includes(s.test)
    ),
    [selectedMonths, selectedWeeks, selectedCampuses, selectedSections, testType, selectedTests]
  );

  // Sort for top/bottom
  const topPerformers = [...filteredStudents].sort((a, b) => b.percent - a.percent).slice(0, performerCount);
  const bottomPerformers = [...filteredStudents].sort((a, b) => a.percent - b.percent).slice(0, performerCount);

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-12 py-10 flex flex-col gap-8">
      {/* PAGE HEADER */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Performance Insights</h1>
        <p className="text-gray-500 text-lg">Track average scores and student-level performance across tests.</p>
      </div>

      {/* FILTER PANEL (TOP BAR) */}
      <div className="bg-white shadow rounded-2xl p-4 md:p-6 flex gap-4 md:gap-6 items-center overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
        {/* Test Type Dropdown (single select) */}
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs font-semibold mb-2 text-gray-600">Test Type</span>
          <SmartSingleSelectDropdown
            options={testTypeOptions}
            selected={testType}
            setSelected={(opt) => setTestType(opt as TestType)}
          />
        </div>
        {/* Dynamic Test Dropdown (multi-select) */}
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs font-semibold mb-2 text-gray-600">{testTypeToLabel[testType]}</span>
          <SmartMultiSelectDropdown
            options={testTypeToTests[testType]}
            selected={selectedTests}
            setSelected={setSelectedTests}
          />
        </div>
        {/* Month Multi-select */}
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs font-semibold mb-2 text-gray-600">Month</span>
          <SmartMultiSelectDropdown
            options={months}
            selected={selectedMonths}
            setSelected={setSelectedMonths}
          />
        </div>
        {/* Week Multi-select */}
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs font-semibold mb-2 text-gray-600">Week</span>
          <SmartMultiSelectDropdown
            options={weeks}
            selected={selectedWeeks}
            setSelected={setSelectedWeeks}
          />
        </div>
        {/* Campus Multi-select */}
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs font-semibold mb-2 text-gray-600">Campus</span>
          <SmartMultiSelectDropdown
            options={campuses}
            selected={selectedCampuses}
            setSelected={setSelectedCampuses}
          />
        </div>
        {/* Section Multi-select */}
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs font-semibold mb-2 text-gray-600">Section</span>
          <SmartMultiSelectDropdown
            options={sections}
            selected={selectedSections}
            setSelected={setSelectedSections}
          />
        </div>
      </div>

      {/* AVERAGE SCORE PER SUBJECT (static for demo) */}
      <div>
        <h2 className="text-2xl font-extrabold mb-6 text-gray-800 tracking-tight text-center md:text-left">Average Score Per Subject</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { subject: "Physics", avg: "82.3%", color: "from-blue-400 to-blue-600", icon: "🧲" },
            { subject: "Chemistry", avg: "91.7%", color: "from-pink-400 to-pink-600", icon: "⚗️" },
            { subject: "Botany", avg: "76.5%", color: "from-green-400 to-green-600", icon: "🌱" },
            { subject: "Zoology", avg: "88.1%", color: "from-yellow-400 to-yellow-600", icon: "🦋" }
          ].map(card => (
            <div key={card.subject} className={`relative bg-gradient-to-br ${card.color} p-6 rounded-2xl shadow-lg flex flex-col items-center gap-3 overflow-hidden group transition-transform hover:scale-[1.03]`}>
              <div className="absolute right-3 top-3 text-4xl opacity-20 group-hover:opacity-30 transition">{card.icon}</div>
              <div className="text-white text-lg font-semibold drop-shadow-sm z-10">{card.subject}</div>
              <div className="text-4xl font-extrabold text-white drop-shadow-lg z-10">{card.avg}</div>
              <div className="w-16 h-1 rounded-full bg-white/30 mt-2 z-10"></div>
            </div>
          ))}
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
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                >
                  {['Overall','Physics', 'Chemistry', 'Botany', 'Zoology'].map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
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
                  <span className="text-gray-700 font-bold px-3 py-1 rounded-full text-sm">{s.percent.toFixed(1)}%</span>
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
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                >
                  {['Overall','Physics', 'Chemistry', 'Botany', 'Zoology'].map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
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
                  <span className="text-gray-700 font-bold px-3 py-1 rounded-full text-sm">{s.percent.toFixed(1)}%</span>
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
