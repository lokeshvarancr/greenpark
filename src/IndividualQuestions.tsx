import React, { useState, useMemo } from "react";
import { Eye, Download, FileText } from "lucide-react";
import {
  BATCHES,
  CUMULATIVE_PAIRS,
  MONTHS,
  getWeeksInMonth,
  QUESTIONS,
  TEST_TYPES
} from "@/DummyData/IndividualQuestionsData";
import type {
  Question,
  StudentResponse
} from "@/DummyData/IndividualQuestionsData";
import QuestionViewModal from "@/components/QuestionViewModal";
import FileSaver from "file-saver";
import IQFilterBar from "@/components/IQFilterBar";
import SectionsModal from "@/components/SectionsModal";
import AccuracyBadge from "@/components/AccuracyBadge";
import Tooltip from "@/components/ui/Tooltip"; // (Assume you have a Tooltip component, or use a simple one)
import InsightSummaryCards from "@/components/InsightSummaryCards";

// Define SECTION_OPTIONS before using it in state and props
const SECTION_OPTIONS = [
  ...Array.from({ length: 10 }, (_, i) => `11${String.fromCharCode(65 + i)}`),
  ...Array.from({ length: 10 }, (_, i) => `12${String.fromCharCode(65 + i)}`),
];

// --------------------
// Main Component
// --------------------
const IndividualQuestions: React.FC<{ studentResponses?: StudentResponse[] }> = ({ studentResponses = [] }) => {
  // Top bar filters
  const [testType, setTestType] = useState<string>(TEST_TYPES[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[0].value);
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState<string>("Physics"); // Default to Physics for Weekly
  const [selectedBatch, setSelectedBatch] = useState<string>(BATCHES[0]);
  const [selectedPair, setSelectedPair] = useState<string>(CUMULATIVE_PAIRS[0]);
  const [selectedGrandTest, setSelectedGrandTest] = useState<string>("Grand Test 1");
  const [viewModalQuestion, setViewModalQuestion] = useState<Question | null>(null);
  const [sectionsModalOpen, setSectionsModalOpen] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([...SECTION_OPTIONS]);

  // --- Weekly: Calculate weeks and subjects ---
  const selectedMonthObj = MONTHS.find(m => m.value === selectedMonth)!;
  const weeks = useMemo(() => getWeeksInMonth(selectedMonthObj.year, selectedMonthObj.month), [selectedMonthObj]);

  // --- Filtered questions logic ---
  const questionsToShow = useMemo(() => {
    let questions: Question[] = [];
    if (testType === "Weekly") {
      if (!selectedSubject) return [];
      let count = 0;
      if (selectedSubject === "Physics") count = 30;
      else if (selectedSubject === "Chemistry") count = 45;
      else if (selectedSubject === "Botany" || selectedSubject === "Zoology") count = 60;
      questions = QUESTIONS.filter(q => q.subject === selectedSubject).slice(0, count);
      // Always start numbering from 1
      questions = questions.map((q, i) => ({ ...q, number: i + 1 }));
    } else if (testType === "Cumulative") {
      const pair = selectedPair.split(" + ");
      let first = QUESTIONS.filter(q => q.subject === pair[0]).slice(0, 50).map((q, i) => ({ ...q, number: i + 1 }));
      let second = QUESTIONS.filter(q => q.subject === pair[1]).slice(0, 50).map((q, i) => ({ ...q, number: i + 51 }));
      questions = [...first, ...second];
    } else if (testType === "Grand Test") {
      // Physics: 1–30, Chemistry: 31–75, Botany: 76–135, Zoology: 136–180
      let idx = 1;
      let physics = QUESTIONS.filter(q => q.subject === "Physics").slice(0, 30).map((q, i) => ({ ...q, number: idx + i }));
      idx += 30;
      let chemistry = QUESTIONS.filter(q => q.subject === "Chemistry").slice(0, 45).map((q, i) => ({ ...q, number: idx + i }));
      idx += 45;
      let botany = QUESTIONS.filter(q => q.subject === "Botany").slice(0, 60).map((q, i) => ({ ...q, number: idx + i }));
      idx += 60;
      let zoology = QUESTIONS.filter(q => q.subject === "Zoology").slice(0, 45).map((q, i) => ({ ...q, number: idx + i }));
      questions = [...physics, ...chemistry, ...botany, ...zoology];
    }
    // Do NOT filter by section here; section affects only stats, not question count
    return questions;
  }, [testType, selectedSubject, selectedPair, selectedGrandTest, selectedWeekIdx, selectedMonth]);

  // --- Per-question stats based on selected sections ---
  // For demo, simulate per-question stats by section
  const getSectionStats = (q: Question) => {
    // Simulate: each section has 10-20 students per question
    const count = 15;
    // Simulate attempts/correct/incorrect as a function of count
    const attempts = Math.round(count * 0.95);
    const correct = Math.round(attempts * (q.accuracy / 100));
    const incorrect = attempts - correct;
    return { count, attempts, correct, incorrect, accuracy: q.accuracy };
  };

  // --- Export Handlers ---
  const handleExport = (type: "CSV" | "PDF") => {
    if (type === "CSV") {
      // Generate CSV from questionsToShow
      const headers = ["Q#","Subject","Total Count","Attempts","Correct","Incorrect","Accuracy"];
      const rows = questionsToShow.map(q => {
        const stats = getSectionStats(q);
        return [q.number, q.subject, stats.count, stats.attempts, stats.correct, stats.incorrect, stats.accuracy + "%"].join(",");
      });
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      FileSaver.saveAs(blob, "individual-questions.csv");
    } else if (type === "PDF") {
      // For demo: just export CSV as .pdf for now
      const headers = ["Q#","Subject","Total Count","Attempts","Correct","Incorrect","Accuracy"];
      const rows = questionsToShow.map(q => {
        const stats = getSectionStats(q);
        return [q.number, q.subject, stats.count, stats.attempts, stats.correct, stats.incorrect, stats.accuracy + "%"].join(",");
      });
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "application/pdf" });
      FileSaver.saveAs(blob, "individual-questions.pdf");
    }
  };

  // --- FilterBar Dropdown Options ---
  const weekOptions = weeks.map((w, i) => ({
    label: `Week ${i + 1} (${w[0].toLocaleDateString()} - ${w[w.length - 1].toLocaleDateString()})`,
    value: String(i),
  }));
  const subjectOptions = ["Physics", "Chemistry", "Botany", "Zoology"].map(s => ({ label: s, value: s }));
  const batchOptions = BATCHES.map(b => ({ label: b, value: b }));
  const subjectPair1Options = ["Physics", "Chemistry"].map(s => ({ label: s, value: s }));
  const subjectPair2Options = ["Botany", "Zoology"].map(s => ({ label: s, value: s }));
  const grandTestOptions = Array.from({ length: 4 }, (_, i) => ({ label: `Grand Test ${i + 1}`, value: `Grand Test ${i + 1}` }));

  // --- UI ---
  return (
    <div className="min-h-0 flex flex-col bg-gray-50">
      {/* Shared container for filter bar and table for perfect alignment */}
      <div className="w-full max-w-7xl mx-auto px-2 md:px-6 flex flex-col gap-4">
        {/* Top Bar Filters */}
        <div className="sticky top-0 z-30 bg-white shadow flex flex-wrap items-center justify-between gap-4 px-4 py-3 rounded-b-xl border-b min-w-0">
          <IQFilterBar
            testType={testType}
            setTestType={setTestType}
            month={selectedMonth}
            setMonth={setSelectedMonth}
            week={String(selectedWeekIdx)}
            setWeek={v => setSelectedWeekIdx(Number(v))}
            weekOptions={weekOptions}
            batch={selectedBatch}
            setBatch={setSelectedBatch}
            batchOptions={batchOptions}
            subject={selectedSubject}
            setSubject={setSelectedSubject}
            subjectOptions={subjectOptions}
            subjectPair1={selectedPair.split(" + ")[0]}
            setSubjectPair1={v => setSelectedPair(v + " + " + selectedPair.split(" + ")[1])}
            subjectPair2={selectedPair.split(" + ")[1]}
            setSubjectPair2={v => setSelectedPair(selectedPair.split(" + ")[0] + " + " + v)}
            subjectPair1Options={subjectPair1Options}
            subjectPair2Options={subjectPair2Options}
            grandTestName={selectedGrandTest}
            setGrandTestName={setSelectedGrandTest}
            grandTestOptions={grandTestOptions}
            onOpenSections={() => setSectionsModalOpen(true)}
          />
          {/* Download Buttons */}
          <div className="flex gap-2 ml-auto">
            <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow" onClick={() => handleExport("CSV")}> <Download className="w-4 h-4" /> CSV </button>
            <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition shadow" onClick={() => handleExport("PDF")}> <FileText className="w-4 h-4" /> PDF </button>
          </div>
        </div>
        <SectionsModal
          open={sectionsModalOpen}
          onClose={() => setSectionsModalOpen(false)}
          selectedSections={selectedSections}
          setSelectedSections={setSelectedSections}
          sectionOptions={SECTION_OPTIONS}
        />
        {/* Insight Summary Cards Row */}
        <InsightSummaryCards />
        {/* Per-Question Analysis Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex-1 flex flex-col min-w-0 w-full max-w-7xl mx-auto mt-2">
          <div className="w-full flex-1 flex flex-col">
            {/* Only this div should scroll */}
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
                    {questionsToShow.map((q, idx) => {
                      const stats = getSectionStats(q);
                      return (
                        <tr key={q.id} className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                          <td className="py-3 px-3">{q.number}</td>
                          <td className="py-3 px-3">{q.subject}</td>
                          <td className="py-3 px-3 text-center">{stats.count}</td>
                          <td className="py-3 px-3 text-center">{stats.attempts}</td>
                          <td className="py-3 px-3 text-center">{stats.correct}</td>
                          <td className="py-3 px-3 text-center">{stats.incorrect}</td>
                          <td className="py-3 px-3 text-center"><AccuracyBadge accuracy={stats.accuracy} /></td>
                          <td className="py-3 px-3 text-center">
                            <button className="text-blue-600 hover:underline flex items-center gap-1" onClick={() => setViewModalQuestion(q)}>
                              <Eye className="w-4 h-4" /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
        studentResponses={studentResponses}
        modalClassName="max-w-2xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto p-6 shadow-2xl rounded-2xl bg-white"
      />
    </div>
  );
};

export type { Question };
export default IndividualQuestions;
