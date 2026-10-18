/*
 * ThemeToggle.tsx
 * Theme switcher component toggling between Genesis light and dark modes.
 * Persists theme state in localStorage and updates the root document element class.
 */

"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("genesis-theme") as "light" | "dark" | null;
    const initial =
      stored || (document.documentElement.classList.contains("dark") ? "dark" : "light");
    setTheme(initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("genesis-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <div
        className={`flex items-center rounded-[var(--button-radius)] border border-[var(--border)] p-0.5 bg-[var(--surface)] ${className}`}
      >
        <span className="px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">Theme</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center rounded-[var(--button-radius)] border border-[var(--border)] p-0.5 bg-[var(--surface)] text-xs font-medium ${className}`}
      role="group"
      aria-label="Theme switcher"
    >
      <button
        type="button"
        onClick={() => toggleTheme("light")}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] transition-all duration-150 ${
          theme === "light"
            ? "bg-[var(--surface-muted)] text-[var(--text-primary)] shadow-xs font-semibold"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        <Sun className="h-3.5 w-3.5" />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => toggleTheme("dark")}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] transition-all duration-150 ${
          theme === "dark"
            ? "bg-[var(--surface-muted)] text-[var(--text-primary)] shadow-xs font-semibold"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      >
        <Moon className="h-3.5 w-3.5" />
        <span>Dark</span>
      </button>
    </div>
  );
}
