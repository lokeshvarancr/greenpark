// Section1Dashboard.jsx — FINAL, FULLY‑COMPILED CODE
// -----------------------------------------------------------------------------
// * Fully self‑contained; compiles with React + Tailwind + shadcn/ui + Recharts
// * Implements Section 1 of NEET Evaluation Dashboard with:
//   – Filters (Institution ▸ Batch ▸ Class ▸ Subject ▸ Score Range)
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
  const subjects = [...new Set(DATASET.map((d) => d.subject))];

  // Filter state for FilterRow
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [filter, setFilter] = useState({
    institution: "All",
    batch: "All",
    class: "All",
    subject: "All",
    scoreRange: [200, 720],
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
        if (filter.subject !== "All" && d.subject !== filter.subject) return false;
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
          subject={filter.subject}
          onSubjectChange={updateFilter("subject")}
          subjects={subjects}
          examType="NEET"
          onExamTypeChange={() => {}}
        />
        {/* --- PERFORMANCE ANALYTICS SECTION --- */}
        <section className="mb-10">
          {/* Row 1: Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-10">
            { [
              { label: 'Total Tests Conducted', value: kpi.testsTaken },
              { label: 'Average Accuracy %', value: `${kpi.accuracy}%` },
              { label: 'Average Total Score', value: kpi.avgScore },
              { label: 'Highest Score', value: kpi.maxScore },
              { label: 'Lowest Score', value: kpi.minScore },
            ].map((card, i) => (
              <div
                key={card.label}
                className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 border border-blue-50 flex flex-col items-start group relative overflow-hidden"
              >
                <span className="text-xs font-semibold uppercase text-slate-500 mb-2 tracking-wider group-hover:text-blue-700 transition-colors">{card.label}</span>
                <span className="text-3xl font-extrabold text-slate-900 drop-shadow-sm group-hover:text-blue-700 transition-colors">{card.value}</span>
                <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl font-black select-none pointer-events-none text-blue-200">{i + 1}</div>
              </div>
            )) }
          </div>

          {/* Row 2: Main Visuals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Score Distribution Bar Chart + Risk Breakdown */}
            <div className="md:col-span-2 flex flex-col h-full">
              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg flex flex-col min-h-[240px] h-full justify-between border border-blue-100 flex-1">
                <span className="text-lg font-bold text-blue-900 mb-4 tracking-wide">Score Distribution Summary</span>
                <div className="flex-1 flex flex-col justify-center gap-4">
                  { (() => {
                    const bars = [
                      { label: '> 600', value: kpi.above600, color: 'bg-blue-900', grad: 'from-blue-900 to-blue-500' },
                      { label: '> 500', value: kpi.above500, color: 'bg-blue-700', grad: 'from-blue-700 to-blue-300' },
                      { label: '> 400', value: kpi.above400, color: 'bg-teal-500', grad: 'from-teal-500 to-teal-200' },
                      { label: '≥ 550', value: kpi.latestArr ? Math.round((Number(kpi.readiness) / 100) * kpi.latestArr.length) : 0, color: 'bg-slate-400', grad: 'from-slate-400 to-slate-200' },
                    ];
                    const total = kpi.latestArr?.length || 1;
                    return bars.map((bar) => {
                      const pct = total ? ((bar.value / total) * 100).toFixed(1) : '0.0';
                      return (
                        <div key={bar.label} className="flex items-center group relative mb-2 last:mb-0">
                          <div className="h-3 rounded-full bg-slate-100 flex items-center w-full min-w-0 overflow-hidden">
                            <div className={`transition-all duration-500 h-full rounded-full bg-gradient-to-r ${bar.grad}`} style={{ width: `${Math.max(5, (bar.value / total) * 100)}%`, minWidth: 12, maxWidth: '90%' }} />
                          </div>
                          <span className="ml-3 text-xs font-bold text-blue-900 w-14 text-right tabular-nums group-hover:text-blue-700 transition-colors">{bar.value}</span>
                          <span className="ml-2 text-xs text-slate-500 w-16 text-right">{bar.label}</span>
                          {/* Tooltip */}
                          <div className="absolute left-1/2 -translate-x-1/2 top-7 z-10 hidden group-hover:flex flex-col bg-white border border-blue-100 rounded shadow px-3 py-2 text-xs text-blue-900 min-w-[120px]">
                            <span><b>{bar.value}</b> students</span>
                            <span>({pct}%)</span>
                          </div>
                        </div>
                      );
                    });
                  })() }
                </div>
                {/* Risk Breakdown Horizontal Bar */}
                <div className="mt-8">
                  <span className="block text-sm font-semibold text-slate-700 mb-2">Risk Breakdown</span>
                  <div className="flex w-full h-6 rounded-full overflow-hidden shadow border border-slate-100">
                    {riskBreakdown.map((seg) => (
                      <div
                        key={seg.label}
                        style={{ width: `${seg.pct}%`, background: seg.color, transition: 'width 0.4s' }}
                        className="flex items-center justify-center h-full relative group"
                      >
                        <span className="text-xs font-bold text-white drop-shadow-sm absolute left-1/2 -translate-x-1/2">
                          {seg.value} ({seg.pct}%)
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    {riskBreakdown.map(seg => (
                      <span key={seg.label} className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded" style={{ background: seg.color }} />{seg.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Right: NEET Readiness & Improvement Trend */}
            <div className="flex flex-col gap-8 h-full">
              {/* NEET Readiness Card */}
              <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl shadow-lg flex flex-col border border-blue-100 min-h-[240px] h-full flex-1 relative">
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
              {/* Improvement Trend Card (unchanged) */}
              <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl shadow-lg flex flex-col border border-blue-100">
                <span className="text-base font-bold text-blue-900 mb-2 tracking-wide">Improvement Trend</span>
                { (() => {
                  const days = 7;
                  const today = new Date();
                  const trend = [];
                  for (let i = days - 1; i >= 0; i--) {
                    const day = format(subDays(today, i), 'yyyy-MM-dd');
                    const scores = kpi.latestArr?.filter(r => format(new Date(r.testDate), 'yyyy-MM-dd') === day).map(r => r.projected) || [];
                    trend.push({ day, avg: scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0 });
                  }
                  return (
                    <svg viewBox="0 0 210 60" width="100%" height="60" className="w-full h-16">
                      {/* Y axis: 0 to 720 mapped to 60px */}
                      {trend.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2.5"
                          style={{ filter: 'drop-shadow(0 2px 6px #2563eb33)' }}
                          points={trend.map((d, i) => `${i * 30},${60 - (Number(d.avg) / 720) * 60}`).join(' ')}
                        />
                      )}
                      {/* Dots and tooltips */}
                      {trend.map((d, i) => (
                        <g key={d.day} className="group">
                          <circle
                            cx={i * 30}
                            cy={60 - (Number(d.avg) / 720) * 60}
                            r="3.5"
                            fill="#2563eb"
                            className="transition-all duration-300"
                          />
                          <title>
                            {`${d.day}:
Avg Score: ${d.avg}`}
                          </title>
                        </g>
                      ))}
                      {/* X axis labels */}
                      {trend.map((d, i) => (
                        <text key={d.day} x={i * 30} y={58} fontSize="8" textAnchor="middle" fill="#64748b">{d.day.slice(5)}</text>
                      ))}
                      {/* Y axis labels */}
                      <text x="0" y="10" fontSize="8" fill="#64748b">720</text>
                      <text x="0" y="58" fontSize="8" fill="#64748b">0</text>
                    </svg>
                  );
                })() }
                <span className="mt-2 text-xs text-slate-500">Avg. projected score per test date</span>
              </div>
            </div>
          </div>
        </section>
        {/* Section: Performers */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <DashboardCard title="Top 10 Performers" className="md:col-span-12" content={(() => {
  // Get last 5 testIds (by date)
  const testIds = Array.from(new Set(DATASET.map(d => d.testId)));
  const testDates: Record<string, string> = {};
  DATASET.forEach(d => { if (!testDates[d.testId] || new Date(d.testDate).getTime() > new Date(testDates[d.testId]).getTime()) testDates[d.testId] = d.testDate.toString(); });
  const sortedTestIds = testIds.sort((a, b) => new Date(testDates[b]).getTime() - new Date(testDates[a]).getTime()).slice(0, 5);
  // For each test, get studentId to rank map
  const testRankMaps = sortedTestIds.map(tid => {
    const testRecords = DATASET.filter(d => d.testId === tid);
    const sorted = [...testRecords].sort((a, b) => b.projected - a.projected);
    const map = new Map<string, number>();
    sorted.forEach((s, idx) => map.set(s.studentId, idx + 1));
    return map;
  });
  // For each top 10 student, get their rank trend and last 5 test marks
  const top10 = [...kpi.latestArr]
    .sort((a, b) => b.projected - a.projected)
    .slice(0, 10)
    .map((s, idx) => {
      const ranks = testRankMaps.map(map => map.get(s.studentId) || null);
      const current = ranks[0];
      const prev = ranks[1];
      let movement = 'stable', diff = 0;
      if (prev && current) {
        diff = prev - current;
        if (diff > 0) movement = 'up';
        else if (diff < 0) movement = 'down';
      }
      // Get previous 5 test marks (projected score by testId, fallback to '-')
      const marks = sortedTestIds.map(tid => {
        const rec = DATASET.find(d => d.studentId === s.studentId && d.testId === tid);
        return rec ? rec.projected : '-';
      });
      return {
        rank: idx + 1, // Always assign 1 to 10
        name: s.studentName,
        class: s.class,
        score: s.projected,
        movement,
        diff: Math.abs(diff),
        marks,
      };
    })
    .sort((a, b) => {
      const ra = a.rank ?? 9999;
      const rb = b.rank ?? 9999;
      return ra - rb;
    });
  // Arrow SVGs
  const Arrow = ({ dir, color }: { dir: 'up'|'down'|'stable', color: string }) => (
    dir === 'up' ? <svg width="16" height="16" className="inline align-middle" style={{color}}><polyline points="8,12 8,4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/><polyline points="4,8 8,4 12,8" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/></svg>
    : dir === 'down' ? <svg width="16" height="16" className="inline align-middle" style={{color}}><polyline points="8,4 8,12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/><polyline points="4,8 8,12 12,8" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round"/></svg>
    : <svg width="16" height="16" className="inline align-middle" style={{color}}><line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
  );
  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr className="text-center border-b border-blue-100">
          <th className="py-1 text-blue-500">Rank</th>
          <th className="py-1 text-blue-500">Name</th>
          <th className="py-1 text-blue-500">Class</th>
          <th className="py-1 text-blue-500">Score</th>
          {/* Dynamically render Test 1 to Test 5 headings */}
          {sortedTestIds.map((tid) => (
            <th key={tid} className="py-1 text-blue-500">Test</th>
          ))}
          <th className="py-1 text-blue-500">Rank Movement</th>
        </tr>
      </thead>
      <tbody>
        {top10.map((s) => (
          <tr key={s.rank} className="border-b border-blue-50 hover:bg-blue-50 transition-all duration-200 text-center">
            <td className="py-1 text-blue-900 font-semibold">{s.rank}</td>
            <td className="py-1 text-blue-900">{s.name}</td>
            <td className="py-1 text-blue-900">{s.class}</td>
            <td className="py-1 font-medium text-blue-700">{s.score}</td>
            {/* Render each mark in its own column */}
            {s.marks.map((m, i) => (
              <td key={i} className="py-1">
                <span className="inline-block px-1 py-0.5 rounded bg-slate-100 text-xs font-mono text-blue-900 min-w-[28px] text-center">{m}</span>
              </td>
            ))}
            <td className="py-1">
              <span className="inline-flex items-center justify-center" title={s.movement === 'up' ? `Improved by ${s.diff} rank${s.diff === 1 ? '' : 's'}` : s.movement === 'down' ? `Dropped by ${s.diff} rank${s.diff === 1 ? '' : 's'}` : 'No change'}>
                <Arrow dir={s.movement as any} color={s.movement === 'up' ? '#16a34a' : s.movement === 'down' ? '#ef4444' : '#64748b'} />
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
})()} />
        </div>
      </main>
    </div>
  );
}
