import React from "react";

import FilterRow from "./components/ui/FilterRow";


const ManagementDrillDown: React.FC = () => {
  // State for filters (default values)
  const [dateFrom, setDateFrom] = React.useState("2025-05-26");
  const [dateTo, setDateTo] = React.useState("2025-06-24");
  const [institution, setInstitution] = React.useState("");
  const [batch, setBatch] = React.useState("");
  const [clazz, setClazz] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [examType, setExamType] = React.useState("");

  // Example options (replace with real data as needed)
  const institutions = ["Institution A", "Institution B"];
  const batches = ["Batch 1", "Batch 2"];
  const classes = ["Class 11", "Class 12"];
  const subjects = ["Physics", "Chemistry", "Biology"];

  return (
    <div>
      <div className="mb-6">
        <FilterRow
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          institution={institution}
          onInstitutionChange={setInstitution}
          institutions={institutions}
          batch={batch}
          onBatchChange={setBatch}
          batches={batches}
          clazz={clazz}
          onClassChange={setClazz}
          classes={classes}
          subject={subject}
          onSubjectChange={setSubject}
          subjects={subjects}
          examType={examType}
          onExamTypeChange={setExamType}
        />
      </div>
    </div>
  );
};

export default ManagementDrillDown;