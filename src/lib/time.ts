export interface Hours {
  day: string;
  open: string;
  close: string;
}

export type StatusKind = "open" | "closing" | "opensToday" | "opensTomorrow";

export interface Status {
  state: "open" | "closed";
  kind: StatusKind;
  /** The time that matters for this status: closing time when open, opening time when closed. */
  time: string;
  /** Today's English weekday name in the restaurant's time zone. */
  day: string;
}

export interface StatusStrings {
  open: string;
  closing: string;
  closed: string;
  until: string;
  opensToday: string;
  opensTomorrow: string;
}

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** en: "23:00" -> "11 PM", "24:00" -> "12 AM". Chinese locales: 24-hour "23:00". */
export const fmt = (hhmm: string, locale = "en"): string => {
  const [h, m] = hhmm.split(":").map(Number);
  if (locale !== "en") return `${h}:${String(m).padStart(2, "0")}`;
  const hour = h % 12 === 0 ? 12 : h % 12;
  const suffix = h % 24 >= 12 ? "PM" : "AM";
  return m ? `${hour}:${String(m).padStart(2, "0")} ${suffix}` : `${hour} ${suffix}`;
};

const localParts = (now: Date, timeZone: string) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return { day: parts.weekday as string, minutes: (Number(parts.hour) % 24) * 60 + Number(parts.minute) };
};

/** Open/closed in the restaurant's own time zone, whatever the visitor's clock says. */
export const getStatus = (now: Date, hours: Hours[], timeZone: string): Status => {
  const { day, minutes } = localParts(now, timeZone);
  const i = Math.max(0, hours.findIndex((h) => h.day === day));
  const today = hours[i];
  const open = toMinutes(today.open);
  const close = toMinutes(today.close);

  if (minutes >= open && minutes < close) {
    return { state: "open", kind: close - minutes <= 60 ? "closing" : "open", time: today.close, day };
  }
  if (minutes < open) {
    return { state: "closed", kind: "opensToday", time: today.open, day };
  }
  return { state: "closed", kind: "opensTomorrow", time: hours[(i + 1) % hours.length].open, day };
};

const fillT = (s: string, t: string): string => s.replace("{t}", t);

/** Turn a status into the two lines shown on the tile. */
export const describeStatus = (s: Status, strings: StatusStrings, locale = "en") => {
  const time = fmt(s.time, locale);
  switch (s.kind) {
    case "open":
      return { label: strings.open, detail: fillT(strings.until, time) };
    case "closing":
      return { label: strings.closing, detail: fillT(strings.until, time) };
    case "opensToday":
      return { label: strings.closed, detail: fillT(strings.opensToday, time) };
    case "opensTomorrow":
      return { label: strings.closed, detail: fillT(strings.opensTomorrow, time) };
  }
};
