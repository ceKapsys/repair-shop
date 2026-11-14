"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { copy } from "@/content/copy";

type Theme = "system" | "light" | "dark";
const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: copy.footer.theme.light, icon: Sun },
  { value: "dark", label: copy.footer.theme.dark, icon: Moon },
  { value: "system", label: copy.footer.theme.system, icon: Monitor },
];

/** Manual theme choice. "System" removes the override so prefers-color-scheme decides. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);
  const choose = (t: Theme) => {
    setTheme(t);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (t === "system") {
      localStorage.removeItem("theme");
      root.classList.add(matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    } else {
      root.classList.add(t);
      localStorage.setItem("theme", t);
    }
  };
  return (
    <div role="radiogroup" aria-label={copy.footer.theme.label} className="inline-flex rounded-full border border-on-primary/30 p-1">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          onClick={() => choose(value)}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm ${theme === value ? "bg-on-primary text-night" : "text-on-primary"}`}
        >
          <Icon size={16} strokeWidth={1.75} aria-hidden /> {label}
        </button>
      ))}
    </div>
  );
}
