import { test } from "node:test";
import assert from "node:assert/strict";
import { en, zhHant } from "./strings.ts";
import menu from "../data/menu.json" with { type: "json" };

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test("every English key has a Traditional Chinese string and vice versa", () => {
  assert.deepEqual(Object.keys(zhHant).sort(), Object.keys(en).sort());
});

test("placeholders match between languages", () => {
  for (const key of Object.keys(en) as (keyof typeof en)[]) {
    assert.deepEqual(placeholders(zhHant[key]), placeholders(en[key]), key);
  }
});

test("every menu section has a blurb and every unit/size/note key has a string", () => {
  const keys = new Set(Object.keys(en));
  for (const s of menu.sections) {
    assert.ok(keys.has(`blurb.${s.key}`), `blurb.${s.key}`);
    for (const i of s.items as { unit?: string; noteKey?: string; sizes?: { label: string }[] }[]) {
      if (i.unit) assert.ok(keys.has(`unit.${i.unit}`), `unit.${i.unit}`);
      if (i.noteKey) assert.ok(keys.has(i.noteKey), i.noteKey);
      for (const z of i.sizes ?? []) assert.ok(keys.has(`size.${z.label}`), `size.${z.label}`);
    }
  }
});

test("no menu item is missing a Chinese or English name", () => {
  for (const s of menu.sections) {
    for (const i of s.items) {
      assert.ok(i.en.trim() && i.zh.trim(), `${s.key} #${i.no}`);
    }
  }
});
