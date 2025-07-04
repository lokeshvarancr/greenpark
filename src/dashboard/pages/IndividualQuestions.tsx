import React, { useState } from "react";
import { Eye } from "lucide-react";
import type { QuestionFilterRequest } from "../../types/questions";
import IQFilterBar from "../../components/IQFilterBar";
import InsightSummaryCards from "../../components/InsightSummaryCards";
import DataTable from "../components/tables/DataTable";
import QuestionViewModal from "../../components/QuestionViewModal";
import type { TableRow } from "@/DummyData/TableRow";
import {
  MONTHS as monthOptions,
  BATCHES as batchOptions,
  CUMULATIVE_PAIRS as subjectPairOptions,
} from "@/DummyData/IndividualQuestionsData";
import { generateQuestionTableRows } from "@/DummyData/IndividualQuestionsData";
import PageContainer from "@/components/layout/PageContainer";

const grandTestOptions = [
  { label: "Grand Test 1", value: "GT1" },
  { label: "Grand Test 2", value: "GT2" },
];

// Convert batchOptions and subjectPairOptions to correct format for filter bar
const batchOptionsObj = batchOptions.map(b => ({ label: b, value: b }));
const subjectPairOptionsObj = subjectPairOptions.map(p => ({ label: p, value: p.replace(/\s+/g, '').toLowerCase() }));
const subjectOptions = [
  { label: "Physics", value: "physics" },
  { label: "Chemistry", value: "chemistry" },
  { label: "Botany", value: "botany" },
  { label: "Zoology", value: "zoology" },
];

// SECTION_OPTIONS for section selection
const SECTION_OPTIONS = ["Select All", "11A", "11B", "12A", "12B"];

// --- Section/Student logic ---
// All logic moved to DummyData/IndividualQuestionsData.ts

// --- Question count logic ---

// --- Table row generator ---

// --- Summary card metrics generator ---
function getSummaryMetrics(tableRows: ReturnType<typeof generateQuestionTableRows>) {
  const totalQuestions = tableRows.length;
  const totalStudents = tableRows[0]?.totalCount || 0;
  const fullAttemptRows = tableRows.filter(q => q.attempts === totalStudents).length;
  const fullAttemptCoverage = totalQuestions ? Number(((fullAttemptRows / totalQuestions) * 100).toFixed(2)) : 0;
  const aggregateAccuracy = totalQuestions
    ? Number((tableRows.reduce((a, b) => a + b.accuracy, 0) / totalQuestions).toFixed(2))
    : 0;
  const multipleAttemptAccuracy = totalQuestions
    ? Number((tableRows.filter(q => q.attempts > 1).reduce((a, b) => a + b.accuracy, 0) / (tableRows.filter(q => q.attempts > 1).length || 1)).toFixed(2))
    : 0;
  const high = tableRows.filter(q => q.accuracy >= 80).length;
  const medium = tableRows.filter(q => q.accuracy >= 50 && q.accuracy < 80).length;
  const low = tableRows.filter(q => q.accuracy < 50).length;
  const totalAttempts = tableRows.reduce((a, b) => a + b.attempts, 0);
  const avgIncorrect = totalQuestions ? Number((tableRows.reduce((a, b) => a + b.incorrect, 0) / totalQuestions).toFixed(2)) : 0;
  return {
    fullAttemptCoverage,
    aggregateAccuracy,
    multipleAttemptAccuracy,
    accuracyDistribution: [
      { band: "High", count: high },
      { band: "Medium", count: medium },
      { band: "Low", count: low },
    ],
    engagementConsistency: totalQuestions ? Number((totalAttempts / totalQuestions).toFixed(2)) : 0,
    improvementOpportunities: low,
    avgIncorrectPerQuestion: avgIncorrect,
    totalQuestions,
    totalStudents,
    fullTimeCoverage: 100, // Add this property for InsightSummaryCards
  };
}

// --- Weeks for Month utility ---
function getWeeksForMonth(_monthValue: string) {
  // Example: monthValue = "2025-6"
  // For demo, always return 4 weeks
  return [
    { label: "Week 1", value: "week1" },
    { label: "Week 2", value: "week2" },
    { label: "Week 3", value: "week3" },
    { label: "Week 4", value: "week4" },
  ];
}

