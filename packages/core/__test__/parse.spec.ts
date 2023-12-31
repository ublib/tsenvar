import { describe, it, expect } from "vitest";
import { parse } from "../src/parsing";

describe("parse", () => {
  it("should parse", () => {
    const result = parse("");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        envVars: [],
        span: { start: 0, end: 0 },
      });
    }
  });
});
