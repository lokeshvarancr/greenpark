// Mock API for Question-level Analytics
// Backend devs: Replace mock logic with real API integration
// Attach auth tokens here if needed
// Extend request payload if new filters added
//
// To plug in a real backend:
// 1. Replace the static import of questions-data.json with a fetch to your backend endpoint.
// 2. Use fetch or axios to call your backend API and return the response as QuestionsData.
// 3. Add error handling and authentication as needed.
// 4. Update the frontend to send any required filters as parameters.

import { QUESTIONS as DUMMY_QUESTIONS } from "../DummyData/IndividualQuestionsData";
import type { QuestionFilterRequest, QuestionsData, Question } from "../types/questions";

function getMetrics(filtered: Question[]): QuestionsData["metrics"] {
  // Calculate metrics for summary cards
  const total = filtered.length;
  const fullAttemptCoverage = total ? (filtered.filter(q => q.attempts > 0).length / total) * 100 : 0;
  const aggregateAccuracy = total ? filtered.reduce((sum, q) => sum + q.accuracy, 0) / total : 0;
  const accuracyDistribution = [
    { band: "High", count: filtered.filter(q => q.accuracy >= 75).length },
    { band: "Medium", count: filtered.filter(q => q.accuracy >= 50 && q.accuracy < 75).length },
    { band: "Low", count: filtered.filter(q => q.accuracy < 50).length },
  ];
  const engagementConsistency = 3.4;
  const improvementOpportunities = 3;
  const avgIncorrectPerQuestion = total ? filtered.reduce((sum, q) => sum + q.incorrect, 0) / total : 0;
  return {
    fullTimeCoverage: 100, // Dummy value for required field
    fullAttemptCoverage,
    aggregateAccuracy,
    accuracyDistribution,
    engagementConsistency,
    improvementOpportunities,
    avgIncorrectPerQuestion,
  };
}

function toFrontendQuestion(q: any): Question {
  // Map dummy data to frontend Question type
  return {
    questionId: `${q.subject.toUpperCase()}-${q.id}`,
    subject: q.subject,
    totalCount: q.attempts + q.correct + q.incorrect,
    attempts: q.attempts,
    correct: q.correct,
    incorrect: q.incorrect,
    accuracy: q.accuracy,
    viewable: true,
    modal: {
      questionText: q.text,
      subject: q.subject,
      totalAttempts: q.attempts,
      optionAttempts: {
        A: q.options[0]?.count || 0,
        B: q.options[1]?.count || 0,
        C: q.options[2]?.count || 0,
        D: q.options[3]?.count || 0,
      },
      correctPercentage: q.accuracy,
      incorrectPercentage: 100 - q.accuracy,
      mostCommonIncorrectPercentage: Math.max(q.options[0]?.count || 0, q.options[1]?.count || 0, q.options[2]?.count || 0, q.options[3]?.count || 0),
      optionDistribution: {
        A: q.options[0]?.count || 0,
        B: q.options[1]?.count || 0,
        C: q.options[2]?.count || 0,
        D: q.options[3]?.count || 0,
      },
    },
  };
}

export async function getQuestionsData(
  filters: QuestionFilterRequest
): Promise<QuestionsData> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  let filtered: any[] = DUMMY_QUESTIONS;
  // Weekly View
  if (filters.testType === "weekly") {
    filtered = filtered.filter(q =>
      (!filters.subject || q.subject.toLowerCase() === filters.subject) &&
      (!filters.section || q.class === filters.section)
    );
    // Subject limits
    const subjectLimits: Record<string, number> = {
      Physics: 30,
      Chemistry: 45,
      Botany: 60,
      Zoology: 60,
    };
    filtered = filtered
      .sort((a, b) => a.subject.localeCompare(b.subject) || a.id - b.id)
      .filter((q, _, arr) => {
        const count = arr.filter(x => x.subject === q.subject && x.id <= q.id).length;
        return count <= subjectLimits[q.subject];
      });
  }
  // Cumulative View
  else if (filters.testType === "cumulative") {
    // Only show questions from selected subject pair
    let pair = filters.subjectPair || "physics+botany";
    let [s1, s2] = pair.split("+").map(s => s.trim().toLowerCase());
    filtered = filtered.filter(q =>
      [s1, s2].includes(q.subject.toLowerCase()) &&
      (!filters.section || q.class === filters.section)
    );
    // Limit to 50 per subject
    filtered = [
      ...filtered.filter(q => q.subject.toLowerCase() === s1).slice(0, 50),
      ...filtered.filter(q => q.subject.toLowerCase() === s2).slice(0, 50),
    ];
  }
  // Grand Test View
  else if (filters.testType === "grandtest") {
    // 45 per subject
    filtered = [
      ...filtered.filter(q => q.subject.toLowerCase() === "physics").slice(0, 45),
      ...filtered.filter(q => q.subject.toLowerCase() === "chemistry").slice(0, 45),
      ...filtered.filter(q => q.subject.toLowerCase() === "botany").slice(0, 45),
      ...filtered.filter(q => q.subject.toLowerCase() === "zoology").slice(0, 45),
    ];
  }
  // Always sort by subject then id for consistency
  filtered = filtered.sort((a, b) => a.subject.localeCompare(b.subject) || a.id - b.id);
  // Map to frontend type
  const questions = filtered.map(toFrontendQuestion);
  return {
    metrics: getMetrics(filtered),
    questions,
  };
}
