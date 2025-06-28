import React from "react";

const AccuracyBadge: React.FC<{ accuracy: number }> = ({ accuracy }) => {
  if (accuracy < 40)
    return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">{accuracy}%</span>;
  if (accuracy <= 60)
    return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">{accuracy}%</span>;
  return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">{accuracy}%</span>;
};

export default AccuracyBadge;
