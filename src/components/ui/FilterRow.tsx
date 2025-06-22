import React from "react";

type FilterRowProps = {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (val: string) => void;
  onDateToChange: (val: string) => void;
  institution: string;
  onInstitutionChange: (val: string) => void;
  institutions: string[];
  batch: string;
  onBatchChange: (val: string) => void;
  batches: string[];
  clazz: string;
  onClassChange: (val: string) => void;
  classes: string[];
  subject: string;
  onSubjectChange: (val: string) => void;
  subjects: string[];
};

const FilterRow: React.FC<FilterRowProps> = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  institution,
  onInstitutionChange,
  institutions,
  batch,
  onBatchChange,
  batches,
  clazz,
  onClassChange,
  classes,
  subject,
  onSubjectChange,
  subjects,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
    {/* Date Range (spans 2 columns on desktop) */}
    <div className="bg-white p-3 rounded-xl shadow-sm h-full flex flex-col justify-between md:col-span-2">
      <label className="text-sm font-semibold text-blue-800 mb-1">Date Range</label>
      <div className="flex items-center gap-2">
        <input
          type="date"
          className="w-full px-2 py-1.5 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={dateFrom}
          max={dateTo}
          onChange={e => onDateFromChange(e.target.value)}
        />
        <span className="text-blue-500 font-semibold">to</span>
        <input
          type="date"
          className="w-full px-2 py-1.5 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={dateTo}
          min={dateFrom}
          onChange={e => onDateToChange(e.target.value)}
        />
      </div>
    </div>
    {/* Institution */}
    <div className="bg-white p-3 rounded-xl shadow-sm h-full flex flex-col justify-between">
      <label className="text-sm font-semibold text-blue-800 mb-1">Institution</label>
      <select
        className="w-full px-2 py-1.5 border rounded-md shadow-sm text-sm"
        value={institution}
        onChange={e => onInstitutionChange(e.target.value)}
      >
        <option value="">All Institutions</option>
        {institutions.map((inst) => (
          <option key={inst} value={inst}>{inst}</option>
        ))}
      </select>
    </div>
    {/* Batch */}
    <div className="bg-white p-3 rounded-xl shadow-sm h-full flex flex-col justify-between">
      <label className="text-sm font-semibold text-blue-800 mb-1">Batch</label>
      <select
        className="w-full px-2 py-1.5 border rounded-md shadow-sm text-sm"
        value={batch}
        onChange={e => onBatchChange(e.target.value)}
      >
        <option value="">All Batches</option>
        {batches.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
    </div>
    {/* Class */}
    <div className="bg-white p-3 rounded-xl shadow-sm h-full flex flex-col justify-between">
      <label className="text-sm font-semibold text-blue-800 mb-1">Class</label>
      <select
        className="w-full px-2 py-1.5 border rounded-md shadow-sm text-sm"
        value={clazz}
        onChange={e => onClassChange(e.target.value)}
      >
        <option value="">All Classes</option>
        {classes.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
    {/* Subject */}
    <div className="bg-white p-3 rounded-xl shadow-sm h-full flex flex-col justify-between">
      <label className="text-sm font-semibold text-blue-800 mb-1">Subject</label>
      <select
        className="w-full px-2 py-1.5 border rounded-md shadow-sm text-sm"
        value={subject}
        onChange={e => onSubjectChange(e.target.value)}
      >
        <option value="">All Subjects</option>
        {subjects.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  </div>
);

export default FilterRow;
