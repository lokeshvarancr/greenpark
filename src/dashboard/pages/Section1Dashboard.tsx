import { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import { useFilter } from "@/lib/DashboardFilterContext";
import FilterBar from "@/components/FilterBar";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import MonthlyPerformanceHistogram from "@/components/ui/analytics/MonthlyPerformanceHistogram";
import AverageTotalScoreGauge from "../../components/ui/AverageTotalScoreGauge";
import type { DashboardData } from "@/types/dashboard";
import DashboardCard from "@/components/ui/DashboardCard";
import CountUp from "@/components/ui/CountUp";

// --- MOCK DATA GENERATION ---
type ScoreGenParams = { count: number; max: number; meanPct?: number; stdDevPct?: number };
function generateScores({ count, max, meanPct = 0.75, stdDevPct = 0.12 }: ScoreGenParams): number[] {
  const mean = max * meanPct;
  const stdDev = max * stdDevPct;
  return Array.from({ length: count }, () => {
    // Normal distribution, clamp to [0, max], rare full marks
    let score = Math.round(
      Math.min(
        max,
        Math.max(
          0,
          faker.number.float({
            min: Math.max(0, mean - 2 * stdDev),
            max: Math.min(max, mean + 2 * stdDev),
            fractionDigits: 0,
          })
        )
      )
    );
    // Make full marks extremely rare
    if (score === max && Math.random() > 0.01) score = max - faker.number.int({ min: 1, max: 5 });
    return score;
  });
}

// Tamil-style names for realistic mock data
const tamilNames = [
  "Keerthana", "Vignesh", "Deepika", "Arunmozhi", "Sathish", "Yuvan", "Priya", "Karthik", "Divya", "Gokul",
  "Meena", "Harish", "Lakshmi", "Saravanan", "Anitha", "Bala", "Kavya", "Ramesh", "Swathi", "Pranav"
];
function getTamilName() {
  return tamilNames[Math.floor(Math.random() * tamilNames.length)];
}

// Utility: simple hash to number for string
function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// --- BOTTOM 10% AVERAGE SCORE CORRECTION ---
function getRealisticBottom10Avg(maxMarks: number, filterSeed: number): number {
  // Use filterSeed to randomize within range for consistency per filter
  if (maxMarks === 400) {
    return 140 + (filterSeed % 101); // 140–240
  } else if (maxMarks === 720) {
    return 240 + (filterSeed % 101); // 240–340
  } else if (maxMarks === 120) {
    return 40 + (filterSeed % 21); // 40–60
  }
  // Default fallback
  return Math.round(maxMarks * 0.3);
}

// Mock API to fetch dashboard data per filter
async function fetchScores({ institution, batch, section, examType, subject }: { institution: string; batch: string; section: string; examType: string; subject?: string }): Promise<DashboardData> {
  const institutionOptions = ["Institution 1", "Institution 2"];
  const batchOptions = ["Batch A", "Batch B"];
  const sectionOptions = ["11A", "11B", "12A", "12B"];
  const validExamTypes = ["Weekly", "Cumulative", "Grand Test", "NEET"];
  const safeExamType = validExamTypes.includes(examType) ? examType : "Weekly";
  const maxMarks =
    safeExamType === "Weekly" ? 120 :
    safeExamType === "Cumulative" ? 400 :
    safeExamType === "Grand Test" || safeExamType === "NEET" ? 720 : 120;

  // Use filter values to create a seed for variability
  const filterSeed = stringToSeed(`${institution}|${batch}|${section}|${examType}|${subject}`);
  // Use the seed to vary meanPct and stdDevPct
  const meanPctBase = safeExamType === "NEET" ? 0.5 : 0.75;
  const stdDevBase = safeExamType === "NEET" ? 0.13 : 0.12;
  // Add a small deterministic offset based on the filter
  const meanPct = Math.max(0.35, Math.min(0.9, meanPctBase + ((filterSeed % 13 - 6) * 0.01)));
  const stdDevPct = Math.max(0.08, Math.min(0.2, stdDevBase + ((filterSeed % 7 - 3) * 0.005)));

  // Tamil-style names for all students
  let allStudents = institutionOptions.flatMap(inst =>
    batchOptions.flatMap(batchOpt =>
      sectionOptions.flatMap(sec =>
        Array.from({ length: 80 }, (_, i) => ({
          id: `${inst}-${batchOpt}-${sec}-${i}`,
          name: getTamilName(),
          institution: inst,
          batch: batchOpt,
          section: sec,
          score: generateScores({ count: 1, max: maxMarks, meanPct, stdDevPct })[0],
        }))
      )
    )
  );
  // Top 10 Performers filter logic
  let filteredInstitutions = institution ? [institution] : institutionOptions;
  let filteredBatches = batch ? [batch] : batchOptions;
  let filteredSections = (!section || section === "All Sections") ? sectionOptions : [section];
  let students = allStudents.filter(s =>
    filteredInstitutions.includes(s.institution) &&
    filteredBatches.includes(s.batch) &&
    filteredSections.includes(s.section)
  );
  if (students.length === 0) students = allStudents;
  // Top 10 by section
  const top10StudentsByClass = Object.fromEntries(
    sectionOptions.map(sec => [sec, [...allStudents.filter(s => s.section === sec)].sort((a, b) => b.score - a.score).slice(0, 10).map(s => ({ name: s.name, score: s.score, section: s.section, class: s.section }))])
  );
  // Top 10 overall
  const top10 = [...students].sort((a, b) => b.score - a.score).slice(0, 10);
  // --- BOTTOM 10% AVERAGE SCORE CORRECTION ---
  const bottom10PercentAvgScore = getRealisticBottom10Avg(maxMarks, filterSeed);
  // Most improved/dropped subject logic
  let mostImprovedSubject = "–";
  let mostDroppedSubject = "–";
  if (safeExamType === "Cumulative" || safeExamType === "Grand Test") {
    mostImprovedSubject = faker.helpers.arrayElement(["Physics", "Chemistry", "Biology"]);
    mostDroppedSubject = faker.helpers.arrayElement(["Physics", "Chemistry", "Biology"]);
  }
  // Performance trend: random walk
  const trendData = Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}/2025`,
    score: generateScores({ count: 1, max: maxMarks, meanPct, stdDevPct })[0],
  }));
  return {
    totalTestConducted: faker.number.int({ min: 10, max: 40 }),
    avgAccuracyPercentage: maxMarks > 0 ? (students.reduce((a, b) => a + b.score, 0) / (students.length * maxMarks)) * 100 : 0,
    avgTotalScore: students.length ? (students.reduce((a, b) => a + b.score, 0) / students.length) : 0,
    avgAttemptRatePercentage: faker.number.float({ min: 70, max: 98, fractionDigits: 1 }),
    top10PercentAvgScore: top10.length ? (top10.reduce((a, b) => a + b.score, 0) / top10.length) : 0,
    bottom10PercentAvgScore, // Use corrected value
    averageTotalScore: students.length ? (students.reduce((a, b) => a + b.score, 0) / students.length) : 0,
    riskBreakdown: {
      highRiskPercentage: students.length > 0 ? (students.filter(s => s.score < maxMarks * 0.4).length / students.length) * 100 : 0,
      mediumRiskPercentage: students.length > 0 ? (students.filter(s => s.score >= maxMarks * 0.4 && s.score < maxMarks * 0.75).length / students.length) * 100 : 0,
      safePercentage: students.length > 0 ? (students.filter(s => s.score >= maxMarks * 0.75).length / students.length) * 100 : 0,
    },
    neetReadiness: {
      overallPercentage: (maxMarks > 0 && students.length > 0) ? (students.filter(s => s.score >= maxMarks * 0.75).length / students.length) * 100 : 0,
      classWisePercentages: Object.fromEntries(
        sectionOptions.map(sec => [sec, (maxMarks > 0 && allStudents.filter(s => s.section === sec).length > 0) ? (allStudents.filter(s => s.section === sec && s.score >= maxMarks * 0.75).length / allStudents.filter(s => s.section === sec).length) * 100 : 0])
      ),
    },
    improvingStudentsPercentage: faker.number.float({ min: 40, max: 70, fractionDigits: 1 }),
    mostImprovedSubject,
    bestPerformingClass: sectionOptions
      .map(sec => {
        const secStudents = allStudents.filter(s => s.section === sec);
        const avg = secStudents.length ? secStudents.reduce((a, b) => a + b.score, 0) / secStudents.length : 0;
        return { sec, avg };
      })
      .sort((a, b) => b.avg - a.avg)[0]?.sec || sectionOptions[0],
    mostDroppedSubject,
    performanceTrend: {
      weekly: { Physics: trendData, Chemistry: trendData, Biology: trendData },
      cumulative: { Physics: trendData, Chemistry: trendData, Biology: trendData },
      grandTest: { overall: trendData },
    },
    top10Performers: top10.map(s => ({ name: s.name, score: s.score, section: s.section, class: s.section })),
    top10StudentsByClass,
  };
}

export default function Section1Dashboard() {
  // Define dropdown options at the very top, before any logic uses them
  const institutionOptions = ["Institution 1", "Institution 2"];
  const batchOptions = ["Batch A", "Batch B"];
  const sectionOptions = ["All Sections", "11A", "11B", "12A", "12B"];

  const { filter } = useFilter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- DYNAMIC DATA FETCH ---
  useEffect(() => {
    setLoading(true);
    setError(null);
    // Set default filter values if missing
    const defaultInstitution = filter.institution || institutionOptions[0];
    const defaultBatch = filter.batch || batchOptions[0];
    const defaultSection = filter.class || sectionOptions[0];
    const defaultExamType = filter.examType || "Weekly";
    const defaultSubject = filter.subject || "Physics";
    fetchScores({
      institution: defaultInstitution,
      batch: defaultBatch,
      section: defaultSection,
      examType: defaultExamType,
      subject: defaultSubject,
    })
      .then((data) => setDashboardData(data))
      .catch(() => setError("Failed to fetch dashboard data"))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>{error}</div>;
  if (!dashboardData) return null;

  // Determine max marks based on exam type
  const getMaxMarks = () => {
    if (filter.examType === "Weekly") return 120;
    if (filter.examType === "Cumulative") return 400;
    if (filter.examType === "Grand Test" || filter.examType === "NEET") return 720;
    return 0;
  };
  const maxMarks = getMaxMarks();

  // Use sanitized values for all metrics
  const avgTotalScore = Math.round(dashboardData.avgTotalScore);
  const top10PercentAvgScore = Math.round(dashboardData.top10PercentAvgScore);
  const bottom10PercentAvgScore = Math.round(dashboardData.bottom10PercentAvgScore);
  // --- TOP 10 PERFORMERS LOGIC ---
  let top10Performers: any[] = [];
  if (!filter.class || filter.class === "All Sections") {
    top10Performers = dashboardData.top10Performers
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(s => ({ ...s, score: Math.round(s.score) }));
  } else {
    top10Performers = dashboardData.top10Performers
      .filter(s => s.section === filter.class)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(s => ({ ...s, score: Math.round(s.score) }));
  }
  // If no performers found, fallback to all top10 from all sections
  if (top10Performers.length === 0 && dashboardData.top10StudentsByClass) {
    // Flatten all top10 lists and take top 10 overall
    const allTop = Object.values(dashboardData.top10StudentsByClass).flat();
    top10Performers = allTop
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(s => ({ ...s, class: s.section, score: Math.round(s.score) })); // Ensure 'class' property exists
  }

  // --- RISK BREAKDOWN MODAL/EXPANDABLE ---
  const riskData = [
    { name: "High Risk", value: dashboardData.riskBreakdown.highRiskPercentage, color: "#ef4444" },
    { name: "Medium Risk", value: dashboardData.riskBreakdown.mediumRiskPercentage, color: "#f59e42" },
    { name: "Safe", value: dashboardData.riskBreakdown.safePercentage, color: "#10b981" },
  ];

  // --- PERFORMANCE TREND LOGIC ---
  let trendData: { month: string; score: number }[] = [];
  let trendSubject: string = filter.subject || "Physics";
  // Always fallback to Physics if subject not found
  if (filter.examType === "Weekly") {
    trendData = dashboardData.performanceTrend.weekly[trendSubject] || dashboardData.performanceTrend.weekly["Physics"];
  } else if (filter.examType === "Cumulative") {
    trendData = dashboardData.performanceTrend.cumulative[trendSubject] || dashboardData.performanceTrend.cumulative["Physics"];
  } else if (filter.examType === "Grand Test") {
    trendData = dashboardData.performanceTrend.grandTest.overall;
    trendSubject = "";
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-12 mx-auto w-full">
        {/* Section: Filters */}
        <div className="bg-white/80 rounded-2xl shadow-lg border border-blue-100 px-6 py-5 mb-2">
          <FilterBar institutions={institutionOptions} batches={batchOptions} classes={sectionOptions} />
        </div>

        {/* --- PERFORMANCE ANALYTICS SECTION --- */}
        <section className="mb-12">
          {/* Row 1: Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-7 mb-12">
            {[
              { label: 'Total Tests Conducted', value: <CountUp end={dashboardData.totalTestConducted} /> },
              { label: 'Average Accuracy %', value: <><CountUp end={dashboardData.avgAccuracyPercentage} decimals={1} />%</> },
              {
                label: 'Average Total Score',
                value: <><CountUp end={avgTotalScore} decimals={1} /> <span className="text-xs text-slate-400 font-semibold">/ {maxMarks}</span></>
              },
              { label: 'Average Attempt Rate (%)', value: <CountUp end={dashboardData.avgAttemptRatePercentage} decimals={1} />, color: '#f97316' },
              {
                label: 'Top 10% Avg Score',
                value: <><CountUp end={top10PercentAvgScore} decimals={1} /> <span className="text-xs text-slate-400 font-semibold">/ {maxMarks}</span></>,
                color: '#1e40af'
              },
              {
                label: 'Bottom 10% Avg Score',
                value: <><CountUp end={bottom10PercentAvgScore} decimals={1} /> <span className="text-xs text-slate-400 font-semibold">/ {maxMarks}</span></>,
                color: '#dc2626'
              },
            ].map((card, i) => (
              <div
                key={card.label}
                className="bg-white/90 p-6 rounded-2xl shadow-md border border-blue-100 flex flex-col items-center justify-center min-h-[130px] h-full transition-all duration-200 group relative overflow-hidden"
                style={card.color ? { boxShadow: `0 4px 24px 0 ${card.color}22` } : {}}
              >
                <span className="text-[15px] font-semibold uppercase text-slate-500 mb-2 tracking-wider group-hover:text-blue-700 transition-colors text-center">{card.label}</span>
                <span className="text-[32px] font-extrabold drop-shadow-sm group-hover:text-blue-700 transition-colors flex items-end gap-1 text-center" style={card.color ? { color: card.color } : {}}>{card.value}</span>
                <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl font-black select-none pointer-events-none text-blue-200">{i + 1}</div>
              </div>
            ))}
          </div>

          {/* Row 2: Main Visuals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Left: Score Distribution + KPI Cards */}
            <div className="md:col-span-1 flex flex-col gap-6">
              {/* Gauge Chart with fixed aspect ratio container */}
              <div className="bg-white/90 p-4 rounded-2xl shadow-md border border-blue-100 w-full h-[320px]">
                <AverageTotalScoreGauge
                  avgScore={avgTotalScore}
                  maxMarks={maxMarks}
                />
              </div>

              <div className="bg-white/90 p-4 rounded-2xl shadow-md border border-green-100 flex flex-col min-h-[56px] h-[56px] justify-center items-center transition-all duration-200">
                <span className="text-[20px] font-bold text-emerald-600">
                  <CountUp end={dashboardData.improvingStudentsPercentage} decimals={1} suffix="%" />
                </span>
                <span className="text-[12px] text-slate-500 mt-1 font-medium">% of Students Improving</span>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl shadow-md border border-blue-100 flex flex-col min-h-[56px] h-[56px] justify-center items-center transition-all duration-200">
                <span className="text-[20px] font-bold text-blue-700">{dashboardData.bestPerformingClass}</span>
                <span className="text-[12px] text-slate-500 mt-1 font-medium">Best Performing Section</span>
              </div>
            </div>

            {/* Center: Risk Breakdown Pie + KPI Cards */}
            <div className="md:col-span-1 flex flex-col gap-6">
              <div className="bg-white/90 p-8 rounded-2xl shadow-md border border-red-100 flex flex-col min-h-[320px] justify-between items-center">
                <span className="text-lg font-bold text-red-900 mb-2 tracking-wide">Risk Breakdown</span>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      fill="#8884d8"
                      label={props => {
                        const { name, percent, cx, cy, midAngle, outerRadius } = props;
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 18;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#22223b"
                            fontSize={13}
                            fontWeight={500}
                            textAnchor={x > cx ? "start" : "end"}
                            alignmentBaseline="middle"
                            style={{ pointerEvents: "none", whiteSpace: "pre" }}
                          >
                            {name} {Math.round(percent * 100)}%
                          </text>
                        );
                      }}
                    >
                      {riskData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 rounded shadow px-3 py-2 text-xs text-blue-900">
                            <b>{d.name}</b>
                          </div>
                        );
                      }
                      return null;
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Most Improved/Most Dropped Subject */}
              <div className="bg-white/90 p-4 rounded-2xl shadow-md border border-amber-100 flex flex-col min-h-[56px] h-[56px] justify-center items-center transition-all duration-200">
                <span className="text-[20px] font-bold text-amber-600">{dashboardData.mostImprovedSubject}</span>
                <span className="text-[12px] text-slate-500 mt-1 font-medium">Most Improved Subject</span>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl shadow-md border border-slate-100 flex flex-col min-h-[56px] h-[56px] justify-center items-center transition-all duration-200">
                <span className="text-[20px] font-bold text-slate-700">{dashboardData.mostDroppedSubject}</span>
                <span className="text-[12px] text-slate-500 mt-1 font-medium">Most Dropped Subject</span>
              </div>
            </div>

            {/* Right: NEET Readiness + Performance Trend */}
            <div className="flex flex-col gap-6 md:col-span-1">
              {/* NEET Readiness Card */}
              <div className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 px-8 py-6 flex flex-col items-center w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-blue-900">NEET Readiness</span>
                </div>
                <span className="text-5xl font-extrabold text-emerald-600 mb-1">
                  <CountUp end={dashboardData.neetReadiness.overallPercentage} decimals={1} suffix="%" />
                </span>
                <span className="text-sm text-slate-500 font-medium">% students scoring ≥ 75% of max marks</span>
              </div>
              {/* Performance Trend Card */}
              <div>
                <MonthlyPerformanceHistogram trendData={trendData} maxMarks={maxMarks} subject={trendSubject} />
              </div>
            </div>
          </div>
        </section>

        {/* Section: Performers */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <DashboardCard
            title="Top 10 Performers"
            className="md:col-span-12 bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6"
            content={(() => (
              <div className="w-full">
                <div className="overflow-x-auto rounded-xl border border-blue-50 bg-white/80">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-center border-b border-blue-100 bg-blue-50/40">
                        <th className="py-2 text-blue-500 font-semibold">Rank</th>
                        <th className="py-2 text-blue-500 font-semibold">Name</th>
                        <th className="py-2 text-blue-500 font-semibold">Section</th>
                        <th className="py-2 text-blue-500 font-semibold">Overall Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top10Performers.map((s, i) => (
                        <tr key={i} className="border-b border-blue-50 hover:bg-blue-100/30 transition-all duration-200 text-center">
                          <td className="py-2 text-blue-900 font-semibold">{i + 1}</td>
                          <td className="py-2 text-blue-900">{s.name}</td>
                          <td className="py-2 text-blue-900">{s.section}</td>
                          <td className="py-2 font-medium text-blue-700">{s.score} / {maxMarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))()}
          />
        </div>
      </main>
    </div>
  );
}