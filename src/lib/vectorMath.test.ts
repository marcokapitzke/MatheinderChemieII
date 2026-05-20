import { describe, expect, it } from "vitest";
import { analyzeVectors, cross, dot, gramSchmidtProcess, norm, project } from "./vectorMath";

describe("vector math", () => {
  it("computes norm, dot product, cross product, angle and projection", () => {
    expect(norm([3, 4])).toBeCloseTo(5);
    expect(dot([1, 2, 3], [4, 5, 6])).toBeCloseTo(32);
    expect(cross([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
    expect(project([2, 2], [1, 0])).toEqual([2, 0]);
  });

  it("orthonormalizes independent vectors", () => {
    const result = gramSchmidtProcess([
      [1, 1, 0],
      [1, 0, 1],
      [0, 1, 1]
    ]);
    const basis = result.flatMap((step) => (step.normalized ? [step.normalized] : []));
    expect(basis).toHaveLength(3);
    expect(dot(basis[0], basis[1])).toBeCloseTo(0, 8);
    expect(norm(basis[2])).toBeCloseTo(1, 8);
  });

  it("detects dependent vectors in Gram-Schmidt", () => {
    const result = analyzeVectors("v1=(1,2,0), v2=(2,4,0)");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.independent).toBe(false);
  });
});
