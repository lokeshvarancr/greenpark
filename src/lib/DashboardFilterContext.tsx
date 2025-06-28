import React, { createContext, useContext, useState } from "react";

export type ExamType = "Weekly" | "Cumulative" | "Grand Test";
export type SubjectType = "Physics" | "Chemistry" | "Botany" | "Zoology" | "Physics + Botany" | "Chemistry + Zoology";

export interface FilterState {
  dateRange: { from: Date; to: Date };
  institution: string;
  batch: string;
  class: string;
  scoreRange: [number, number];
  examType: ExamType;
  subject: SubjectType | "";
}

const defaultState: FilterState = {
  dateRange: { from: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), to: new Date() },
  institution: "All",
  batch: "All",
  class: "All",
  scoreRange: [0, 720],
  examType: "Grand Test",
  subject: "",
};

export const FilterContext = createContext<{
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
} | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filter, setFilter] = useState<FilterState>(defaultState);
  return (
    <FilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter must be used within FilterProvider");
  return ctx;
};
