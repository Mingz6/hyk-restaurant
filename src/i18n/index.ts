import * as OpenCC from "opencc-js";
import { en, zhHant, type Dict, type Key } from "./strings";
import type { Locale } from "../lib/lang";

// 劏 has a rare simplified form (㓥) that most fonts lack; mainland Cantonese menus keep 劏.
const toHansRaw = OpenCC.Converter({ from: "hk", to: "cn" });
export const toHans = (s: string): string => toHansRaw(s).replaceAll("㓥", "劏");

const zhHans = Object.fromEntries(
  (Object.entries(zhHant) as [Key, string][]).map(([k, v]) => [k, toHans(v)]),
) as Dict;

const dictionaries: Record<Locale, Dict> = { en, "zh-Hant": zhHant, "zh-Hans": zhHans };

type Vars = Record<string, string | number>;

export const fill = (s: string, vars: Vars = {}): string =>
  s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));

export const useI18n = (locale: Locale) => {
  const dict = dictionaries[locale];
  const t = (key: Key, vars?: Vars): string => fill(dict[key], vars);
  return { t, dict, locale };
};

/** Chinese text for a locale: Hant as stored, Hans converted. */
export const zhText = (locale: Locale, hant: string): string => (locale === "zh-Hans" ? toHans(hant) : hant);

export const isChinese = (locale: Locale): boolean => locale !== "en";

export const htmlLang: Record<Locale, string> = { en: "en", "zh-Hant": "zh-Hant", "zh-Hans": "zh-Hans" };
export const ogLocale: Record<Locale, string> = { en: "en_CA", "zh-Hant": "zh_HK", "zh-Hans": "zh_CN" };
export const langName: Record<Locale, string> = { en: "English", "zh-Hant": "繁體中文", "zh-Hans": "简体中文" };
export const langShort: Record<Locale, string> = { en: "EN", "zh-Hant": "繁", "zh-Hans": "简" };
export const pathPrefix: Record<Locale, string> = { en: "", "zh-Hant": "zh-hant/", "zh-Hans": "zh-hans/" };

const weekdays = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  zh: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
};
/** `day` is the English weekday name used as the key in site.json. */
export const dayName = (locale: Locale, day: string): string => {
  const i = weekdays.en.indexOf(day);
  if (i < 0) return day;
  return locale === "en" ? day : zhText(locale, weekdays.zh[i]);
};

/** Strings the browser needs for live status and search, sent as JSON so the converter stays out of the bundle. */
export const clientStrings = (locale: Locale) => {
  const d = dictionaries[locale];
  return {
    locale,
    status: {
      open: d["status.open"],
      closing: d["status.closing"],
      closed: d["status.closed"],
      until: d["status.until"],
      opensToday: d["status.opensToday"],
      opensTomorrow: d["status.opensTomorrow"],
    },
    menuCount: d["menu.count"],
    theme: {
      label: d["theme.label"],
      auto: d["theme.auto"],
      light: d["theme.light"],
      dark: d["theme.dark"],
    },
    days: Object.fromEntries(weekdays.en.map((day) => [day, dayName(locale, day)])),
  };
};
export type ClientStrings = ReturnType<typeof clientStrings>;
