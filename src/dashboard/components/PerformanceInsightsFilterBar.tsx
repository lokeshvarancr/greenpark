import React from "react";
import SelectDropdown from "@/dashboard/components/dropdowns/z_select";

interface PerformanceInsightsFilterBarProps {
  testType: string;
  setTestType: (v: string) => void;
  institutions: string[];
  setInstitutions: (v: string[]) => void;
  monthsState: string[];
  setMonthsState: (v: string[]) => void;
  weekOptions: string[];
  weeksState: string[];
  setWeeksState: (v: string[]) => void;
  cumulativeOptions: string[];
  cumulativesState: string[];
  setCumulativesState: (v: string[]) => void;
  sectionsState: string[];
  setSectionsState: (v: string[]) => void;
  TEST_TYPES: string[];
  INSTITUTIONS: string[];
  MONTHS: string[];
  SECTIONS: string[];
}

const PerformanceInsightsFilterBar: React.FC<PerformanceInsightsFilterBarProps> = (props) => {
  const {
    testType,
    setTestType,
    institutions,
    setInstitutions,
    monthsState,
    setMonthsState,
    weekOptions,
    weeksState,
    setWeeksState,
    cumulativeOptions,
    cumulativesState,
    setCumulativesState,
    sectionsState,
    setSectionsState,
    TEST_TYPES,
    INSTITUTIONS,
    MONTHS,
    SECTIONS,
  } = props;

  // Debug log all props and dropdown options/values
  React.useEffect(() => {
    console.log('PerformanceInsightsFilterBar props:', {
      testType,
      institutions,
      monthsState,
      weekOptions,
      weeksState,
      cumulativeOptions,
      cumulativesState,
      sectionsState,
      TEST_TYPES,
      INSTITUTIONS,
      MONTHS,
      SECTIONS,
    });
  }, [testType, institutions, monthsState, weekOptions, weeksState, cumulativeOptions, cumulativesState, sectionsState, TEST_TYPES, INSTITUTIONS, MONTHS, SECTIONS]);

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl px-2 py-6 mb-2">
      {/* Filter Icon */}
      <div className="flex items-center h-9 w-9 rounded-lg justify-center mr-2 flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#A0A4AB" viewBox="0 0 256 256"><path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z"></path></svg>
      </div>
      {/* Test Type Dropdown (single select) */}
      <div className="flex flex-col min-w-[160px] flex-shrink-0">
        <span className="text-xs mb-2 text-gray-600">Test Type</span>
        <SelectDropdown
          options={TEST_TYPES.map(type => ({ value: type, label: type }))}
          selectedValue={testType}
          onSelect={value => {
            console.log('TestType onSelect', value);
            if (typeof value === 'string') setTestType(value);
          }}
          className="w-full"
        />
      </div>
      {/* Institution */}
      <div className="flex flex-col min-w-[160px] flex-shrink-0">
        <span className="text-xs  mb-2 text-gray-600">Institution</span>
        <SelectDropdown
          options={INSTITUTIONS.map(i => ({ value: i, label: i }))}
          selectedValues={institutions}
          onSelect={values => {
            console.log('Institutions onSelect', values);
            if (Array.isArray(values)) setInstitutions(values.length === 0 ? [...INSTITUTIONS] : values);
          }}
          multiSelect
          className="w-full"
          label=""
        />
      </div>
      {/* Month */}
      <div className="flex flex-col min-w-[160px] flex-shrink-0">
        <span className="text-xs mb-2 text-gray-600">Month</span>
        <SelectDropdown
          options={MONTHS.map(m => ({ value: m, label: m }))}
          selectedValues={monthsState}
          onSelect={values => {
            console.log('Months onSelect', values);
            if (Array.isArray(values)) setMonthsState(values.length === 0 ? [...MONTHS] : values);
          }}
          multiSelect
          className="w-full"
          label=""
        />
      </div>
      {/* Weekly: Week */}
      {testType === "Weekly" && (
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs mb-2 text-gray-600">Week</span>
          <SelectDropdown
            options={weekOptions.map(w => ({ value: w, label: w }))}
            selectedValues={weeksState}
            onSelect={values => {
              console.log('Weeks onSelect', values, 'weekOptions', weekOptions);
              if (Array.isArray(values)) setWeeksState(values.length === 0 ? [...weekOptions] : values);
            }}
            multiSelect
            className="w-full"
            label=""
          />
        </div>
      )}
      {/* Cumulative: Cumulative */}
      {testType === "Cumulative" && (
        <div className="flex flex-col min-w-[160px] flex-shrink-0">
          <span className="text-xs mb-2 text-gray-600">Cumulative</span>
          <SelectDropdown
            options={cumulativeOptions.map(c => ({ value: c, label: c }))}
            selectedValues={cumulativesState}
            onSelect={values => {
              console.log('Cumulatives onSelect', values, 'cumulativeOptions', cumulativeOptions);
              if (Array.isArray(values)) setCumulativesState(values.length === 0 ? [...cumulativeOptions] : values);
            }}
            multiSelect
            className="w-full"
            label=""
          />
        </div>
      )}
      {/* Section */}
      <div className="flex flex-col min-w-[160px] flex-shrink-0">
        <span className="text-xs mb-2 text-gray-600">Section</span>
        <SelectDropdown
          options={SECTIONS.map(s => ({ value: s, label: s }))}
          selectedValues={sectionsState}
          onSelect={values => {
            console.log('Sections onSelect', values);
            if (Array.isArray(values)) setSectionsState(values.length === 0 ? [...SECTIONS] : values);
          }}
          multiSelect
          className="w-full"
          label=""
        />
      </div>
    </div>
  );
};

export default PerformanceInsightsFilterBar;
