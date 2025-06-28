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
