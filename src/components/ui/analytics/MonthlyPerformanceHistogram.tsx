import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

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

interface TrendPoint {
  month: string;
  score: number;
}

interface MonthlyPerformanceHistogramProps {
  trendData: TrendPoint[];
  maxMarks: number;
  subject: string;
}

const MonthlyPerformanceHistogram: React.FC<MonthlyPerformanceHistogramProps> = ({ trendData, maxMarks, subject }) => {
  return (
    <div className="w-full bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-bold text-blue-900">Performance Trend</span>
        {/* Subject label shown if not grandTest */}
        {subject && subject !== "Grand" && (
          <span className="ml-2 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700">{subject}</span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={195}>
        <BarChart data={trendData} barCategoryGap={30}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 13 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, maxMarks || 100]} tick={{ fontSize: 13 }} axisLine={false} tickLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-slate-200 rounded shadow px-3 py-2 text-xs text-blue-900">
                    <b>{d.month}</b>
                    <br />Subject: {subject}
                    <br />Avg Score: <b>{d.score}</b>
                    <br />Max Marks: {maxMarks}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="score"
            fill={SUBJECT_COLORS[subject] || "#2563eb"}
            radius={[8, 8, 0, 0]}
            isAnimationActive={true}
          />
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
  );
};

export default MonthlyPerformanceHistogram;