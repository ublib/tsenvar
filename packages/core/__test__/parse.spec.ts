import { describe, it, expect } from "vitest";
import { parse } from "../src/parsing";

describe("parse", () => {
  it("should parse", () => {
    const result = parse("STAGE_NAME=");
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
              value: "",
              span: { start: 10, end: 10 },
            },
            span: { start: 0, end: 11 },
          },
        ],
        span: { start: 0, end: 11 },
      });
    }
  });

  it("should parse with space", () => {
    const result = parse(`STAGE_NAME
      =`);
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
              value: "",
              span: { start: 10, end: 10 },
            },
            span: { start: 0, end: 18 },
          },
        ],
        span: { start: 0, end: 18 },
      });
    }
  });
});
