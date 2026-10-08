import { test } from "node:test";
import assert from "node:assert/strict";
import { detectLocale } from "./lang.ts";

const cases: [string[], string][] = [
  [[], "en"],
  [["en-US"], "en"],
  [["en-CA", "fr-CA"], "en"],
  [["fr-FR"], "en"],
  [["zh-TW"], "zh-Hant"],
  [["zh-HK"], "zh-Hant"],
  [["zh-MO"], "zh-Hant"],
  [["zh-Hant"], "zh-Hant"],
  [["zh-Hant-HK"], "zh-Hant"],
  [["zh-CN"], "zh-Hans"],
  [["zh-SG"], "zh-Hans"],
  [["zh-Hans"], "zh-Hans"],
  [["zh-Hans-HK"], "zh-Hans"],
  [["zh"], "zh-Hans"],
  [["yue"], "zh-Hant"],
  [["yue-HK"], "zh-Hant"],
  [["zh_TW"], "zh-Hant"],
  [["ZH-tw"], "zh-Hant"],
  // the browser's own order decides
  [["en-US", "zh-TW"], "en"],
  [["zh-TW", "en-US"], "zh-Hant"],
  [["zh-CN", "en"], "zh-Hans"],
  [["fr", "zh-TW"], "zh-Hant"],
  [["de", "es"], "en"],
];

for (const [input, expected] of cases) {
  test(`detectLocale(${JSON.stringify(input)}) -> ${expected}`, () => {
    assert.equal(detectLocale(input), expected);
  });
}
