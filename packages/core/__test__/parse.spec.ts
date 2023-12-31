import { describe, it, expect } from "vitest";
import { parse } from "../src/parsing";

describe("parse", () => {
  it("should parse", () => {
    const result = parse("STAGE_NAME=development");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        envVars: [
          {
            id: {
              name: "STAGE_NAME",
              span: { start: 0, end: 10 },
            },
            value: {
              value: "development",
              span: { start: 11, end: 22 },
            },
            span: { start: 0, end: 22 },
          },
        ],
        span: { start: 0, end: 22 },
      });
    }
  });

  it("should parse with space left", () => {
    const result = parse(`STAGE_NAME
      =development`);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        envVars: [
          {
            id: {
              name: "STAGE_NAME",
              span: { start: 0, end: 10 },
            },
            value: {
              value: "development",
              span: { start: 18, end: 29 },
            },
            span: { start: 0, end: 29 },
          },
        ],
        span: { start: 0, end: 29 },
      });
    }
  });

  it("should parse with space right", () => {
    const result = parse(`STAGE_NAME
      =
      development`);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        envVars: [
          {
            id: {
              name: "STAGE_NAME",
              span: { start: 0, end: 10 },
            },
            value: {
              value: "development",
              span: { start: 25, end: 36 },
            },
            span: { start: 0, end: 36 },
          },
        ],
        span: { start: 0, end: 36 },
      });
    }
  });
});

describe("parse errors", () => {
  it("should error on missing =", () => {
    const result = parse("STAGE_NAME development");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual([{ error: 'Expected "=", got "d"', position: 11 }]);
    }
  });
});
