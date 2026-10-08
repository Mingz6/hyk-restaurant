import { test } from "node:test";
import assert from "node:assert/strict";
import site from "../data/site.json" with { type: "json" };
import { describeStatus, fmt, getStatus } from "./time.ts";
import { en, zhHant } from "../i18n/strings.ts";

const at = (iso: string) => getStatus(new Date(iso), site.hours, site.timeZone);
const enStrings = {
  open: en["status.open"],
  closing: en["status.closing"],
  closed: en["status.closed"],
  until: en["status.until"],
  opensToday: en["status.opensToday"],
  opensTomorrow: en["status.opensTomorrow"],
};

test("fmt formats 24h strings", () => {
  assert.equal(fmt("11:00"), "11 AM");
  assert.equal(fmt("23:00"), "11 PM");
  assert.equal(fmt("24:00"), "12 AM");
  assert.equal(fmt("12:30"), "12:30 PM");
  assert.equal(fmt("00:15"), "12:15 AM");
  assert.equal(fmt("23:00", "zh-Hant"), "23:00");
  assert.equal(fmt("11:30", "zh-Hans"), "11:30");
});

test("open mid-afternoon, judged in Vancouver time not the visitor's", () => {
  // 20:00 UTC on Thu 8 Oct 2026 = 13:00 PDT
  const s = at("2026-10-08T20:00:00Z");
  assert.deepEqual([s.state, s.kind, s.time, s.day], ["open", "open", "23:00", "Thursday"]);
  assert.deepEqual(describeStatus(s, enStrings), { label: "Open now", detail: "Until 11 PM" });
});

test("closing soon within the last hour", () => {
  const s = at("2026-10-09T05:30:00Z"); // Thu 22:30 PDT
  assert.deepEqual([s.state, s.kind], ["open", "closing"]);
  assert.equal(describeStatus(s, enStrings).label, "Closing soon");
});

test("closed after hours points to tomorrow", () => {
  const s = at("2026-10-09T06:30:00Z"); // Thu 23:30 PDT
  assert.deepEqual([s.state, s.kind, s.time], ["closed", "opensTomorrow", "11:00"]);
  assert.equal(describeStatus(s, enStrings).detail, "Opens tomorrow at 11 AM");
});

test("closed before opening points to today", () => {
  const s = at("2026-10-08T16:00:00Z"); // Thu 09:00 PDT
  assert.deepEqual([s.state, s.kind], ["closed", "opensToday"]);
  assert.equal(describeStatus(s, enStrings).detail, "Opens today at 11 AM");
});

test("Friday runs to midnight", () => {
  const s = at("2026-10-10T06:30:00Z"); // Fri 23:30 PDT
  assert.deepEqual([s.state, s.kind, s.time], ["open", "closing", "24:00"]);
  assert.equal(describeStatus(s, enStrings).detail, "Until 12 AM");
});

test("exact local midnight is closed and opens today", () => {
  const s = at("2026-10-10T07:00:00Z"); // Sat 00:00 PDT
  assert.deepEqual([s.state, s.day, s.kind], ["closed", "Saturday", "opensToday"]);
});

test("after close on the last day wraps to the first day", () => {
  const hours = site.hours.map((h) => (h.day === "Saturday" ? { ...h, close: "23:00" } : h));
  const s = getStatus(new Date("2026-10-11T06:30:00Z"), hours, site.timeZone); // Sat 23:30 PDT
  assert.deepEqual([s.state, s.kind], ["closed", "opensTomorrow"]);
});

test("Chinese strings render with 24h times", () => {
  const zh = {
    open: zhHant["status.open"],
    closing: zhHant["status.closing"],
    closed: zhHant["status.closed"],
    until: zhHant["status.until"],
    opensToday: zhHant["status.opensToday"],
    opensTomorrow: zhHant["status.opensTomorrow"],
  };
  const s = at("2026-10-08T20:00:00Z");
  assert.deepEqual(describeStatus(s, zh, "zh-Hant"), { label: "營業中", detail: "營業至 23:00" });
});
