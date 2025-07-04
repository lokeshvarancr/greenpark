import React, { useState, useMemo } from "react";
import { PieChart, TrendingUp, AlertTriangle, Users } from "lucide-react";
import {
  TEST_TYPES,
  SECTION_OPTIONS,
  MONTHS,
  getWeeksInMonth,
  getPerformanceTableData
} from "@/DummyData/PerformanceTabData";
import DataTable from "@/dashboard/components/tables/DataTable";
import SubjectWiseAnalysisChart from "@/dashboard/components/SubjectWiseAnalysisChart";
import PageContainer from "@/components/layout/PageContainer";
import PerformanceTabFilterBar from "@/dashboard/components/PerformanceTabFilterBar";

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
    <PageContainer>
      <div className="space-y-12 w-full">
        {/* Top Bar Filters */}
        <PerformanceTabFilterBar
          testType={testType}
          setTestType={setTestType}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedTest1Idx={selectedTest1Idx}
          setSelectedTest1Idx={setSelectedTest1Idx}
          selectedTest2Idx={selectedTest2Idx}
          setSelectedTest2Idx={setSelectedTest2Idx}
          selectedGrandTest1={selectedGrandTest1}
          setSelectedGrandTest1={setSelectedGrandTest1}
          selectedGrandTest2={selectedGrandTest2}
          setSelectedGrandTest2={setSelectedGrandTest2}
          selectedSections={selectedSections}
          setSelectedSections={setSelectedSections}
          setShowComparison={setShowComparison}
          setCompareError={setCompareError}
          weekOptions={weekOptions}
          cumulativeTestOptions={cumulativeTestOptions}
          grandTestNames={grandTestNames}
        />
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
    </PageContainer>
  );
};

export default Performancetab;
