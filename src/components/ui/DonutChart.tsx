import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from "recharts";

interface DonutChartProps {
  data: { name: string; value: number }[];
  colors: Record<string, string>;
  title?: string;
  tooltipDesc?: string;
  onClickSlice?: (name: string) => void;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, colors, title, tooltipDesc, onClickSlice }) => (
  <div className="w-full h-[140px] flex flex-col items-center justify-center">
    {title && <div className="text-xs font-semibold text-blue-700 mb-1">{title}</div>}
    <ResponsiveContainer width="100%" height={120}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={40}
          outerRadius={55}
          paddingAngle={1}
          stroke="none"
          onClick={(_, idx) => onClickSlice && onClickSlice(data[idx].name)}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={colors[d.name] || "#6366f1"} />
          ))}
        </Pie>
        <ReTooltip formatter={(v, n) => [`${v} students`, n]} content={({ active, payload }) => active && payload && payload.length ? (
          <div className="bg-white border border-blue-100 rounded-lg px-3 py-1 text-xs text-blue-700 shadow">
            <div className="font-semibold">{payload[0].name}</div>
            <div>{payload[0].value} students</div>
            {tooltipDesc && <div className="mt-1 text-blue-400">{tooltipDesc}</div>}
          </div>
        ) : null} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default DonutChart;
