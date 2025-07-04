import React from "react";
import { useFilter } from "@/lib/DashboardFilterContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker-custom.css"; // Ensure this CSS is correctly applying styles to customInput
import { DateDropdownInput } from "./DateDropdownInput"; // This component is key
import SelectDropdown from "@/dashboard/components/dropdowns/z_select";
import type { DropdownOption } from "@/dashboard/components/dropdowns/z_select";

const subjectOptionsMap: Record<string, string[]> = {
  Weekly: ["Physics", "Chemistry", "Botany", "Zoology"],
  Cumulative: ["Physics + Botany", "Chemistry + Zoology"],
  "Grand Test": [],
};

export default function FilterBar({
  institutions = [],
  batches = [],
  classes = [],
}: {
  institutions: string[];
  batches: string[];
  classes: string[];
}) {
  const { filter, setFilter } = useFilter();

  const update = (key: keyof typeof filter, value: any) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  const showSubject = filter.examType === "Weekly" || filter.examType === "Cumulative";
  const subjectOptions = subjectOptionsMap[filter.examType] || [];

  React.useEffect(() => {
    if (!showSubject && filter.subject !== "") {
      update("subject", "");
    } else if (showSubject && !subjectOptions.includes(filter.subject)) {
      update("subject", subjectOptions[0] || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.examType]);

  const toOptions = (arr: string[], labelAll?: string): DropdownOption[] => [
    ...(labelAll ? [{ value: "All", label: labelAll }] : []),
    ...arr.map((v) => ({ value: v, label: v })),
  ];

  // Reusable wrapper for each filter to maintain consistent width and spacing
  const FilterItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <div className={`w-[140px] mx-0 flex flex-col ${className}`}>{children}</div>
  );

  return (
    <div className="mt-6 w-full">
      <div className="flex flex-row flex-nowrap items-end w-full gap-x-4">
        {/* Filter Icon with fixed width and no flex grow */}
        <div className="flex-none w-[40px] pb-2 flex items-center justify-center mx-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#A0A4AB" viewBox="0 0 256 256">
            <path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z"></path>
          </svg>
        </div>
        {/* Date Pickers */}
        <FilterItem>
          <label className="block text-sm font-medium text-gray-600 mb-1">From</label>
          <div className="w-full">
            <DatePicker
              selected={filter.dateRange.from}
              onChange={(date) => update("dateRange", { ...filter.dateRange, from: date || new Date() })}
              dateFormat="yyyy-MM-dd"
              maxDate={filter.dateRange.to}
              customInput={<DateDropdownInput className="inzight-dropdown-input w-full min-w-[140px] max-w-[140px] px-3 py-2 text-sm" />}
              popperClassName="inzight-datepicker-popper"
            />
          </div>
        </FilterItem>
        <FilterItem>
          <label className="block text-sm font-medium text-gray-600 mb-1">To</label>
          <div className="w-full">
            <DatePicker
              selected={filter.dateRange.to}
              onChange={(date) => update("dateRange", { ...filter.dateRange, to: date || new Date() })}
              dateFormat="yyyy-MM-dd"
              minDate={filter.dateRange.from}
              maxDate={new Date()}
              customInput={<DateDropdownInput className="inzight-dropdown-input w-full min-w-[140px] max-w-[140px] px-3 py-2 text-sm" />}
              popperClassName="inzight-datepicker-popper"
            />
          </div>
        </FilterItem>
        {/* Dropdowns */}
        <FilterItem>
          <SelectDropdown
            label="Institution"
            onSelect={(v) => update("institution", v)}
            selectedValue={filter.institution}
            options={toOptions(institutions, "All Institutions")}
            placeholder="All Institutions"
            className="w-full min-w-[140px] max-w-[140px]"
            buttonClassName="w-full min-w-[140px] max-w-[140px] px-3 py-2 text-sm"
          />
        </FilterItem>
        <FilterItem>
          <SelectDropdown
            label="Batch"
            onSelect={(v) => update("batch", v)}
            selectedValue={filter.batch}
            options={toOptions(batches, "All Batches")}
            placeholder="All Batches"
            className="w-full min-w-[140px] max-w-[140px]"
            buttonClassName="w-full min-w-[140px] max-w-[140px] px-3 py-2 text-sm"
          />
        </FilterItem>
        <FilterItem>
          <SelectDropdown
            label="Class"
            onSelect={(v) => update("class", v)}
            selectedValue={filter.class}
            options={toOptions(classes, "All Classes")}
            placeholder="All Classes"
            className="w-full min-w-[140px] max-w-[140px]"
            buttonClassName="w-full min-w-[140px] max-w-[140px] px-3 py-2 text-sm"
          />
        </FilterItem>
        <FilterItem>
          <SelectDropdown
            label="Test"
            onSelect={(v) => update("examType", v)}
            selectedValue={filter.examType}
            options={toOptions(["Overall", "Weekly", "Cumulative", "Grand Test"])}
            placeholder="Select a Test"
            className="w-full min-w-[140px] max-w-[140px]"
            buttonClassName="w-full min-w-[140px] max-w-[140px] px-3 py-2 text-sm"
          />
        </FilterItem>
        {showSubject && (
          <FilterItem>
            <SelectDropdown
              label="Subject"
              onSelect={(v) => update("subject", v)}
              selectedValue={filter.subject}
              options={toOptions(subjectOptions)}
              placeholder="Select a Subject"
              className="w-full min-w-[140px] max-w-[150px]"
              buttonClassName="w-full min-w-[140px] max-w-[150px] px-3 py-2 text-sm"
            />
          </FilterItem>
        )}
      </div>
      <div className="w-full h-[1.5px] bg-gray-200 mt-6 mb-2 rounded" />
    </div>
  );
}