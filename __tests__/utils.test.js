import { describe, expect, test } from "vitest";
import {
  timeFormat,
  parseArray,
  formatArray,
  isEmpty,
  isAlmostEmpty,
  jobIsIncomplete,
  guessContentType,
} from "../src/utils";

describe("timeFormat", () => {
  test("formats datetime string as expected", () => {
    expect(timeFormat("2023-11-17T10:36:35.080614+00:00")).toBe("2023/11/17 10:36:35");
  });

  test("formats datetime without timezone offset", () => {
    expect(timeFormat("2024-01-05T08:00:00")).toBe("2024/01/05 08:00:00");
  });
});

describe("parseArray", () => {
  test("splits comma-separated string into trimmed array", () => {
    expect(parseArray("foo, bar, baz")).toEqual(["foo", "bar", "baz"]);
  });

  test("handles string without commas", () => {
    expect(parseArray("single")).toEqual(["single"]);
  });

  test("trims whitespace from each element", () => {
    expect(parseArray("  a ,  b  , c  ")).toEqual(["a", "b", "c"]);
  });
});

describe("formatArray", () => {
  test("joins array with comma and space", () => {
    expect(formatArray(["foo", "bar", "baz"])).toBe("foo, bar, baz");
  });

  test("returns string as-is for non-array value", () => {
    expect(formatArray("hello")).toBe("hello");
  });

  test("returns empty string for null/undefined", () => {
    expect(formatArray(null)).toBe("");
    expect(formatArray(undefined)).toBe("");
  });

  test("handles single-element array", () => {
    expect(formatArray(["only"])).toBe("only");
  });
});

describe("isEmpty", () => {
  test("returns true for empty object", () => {
    expect(isEmpty({})).toBe(true);
  });

  test("returns false for object with keys", () => {
    expect(isEmpty({ a: 1 })).toBe(false);
  });
});

describe("isAlmostEmpty", () => {
  test("returns true for empty object", () => {
    expect(isAlmostEmpty({})).toBe(true);
  });

  test("returns true for object with one key", () => {
    expect(isAlmostEmpty({ a: 1 })).toBe(true);
  });

  test("returns false for object with two or more keys", () => {
    expect(isAlmostEmpty({ a: 1, b: 2 })).toBe(false);
  });
});

describe("jobIsIncomplete", () => {
  test("returns true for submitted jobs", () => {
    expect(jobIsIncomplete({ status: "submitted" })).toBe(true);
  });

  test("returns true for running jobs", () => {
    expect(jobIsIncomplete({ status: "running" })).toBe(true);
  });

  test("returns true for validated jobs", () => {
    expect(jobIsIncomplete({ status: "validated" })).toBe(true);
  });

  test("returns false for finished jobs", () => {
    expect(jobIsIncomplete({ status: "finished" })).toBe(false);
  });

  test("returns false for error jobs", () => {
    expect(jobIsIncomplete({ status: "error" })).toBe(false);
  });
});

describe("guessContentType", () => {
  test("returns image/png for .png files", () => {
    expect(guessContentType("output/result.png")).toBe("image/png");
  });

  test("returns image/jpeg for .jpg files", () => {
    expect(guessContentType("photo.jpg")).toBe("image/jpeg");
  });

  test("returns image/jpeg for .jpeg files", () => {
    expect(guessContentType("photo.jpeg")).toBe("image/jpeg");
  });

  test("returns text/plain for .txt files", () => {
    expect(guessContentType("log.txt")).toBe("text/plain");
  });

  test("returns text/plain for .out files", () => {
    expect(guessContentType("run.out")).toBe("text/plain");
  });

  test("returns text/plain for .err files", () => {
    expect(guessContentType("run.err")).toBe("text/plain");
  });

  test("returns null for unknown extensions", () => {
    expect(guessContentType("data.hdf5")).toBeUndefined();
  });

  test("is case-insensitive", () => {
    expect(guessContentType("IMAGE.PNG")).toBe("image/png");
  });
});
