import siteData from "../data/site.json";
import { pathPrefix } from "../i18n/index";
import type { Locale } from "./lang";

// Optional, untracked file with the real contact details, for showing the owner their own number in person.
// It is gitignored and absent on CI, so the published site always keeps the placeholders in site.json.
const privateFiles = import.meta.glob<{ default: Partial<typeof siteData> }>("../data/site.private.json", { eager: true });
const override = Object.values(privateFiles)[0]?.default;

export const site = { ...siteData, ...override, address: { ...siteData.address, ...override?.address } };

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const tel = site.phone.replace(/[^\d+]/g, "");

const { street, city, region, postal } = site.address;
export const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${street}, ${city}, ${region} ${postal}`.trim(),
)}`;

export type Route = "" | "menu";

/** Site-relative URL for a page in a given language. English lives at the root. */
export const routeUrl = (locale: Locale, route: Route = ""): string =>
  `${base}/${pathPrefix[locale]}${route ? `${route}/` : ""}`;

export const assetUrl = (path: string): string => `${base}/${path.replace(/^\//, "")}`;
export const siteBase = base;
