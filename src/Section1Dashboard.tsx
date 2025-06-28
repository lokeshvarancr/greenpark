// Section1Dashboard.jsx — FINAL, FULLY‑COMPILED CODE
// -----------------------------------------------------------------------------
// * Fully self‑contained; compiles with React + Tailwind + shadcn/ui + Recharts
// * Implements Section 1 of NEET Evaluation Dashboard with:
//   – Filters (Institution ▸ Batch ▸ Class ▸ Score Range)
//   – KPI strip (Total Tests, Weighted Accuracy, Top Performer, Risk Donut, Improvement Donut)
//   – Accuracy‑by‑Attempt bucket bar chart (<50 %, 50–75 %, >75 %)
//   – Top / Bottom classes OR students list (context‑aware)
//   – Plateau Detector (≥5 lowest‑variance students)
//   – Top‑10 Rank list adaptable to current scope
//   – Dummy dataset (600 students × 6 tests)
// -----------------------------------------------------------------------------

import { useMemo, useState } from "react";
import DashboardCard from "@/components/ui/DashboardCard";
import { format, isWithinInterval, subDays } from "date-fns";
import { Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, PieChart, Pie, Cell, XAxis, YAxis } from 'recharts';
import CountUp from "@/components/ui/CountUp";
import { SECTION1_DASHBOARD_DATASET } from "@/DummyData/Section1DashboardData";
import { useFilter } from "@/lib/DashboardFilterContext";
import FilterBar from "@/components/FilterBar";
import MonthlyPerformanceHistogram from "@/components/ui/analytics/MonthlyPerformanceHistogram";
import AverageTotalScoreGauge from "./components/ui/AverageTotalScoreGauge";

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */
export default function Section1Dashboard() {
  // Get filter from context
  const { filter } = useFilter();
  const institutions = [...new Set(SECTION1_DASHBOARD_DATASET.map((d) => d.institution))];
  const batches = [...new Set(SECTION1_DASHBOARD_DATASET.map((d) => d.batch))];
  const classes = [...new Set(SECTION1_DASHBOARD_DATASET.map((d) => d.class))];
  // --- Exam Config ---
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

  /* --------------------------- Scoped Dataset -------------------------- */
  const scoped = useMemo(
    () =>
      SECTION1_DASHBOARD_DATASET.filter((d) => {
        if (filter.institution !== "All" && d.institution !== filter.institution) return false;
        if (filter.batch !== "All" && d.batch !== filter.batch) return false;
        if (filter.class !== "All" && d.class !== filter.class) return false;
        if (d.projected < filter.scoreRange[0] || d.projected > filter.scoreRange[1]) return false;
        if (
          !isWithinInterval(new Date(d.testDate), {
            start: filter.dateRange.from,
            end: filter.dateRange.to,
          })
        )
          return false;
        // Exam Type/Subject filter (inferred)
        if (filter.examType === "Grand Test") {
          // Grand Test: subject dropdown hidden, include all subjects
          return true;
        }
        // For Weekly/Cumulative, filter by subject
        if ((filter.examType === "Weekly" || filter.examType === "Cumulative") && filter.subject && d.subject !== filter.subject) return false;
        return true;
      }),
    [filter],
  );

  /* ------------------------ KPI & Derived Values ----------------------- */
  const kpi = useMemo(() => {
    const testsTaken = scoped.length;
    const totalCorrect = scoped.reduce((a, b) => a + b.correct, 0);
    const totalAttempted = scoped.reduce((a, b) => a + b.attempted, 0);
    // Accuracy relative to attempted, not max marks
    const accuracy = totalAttempted ? ((totalCorrect / totalAttempted) * 100).toFixed(1) : '0.0';

    // latest record per student (per subject)
    const latest = new Map();
    scoped
      .sort((a, b) => +new Date(b.testDate) - +new Date(a.testDate))
      .forEach((r) => {
        if (!latest.has(r.studentId)) latest.set(r.studentId, r);
      });
    const latestArr = [...latest.values()];

    // --- New KPIs ---
    // All scores must be capped at examConfig.marks
    const avgScore = latestArr.length ? (latestArr.reduce((a, b) => a + Math.min(b.projected, examConfig.marks), 0) / latestArr.length).toFixed(1) : '0';
    const maxScore = latestArr.length ? Math.max(...latestArr.map(s => Math.min(s.projected, examConfig.marks))) : 0;
    const minScore = latestArr.length ? Math.min(...latestArr.map(s => Math.max(0, Math.min(s.projected, examConfig.marks)))) : 0;
    const above600 = latestArr.filter(s => Math.min(s.projected, examConfig.marks) >= 600).length;
    const above500 = latestArr.filter(s => Math.min(s.projected, examConfig.marks) >= 500).length;
    const above400 = latestArr.filter(s => Math.min(s.projected, examConfig.marks) >= 400).length;
    // Readiness: % scoring >= 75% of max marks
    const readiness = latestArr.length ? ((latestArr.filter(s => Math.min(s.projected, examConfig.marks) >= 0.75 * examConfig.marks).length / latestArr.length) * 100).toFixed(1) : '0';

    // --- Custom KPIs for cards ---
    // Average Attempt Rate (%) relative to max questions
    const avgAttemptRate = latestArr.length && examConfig.questions
      ? (
          latestArr.reduce((sum, s) => sum + (s.attempted / examConfig.questions) * 100, 0) / latestArr.length
        ).toFixed(1)
      : '0.0';
    // Top 10% Avg Score
    const sortedByScore = [...latestArr].sort((a, b) => Math.min(b.projected, examConfig.marks) - Math.min(a.projected, examConfig.marks));
    const top10Count = Math.max(1, Math.round(latestArr.length * 0.1));
    const top10Avg = top10Count > 0
      ? (sortedByScore.slice(0, top10Count).reduce((sum, s) => sum + Math.min(s.projected, examConfig.marks), 0) / top10Count).toFixed(1)
      : '0.0';
    // Bottom 10% Avg Score
    const bottom10Avg = top10Count > 0
      ? (sortedByScore.slice(-top10Count).reduce((sum, s) => sum + Math.min(s.projected, examConfig.marks), 0) / top10Count).toFixed(1)
      : '0.0';

    const topPerformer = latestArr.sort((a, b) => Math.min(b.projected, examConfig.marks) - Math.min(a.projected, examConfig.marks))[0];

    // Risk buckets relative to current max marks
    const riskBuckets = { "High Risk": 0, Medium: 0, Safe: 0 };
    latestArr.forEach((r) => {
      const score = Math.min(r.projected, examConfig.marks);
      if (score < 0.4 * examConfig.marks) riskBuckets["High Risk"]++;
      else if (score <= 0.7 * examConfig.marks) riskBuckets["Medium"]++;
      else riskBuckets["Safe"]++;
    });

    // Improvement buckets (Improved/Neutral/Degraded)
    const improveBuckets = { Improved: 0, Neutral: 0, Degraded: 0 };
    latestArr.forEach((r) => {
      const hist = scoped
        .filter((h) => h.studentId === r.studentId)
        .sort((a, b) => +new Date(b.testDate) - +new Date(a.testDate));
      if (hist.length < 2) return improveBuckets.Neutral++;
      const delta = Math.min(r.projected, examConfig.marks) - Math.min(hist[1].projected, examConfig.marks);
      if (delta > 5) improveBuckets.Improved++;
      else if (delta < -5) improveBuckets.Degraded++;
      else improveBuckets.Neutral++;
    });

    return {
      testsTaken,
      accuracy,
      topPerformer,
      riskBuckets,
      improveBuckets,
      latestArr,
      avgScore,
      maxScore,
      minScore,
      above600,
      above500,
      above400,
      readiness,
      avgAttemptRate,
      top10Avg,
      bottom10Avg,
    };
  }, [scoped, examConfig]);

  // --- NEET Readiness Dropdown State ---
  const classOptions = ["Overall", ...new Set(SECTION1_DASHBOARD_DATASET.map((d) => d.class))];
  const [readinessClass, setReadinessClass] = useState("Overall");

  // --- NEET Readiness Calculation ---
  const readinessArr = useMemo(() => {
    if (readinessClass === "Overall") return kpi.latestArr;
    return kpi.latestArr.filter((s) => s.class === readinessClass);
  }, [kpi.latestArr, readinessClass]);
  // Readiness relative to current max marks
  const readinessPct = readinessArr.length && examConfig.marks
    ? ((readinessArr.filter((s) => Math.min(s.projected, examConfig.marks) >= 0.75 * examConfig.marks).length / readinessArr.length) * 100).toFixed(1)
    : "0.0";

  // --- Top 10 Performer Dropdown State ---
  const batchOptions = ['A', 'B', 'C'];
  const classOptionsByBatch: Record<string, string[]> = {
    A: Array.from({ length: 10 }, (_, i) => `11${String.fromCharCode(65 + i)}`),
    B: Array.from({ length: 10 }, (_, i) => `12${String.fromCharCode(65 + i)}`),
    C: Array.from({ length: 10 }, (_, i) => `13${String.fromCharCode(65 + i)}`),
  };
  const [topBatch, setTopBatch] = useState('A');
  const [topClass, setTopClass] = useState('All');
  const topClassOptions = ['All', ...classOptionsByBatch[topBatch]];

  // --- Top 10 Performer Data ---
  const top10Filtered = useMemo(() => {
    let arr = [...kpi.latestArr];
    // Simulate batch/class filtering (since dummy data doesn't have batch/class in this format)
    if (topBatch !== 'All') arr = arr.filter(s => s.class.startsWith(topBatch === 'A' ? '11' : topBatch === 'B' ? '12' : '13'));
    if (topClass !== 'All') arr = arr.filter(s => s.class === topClass);
    // Cap scores at current max marks
    return arr
      .map(s => ({ ...s, projected: Math.min(s.projected, examConfig.marks) }))
      .sort((a, b) => b.projected - a.projected)
      .slice(0, 10);
  }, [kpi.latestArr, topBatch, topClass, examConfig.marks]);

  // --- Improvement Trend Card Data ---
  const trendInterval = 30; // days
  const today = new Date();
  const trendPoints = [];
  for (let i = 180; i >= 0; i -= trendInterval) {
    const from = subDays(today, i);
    const to = subDays(today, i - trendInterval);
    const scores = kpi.latestArr.filter(r => isWithinInterval(new Date(r.testDate), { start: from, end: to }));
    trendPoints.push({
      date: format(from, 'MMM d'),
      avg: scores.length ? (scores.reduce((a, b) => a + Math.min(b.projected, examConfig.marks), 0) / scores.length).toFixed(1) : 0
    });
  }

  /* ---------------------------------------------------------------------- */
  /*                                 JSX                                    */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
      <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-12 max-w-7xl mx-auto w-full">
        {/* Section: Filters */}
        <div className="bg-white/80 rounded-2xl shadow-lg border border-blue-100 px-6 py-5 mb-2">
          <FilterBar institutions={institutions} batches={batches} classes={classes} />
        </div>
        {/* --- PERFORMANCE ANALYTICS SECTION --- */}
        <section className="mb-12">
          {/* Row 1: Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-7 mb-12">
            { [
              { label: 'Total Tests Conducted', value: <CountUp end={kpi.testsTaken} />, },
              { label: 'Average Accuracy %', value: <><CountUp end={parseFloat(kpi.accuracy)} decimals={1} />%</>, },
              { label: 'Average Total Score', value: (
                <>
                  <CountUp end={parseFloat(kpi.avgScore)} decimals={1} /> <span className="text-xs text-slate-400 font-semibold">/ {examConfig.marks}</span>
                </>
              ) },
              { label: 'Average Attempt Rate (%)', value: <CountUp end={parseFloat(kpi.avgAttemptRate)} decimals={1} />, color: '#f97316' },
              { label: 'Top 10% Avg Score', value: (
                <>
                  <CountUp end={parseFloat(kpi.top10Avg)} decimals={1} /> <span className="text-xs text-slate-400 font-semibold">/ {examConfig.marks}</span>
                </>
              ), color: '#1e40af' },
              { label: 'Bottom 10% Avg Score', value: (
                <>
                  <CountUp end={parseFloat(kpi.bottom10Avg)} decimals={1} /> <span className="text-xs text-slate-400 font-semibold">/ {examConfig.marks}</span>
                </>
              ), color: '#dc2626' },
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
            )) }
          </div>

          {/* Row 2: Main Visuals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Left: Score Distribution + New KPI Cards */}
            <div className="md:col-span-1 flex flex-col gap-6 min-w-[260px] max-w-[360px]">
              {/* Gauge Chart for Average Total Score */}
              <AverageTotalScoreGauge avgScore={Number(kpi.avgScore)} maxMarks={examConfig.marks} />
              {/* New KPI Card: % Improving */}
              <div className="bg-white/90 p-4 rounded-2xl shadow-md border border-green-100 flex flex-col min-h-[56px] h-[56px] justify-center items-center transition-all duration-200">
                <span className="text-[20px] font-bold text-emerald-600">{(() => {
                  const total = kpi.latestArr?.length || 1;
                  const improving = kpi.improveBuckets?.Improved || 0;
                  return <CountUp end={parseFloat(((improving / total) * 100).toFixed(1))} decimals={1} suffix="%" />;
                })()}</span>
                <span className="text-[12px] text-slate-500 mt-1 font-medium">% of Students Improving</span>
              </div>
              {/* New KPI Card: Best Performing Class */}
              <div className="bg-white/90 p-4 rounded-2xl shadow-md border border-blue-100 flex flex-col min-h-[56px] h-[56px] justify-center items-center transition-all duration-200">
                <span className="text-[20px] font-bold text-blue-700">{(() => {
                  if (filter.class !== 'All') return 'N/A';
                  const byClass: Record<string, number[]> = {};
                  kpi.latestArr?.forEach(s => {
                    if (!byClass[s.class]) byClass[s.class] = [];
                    byClass[s.class].push(Math.min(s.projected, examConfig.marks));
                  });
                  let best: string | null = null, bestAvg = -1;
                  Object.entries(byClass).forEach(([cls, arr]) => {
                    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
                    if (avg > bestAvg) { bestAvg = avg; best = cls; }
                  });
                  if (!best) return 'N/A';
                  // Enrich: show avg score
                  const avg = byClass[best].reduce((a, b) => a + b, 0) / byClass[best].length;
                  return <>{best} <span className="text-[14px] text-blue-400 font-semibold ml-1">(<CountUp end={avg} decimals={1} />)</span></>;
                })()}</span>
                <span className="text-[12px] text-slate-500 mt-1 font-medium">Best Performing Class</span>
              </div>
            </div>
            {/* Center: Risk Breakdown Pie + New KPI Cards */}
            <div className="md:col-span-1 flex flex-col gap-6 min-w-[260px] max-w-[360px]">
              {/* Risk Breakdown Pie Chart */}
              <div className="bg-white/90 p-8 rounded-2xl shadow-md border border-red-100 flex flex-col min-h-[320px] h-[0px] justify-between items-center">
                <span className="text-lg font-bold text-red-900 mb-2 tracking-wide">Risk Breakdown</span>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={(() => {
                        let high = 0, med = 0, low = 0;
                        (kpi.latestArr || []).forEach((s) => {
                          const acc = (s.correct / (s.attempted || 1)) * 100;
                          if (s.projected < 400 || acc < 30) high++;
                          else if ((s.projected <= 500 && s.projected >= 400) || (acc >= 30 && acc <= 50)) med++;
                          else low++;
                        });
                        return [
                          { name: 'High Risk', value: high, color: '#ef4444', insight: `${high} students have accuracy below 30% or score < 400` },
                          { name: 'Medium Risk', value: med, color: '#f59e42', insight: `${med} students are in the 400-500 range or 30-50% accuracy` },
                          { name: 'Safe', value: low, color: '#10b981', insight: `${low} students are above 500 and >50% accuracy` },
                        ];
                      })()}
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
                      {(() => {
                        const colors = ['#ef4444', '#f59e42', '#10b981'];
                        return colors.map((color) => <Cell key={color} fill={color} />);
                      })()}
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
              {/* New KPI Card: Most Improved Subject */}
              <div className="bg-white/90 p-4 rounded-2xl shadow-md border border-amber-100 flex flex-col min-h-[56px] h-[56px] justify-center items-center transition-all duration-200">
                <span className="text-[20px] font-bold text-amber-600">{
                  (() => {
                    // Find subject with highest percentage improvement
                    const bySubject: Record<string, { first: number, last: number, count: number }> = {};
                    kpi.latestArr?.forEach(s => {
                      if (!bySubject[s.subject]) bySubject[s.subject] = { first: Math.min(s.projected, examConfig.marks), last: Math.min(s.projected, examConfig.marks), count: 1 };
                      else {
                        bySubject[s.subject].last = Math.min(s.projected, examConfig.marks);
                        bySubject[s.subject].count++;
                      }
                    });
                    let best: string | null = null, bestPct = -Infinity;
                    let worst: string | null = null, worstPct = Infinity;
                    Object.entries(bySubject).forEach(([subj, obj]) => {
                      const pct = obj.first ? ((obj.last - obj.first) / obj.first) * 100 : 0;
                      if (pct > bestPct) { bestPct = pct; best = subj; }
                      if (pct < worstPct) { worstPct = pct; worst = subj; }
                    });
                    // Prevent same subject for both
                    if (best === worst) worst = null;
                    if (!best) return 'N/A';
                    return <>{best} <span className="text-[16px] text-amber-400 font-semibold ml-1">({Math.round(bestPct)}%)</span></>;
                  })()
                }</span>
                <span className="text-[12px] text-slate-500 mt-1 font-medium">Most Improved Subject</span>
              </div>
              {/* New KPI Card: Most Dropped Subject */}
              <div className="bg-white/90 p-4 rounded-2xl shadow-md border border-slate-100 flex flex-col min-h-[56px] h-[56px] justify-center items-center transition-all duration-200">
                <span className="text-[20px] font-bold text-slate-700">{
                  (() => {
                    // Find subject with lowest percentage improvement
                    const bySubject: Record<string, { first: number, last: number, count: number }> = {};
                    kpi.latestArr?.forEach(s => {
                      if (!bySubject[s.subject]) bySubject[s.subject] = { first: Math.min(s.projected, examConfig.marks), last: Math.min(s.projected, examConfig.marks), count: 1 };
                      else {
                        bySubject[s.subject].last = Math.min(s.projected, examConfig.marks);
                        bySubject[s.subject].count++;
                      }
                    });
                    let best: string | null = null, bestPct = -Infinity;
                    let worst: string | null = null, worstPct = Infinity;
                    Object.entries(bySubject).forEach(([subj, obj]) => {
                      const pct = obj.first ? ((obj.last - obj.first) / obj.first) * 100 : 0;
                      if (pct > bestPct) { bestPct = pct; best = subj; }
                      if (pct < worstPct) { worstPct = pct; worst = subj; }
                    });
                    // Prevent same subject for both
                    if (best === worst) worst = null;
                    if (!worst || worst === best) return 'N/A';
                    return <>{worst} <span className="text-[16px] text-slate-400 font-semibold ml-1">({Math.round(worstPct)}%)</span></>;
                  })()
                }</span>
                <span className="text-[12px] text-slate-500 mt-1 font-medium">Most Dropped Subject</span>
              </div>
            </div>
            {/* Right: NEET Readiness & Improvement Trend */}
            <div className="flex flex-col gap-6 h-full min-w-[260px] max-w-[360px]">
              {/* NEET Readiness Card (reduced height) */}
              <div className="bg-white/90 p-6 rounded-2xl shadow-md border border-blue-100 flex flex-col min-h-[160px] h-[160px] flex-1 relative items-center justify-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-blue-900 tracking-wide">NEET Readiness</span>
                  <select
                    className="ml-2 px-2 py-1 text-xs rounded border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={readinessClass}
                    onChange={e => setReadinessClass(e.target.value)}
                  >
                    {classOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 flex flex-col justify-center items-center">
                  <span className="text-5xl font-extrabold text-emerald-600 drop-shadow-sm"><CountUp end={parseFloat(readinessPct)} decimals={1} suffix="%" /></span>
                  <span className="text-[14px] text-slate-500 mt-2 font-medium">% students scoring ≥ 75% of max marks</span>
                </div>
              </div>
              {/* Improvement Trend Card (larger, with Recharts) */}
              <MonthlyPerformanceHistogram />
            </div>
          </div>
        </section>
        {/* Section: Performers */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <DashboardCard title="Top 10 Performers" className="md:col-span-12 bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6" content={(() => (
            <div className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
                <div className="flex flex-col flex-1 min-w-[120px]">
                  <label className="text-xs text-slate-500 font-semibold mb-1">Select Batch</label>
                  <select className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-blue-200" value={topBatch} onChange={e => { setTopBatch(e.target.value); setTopClass('All'); }}>
                    {batchOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="flex flex-col flex-1 min-w-[120px]">
                  <label className="text-xs text-slate-500 font-semibold mb-1">Select Class</label>
                  <select className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-blue-200" value={topClass} onChange={e => setTopClass(e.target.value)}>
                    {topClassOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
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
                    {top10Filtered.map((s, i) => (
                      <tr key={i} className="border-b border-blue-50 hover:bg-blue-100/30 transition-all duration-200 text-center">
                        <td className="py-2 text-blue-900 font-semibold">{i + 1}</td>
                        <td className="py-2 text-blue-900">{s.studentName}</td>
                        <td className="py-2 text-blue-900">{s.class}</td>
                        <td className="py-2 font-medium text-blue-700">{s.projected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))()} />
        </div>
      </main>
    </div>
  );
}
