import React from "react";
import { CaretDown } from "@phosphor-icons/react";

type Props = {
  value?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
};

export const DateDropdownInput = React.forwardRef<HTMLInputElement, Props>(
  ({ value, onClick, label, className = "" }, ref) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref as any}
      className={`btn btn-sm justify-start truncate flex items-center w-full ${className}`}
      style={{ minHeight: 30 }}
    >
      <span className="truncate flex-1 text-left">{value || label || "Select date"}</span>
      <CaretDown className="w-4 h-4 ml-2 text-slate-400" />
    </button>
  )
);
DateDropdownInput.displayName = "DateDropdownInput";
