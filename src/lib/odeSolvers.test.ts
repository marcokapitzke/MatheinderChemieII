import { describe, expect, it } from "vitest";
import { solveOde } from "./odeSolvers";

describe("ODE solvers", () => {
  it("solves y' = ky", () => {
    const result = solveOde("y' = -0.5*y");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.general).toContain("exp");
  });

  it("solves y' + ay = b", () => {
    const result = solveOde("y' + 2*y = 3");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.particular).toContain("1.5");
  });

  it("solves homogeneous second-order constant coefficient equations", () => {
    const result = solveOde("y'' + 2*y' + y = 0");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.general).toContain("C_1+C_2x");
  });

  it("solves logistic growth", () => {
    const result = solveOde("y' = 0.8*y*(1-y/10)");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.general).toContain("\\frac{K}");
  });
});
