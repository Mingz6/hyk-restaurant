# HYK Restaurant

A website design concept for a Hong Kong–style seafood restaurant: mobile-first, bento layout, editorial type, a searchable trilingual HTML menu. Built as a pitch demo.

**Not an official site.** All copy is original, prices are samples, and there are no third-party photos. It is not affiliated with or endorsed by any existing business, and it is marked `noindex`.

## What is in it

- **Mobile first.** Base CSS is written for a phone and `min-width` queries add the larger layouts. On phones a bottom bar keeps Menu, Call and Directions one tap away; the search box is 16px so iOS does not zoom; tap targets are at least 40px; safe-area insets are respected.
- **Three languages, picked automatically.** English (default), 繁體中文 and 简体中文. The browser's language list decides on the first visit: the first language it recognises wins, and anything else falls back to English. A manual choice in the language menu is remembered and beats the browser setting. Explicit URLs (`/zh-hant/…`) are never redirected.
- **Light and dark, picked automatically.** Follows the system setting, light by default. The theme button cycles Auto, Light, Dark and remembers the choice. No flash on load.
- `/` home: hero, house favourites (bento), menu categories, live open/closed status in the restaurant's time zone, hours, directions.
- `/menu` the full menu as real HTML (235 dishes). Search works across English, Traditional and Simplified at once (`/` focuses it, `Esc` clears). Sticky section chips, print stylesheet.
- No client-side framework. About 570 KB of output including self-hosted fonts. Lighthouse (mobile) 100 / 100 / 100 / SEO 63; SEO is capped by `noindex` on purpose.

## URLs

| Language | Home | Menu |
| --- | --- | --- |
| English | `/` | `/menu/` |
| 繁體中文 | `/zh-hant/` | `/zh-hant/menu/` |
| 简体中文 | `/zh-hans/` | `/zh-hans/menu/` |

Detection lives in `src/lib/lang.ts` and is inlined into the English pages' `<head>`, so the redirect happens before first paint. Without JavaScript the English page simply stays.

## Edit the content

| What | Where |
| --- | --- |
| Name, phone, address, hours, disclaimer | `src/data/site.json` |
| Dishes, Chinese names, prices, badges | `src/data/menu.json` |
| UI text (English and Traditional Chinese) | `src/i18n/strings.ts` |
| Colours, type, spacing | `src/styles/global.css` (`:root` tokens) |

Simplified Chinese is generated from the Traditional text at build time with OpenCC, so there is one Chinese source to maintain. A test fails the build if a string exists in English but not in Chinese.

Prices in `menu.json` are sample values. The Chinese dish names were read from photos of a printed menu and need a native proofread. Replace both before any real use.

There are no photos on purpose. To add the owner's own photos, put them in `src/assets/` and use Astro's `<Image />` in the bento tiles.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321/hyk-restaurant/
npm test         # language detection, open/closed logic, translation completeness
npm run build    # type-check + static build into dist/
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml` and publishes to GitHub Pages at `https://<user>.github.io/hyk-restaurant/`. In the repo settings, Pages → Source must be **GitHub Actions**.
