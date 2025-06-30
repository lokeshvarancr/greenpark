// Dummy data for PerformanceTab
// Structure matches expected backend API for performance tab analytics

export const TEST_TYPES = ["Weekly", "Cumulative", "Grand Test"];
// Restrict section options to only 5: 11A, 11B, 12A, 12B
export const SECTION_OPTIONS = ["11A", "11B", "12A", "12B"];
const sectionList = SECTION_OPTIONS;
export const MONTHS = (() => {
  const months = [];
  const start = new Date(2025, 5, 1); // June 2025
  for (let i = 0; i < 12; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    months.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("default", { month: "long", year: "numeric" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
})();

export function getWeeksInMonth(year: number, month: number) {
  const weeks: Date[][] = [];
  let date = new Date(year, month, 1);
  let week: Date[] = [];
  while (date.getMonth() === month) {
    week.push(new Date(date));
    if (date.getDay() === 6) {
      weeks.push(week);
      week = [];
    }
    date.setDate(date.getDate() + 1);
  }
  if (week.length) weeks.push(week);
  return weeks;
}

// --- NEET Performance Tab Data (Completed as per requirements) ---

export type PerformanceStatus = "Improved" | "Declined" | "No Change" | "";

export interface SubjectPerformance {
  mark1: number | "";
  mark2: number | "";
  rank1: number | "";
  rank2: number | "";
  status: PerformanceStatus;
}

export interface PerformanceRow {
  sno: number;
  name: string;
  section: string;
  physics: SubjectPerformance;
  chemistry: SubjectPerformance;
  botany: SubjectPerformance;
  zoology: SubjectPerformance;
}

// Helper to generate status distribution
function generateStatusArray(total: number): PerformanceStatus[] {
  const improved = Math.round(total * 0.7); // ~70% Improved
  const declined = Math.round(total * 0.2); // ~20% Declined
  const noChange = total - improved - declined; // rest No Change
  return [
    ...Array(improved).fill("Improved"),
    ...Array(declined).fill("Declined"),
    ...Array(noChange).fill("No Change"),
  ];
}

// Helper to shuffle array
function shuffle<T>(arr: T[]): T[] {
  return arr
    .map((v) => [Math.random(), v] as [number, T])
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v);
}

// Generate 60 students, assign sections round-robin from 11A, 11B, 12A, 12B, 11C
const studentNames = Array.from({ length: 60 }, (_, i) => `Student ${i + 1}`);
const students = studentNames.map((name, i) => ({
  sno: i + 1,
  name,
  section: sectionList[i % sectionList.length],
}));

// --- Data generators for each test type ---
function genWeeklyData(): PerformanceRow[] {
  // Physics & Chemistry: all 60 rows filled; Botany/Zoology: all filled
  const statusPhysics = shuffle(generateStatusArray(60));
  const statusChemistry = shuffle(generateStatusArray(60));
  const statusBotany = shuffle(generateStatusArray(60));
  const statusZoology = shuffle(generateStatusArray(60));
  return students.map((student, i) => {
    function fillSubject(max: number, status: PerformanceStatus) {
      const mark1 = max - Math.floor(i / 2) - Math.floor(Math.random() * 8);
      const mark2 = mark1 + Math.floor(Math.random() * 5) - 2; // small change
      const rank1 = 1 + i + Math.floor(Math.random() * 5);
      const rank2 = rank1 + Math.floor(Math.random() * 3) - 1;
      return { mark1, mark2, rank1, rank2, status } as SubjectPerformance;
    }
    return {
      ...student,
      physics: fillSubject(120, statusPhysics[i] as PerformanceStatus),
      chemistry: fillSubject(180, statusChemistry[i] as PerformanceStatus),
      botany: fillSubject(240, statusBotany[i] as PerformanceStatus),
      zoology: fillSubject(240, statusZoology[i] as PerformanceStatus),
    };
  });
}

function genCumulativeData(): PerformanceRow[] {
  // All 60 rows filled, all subjects out of 200, 50 questions
  const statusPhysics = shuffle(generateStatusArray(60));
  const statusChemistry = shuffle(generateStatusArray(60));
  const statusBotany = shuffle(generateStatusArray(60));
  const statusZoology = shuffle(generateStatusArray(60));
  return students.map((student, i) => {
    function fillSubject(max: number, status: PerformanceStatus) {
      const mark1 = max - Math.floor(i / 2) - Math.floor(Math.random() * 10);
      const mark2 = mark1 + Math.floor(Math.random() * 5) - 2;
      const rank1 = 1 + i + Math.floor(Math.random() * 5);
      const rank2 = rank1 + Math.floor(Math.random() * 3) - 1;
      return { mark1, mark2, rank1, rank2, status };
    }
    return {
      ...student,
      physics: fillSubject(200, statusPhysics[i] as PerformanceStatus),
      chemistry: fillSubject(200, statusChemistry[i] as PerformanceStatus),
      botany: fillSubject(200, statusBotany[i] as PerformanceStatus),
      zoology: fillSubject(200, statusZoology[i] as PerformanceStatus),
    };
  });
}

function genGrandTestData(): PerformanceRow[] {
  // All 60 rows filled, all subjects out of 180, 180 questions total
  const statusPhysics = shuffle(generateStatusArray(60));
  const statusChemistry = shuffle(generateStatusArray(60));
  const statusBotany = shuffle(generateStatusArray(60));
  const statusZoology = shuffle(generateStatusArray(60));
  return students.map((student, i) => {
    function fillSubject(max: number, status: PerformanceStatus) {
      const mark1 = max - Math.floor(i / 2) - Math.floor(Math.random() * 10);
      const mark2 = mark1 + Math.floor(Math.random() * 5) - 2;
      const rank1 = 1 + i + Math.floor(Math.random() * 5);
      const rank2 = rank1 + Math.floor(Math.random() * 3) - 1;
      return { mark1, mark2, rank1, rank2, status };
    }
    return {
      ...student,
      physics: fillSubject(180, statusPhysics[i] as PerformanceStatus),
      chemistry: fillSubject(180, statusChemistry[i] as PerformanceStatus),
      botany: fillSubject(180, statusBotany[i] as PerformanceStatus),
      zoology: fillSubject(180, statusZoology[i] as PerformanceStatus),
    };
  });
}

// Main export: switch by test type
export function getPerformanceTableData(testType: string): PerformanceRow[] {
  if (testType === "Weekly") return genWeeklyData();
  if (testType === "Cumulative") return genCumulativeData();
  if (testType === "Grand Test") return genGrandTestData();
  return [];
}

// Example excelData for comparison (simulate API response)
export const excelData = Array.from({ length: 30 }, (_, i) => ({
  sno: i + 1,
  class: SECTION_OPTIONS[i % SECTION_OPTIONS.length],
  name: `Student ${i + 1}`,
  physics: { mark1: 50 + i, mark2: 55 + i, rank1: 10 + i, rank2: 12 + i },
  chemistry: { mark1: 45 + i, mark2: 48 + i, rank1: 15 + i, rank2: 14 + i },
  botany: { mark1: 40 + i, mark2: 42 + i, rank1: 20 + i, rank2: 18 + i },
  zoology: { mark1: 38 + i, mark2: 40 + i, rank1: 25 + i, rank2: 22 + i },
}));
