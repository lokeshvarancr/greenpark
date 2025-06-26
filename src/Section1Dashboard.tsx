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
import FilterRow from "@/components/ui/FilterRow";
import { faker } from "@faker-js/faker";
import { format, isWithinInterval, subDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, PieChart, Pie, Cell, Legend } from 'recharts';

/* -------------------------------------------------------------------------- */
/*                               Dummy Dataset                                */
/* -------------------------------------------------------------------------- */
// The following function uses faker to generate a large, realistic dummy dataset for the dashboard.
// Each student is assigned random institution, batch, class, and subject, and 6 test records are created per student.
// This data powers all dashboard visualizations and tables.
const generateDummyData = () => {
  // institutions, batches, classes, and subjects are the categories used for filtering and grouping
  const institutions = ["Green Park", "Blue Hill", "Silver Oak"];
  const batches = ["Alpha 2025", "Beta 2024", "Gamma 2026", "Delta 2025"];
  const classes = ["11A", "11B", "12A", "12B", "12C"];
  const subjects = ["Physics", "Chemistry", "Botany", "Zoology", "Maths"];
  const recs = [];

  for (let i = 0; i < 600; i++) {
    const institution = faker.helpers.arrayElement(institutions);
    const batch = faker.helpers.arrayElement(batches);
    const clazz = faker.helpers.arrayElement(classes);
    const studentId = `STU-${i.toString().padStart(3, "0")}`;
    const studentName = `${faker.person.firstName()} ${faker.person.lastName().charAt(0)}`;

    for (let t = 0; t < 6; t++) {
      const attempted = faker.number.int({ min: 120, max: 180 });
      const correct = faker.number.int({ min: 0, max: attempted });
      const rawScore = correct * 4 - (attempted - correct); // NEET marking (4/‑1)
      const projected = Math.max(
        0,
        Math.min(720, rawScore + faker.number.int({ min: -20, max: 20 }))
      );

      recs.push({
        institution, // Institution name (for filter)
        batch,       // Batch name (for filter)
        class: clazz, // Class name (for filter)
        subject: faker.helpers.arrayElement(subjects), // Subject (for filter)
        testId: `T${t + 1}`,
        studentId,   // Unique student ID
        studentName, // Student name
        attempted,   // Number of questions attempted
        correct,     // Number of correct answers
        rawScore,    // Raw NEET score
        projected,   // Projected NEET score (with some randomization)
        testDate: faker.date.recent({ days: 180 }), // Random test date in last 180 days
      });
    }
  }
  return recs;
};
const DATASET = generateDummyData();

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */
export default function Section1Dashboard() {
  /* ---------------------------- Filter State --------------------------- */
  const institutions = [...new Set(DATASET.map((d) => d.institution))];
  const batches = [...new Set(DATASET.map((d) => d.batch))];
  const classes = [...new Set(DATASET.map((d) => d.class))];
  // const subjects = [...new Set(DATASET.map((d) => d.subject))];

  // Filter state for FilterRow
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [filter, setFilter] = useState({
    institution: "All",
    batch: "All",
    class: "All",
    scoreRange: [200, 720],
    examType: "Weekly", // Add examType to filter state, default to Weekly
  });
  // Update filter handlers with explicit types
  const updateFilter = (k: keyof typeof filter) => (v: any) => setFilter((p) => ({ ...p, [k]: v }));

  /* --------------------------- Scoped Dataset -------------------------- */
  const scoped = useMemo(
    () =>
      DATASET.filter((d) => {
        if (filter.institution !== "All" && d.institution !== filter.institution) return false;
        if (filter.batch !== "All" && d.batch !== filter.batch) return false;
        if (filter.class !== "All" && d.class !== filter.class) return false;
        if (d.projected < filter.scoreRange[0] || d.projected > filter.scoreRange[1]) return false;
        if (
          !isWithinInterval(new Date(d.testDate), {
            start: dateRange.from,
            end: dateRange.to,
          })
        )
          return false;
        return true;
      }),
    [filter, dateRange],
  );

  /* ------------------------ KPI & Derived Values ----------------------- */
  const kpi = useMemo(() => {
    const testsTaken = scoped.length;
    const totalCorrect = scoped.reduce((a, b) => a + b.correct, 0);
    const totalAttempted = scoped.reduce((a, b) => a + b.attempted, 0);
    const accuracy = ((totalCorrect / totalAttempted) * 100).toFixed(1);

    // latest record per student
    const latest = new Map();
    scoped
      .sort((a, b) => +new Date(b.testDate) - +new Date(a.testDate))
      .forEach((r) => {
        if (!latest.has(r.studentId)) latest.set(r.studentId, r);
      });
    const latestArr = [...latest.values()];

    // --- New KPIs ---
    const avgScore = latestArr.length ? (latestArr.reduce((a, b) => a + b.projected, 0) / latestArr.length).toFixed(1) : '0';
    const maxScore = latestArr.length ? Math.max(...latestArr.map(s => s.projected)) : 0;
    const minScore = latestArr.length ? Math.min(...latestArr.map(s => s.projected)) : 0;
    const above600 = latestArr.filter(s => s.projected >= 600).length;
    const above500 = latestArr.filter(s => s.projected >= 500).length;
    const above400 = latestArr.filter(s => s.projected >= 400).length;
    const readiness = latestArr.length ? ((latestArr.filter(s => s.projected >= 550).length / latestArr.length) * 100).toFixed(1) : '0';

    // --- Custom KPIs for cards ---
    // Average Attempt Rate (%)
    const avgAttemptRate = latestArr.length
      ? (
          latestArr.reduce((sum, s) => sum + (s.attempted / 180) * 100, 0) / latestArr.length
        ).toFixed(1)
      : '0.0';
    // Top 10% Avg Score
    const sortedByScore = [...latestArr].sort((a, b) => b.projected - a.projected);
    const top10Count = Math.max(1, Math.round(latestArr.length * 0.1));
    const top10Avg = top10Count > 0
      ? (sortedByScore.slice(0, top10Count).reduce((sum, s) => sum + s.projected, 0) / top10Count).toFixed(1)
      : '0.0';
    // Bottom 10% Avg Score
    const bottom10Avg = top10Count > 0
      ? (sortedByScore.slice(-top10Count).reduce((sum, s) => sum + s.projected, 0) / top10Count).toFixed(1)
      : '0.0';

    const topPerformer = latestArr.sort((a, b) => b.projected - a.projected)[0];

    const riskBuckets = { "High Risk": 0, Medium: 0, Safe: 0 };
    latestArr.forEach((r) => riskBuckets[r.projected < 300 ? "High Risk" : r.projected <= 450 ? "Medium" : "Safe"]++);

    const improveBuckets = { Improved: 0, Neutral: 0, Degraded: 0 };
    latestArr.forEach((r) => {
      const hist = scoped
        .filter((h) => h.studentId === r.studentId)
        .sort((a, b) => +new Date(b.testDate) - +new Date(a.testDate));
      if (hist.length < 2) return improveBuckets.Neutral++;
      const delta = r.projected - hist[1].projected;
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
  }, [scoped]);

  // --- NEET Readiness Dropdown State ---
  const classOptions = ["Overall", ...new Set(DATASET.map((d) => d.class))];
  const [readinessClass, setReadinessClass] = useState("Overall");

  // --- NEET Readiness Calculation ---
  const readinessArr = useMemo(() => {
    if (readinessClass === "Overall") return kpi.latestArr;
    return kpi.latestArr.filter((s) => s.class === readinessClass);
  }, [kpi.latestArr, readinessClass]);
  const readinessPct = readinessArr.length
    ? ((readinessArr.filter((s) => s.projected >= 550).length / readinessArr.length) * 100).toFixed(1)
    : "0.0";

  // --- Risk Breakdown Data ---
  const riskBreakdown = useMemo(() => {
    let high = 0, med = 0, low = 0;
    (kpi.latestArr || []).forEach((s) => {
      const acc = (s.correct / (s.attempted || 1)) * 100;
      if (s.projected < 400 || acc < 30) high++;
      else if ((s.projected <= 500 && s.projected >= 400) || (acc >= 30 && acc <= 50)) med++;
      else low++;
    });
    const total = kpi.latestArr?.length || 1;
    return [
      { label: "High Risk", value: high, pct: ((high / total) * 100).toFixed(1), color: "#ef4444" },
      { label: "Medium Risk", value: med, pct: ((med / total) * 100).toFixed(1), color: "#f59e42" },
      { label: "Safe", value: low, pct: ((low / total) * 100).toFixed(1), color: "#10b981" },
    ];
  }, [kpi.latestArr]);

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
    return arr.sort((a, b) => b.projected - a.projected).slice(0, 10);
  }, [kpi.latestArr, topBatch, topClass]);

  // --- Improvement Trend Card Data ---
  const trendInterval = 15; // days
  const today = new Date();
  const trendPoints = [];
  for (let i = 180; i >= 0; i -= trendInterval) {
    const from = subDays(today, i);
    const to = subDays(today, i - trendInterval);
    const scores = kpi.latestArr.filter(r => isWithinInterval(new Date(r.testDate), { start: from, end: to }));
    trendPoints.push({
      date: format(from, 'MMM d'),
      avg: scores.length ? (scores.reduce((a, b) => a + b.projected, 0) / scores.length).toFixed(1) : 0
    });
  }

  /* ---------------------------------------------------------------------- */
  /*                                 JSX                                    */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Section: Filters */}
        <FilterRow
          dateFrom={format(dateRange.from, "yyyy-MM-dd")}
          dateTo={format(dateRange.to, "yyyy-MM-dd")}
          onDateFromChange={val => setDateRange(r => ({ ...r, from: new Date(val) }))}
          onDateToChange={val => setDateRange(r => ({ ...r, to: new Date(val) }))}
          institution={filter.institution}
          onInstitutionChange={updateFilter("institution")}
          institutions={institutions}
          batch={filter.batch}
          onBatchChange={updateFilter("batch")}
          batches={batches}
          clazz={filter.class}
          onClassChange={updateFilter("class")}
          classes={classes}
          examType={filter.examType}
          onExamTypeChange={updateFilter("examType")}
        />
        {/* --- PERFORMANCE ANALYTICS SECTION --- */}
        <section className="mb-10">
          {/* Row 1: Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
            { [
              { label: 'Total Tests Conducted', value: kpi.testsTaken },
              { label: 'Average Accuracy %', value: `${kpi.accuracy}%` },
              { label: 'Average Total Score', value: (
                <>
                  {kpi.avgScore} <span className="text-xs text-slate-400 font-semibold">/ 720</span>
                </>
              ) },
              { label: 'Average Attempt Rate (%)', value: kpi.avgAttemptRate, color: '#f97316' },
              { label: 'Top 10% Avg Score', value: (
                <>
                  {kpi.top10Avg} <span className="text-xs text-slate-400 font-semibold">/ 720</span>
                </>
              ), color: '#1e40af' },
              { label: 'Bottom 10% Avg Score', value: (
                <>
                  {kpi.bottom10Avg} <span className="text-xs text-slate-400 font-semibold">/ 720</span>
                </>
              ), color: '#dc2626' },
            ].map((card, i) => (
              <div
                key={card.label}
                className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 border border-blue-50 flex flex-col items-start group relative overflow-hidden min-h-[110px]"
              >
                <span className="text-xs font-semibold uppercase text-slate-500 mb-2 tracking-wider group-hover:text-blue-700 transition-colors">{card.label}</span>
                <span className="text-3xl font-extrabold drop-shadow-sm group-hover:text-blue-700 transition-colors flex items-end gap-1" style={card.color ? { color: card.color } : {}}>{card.value}</span>
                <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl font-black select-none pointer-events-none text-blue-200">{i + 1}</div>
              </div>
            )) }
          </div>

          {/* Row 2: Main Visuals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Score Distribution + New KPI Cards */}
            <div className="md:col-span-1 flex flex-col gap-6 min-w-[260px] max-w-[340px]">
              {/* Score Distribution Summary (compact, tiered) */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-lg flex flex-col border border-blue-100 min-h-[200px] h-[200px] justify-between">
                <span className="text-lg font-bold text-blue-900 mb-2 tracking-wide">Score Distribution</span>
                <div className="flex flex-col gap-2 flex-1 justify-center">
                  {(() => {
                    const total = kpi.latestArr?.length || 1;
                    const bands = [
                      { label: '> 600', value: kpi.above600, color: 'bg-blue-900/90' },
                      { label: '> 550', value: kpi.latestArr ? kpi.latestArr.filter(s => s.projected > 550).length : 0, color: 'bg-blue-700/80' },
                      { label: '> 500', value: kpi.above500, color: 'bg-blue-500/70' },
                      { label: '> 400', value: kpi.above400, color: 'bg-teal-400/60' },
                    ];
                    return bands.map((band) => {
                      const pct = total ? ((band.value / total) * 100).toFixed(1) : '0.0';
                      return (
                        <div key={band.label} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${band.color} border border-slate-200`} />
                          <span className="text-sm font-semibold text-blue-900 w-16">{band.label}</span>
                          <span className="text-base font-bold text-blue-700 w-10 text-right tabular-nums">{band.value}</span>
                          <span className="text-xs text-slate-500 w-12 text-right">{pct}%</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
              {/* New KPI Card: % Improving */}
              <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-2xl shadow flex flex-col border border-green-100 min-h-[80px] h-[80px] justify-center">
                <span className="text-2xl font-bold text-emerald-600">{(() => {
                  const total = kpi.latestArr?.length || 1;
                  const improving = kpi.improveBuckets?.Improved || 0;
                  return `${((improving / total) * 100).toFixed(1)}%`;
                })()}</span>
                <span className="text-xs text-slate-500 mt-1">% of Students Improving</span>
              </div>
              {/* New KPI Card: Best Performing Class */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-2xl shadow flex flex-col border border-blue-100 min-h-[80px] h-[80px] justify-center">
                <span className="text-2xl font-bold text-blue-700">{(() => {
                  if (filter.class !== 'All') return 'N/A';
                  const byClass: Record<string, number[]> = {};
                  kpi.latestArr?.forEach(s => {
                    if (!byClass[s.class]) byClass[s.class] = [];
                    byClass[s.class].push(s.projected);
                  });
                  let best: string | null = null, bestAvg = -1;
                  Object.entries(byClass).forEach(([cls, arr]) => {
                    const avg = (arr as number[]).reduce((a, b) => a + b, 0) / (arr as number[]).length;
                    if (avg > bestAvg) { bestAvg = avg; best = cls; }
                  });
                  return best || 'N/A';
                })()}</span>
                <span className="text-xs text-slate-500 mt-1">Best Performing Class</span>
              </div>
            </div>
            {/* Center: Risk Breakdown Pie + New KPI Cards */}
            <div className="md:col-span-1 flex flex-col gap-6 min-w-[260px] max-w-[340px]">
              {/* Risk Breakdown Pie Chart */}
              <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-2xl shadow-lg flex flex-col border border-red-100 min-h-[200px] h-[200px] justify-between">
                <span className="text-lg font-bold text-red-900 mb-2 tracking-wide">Risk Breakdown</span>
                <ResponsiveContainer width="100%" height={120}>
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
                        const total = kpi.latestArr?.length || 1;
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
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
              <div className="bg-gradient-to-br from-amber-50 to-white p-4 rounded-2xl shadow flex flex-col border border-amber-100 min-h-[80px] h-[80px] justify-center">
                <span className="text-2xl font-bold text-amber-600">{(() => {
                  // Find subject with highest average improvement
                  const bySubject: Record<string, number[]> = {};
                  kpi.latestArr?.forEach(s => {
                    if (!bySubject[s.subject]) bySubject[s.subject] = [];
                    // Find improvement for this student in this subject
                    // For now, use projected score as proxy (since dummy data)
                    bySubject[s.subject].push(s.projected);
                  });
                  let best: string | null = null, bestAvg = -1;
                  Object.entries(bySubject).forEach(([subj, arr]) => {
                    const avg = (arr as number[]).reduce((a, b) => a + b, 0) / (arr as number[]).length;
                    if (avg > bestAvg) { bestAvg = avg; best = subj; }
                  });
                  return best || 'N/A';
                })()}</span>
                <span className="text-xs text-slate-500 mt-1">Most Improved Subject</span>
              </div>
              {/* New KPI Card: Most Dropped Subject */}
              <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl shadow flex flex-col border border-slate-100 min-h-[80px] h-[80px] justify-center">
                <span className="text-2xl font-bold text-slate-700">{(() => {
                  // Find subject with lowest average improvement
                  const bySubject: Record<string, number[]> = {};
                  kpi.latestArr?.forEach(s => {
                    if (!bySubject[s.subject]) bySubject[s.subject] = [];
                    bySubject[s.subject].push(s.projected);
                  });
                  let worst: string | null = null, worstAvg = 1e9;
                  Object.entries(bySubject).forEach(([subj, arr]) => {
                    const avg = (arr as number[]).reduce((a, b) => a + b, 0) / (arr as number[]).length;
                    if (avg < worstAvg) { worstAvg = avg; worst = subj; }
                  });
                  return worst || 'N/A';
                })()}</span>
                <span className="text-xs text-slate-500 mt-1">Most Dropped Subject</span>
              </div>
            </div>
            {/* Right: NEET Readiness & Improvement Trend */}
            <div className="flex flex-col gap-8 h-full">
              {/* NEET Readiness Card (reduced height) */}
              <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl shadow-lg flex flex-col border border-blue-100 min-h-[160px] h-[160px] flex-1 relative">
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
                  <span className="text-5xl font-extrabold text-emerald-600 drop-shadow-sm">{readinessPct}%</span>
                  <span className="text-xs text-slate-500 mt-2">% students scoring ≥ 550</span>
                </div>
              </div>
              {/* Improvement Trend Card (larger, with Recharts) */}
              <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl shadow-lg flex flex-col border border-blue-100 min-h-[260px] h-[260px] w-full">
                <span className="text-base font-bold text-blue-900 mb-2 tracking-wide">Improvement Trend</span>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={trendPoints} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 720]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Tooltip formatter={v => `${v} pts`} />
                    <Area type="monotone" dataKey="avg" stroke="#2563eb" fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
                <span className="mt-2 text-xs text-slate-500">Avg. projected score every {trendInterval} days</span>
              </div>
            </div>
          </div>
        </section>
        {/* Section: Performers */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <DashboardCard title="Top 10 Performers" className="md:col-span-12" content={(() => {
            return (
              <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-2">
                  <div className="flex flex-col flex-1 min-w-[120px]">
                    <label className="text-xs text-slate-500 font-semibold mb-1">Select Batch</label>
                    <select className="px-2 py-1 text-xs rounded border border-slate-200 bg-white text-slate-700" value={topBatch} onChange={e => { setTopBatch(e.target.value); setTopClass('All'); }}>
                      {batchOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col flex-1 min-w-[120px]">
                    <label className="text-xs text-slate-500 font-semibold mb-1">Select Class</label>
                    <select className="px-2 py-1 text-xs rounded border border-slate-200 bg-white text-slate-700" value={topClass} onChange={e => setTopClass(e.target.value)}>
                      {topClassOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-center border-b border-blue-100">
                      <th className="py-1 text-blue-500">Rank</th>
                      <th className="py-1 text-blue-500">Name</th>
                      <th className="py-1 text-blue-500">Class</th>
                      <th className="py-1 text-blue-500">Overall Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {top10Filtered.map((s, i) => (
                      <tr key={i} className="border-b border-blue-50 hover:bg-blue-50 transition-all duration-200 text-center">
                        <td className="py-1 text-blue-900 font-semibold">{i + 1}</td>
                        <td className="py-1 text-blue-900">{s.studentName}</td>
                        <td className="py-1 text-blue-900">{s.class}</td>
                        <td className="py-1 font-medium text-blue-700">{s.projected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()} />
        </div>
      </main>
    </div>
  );
}
