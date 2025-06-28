import React from "react";

interface GroupedPerformanceTableProps {
  data: any[];
  renderRow: (row: any) => React.ReactNode;
}

const GroupedPerformanceTable: React.FC<GroupedPerformanceTableProps> = ({ data, renderRow }) => {
  return (
    <div className="bg-white rounded-2xl shadow border p-0 overflow-x-auto max-h-[500px]">
      <table className="min-w-[1200px] w-full text-xs">
        <thead className="sticky top-0 z-10 bg-white">
          <tr>
            <th className="border px-3 py-2 align-middle" rowSpan={2}>S.No</th>
            <th className="border px-3 py-2 align-middle" rowSpan={2}>Class</th>
            <th className="border px-3 py-2 align-middle" rowSpan={2}>Student</th>
            <th className="border-r-2 px-3 py-2 text-center" colSpan={3}>Physics</th>
            <th className="border-r-2 px-3 py-2 text-center" colSpan={3}>Chemistry</th>
            <th className="border-r-2 px-3 py-2 text-center" colSpan={3}>Botany</th>
            <th className="px-3 py-2 text-center" colSpan={3}>Zoology</th>
          </tr>
          <tr className="bg-gray-50">
            {/* Physics */}
            <th className="border px-3 py-2 text-center">Test</th>
            <th className="border px-3 py-2 text-center">Rank</th>
            <th className="border-r-2 px-3 py-2 text-center">Status</th>
            {/* Chemistry */}
            <th className="border px-3 py-2 text-center">Test</th>
            <th className="border px-3 py-2 text-center">Rank</th>
            <th className="border-r-2 px-3 py-2 text-center">Status</th>
            {/* Botany */}
            <th className="border px-3 py-2 text-center">Test</th>
            <th className="border px-3 py-2 text-center">Rank</th>
            <th className="border-r-2 px-3 py-2 text-center">Status</th>
            {/* Zoology */}
            <th className="border px-3 py-2 text-center">Test</th>
            <th className="border px-3 py-2 text-center">Rank</th>
            <th className="px-3 py-2 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
};

export default GroupedPerformanceTable;
