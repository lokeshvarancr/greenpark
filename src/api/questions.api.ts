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

import type { QuestionsData } from "../types/questions";

// For Vite/ESM compatibility, use a static import for JSON
import questionsDataJson from "../dashboard/data/questions-data.json";

export async function getQuestionsData(
  filters: any // TODO: define a type for filters as per frontend spec
): Promise<QuestionsData> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Return static mock data
  return questionsDataJson as QuestionsData;
}
