import site from "../data/site.json";
import type { ClientStrings } from "../i18n";
import { describeStatus, getStatus } from "../lib/time";

const strings: ClientStrings = JSON.parse(document.getElementById("i18n")!.textContent!);
const root = document.documentElement;

const store = {
  get: (k: string): string | null => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string | null) => {
    try {
      if (v === null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    } catch {
      /* private mode: the choice just won't persist */
    }
  },
};

const spotlight = () => {
  if (!matchMedia("(hover: hover)").matches) return;
  document.addEventListener(
    "pointermove",
    (e) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(".spot");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    },
    { passive: true },
  );
};

type Mode = "auto" | "light" | "dark";
const THEME_COLOR = { light: "#f6f0e5", dark: "#0c0a09" };

const theme = () => {
  const btn = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (!btn) return;
  const order: Mode[] = ["auto", "light", "dark"];
  const read = (): Mode => (root.dataset.theme === "light" || root.dataset.theme === "dark" ? root.dataset.theme : "auto");

  const paint = (mode: Mode) => {
    const text = `${strings.theme.label}: ${strings.theme[mode]}`;
    btn.setAttribute("aria-label", text);
    btn.title = text;
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
      const own = m.media.includes("dark") ? "dark" : "light";
      m.content = THEME_COLOR[mode === "auto" ? own : mode];
    });
  };
  const apply = (mode: Mode) => {
    if (mode === "auto") delete root.dataset.theme;
    else root.dataset.theme = mode;
    store.set("hyk-theme", mode === "auto" ? null : mode);
    paint(mode);
  };

  paint(read());
  btn.addEventListener("click", () => apply(order[(order.indexOf(read()) + 1) % order.length]));
};

const languageMenu = () => {
  const menu = document.querySelector<HTMLDetailsElement>("[data-lang-menu]");
  if (!menu) return;
  menu.addEventListener("click", (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>("[data-set-lang]");
    if (a) store.set("hyk-lang", a.dataset.setLang!);
  });
  document.addEventListener("click", (e) => {
    if (menu.open && !menu.contains(e.target as Node)) menu.open = false;
  });
  menu.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.open) {
      menu.open = false;
      menu.querySelector("summary")?.focus();
    }
  });
};

const openStatus = () => {
  const tile = document.querySelector<HTMLElement>("[data-open-status]");
  const rows = document.querySelectorAll<HTMLElement>(".hours li[data-day]");
  if (!tile && !rows.length) return;

  const render = () => {
    const s = getStatus(new Date(), site.hours, site.timeZone);
    if (tile) {
      const text = describeStatus(s, strings.status, strings.locale);
      tile.dataset.state = s.state;
      tile.querySelector("[data-open-label]")!.textContent = text.label;
      tile.querySelector("[data-open-detail]")!.textContent = text.detail;
    }
    rows.forEach((li) => {
      li.dataset.today = String(li.dataset.day === s.day);
    });
  };
  render();
  setInterval(render, 60_000);
};

const menuTools = () => {
  const input = document.querySelector<HTMLInputElement>("[data-q]");
  if (!input) return;

  const tools = document.querySelector<HTMLElement>("[data-tools]")!;
  const sections = [...document.querySelectorAll<HTMLElement>("[data-section]")];
  const chips = [...document.querySelectorAll<HTMLAnchorElement>("[data-chip]")];
  const rail = document.querySelector<HTMLElement>("[data-chips]")!;
  const count = document.querySelector<HTMLElement>("[data-count]")!;
  const empty = document.querySelector<HTMLElement>("[data-empty]")!;
  const total = Number(count.dataset.total);

  // Anchored sections need to clear however tall the sticky toolbar is on this screen.
  new ResizeObserver(() => root.style.setProperty("--tools-h", `${tools.offsetHeight}px`)).observe(tools);

  const filter = () => {
    const tokens = input.value.normalize("NFKC").toLowerCase().trim().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const section of sections) {
      let visible = 0;
      section.querySelectorAll<HTMLElement>(".item").forEach((li) => {
        const hit = tokens.every((t) => li.dataset.search!.includes(t));
        li.hidden = !hit;
        if (hit) visible++;
      });
      section.hidden = visible === 0;
      chips.find((c) => c.dataset.chip === section.dataset.section)!.hidden = visible === 0;
      shown += visible;
    }
    empty.hidden = shown > 0;
    count.textContent = tokens.length
      ? strings.menuCount.replace("{shown}", String(shown)).replace("{total}", String(total))
      : "";
  };
  input.addEventListener("input", filter);

  addEventListener("keydown", (e) => {
    const typing = (e.target as HTMLElement).closest("input, textarea");
    if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      input.focus();
    }
    if (e.key === "Escape" && document.activeElement === input) {
      input.value = "";
      filter();
      input.blur();
    }
  });

  const setCurrent = (key: string) => {
    chips.forEach((c) => {
      const on = c.dataset.chip === key;
      if (on) {
        c.setAttribute("aria-current", "true");
        rail.scrollTo({ left: c.offsetLeft - rail.clientWidth / 3, behavior: "smooth" });
      } else {
        c.removeAttribute("aria-current");
      }
    });
  };
  const io = new IntersectionObserver(
    (entries) => {
      const hit = entries.find((e) => e.isIntersecting);
      if (hit) setCurrent((hit.target as HTMLElement).dataset.section!);
    },
    { rootMargin: "-25% 0px -65% 0px" },
  );
  sections.forEach((s) => io.observe(s));
};

spotlight();
theme();
languageMenu();
openStatus();
menuTools();
