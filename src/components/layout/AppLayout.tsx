import * as React from "react";
import { ThemeToggle } from "../ui/ThemeToggle";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <header className="flex items-center justify-between px-6 py-4 border-b border-blue-200 dark:border-blue-800 bg-white dark:bg-blue-950">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-300">InzightEd Dashboard</h1>
        <ThemeToggle />
      </header>
      <main className="container mx-auto py-8">{children}</main>
    </div>
  );
}
