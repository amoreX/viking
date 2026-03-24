export interface Theme {
  id: string;
  name: string;
  description: string;
  category: "dark" | "light" | "special";
  vars: Record<string, string>;
  htmlClass?: string;
  fontSans?: string;
  fontMono?: string;
  layout: {
    hero: "centered" | "left" | "split" | "minimal" | "terminal";
    rows: "table" | "cards" | "compact" | "tiles" | "minimal";
    cards: "bordered" | "filled" | "shadow" | "none" | "thick";
    density: "normal" | "compact" | "spacious";
    radius: "rounded" | "sharp" | "pill";
    stats: "cards" | "inline" | "hidden";
    modal: "bento" | "minimal" | "wide";
  };
}

const themes: Theme[] = [
  {
    id: "viking",
    name: "Viking",
    description: "Minimal mono, Nord palette",
    category: "dark",
    fontSans: "'JetBrains Mono Variable', 'JetBrains Mono', monospace",
    fontMono: "'JetBrains Mono Variable', 'JetBrains Mono', monospace",
    vars: {
      "--background": "#2e3440",
      "--foreground": "#d8dee9",
      "--color-accent": "#88c0d0",
      "--color-accent-muted": "rgba(136,192,208,0.08)",
      "--color-surface": "rgba(59,66,82,0.50)",
      "--color-border": "rgba(76,86,106,0.50)",
      "--color-border-hover": "rgba(76,86,106,0.80)",
      "--color-muted": "#d8dee9",
      "--color-dim": "#616e88",
    },
    layout: {
      hero: "minimal",
      rows: "table",
      cards: "bordered",
      density: "spacious",
      radius: "rounded",
      stats: "cards",
      modal: "bento",
    },
  },
];

export default themes;

export function getThemeById(id: string): Theme | undefined {
  return themes.find((t) => t.id === id);
}
