import React from "react";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  title?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, xKey, yKey, title }) => (
  <div className="w-full h-[220px]">
    {title && <div className="text-base font-semibold text-gray-700 mb-2">{title}</div>}
    <ResponsiveContainer width="100%" height={180}>
      <ReBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ef" />
        <XAxis dataKey={xKey} tick={{ fill: "#2563eb", fontWeight: 500, fontSize: 13 }} />
        <YAxis domain={[0, 100]} tick={{ fill: "#2563eb", fontSize: 13 }} />
        <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
        <Bar dataKey={yKey} fill="#2563eb" radius={[12, 12, 0, 0]} />
      </ReBarChart>
    </ResponsiveContainer>
  </div>
);

export default BarChart;
