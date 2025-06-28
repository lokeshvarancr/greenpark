import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ScoreChangeChartProps {
  summary: Array<{
    subject: string;
    improved: number;
    declined: number;
    same: number;
  }>;
}

const COLORS = {
  improved: "#22c55e",
  declined: "#ef4444",
  same: "#6b7280",
};

const ScoreChangeChart: React.FC<ScoreChangeChartProps> = ({ summary }) => {
  const data = summary.map((s) => ({
    subject: s.subject,
    Improved: s.improved,
    Declined: s.declined,
    "No Change": s.same,
  }));

  return (
    <div className="w-full h-64 bg-white rounded-2xl shadow border p-4 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="subject" tick={{ fontSize: 14 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Improved" stackId="a" fill={COLORS.improved} />
          <Bar dataKey="Declined" stackId="a" fill={COLORS.declined} />
          <Bar dataKey="No Change" stackId="a" fill={COLORS.same} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChangeChart;
