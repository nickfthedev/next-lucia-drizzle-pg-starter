"use client";

import { useTheme } from "next-themes";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <form method="post" action="/">
      <select
        className="select select-bordered w-full max-w-xs select-sm"
        name="theme"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </form>
  );
}
