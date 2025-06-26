import React, { useState, useMemo } from "react";
import { Download, FileText } from "lucide-react";

const TEST_TYPES = ["Weekly", "Cumulative", "Grand Test"];
const SECTION_OPTIONS = [
  ...Array.from({ length: 10 }, (_, i) => `11${String.fromCharCode(65 + i)}`),
  ...Array.from({ length: 10 }, (_, i) => `12${String.fromCharCode(65 + i)}`),
];
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
function getWeeksInMonth(year: number, month: number) {
  const weeks: Date[][] = [];
  let date = new Date(year, month, 1);
  let week: Date[] = [];
  while (date.getMonth() === month) {
    week.push(new Date(date));
    if (date.getDay() === 6) {
      weeks.push(week);
      week = [];
    }
    date.setDate(date.getDate() + 1);
  }
  if (week.length) weeks.push(week);
  return weeks;
}

const Performancetab: React.FC = () => {
  // Top bar filters
  const [testType, setTestType] = useState<string>(TEST_TYPES[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[0].value);
  const [selectedTest1Idx, setSelectedTest1Idx] = useState<number>(0);
  const [selectedTest2Idx, setSelectedTest2Idx] = useState<number>(1);
  const [selectedGrandTest1, setSelectedGrandTest1] = useState<string>("Grand Test 1");
  const [selectedGrandTest2, setSelectedGrandTest2] = useState<string>("Grand Test 2");
  const [selectedSections, setSelectedSections] = useState<string[]>([...SECTION_OPTIONS]);
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [compareError, setCompareError] = useState<string>("");

  const selectedMonthObj = MONTHS.find(m => m.value === selectedMonth);
  const weeks = useMemo(() => selectedMonthObj ? getWeeksInMonth(selectedMonthObj.year, selectedMonthObj.month) : [], [selectedMonthObj]);
  const weekOptions = weeks.map((_, i) => `Week ${i + 1} (Test ${i + 1})`);
  const cumulativeTestOptions = ["Cumulative 1", "Cumulative 2"];
  const grandTestNames = ["Grand Test 1", "Grand Test 2"];

  // Helper for status arrow
  const getStatusSymbol = (status: string) => {
    if (status === "+") return <span className="text-green-600 font-bold">+ <span className="sr-only">Improved</span></span>;
    if (status === "-") return <span className="text-red-600 font-bold">− <span className="sr-only">Declined</span></span>;
    return <span className="text-gray-500 font-bold">0 <span className="sr-only">No Change</span></span>;
  };

  // Controlled interactivity: Only update on Compare
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const handleCompare = () => {
    setCompareError("");
    // Validate
    if (testType === "Grand Test" && (selectedGrandTest1 === selectedGrandTest2)) {
      setCompareError("Please select two different Grand Tests.");
      setShowComparison(false);
      return;
    }
    if ((testType === "Weekly" || testType === "Cumulative") && (selectedTest1Idx === selectedTest2Idx)) {
      setCompareError("Please select two different tests.");
      setShowComparison(false);
      return;
    }
    if (selectedSections.length === 0) {
      setCompareError("Please select at least one section.");
      setShowComparison(false);
      return;
    }
    // Simulate data fetch and filter
    setShowComparison(true);
    setComparisonData(excelData.filter(row => selectedSections.includes(row.class)));
  };

  // Table row generator for comparison view
  const renderComparisonRow = (row: any) => {
    // For demo, use mark1/mark2 as Test 1/Test 2
    const getDelta = (a: number, b: number) => a === b ? "0" : a > b ? "+" : "-";
    return (
      <tr key={row.sno} className="hover:bg-blue-50 transition-all duration-300">
        <td className="border px-2 py-1 text-center rounded-l-lg">{row.sno}</td>
        <td className="border px-2 py-1 text-center">{row.class}</td>
        <td className="border px-2 py-1">{row.name}</td>
        {/* Physics */}
        <td className="border px-2 py-1 text-center">{row.physics.mark1}</td>
        <td className="border px-2 py-1 text-center">{row.physics.mark2}</td>
        <td className="border px-2 py-1 text-center">{getStatusSymbol(getDelta(row.physics.mark2, row.physics.mark1))}</td>
        <td className="border px-2 py-1 text-center">{row.physics.rank1}</td>
        <td className="border px-2 py-1 text-center">{row.physics.rank2}</td>
        <td className="border px-2 py-1 text-center">{getStatusSymbol(getDelta(row.physics.rank1, row.physics.rank2))}</td>
        {/* Chemistry */}
        <td className="border px-2 py-1 text-center">{row.chemistry.mark1}</td>
        <td className="border px-2 py-1 text-center">{row.chemistry.mark2}</td>
        <td className="border px-2 py-1 text-center">{getStatusSymbol(getDelta(row.chemistry.mark2, row.chemistry.mark1))}</td>
        <td className="border px-2 py-1 text-center">{row.chemistry.rank1}</td>
        <td className="border px-2 py-1 text-center">{row.chemistry.rank2}</td>
        <td className="border px-2 py-1 text-center">{getStatusSymbol(getDelta(row.chemistry.rank1, row.chemistry.rank2))}</td>
        {/* Botany */}
        <td className="border px-2 py-1 text-center">{row.botany.mark1}</td>
        <td className="border px-2 py-1 text-center">{row.botany.mark2}</td>
        <td className="border px-2 py-1 text-center">{getStatusSymbol(getDelta(row.botany.mark2, row.botany.mark1))}</td>
        <td className="border px-2 py-1 text-center">{row.botany.rank1}</td>
        <td className="border px-2 py-1 text-center">{row.botany.rank2}</td>
        <td className="border px-2 py-1 text-center">{getStatusSymbol(getDelta(row.botany.rank1, row.botany.rank2))}</td>
        {/* Zoology */}
        <td className="border px-2 py-1 text-center">{row.zoology.mark1}</td>
        <td className="border px-2 py-1 text-center">{row.zoology.mark2}</td>
        <td className="border px-2 py-1 text-center">{getStatusSymbol(getDelta(row.zoology.mark2, row.zoology.mark1))}</td>
        <td className="border px-2 py-1 text-center">{row.zoology.rank1}</td>
        <td className="border px-2 py-1 text-center">{row.zoology.rank2}</td>
        <td className="border px-2 py-1 text-center rounded-r-lg">{getStatusSymbol(getDelta(row.zoology.rank1, row.zoology.rank2))}</td>
      </tr>
    );
  };

  // Subject summary counts after comparison
  const getSubjectSummary = () => {
    const summary = ["physics", "chemistry", "botany", "zoology"].map(subject => {
      let improved = 0, declined = 0, same = 0;
      for (const row of comparisonData) {
        const t1 = row[subject].mark1;
        const t2 = row[subject].mark2;
        if (t2 > t1) improved++;
        else if (t2 < t1) declined++;
        else same++;
      }
      return {
        subject: subject.charAt(0).toUpperCase() + subject.slice(1),
        improved,
        declined,
        same
      };
    });
    return summary;
  };

  return (
    <div className="h-screen min-h-0 flex flex-col bg-gray-50">
      {/* Top Bar Filters */}
      <div className="sticky top-0 z-30 bg-white shadow flex flex-wrap items-center justify-between gap-4 px-4 py-4 rounded-b-2xl border-b">
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          {/* Test Type Dropdown */}
          <div className="relative min-w-[140px]">
            <label className="block text-xs font-semibold mb-1 text-gray-600">Test Type</label>
            <select
              className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition w-full"
              value={testType}
              onChange={e => {
                setTestType(e.target.value);
                setSelectedMonth(MONTHS[0].value);
                setSelectedTest1Idx(0);
                setSelectedTest2Idx(1);
                setSelectedGrandTest1("Grand Test 1");
                setSelectedGrandTest2("Grand Test 2");
                setShowComparison(false);
                setCompareError("");
              }}
            >
              {TEST_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          {/* --- Weekly --- */}
          {testType === "Weekly" && (
            <>
              {/* Month Dropdown */}
              <div className="relative min-w-[160px]">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Month</label>
                <select
                  className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition w-full"
                  value={selectedMonth}
                  onChange={e => {
                    setSelectedMonth(e.target.value);
                    setSelectedTest1Idx(0);
                    setSelectedTest2Idx(1);
                    setShowComparison(false);
                    setCompareError("");
                  }}
                >
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              {/* Test 1 Dropdown */}
              <div className="relative min-w-[140px]">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Test 1</label>
                <select
                  className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition w-full"
                  value={selectedTest1Idx}
                  onChange={e => { setSelectedTest1Idx(Number(e.target.value)); setShowComparison(false); setCompareError(""); }}
                >
                  {weekOptions.map((label, i) => (
                    <option key={i} value={i}>{label}</option>
                  ))}
                </select>
              </div>
              {/* Test 2 Dropdown */}
              <div className="relative min-w-[140px]">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Test 2</label>
                <select
                  className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition w-full"
                  value={selectedTest2Idx}
                  onChange={e => { setSelectedTest2Idx(Number(e.target.value)); setShowComparison(false); setCompareError(""); }}
                >
                  {weekOptions.map((label, i) => (
                    <option key={i} value={i}>{label}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* --- Cumulative --- */}
          {testType === "Cumulative" && (
            <>
              {/* Month Dropdown */}
              <div className="relative min-w-[160px]">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Month</label>
                <select
                  className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition w-full"
                  value={selectedMonth}
                  onChange={e => { setSelectedMonth(e.target.value); setSelectedTest1Idx(0); setSelectedTest2Idx(1); setShowComparison(false); setCompareError(""); }}
                >
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              {/* Test 1 Dropdown */}
              <div className="relative min-w-[140px]">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Test 1</label>
                <select
                  className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition w-full"
                  value={selectedTest1Idx}
                  onChange={e => { setSelectedTest1Idx(Number(e.target.value)); setShowComparison(false); setCompareError(""); }}
                >
                  {cumulativeTestOptions.map((label, i) => (
                    <option key={i} value={i}>{label}</option>
                  ))}
                </select>
              </div>
              {/* Test 2 Dropdown */}
              <div className="relative min-w-[140px]">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Test 2</label>
                <select
                  className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition w-full"
                  value={selectedTest2Idx}
                  onChange={e => { setSelectedTest2Idx(Number(e.target.value)); setShowComparison(false); setCompareError(""); }}
                >
                  {cumulativeTestOptions.map((label, i) => (
                    <option key={i} value={i}>{label}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* --- Grand Test --- */}
          {testType === "Grand Test" && (
            <>
              {/* Test 1 Dropdown */}
              <div className="relative min-w-[180px]">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Test 1</label>
                <select
                  className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition w-full"
                  value={selectedGrandTest1}
                  onChange={e => { setSelectedGrandTest1(e.target.value); setShowComparison(false); setCompareError(""); }}
                >
                  {grandTestNames.map((name: string) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              {/* Test 2 Dropdown */}
              <div className="relative min-w-[180px]">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Test 2</label>
                <select
                  className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[120px] bg-white shadow-sm hover:border-blue-400 transition w-full"
                  value={selectedGrandTest2}
                  onChange={e => { setSelectedGrandTest2(e.target.value); setShowComparison(false); setCompareError(""); }}
                >
                  {grandTestNames.map((name: string) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
        {/* Section Dropdown (multi-select) - always shown */}
        <div className="relative min-w-[220px]">
          <label className="block text-xs font-semibold mb-1 text-gray-600">Section</label>
          <button
            type="button"
            className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full flex justify-between items-center bg-white hover:bg-blue-50 transition shadow-sm"
            onClick={() => setSectionDropdownOpen(v => !v)}
          >
            <span className="truncate text-left">{selectedSections.length === 0 ? "None" : selectedSections.length === SECTION_OPTIONS.length ? "All Sections" : selectedSections.join(", ")}</span>
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
          <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow" onClick={() => alert('Export as CSV (demo only)')}> <Download className="w-4 h-4" /> CSV </button>
          <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition shadow" onClick={() => alert('Export as PDF (demo only)')}> <FileText className="w-4 h-4" /> PDF </button>
        </div>
      </div>
      {/* Compare Button */}
      <div className="flex justify-center mt-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl shadow transition-all duration-200 disabled:opacity-50"
          onClick={handleCompare}
          disabled={testType === "Grand Test" ? selectedGrandTest1 === selectedGrandTest2 : selectedTest1Idx === selectedTest2Idx}
        >
          Compare
        </button>
      </div>
      {/* Error Message */}
      {compareError && <div className="text-center text-red-600 font-semibold mt-2 animate-fadeIn">{compareError}</div>}
      {/* Add your performance tab content below the filter bar */}
      <div className="mt-8">
        {showComparison ? (
          <>
            <h2 className="text-xl font-bold mb-4">Performance Comparison</h2>
            <div className="text-gray-500 mb-6">(Comparison view updates only after clicking Compare)</div>
            <div className="overflow-x-auto transition-all duration-300">
              <table className="min-w-[1200px] w-full border text-xs bg-white rounded-xl shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">S.No</th>
                    <th className="border px-2 py-1">Class</th>
                    <th className="border px-2 py-1">Student Name</th>
                    {/* Physics */}
                    <th className="border px-2 py-1" colSpan={3}>Physics</th>
                    <th className="border px-2 py-1" colSpan={3}>Physics Rank</th>
                    {/* Chemistry */}
                    <th className="border px-2 py-1" colSpan={3}>Chemistry</th>
                    <th className="border px-2 py-1" colSpan={3}>Chemistry Rank</th>
                    {/* Botany */}
                    <th className="border px-2 py-1" colSpan={3}>Botany</th>
                    <th className="border px-2 py-1" colSpan={3}>Botany Rank</th>
                    {/* Zoology */}
                    <th className="border px-2 py-1" colSpan={3}>Zoology</th>
                    <th className="border px-2 py-1" colSpan={3}>Zoology Rank</th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border px-2 py-1" colSpan={3}></th>
                    {/* Physics */}
                    <th className="border px-2 py-1">Test 1</th>
                    <th className="border px-2 py-1">Test 2</th>
                    <th className="border px-2 py-1">Δ</th>
                    <th className="border px-2 py-1">Test 1</th>
                    <th className="border px-2 py-1">Test 2</th>
                    <th className="border px-2 py-1">Δ</th>
                    {/* Chemistry */}
                    <th className="border px-2 py-1">Test 1</th>
                    <th className="border px-2 py-1">Test 2</th>
                    <th className="border px-2 py-1">Δ</th>
                    <th className="border px-2 py-1">Test 1</th>
                    <th className="border px-2 py-1">Test 2</th>
                    <th className="border px-2 py-1">Δ</th>
                    {/* Botany */}
                    <th className="border px-2 py-1">Test 1</th>
                    <th className="border px-2 py-1">Test 2</th>
                    <th className="border px-2 py-1">Δ</th>
                    <th className="border px-2 py-1">Test 1</th>
                    <th className="border px-2 py-1">Test 2</th>
                    <th className="border px-2 py-1">Δ</th>
                    {/* Zoology */}
                    <th className="border px-2 py-1">Test 1</th>
                    <th className="border px-2 py-1">Test 2</th>
                    <th className="border px-2 py-1">Δ</th>
                    <th className="border px-2 py-1">Test 1</th>
                    <th className="border px-2 py-1">Test 2</th>
                    <th className="border px-2 py-1">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map(renderComparisonRow)}
                </tbody>
              </table>
            </div>
            {/* Subject Summary Panel */}
            <div className="mt-8 animate-fadeIn">
              <h3 className="text-lg font-semibold mb-3">+ / – / 0 Count Summary per Subject</h3>
              <div className="overflow-x-auto">
                <table className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left rounded-tl-xl">Subject</th>
                      <th className="px-4 py-2 text-center"> <span className='text-green-600 font-bold'>+ Improved</span> </th>
                      <th className="px-4 py-2 text-center"> <span className='text-red-600 font-bold'>– Declined</span> </th>
                      <th className="px-4 py-2 text-center rounded-tr-xl"> <span className='text-gray-500 font-bold'>0 No Change</span> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSubjectSummary().map(s => (
                      <tr key={s.subject} className="even:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{s.subject}</td>
                        <td className="px-4 py-2 text-center"><span className="inline-block min-w-[2.5em] rounded-full bg-green-100 text-green-700 font-semibold px-2 py-1">{s.improved}</span></td>
                        <td className="px-4 py-2 text-center"><span className="inline-block min-w-[2.5em] rounded-full bg-red-100 text-red-700 font-semibold px-2 py-1">{s.declined}</span></td>
                        <td className="px-4 py-2 text-center"><span className="inline-block min-w-[2.5em] rounded-full bg-gray-200 text-gray-700 font-semibold px-2 py-1">{s.same}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-400 text-lg font-semibold animate-fadeIn">Select tests and click Compare to view performance comparison.</div>
        )}
      </div>
    </div>
  );
};

export default Performancetab;

const excelData = [
  { sno: 1, class: "11A", name: "Vignesh A", physics: { mark1: 100, rank1: 2, mark2: 110, rank2: 2, status: "+" }, chemistry: { mark1: 170, rank1: 2, mark2: 160, rank2: 2, status: "-" }, botany: { mark1: 200, rank1: 3, mark2: 220, rank2: 2, status: "+" }, zoology: { mark1: 180, rank1: 5, mark2: 180, rank2: 3, status: "0" } },
  { sno: 2, class: "11A", name: "Shalini K", physics: { mark1: 85, rank1: 4, mark2: 95, rank2: 3, status: "+" }, chemistry: { mark1: 140, rank1: 5, mark2: 150, rank2: 4, status: "+" }, botany: { mark1: 210, rank1: 2, mark2: 200, rank2: 4, status: "-" }, zoology: { mark1: 190, rank1: 4, mark2: 190, rank2: 2, status: "0" } },
  { sno: 3, class: "11A", name: "Aravind S", physics: { mark1: 110, rank1: 1, mark2: 105, rank2: 2, status: "-" }, chemistry: { mark1: 160, rank1: 3, mark2: 170, rank2: 1, status: "+" }, botany: { mark1: 180, rank1: 5, mark2: 200, rank2: 3, status: "-" }, zoology: { mark1: 200, rank1: 1, mark2: 200, rank2: 2, status: "-" } },
  { sno: 4, class: "11B", name: "Priya M", physics: { mark1: 90, rank1: 3, mark2: 90, rank2: 4, status: "0" }, chemistry: { mark1: 130, rank1: 6, mark2: 140, rank2: 5, status: "+" }, botany: { mark1: 190, rank1: 4, mark2: 180, rank2: 4, status: "-" }, zoology: { mark1: 170, rank1: 5, mark2: 180, rank2: 5, status: "+" } },
  { sno: 5, class: "11B", name: "Naveen R", physics: { mark1: 70, rank1: 6, mark2: 80, rank2: 5, status: "+" }, chemistry: { mark1: 150, rank1: 4, mark2: 140, rank2: 6, status: "-" }, botany: { mark1: 230, rank1: 1, mark2: 220, rank2: 1, status: "+" }, zoology: { mark1: 160, rank1: 7, mark2: 170, rank2: 6, status: "+" } },
  { sno: 6, class: "11B", name: "Lakshmi D", physics: { mark1: 95, rank1: 2, mark2: 95, rank2: 3, status: "-" }, chemistry: { mark1: 120, rank1: 7, mark2: 120, rank2: 7, status: "+" }, botany: { mark1: 200, rank1: 3, mark2: 190, rank2: 5, status: "-" }, zoology: { mark1: 175, rank1: 5, mark2: 175, rank2: 6, status: "+" } },
  { sno: 7, class: "11C", name: "Santhosh P", physics: { mark1: 105, rank1: 1, mark2: 115, rank2: 1, status: "-" }, chemistry: { mark1: 180, rank1: 1, mark2: 180, rank2: 1, status: "0" }, botany: { mark1: 220, rank1: 2, mark2: 230, rank2: 2, status: "+" }, zoology: { mark1: 200, rank1: 1, mark2: 210, rank2: 6, status: "+" } },
  { sno: 8, class: "11C", name: "Meena L", physics: { mark1: 60, rank1: 7, mark2: 65, rank2: 7, status: "-" }, chemistry: { mark1: 150, rank1: 2, mark2: 150, rank2: 2, status: "-" }, botany: { mark1: 150, rank1: 5, mark2: 160, rank2: 5, status: "-" }, zoology: { mark1: 140, rank1: 6, mark2: 150, rank2: 7, status: "-" } },
  { sno: 9, class: "11C", name: "Harish T", physics: { mark1: 78, rank1: 5, mark2: 78, rank2: 6, status: "0" }, chemistry: { mark1: 135, rank1: 6, mark2: 125, rank2: 7, status: "-" }, botany: { mark1: 170, rank1: 4, mark2: 170, rank2: 6, status: "-" }, zoology: { mark1: 165, rank1: 6, mark2: 165, rank2: 6, status: "-" } },
  { sno: 10, class: "11D", name: "Divya R", physics: { mark1: 88, rank1: 3, mark2: 95, rank2: 4, status: "+" }, chemistry: { mark1: 155, rank1: 4, mark2: 140, rank2: 6, status: "-" }, botany: { mark1: 180, rank1: 5, mark2: 190, rank2: 4, status: "-" }, zoology: { mark1: 180, rank1: 3, mark2: 190, rank2: 2, status: "+" } },
  { sno: 11, class: "11D", name: "Arjun B", physics: { mark1: 72, rank1: 6, mark2: 70, rank2: 6, status: "-" }, chemistry: { mark1: 140, rank1: 5, mark2: 130, rank2: 7, status: "-" }, botany: { mark1: 160, rank1: 5, mark2: 170, rank2: 4, status: "-" }, zoology: { mark1: 175, rank1: 5, mark2: 165, rank2: 5, status: "-" } },
  { sno: 12, class: "11D", name: "Sneha S", physics: { mark1: 92, rank1: 3, mark2: 96, rank2: 2, status: "+" }, chemistry: { mark1: 160, rank1: 3, mark2: 165, rank2: 2, status: "+" }, botany: { mark1: 190, rank1: 3, mark2: 200, rank2: 3, status: "+" }, zoology: { mark1: 185, rank1: 2, mark2: 190, rank2: 2, status: "+" } },
];
