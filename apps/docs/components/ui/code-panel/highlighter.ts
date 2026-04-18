import { createHighlighter, type Highlighter } from "shiki";

const SUPPORTED_LANGS = ["tsx", "ts", "bash", "json", "css"] as const;

const THEMES = ["github-light", "github-dark"] as const;

let highlighterPromise: Promise<Highlighter> | null = null;
const loadedLangs = new Set<string>(SUPPORTED_LANGS);

export const getHighlighter = () => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [...THEMES],
      langs: [...SUPPORTED_LANGS],
    });
  }
  return highlighterPromise;
};

export const ensureLanguage = async (lang: string) => {
  const highlighter = await getHighlighter();
  if (loadedLangs.has(lang)) return highlighter;
  await highlighter.loadLanguage(lang as Parameters<Highlighter["loadLanguage"]>[0]);
  loadedLangs.add(lang);
  return highlighter;
};
