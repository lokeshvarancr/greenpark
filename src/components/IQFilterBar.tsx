import React from "react";
// Assuming z_select is the refined Dropdown component from our previous discussion
import Dropdown from "../dashboard/components/dropdowns/z_select";

// Interface remains the same
interface IQFilterBarProps {
  testType: string;
  setTestType: (v: string) => void;
  month: string;
  setMonth: (v: string) => void;
  week?: string;
  setWeek?: (v: string) => void;
  weekOptions?: { label: string; value: string }[];
  batch?: string;
  setBatch?: (v: string) => void;
  batchOptions?: { label: string; value: string }[];
  subject?: string;
  setSubject?: (v: string) => void;
  subjectOptions?: { label:string; value: string }[];
  subjectPair?: string;
  setSubjectPair?: (v: string) => void;
  subjectPairOptions?: { label: string; value: string }[];
  grandTestName?: string;
  setGrandTestName?: (v: string) => void;
  grandTestOptions?: { label: string; value: string }[];
  sectionOptions: string[];
  selectedSections: string[];
  setSelectedSections: (sections: string[]) => void;
}

// Helper to generate the next 12 months starting from the current month
const generateMonthOptions = () => {
  const options = [];
  const today = new Date(); // Use today's date to start
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    options.push({
      label: date.toLocaleString("default", { month: "long", year: "numeric" }),
      value: `${date.getFullYear()}-${date.getMonth() + 1}`,
    });
  }
  return options;
};

const IQFilterBar: React.FC<IQFilterBarProps> = (props) => {
  const { testType, selectedSections, setSelectedSections } = props;

  // Handler for the multi-select dropdown, matching the refined component's signature
  const handleSectionSelect = (sections: string | string[]) => {
    // Ensure we always pass an array, even if the type allows a string
    setSelectedSections(Array.isArray(sections) ? sections : []);
  };
  
  // Create a reusable wrapper for each filter item
  const FilterItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-w-[180px]">{children}</div>
  );

  return (
    <div className="mt-6 w-full">
      {/* KEY CHANGE 1: A single, clean flex container.
        - `flex-wrap` allows filters to wrap on smaller screens.
        - `items-end` aligns all dropdowns along their bottom edge for a clean look.
        - `gap-x-6` provides consistent horizontal spacing.
        - `gap-y-4` provides vertical spacing when items wrap.
      */}
      <div className="flex flex-row flex-wrap items-end gap-x-6 gap-y-4 w-full">
        {/* Filter Icon */}
        <div className="flex-shrink-0 pb-2"> {/* Added pb-2 to align icon with buttons */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#A0A4AB" viewBox="0 0 256 256"><path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z"></path></svg>
        </div>

        {/* KEY CHANGE 2: Using the Dropdown's `label` prop directly.
          This removes the need for extra <span> tags, making the code cleaner.
          Each dropdown is wrapped in a FilterItem for consistent width.
        */}
        <FilterItem>
          <Dropdown
            label="Test Type"
            selectedValue={props.testType}
            options={["Weekly", "Cumulative", "Grand Test"].map(t => ({ label: t, value: t }))}
            onSelect={(v) => props.setTestType(v as string)}
          />
        </FilterItem>

        <FilterItem>
          <Dropdown
            label="Month"
            selectedValue={props.month}
            options={generateMonthOptions()}
            onSelect={(v) => props.setMonth(v as string)}
          />
        </FilterItem>

        <FilterItem>
          <Dropdown
            label="Section"
            multiSelect
            selectedValues={selectedSections}
            options={props.sectionOptions.map(s => ({ label: s, value: s }))}
            onSelect={handleSectionSelect}
            placeholder="Select Sections"
          />
        </FilterItem>

        {/* --- Conditional Filters based on 'Cumulative' Test Type --- */}
        {testType === "Cumulative" && props.batchOptions && props.setBatch && (
          <FilterItem>
            <Dropdown
              label="Batch"
              selectedValue={props.batch}
              options={props.batchOptions}
              onSelect={(v) => props.setBatch!(v as string)}
            />
          </FilterItem>
        )}
        
        {testType === "Cumulative" && props.subjectPairOptions && props.setSubjectPair && (
          <FilterItem>
            <Dropdown
              label="Subject Pair"
              selectedValue={props.subjectPair}
              options={props.subjectPairOptions}
              onSelect={(v) => props.setSubjectPair!(v as string)}
            />
          </FilterItem>
        )}

        {/* --- Other Conditional Filters (like Weekly, Grand Test) --- */}
        {testType === "Weekly" && props.weekOptions && props.setWeek && (
          <FilterItem>
            <Dropdown
              label="Week"
              selectedValue={props.week}
              options={props.weekOptions}
              onSelect={(v) => props.setWeek!(v as string)}
            />
          </FilterItem>
        )}

        {testType === "Weekly" && props.subjectOptions && props.setSubject && (
           <FilterItem>
            <Dropdown
              label="Subject"
              selectedValue={props.subject}
              options={props.subjectOptions}
              onSelect={(v) => props.setSubject!(v as string)}
            />
          </FilterItem>
        )}

        {testType === "Grand Test" && props.grandTestOptions && props.setGrandTestName && (
           <FilterItem>
            <Dropdown
              label="Grand Test Name"
              selectedValue={props.grandTestName}
              options={props.grandTestOptions}
              onSelect={(v) => props.setGrandTestName!(v as string)}
            />
          </FilterItem>
        )}
      </div>

      {/* Divider line below filter bar */}
      <div className="w-full h-[1.5px] bg-gray-200 mt-6 mb-2 rounded" />
    </div>
  );
};

export default IQFilterBar;