import React, { useEffect, useRef, useState } from "react";

interface CountUpProps {
  end: number;
  duration?: number; // ms
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

const CountUp: React.FC<CountUpProps> = ({ end, duration = 1200, decimals = 0, className = "", prefix = "", suffix = "" }) => {
  const [value, setValue] = useState(0);
  const start = useRef<number | null>(null);
  useEffect(() => {
    let frame: number;
    const animate = (timestamp: number) => {
      if (start.current === null) start.current = timestamp;
      const progress = Math.min((timestamp - start.current) / duration, 1);
      setValue(prev => prev === end ? prev : end * progress);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      start.current = null;
    };
  }, [end, duration]);
  return (
    <span className={className}>
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  );
};

export default CountUp;
