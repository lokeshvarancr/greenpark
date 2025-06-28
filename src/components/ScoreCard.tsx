import React from "react";

interface ScoreCardProps {
  subject: string;
  improved: number;
  declined: number;
  same: number;
  color: string;
}

const iconStyle = "inline-block text-2xl align-middle";

const ScoreCard: React.FC<ScoreCardProps> = ({ subject, improved, declined, same, color }) => {
  return (
    <div
      className={`rounded-2xl shadow border p-6 flex flex-col items-center bg-white transition-all duration-200 hover:shadow-xl hover:ring-2 hover:ring-${color}-200`}
      style={{ minWidth: 0 }}
    >
      <div className="text-lg font-semibold mb-2 text-gray-700">{subject}</div>
      <div className="flex items-center gap-4 text-2xl font-bold">
        <span className="text-green-600"><span className={iconStyle}>➕</span> {improved}</span>
        <span className="text-red-500"><span className={iconStyle}>➖</span> {declined}</span>
        <span className="text-gray-500"><span className={iconStyle}>➊</span> {same}</span>
      </div>
    </div>
  );
};

export default ScoreCard;
