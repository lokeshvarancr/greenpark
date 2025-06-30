import React, { useState, useMemo } from "react";
import { Download, FileText } from "lucide-react";
import {
  TEST_TYPES,
  SECTION_OPTIONS,
  MONTHS,
  getWeeksInMonth,
  getPerformanceTableData
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
  const [selectedSubject] = useState<string>("Physics");

  const selectedMonthObj = MONTHS.find(m => m.value === selectedMonth);
  const weeks = useMemo(() => selectedMonthObj ? getWeeksInMonth(selectedMonthObj.year, selectedMonthObj.month) : [], [selectedMonthObj]);
  const weekOptions = weeks.map((_, i) => `Week ${i + 1} (Test ${i + 1})`);
  const cumulativeTestOptions = ["Cumulative 1", "Cumulative 2"];
  const grandTestNames = ["Grand Test 1", "Grand Test 2"];

  // Controlled interactivity: Only update on Compare
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>(getPerformanceTableData(testType));

  // Update table data when testType changes
  React.useEffect(() => {
    setTableData(getPerformanceTableData(testType));
    setShowComparison(false);
  }, [testType]);

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
    setShowComparison(true);
    setComparisonData(tableData.filter(row => selectedSections.includes(row.section)));
  };

  // Dynamic serial number for filtered table
  const filteredData = showComparison ? comparisonData : [];
  const reIndexedData = filteredData.map((row, idx) => ({ ...row, sno: idx + 1 }));

  // Subject summary counts after comparison
  const getSubjectSummary = () => {
    return ["physics", "chemistry", "botany", "zoology"].map(subject => {
      let improved = 0, declined = 0, same = 0;
      for (const row of reIndexedData) {
        const t1 = row[subject].mark1;
        const t2 = row[subject].mark2;
        if (t1 === "" || t2 === "") continue;
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
  };

  const subjectSummary = getSubjectSummary();

  // --- Compare View Cards and Charts ---
  const getRankBarChartData = () => {
    if (selectedSubject === "Overall") {
      // Average rank for each test across all subjects
      let rankSum = 0, count = 0;
      for (const row of comparisonData) {
        ["physics", "chemistry", "botany", "zoology"].forEach(sub => {
          if (typeof row[sub].rank === "number") {
            rankSum += row[sub].rank;
            count++;
          }
        });
      }
      return [
        { name: "Rank", rank: count ? Math.round(rankSum / count) : 0 },
      ];
    } else {
      const key = selectedSubject.toLowerCase();
      let rankSum = 0, count = 0;
      for (const row of comparisonData) {
        if (typeof row[key].rank === "number") {
          rankSum += row[key].rank;
          count++;
        }
      }
      return [
        { name: "Rank", rank: count ? Math.round(rankSum / count) : 0 },
      ];
    }
  };

  // Data for right grouped bar chart (Improved/Declined/No Change per subject)
  const getGroupedBarChartData = () => {
    return ["physics", "chemistry", "botany", "zoology"].map(sub => {
      let improved = 0, declined = 0, same = 0;
      for (const row of reIndexedData) {
        const t1 = row[sub].mark1;
        const t2 = row[sub].mark2;
        if (t1 === "" || t2 === "") continue;
        if (t2 > t1) improved++;
        else if (t2 < t1) declined++;
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

  // Section dropdown logic: only 5 checkboxes, always at least one selected
  const handleSectionChange = (section: string) => {
    if (section === "Select All") {
      setSelectedSections(selectedSections.length === SECTION_OPTIONS.length ? [] : [...SECTION_OPTIONS]);
    } else {
      let updated = selectedSections.includes(section)
        ? selectedSections.filter(s => s !== section)
        : [...selectedSections, section];
      if (updated.length === 0) updated = [...SECTION_OPTIONS];
      setSelectedSections(updated);
    }
  };

  // Section dropdown: close on outside click
  React.useEffect(() => {
    if (!sectionDropdownOpen) return;
    function handleClick(e: MouseEvent) {
      const dropdown = document.getElementById("section-dropdown");
      if (dropdown && !dropdown.contains(e.target as Node)) {
        setSectionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [sectionDropdownOpen]);

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
        <div className="relative min-w-[220px]" id="section-dropdown">
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
                  onChange={() => handleSectionChange("Select All")}
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
                      onChange={() => handleSectionChange(section)}
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
              groupedBarChartData={getGroupedBarChartData()}
              rankBarChartData={getRankBarChartData()}
            />
            {/* --- Table --- */}
            <div className="max-w-[80rem] mx-auto px-2 mt-6">
              <PerformanceComparisonTable data={reIndexedData} />
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
