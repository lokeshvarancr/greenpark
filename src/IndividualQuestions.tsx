import React, { useState, useEffect } from "react";
import { Eye, Download, FileText } from "lucide-react";
import { getQuestionsData } from "./api/questions.api";
import type { QuestionsData, Question, QuestionFilterRequest } from "./types/questions";
import QuestionViewModal from "./components/QuestionViewModal";
import FileSaver from "file-saver";
import IQFilterBar from "./components/IQFilterBar";
import SectionsModal from "./components/SectionsModal";
import AccuracyBadge from "./components/AccuracyBadge";
import Tooltip from "./components/ui/Tooltip";
import InsightSummaryCards from "./components/InsightSummaryCards";

const SECTION_OPTIONS = [
  ...Array.from({ length: 10 }, (_, i) => `11${String.fromCharCode(65 + i)}`),
  ...Array.from({ length: 10 }, (_, i) => `12${String.fromCharCode(65 + i)}`),
];

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

function getWeeksForMonth(month: string) {
  // month: "2025-6" (June 2025)
  const [year, m] = month.split("-").map(Number);
  const first = new Date(year, m - 1, 1);
  const last = new Date(year, m, 0);
  const weeks = [];
  let start = new Date(first);
  while (start <= last) {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    if (end > last) end.setDate(last.getDate());
    weeks.push({
      label: `${start.getDate()}.${start.getMonth() + 1}.${start.getFullYear()} - ${end.getDate()}.${end.getMonth() + 1}.${end.getFullYear()}`,
      value: `${start.getDate()}.${start.getMonth() + 1}`
    });
    start.setDate(start.getDate() + 7);
  }
  return weeks;
}

