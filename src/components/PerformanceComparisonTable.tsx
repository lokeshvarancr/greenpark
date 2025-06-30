import React from "react";

interface SubjectData {
  mark1: number;
  rank1: number;
  mark2: number;
  rank2: number;
}

interface RowData {
  sno: number;
  class: string;
  section?: string;
  name: string;
  physics: SubjectData;
  chemistry: SubjectData;
  botany: SubjectData;
  zoology: SubjectData;
}

interface PerformanceComparisonTableProps {
  data: RowData[];
}

const getStatusText = (rank1: number, rank2: number) => {
  if (rank2 < rank1) return <span className="text-green-600 font-bold text-xs md:text-sm">+</span>;
  if (rank2 > rank1) return <span className="text-red-600 font-bold text-xs md:text-sm">-</span>;
  return <span className="text-gray-500 font-bold text-xs md:text-sm">0</span>;
};

const PerformanceComparisonTable: React.FC<PerformanceComparisonTableProps> = ({ data }) => (
  <div className="rounded-xl shadow border border-gray-200 bg-white">
    <table className="w-full border-collapse text-xs md:text-sm">
      <thead>
        <tr>
          <th rowSpan={2} className="border px-1 py-1 text-center align-middle bg-gray-100 font-semibold whitespace-nowrap">S.No</th>
          <th rowSpan={2} className="border px-1 py-1 text-center align-middle bg-gray-100 font-semibold whitespace-nowrap">Section</th>
          <th rowSpan={2} className="border px-1 py-1 text-center align-middle bg-gray-100 font-semibold whitespace-nowrap">Name</th>
          <th colSpan={5} className="border px-1 py-1 text-center bg-blue-50 font-semibold whitespace-nowrap">Physics</th>
          <th colSpan={5} className="border px-1 py-1 text-center bg-green-50 font-semibold whitespace-nowrap">Chemistry</th>
          <th colSpan={5} className="border px-1 py-1 text-center bg-yellow-50 font-semibold whitespace-nowrap">Botany</th>
          <th colSpan={5} className="border px-1 py-1 text-center bg-pink-50 font-semibold whitespace-nowrap">Zoology</th>
        </tr>
        <tr>
          {/* Physics */}
          <th className="border px-1 py-1 text-center bg-blue-50 font-medium whitespace-nowrap">Test 1</th>
          <th className="border px-1 py-1 text-center bg-blue-50 font-medium whitespace-nowrap">Rank</th>
          <th className="border px-1 py-1 text-center bg-blue-50 font-medium whitespace-nowrap">Test 2</th>
          <th className="border px-1 py-1 text-center bg-blue-50 font-medium whitespace-nowrap">Rank</th>
          <th className="border px-1 py-1 text-center bg-blue-50 font-medium whitespace-nowrap">Status</th>
          {/* Chemistry */}
          <th className="border px-1 py-1 text-center bg-green-50 font-medium whitespace-nowrap">Test 1</th>
          <th className="border px-1 py-1 text-center bg-green-50 font-medium whitespace-nowrap">Rank</th>
          <th className="border px-1 py-1 text-center bg-green-50 font-medium whitespace-nowrap">Test 2</th>
          <th className="border px-1 py-1 text-center bg-green-50 font-medium whitespace-nowrap">Rank</th>
          <th className="border px-1 py-1 text-center bg-green-50 font-medium whitespace-nowrap">Status</th>
          {/* Botany */}
          <th className="border px-1 py-1 text-center bg-yellow-50 font-medium whitespace-nowrap">Test 1</th>
          <th className="border px-1 py-1 text-center bg-yellow-50 font-medium whitespace-nowrap">Rank</th>
          <th className="border px-1 py-1 text-center bg-yellow-50 font-medium whitespace-nowrap">Test 2</th>
          <th className="border px-1 py-1 text-center bg-yellow-50 font-medium whitespace-nowrap">Rank</th>
          <th className="border px-1 py-1 text-center bg-yellow-50 font-medium whitespace-nowrap">Status</th>
          {/* Zoology */}
          <th className="border px-1 py-1 text-center bg-pink-50 font-medium whitespace-nowrap">Test 1</th>
          <th className="border px-1 py-1 text-center bg-pink-50 font-medium whitespace-nowrap">Rank</th>
          <th className="border px-1 py-1 text-center bg-pink-50 font-medium whitespace-nowrap">Test 2</th>
          <th className="border px-1 py-1 text-center bg-pink-50 font-medium whitespace-nowrap">Rank</th>
          <th className="border px-1 py-1 text-center bg-pink-50 font-medium whitespace-nowrap">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.sno} className="hover:bg-blue-50 transition-all duration-300">
            <td className="border px-1 py-1 text-center rounded-l-lg whitespace-nowrap">{row.sno}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.section || row.class}</td>
            <td className="border px-1 py-1 whitespace-nowrap">{row.name}</td>
            {/* Physics */}
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.physics.mark1}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.physics.rank1}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.physics.mark2}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.physics.rank2}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{getStatusText(row.physics.rank1, row.physics.rank2)}</td>
            {/* Chemistry */}
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.chemistry.mark1}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.chemistry.rank1}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.chemistry.mark2}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.chemistry.rank2}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{getStatusText(row.chemistry.rank1, row.chemistry.rank2)}</td>
            {/* Botany */}
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.botany.mark1}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.botany.rank1}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.botany.mark2}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.botany.rank2}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{getStatusText(row.botany.rank1, row.botany.rank2)}</td>
            {/* Zoology */}
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.zoology.mark1}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.zoology.rank1}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.zoology.mark2}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap">{row.zoology.rank2}</td>
            <td className="border px-1 py-1 text-center whitespace-nowrap rounded-r-lg">{getStatusText(row.zoology.rank1, row.zoology.rank2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default PerformanceComparisonTable;
