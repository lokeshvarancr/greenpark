// --- MOCK DATA GENERATION ---
import { faker } from "@faker-js/faker";

export type ScoreGenParams = { count: number; max: number; meanPct?: number; stdDevPct?: number };
export function generateScores({ count, max, meanPct = 0.75, stdDevPct = 0.12 }: ScoreGenParams): number[] {
  const mean = max * meanPct;
  const stdDev = max * stdDevPct;
  return Array.from({ length: count }, () => {
    let score = Math.round(
      Math.min(
        max,
        Math.max(
          0,
          faker.number.float({
            min: Math.max(0, mean - 2 * stdDev),
            max: Math.min(max, mean + 2 * stdDev),
            fractionDigits: 0,
          })
        )
      )
    );
    if (score === max && Math.random() > 0.01) score = max - faker.number.int({ min: 1, max: 5 });
    return score;
  });
}

export const tamilNames = [
  "Keerthana", "Vignesh", "Deepika", "Arunmozhi", "Sathish", "Yuvan", "Priya", "Karthik", "Divya", "Gokul",
  "Meena", "Harish", "Lakshmi", "Saravanan", "Anitha", "Bala", "Kavya", "Ramesh", "Swathi", "Pranav"
];
export function getTamilName() {
  return tamilNames[Math.floor(Math.random() * tamilNames.length)];
}

export function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getRealisticBottom10Avg(maxMarks: number, filterSeed: number): number {
  if (maxMarks === 400) {
    return 140 + (filterSeed % 101);
  } else if (maxMarks === 720) {
    return 240 + (filterSeed % 101);
  } else if (maxMarks === 120) {
    return 40 + (filterSeed % 21);
  }
  return Math.round(maxMarks * 0.3);
}