const IndividualQuestions: React.FC = () => {
  // Initial state: Weekly, Physics, Select All
  const [filter, setFilter] = useState<QuestionFilterRequest>({
    testType: "weekly",
    month: monthOptions[0].value,
    section: "Select All",
    subject: "physics",
    subjectPair: subjectPairOptionsObj[0].value as "physics+botany" | "chemistry+zoology" | undefined,
  });
  const [viewModalRow, setViewModalRow] = useState<TableRow | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([...SECTION_OPTIONS]);

  // Dynamic table data
  const tableRows = generateQuestionTableRows({
    testType: filter.testType === "weekly" ? "Weekly" : filter.testType === "cumulative" ? "Cumulative" : "Grand Test",
    subject: filter.subject ? filter.subject.charAt(0).toUpperCase() + filter.subject.slice(1) : "Physics",
    section: selectedSections,
    subjectPair: filter.subjectPair,
  }).map((row, idx) => ({ ...row, totalCount: selectedSections.length ? selectedSections.length * 50 : 200, number: row.number ?? idx + 1 }));
  const metrics = getSummaryMetrics(tableRows);

  // Convert metrics.accuracyDistribution to expected object shape for InsightSummaryCards
  const accuracyBands = metrics.accuracyDistribution.reduce((acc, cur) => {
    acc[cur.band as "High" | "Medium" | "Low"] = cur.count;
    return acc;
  }, { High: 0, Medium: 0, Low: 0 });

  // Filter change handlers
  const handleTestType = (v: string) => {
    setFilter(f => {
      let testType: QuestionFilterRequest["testType"] =
        v === "Weekly" ? "weekly" : v === "Cumulative" ? "cumulative" : "grandtest";
      let newFilter: QuestionFilterRequest = { ...f, testType };
      if (testType === "weekly") {
        newFilter = { testType, month: monthOptions[0].value, section: SECTION_OPTIONS[0] };
      } else if (testType === "cumulative") {
        newFilter = { testType, month: monthOptions[0].value, batch: batchOptionsObj[0].value, subjectPair: subjectPairOptionsObj[0].value as "physics+botany" | "chemistry+zoology", section: SECTION_OPTIONS[0] };
      } else if (testType === "grandtest") {
        newFilter = { testType, month: monthOptions[0].value, grandTestName: grandTestOptions[0].value, section: SECTION_OPTIONS[0] };
      }
      return newFilter;
    });
  };
  const handleMonth = (v: string) => {
    setFilter(f => ({ ...f, month: v, ...(f.testType === "weekly" ? { week: getWeeksForMonth(v)[0]?.value } : {}) }));
  };
  const handleWeek = (v: string) => setFilter(f => ({ ...f, week: v }));
  const handleBatch = (v: string) => setFilter(f => ({ ...f, batch: v }));
  const handleSubject = (v: string) => setFilter(f => ({ ...f, subject: v as QuestionFilterRequest["subject"] }));
  const handleSubjectPair = (v: string) => setFilter(f => ({ ...f, subjectPair: v as QuestionFilterRequest["subjectPair"] }));
  const handleGrandTestName = (v: string) => setFilter(f => ({ ...f, grandTestName: v }));

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 w-full">
        {/* Top Bar Filters */}
        <IQFilterBar
          testType={filter.testType === "weekly" ? "Weekly" : filter.testType === "cumulative" ? "Cumulative" : "Grand Test"}
          setTestType={handleTestType}
          month={filter.month}
          setMonth={handleMonth}
          week={filter.week}
          setWeek={filter.testType === "weekly" ? handleWeek : undefined}
          weekOptions={filter.testType === "weekly" ? getWeeksForMonth(filter.month) : undefined}
          batch={filter.batch}
          setBatch={filter.testType === "cumulative" ? handleBatch : undefined}
          batchOptions={filter.testType === "cumulative" ? batchOptionsObj : undefined}
          subject={filter.subject}
          setSubject={filter.testType === "weekly" ? handleSubject : undefined}
          subjectOptions={filter.testType === "weekly" ? subjectOptions : undefined}
          subjectPair={filter.subjectPair}
          setSubjectPair={filter.testType === "cumulative" ? handleSubjectPair : undefined}
          subjectPairOptions={filter.testType === "cumulative" ? subjectPairOptionsObj : undefined}
          grandTestName={filter.grandTestName}
          setGrandTestName={filter.testType === "grandtest" ? handleGrandTestName : undefined}
          grandTestOptions={filter.testType === "grandtest" ? grandTestOptions : undefined}
          sectionOptions={SECTION_OPTIONS}
          selectedSections={selectedSections}
          setSelectedSections={setSelectedSections}
        />
        {/* Insight Summary Cards Row */}
        <div className="w-full">
          <InsightSummaryCards {...metrics} accuracyDistribution={accuracyBands} />
        </div>
        {/* Per-Question Analysis Section */}
        <div className="w-full">
          <DataTable
            rows={tableRows}
            columns={[
              { field: 'number', label: 'Q#', align: 'center' },
              { field: 'subject', label: 'Subject', align: 'center' },
              { field: 'totalCount', label: 'Total Count', align: 'center' },
              { field: 'attempts', label: 'Attempts', align: 'center' },
              { field: 'correct', label: 'Correct', align: 'center' },
              { field: 'incorrect', label: 'Incorrect', align: 'center' },
              { field: 'accuracy', label: 'Accuracy', align: 'center' },
              { field: 'view', label: 'View', align: 'center' },
            ]}
            renderCell={(row, col) => {
              if (col.field === 'view') {
                return (
                  <button
                    className="inline-flex items-center justify-center rounded-full p-1 hover:bg-blue-100 transition"
                    title="View details"
                    onClick={() => setViewModalRow(row)}
                  >
                    <Eye className="w-5 h-5 text-blue-600 hover:scale-110 transition-transform" />
                  </button>
                );
              }
              if (col.field === 'accuracy' && typeof row.accuracy === 'number') {
                return row.accuracy + '%';
              }
              return row[col.field] ?? '';
            }}
          />
        </div>
        <QuestionViewModal
          open={!!viewModalRow}
          onClose={() => setViewModalRow(null)}
          question={viewModalRow}
          modalClassName="max-w-2xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto p-6 shadow-2xl rounded-2xl bg-white"
        />
      </div>
    </PageContainer>
  );
};

export default IndividualQuestions;
