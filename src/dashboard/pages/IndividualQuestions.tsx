import React, { useState } from "react";
import { Eye } from "lucide-react";
import type { QuestionFilterRequest } from "../../types/questions";
import IQFilterBar from "../../components/IQFilterBar";
import InsightSummaryCards from "../../components/InsightSummaryCards";
import QuestionViewModal from "../../components/QuestionViewModal";

const monthOptions = Array.from({ length: 12 }, (_, i) => {
  const date = new Date(2025, 5 + i, 1);
  return { label: date.toLocaleString("default", { month: "long", year: "numeric" }), value: `${date.getFullYear()}-${date.getMonth() + 1}` };
});
const subjectOptions = [
  { label: "Physics", value: "physics" },
  { label: "Chemistry", value: "chemistry" },
  { label: "Botany", value: "botany" },
  { label: "Zoology", value: "zoology" },
];
const subjectPairOptions = [
  { label: "Physics+Botany", value: "physics+botany" },
  { label: "Chemistry+Zoology", value: "chemistry+zoology" },
];
const grandTestOptions = [
  { label: "Grand Test 1", value: "GT1" },
  { label: "Grand Test 2", value: "GT2" },
];
const batchOptions = [
  { label: "Batch A", value: "A" },
  { label: "Batch B", value: "B" },
];

// --- Section/Student logic ---
const SECTION_OPTIONS = ["11A", "11B", "11C", "11D"];

function getTotalStudentCount(sections: string[]) {
  if (!sections || sections.length === 0 || sections.includes("Select All")) return 200;
  return sections.length * 50;
}

// --- Question count logic ---
function getQuestionRowsByTestType(testType: string, subject: string, subjectPair?: string) {
  if (testType === "Weekly") {
    const counts: Record<string, number> = { Physics: 30, Chemistry: 45, Botany: 60, Zoology: 60 };
    return Array.from({ length: counts[subject] || 0 }, (_, i) => ({
      subject,
      questionNumber: i + 1,
    }));
  }
  if (testType === "Cumulative") {
    if (subjectPair === "Physics+Botany") {
      return [
        ...Array.from({ length: 50 }, (_, i) => ({ subject: "Physics", questionNumber: i + 1 })),
        ...Array.from({ length: 50 }, (_, i) => ({ subject: "Botany", questionNumber: 50 + i + 1 })),
      ];
    } else {
      return [
        ...Array.from({ length: 50 }, (_, i) => ({ subject: "Chemistry", questionNumber: i + 1 })),
        ...Array.from({ length: 50 }, (_, i) => ({ subject: "Zoology", questionNumber: 50 + i + 1 })),
      ];
    }
  }
  if (testType === "Grand Test") {
    let rows: { subject: string; questionNumber: number }[] = [];
    let n = 1;
    for (const subject of ["Physics", "Chemistry", "Botany", "Zoology"]) {
      for (let i = 0; i < 45; i++) {
        rows.push({ subject, questionNumber: n++ });
      }
    }
    return rows;
  }
  return [];
}

