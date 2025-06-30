// Mock API for Dashboard Section 1
// Backend devs: Replace mock logic with real API integration
// Attach auth tokens here if needed
// Extend request payload if new filters added

import type { DashboardData } from "../types/dashboard";

// For Vite/ESM compatibility, use a static import for JSON
import dashboardDataJson from "../dashboard/data/dashboardData.json";

export async function getDashboardData(): Promise<DashboardData> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Return static mock data
  return dashboardDataJson;
}
