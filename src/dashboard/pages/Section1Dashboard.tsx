import { useEffect, useState } from "react";
import { useFilter } from "@/lib/DashboardFilterContext";
import FilterBar from "@/components/FilterBar";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import PerformanceTrendBarChart from "@/components/ui/analytics/PerformanceTrendBarChart";
import AverageTotalScoreGauge from "../../components/ui/AverageTotalScoreGauge";
import type { DashboardData } from "@/types/dashboard";
import DashboardCard from "@/components/ui/DashboardCard";
import CountUp from "@/components/ui/CountUp";
import DataTable, { type TableRow } from "../components/tables/DataTable";
import { BarChart2, PercentCircle, Star, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

// --- MOCK DATA GENERATION ---
// All mock data and generator functions have been moved to DummyData/Section1DashboardData.ts
import { fetchScores } from "@/DummyData/Section1DashboardData";

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

  // Metric cards config for dashboard
  const metricCards = [
    {
      icon: <BarChart2 className="w-9 h-9 text-blue-600" />, // Total Tests
      label: 'Total Tests Conducted',
      value: <CountUp end={dashboardData.totalTestConducted} />,
    },
    {
      icon: <PercentCircle className="w-9 h-9 text-blue-600" />, // Accuracy
      label: 'Average Accuracy %',
      value: <><CountUp end={dashboardData.avgAccuracyPercentage} decimals={1} />%</>,
    },
    {
      icon: <Star className="w-9 h-9 text-blue-600" />, // Total Score
      label: 'Average Total Score',
      value: <><CountUp end={avgTotalScore} decimals={1} /> <span className="text-xs text-slate-400 font-semibold">/ {maxMarks}</span></>,
    },
    {
      icon: <TrendingUp className="w-9 h-9 text-blue-600" />, // Attempt Rate
      label: 'Average Attempt Rate (%)',
      value: <CountUp end={dashboardData.avgAttemptRatePercentage} decimals={1} />,
    },
    {
      icon: <ArrowUpRight className="w-9 h-9 text-blue-600" />, // Top 10%
      label: 'Top 10% Avg Score',
      value: <><CountUp end={top10PercentAvgScore} decimals={1} /> <span className="text-xs text-slate-400 font-semibold">/ {maxMarks}</span></>,
    },
    {
      icon: <ArrowDownRight className="w-9 h-9 text-blue-600" />, // Bottom 10%
      label: 'Bottom 10% Avg Score',
      value: <><CountUp end={bottom10PercentAvgScore} decimals={1} /> <span className="text-xs text-slate-400 font-semibold">/ {maxMarks}</span></>,
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="px-6 md:px-12 py-10 space-y-12 mx-auto w-full">
        {/* Section: Filters */}
        {/* <div className="bg-white/80 rounded-2xl shadow-lg border border-blue-100 px-6 py-5 mb-2"> */}
          <FilterBar institutions={institutionOptions} batches={batchOptions} classes={sectionOptions} />
        {/* </div> */}

        {/* --- PERFORMANCE ANALYTICS SECTION --- */}
        <section className="mb-12">
          {/* Row 1 & 2: Metric Cards in two rows */}
          <div className="w-full flex flex-col gap-0 shadow-lg rounded-2xl overflow-hidden mb-12">
            <div className="flex flex-row w-full">
              {metricCards.slice(0, 3).map((card, idx) => (
                <div
                  key={card.label}
                  className={`flex flex-1 items-center py-6 px-8 min-w-0 bg-white ${
                    idx === 0 ? "rounded-tl-2xl" : "border-l border-[#E9E9E9]"
                  } ${idx === 2 ? "rounded-tr-2xl" : ""}`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-semibold text-gray-900 truncate">
                      {card.label}
                    </span>
                    <span className="mt-1 truncate font-extrabold text-gray-900 text-2xl">
                      {card.value}
                    </span>
                  </div>
                  <div className="flex items-center justify-center ml-auto">
                    <span className="inline-flex items-center justify-center rounded-full border border-blue-400 bg-white w-16 h-16">
                      {card.icon}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-row w-full border-t border-[#E9E9E9]">
              {metricCards.slice(3, 6).map((card, idx) => (
                <div
                  key={card.label}
                  className={`flex flex-1 items-center py-6 px-8 min-w-0 bg-white ${
                    idx === 0 ? "rounded-bl-2xl" : "border-l border-[#E9E9E9]"
                  } ${idx === 2 ? "rounded-br-2xl" : ""}`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-semibold text-gray-900 truncate">
                      {card.label}
                    </span>
                    <span className="mt-1 truncate font-extrabold text-gray-900 text-2xl">
                      {card.value}
                    </span>
                  </div>
                  <div className="flex items-center justify-center ml-auto">
                    <span className="inline-flex items-center justify-center rounded-full border border-blue-400 bg-white w-16 h-16">
                      {card.icon}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Main Visuals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Left: Score Distribution + KPI Cards */}
            <div className="md:col-span-1 flex flex-col gap-6">
              {/* Average Total Score Card - improved layout */}
              <div className="w-full border border-blue-100 rounded-2xl p-6 bg-white/90 shadow-md flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-blue-900">Average Total Score</span>
                  <span className="ml-2 px-3 py-2 text-xs rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-semibold">Max: {maxMarks}</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[320px]">
                  <AverageTotalScoreGauge avgScore={avgTotalScore} maxMarks={maxMarks} />
                  {/* <span className="mt-4 text-2xl font-extrabold text-blue-700">{avgTotalScore} <span className="text-base font-medium text-slate-500">/ {maxMarks}</span></span> */}
                </div>
              </div>
            </div>

            {/* Center: Risk Breakdown Pie + KPI Cards */}
            <div className="md:col-span-1 flex flex-col gap-6">
              <div className="w-full border border-red-100 rounded-2xl p-6 bg-white/90 shadow-md flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-red-900">Risk Breakdown</span>
                </div>
                <div className="flex flex-col items-center justify-center h-[325px] w-full">
                  <ResponsiveContainer width="100%" height={200}>
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
                  <div className="flex justify-center gap-4 mt-4">
                    <span className="flex items-center gap-1 text-xs text-red-500 font-semibold"><span className="inline-block w-3 h-3 rounded-full bg-red-400"></span> High</span>
                    <span className="flex items-center gap-1 text-xs text-orange-400 font-semibold"><span className="inline-block w-3 h-3 rounded-full bg-orange-400"></span> Medium</span>
                    <span className="flex items-center gap-1 text-xs text-emerald-500 font-semibold"><span className="inline-block w-3 h-3 rounded-full bg-emerald-400"></span> Safe</span>
                  </div>
                </div>
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
                <PerformanceTrendBarChart trendData={trendData} maxMarks={maxMarks} subject={trendSubject} />
              </div>
            </div>
          </div>
        </section>

        {/* Section: Performers */}
        {/* KPI Row above the table */}
         {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center bg-white border border-green-200 rounded-lg px-4 py-3 shadow-sm">
            <span className="text-xl font-bold text-emerald-600 mr-3"><CountUp end={dashboardData.improvingStudentsPercentage} decimals={1} suffix="%" /></span>
            <span className="text-sm text-slate-600 font-medium"> of Students Improving</span>
          </div>
          <div className="flex items-center bg-white border border-amber-200 rounded-lg px-4 py-3 shadow-sm">
            <span className="text-sm text-slate-600 font-medium mr-3">Most Improved Subject</span>
            <span className="text-base font-bold text-amber-600">{dashboardData.mostImprovedSubject}</span>           
          </div>
          <div className="flex items-center bg-white border border-blue-200 rounded-lg px-4 py-3 shadow-sm">
            <span className="text-sm text-slate-600 font-medium mr-3">Best Performing Section</span>
            <span className="text-base font-bold text-blue-700 ">{dashboardData.bestPerformingClass}</span>            
          </div>
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm">
            <span className="text-sm text-slate-600 font-medium mr-3">Most Dropped Subject</span>
            <span className="text-base font-bold text-slate-700">{dashboardData.mostDroppedSubject}</span>
          </div>
        </div> * */}

        {/* KPI Row above the table */}
<div className="w-full bg-white/90 border border-blue-100 rounded-2xl shadow-lg px-6 py-4 mb-6 flex flex-col gap-2">
  <div className="flex flex-wrap md:flex-nowrap gap-4 w-full">
    <div className="flex-1 min-w-[180px] flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50">
      <span className="text-2xl font-extrabold text-emerald-600">
        <CountUp end={dashboardData.improvingStudentsPercentage} decimals={1} suffix="%" />
      </span>
      <span className="text-sm text-slate-700 font-medium">of Students Improving</span>
    </div>
    <div className="flex-1 min-w-[180px] flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50">
      <span className="text-sm text-slate-700 font-medium">Most Improved Subject</span>
      <span className="ml-auto text-base font-bold text-amber-600">{dashboardData.mostImprovedSubject}</span>
    </div>
    <div className="flex-1 min-w-[180px] flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50">
      <span className="text-sm text-slate-700 font-medium">Best Performing Section</span>
      <span className="ml-auto text-base font-bold text-blue-700">{dashboardData.bestPerformingClass}</span>
    </div>
    <div className="flex-1 min-w-[180px] flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
      <span className="text-sm text-slate-700 font-medium">Most Dropped Subject</span>
      <span className="ml-auto text-base font-bold text-slate-700">{dashboardData.mostDroppedSubject}</span>
    </div>
  </div>
</div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <DashboardCard
            title="Top 10 Performers"
            className="md:col-span-12 bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6"
            content={(() => (
              <div className="w-full">
                <DataTable
                  rows={top10Performers.map((s, i): TableRow => ({
                    id: i + 1,
                    name: s.name,
                    section: s.section,
                    score: s.score,
                  }))}
                  columns={[
                    { field: "id", label: "Rank", align: "center" },
                    { field: "name", label: "Name", align: "center" },
                    { field: "section", label: "Section", align: "center" },
                    { field: "score", label: `Overall Score`, align: "center" },
                  ]}
                  renderCell={(row, col) => {
                    if (col.field === "score") {
                      return `${row.score} / ${maxMarks}`;
                    }
                    return row[col.field as keyof TableRow] ?? "";
                  }}
                />
              </div>
            ))()}
          />
        </div>
      </main>
    </div>
  );
}