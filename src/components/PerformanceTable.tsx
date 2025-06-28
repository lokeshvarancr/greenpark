import React from "react";

interface PerformanceTableProps {
  data: any[];
  renderRow: (row: any) => React.ReactNode;
}

const PerformanceTable: React.FC<PerformanceTableProps> = ({ data, renderRow }) => {
  return (
    <div className="bg-white rounded-2xl shadow border p-0 overflow-x-auto max-h-[60vh]">
      <table className="min-w-[1200px] w-full text-xs">
        <thead className="sticky top-0 z-10 bg-gradient-to-b from-gray-100 to-gray-50">
          <tr>
            <th className="border px-2 py-2 text-center rounded-tl-2xl">S.No</th>
            <th className="border px-2 py-2 text-center">Class</th>
            <th className="border px-2 py-2 text-left">Student</th>
            {/* Physics */}
            <th className="border px-2 py-2 text-center">Phy +</th>
            <th className="border px-2 py-2 text-center">Phy -</th>
            <th className="border px-2 py-2 text-center">Δ</th>
            <th className="border px-2 py-2 text-center">Rank +</th>
            <th className="border px-2 py-2 text-center">Rank -</th>
            <th className="border px-2 py-2 text-center">Δ</th>
            {/* Chemistry */}
            <th className="border px-2 py-2 text-center">Chem +</th>
            <th className="border px-2 py-2 text-center">Chem -</th>
            <th className="border px-2 py-2 text-center">Δ</th>
            <th className="border px-2 py-2 text-center">Rank +</th>
            <th className="border px-2 py-2 text-center">Rank -</th>
            <th className="border px-2 py-2 text-center">Δ</th>
            {/* Botany */}
            <th className="border px-2 py-2 text-center">Bot +</th>
            <th className="border px-2 py-2 text-center">Bot -</th>
            <th className="border px-2 py-2 text-center">Δ</th>
            <th className="border px-2 py-2 text-center">Rank +</th>
            <th className="border px-2 py-2 text-center">Rank -</th>
            <th className="border px-2 py-2 text-center">Δ</th>
            {/* Zoology */}
            <th className="border px-2 py-2 text-center">Zoo +</th>
            <th className="border px-2 py-2 text-center">Zoo -</th>
            <th className="border px-2 py-2 text-center">Δ</th>
            <th className="border px-2 py-2 text-center">Rank +</th>
            <th className="border px-2 py-2 text-center">Rank -</th>
            <th className="border px-2 py-2 text-center rounded-tr-2xl">Δ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map(renderRow)}
        </tbody>
      </table>
    </div>
  );
};

export default PerformanceTable;
