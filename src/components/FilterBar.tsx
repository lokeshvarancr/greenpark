import React from "react";
import { useFilter } from "@/lib/DashboardFilterContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker-custom.css";
import { DateDropdownInput } from "./DateDropdownInput";
import SelectDropdown from "@/dashboard/components/dropdowns/z_select"; // This is your z_select.tsx
import type { DropdownOption } from "@/dashboard/components/dropdowns/z_select";

const subjectOptionsMap = {
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
  const update = (k: keyof typeof filter) => (v: any) => setFilter((p) => ({ ...p, [k]: v }));
  const showSubject = filter.examType === "Weekly" || filter.examType === "Cumulative";
  const subjectOptions = subjectOptionsMap[filter.examType];

  // Ensure subject is valid for current exam type
  React.useEffect(() => {
    if (!showSubject && filter.subject !== "") {
      setFilter((p) => ({ ...p, subject: "" }));
    } else if (showSubject && (filter.subject === "" || !(subjectOptions as readonly string[]).includes(filter.subject))) {
      setFilter((p) => ({ ...p, subject: subjectOptions[0] as typeof p.subject }));
    }
    // eslint-disable-next-line
  }, [filter.examType]);

  // Helper to convert string[] to DropdownOption[]
  const toOptions = (arr: string[], labelAll?: string): DropdownOption[] => [
    ...(labelAll ? [{ value: "All", label: labelAll }] : []),
    ...arr.map((v) => ({ value: v, label: v })),
  ];

  // --- Common button styles for SelectDropdown and DateDropdownInput ---
  const commonButtonClasses = `
    bg-white
    border border-gray-300
    shadow-sm
    rounded-lg
    px-3 py-1     // Reduced vertical padding further for h-8
    text-gray-800
    font-medium
    h-8           // Reduced height (32px)
    flex items-center justify-between w-full
    cursor-pointer
    transition-all duration-200
    hover:bg-gray-50
    text-sm       // Ensure text inside also fits smaller size
  `;

  // --- Common label classes ---
  const labelClasses = `
    text-sm text-gray-600 font-normal whitespace-nowrap
  `;

  return (
    <>
      <div className="mt-6 w-full">
        <div className="flex flex-col md:flex-row md:items-center gap-x-4 gap-y-3 w-full px-0 py-0 bg-transparent rounded-none shadow-none border-none transition-all duration-300 relative">
          {/* Filter Icon at the start - visually grouped with filters */}
          <div className="flex items-center h-9 w-9 bg-transparent rounded-lg justify-center mr-2 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#A0A4AB" viewBox="0 0 256 256"><path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z"></path></svg>
          </div>

          {/* Date Range - From */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <label className={labelClasses + " font-medium text-[#8b8b8b]"}>From</label>
            <DatePicker
              selected={filter.dateRange.from}
              onChange={(date: Date | null) => update("dateRange")({ ...filter.dateRange, from: date || new Date() })}
              dateFormat="yyyy-MM-dd"
              maxDate={filter.dateRange.to}
              customInput={<DateDropdownInput label="From" className={commonButtonClasses + " min-w-[100px] text-[#222]"} />}
              popperClassName="inzight-datepicker-popper"
            />
          </div>

          {/* Date Range - To */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <label className={labelClasses + " font-medium text-[#8b8b8b]"}>To</label>
            <DatePicker
              selected={filter.dateRange.to}
              onChange={(date: Date | null) => update("dateRange")({ ...filter.dateRange, to: date || new Date() })}
              dateFormat="yyyy-MM-dd"
              minDate={filter.dateRange.from}
              maxDate={new Date()}
              customInput={<DateDropdownInput label="To" className={commonButtonClasses + " min-w-[100px] text-[#222]"} />}
              popperClassName="inzight-datepicker-popper"
            />
          </div>

          {/* Institution */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <label className={labelClasses + " font-medium text-[#8b8b8b]"}>Institution</label>
            <SelectDropdown
              options={toOptions(institutions, "All")}
              selectedValue={filter.institution}
              onSelect={update("institution")}
              buttonClassName={commonButtonClasses + " min-w-[100px] text-[#222]"} />
          </div>

          {/* Batch */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <label className={labelClasses + " font-medium text-[#8b8b8b]"}>Batch</label>
            <SelectDropdown
              options={toOptions(batches, "All")}
              selectedValue={filter.batch}
              onSelect={update("batch")}
              buttonClassName={commonButtonClasses + " min-w-[100px] text-[#222]"} />
          </div>

          {/* Class */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <label className={labelClasses + " font-medium text-[#8b8b8b]"}>Class</label>
            <SelectDropdown
              options={toOptions(classes, "All")}
              selectedValue={filter.class}
              onSelect={update("class")}
              buttonClassName={commonButtonClasses + " min-w-[100px] text-[#222]"} />
          </div>

          {/* Exam Type */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <label className={labelClasses + " font-medium text-[#8b8b8b]"}>Test</label>
            <SelectDropdown
              options={toOptions(["Overall", "Weekly", "Cumulative", "Grand Test"])}
              selectedValue={filter.examType}
              onSelect={update("examType")}
              buttonClassName={commonButtonClasses + " min-w-[120px] text-[#222]"} />
          </div>

          {/* Subject (conditional) */}
          {showSubject && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <label className={labelClasses + " font-medium text-[#8b8b8b]"}>Subject</label>
              <SelectDropdown
                options={toOptions(subjectOptions)}
                selectedValue={filter.subject}
                onSelect={update("subject")}
                buttonClassName={commonButtonClasses + " min-w-[120px] text-[#222]"} />
            </div>
          )}
        </div>
        {/* Divider line below filter bar */}
        <div className="w-full h-[1.5px] bg-[#ededed] mt-6 mb-2 rounded" />
      </div>
    </>
  );
}