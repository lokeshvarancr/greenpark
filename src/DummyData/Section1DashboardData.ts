// Dummy data for Section1Dashboard
// This structure matches the expected backend API response for dashboard analytics
import { faker } from "@faker-js/faker";

// --- Exported constants must be defined before use ---
export const INSTITUTIONS = ["Green Park", "Blue Hill", "Silver Oak"];
export const BATCHES = ["Alpha 2025", "Beta 2024", "Gamma 2026", "Delta 2025"];
export const CLASSES = ["11A", "11B", "12A", "12B", "12C"];
export const SUBJECTS = ["Physics", "Chemistry", "Botany", "Zoology", "Maths"];
const EXAM_TYPES = ["Weekly", "Cumulative", "Grand Test"];

const getRandomExamType = () => faker.helpers.arrayElement(EXAM_TYPES);
const getMaxScore = (examType: string) => {
  if (examType === "Weekly") return 120;
  if (examType === "Cumulative") return 400;
  return 720;
};

export const generateSection1DashboardData = () => {
  const recs = [];

  for (let i = 0; i < 600; i++) {
    const institution = faker.helpers.arrayElement(INSTITUTIONS);
    const batch = faker.helpers.arrayElement(BATCHES);
    const clazz = faker.helpers.arrayElement(CLASSES);
    const studentId = `STU-${i.toString().padStart(3, "0")}`;
    const studentName = `${faker.person.firstName()} ${faker.person.lastName().charAt(0)}`;

    for (let t = 0; t < 6; t++) {
      const examType = getRandomExamType();
      const maxScore = getMaxScore(examType);
      const attempted = faker.number.int({ min: 120, max: 180 });
      const correct = faker.number.int({ min: 0, max: attempted });
      const rawScore = correct * 4 - (attempted - correct); // NEET marking (4/-1)
      const projected = Math.max(
        0,
        Math.min(720, rawScore + faker.number.int({ min: -20, max: 20 }))
      );

      recs.push({
        institution,
        batch,
        class: clazz,
        subject: faker.helpers.arrayElement(SUBJECTS),
        examType,
        maxScore,
        testId: `T${t + 1}`,
        studentId,
        studentName,
        attempted,
        correct,
        rawScore,
        projected,
        testDate: faker.date.recent({ days: 180 }),
      });
    }
  }
  return recs;
};

export const SECTION1_DASHBOARD_DATASET = generateSection1DashboardData();
