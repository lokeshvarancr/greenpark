import React from "react";

interface AverageTotalScoreGaugeProps {
  avgScore: number;
  maxMarks: number;
}

const AverageTotalScoreGauge: React.FC<AverageTotalScoreGaugeProps> = ({ 
  avgScore, 
  maxMarks 
}) => {
  // Handle edge cases for maxMarks
  const safeMaxMarks = maxMarks > 0 ? maxMarks : 1;
  const clampedAvgScore = Math.min(Math.max(avgScore, 0), safeMaxMarks);
  const percentage = clampedAvgScore / safeMaxMarks;

  // Dimensions and positions
  const radius = 80;
  const strokeWidth = 22;
  const cx = 100;
  const cy = 100;
  
  // Calculate needle position
  const needleAngle = Math.PI * (1 - percentage);
  const needleX = cx + radius * Math.cos(needleAngle);
  const needleY = cy - radius * Math.sin(needleAngle);

  // Color logic
  const getSegmentColor = (percent: number) => {
    if (percent > 0.8) return "#4CAF50";
    if (percent > 0.6) return "#26A69A";
    if (percent > 0.4) return "#2196F3";
    if (percent > 0.2) return "#FFB300";
    return "#E53935";
  };
  const gaugeColor = getSegmentColor(percentage);

  // Generate colored arc
  let coloredArc = null;
  if (percentage > 0) {
    const largeArcFlag = percentage > 0.5 ? 1 : 0;
    const sweepFlag = 1; // Always clockwise
    
    // Special case for 100%
    if (percentage >= 1) {
      coloredArc = (
        <path
          d={`M${cx - radius},${cy} A${radius},${radius} 0 1,1 ${cx + radius},${cy}`}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      );
    } else {
      coloredArc = (
        <path
          d={`M${cx - radius},${cy} A${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${needleX},${needleY}`}
          fill="none"
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      );
    }
  }

  // Generate labels
  const generateLabels = () => {
    const positions = [
      { value: 0, pos: 0 },
      { value: 0.2, pos: 0.2 },
      { value: 0.6, pos: 0.6 },
      { value: 0.8, pos: 0.8 },
      { value: 1, pos: 1 }
    ];

    return positions.map((item) => {
      const angle = Math.PI * (1 - item.pos);
      const labelRadius = radius + strokeWidth / 2 + 10;
      const labelX = cx + labelRadius * Math.cos(angle);
      const labelY = cy - labelRadius * Math.sin(angle);
      const labelValue = Math.round(safeMaxMarks * item.value);

      return (
        <text
          key={`label-${item.value}`}
          x={labelX}
          y={labelY}
          fontSize="13"
          fontWeight="500"
          fill="#555"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {labelValue}
        </text>
      );
    });
  };

  return (
    <div 
      className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center"
      role="figure"
      aria-label={`Average total score: ${clampedAvgScore} out of ${safeMaxMarks}`}
    >
      <span className="text-2xl font-semibold text-blue-900 mb-3 tracking-wide">
        Average Total Score
      </span>
      
      <div className="w-full max-w-[280px] mx-auto">
        <svg 
          viewBox="0 0 200 110" 
          width="100%" 
          height="195"
          aria-hidden="true"
        >
          {/* Base arc */}
          <path
            d={`M${cx - radius},${cy} A${radius},${radius} 0 0,1 ${cx + radius},${cy}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Colored progress arc */}
          {coloredArc}
          
          {/* Needle indicator */}
          <g>
            <line
              x1={cx}
              y1={cy}
              x2={needleX}
              y2={needleY}
              stroke="#333"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r="5" fill="#333" />
          </g>
          
          {/* Labels */}
          {generateLabels()}
          
          {/* Score display */}
          <text
            x={cx}
            y={cy - 30}
            fontSize="34"
            fontWeight="bold"
            fill="#1a1a1a"
            textAnchor="middle"
          >
            {Math.round(clampedAvgScore)}
          </text>
          <text
            x={cx}
            y={cy - 5}
            fontSize="16"
            fill="#6b7280"
            textAnchor="middle"
          >
            / {safeMaxMarks}
          </text>
        </svg>
      </div>
      
      <span className="text-sm text-gray-500 mt-4 font-medium">
        Performance Gauge
      </span>
    </div>
  );
};

export default AverageTotalScoreGauge;