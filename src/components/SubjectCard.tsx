import React from "react";

interface SubjectCardProps {
  subject: string;
  improved: number;
  declined: number;
  same: number;
  color: string;
}

const iconStyle = "inline-block text-base align-middle mr-1";

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, improved, declined, same, color }) => {
  return (
    <div
      className={`rounded-xl border bg-white shadow-sm flex flex-col items-center justify-center text-xs font-medium min-w-0 max-w-[140px] max-h-[180px] px-3 py-4 transition-all duration-200 hover:shadow-md hover:ring-2 hover:ring-${color}-200`}
      style={{ minHeight: 0 }}
    >
      <div className="text-sm font-semibold mb-1 text-gray-700 text-center">{subject}</div>
      <div className="flex flex-col gap-1 w-full">
        <span className="flex items-center text-green-600"><span className={iconStyle}>➕</span>Improved: {improved}</span>
        <span className="flex items-center text-red-500"><span className={iconStyle}>➖</span>Declined: {declined}</span>
        <span className="flex items-center text-gray-500"><span className={iconStyle}>➊</span>No Change: {same}</span>
      </div>
    </div>
  );
};

export default SubjectCard;
