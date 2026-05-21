import { describe, expect, it } from "vitest";
import { analyzeLgs, augmentedMatrixToTex, fractionToTex } from "./lgsMath";

describe("lgs math", () => {
  it("solves a unique system with exact fractions", () => {
    const result = analyzeLgs("2, 1 | 1\n1, 3 | 2");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.solutionStatus).toBe("unique");
    expect(result.solution?.map((value) => fractionToTex(value))).toEqual(["\\frac{1}{5}", "\\frac{3}{5}"]);
    expect(result.rrefSteps.some((step) => step.operationTex.includes("Z_"))).toBe(true);
  });

  it("detects inconsistent and dependent systems", () => {
    const none = analyzeLgs("1, 2 | 3\n2, 4 | 7");
    expect(none.ok && none.solutionStatus).toBe("none");
    if (none.ok) expect(none.contradictionTex).toBe("0=1");

    const infinite = analyzeLgs("1, 2 | 3\n2, 4 | 6");
    expect(infinite.ok && infinite.solutionStatus).toBe("infinite");
    if (infinite.ok) expect(infinite.freeVariables).toEqual([1]);
  });

  it("renders augmented matrices with a separating bar", () => {
    const result = analyzeLgs("1/2, 1 | 3\n1, -1/3 | 1");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(augmentedMatrixToTex(result.original, result.unknowns)).toContain("{rr|r}");
    expect(result.solutionStatus).toBe("unique");
  });
});
