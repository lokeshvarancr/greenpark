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

export type TestType = "Weekly" | "Cumulative" | "Grand Test";

export const testTypeOptions: TestType[] = ["Weekly", "Cumulative", "Grand Test"];
export const testTypeToLabel: Record<TestType, string> = {
  Weekly: "Week Test",
  Cumulative: "Cumulative Test",
  "Grand Test": "Grand Test"
};
export const testTypeToTests: Record<TestType, string[]> = {
  Weekly: ["Week 1 Test", "Week 2 Test", "Week 3 Test"],
  Cumulative: ["Cumulative Test 1", "Cumulative Test 2", "Cumulative Test 3"],
  "Grand Test": ["Grand Test 1", "Grand Test 2", "Grand Test 3"]
};

// Sample data for top/bottom performers (covering all filter combinations)
const SUBJECTS = ["Physics", "Chemistry", "Botany", "Zoology"];
export const allStudents = [] as Array<{
  name: string;
  section: string;
  campus: string;
  month: string;
  week: string;
  testType: TestType;
  test: string;
  percent: number;
  subject: string;
}>;
let studentId = 1;
const MAX_STUDENTS = 9999;
outer: for (const month of months) {
  for (const week of weeks) {
    for (const campus of campuses) {
      for (const section of sections) {
        for (const testType of testTypeOptions) {
          for (const test of testTypeToTests[testType]) {
            for (const subject of SUBJECTS) {
              if (studentId > MAX_STUDENTS) break outer;
              allStudents.push({
                name: `Student ${studentId.toString().padStart(4, "0")}`,
                section,
                campus,
                month,
                week,
                testType,
                test,
                percent: Math.max(40, Math.min(100, 60 + Math.floor(Math.random() * 40))),
                subject
              });
              studentId++;
            }
          }
        }
      }
    }
  }
}
