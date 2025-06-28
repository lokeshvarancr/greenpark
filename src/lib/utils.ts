import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility to merge Tailwind classes conditionally
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility to return color-coded accuracy badge
export function getAccuracyBadge(rawAccuracy: number | string): React.ReactNode {
  const accuracy = Number(rawAccuracy); // Ensure accuracy is a number
  if (accuracy < 40) {
    return (
      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
        {accuracy}%
      </span>
    );
  }

  if (accuracy <= 60) {
    return (
      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
        {accuracy}%
      </span>
    );
  }

  return (
    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
      {accuracy}%
    </span>
  );
}
