import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

// --- Interfaces for Type Safety ---

/**
 * Defines the structure of an individual option object for the dropdown.
 */
export interface DropdownOption {
  value: string; // The unique value associated with the option
  label?: string; // Optional display label for the option. If not provided, value will be used.
}

/**
 * Defines the props for the SelectDropdown component.
 */
interface SelectDropdownProps {
  options?: DropdownOption[]; // Array of option objects
  selectedValue?: string | null; // The currently selected value, or null if none is selected (single select)
  selectedValues?: string[]; // The currently selected values (multi-select)
  onSelect: ((value: string) => void) | ((value: string, values: string[]) => void); // Accept both signatures
  label?: string; // Default text to display when no option is selected
  className?: string; // Additional classes for the main dropdown container
  buttonClassName?: string; // Classes for the dropdown trigger button
  dropdownClassName?: string; // Classes for the dropdown menu content container
  itemClassName?: string; // Classes for each individual dropdown item (<li><a>)
  disabled?: boolean; // Disable the dropdown if true
  multiSelect?: boolean; // Enable multi-select mode
}

// --- SelectDropdown Component ---

const commonButtonClasses =
  'bg-[#ededed] border-none shadow-sm rounded-lg px-3 py-1 text-[#222] font-medium h-8 flex items-center justify-between w-full cursor-pointer transition-all duration-200 hover:bg-gray-100 text-sm appearance-none';
const labelClasses =
  'text-sm text-[#8b8b8b] font-medium whitespace-nowrap mb-1';

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  options = [],
  selectedValue = null,
  selectedValues = [],
  onSelect,
  label = '', // Default to empty string
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  itemClassName = '',
  disabled = false,
  multiSelect = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Button label logic
  let buttonLabel = label;
  if (multiSelect) {
    if (selectedValues.length === 0) buttonLabel = label;
    else if (selectedValues.length === 1) buttonLabel = options.find(o => o.value === selectedValues[0])?.label || selectedValues[0];
    else buttonLabel = `${selectedValues.length} selected`;
  } else {
    buttonLabel = options.find((o) => o.value === selectedValue)?.label || selectedValue || label;
  }

  // Multi-select change handler
  const handleMultiSelect = (value: string) => {
    let next: string[];
    if (selectedValues.includes(value)) {
      next = selectedValues.filter(v => v !== value);
    } else {
      next = [...selectedValues, value];
    }
    // Always call with two arguments for multi-select
    (onSelect as (value: string, values: string[]) => void)(value, next);
  };

  // Single-select change handler
  const handleSingleSelect = (value: string) => {
    // Always call with one argument for single-select
    (onSelect as (value: string) => void)(value);
    setOpen(false);
  };

  return (
    <div className={`relative flex flex-col items-start gap-1 ${className}`} ref={ref}>
      {/* Only render label if provided and not empty */}
      {label && <label className={labelClasses}>{label}</label>}
      <button
        type="button"
        className={`${commonButtonClasses} ${buttonClassName}`}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate text-left flex-1">
          {buttonLabel}
        </span>
        <ChevronDown className={`w-4 h-4 ml-2 text-[#8b8b8b] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={`absolute left-0 mt-1 z-30 bg-white border rounded-lg shadow-lg w-full p-2 ${dropdownClassName}`} style={{ minWidth: 120 }}>
          <ul className="menu">
            {options.map((option) => (
              <li key={option.value} className="w-full">
                {multiSelect ? (
                  <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={() => handleMultiSelect(option.value)}
                      className="accent-blue-600 w-4 h-4 rounded"
                      readOnly
                    />
                    <span className="text-sm font-medium">{option.label || option.value}</span>
                  </label>
                ) : (
                  <a
                    onClick={() => handleSingleSelect(option.value)}
                    className={`hover:bg-primary/10 hover:text-primary transition-colors duration-200 rounded-md text-sm whitespace-nowrap px-2 py-1 ${itemClassName}`}
                    style={{ cursor: 'pointer' }}
                  >
                    {option.label || option.value}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;