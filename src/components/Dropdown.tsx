import React from "react";
import { ChevronDown } from "lucide-react"; // Using lucide-react for the icon

interface DropdownProps {
  label: string; // The label for the dropdown
  value: string; // The currently selected value
  options: { label: string; value: string }[]; // Array of options
  onChange: (value: string) => void; // Callback when value changes
  className?: string; // Optional additional class names for the container
  disabled?: boolean; // Whether the dropdown is disabled
}

const Dropdown: React.FC<DropdownProps> = ({ label, value, options, onChange, className = "", disabled }) => {
  // These styles are directly taken or adapted from the FilterBar's common styles
  const commonButtonClasses = `
    bg-[#ededed] // Light gray background
    border-none // No border
    shadow-sm // Subtle shadow
    rounded-lg // Rounded corners
    px-3 py-1 // Padding (reduced vertical)
    text-[#222] // Dark text color
    font-medium // Medium font weight
    h-8 // Fixed height (32px)
    flex items-center justify-between w-full // For internal layout, though select handles most
    cursor-pointer
    transition-all duration-200
    hover:bg-gray-100 // Slightly lighter hover effect
    text-sm // Small text size
    appearance-none // Important for custom styling of <select>
  `;

  const labelClasses = `
    text-sm text-[#8b8b8b] font-medium whitespace-nowrap // Matching FilterBar's label style
  `;

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      {/* Label for the dropdown, matching the FilterBar's label style */}
      <label className={labelClasses}>{label}</label>

      {/* The select element styled to look like the FilterBar's dropdowns */}
      <select
        className={`${commonButtonClasses} pr-8 focus:outline-none focus:ring-1 focus:ring-blue-300`} // Add focus styles
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Custom ChevronDown icon, positioned similarly to the FilterBar's dropdowns */}
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  );
};

export default Dropdown;  