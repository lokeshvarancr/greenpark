import React from "react";
import { useFilter } from "@/lib/DashboardFilterContext";
import { format } from "date-fns";

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

  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 w-full transition-all duration-300">
      {/* Date Range */}
      <div className="flex flex-col">
        <label className="text-xs text-slate-500 font-semibold mb-1">From</label>
        <input
          type="date"
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 min-h-[40px]"
          value={format(filter.dateRange.from, "yyyy-MM-dd")}
          onChange={e => update("dateRange")({ ...filter.dateRange, from: new Date(e.target.value) })}
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-slate-500 font-semibold mb-1">To</label>
        <input
          type="date"
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 min-h-[40px]"
          value={format(filter.dateRange.to, "yyyy-MM-dd")}
          onChange={e => update("dateRange")({ ...filter.dateRange, to: new Date(e.target.value) })}
        />
      </div>
      {/* Institution */}
      <div className="flex flex-col min-w-[120px]">
        <label className="text-xs text-slate-500 font-semibold mb-1">Institution</label>
        <select className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 min-h-[40px]" value={filter.institution} onChange={e => update("institution")(e.target.value)}>
          <option value="All">All</option>
          {institutions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      {/* Batch */}
      <div className="flex flex-col min-w-[120px]">
        <label className="text-xs text-slate-500 font-semibold mb-1">Batch</label>
        <select className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 min-h-[40px]" value={filter.batch} onChange={e => update("batch")(e.target.value)}>
          <option value="All">All</option>
          {batches.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      {/* Class */}
      <div className="flex flex-col min-w-[120px]">
        <label className="text-xs text-slate-500 font-semibold mb-1">Class</label>
        <select className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 min-h-[40px]" value={filter.class} onChange={e => update("class")(e.target.value)}>
          <option value="All">All</option>
          {classes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      {/* Exam Type */}
      <div className="flex flex-col min-w-[140px]">
        <label className="text-xs text-slate-500 font-semibold mb-1">Exam Type</label>
        <select className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 min-h-[40px]" value={filter.examType} onChange={e => update("examType")(e.target.value)}>
          <option value="Weekly">Weekly</option>
          <option value="Cumulative">Cumulative</option>
          <option value="Grand Test">Grand Test</option>
        </select>
      </div>
      {/* Subject (conditional) */}
      {showSubject && (
        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs text-slate-500 font-semibold mb-1">Subject</label>
          <select className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 min-h-[40px]" value={filter.subject} onChange={e => update("subject")(e.target.value)}>
            {subjectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
