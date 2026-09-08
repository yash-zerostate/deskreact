import { useEffect, useState } from "react";

import { applyTheme, readTheme, type Theme } from "@/lib/theme";

/**
 * The light/dark switch.
 *
 * Reads the class already on <html> rather than assuming a default, because the inline script in
 * index.html has run by now — asking again is how the button avoids showing the wrong icon for a
 * visitor who chose dark on a previous visit.
 */
export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(() =>
        typeof document !== "undefined" && document.documentElement.classList.contains("dark")
            ? "dark"
            : readTheme(),
    );

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const next = theme === "dark" ? "light" : "dark";

    return (
        <button
            type="button"
            onClick={() => setTheme(next)}
            aria-label={`Switch to ${next} theme`}
            title={`Switch to ${next} theme`}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-300 text-slate-600
                 transition hover:border-slate-400 hover:bg-slate-50
                 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/25 dark:hover:bg-white/5"
        >
            {theme === "dark" ? (
                // Sun — clicking it goes back to light.
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
            ) : (
                // Moon — clicking it goes to dark.
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
            )}
        </button>
    );
}
