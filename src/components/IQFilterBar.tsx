import React from "react";
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
  subjectPair1Options?: { label: string; value: string }[];
  subjectPair2Options?: { label: string; value: string }[];
  grandTestName?: string;
  setGrandTestName?: (v: string) => void;
  grandTestOptions?: { label: string; value: string }[];
  onOpenSections: () => void;
}

const IQFilterBar: React.FC<IQFilterBarProps> = (props) => {
  return (
    <div className="flex flex-row flex-nowrap gap-3 items-center w-auto md:w-auto">
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
      {props.testType === "Cumulative" && props.subjectPair1Options && props.setSubjectPair1 && props.subjectPair2Options && props.setSubjectPair2 && (
        <>
          <Dropdown label="Subject 1" value={props.subjectPair1 || ""} options={props.subjectPair1Options} onChange={props.setSubjectPair1} />
          <Dropdown label="Subject 2" value={props.subjectPair2 || ""} options={props.subjectPair2Options} onChange={props.setSubjectPair2} />
        </>
      )}
      {props.testType === "Grand Test" && props.grandTestOptions && props.setGrandTestName && (
        <Dropdown label="Grand Test Name" value={props.grandTestName || ""} options={props.grandTestOptions} onChange={props.setGrandTestName} />
      )}
      {/* Sections Button */}
      <div className="flex flex-col items-start">
        <label className="text-sm font-medium mb-1 ml-1">Section</label>
        <button
          type="button"
          className="appearance-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 flex justify-between items-center bg-white hover:bg-blue-50 transition shadow-sm min-w-[180px]"
          onClick={props.onOpenSections}
        >
          Sections
        </button>
      </div>
    </div>
  );
};

export default IQFilterBar;
