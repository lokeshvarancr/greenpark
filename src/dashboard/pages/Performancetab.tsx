import React, { useState, useMemo } from "react";
import { Download, FileText, PieChart, TrendingUp, AlertTriangle, Users } from "lucide-react";
import {
  TEST_TYPES,
  SECTION_OPTIONS,
  MONTHS,
  getWeeksInMonth,
  getPerformanceTableData
} from "@/DummyData/PerformanceTabData";
import DataTable from "@/dashboard/components/tables/DataTable";
import SubjectWiseAnalysisChart from "@/dashboard/components/SubjectWiseAnalysisChart";
import SelectDropdown from "@/dashboard/components/dropdowns/z_select";

const Performancetab: React.FC = () => {
  // Top bar filters
  const [testType, setTestType] = useState<string>(TEST_TYPES[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[0].value);
  const [selectedTest1Idx, setSelectedTest1Idx] = useState<number>(0);
  const [selectedTest2Idx, setSelectedTest2Idx] = useState<number>(1);
  const [selectedGrandTest1, setSelectedGrandTest1] = useState<string>("Grand Test 1");
  const [selectedGrandTest2, setSelectedGrandTest2] = useState<string>("Grand Test 2");
  const [selectedSections, setSelectedSections] = useState<string[]>([...SECTION_OPTIONS]);
  const [showComparison, setShowComparison] = useState(false);
  const [compareError, setCompareError] = useState<string>("");

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

  return (
    <div className="min-h-0 flex flex-col">
      {/* Top Bar Filters */}
      <div className="sticky top-8 z-30 flex flex-wrap items-center justify-between gap-4 px-4 py-4 rounded-b-2xl border-b">
        {/* Filter Icon */}
        <div className="flex items-center h-9 w-9 bg-transparent rounded-lg justify-center mr-4 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#A0A4AB" viewBox="0 0 256 256"><path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z"></path></svg>
        </div>
        <div className="flex flex-wrap gap-4 items-end w-full md:w-auto">
          {/* Test Type Dropdown */}
          <div className="min-w-[140px] flex flex-col items-start">
            <SelectDropdown
              options={TEST_TYPES.map(type => ({ value: type }))}
              selectedValue={testType}
              onSelect={(v: string) => {
                setTestType(v);
                setSelectedMonth(MONTHS[0].value);
                setSelectedTest1Idx(0);
                setSelectedTest2Idx(1);
                setSelectedGrandTest1("Grand Test 1");
                setSelectedGrandTest2("Grand Test 2");
                setShowComparison(false);
                setCompareError("");
              }}
              label="Test Type"
              className="w-full"
            />
          </div>

          {/* --- Weekly --- */}
          {testType === "Weekly" && (
            <>
              {/* Month Dropdown */}
              <div className="min-w-[160px] flex flex-col items-start">
                <SelectDropdown
                  options={MONTHS.map(m => ({ value: m.value, label: m.label }))}
                  selectedValue={selectedMonth}
                  onSelect={(v: string) => {
                    setSelectedMonth(v);
                    setSelectedTest1Idx(0);
                    setSelectedTest2Idx(1);
                    setShowComparison(false);
                    setCompareError("");
                  }}
                  label="Month"
                  className="w-full"
                />
              </div>
              {/* Test 1 Dropdown */}
              <div className="min-w-[140px] flex flex-col items-start">
                <SelectDropdown
                  options={weekOptions.map((label, i) => ({ value: String(i), label }))}
                  selectedValue={String(selectedTest1Idx)}
                  onSelect={(v: string) => { setSelectedTest1Idx(Number(v)); setShowComparison(false); setCompareError(""); }}
                  label="Test 1"
                  className="w-full"
                />
              </div>
              {/* Test 2 Dropdown */}
              <div className="min-w-[140px] flex flex-col items-start">
                <SelectDropdown
                  options={weekOptions.map((label, i) => ({ value: String(i), label }))}
                  selectedValue={String(selectedTest2Idx)}
                  onSelect={(v: string) => { setSelectedTest2Idx(Number(v)); setShowComparison(false); setCompareError(""); }}
                  label="Test 2"
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* --- Cumulative --- */}
          {testType === "Cumulative" && (
            <>
              {/* Month Dropdown */}
              <div className="min-w-[160px] flex flex-col items-start">
                <SelectDropdown
                  options={MONTHS.map(m => ({ value: m.value, label: m.label }))}
                  selectedValue={selectedMonth}
                  onSelect={(v: string) => { setSelectedMonth(v); setSelectedTest1Idx(0); setSelectedTest2Idx(1); setShowComparison(false); setCompareError(""); }}
                  label="Month"
                  className="w-full"
                />
              </div>
              {/* Test 1 Dropdown */}
              <div className="min-w-[140px] flex flex-col items-start">
                <SelectDropdown
                  options={cumulativeTestOptions.map((label, i) => ({ value: String(i), label }))}
                  selectedValue={String(selectedTest1Idx)}
                  onSelect={(v: string) => { setSelectedTest1Idx(Number(v)); setShowComparison(false); setCompareError(""); }}
                  label="Test 1"
                  className="w-full"
                />
              </div>
              {/* Test 2 Dropdown */}
              <div className="min-w-[140px] flex flex-col items-start">
                <SelectDropdown
                  options={cumulativeTestOptions.map((label, i) => ({ value: String(i), label }))}
                  selectedValue={String(selectedTest2Idx)}
                  onSelect={(v: string) => { setSelectedTest2Idx(Number(v)); setShowComparison(false); setCompareError(""); }}
                  label="Test 2"
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* --- Grand Test --- */}
          {testType === "Grand Test" && (
            <>
              {/* Test 1 Dropdown */}
              <div className="min-w-[180px] flex flex-col items-start">
                <SelectDropdown
                  options={grandTestNames.map(name => ({ value: name }))}
                  selectedValue={selectedGrandTest1}
                  onSelect={(v: string) => { setSelectedGrandTest1(v); setShowComparison(false); setCompareError(""); }}
                  label="Test 1"
                  className="w-full"
                />
              </div>
              {/* Test 2 Dropdown */}
              <div className="min-w-[180px] flex flex-col items-start">
                <SelectDropdown
                  options={grandTestNames.map(name => ({ value: name }))}
                  selectedValue={selectedGrandTest2}
                  onSelect={(v: string) => { setSelectedGrandTest2(v); setShowComparison(false); setCompareError(""); }}
                  label="Test 2"
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
        {/* Section Dropdown (multi-select) - always shown */}
        <div className="min-w-[220px] flex flex-col items-start">
          <SelectDropdown
            options={SECTION_OPTIONS.map(section => ({ value: section }))}
            selectedValues={selectedSections}
            onSelect={(_v: string, values: string[]) => setSelectedSections(values.length === 0 ? [...SECTION_OPTIONS] : values)}
            label="Section"
            multiSelect
            className="w-full"
          />
        </div>
        {/* Export Buttons */}
        <div className="flex gap-2 ml-auto items-end">
          <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow" onClick={() => alert('Export as CSV (demo only)')}> <Download className="w-4 h-4" /> CSV </button>
          <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition shadow" onClick={() => alert('Export as PDF (demo only)')}> <FileText className="w-4 h-4" /> PDF </button>
        </div>
      </div>
      {/* Compare Button */}
      <div className="flex justify-center mt-16">
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
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              {/* Left: 2x2 Card Grid */}
              <div className="grid grid-cols-2 gap-6 flex-shrink-0 w-full lg:w-1/2">
                {subjectSummary.map((s, idx) => {
                  const ICONS = [
                    <PieChart className="w-9 h-9 text-blue-600" />, // Physics
                    <TrendingUp className="w-9 h-9 text-blue-600" />, // Chemistry
                    <Users className="w-9 h-9 text-blue-600" />, // Botany
                    <AlertTriangle className="w-9 h-9 text-blue-600" />, // Zoology
                  ];
                  const icon = ICONS[idx] || <AlertTriangle className="w-9 h-9 text-blue-600" />;
                  return (
                    <div
                      key={s.subject}
                      className="relative bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-2 overflow-hidden group transition-transform hover:scale-[1.03] border border-[#E9E9E9]"
                    >
                      <div className="absolute right-3 top-3 opacity-30 group-hover:opacity-50 transition">
                        {icon}
                      </div>
                      <div className="text-black text-lg font-semibold drop-shadow-sm z-10">
                        {s.subject}
                      </div>
                      <div className="flex gap-4 z-10 mt-2">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-green-600 font-medium">Improved</span>
                          <span className="font-bold text-black text-lg">{s.improved}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-red-600 font-medium">Declined</span>
                          <span className="font-bold text-black text-lg">{s.declined}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-500 font-medium">No Change</span>
                          <span className="font-bold text-black text-lg">{s.same}</span>
                        </div>
                      </div>
                      <div className="w-16 h-1 rounded-full bg-gray-200 mt-3 z-10"></div>
                    </div>
                  );
                })}
              </div>
              {/* Right: Stylish Subject-wise Analysis Chart (Recharts, blue theme) */}
              <div className="flex-grow min-w-[350px]">
                <SubjectWiseAnalysisChart
                  groupedBarData={getGroupedBarChartData()}
                />
              </div>
            </div>
            {/* --- Table --- */}
            <div className="max-w-[80rem] mx-auto px-2 mt-6">
              <DataTable
                rows={reIndexedData}
                columns={[
                  { field: "sno", label: "S.No" },
                  { field: "section", label: "Section" },
                  { field: "name", label: "Name" },
                  { field: "view", label: "Physics Test 1" },
                  { field: "view", label: "Physics Rank 1" },
                  { field: "view", label: "Physics Test 2" },
                  { field: "view", label: "Physics Rank 2" },
                  { field: "view", label: "Physics Status" },
                  { field: "view", label: "Chemistry Test 1" },
                  { field: "view", label: "Chemistry Rank 1" },
                  { field: "view", label: "Chemistry Test 2" },
                  { field: "view", label: "Chemistry Rank 2" },
                  { field: "view", label: "Chemistry Status" },
                  { field: "view", label: "Botany Test 1" },
                  { field: "view", label: "Botany Rank 1" },
                  { field: "view", label: "Botany Test 2" },
                  { field: "view", label: "Botany Rank 2" },
                  { field: "view", label: "Botany Status" },
                  { field: "view", label: "Zoology Test 1" },
                  { field: "view", label: "Zoology Rank 1" },
                  { field: "view", label: "Zoology Test 2" },
                  { field: "view", label: "Zoology Rank 2" },
                  { field: "view", label: "Zoology Status" },
                ]}
                renderCell={(row, col) => {
                  const anyRow = row as any;
                  // Map label to data key
                  const labelKeyMap: Record<string, string> = {
                    "S.No": "sno",
                    "Section": "section",
                    "Name": "name",
                  };
                  if (labelKeyMap[col.label]) return anyRow[labelKeyMap[col.label]];
                  // Subject and property from label
                  const [subject, ...rest] = col.label.split(" ");
                  const prop = rest.join(" ").toLowerCase();
                  if (["physics", "chemistry", "botany", "zoology"].includes(subject.toLowerCase())) {
                    const subj = subject.toLowerCase();
                    if (prop === "test 1") return anyRow[subj]?.mark1;
                    if (prop === "rank 1") return anyRow[subj]?.rank1;
                    if (prop === "test 2") return anyRow[subj]?.mark2;
                    if (prop === "rank 2") return anyRow[subj]?.rank2;
                    if (prop === "status") {
                      if (anyRow[subj]?.rank1 !== undefined && anyRow[subj]?.rank2 !== undefined) {
                        if (anyRow[subj].rank2 < anyRow[subj].rank1) return <span className="text-green-600 font-bold text-xs md:text-sm">+</span>;
                        if (anyRow[subj].rank2 > anyRow[subj].rank1) return <span className="text-red-600 font-bold text-xs md:text-sm">-</span>;
                        return <span className="text-gray-500 font-bold text-xs md:text-sm">0</span>;
                      }
                    }
                  }
                  return null;
                }}
              />
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
