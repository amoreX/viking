"use client";

import { useState, useEffect, useCallback } from "react";
import themes, { type Theme } from "@/lib/themes";

const STORAGE_KEY = "viking-theme";

/** Maps theme font keys to CSS variable references loaded in layout.tsx */
const FONT_MAP: Record<string, string> = {
  "JetBrains Mono": "var(--font-jetbrains)",
  "Source Serif 4": "var(--font-source-serif)",
  "Space Grotesk": "var(--font-space-grotesk)",
  "IBM Plex Mono": "var(--font-ibm-plex)",
  "Sora": "var(--font-sora)",
};

function resolveFontVar(fontString: string | undefined): string | null {
  if (!fontString) return null;
  for (const [name, cssVar] of Object.entries(FONT_MAP)) {
    if (fontString.includes(name)) return cssVar;
  }
  return null;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }

  // Font overrides
  const sansVar = resolveFontVar(theme.fontSans);
  if (sansVar) {
    root.style.setProperty("--font-sans", sansVar);
  } else {
    root.style.setProperty("--font-sans", "var(--font-geist-sans)");
  }

  const monoVar = resolveFontVar(theme.fontMono);
  if (monoVar) {
    root.style.setProperty("--font-mono", monoVar);
  } else {
    root.style.setProperty("--font-mono", "var(--font-geist-mono)");
  }

  // Light/dark class
  if (theme.htmlClass === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
  }

  root.dataset.theme = theme.id;
}

const CATEGORIES = [
  { key: "dark", label: "Dark" },
  { key: "light", label: "Light" },
  { key: "special", label: "Special" },
] as const;

export default function ThemeSwitcher() {
  const [active, setActive] = useState("terminal");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const theme = themes.find((t) => t.id === (saved ?? "terminal"));
    if (theme) {
      setActive(theme.id);
      applyTheme(theme);
    }
  }, []);

  const select = useCallback((id: string) => {
    const theme = themes.find((t) => t.id === id);
    if (!theme) return;
    setActive(id);
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: id }));
  }, []);

  const currentTheme = themes.find((t) => t.id === active);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="mb-2 w-80 rounded-xl border border-border bg-background shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-xs font-bold text-foreground uppercase">Themes</p>
            <button
              onClick={() => setIsOpen(false)}
              className="cursor-pointer rounded p-0.5 text-dim hover:text-foreground"
              aria-label="Close theme picker"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Categories */}
          <div className="max-h-[60vh] overflow-y-auto p-3">
            {CATEGORIES.map((cat) => {
              const catThemes = themes.filter((t) => t.category === cat.key);
              if (catThemes.length === 0) return null;
              return (
                <div key={cat.key} className="mb-3 last:mb-0">
                  <p className="mb-1.5 px-1 text-[0.625rem] font-semibold text-dim uppercase">
                    {cat.label}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {catThemes.map((theme) => {
                      const isActive = theme.id === active;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => select(theme.id)}
                          className={`group flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                            isActive
                              ? "ring-1 ring-accent/40"
                              : "hover:bg-surface"
                          }`}
                          style={isActive ? { backgroundColor: theme.vars["--color-accent-muted"] } : undefined}
                        >
                          {/* Swatch: bg circle with accent ring */}
                          <span
                            className="size-5 shrink-0 rounded-full"
                            style={{
                              background: theme.vars["--background"],
                              boxShadow: `inset 0 0 0 2px ${theme.vars["--color-accent"]}, 0 0 0 1px rgba(255,255,255,0.06)`,
                            }}
                          />
                          <div className="min-w-0">
                            <p className={`truncate text-xs font-medium ${isActive ? "text-accent" : "text-foreground"}`}>
                              {theme.name}
                            </p>
                            <p className="truncate text-[0.5625rem] text-dim">
                              {theme.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toggle pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 py-2 shadow-lg transition-colors hover:bg-surface"
        aria-label="Toggle theme picker"
      >
        <span
          className="size-3 rounded-full"
          style={{
            background: currentTheme?.vars["--background"],
            boxShadow: `inset 0 0 0 1.5px ${currentTheme?.vars["--color-accent"]}`,
          }}
        />
        <span className="text-xs font-medium text-muted">
          {currentTheme?.name}
        </span>
      </button>
    </div>
  );
}
