import React from "react";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ label, value, options, onChange, className = "", disabled }) => (
  <div className={`relative min-w-[140px] ${className}`}>
    <label className="block text-xs font-semibold mb-1 text-gray-600">{label}</label>
    <select
      className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8 bg-white shadow-sm hover:border-blue-400 transition w-full"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2 top-8 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
  </div>
);

export default Dropdown;
