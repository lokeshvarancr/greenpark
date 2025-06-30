import React, { useState, useRef } from "react";
import Dropdown from "./Dropdown";

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

const SECTION_LABELS = ["Select All", "11A", "11B", "11C", "11D"];

const IQFilterBar: React.FC<IQFilterBarProps> = (props) => {
  const allSections = SECTION_LABELS.slice(1);
  // --- Smart Section State Logic ---
  const allSelected = props.selectedSections.length === allSections.length;
  const isChecked = (section: string) =>
    section === "Select All"
      ? allSelected
      : props.selectedSections.includes(section);

  const handleSectionChange = (section: string) => {
    let next: string[] = [];
    if (section === "Select All") {
      // Toggle all
      next = allSelected ? [...allSections] : [...allSections];
    } else {
      if (props.selectedSections.includes(section)) {
        // Remove section
        next = props.selectedSections.filter(s => s !== section);
        // If user unchecks last section, auto-reselect all
        if (next.length === 0) {
          next = [...allSections];
        }
      } else {
        // Add section
        next = [...props.selectedSections, section];
      }
      // If all 4 are checked manually, Select All is checked
      if (next.length === allSections.length) {
        next = [...allSections];
      }
    }
    props.setSelectedSections(next);
  };

  // Dropdown open/close state for Section
  const [sectionOpen, setSectionOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(e.target as Node)) {
        setSectionOpen(false);
      }
    };
    if (sectionOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [sectionOpen]);

  return (
    <div className="flex flex-wrap gap-4 items-center w-full px-2 py-3 bg-white rounded-xl shadow-md border border-gray-200 mb-2" style={{marginTop: 8, marginBottom: 8}}>
      <div className="flex flex-wrap gap-4 items-center flex-1 min-w-0">
        <Dropdown
          label="Test Type"
          value={props.testType}
          options={["Weekly", "Cumulative", "Grand Test"].map(t => ({ label: t, value: t }))}
          onChange={props.setTestType}
        />
        <Dropdown
          label="Month"
          value={props.month}
          options={Array.from({ length: 12 }, (_, i) => {
            const date = new Date(2025, 5 + i, 1);
            return { label: date.toLocaleString("default", { month: "long", year: "numeric" }), value: `${date.getFullYear()}-${date.getMonth() + 1}` };
          })}
          onChange={props.setMonth}
        />
        {props.testType === "Weekly" && props.weekOptions && props.setWeek && (
          <Dropdown label="Week" value={props.week || ""} options={props.weekOptions} onChange={props.setWeek} />
        )}
        {props.testType === "Weekly" && props.subjectOptions && props.setSubject && (
          <Dropdown label="Subject" value={props.subject || ""} options={props.subjectOptions} onChange={props.setSubject} />
        )}
        {props.testType === "Cumulative" && props.batchOptions && props.setBatch && (
          <Dropdown label="Batch" value={props.batch || ""} options={props.batchOptions} onChange={props.setBatch} />
        )}
        {props.testType === "Cumulative" && props.subjectPairOptions && props.setSubjectPair && (
          <Dropdown label="Subject Pair" value={props.subjectPair || ""} options={props.subjectPairOptions} onChange={props.setSubjectPair} />
        )}
        {props.testType === "Grand Test" && props.grandTestOptions && props.setGrandTestName && (
          <Dropdown label="Grand Test Name" value={props.grandTestName || ""} options={props.grandTestOptions} onChange={props.setGrandTestName} />
        )}
      </div>
      {/* Section Multi-select Dropdown (right-aligned) */}
      <div className="relative min-w-[200px]" ref={sectionRef}>
        <label className="block text-xs font-semibold mb-1 text-gray-600">Section</label>
        <button
          type="button"
          className={`border rounded-lg px-3 py-2 bg-white shadow-sm hover:border-blue-400 transition w-full flex justify-between items-center ${sectionOpen ? 'ring-2 ring-blue-400' : ''}`}
          onClick={() => setSectionOpen(v => !v)}
        >
          <div className="flex flex-wrap gap-2 text-left">
            {props.selectedSections.length === 0
              ? <span className="text-gray-400">Select section(s)</span>
              : props.selectedSections.map(s => (
                <span key={s} className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-semibold">{s}</span>
              ))}
          </div>
          <svg className={`w-4 h-4 ml-2 transition-transform ${sectionOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {sectionOpen && (
          <div className="absolute z-30 bg-white border rounded-lg shadow-lg mt-1 w-full p-2 animate-fadeIn">
            {SECTION_LABELS.map(section => (
              <label key={section} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked(section)}
                  onChange={() => handleSectionChange(section)}
                  className="accent-blue-600 w-4 h-4 rounded"
                  readOnly
                />
                <span className="text-sm font-medium">{section}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IQFilterBar;
