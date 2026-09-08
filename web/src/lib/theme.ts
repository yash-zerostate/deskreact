/**
 * Theme state. Light unless the visitor has chosen otherwise.
 *
 * Deliberately NOT seeded from prefers-color-scheme. The site has a default and it is light; the
 * OS setting is a different question ("what does this person like generally"), and letting it win
 * would mean the site has no default at all — two visitors would disagree about what "untouched"
 * looks like, which is exactly the ambiguity a demo page should not have.
 *
 * The class lands on <html> before React renders, from the inline script in index.html, so a
 * visitor who chose dark does not get a white flash on every load. This module and that script are
 * the only two places that know the storage key — keep them in step.
 */
export type Theme = "light" | "dark";

export const THEME_KEY = "deskdesk_theme";

export function readTheme(): Theme {
    try {
        return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    } catch {
        // Private mode, storage disabled — the default is still a valid answer.
        return "light";
    }
}

export function applyTheme(theme: Theme): void {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch {
        // The class is already applied; only persistence is lost.
    }
}
