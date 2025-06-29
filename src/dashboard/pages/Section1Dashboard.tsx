import { useCallback, useEffect, useState } from "react";
import DashboardCard from "@/components/ui/DashboardCard";
import { format, isWithinInterval, subDays } from "date-fns";
import CountUp from "@/components/ui/CountUp";
import { useFilter } from "@/lib/DashboardFilterContext";
import FilterBar from "@/components/FilterBar";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import MonthlyPerformanceHistogram from "@/components/ui/analytics/MonthlyPerformanceHistogram";
import AverageTotalScoreGauge from "../../components/ui/AverageTotalScoreGauge";
import { getDashboardData } from "../../api/dashboard.api";
import type { DashboardData, DashboardFilter } from "../../types/dashboard";

export default function Section1Dashboard() {
  const { filter } = useFilter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: DashboardFilter = {
        fromDate: filter.dateRange.from.toISOString().slice(0, 10),
        toDate: filter.dateRange.to.toISOString().slice(0, 10),
        institution: filter.institution,
        batch: filter.batch,
        class: filter.class,
        examType: filter.examType.toLowerCase() as DashboardFilter["examType"],
        ...(filter.subject ? { subject: filter.subject } : {}),
      };
      const data = await getDashboardData(payload);
      setDashboardData(data);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) return <div className="p-10 text-center text-lg">Loading dashboard...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!dashboardData) return null;

  const classOptions = Object.keys(dashboardData.neetReadiness.classWisePercentages);
  const batchOptions = ["A", "B", "C"];

  const riskData = [
    { name: "High Risk", value: dashboardData.riskBreakdown.highRiskPercentage, color: "#ef4444", insight: `${dashboardData.riskBreakdown.highRiskPercentage}% students at high risk` },
    { name: "Medium Risk", value: dashboardData.riskBreakdown.mediumRiskPercentage, color: "#f59e42", insight: `${dashboardData.riskBreakdown.mediumRiskPercentage}% students at medium risk` },
    { name: "Safe", value: dashboardData.riskBreakdown.safePercentage, color: "#10b981", insight: `${dashboardData.riskBreakdown.safePercentage}% students safe` },
  ];

  const getExamConfig = () => {
    if (filter.examType === "Weekly") {
      switch (filter.subject) {
        case "Physics": return { questions: 30, marks: 120 };
        case "Chemistry": return { questions: 45, marks: 180 };
        case "Botany": return { questions: 60, marks: 240 };
        case "Zoology": return { questions: 60, marks: 240 };
        default: return { questions: 0, marks: 0 };
      }
    } else if (filter.examType === "Cumulative") {
      switch (filter.subject) {
        case "Physics + Botany": return { questions: 100, marks: 400 };
        case "Chemistry + Zoology": return { questions: 100, marks: 400 };
        default: return { questions: 0, marks: 0 };
      }
    } else if (filter.examType === "Grand Test") {
      return { questions: 180, marks: 720 };
    }
    return { questions: 0, marks: 0 };
  };
  const examConfig = getExamConfig();

  let subjectOptions: string[] = [];
  if (filter.examType === "weekly") {
    subjectOptions = ["Physics", "Chemistry", "Maths", "Zoology"];
  } else if (filter.examType === "cumulative") {
    subjectOptions = ["Physics + Botany", "Chemistry + Zoology"];
  }

  let trendData: { month: string; score: number }[] = [];
  let trendSubject = "";
  let trendMaxMarks = 0;
  if (dashboardData.performanceTrend) {
    const examTypeKey = filter.examType.trim().toLowerCase();
    let subjectKey = filter.subject || "Physics";
    if (examTypeKey === "weekly") {
      if (subjectKey.toLowerCase() === "math" || subjectKey.toLowerCase() === "maths") subjectKey = "Maths";
      if (subjectKey.toLowerCase() === "zoology") subjectKey = "Zoology";
      if (subjectKey.toLowerCase() === "chemistry") subjectKey = "Chemistry";
      if (subjectKey.toLowerCase() === "physics") subjectKey = "Physics";
      trendSubject = subjectKey;
      trendData = dashboardData.performanceTrend.weekly[trendSubject] || [];
      const maxMarksMap: Record<string, number> = { Physics: 120, Chemistry: 180, Maths: 200, Zoology: 240 };
      trendMaxMarks = maxMarksMap[trendSubject] || 0;
    } else if (examTypeKey === "cumulative") {
      if (subjectKey.toLowerCase().includes("physics")) subjectKey = "Physics + Botany";
      if (subjectKey.toLowerCase().includes("chemistry")) subjectKey = "Chemistry + Zoology";
      trendSubject = subjectKey;
      trendData = dashboardData.performanceTrend.cumulative[trendSubject] || [];
      const maxMarksMap: Record<string, number> = { "Physics + Botany": 400, "Chemistry + Zoology": 400 };
      trendMaxMarks = maxMarksMap[trendSubject] || 0;
    } else if (examTypeKey === "grand" || examTypeKey === "grand test") {
      trendSubject = "Grand";
      trendData = dashboardData.performanceTrend.grandTest.overall || [];
      trendMaxMarks = 720;
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-12 mx-auto w-full">
        {/* Section: Filters */}
        <div className="bg-white/80 rounded-2xl shadow-lg border border-blue-100 px-6 py-5 mb-2">
          <FilterBar institutions={[]} batches={batchOptions} classes={classOptions} />
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
                value: <><CountUp end={dashboardData.avgTotalScore} decimals={1} /> <span className="text-xs text-slate-400 font-semibold">/ {examConfig.marks}</span></>
              },
              { label: 'Average Attempt Rate (%)', value: <CountUp end={dashboardData.avgAttemptRatePercentage} decimals={1} />, color: '#f97316' },
              {
                label: 'Top 10% Avg Score',
                value: <><CountUp end={dashboardData.top10PercentAvgScore} decimals={1} /> <span className="text-xs text-slate-400 font-semibold">/ {examConfig.marks}</span></>,
                color: '#1e40af'
              },
              {
                label: 'Bottom 10% Avg Score',
                value: <><CountUp end={dashboardData.bottom10PercentAvgScore} decimals={1} /> <span className="text-xs text-slate-400 font-semibold">/ {examConfig.marks}</span></>,
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
                  avgScore={dashboardData.avgTotalScore}
                  maxMarks={examConfig.marks}
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
                <span className="text-[12px] text-slate-500 mt-1 font-medium">Best Performing Class</span>
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
                            <b>{d.name}</b><br />{d.insight}
                          </div>
                        );
                      }
                      return null;
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl shadow-md border border-amber-100 flex flex-col min-h-[56px] h-[56px] justify-center items-center transition-all duration-200">
                <span className="text-[20px] font-bold text-amber-600">{dashboardData.mostImprovedSubject}</span>
                <span className="text-[12px] text-slate-500 mt-1 font-medium">Most Improved Subject</span>
              </div>

              <div className="bg-white/90 p-4 rounded-2xl shadow-md border border-slate-100 flex flex-col min-h-[56px] h-[56px] justify-center items-center transition-all duration-200">
                <span className="text-[20px] font-bold text-slate-700">{dashboardData.mostDroppedSubject}</span>
                <span className="text-[12px] text-slate-500 mt-1 font-medium">Most Dropped Subject</span>
              </div>
            </div>

            {/* Right: NEET Readiness & Improvement Trend */}
            <div className="flex flex-col gap-6">
              <div className="bg-white/90 p-6 rounded-2xl shadow-md border border-blue-100 flex flex-col min-h-[160px] h-[160px] flex-1 relative items-center justify-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-blue-900 tracking-wide">NEET Readiness</span>
                  <select
                    className="ml-2 px-2 py-1 text-xs rounded border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={"Overall"}
                    onChange={() => { }}
                  >
                    <option value="Overall">Overall</option>
                    {classOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center">
                  <span className="text-5xl font-extrabold text-emerald-600 drop-shadow-sm"><CountUp end={dashboardData.neetReadiness.overallPercentage} decimals={1} suffix="%" /></span>
                  <span className="text-[14px] text-slate-500 mt-2 font-medium">% students scoring ≥ 75% of max marks</span>
                </div>
              </div>

              <MonthlyPerformanceHistogram trendData={trendData} maxMarks={trendMaxMarks} subject={trendSubject} />
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
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
                  <div className="flex flex-col flex-1 min-w-[120px]">
                    <label className="text-xs text-slate-500 font-semibold mb-1">Select Batch</label>
                    <select className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-blue-200" value={batchOptions[0]} onChange={() => { }}>
                      {batchOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col flex-1 min-w-[120px]">
                    <label className="text-xs text-slate-500 font-semibold mb-1">Select Class</label>
                    <select className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-blue-200" value={"All"} onChange={() => { }}>
                      <option value="All">All</option>
                      {classOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  {subjectOptions.length > 0 && (
                    <div className="flex flex-col flex-1 min-w-[120px]">
                      <label className="text-xs text-slate-500 font-semibold mb-1">Select Subject</label>
                      <select
                        className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-blue-200"
                        value={filter.subject || subjectOptions[0]}
                        onChange={e => { }}
                      >
                        {subjectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="overflow-x-auto rounded-xl border border-blue-50 bg-white/80">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-center border-b border-blue-100 bg-blue-50/40">
                        <th className="py-2 text-blue-500 font-semibold">Rank</th>
                        <th className="py-2 text-blue-500 font-semibold">Name</th>
                        <th className="py-2 text-blue-500 font-semibold">Class</th>
                        <th className="py-2 text-blue-500 font-semibold">Overall Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.top10Performers.map((s, i) => (
                        <tr key={i} className="border-b border-blue-50 hover:bg-blue-100/30 transition-all duration-200 text-center">
                          <td className="py-2 text-blue-900 font-semibold">{i + 1}</td>
                          <td className="py-2 text-blue-900">{s.name}</td>
                          <td className="py-2 text-blue-900">{s.class}</td>
                          <td className="py-2 font-medium text-blue-700">{s.score}</td>
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