import type { DashboardData } from "@/types/dashboard";
export async function fetchScores({ institution, batch, section, examType, subject }: { institution: string; batch: string; section: string; examType: string; subject?: string }): Promise<DashboardData> {
  const institutionOptions = ["Institution 1", "Institution 2"];
  const batchOptions = ["Batch A", "Batch B"];
  const sectionOptions = ["11A", "11B", "12A", "12B"];
  const validExamTypes = ["Weekly", "Cumulative", "Grand Test", "NEET"];
  const safeExamType = validExamTypes.includes(examType) ? examType : "Weekly";
  const maxMarks =
    safeExamType === "Weekly" ? 120 :
    safeExamType === "Cumulative" ? 400 :
    safeExamType === "Grand Test" || safeExamType === "NEET" ? 720 : 120;

  const filterSeed = stringToSeed(`${institution}|${batch}|${section}|${examType}|${subject}`);
  const meanPctBase = safeExamType === "NEET" ? 0.5 : 0.75;
  const stdDevBase = safeExamType === "NEET" ? 0.13 : 0.12;
  const meanPct = Math.max(0.35, Math.min(0.9, meanPctBase + ((filterSeed % 13 - 6) * 0.01)));
  const stdDevPct = Math.max(0.08, Math.min(0.2, stdDevBase + ((filterSeed % 7 - 3) * 0.005)));

  let allStudents = institutionOptions.flatMap(inst =>
    batchOptions.flatMap(batchOpt =>
      sectionOptions.flatMap(sec =>
        Array.from({ length: 80 }, (_, i) => ({
          id: `${inst}-${batchOpt}-${sec}-${i}`,
          name: getTamilName(),
          institution: inst,
          batch: batchOpt,
          section: sec,
          score: generateScores({ count: 1, max: maxMarks, meanPct, stdDevPct })[0],
        }))
      )
    )
  );
  let filteredInstitutions = institution ? [institution] : institutionOptions;
  let filteredBatches = batch ? [batch] : batchOptions;
  let filteredSections = (!section || section === "All Sections") ? sectionOptions : [section];
  let students = allStudents.filter(s =>
    filteredInstitutions.includes(s.institution) &&
    filteredBatches.includes(s.batch) &&
    filteredSections.includes(s.section)
  );
  if (students.length === 0) students = allStudents;
  const top10StudentsByClass = Object.fromEntries(
    sectionOptions.map(sec => [sec, [...allStudents.filter(s => s.section === sec)].sort((a, b) => b.score - a.score).slice(0, 10).map(s => ({ name: s.name, score: s.score, section: s.section, class: s.section }))])
  );
  const top10 = [...students].sort((a, b) => b.score - a.score).slice(0, 10);
  const bottom10PercentAvgScore = getRealisticBottom10Avg(maxMarks, filterSeed);
  let mostImprovedSubject = "–";
  let mostDroppedSubject = "–";
  if (safeExamType === "Cumulative" || safeExamType === "Grand Test") {
    mostImprovedSubject = faker.helpers.arrayElement(["Physics", "Chemistry", "Biology"]);
    mostDroppedSubject = faker.helpers.arrayElement(["Physics", "Chemistry", "Biology"]);
  }
  const trendData = Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}/2025`,
    score: generateScores({ count: 1, max: maxMarks, meanPct, stdDevPct })[0],
  }));
  return {
    totalTestConducted: faker.number.int({ min: 10, max: 40 }),
    avgAccuracyPercentage: maxMarks > 0 ? (students.reduce((a, b) => a + b.score, 0) / (students.length * maxMarks)) * 100 : 0,
    avgTotalScore: students.length ? (students.reduce((a, b) => a + b.score, 0) / students.length) : 0,
    avgAttemptRatePercentage: faker.number.float({ min: 70, max: 98, fractionDigits: 1 }),
    top10PercentAvgScore: top10.length ? (top10.reduce((a, b) => a + b.score, 0) / top10.length) : 0,
    bottom10PercentAvgScore,
    averageTotalScore: students.length ? (students.reduce((a, b) => a + b.score, 0) / students.length) : 0,
    riskBreakdown: {
      highRiskPercentage: students.length > 0 ? (students.filter(s => s.score < maxMarks * 0.4).length / students.length) * 100 : 0,
      mediumRiskPercentage: students.length > 0 ? (students.filter(s => s.score >= maxMarks * 0.4 && s.score < maxMarks * 0.75).length / students.length) * 100 : 0,
      safePercentage: students.length > 0 ? (students.filter(s => s.score >= maxMarks * 0.75).length / students.length) * 100 : 0,
    },
    neetReadiness: {
      overallPercentage: (maxMarks > 0 && students.length > 0) ? (students.filter(s => s.score >= maxMarks * 0.75).length / students.length) * 100 : 0,
      classWisePercentages: Object.fromEntries(
        sectionOptions.map(sec => [sec, (maxMarks > 0 && allStudents.filter(s => s.section === sec).length > 0) ? (allStudents.filter(s => s.section === sec && s.score >= maxMarks * 0.75).length / allStudents.filter(s => s.section === sec).length) * 100 : 0])
      ),
    },
    improvingStudentsPercentage: faker.number.float({ min: 40, max: 70, fractionDigits: 1 }),
    mostImprovedSubject,
    bestPerformingClass: sectionOptions
      .map(sec => {
        const secStudents = allStudents.filter(s => s.section === sec);
        const avg = secStudents.length ? secStudents.reduce((a, b) => a + b.score, 0) / secStudents.length : 0;
        return { sec, avg };
      })
      .sort((a, b) => b.avg - a.avg)[0]?.sec || sectionOptions[0],
    mostDroppedSubject,
    performanceTrend: {
      weekly: { Physics: trendData, Chemistry: trendData, Biology: trendData },
      cumulative: { Physics: trendData, Chemistry: trendData, Biology: trendData },
      grandTest: { overall: trendData },
    },
    top10Performers: top10.map(s => ({ name: s.name, score: s.score, section: s.section, class: s.section })),
    top10StudentsByClass,
  };
}
