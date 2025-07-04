import React from "react";
import { Download, FileText } from "lucide-react";
import SelectDropdown from "@/dashboard/components/dropdowns/z_select";
import { TEST_TYPES, SECTION_OPTIONS, MONTHS } from "@/DummyData/PerformanceTabData";

interface PerformanceTabFilterBarProps {
  testType: string;
  setTestType: (v: string) => void;
  selectedMonth: string;
  setSelectedMonth: (v: string) => void;
  selectedTest1Idx: number;
  setSelectedTest1Idx: (v: number) => void;
  selectedTest2Idx: number;
  setSelectedTest2Idx: (v: number) => void;
  selectedGrandTest1: string;
  setSelectedGrandTest1: (v: string) => void;
  selectedGrandTest2: string;
  setSelectedGrandTest2: (v: string) => void;
  selectedSections: string[];
  setSelectedSections: (v: string[]) => void;
  setShowComparison: (v: boolean) => void;
  setCompareError: (v: string) => void;
  weekOptions: string[];
  cumulativeTestOptions: string[];
  grandTestNames: string[];
}

const PerformanceTabFilterBar: React.FC<PerformanceTabFilterBarProps> = ({
  testType,
  setTestType,
  selectedMonth,
  setSelectedMonth,
  selectedTest1Idx,
  setSelectedTest1Idx,
  selectedTest2Idx,
  setSelectedTest2Idx,
  selectedGrandTest1,
  setSelectedGrandTest1,
  selectedGrandTest2,
  setSelectedGrandTest2,
  selectedSections,
  setSelectedSections,
  setShowComparison,
  setCompareError,
  weekOptions,
  cumulativeTestOptions,
  grandTestNames,
}) => {
  return (
    <div className="flex flex-row items-center gap-3 w-full mt-6">
      {/* Filter Icon */}
      <div className="flex items-center h-11 w-9 bg-transparent rounded-lg justify-center mr-2 flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#A0A4AB" viewBox="0 0 256 256"><path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z"></path></svg>
      </div>
      {/* Dropdowns */}
      {/* Changed flex-wrap to flex-nowrap to keep everything on one line */}
      <div className="flex flex-nowrap items-center gap-4 flex-1 min-w-0">
        {/* Test Type Dropdown */}
        <div className="min-w-[140px] flex flex-col items-start flex-shrink-0">
          <SelectDropdown
            options={TEST_TYPES.map(type => ({ value: type, label: type }))}
            selectedValue={testType}
            onSelect={(selected) => {
              if (typeof selected === 'string') {
                setTestType(selected);
                setSelectedMonth(MONTHS[0].value);
                setSelectedTest1Idx(0);
                setSelectedTest2Idx(1);
                setSelectedGrandTest1("Grand Test 1");
                setSelectedGrandTest2("Grand Test 2");
                setShowComparison(false);
                setCompareError("");
              }
            }}
            label="Test Type"
            className="w-full"
          />
        </div>
        {/* --- Weekly --- */}
        {testType === "Weekly" && (
          <>
            {/* Month Dropdown */}
            <div className="min-w-[160px] flex flex-col items-start flex-shrink-0">
              <SelectDropdown
                options={MONTHS.map(m => ({ value: m.value, label: m.label }))}
                selectedValue={selectedMonth}
                onSelect={(selected) => { if (typeof selected === 'string') { setSelectedMonth(selected); setSelectedTest1Idx(0); setSelectedTest2Idx(1); setShowComparison(false); setCompareError(""); } }}
                label="Month"
                className="w-full"
              />
            </div>
            {/* Test 1 Dropdown */}
            <div className="min-w-[140px] flex flex-col items-start flex-shrink-0">
              <SelectDropdown
                options={weekOptions.map((label, i) => ({ value: String(i), label }))}
                selectedValue={String(selectedTest1Idx)}
                onSelect={(selected) => { if (typeof selected === 'string') { setSelectedTest1Idx(Number(selected)); setShowComparison(false); setCompareError(""); } }}
                label="Test 1"
                className="w-full"
              />
            </div>
            {/* Test 2 Dropdown */}
            <div className="min-w-[140px] flex flex-col items-start flex-shrink-0">
              <SelectDropdown
                options={weekOptions.map((label, i) => ({ value: String(i), label }))}
                selectedValue={String(selectedTest2Idx)}
                onSelect={(selected) => { if (typeof selected === 'string') { setSelectedTest2Idx(Number(selected)); setShowComparison(false); setCompareError(""); } }}
                label="Test 2"
                className="w-full"
              />
            </div>
          </>
        )}
        {/* --- Cumulative --- */}
        {testType === "Cumulative" && (
          <>
            {/* Month Dropdown */}
            <div className="min-w-[160px] flex flex-col items-start flex-shrink-0">
              <SelectDropdown
                options={MONTHS.map(m => ({ value: m.value, label: m.label }))}
                selectedValue={selectedMonth}
                onSelect={(selected) => { if (typeof selected === 'string') { setSelectedMonth(selected); setSelectedTest1Idx(0); setSelectedTest2Idx(1); setShowComparison(false); setCompareError(""); } }}
                label="Month"
                className="w-full"
              />
            </div>
            {/* Test 1 Dropdown */}
            <div className="min-w-[140px] flex flex-col items-start flex-shrink-0">
              <SelectDropdown
                options={cumulativeTestOptions.map((label, i) => ({ value: String(i), label }))}
                selectedValue={String(selectedTest1Idx)}
                onSelect={(selected) => { if (typeof selected === 'string') { setSelectedTest1Idx(Number(selected)); setShowComparison(false); setCompareError(""); } }}
                label="Test 1"
                className="w-full"
              />
            </div>
            {/* Test 2 Dropdown */}
            <div className="min-w-[140px] flex flex-col items-start flex-shrink-0">
              <SelectDropdown
                options={cumulativeTestOptions.map((label, i) => ({ value: String(i), label }))}
                selectedValue={String(selectedTest2Idx)}
                onSelect={(selected) => { if (typeof selected === 'string') { setSelectedTest2Idx(Number(selected)); setShowComparison(false); setCompareError(""); } }}
                label="Test 2"
                className="w-full"
              />
            </div>
          </>
        )}
        {/* --- Grand Test --- */}
        {testType === "Grand Test" && (
          <>
            {/* Test 1 Dropdown */}
            <div className="min-w-[180px] flex flex-col items-start flex-shrink-0">
              <SelectDropdown
                options={grandTestNames.map(name => ({ value: name, label: name }))}
                selectedValue={selectedGrandTest1}
                onSelect={(selected) => { if (typeof selected === 'string') { setSelectedGrandTest1(selected); setShowComparison(false); setCompareError(""); } }}
                label="Test 1"
                className="w-full"
              />
            </div>
            {/* Test 2 Dropdown */}
            <div className="min-w-[180px] flex flex-col items-start flex-shrink-0">
              <SelectDropdown
                options={grandTestNames.map(name => ({ value: name, label: name }))}
                selectedValue={selectedGrandTest2}
                onSelect={(selected) => { if (typeof selected === 'string') { setSelectedGrandTest2(selected); setShowComparison(false); setCompareError(""); } }}
                label="Test 2"
                className="w-full"
              />
            </div>
          </>
        )}
        {/* Section Dropdown (multi-select) - always shown */}
        <div className="min-w-[220px] flex flex-col items-start flex-shrink-0">
          <SelectDropdown
            options={SECTION_OPTIONS.map(section => ({ value: section, label: section }))}
            selectedValues={selectedSections}
            onSelect={(selected) => {
              if (Array.isArray(selected)) {
                setSelectedSections(selected.length === 0 ? [...SECTION_OPTIONS] : selected);
              }
            }}
            label="Section"
            multiSelect
            className="w-full"
          />
        </div>
      </div>
      {/* Export Buttons */}
      <div className="flex gap-2 items-center flex-shrink-0 ml-2">
        <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow" onClick={() => alert('Export as CSV (demo only)')}> <Download className="w-4 h-4" /> CSV </button>
        <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition shadow" onClick={() => alert('Export as PDF (demo only)')}> <FileText className="w-4 h-4" /> PDF </button>
      </div>
    </div>
  );
};

export default PerformanceTabFilterBar;