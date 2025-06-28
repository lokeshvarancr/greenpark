import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useFilter } from "@/lib/DashboardFilterContext";
import { SECTION1_DASHBOARD_DATASET } from "@/DummyData/Section1DashboardData";
import { format, subMonths } from "date-fns";

// Subject color mapping
const SUBJECT_COLORS: Record<string, string> = {
  Physics: "#2563eb",
  Chemistry: "#059669",
  Botany: "#f59e42",
  Zoology: "#dc2626",
  "Physics + Botany": "#6366f1",
  "Chemistry + Zoology": "#10b981",
  Grand: "#a21caf",
};

const EXAM_TYPE_SUBJECTS: Record<string, string[]> = {
  Weekly: ["Physics", "Chemistry", "Botany", "Zoology"],
  Cumulative: ["Physics + Botany", "Chemistry + Zoology"],
  "Grand Test": [],
};

const MAX_MARKS: Record<string, number> = {
  Physics: 120,
  Chemistry: 180,
  Botany: 240,
  Zoology: 240,
  "Physics + Botany": 400,
  "Chemistry + Zoology": 400,
  Grand: 720,
};

function getMonthKey(date: Date) {
  return format(date, "yyyy-MM");
}

const getLastNMonths = (n: number) => {
  const arr = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = subMonths(now, i);
    arr.push({
      key: getMonthKey(d),
      label: format(d, "MMM yyyy"),
    });
  }
  return arr;
};

const MonthlyPerformanceHistogram: React.FC = () => {
  const { filter } = useFilter();
  const [subject, setSubject] = useState(
    filter.examType === "Weekly"
      ? "Physics"
      : filter.examType === "Cumulative"
      ? "Physics + Botany"
      : ""
  );

  // Update subject if examType changes
  React.useEffect(() => {
    if (filter.examType === "Weekly") setSubject("Physics");
    else if (filter.examType === "Cumulative") setSubject("Physics + Botany");
    else setSubject("");
  }, [filter.examType]);

  // Dropdown logic
  const showSubjectDropdown = filter.examType === "Weekly" || filter.examType === "Cumulative";
  const subjectOptions = EXAM_TYPE_SUBJECTS[filter.examType] || [];

  // Get last 5 months
  const months = getLastNMonths(5);

  // Data aggregation
  const data = useMemo(() => {
    return months.map(({ key, label }) => {
      let tests: any[] = [];
      if (filter.examType === "Weekly") {
        tests = SECTION1_DASHBOARD_DATASET.filter(
          (d) =>
            subject === d.subject &&
            getMonthKey(new Date(d.testDate)) === key &&
            // Heuristic: weekly tests have subject as one of the four
            ["Physics", "Chemistry", "Botany", "Zoology"].includes(d.subject)
        );
        // Assume 4 tests/month, average their projected scores
        const avg =
          tests.length > 0
            ?
                tests.reduce((sum, t) => sum + Math.min(t.projected, MAX_MARKS[subject]), 0) /
                Math.max(1, tests.length)
            : 0;
        return {
          month: label,
          avgScore: Number(avg.toFixed(1)),
          maxMarks: MAX_MARKS[subject],
          subject,
        };
      } else if (filter.examType === "Cumulative") {
        tests = SECTION1_DASHBOARD_DATASET.filter(
          (d) =>
            d.subject === subject &&
            getMonthKey(new Date(d.testDate)) === key &&
            // Heuristic: cumulative tests have subject as one of the two combos
            ["Physics + Botany", "Chemistry + Zoology"].includes(d.subject)
        );
        // Assume 2 tests/month, average their projected scores
        const avg =
          tests.length > 0
            ?
                tests.reduce((sum, t) => sum + Math.min(t.projected, MAX_MARKS[subject]), 0) /
                Math.max(1, tests.length)
            : 0;
        return {
          month: label,
          avgScore: Number(avg.toFixed(1)),
          maxMarks: MAX_MARKS[subject],
          subject,
        };
      } else if (filter.examType === "Grand Test") {
        tests = SECTION1_DASHBOARD_DATASET.filter(
          (d) =>
            getMonthKey(new Date(d.testDate)) === key &&
            // Heuristic: grand test is when subject is not in the above
            !["Physics", "Chemistry", "Botany", "Zoology", "Physics + Botany", "Chemistry + Zoology"].includes(d.subject)
        );
        // 1 test/month, average projected scores
        const avg =
          tests.length > 0
            ?
                tests.reduce((sum, t) => sum + Math.min(t.projected, MAX_MARKS.Grand), 0) /
                Math.max(1, tests.length)
            : 0;
        return {
          month: label,
          avgScore: Number(avg.toFixed(1)),
          maxMarks: MAX_MARKS.Grand,
          subject: "Grand",
        };
      }
      return { month: label, avgScore: 0, maxMarks: 0, subject: "" };
    });
  }, [months, filter.examType, subject]);

  // Animation: fade/slide on dropdown change
  const [animateKey, setAnimateKey] = useState(0);
  React.useEffect(() => {
    setAnimateKey((k) => k + 1);
  }, [filter.examType, subject]);

  return (
    <div className="w-full bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-bold text-blue-900">Performance Trend</span>
        {showSubjectDropdown && (
          <select
            className="ml-2 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {subjectOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
      </div>
      <div
        key={animateKey}
        className="transition-all duration-500 ease-in-out opacity-100 translate-y-0"
      >
        <ResponsiveContainer width="100%" height={195}>
          <BarChart data={data} barCategoryGap={30}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 13 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, data[0]?.maxMarks || 100]} tick={{ fontSize: 13 }} axisLine={false} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 rounded shadow px-3 py-2 text-xs text-blue-900">
                      <b>{d.month}</b>
                      <br />Subject: {d.subject}
                      <br />Avg Score: <b>{d.avgScore}</b>
                      <br />Max Marks: {d.maxMarks}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="avgScore"
              fill={SUBJECT_COLORS[subject] || "#2563eb"}
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
            >
              {/* Optionally, add per-bar color logic here if needed */}
            </Bar>
            <Legend
              payload={[
                {
                  value: subject,
                  type: "square",
                  color: SUBJECT_COLORS[subject] || "#2563eb",
                },
              ]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyPerformanceHistogram;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    