import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClassTableProps {
  data: { studentName: string; class: string; variance: number; studentId: string; plateau?: boolean }[];
  showAlert?: boolean;
}

const ClassTable: React.FC<ClassTableProps> = ({ data, showAlert }) => (
  <ScrollArea className="h-44 pr-2">
    <table className="min-w-full text-sm">
      <thead>
        <tr className="text-left border-b border-blue-100">
          <th className="py-1 text-blue-500">Name</th>
          <th className="py-1 text-blue-500">Class</th>
          <th className="py-1 text-blue-500">Variance</th>
          {showAlert && <th className="py-1 text-blue-500">Alert</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((p) => (
          <tr key={p.studentId} className={`border-b border-blue-50 hover:bg-blue-50 transition-all duration-200 ${showAlert && p.plateau ? "bg-red-100" : ""}`}>
            <td className="py-1 text-blue-900 font-medium">{p.studentName}</td>
            <td className="py-1 text-blue-900">{p.class}</td>
            <td className="py-1 text-blue-600">±{p.variance.toFixed(1)}</td>
            {showAlert && <td className="py-1">{p.plateau ? <span title="No progress for 3+ tests" className="text-red-600 text-lg">&#x26A0;</span> : null}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </ScrollArea>
);

export default ClassTable;
