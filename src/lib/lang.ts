export const LOCALES = ["en", "zh-Hant", "zh-Hans"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Pick the site language from the browser's ordered language list.
 * First recognised language wins; anything else falls back to English.
 * Self-contained on purpose: the same source is inlined into <head> so the
 * redirect happens before first paint.
 */
export function detectLocale(languages: readonly string[]): Locale {
  for (const raw of languages) {
    const parts = String(raw).toLowerCase().replace(/_/g, "-").split("-");
    const primary = parts[0];
    if (primary === "en") return "en";
    if (primary === "zh" || primary === "yue") {
      if (parts.includes("hans")) return "zh-Hans";
      if (parts.includes("hant")) return "zh-Hant";
      if (parts.includes("tw") || parts.includes("hk") || parts.includes("mo")) return "zh-Hant";
      return primary === "yue" ? "zh-Hant" : "zh-Hans";
    }
  }
  return "en";
}

export const isLocale = (v: unknown): v is Locale => LOCALES.includes(v as Locale);
