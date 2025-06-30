import * as React from "react";

export function ThemeToggle() {
  const [dark, setDark] = React.useState(() =>
    document.documentElement.classList.contains("dark")
  );

  React.useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <button
      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle dark mode"
    >
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