const IndividualQuestions: React.FC = () => {
  const [data, setData] = useState<QuestionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<QuestionFilterRequest>({
    testType: "weekly",
    month: monthOptions[0].value,
    section: SECTION_OPTIONS[0],
  });
  const [sectionsModalOpen, setSectionsModalOpen] = useState(false);
  const [viewModalQuestion, setViewModalQuestion] = useState<Question | null>(null);

  // Derived options
  const weekOptions = filter.testType === "weekly" ? getWeeksForMonth(filter.month) : [];

  useEffect(() => {
    setLoading(true);
    getQuestionsData(filter)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, [filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg text-gray-600">Loading...</span>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }
  if (!data) {
    return <div className="text-gray-600 text-center py-8">No data available.</div>;
  }

  // Table and metrics rendering
  const questionsToShow = data.questions;
  const metrics = data.metrics;

  // Export Handlers
  const handleExport = (type: "CSV" | "PDF") => {
    const headers = ["Q#","Subject","Total Count","Attempts","Correct","Incorrect","Accuracy"];
    const rows = questionsToShow.map((q, i) => {
      return [
        i + 1,
        q.subject,
        q.totalCount,
        q.attempts,
        q.correct,
        q.incorrect,
        q.accuracy + "%"
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: type === "CSV" ? "text/csv;charset=utf-8;" : "application/pdf" });
    FileSaver.saveAs(blob, `individual-questions.${type.toLowerCase()}`);
  };

  // Filter change handlers
  const handleTestType = (v: string) => {
    setFilter(f => {
      let testType: QuestionFilterRequest["testType"] =
        v === "Weekly" ? "weekly" : v === "Cumulative" ? "cumulative" : "grandtest";
      let newFilter: QuestionFilterRequest = { ...f, testType };
      if (testType === "weekly") {
        newFilter = { testType, month: monthOptions[0].value, section: SECTION_OPTIONS[0] };
      } else if (testType === "cumulative") {
        newFilter = { testType, month: monthOptions[0].value, batch: batchOptions[0].value, subjectPair: subjectPairOptions[0].value as QuestionFilterRequest["subjectPair"], section: SECTION_OPTIONS[0] };
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
  const handleSection = (sections: string[]) => setFilter(f => ({ ...f, section: sections[0] }));

  return (
    <div className="min-h-0 flex flex-col bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-2 md:px-6 flex flex-col gap-4">
        {/* Top Bar Filters */}
        <div className="sticky top-0 z-30 bg-white shadow flex flex-wrap items-center justify-between gap-4 px-4 py-3 rounded-b-xl border-b min-w-0">
          <IQFilterBar
            testType={filter.testType === "weekly" ? "Weekly" : filter.testType === "cumulative" ? "Cumulative" : "Grand Test"}
            setTestType={handleTestType}
            month={filter.month}
            setMonth={handleMonth}
            week={filter.week}
            setWeek={filter.testType === "weekly" ? handleWeek : undefined}
            weekOptions={filter.testType === "weekly" ? weekOptions : undefined}
            batch={filter.batch}
            setBatch={filter.testType === "cumulative" ? handleBatch : undefined}
            batchOptions={filter.testType === "cumulative" ? batchOptions : undefined}
            subject={filter.subject}
            setSubject={filter.testType === "weekly" ? handleSubject : undefined}
            subjectOptions={filter.testType === "weekly" ? subjectOptions : undefined}
            subjectPair1={filter.subjectPair?.split("+")[0]}
            setSubjectPair1={filter.testType === "cumulative" ? v => handleSubjectPair(v + "+" + (filter.subjectPair?.split("+")[1] || "botany")) : undefined}
            subjectPair2={filter.subjectPair?.split("+")[1]}
            setSubjectPair2={filter.testType === "cumulative" ? v => handleSubjectPair((filter.subjectPair?.split("+")[0] || "physics") + "+" + v) : undefined}
            subjectPair1Options={filter.testType === "cumulative" ? [{ label: "Physics", value: "physics" }, { label: "Chemistry", value: "chemistry" }] : undefined}
            subjectPair2Options={filter.testType === "cumulative" ? [{ label: "Botany", value: "botany" }, { label: "Zoology", value: "zoology" }] : undefined}
            grandTestName={filter.grandTestName}
            setGrandTestName={filter.testType === "grandtest" ? handleGrandTestName : undefined}
            grandTestOptions={filter.testType === "grandtest" ? grandTestOptions : undefined}
            onOpenSections={() => setSectionsModalOpen(true)}
          />
          <div className="flex gap-2 ml-auto">
            <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow" onClick={() => handleExport("CSV")}> <Download className="w-4 h-4" /> CSV </button>
            <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition shadow" onClick={() => handleExport("PDF")}> <FileText className="w-4 h-4" /> PDF </button>
          </div>
        </div>
        <SectionsModal
          open={sectionsModalOpen}
          onClose={() => setSectionsModalOpen(false)}
          selectedSections={[filter.section]}
          setSelectedSections={sections => handleSection(sections)}
          sectionOptions={SECTION_OPTIONS}
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
                <table className="w-full text-sm whitespace-nowrap border-separate border-spacing-0">
                  <thead className="sticky top-0 z-20 bg-gradient-to-b from-gray-100 to-gray-50 shadow-sm">
                    <tr>
                      <th className="py-3 px-3 text-left font-semibold text-gray-700 border-b border-gray-200">Q#</th>
                      <th className="py-3 px-3 text-left font-semibold text-gray-700 border-b border-gray-200">Subject</th>
                      <th className="py-3 px-3 text-center font-semibold text-gray-700 border-b border-gray-200">Total Count</th>
                      <th className="py-3 px-3 text-center font-semibold text-gray-700 border-b border-gray-200">Attempts</th>
                      <th className="py-3 px-3 text-center font-semibold text-gray-700 border-b border-gray-200">Correct</th>
                      <th className="py-3 px-3 text-center font-semibold text-gray-700 border-b border-gray-200">Incorrect</th>
                      <th className="py-3 px-3 text-center font-semibold text-gray-700 border-b border-gray-200">
                        <div className="flex items-center gap-1 justify-center">
                          Accuracy
                          <Tooltip content="% of students who answered correctly">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                          </Tooltip>
                        </div>
                      </th>
                      <th className="py-3 px-3 text-center font-semibold text-gray-700 border-b border-gray-200">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {questionsToShow.map((q, idx) => (
                      <tr key={q.questionId} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                        <td className="py-3 px-3">{idx + 1}</td>
                        <td className="py-3 px-3">{q.subject}</td>
                        <td className="py-3 px-3 text-center">{q.totalCount}</td>
                        <td className="py-3 px-3 text-center">{q.attempts}</td>
                        <td className="py-3 px-3 text-center">{q.correct}</td>
                        <td className="py-3 px-3 text-center">{q.incorrect}</td>
                        <td className="py-3 px-3 text-center"><AccuracyBadge accuracy={q.accuracy} /></td>
                        <td className="py-3 px-3 text-center">
                          <button className="text-blue-600 hover:underline flex items-center gap-1" onClick={() => setViewModalQuestion(q)}>
                            <Eye className="w-4 h-4" /> View
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
      </div>
      {/* View Modal */}
      <QuestionViewModal
        open={!!viewModalQuestion}
        onClose={() => setViewModalQuestion(null)}
        question={viewModalQuestion}
        modalClassName="max-w-2xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto p-6 shadow-2xl rounded-2xl bg-white"
      />
    </div>
  );
};

export default IndividualQuestions;
