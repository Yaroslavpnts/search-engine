import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <Toggle
      pressed={isDark}
      onPressedChange={setIsDark}
      aria-label="Toggle theme"
      className="fixed top-4 right-4 z-50 cursor-pointer"
    >
      {isDark ? <Moon /> : <Sun />}
    </Toggle>
  );
}
