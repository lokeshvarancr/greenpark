import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ScoreChartProps {
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

const ScoreChart: React.FC<ScoreChartProps> = ({ summary }) => {
  const data = summary.map((s) => ({
    subject: s.subject,
    Improved: s.improved,
    Declined: s.declined,
    "No Change": s.same,
  }));

  return (
    <div className="w-full max-w-[500px] h-56 bg-white rounded-xl shadow-sm border flex items-center justify-center">
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          layout="vertical"
          barCategoryGap={20}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <XAxis type="number" allowDecimals={false} hide />
          <YAxis type="category" dataKey="subject" tick={{ fontSize: 13 }} width={80} />
          <Tooltip />
          <Bar dataKey="Improved" fill={COLORS.improved} barSize={18} radius={[9,9,9,9]} />
          <Bar dataKey="Declined" fill={COLORS.declined} barSize={18} radius={[9,9,9,9]} />
          <Bar dataKey="No Change" fill={COLORS.same} barSize={18} radius={[9,9,9,9]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;
