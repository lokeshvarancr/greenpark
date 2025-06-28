import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface RankBarChartProps {
  data: { name: string; rank: number }[];
  subjectOptions: string[];
  selectedSubject: string;
  setSelectedSubject: (val: string) => void;
}

export const RankBarChart: React.FC<RankBarChartProps> = ({ data, subjectOptions, selectedSubject, setSelectedSubject }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
    <label className="block text-xs font-semibold mb-2 text-gray-600">Subject</label>
    <select
      className="appearance-none border rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm mb-4 w-full max-w-xs"
      value={selectedSubject}
      onChange={e => setSelectedSubject(e.target.value)}
    >
      {subjectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <div className="flex-1 min-h-[220px]">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={12}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip cursor={{ fill: '#f3f4f6' }} />
          <Bar dataKey="rank" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

interface GroupedBarChartProps {
  data: { subject: string; Improved: number; Declined: number; NoChange: number }[];
}

export const GroupedBarChart: React.FC<GroupedBarChartProps> = ({ data }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
    <div className="text-xs font-semibold mb-2 text-gray-600">Subject-wise Comparison</div>
    <div className="flex-1 min-h-[220px]">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap={16}>
          <XAxis dataKey="subject" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip cursor={{ fill: '#f3f4f6' }} />
          <Bar dataKey="Improved" fill="#16a34a" barSize={10} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Declined" fill="#dc2626" barSize={10} radius={[4, 4, 0, 0]} />
          <Bar dataKey="NoChange" fill="#6b7280" barSize={10} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);
