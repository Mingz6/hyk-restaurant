import { defineConfig } from "astro/config";

// Project page: https://<user>.github.io/abc-restaurant/
export default defineConfig({
  site: "https://mingz6.github.io",
  base: "/abc-restaurant",
  trailingSlash: "ignore",
  build: { inlineStylesheets: "auto" },
  devToolbar: { enabled: false },
});