// --- Table row generator ---
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function weightedView(tries: number) {
  if (tries > 0.9) return randInt(4, 5);
  if (tries > 0.7) return randInt(2, 5);
  if (tries > 0.5) return randInt(1, 4);
  return randInt(0, 2);
}
function generateModalData(row: any): import("../../types/questions").ModalData {
  // Generate plausible modal data for demo (all fields required by QuestionViewModal)
  const totalAttempts = row.attempts;
  const correct = row.correct;
  const incorrect = row.incorrect;
  const optionAttempts = {
    A: Math.floor(correct * 0.7 + incorrect * 0.2),
    B: Math.floor(correct * 0.1 + incorrect * 0.3),
    C: Math.floor(correct * 0.1 + incorrect * 0.3),
    D: Math.max(0, totalAttempts - (Math.floor(correct * 0.7 + incorrect * 0.2) + Math.floor(correct * 0.1 + incorrect * 0.3) + Math.floor(correct * 0.1 + incorrect * 0.3)))
  };
  return {
    questionText: `Sample question text for Q${row.questionNumber}`,
    subject: row.subject,
    totalAttempts,
    optionAttempts,
    correctPercentage: totalAttempts ? Number(((correct / totalAttempts) * 100).toFixed(2)) : 0,
    incorrectPercentage: totalAttempts ? Number(((incorrect / totalAttempts) * 100).toFixed(2)) : 0,
    mostCommonIncorrectPercentage: 0, // Not used in modal UI
    optionDistribution: optionAttempts
  };
}
function generateQuestionTableRows({
  testType,
  subject,
  section,
  subjectPair,
}: {
  testType: string;
  subject: string;
  section: string[];
  subjectPair?: string;
}): any[] {
  const rows = getQuestionRowsByTestType(testType, subject, subjectPair);
  const totalCount = getTotalStudentCount(section);
  return rows.map((row, i) => {
    const attempts = randInt(Math.floor(totalCount * 0.6), totalCount);
    const correct = randInt(0, attempts);
    const incorrect = attempts - correct;
    const accuracy = attempts === 0 ? 0 : Number(((correct / attempts) * 100).toFixed(2));
    const triesRatio = attempts / (totalCount || 1);
    const view = weightedView(triesRatio);
    return {
      id: i + 1,
      number: i + 1,
      subject: row.subject,
      totalCount,
      attempts,
      correct,
      incorrect,
      accuracy,
      view,
      viewable: true,
      modal: generateModalData({
        questionNumber: i + 1,
        subject: row.subject,
        attempts,
        correct,
        incorrect
      })
    };
  });
}

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
    subjectPair: subjectPairOptions[0].value as "physics+botany" | "chemistry+zoology" | undefined,
  });
  const [viewModalRow, setViewModalRow] = useState(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([...SECTION_OPTIONS]);

  // Dynamic table data
  const tableRows = generateQuestionTableRows({
    testType: filter.testType === "weekly" ? "Weekly" : filter.testType === "cumulative" ? "Cumulative" : "Grand Test",
    subject: filter.subject ? filter.subject.charAt(0).toUpperCase() + filter.subject.slice(1) : "Physics",
    section: selectedSections,
    subjectPair: filter.subjectPair,
  });
  const metrics = getSummaryMetrics(tableRows);

  // Filter change handlers
  const handleTestType = (v: string) => {
    setFilter(f => {
      let testType: QuestionFilterRequest["testType"] =
        v === "Weekly" ? "weekly" : v === "Cumulative" ? "cumulative" : "grandtest";
      let newFilter: QuestionFilterRequest = { ...f, testType };
      if (testType === "weekly") {
        newFilter = { testType, month: monthOptions[0].value, section: SECTION_OPTIONS[0] };
      } else if (testType === "cumulative") {
        newFilter = { testType, month: monthOptions[0].value, batch: batchOptions[0].value, subjectPair: subjectPairOptions[0].value as "physics+botany" | "chemistry+zoology", section: SECTION_OPTIONS[0] };
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
    <div className="min-h-0 flex flex-col bg-gray-50">
      <div className="w-full mx-auto px-2 md:px-6 flex flex-col gap-4">
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
          batchOptions={filter.testType === "cumulative" ? batchOptions : undefined}
          subject={filter.subject}
          setSubject={filter.testType === "weekly" ? handleSubject : undefined}
          subjectOptions={filter.testType === "weekly" ? subjectOptions : undefined}
          subjectPair={filter.subjectPair}
          setSubjectPair={filter.testType === "cumulative" ? handleSubjectPair : undefined}
          subjectPairOptions={filter.testType === "cumulative" ? subjectPairOptions : undefined}
          grandTestName={filter.grandTestName}
          setGrandTestName={filter.testType === "grandtest" ? handleGrandTestName : undefined}
          grandTestOptions={filter.testType === "grandtest" ? grandTestOptions : undefined}
          sectionOptions={SECTION_OPTIONS}
          selectedSections={selectedSections}
          setSelectedSections={setSelectedSections}
        />
        {/* Insight Summary Cards Row */}
        <div className="w-full">
          <InsightSummaryCards metrics={metrics} />
        </div>
        {/* Per-Question Analysis Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex-1 flex flex-col min-w-0 w-full max-w-7xl mx-auto mt-2">
          <div className="w-full flex-1 flex flex-col">
            <div className="flex-1" style={{ maxHeight: 'unset' }}>
              <div className="relative w-full overflow-y-auto" style={{ maxHeight: '70vh' }}>
                <table className="w-full text-sm border-separate border-spacing-0">
                  <thead className="sticky top-0 z-20 bg-gradient-to-b from-gray-100 to-gray-50 shadow-sm">
                    <tr>
                      <th className="py-3 px-3 text-left font-semibold text-gray-700">Q#</th>
                      <th className="py-3 px-3 text-left font-semibold text-gray-700">Subject</th>
                      <th className="py-3 px-3 text-right font-semibold text-gray-700">Total Count</th>
                      <th className="py-3 px-3 text-right font-semibold text-gray-700">Attempts</th>
                      <th className="py-3 px-3 text-right font-semibold text-gray-700">Correct</th>
                      <th className="py-3 px-3 text-right font-semibold text-gray-700">Incorrect</th>
                      <th className="py-3 px-3 text-right font-semibold text-gray-700">Accuracy</th>
                      <th className="py-3 px-3 text-center font-semibold text-gray-700">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((q, idx) => (
                      <tr
                        key={q.id}
                        className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 border-b border-gray-100`}
                      >
                        <td className="py-3 px-3">{q.number}</td>
                        <td className="py-3 px-3">{q.subject}</td>
                        <td className="py-3 px-3 text-right">{q.totalCount}</td>
                        <td className="py-3 px-3 text-right">{q.attempts}</td>
                        <td className="py-3 px-3 text-right">{q.correct}</td>
                        <td className="py-3 px-3 text-right">{q.incorrect}</td>
                        <td className="py-3 px-3 text-right">{q.accuracy}%</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            className="inline-flex items-center justify-center rounded-full p-1 hover:bg-blue-100 transition"
                            title="View details"
                            onClick={() => setViewModalRow(q)}
                          >
                            <Eye className="w-5 h-5 text-blue-600 hover:scale-110 transition-transform" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <QuestionViewModal
          open={!!viewModalRow}
          onClose={() => setViewModalRow(null)}
          question={viewModalRow}
          modalClassName="max-w-2xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto p-6 shadow-2xl rounded-2xl bg-white"
        />
      </div>
    </div>
  );
};

export default IndividualQuestions;
