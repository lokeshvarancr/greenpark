import React, { useState, useMemo, useEffect } from "react";
import { allStudents, studentCounts, months as MONTHS, campuses as INSTITUTIONS, sections as SECTIONS } from "@/DummyData/PerformanceInsightsData";
import { getWeeksInMonth } from "@/DummyData/PerformanceInsightsData";
import { Atom, FlaskConical, Leaf, Bug } from "lucide-react";
import SelectDropdown from "@/dashboard/components/dropdowns/z_select";

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
    <div className="min-h-screen px-4 md:px-12 py-10 flex flex-col gap-8">
      {/* FILTER PANEL (TOP BAR) */}
      <div className=" rounded-2xl p-4 md:p-6 flex gap-4 md:gap-6 items-center overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50" style={{ overflow: "visible" }}>
        {/* Filter Icon */}
        <div className="flex items-center h-9 w-9 rounded-lg justify-center mr-4 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#A0A4AB" viewBox="0 0 256 256"><path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z"></path></svg>
        </div>
        {/* Test Type Dropdown (single select) */}
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs font-semibold mb-2 text-gray-600">Test Type</span>
          <SelectDropdown
            options={TEST_TYPES.map(type => ({ value: type }))}
            selectedValue={testType}
            onSelect={(opt: string) => setTestType(opt as TestType)}
            className="w-full"
          />
        </div>
        {/* Institution */}
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs font-semibold mb-2 text-gray-600">Institution</span>
          <SelectDropdown
            options={INSTITUTIONS.map(i => ({ value: i }))}
            selectedValues={institutions}
            onSelect={(_v, values) => setInstitutions(values.length === 0 ? [...INSTITUTIONS] : values)}
            multiSelect
            className="w-full"
            label=""
          />
        </div>
        {/* Month */}
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs font-semibold mb-2 text-gray-600">Month</span>
          <SelectDropdown
            options={MONTHS.map(m => ({ value: m }))}
            selectedValues={monthsState}
            onSelect={(_v, values) => setMonthsState(values.length === 0 ? [...MONTHS] : values)}
            multiSelect
            className="w-full"
            label=""
          />
        </div>
        {/* Weekly: Week */}
        {testType === "Weekly" && (
          <div className="flex flex-col min-w-[160px] flex-shrink-0">
            <span className="text-xs font-semibold mb-2 text-gray-600">Week</span>
            <SelectDropdown
              options={weekOptions.map(w => ({ value: w }))}
              selectedValues={weeksState}
              onSelect={(_v, values) => setWeeksState(values.length === 0 ? [...weekOptions] : values)}
              multiSelect
              className="w-full"
              label=""
            />
          </div>
        )}
        {/* Cumulative: Cumulative */}
        {testType === "Cumulative" && (
          <div className="flex flex-col min-w-[160px] flex-shrink-0">
            <span className="text-xs font-semibold mb-2 text-gray-600">Cumulative</span>
            <SelectDropdown
              options={cumulativeOptions.map(c => ({ value: c }))}
              selectedValues={cumulativesState}
              onSelect={(_v, values) => setCumulativesState(values.length === 0 ? [...cumulativeOptions] : values)}
              multiSelect
              className="w-full"
              label=""
            />
          </div>
        )}
        {/* Section */}
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs font-semibold mb-2 text-gray-600">Section</span>
          <SelectDropdown
            options={SECTIONS.map(s => ({ value: s }))}
            selectedValues={sectionsState}
            onSelect={(_v, values) => setSectionsState(values.length === 0 ? [...SECTIONS] : values)}
            multiSelect
            className="w-full"
            label=""
          />
        </div>
      </div>

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
  );
};

export default PerformanceInsights;
