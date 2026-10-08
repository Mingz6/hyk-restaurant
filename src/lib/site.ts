import site from "../data/site.json";
import { pathPrefix } from "../i18n/index";
import type { Locale } from "./lang";

export { site };

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const tel = site.phone.replace(/[^\d+]/g, "");

export const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postal}`,
)}`;

export type Route = "" | "menu";

/** Site-relative URL for a page in a given language. English lives at the root. */
export const routeUrl = (locale: Locale, route: Route = ""): string =>
  `${base}/${pathPrefix[locale]}${route ? `${route}/` : ""}`;

export const assetUrl = (path: string): string => `${base}/${path.replace(/^\//, "")}`;
export const siteBase = base;
