// Dummy data for PerformanceTab
// Structure matches expected backend API for performance tab analytics

export const TEST_TYPES = ["Weekly", "Cumulative", "Grand Test"];
export const SECTION_OPTIONS = [
  ...Array.from({ length: 10 }, (_, i) => `11${String.fromCharCode(65 + i)}`),
  ...Array.from({ length: 10 }, (_, i) => `12${String.fromCharCode(65 + i)}`),
];
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
