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

  it("normalizes rearranged first-order linear equations", () => {
    const result = solveOde("2*y + y' = 3");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.general).toContain("\\frac{3}{2}");
  });

  it("solves directly integrable first-order equations", () => {
    const result = solveOde("y' = 2");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.general).toContain("2x");
  });

  it("solves homogeneous second-order constant coefficient equations", () => {
    const result = solveOde("y'' + 2*y' + y = 0");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.general).toContain("C_1+C_2x");
  });

  it("solves the undamped harmonic oscillator shorthand", () => {
    const result = solveOde("y'' + 4*y = 0");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.general).toContain("\\cos(2x)");
  });

  it("solves rearranged and constant-forced second-order equations", () => {
    const rearranged = solveOde("4*y + y'' = 0");
    expect(rearranged.ok).toBe(true);
    if (rearranged.ok) expect(rearranged.general).toContain("\\cos(2x)");

    const forced = solveOde("y'' + 2*y' + 2*y = 4");
    expect(forced.ok).toBe(true);
    if (forced.ok) expect(forced.particular).toContain("2");
  });

  it("solves logistic growth", () => {
    const result = solveOde("y' = 0.8*y*(1-y/10)");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.general).toContain("\\frac{K}");
  });
});
