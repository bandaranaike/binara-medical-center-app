"use client";

import React from "react";
import {MoonStar, SunMedium} from "lucide-react";
import {useThemeContext} from "@/context/ThemeContext";

interface ThemeToggleProps {
    compact?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({compact = false}) => {
    const {resolvedTheme, toggleTheme} = useThemeContext();
    const isDark = resolvedTheme === "dark";

    return (
        <button
            type="button"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            onClick={toggleTheme}
            className={`group inline-flex items-center gap-3 rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--foreground)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[var(--accent-strong)] ${
                compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
            }`}
        >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                {isDark ? <SunMedium className="h-4 w-4"/> : <MoonStar className="h-4 w-4"/>}
            </span>
            {!compact && (
                <span className="flex flex-col items-start leading-none">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">Theme</span>
                    <span className="mt-1 font-medium">{isDark ? "Dark mode" : "Light mode"}</span>
                </span>
            )}
        </button>
    );
};

export default ThemeToggle;
