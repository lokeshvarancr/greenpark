// Dummy data for PerformanceInsights
// Structure matches expected backend API for performance insights

export const months = [
  "June 2025", "July 2025", "August 2025", "September 2025", "October 2025", "November 2025", "December 2025", "January 2026", "February 2026", "March 2026", "April 2026", "May 2026"
];
export const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
export const campuses = ["North Campus", "South Campus", "East Campus", "West Campus"];
export const sections = [
  ...Array.from({ length: 10 }, (_, i) => `11${String.fromCharCode(65 + i)}`),
  ...Array.from({ length: 10 }, (_, i) => `12${String.fromCharCode(65 + i)}`),
];
export const studentCounts = [5, 10, 30, 50];

export type TestType = "Weekly" | "Cumulative" | "Grant Test";

export const testTypeOptions: TestType[] = ["Weekly", "Cumulative", "Grant Test"];
export const testTypeToLabel: Record<TestType, string> = {
  Weekly: "Week Test",
  Cumulative: "Cumulative Test",
  "Grant Test": "Grant Test"
};
export const testTypeToTests: Record<TestType, string[]> = {
  Weekly: ["Week 1 Test", "Week 2 Test", "Week 3 Test"],
  Cumulative: ["Cumulative Test 1", "Cumulative Test 2", "Cumulative Test 3"],
  "Grant Test": ["Grant Test 1", "Grant Test 2", "Grant Test 3"]
};

// Sample data for top/bottom performers (100 for demo)
export const allStudents = Array.from({ length: 100 }, (_, i) => {
  const testType: TestType = testTypeOptions[i % testTypeOptions.length];
  return {
    name: `Student ${i + 1}`,
    section: sections[i % sections.length],
    campus: campuses[i % campuses.length],
    month: months[i % months.length],
    week: weeks[i % weeks.length],
    testType,
    test: testTypeToTests[testType][i % 3],
    percent: 98 - i * 0.7 + (i % 5) * 2 // just for demo
  };
});
