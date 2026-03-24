"use client";

import { createContext, useContext } from "react";
import themes, { type Theme } from "@/lib/themes";

const ThemeContext = createContext<Theme>(themes[0]);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={themes[0]}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
