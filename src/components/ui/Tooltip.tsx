import React from "react";
import type { ReactNode } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <span className="relative group inline-block">
      {children}
      <span className="pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap shadow-lg min-w-max">
        {content}
      </span>
    </span>
  );
};

export default Tooltip;
