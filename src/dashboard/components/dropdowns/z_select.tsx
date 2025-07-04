import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

// --- TYPE DEFINITIONS ---
export interface DropdownOption {
  value: string;
  label: string; // Label is no longer optional for clarity
}

interface SelectDropdownProps {
  options: DropdownOption[];
  onSelect: (selected: string | string[]) => void; // Unified onSelect handler
  selectedValue?: string;    // For single-select
  selectedValues?: string[]; // For multi-select
  placeholder?: string;      // Text inside the button when nothing is selected
  label?: string;            // Optional title label above the dropdown
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  multiSelect?: boolean;
}


// --- REFINED COMPONENT ---
const SelectDropdown: React.FC<SelectDropdownProps> = ({
  options = [],
  onSelect,
  selectedValue,
  selectedValues = [],
  placeholder = 'Select an option',
  label,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  disabled = false,
  multiSelect = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Unified Select Handler ---
  const handleSelect = (optionValue: string) => {
    if (multiSelect) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onSelect(newValues);
    } else {
      onSelect(optionValue);
      setIsOpen(false);
    }
  };

  // --- Determine Button Display Text ---
  const getButtonLabel = () => {
    if (multiSelect) {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        return options.find((o) => o.value === selectedValues[0])?.label || placeholder;
      }
      return `${selectedValues.length} items selected`;
    }
    const selectedOption = options.find((o) => o.value === selectedValue);
    return selectedOption?.label || placeholder;
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>}
      
      {/* --- Trigger Button --- */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-white border border-gray-300 shadow-sm rounded-lg px-3 h-9 text-gray-800 font-medium flex items-center justify-between w-full cursor-pointer transition-colors duration-200 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate text-sm">{getButtonLabel()}</span>
        <ChevronDown className={`w-4 h-4 ml-2 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* --- Dropdown Menu --- */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-30 p-1 ${dropdownClassName}`}
          role="listbox"
          aria-activedescendant={multiSelect ? undefined : selectedValue}
        >
          <ul className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected = multiSelect ? selectedValues.includes(option.value) : selectedValue === option.value;
              return (
                <li
                  key={option.value}
                  className={`px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150 ${
                    isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={isSelected}
                  id={option.value}
                >
                  {multiSelect ? (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        readOnly
                        checked={isSelected}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                      />
                      <span>{option.label}</span>
                    </div>
                  ) : (
                    <span>{option.label}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;