import { describe, expect, it } from "vitest";
import { analyzeMultivariable } from "./multivariable";

describe("multivariable analysis", () => {
  it("computes partial derivatives, gradient and Hessian for a paraboloid", () => {
    const result = analyzeMultivariable("x^2 + y^2", -1, 1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.partials.x).toContain("2 * x");
    expect(result.partials.y).toContain("2 * y");
    expect(result.hessianTex).toContain("2");
    expect(result.criticalPoint?.type).toBe("lokales Minimum");
  });

  it("approximates a rectangle double integral", () => {
    const result = analyzeMultivariable("x + y", 0, 1);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.integral).toBeCloseTo(1, 2);
  });

  it("computes a standard directional derivative at the origin", () => {
    const result = analyzeMultivariable("x^2 + y", -1, 1);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.directionalDerivative?.value).toBeCloseTo(1 / Math.sqrt(2), 8);
  });
});
