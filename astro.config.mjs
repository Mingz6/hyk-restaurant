import { defineConfig } from "astro/config";

// Project page: https://<user>.github.io/hyk-restaurant/
export default defineConfig({
  site: "https://mingz6.github.io",
  base: "/hyk-restaurant",
  trailingSlash: "ignore",
  build: { inlineStylesheets: "auto" },
  devToolbar: { enabled: false },
});
