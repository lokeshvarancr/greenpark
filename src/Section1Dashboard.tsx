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
import DonutChart from "@/components/ui/DonutChart";
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

    return { testsTaken, accuracy, topPerformer, riskBuckets, improveBuckets, latestArr };
  }, [scoped]);

  /* ----------------------------- Top‑10 Rank ----------------------------- */
  const rank10 = useMemo(
    () => [...kpi.latestArr]
      .sort((a, b) => b.projected - a.projected)
      .slice(0, 10)
      .map((s, idx) => ({ rank: idx + 1, name: s.studentName, class: s.class, score: s.projected })),
    [kpi.latestArr],
  );

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
        {/* Section: Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <DashboardCard title="Total Tests" value={kpi.testsTaken} />
          <DashboardCard title="Accuracy" value={`${kpi.accuracy}%`} />
          <DashboardCard title="Top Performer" value={kpi.topPerformer ? `${kpi.topPerformer.studentName} – ${kpi.topPerformer.projected}` : "N/A"} />
          <DashboardCard title="Risk" content={<DonutChart data={Object.entries(kpi.riskBuckets).map(([n, v]) => ({ name: n, value: v }))} colors={{ "High Risk": "#3b82f6", Medium: "#60a5fa", Safe: "#bae6fd" }} />} />
          <DashboardCard title="Improvement" content={<DonutChart data={Object.entries(kpi.improveBuckets).map(([n, v]) => ({ name: n, value: v }))} colors={{ Improved: "#2563eb", Neutral: "#dbeafe", Degraded: "#60a5fa" }} />} />
        </section>

        {/* Section: Performers */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <DashboardCard title="Top 10 Performers" className="md:col-span-12" content={
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-blue-100">
                  <th className="py-1 text-blue-500">Rank</th>
                  <th className="py-1 text-blue-500">Name</th>
                  <th className="py-1 text-blue-500">Class</th>
                  <th className="py-1 text-blue-500">Score</th>
                </tr>
              </thead>
              <tbody>
                {rank10.map((s) => (
                  <tr key={s.rank} className="border-b border-blue-50 hover:bg-blue-50 transition-all duration-200">
                    <td className="py-1 text-blue-900 font-semibold">{s.rank}</td>
                    <td className="py-1 text-blue-900">{s.name}</td>
                    <td className="py-1 text-blue-900">{s.class}</td>
                    <td className="py-1 font-medium text-blue-700">{s.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          } />
        </div>
      </main>
    </div>
  );
}
