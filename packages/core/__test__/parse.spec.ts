import { describe, it, expect } from "vitest";
import { parse } from "../src/parsing";

describe("success to parse", () => {
  it("basic single parsing", () => {
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
    const result = parse(`STAGE_NAME=
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
              span: { start: 18, end: 29 },
            },
            span: { start: 0, end: 29 },
          },
        ],
        span: { start: 0, end: 29 },
      });
    }
  });

  it("should parse with space left and right", () => {
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
              span: { start: 22, end: 33 },
            },
            span: { start: 0, end: 33 },
          },
        ],
        span: { start: 0, end: 33 },
      });
    }
  });

  it("should parse with double quat value", () => {
    const result = parse(`STAGE_NAME="development"`);
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
              span: { start: 12, end: 23 },
            },
            span: { start: 0, end: 24 },
          },
        ],
        span: { start: 0, end: 24 },
      });
    }
  });

  it("should parse with double quat value with newlines", () => {
    const result = parse(`STAGE_NAME="
    development
    "`);
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
              value: `
    development
    `,
              span: { start: 12, end: 33 },
            },
            span: { start: 0, end: 34 },
          },
        ],
        span: { start: 0, end: 34 },
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

  it("closing double quat not exist", () => {
    const result = parse(`STAGE_NAME="development`);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual([
        {
          error: `Expected '"', got "\0"`,
          position: 23,
        },
      ]);
    }
  });
});
