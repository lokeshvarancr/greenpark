// CustomDateInput.tsx
import React from "react";

type Props = {
  value?: string;
  onClick?: () => void;
  label?: string;
};

export const CustomDateInput = React.forwardRef<HTMLInputElement, Props>(
  ({ value, onClick, label }, ref) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref as any}
      className="flex items-center px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-400 w-full justify-between"
    >
      <span>{value || label || "Select date"}</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-2 text-slate-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 21h15a.75.75 0 00.75-.75V7.5a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v12.75c0 .414.336.75.75.75z" />
      </svg>
    </button>
  )
);
CustomDateInput.displayName = "CustomDateInput";
