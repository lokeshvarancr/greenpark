import { generateQuestionTableRows } from './IndividualQuestionsData';

// TableRow type for IndividualQuestions page
export type TableRow = ReturnType<typeof generateQuestionTableRows>[number];
