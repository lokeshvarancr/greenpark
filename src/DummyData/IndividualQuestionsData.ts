// Dummy data for IndividualQuestions
// Structure matches expected backend API for question analytics

export const NEET_SUBJECTS = ["Physics", "Chemistry", "Botany", "Zoology"];
export const CLASSES = ["11A", "11B", "11C", "11D", "11E", "11F"];
export const TEST_TYPES = ["Weekly", "Cumulative", "Grand Test"];
export const BATCHES = ["Batch A", "Batch B"];
export const CUMULATIVE_PAIRS: string[] = [
  "Physics + Botany",
  "Chemistry + Zoology"
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
  const weeks = [];
  let date = new Date(year, month, 1);
  let week = [];
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

export function getSubjectsForWeek(week: Date[]): { day: Date; subject: string }[] {
  const dayToSubject: Record<number, string> = {
    3: "Physics",    // Wednesday
    4: "Chemistry",  // Thursday
    5: "Botany",     // Friday
    6: "Zoology",    // Saturday
  };
  return week
    .filter((d: Date) => dayToSubject[d.getDay()])
    .map((d: Date) => ({
      day: d,
      subject: dayToSubject[d.getDay()],
    }));
}

export type Option = { option: string; count: number };
export type Question = {
	id: number;
	number: number;
	subject: string;
	text: string;
	attempts: number;
	correct: number;
	incorrect: number;
	accuracy: number; // percentage (0-100)
	difficulty: "Easy" | "Medium" | "Hard";
	correctAnswer: string;
	options: Option[];
	class: string;
	test: string;
};
export type StudentResponse = {
  studentId: string;
  subject: string;
  questionNo: number;
  selectedOption: string;
  isCorrect: boolean;
};
export type TopicAnalytics = {
  topic: string;
  avgAccuracy: number;
  totalQuestions: number;
};

function getRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
export const QUESTIONS = Array.from({ length: 180 }, (_, i) => {
	const subject = getRandom(NEET_SUBJECTS);
	return {
		id: i + 1,
		number: i + 1,
		subject,
		text: `Sample NEET Question ${i + 1} (${subject})?`,
		attempts: Math.floor(Math.random() * 50) + 10,
		correct: Math.floor(Math.random() * 30),
		incorrect: Math.floor(Math.random() * 20),
		accuracy: Math.floor(Math.random() * 100),
		difficulty: getRandom(["Easy", "Medium", "Hard"]) as "Easy" | "Medium" | "Hard",
		correctAnswer: getRandom(["A", "B", "C", "D"]),
		options: [
			{ option: "A", count: Math.floor(Math.random() * 20) },
			{ option: "B", count: Math.floor(Math.random() * 20) },
			{ option: "C", count: Math.floor(Math.random() * 20) },
			{ option: "D", count: Math.floor(Math.random() * 20) },
		],
		class: getRandom(CLASSES.slice(1)),
		test: getRandom(TEST_TYPES),
	};
});

export function getTotalStudentCount(sections: string[]) {
  if (!sections || sections.length === 0 || sections.includes("Select All")) return 200;
  return sections.length * 50;
}

export function getQuestionRowsByTestType(testType: string, subject: string, subjectPair?: string) {
  if (testType === "Weekly") {
    const counts: Record<string, number> = { Physics: 30, Chemistry: 45, Botany: 60, Zoology: 60 };
    return Array.from({ length: counts[subject] || 0 }, (_, i) => ({
      subject,
      questionNumber: i + 1,
    }));
  }
  if (testType === "Cumulative") {
    if (subjectPair === "Physics+Botany") {
      return [
        ...Array.from({ length: 50 }, (_, i) => ({ subject: "Physics", questionNumber: i + 1 })),
        ...Array.from({ length: 50 }, (_, i) => ({ subject: "Botany", questionNumber: 50 + i + 1 })),
      ];
    } else {
      return [
        ...Array.from({ length: 50 }, (_, i) => ({ subject: "Chemistry", questionNumber: i + 1 })),
        ...Array.from({ length: 50 }, (_, i) => ({ subject: "Zoology", questionNumber: 50 + i + 1 })),
      ];
    }
  }
  if (testType === "Grand Test") {
    let rows: { subject: string; questionNumber: number }[] = [];
    let n = 1;
    for (const subject of ["Physics", "Chemistry", "Botany", "Zoology"]) {
      for (let i = 0; i < 45; i++) {
        rows.push({ subject, questionNumber: n++ });
      }
    }
    return rows;
  }
  return [];
}

export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function weightedView(tries: number) {
  if (tries > 0.9) return randInt(4, 5);
  if (tries > 0.7) return randInt(2, 5);
  if (tries > 0.5) return randInt(1, 4);
  return randInt(0, 2);
}
export function generateQuestionTableRows({
  testType,
  subject,
  section,
  subjectPair,
}: {
  testType: string;
  subject: string;
  section: string[];
  subjectPair?: string;
}): any[] {
  const rows = getQuestionRowsByTestType(testType, subject, subjectPair);
  const totalCount = getTotalStudentCount(section);
  return rows.map((row) => {
    const attempts = randInt(Math.floor(totalCount * 0.6), totalCount);
    const correct = randInt(0, attempts);
    const incorrect = attempts - correct;
    const accuracy = attempts === 0 ? 0 : Number(((correct / attempts) * 100).toFixed(2));
    const triesRatio = attempts / (totalCount || 1);
    const view = weightedView(triesRatio);
    return {
      ...row,
      attempts,
      correct,
      incorrect,
      accuracy,
      view,
    };
  });
}
