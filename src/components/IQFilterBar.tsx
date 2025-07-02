import React from "react";
import Dropdown from "../dashboard/components/dropdowns/z_select";

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
  subjectOptions?: { label: string; value: string }[];
  subjectPair1?: string;
  setSubjectPair1?: (v: string) => void;
  subjectPair2?: string;
  setSubjectPair2?: (v: string) => void;
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

const SECTION_LABELS = ["Select All", "11A", "11B", "12A", "12B"];

const IQFilterBar: React.FC<IQFilterBarProps> = (props) => {
  return (
    <>
      <div className="mt-6 w-full">
        <div className="flex flex-row flex-wrap items-center gap-6 w-full px-0 py-0 bg-transparent rounded-none shadow-none border-none transition-all duration-300 relative">
          {/* Filter Icon at the start - visually grouped with filters */}
          <div className="flex items-center h-9 w-9 bg-transparent rounded-lg justify-center mr-4 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#A0A4AB" viewBox="0 0 256 256"><path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z"></path></svg>
          </div>
          {/* Filter controls */}
          <div className="flex flex-row flex-wrap items-center gap-6 flex-1 min-w-0">
            <div className="flex items-center gap-5 min-w-[160px]">
              <span className="text-sm text-[#8b8b8b] font-medium text-left">Test Type</span>
              <Dropdown
                selectedValue={props.testType}
                options={["Weekly", "Cumulative", "Grand Test"].map(t => ({ label: t, value: t }))}
                onSelect={props.setTestType}
                className="border-none text-[#222] font-semibold shadow-none px-4 h-10 w-full"
                label=""
              />
            </div>
            <div className="flex items-center gap-2 min-w-[160px]">
              <span className="text-sm text-[#8b8b8b] font-medium text-left">Month</span>
              <Dropdown
                selectedValue={props.month}
                options={Array.from({ length: 12 }, (_, i) => {
                  const date = new Date(2025, 5 + i, 1);
                  return { label: date.toLocaleString("default", { month: "long", year: "numeric" }), value: `${date.getFullYear()}-${date.getMonth() + 1}` };
                })}
                onSelect={props.setMonth}
                className="border-none text-[#222] font-semibold shadow-none px-4 h-10 w-full"
                label=""
              />
            </div>
            {/* Section Multi-select Dropdown (right-aligned) */}
            <div className="flex items-center gap-2 min-w-[160px]">
              <span className="text-sm text-[#8b8b8b] font-medium text-left">Section</span>
              <Dropdown
                multiSelect
                options={SECTION_LABELS.slice(1).map(s => ({ label: s, value: s }))}
                selectedValues={props.selectedSections}
                onSelect={(_value: string, values?: string[]) => props.setSelectedSections(values || [])}
                className="border-none text-[#222] font-semibold shadow-none px-4 h-10 w-full"
                label=""
              />
            </div>
            {props.testType === "Weekly" && props.weekOptions && props.setWeek && (
              <div className="flex items-center gap-2 min-w-[160px]">
                <span className="text-sm text-[#8b8b8b] font-medium text-left">Week</span>
                <Dropdown label="" selectedValue={props.week || ""} options={props.weekOptions} onSelect={props.setWeek} className="border-none text-[#222] font-semibold shadow-none px-4 h-10 w-full" />
              </div>
            )}
            {props.testType === "Weekly" && props.subjectOptions && props.setSubject && (
              <div className="flex items-center gap-2 min-w-[160px]">
                <span className="text-sm text-[#8b8b8b] font-medium text-left">Subject</span>
                <Dropdown label="" selectedValue={props.subject || ""} options={props.subjectOptions} onSelect={props.setSubject} className="border-none text-[#222] font-semibold shadow-none px-4 h-10 w-full" />
              </div>
            )}
            {props.testType === "Cumulative" && props.batchOptions && props.setBatch && (
              <div className="flex items-center gap-2 min-w-[160px]">
                <span className="text-sm text-[#8b8b8b] font-medium text-left">Batch</span>
                <Dropdown label="" selectedValue={props.batch || ""} options={props.batchOptions} onSelect={props.setBatch} className="border-none text-[#222] font-semibold shadow-none px-4 h-10 w-full" />
              </div>
            )}
            {props.testType === "Cumulative" && props.subjectPairOptions && props.setSubjectPair && (
              <div className="flex items-center gap-2 min-w-[160px]">
                <span className="text-sm text-[#8b8b8b] font-medium text-left">Subject Pair</span>
                <Dropdown label="" selectedValue={props.subjectPair || ""} options={props.subjectPairOptions} onSelect={props.setSubjectPair} className="border-none text-[#222] font-semibold shadow-none px-4 h-10 w-full" />
              </div>
            )}
            {props.testType === "Grand Test" && props.grandTestOptions && props.setGrandTestName && (
              <div className="flex items-center gap-2 min-w-[160px]">
                <span className="text-sm text-[#8b8b8b] font-medium text-left">Grand Test Name</span>
                <Dropdown label="" selectedValue={props.grandTestName || ""} options={props.grandTestOptions} onSelect={props.setGrandTestName} className="border-none text-[#222] font-semibold shadow-none px-4 h-10 w-full" />
              </div>
            )}
          </div>
        </div>
        {/* Divider line below filter bar */}
        <div className="w-full h-[1.5px] bg-[#ededed] mt-6 mb-2 rounded" />
      </div>
    </>
  );
};

export default IQFilterBar;
