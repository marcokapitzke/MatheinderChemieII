import { describe, expect, it } from "vitest";
import { addMatrices, analyzeMatrix, determinant, inverse, multiplyMatrices, rank, scaleMatrix, subtractMatrices } from "./matrixMath";

describe("matrix math", () => {
  it("computes addition, multiplication, determinants and inverse", () => {
    expect(addMatrices([[1, 2]], [[3, 4]])).toEqual([[4, 6]]);
    expect(subtractMatrices([[1, 2]], [[3, 4]])).toEqual([[-2, -2]]);
    expect(scaleMatrix([[1, -2]], 3)).toEqual([[3, -6]]);
    expect(
      multiplyMatrices(
        [
          [1, 2],
          [3, 4]
        ],
        [
          [2, 0],
          [1, 2]
        ]
      )
    ).toEqual([
      [4, 4],
      [10, 8]
    ]);
    expect(determinant([[1, 2], [3, 4]])).toBeCloseTo(-2);
    expect(determinant([[6, 1, 1], [4, -2, 5], [2, 8, 7]])).toBeCloseTo(-306);
    expect(inverse([[4, 7], [2, 6]])?.[0][0]).toBeCloseTo(0.6);
  });

  it("computes rank", () => {
    expect(rank([[1, 2], [2, 4]])).toBe(1);
    expect(rank([[1, 0], [0, 1]])).toBe(2);
  });

  it("classifies linear systems", () => {
    const unique = analyzeMatrix("2,1; 1,3", "1; 2");
    expect(unique.ok && unique.solutionStatus).toBe("unique");
    const none = analyzeMatrix("1,2; 2,4", "3; 7");
    expect(none.ok && none.solutionStatus).toBe("none");
    const infinite = analyzeMatrix("1,2; 2,4", "3; 6");
    expect(infinite.ok && infinite.solutionStatus).toBe("infinite");
  });
});
