import React, { useState, useMemo } from "react";
import { Download, FileText } from "lucide-react";
import {
  TEST_TYPES,
  SECTION_OPTIONS,
  MONTHS,
  getWeeksInMonth,
  excelData
} from "@/DummyData/PerformanceTabData";
import PerformanceComparisonTable from "@/components/PerformanceComparisonTable";
import PerformanceSummaryCards from "@/components/PerformanceSummaryCards";

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
  const [selectedSubject, setSelectedSubject] = useState<string>("Physics");

  const selectedMonthObj = MONTHS.find(m => m.value === selectedMonth);
  const weeks = useMemo(() => selectedMonthObj ? getWeeksInMonth(selectedMonthObj.year, selectedMonthObj.month) : [], [selectedMonthObj]);
  const weekOptions = weeks.map((_, i) => `Week ${i + 1} (Test ${i + 1})`);
  const cumulativeTestOptions = ["Cumulative 1", "Cumulative 2"];
  const grandTestNames = ["Grand Test 1", "Grand Test 2"];

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

  const subjectSummary = getSubjectSummary();

  // --- Compare View Cards and Charts ---
  const getRankBarChartData = () => {
    if (selectedSubject === "Overall") {
      // Average rank for each test across all subjects
      let t1Sum = 0, t2Sum = 0, count = 0;
      for (const row of comparisonData) {
        ["physics", "chemistry", "botany", "zoology"].forEach(sub => {
          t1Sum += row[sub].rank1;
          t2Sum += row[sub].rank2;
          count++;
        });
      }
      return [
        { name: "Test 1", rank: count ? Math.round(t1Sum / count) : 0 },
        { name: "Test 2", rank: count ? Math.round(t2Sum / count) : 0 },
      ];
    } else {
      const key = selectedSubject.toLowerCase();
      let t1Sum = 0, t2Sum = 0, count = 0;
      for (const row of comparisonData) {
        t1Sum += row[key].rank1;
        t2Sum += row[key].rank2;
        count++;
      }
      return [
        { name: "Test 1", rank: count ? Math.round(t1Sum / count) : 0 },
        { name: "Test 2", rank: count ? Math.round(t2Sum / count) : 0 },
      ];
    }
  };

  // Data for right grouped bar chart (Improved/Declined/No Change per subject)
  const getGroupedBarChartData = () => {
    return ["physics", "chemistry", "botany", "zoology"].map(sub => {
      let improved = 0, declined = 0, same = 0;
      for (const row of comparisonData) {
        const r1 = row[sub].rank1;
        const r2 = row[sub].rank2;
        if (r2 < r1) improved++;
        else if (r2 > r1) declined++;
        else same++;
      }
      return {
        subject: sub.charAt(0).toUpperCase() + sub.slice(1),
        Improved: improved,
        Declined: declined,
        NoChange: same,
      };
    });
  };

  return (
    <div className="min-h-0 flex flex-col bg-gray-50">
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
            {/* --- Summary Cards and Charts --- */}
            <PerformanceSummaryCards
              summary={subjectSummary}
              rankBarChartData={getRankBarChartData()}
              groupedBarChartData={getGroupedBarChartData()}
            />
            {/* --- Table --- */}
            <div className="max-w-[80rem] mx-auto px-2 mt-6">
              <PerformanceComparisonTable data={comparisonData} />
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
