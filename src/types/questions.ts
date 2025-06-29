// Types for question-level analytics API
// reqest and response structures

export interface QuestionFilterRequest {
  testType: 'weekly' | 'cumulative' | 'grandtest';
  month: string;
  week?: string; // weekly only
  batch?: string; // cumulative only
  subject?: 'physics' | 'chemistry' | 'botany' | 'zoology'; // weekly
  subjectPair?: 'physics+botany' | 'chemistry+zoology'; // cumulative
  grandTestName?: string; // grand test only
  section: string;
}

interface AccuracyBand {
  band: string;
  count: number;
}

interface Metrics {
  fullTimeCoverage: number;
  fullAttemptCoverage: number;
  aggregateAccuracy: number;
  accuracyDistribution: AccuracyBand[];
  engagementConsistency: number;
  improvementOpportunities: number;
  avgIncorrectPerQuestion: number;
}

interface OptionAttempts {
  A: number;
  B: number;
  C: number;
  D: number;
}

interface ModalData {
  questionText: string;
  subject: string;
  totalAttempts: number;
  optionAttempts: OptionAttempts;
  correctPercentage: number;
  incorrectPercentage: number;
  mostCommonIncorrectPercentage: number;
  optionDistribution: OptionAttempts;
}

interface Question {
  questionId: string;
  subject: string;
  totalCount: number;
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  viewable: boolean;
  modal: ModalData;
}

interface QuestionsData {
  metrics: Metrics;
  questions: Question[];
}

export type {
  AccuracyBand,
  Metrics,
  OptionAttempts,
  ModalData,
  Question,
  QuestionsData,
  QuestionsRequest
};


