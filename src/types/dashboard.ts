// Types for Dashboard API request and response

interface DashboardFilter {
  fromDate: string;
  toDate: string;
  institution: string;
  batch: string;
  class: string;
  examType: "weekly" | "cumulative" | "grand";
  subject?: string;
}

interface DashboardData {
  totalTestConducted: number;
  avgAccuracyPercentage: number;
  avgTotalScore: number;
  avgAttemptRatePercentage: number;
  top10PercentAvgScore: number;
  bottom10PercentAvgScore: number;
  averageTotalScore: number;
  riskBreakdown: {
    highRiskPercentage: number;
    mediumRiskPercentage: number;
    safePercentage: number;
  };
  neetReadiness: {
    overallPercentage: number;
    classWisePercentages: Record<string, number>;
  };
  improvingStudentsPercentage: number;
  mostImprovedSubject: string;
  bestPerformingClass: string;
  mostDroppedSubject: string;
  performanceTrend: {
    weekly: Record<string, { month: string; score: number }[]>;
    cumulative: Record<string, { month: string; score: number }[]>;
    grandTest: { overall: { month: string; score: number }[] };
  };
  top10Performers: {
    name: string;
    score: number;
    class: string;
    section: string;
  }[];
  top10StudentsByClass: Record<string, { name: string; score: number; section: string }[]>;
}

export type { DashboardFilter, DashboardData };
