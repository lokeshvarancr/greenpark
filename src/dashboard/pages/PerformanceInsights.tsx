import React, { useState, useMemo, useEffect } from "react";
import { allStudents, studentCounts, months as MONTHS, campuses as INSTITUTIONS, sections as SECTIONS } from "@/DummyData/PerformanceInsightsData";
import { getWeeksInMonth } from "@/DummyData/PerformanceInsightsData";
import { Atom, FlaskConical, Leaf, Bug } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import PerformanceInsightsFilterBar from "@/dashboard/components/PerformanceInsightsFilterBar";

// --- Filter Bar Constants ---
const TEST_TYPES = ["Weekly", "Cumulative", "Grand Test"] as const;
type TestType = (typeof TEST_TYPES)[number];

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
    <PageContainer>
      <div className="space-y-12 w-full">
        {/* FILTER PANEL (TOP BAR) */}
        <PerformanceInsightsFilterBar
          testType={testType}
          setTestType={v => setTestType(v as TestType)}
          institutions={institutions}
          setInstitutions={setInstitutions}
          monthsState={monthsState}
          setMonthsState={setMonthsState}
          weekOptions={weekOptions}
          weeksState={weeksState}
          setWeeksState={setWeeksState}
          cumulativeOptions={cumulativeOptions}
          cumulativesState={cumulativesState}
          setCumulativesState={setCumulativesState}
          sectionsState={sectionsState}
          setSectionsState={setSectionsState}
          TEST_TYPES={TEST_TYPES as unknown as string[]}
          INSTITUTIONS={INSTITUTIONS}
          MONTHS={MONTHS}
          SECTIONS={SECTIONS}
        />
        {/* AVERAGE SCORE PER SUBJECT (dynamic) */}
        <div>
          <h2 className="text-2xl font-extrabold mb-6 text-gray-800 tracking-tight text-center md:text-left">Average Score Per Subject</h2>
          <div className="w-full flex flex-row shadow-lg rounded-2xl overflow-hidden mt-4">
            {subjectAverages.slice(0, 4).map((card, idx) => {
              const ICON_CLASS = "w-9 h-9 text-blue-600";
              const ICONS: Record<string, React.ReactNode> = {
                Physics: <Atom className={ICON_CLASS} />,
                Chemistry: <FlaskConical className={ICON_CLASS} />,
                Botany: <Leaf className={ICON_CLASS} />,
                Zoology: <Bug className={ICON_CLASS} />,
              };
              return (
                <div
                  key={card.subject}
                  className={`flex flex-1 items-center py-6 px-8 min-w-0 bg-white ${
                    idx === 0
                      ? "rounded-l-2xl"
                      : "border-l border-[#E9E9E9]"
                  } ${idx === 3 ? "rounded-r-2xl" : ""}`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-semibold text-gray-900 truncate">
                      {card.subject}
                    </span>
                    <span className="mt-1 truncate font-extrabold text-gray-900 text-2xl">
                      {card.avg.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-center ml-auto">
                    <span className="inline-flex items-center justify-center rounded-full border border-blue-400 bg-white w-16 h-16">
                      {ICONS[card.subject] || <Atom className={ICON_CLASS} />}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOP & BOTTOM PERFORMERS */}
        <div className="card bg-white shadow-xl">
          <div className="card-body space-y-6">
            {/* Header section with title and dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                {/* You can use an icon here if desired, e.g., <ChartBar className="w-5 h-5 text-gray-600" /> */}
                <h2 className="card-title text-black text-xl font-bold mb-0 text-center md:text-left">Top & Bottom Performing Students</h2>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="text-sm text-gray-500">Show</label>
                <div className="relative w-full sm:w-48">
                  <select
                    className="appearance-none w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm pr-8"
                    value={performerCount}
                    onChange={e => setPerformerCount(Number(e.target.value))}
                  >
                    {studentCounts.map(count => <option key={count} value={count}>{count}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </div>
              </div>
            </div>
            {/* Table area: Top & Bottom Performers */}
            <div className="w-full border border-bg-primary rounded-lg p-4 bg-white">
              <div className="flex flex-col md:flex-row gap-8 md:gap-10">
                {/* Top Performers Card */}
                <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-base font-semibold text-gray-700">Top Performers</div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-black">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">Sl. No</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-black">
                        {topPerformers.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-gray-500">No students match the selected filters.</td>
                          </tr>
                        ) : topPerformers.map((s, i) => (
                          <tr key={i} className="hover:bg-gray-100 transition-colors">
                            <td className="px-6 py-2.5 whitespace-nowrap text-center text-black align-middle font-medium">{i + 1}</td>
                            <td className="px-6 py-2.5 whitespace-nowrap text-center text-black align-middle font-medium">{s.name}</td>
                            <td className="px-6 py-2.5 whitespace-nowrap text-center text-black align-middle font-bold">{Math.min(100, s.percent).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Bottom Performers Card */}
                <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-base font-semibold text-gray-700">Bottom Performers</div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-black">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">Sl. No</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-black">
                        {bottomPerformers.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-gray-500">No students match the selected filters.</td>
                          </tr>
                        ) : bottomPerformers.map((s, i) => (
                          <tr key={i} className="hover:bg-gray-100 transition-colors">
                            <td className="px-6 py-2.5 whitespace-nowrap text-center text-black align-middle font-medium">{i + 1}</td>
                            <td className="px-6 py-2.5 whitespace-nowrap text-center text-black align-middle font-medium">{s.name}</td>
                            <td className="px-6 py-2.5 whitespace-nowrap text-center text-black align-middle font-bold">{Math.min(100, s.percent).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default PerformanceInsights;
