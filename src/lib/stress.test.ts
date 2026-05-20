import { describe, expect, it } from "vitest";
import { dot, gramSchmidtProcess, norm, type Vector } from "./vectorMath";
import { analyzeMatrix, determinant, inverse, multiplyMatrices, rank, type Matrix } from "./matrixMath";
import { solveOde } from "./odeSolvers";

const GRAM_SCHMIDT_CASES = 1999;
const MATRIX_CASES = 1999;
const ODE_CASES = 1997;
const TOTAL_GENERATED_CASES = GRAM_SCHMIDT_CASES + MATRIX_CASES + ODE_CASES;

describe("5.995 generated MathChem II invariant checks", () => {
  it("checks 1.999 Gram-Schmidt cases against orthonormality invariants", () => {
    let checked = 0;

    for (let seed = 1; seed <= GRAM_SCHMIDT_CASES; seed += 1) {
      const a = ((seed % 9) + 1) / 11;
      const b = (((seed * 3) % 9) + 1) / 13;
      const c = (((seed * 5) % 9) + 1) / 17;
      const vectors: Vector[] = [
        [1, a, 0],
        [0, 1, b],
        [c, 0, 1]
      ];

      const basis = gramSchmidtProcess(vectors).flatMap((step) => (step.normalized ? [step.normalized] : []));
      if (basis.length !== 3) throw new Error(`Gram-Schmidt case ${seed} did not produce a full basis.`);

      basis.forEach((vector, index) => {
        assertClose(norm(vector), 1, 1e-8, `case ${seed}, ||e_${index + 1}||`);
      });
      assertClose(dot(basis[0], basis[1]), 0, 1e-8, `case ${seed}, e_1 dot e_2`);
      assertClose(dot(basis[0], basis[2]), 0, 1e-8, `case ${seed}, e_1 dot e_3`);
      assertClose(dot(basis[1], basis[2]), 0, 1e-8, `case ${seed}, e_2 dot e_3`);
      checked += 1;
    }

    expect(checked).toBe(GRAM_SCHMIDT_CASES);
  });

  it("checks 1.999 matrix cases against determinant, inverse, rank and LGS invariants", () => {
    let checked = 0;

    for (let seed = 1; seed <= MATRIX_CASES; seed += 1) {
      const d = (seed % 8) + 1;
      const e = ((seed * 3) % 10) + 1;
      const p = ((seed * 5) % 7) - 3;
      const matrix: Matrix = [
        [d, p],
        [0, e]
      ];
      const rhs = [d + p, e];

      assertClose(determinant(matrix) ?? Number.NaN, d * e, 1e-9, `case ${seed}, det(A)`);
      if (rank(matrix) !== 2) throw new Error(`Matrix case ${seed} should have rank 2.`);

      const matrixInverse = inverse(matrix);
      if (!matrixInverse) throw new Error(`Matrix case ${seed} should be invertible.`);
      const identity = multiplyMatrices(matrix, matrixInverse);
      if (!identity) throw new Error(`Matrix case ${seed} inverse product failed.`);
      assertClose(identity[0][0], 1, 1e-8, `case ${seed}, I_11`);
      assertClose(identity[0][1], 0, 1e-8, `case ${seed}, I_12`);
      assertClose(identity[1][0], 0, 1e-8, `case ${seed}, I_21`);
      assertClose(identity[1][1], 1, 1e-8, `case ${seed}, I_22`);

      const analysis = analyzeMatrix(matrixInput(matrix), vectorInput(rhs));
      if (!analysis.ok) throw new Error(`Matrix case ${seed} was rejected: ${analysis.message}`);
      if (analysis.solutionStatus !== "unique" || !analysis.solution) throw new Error(`Matrix case ${seed} should have a unique solution.`);
      assertClose(analysis.solution[0], 1, 1e-8, `case ${seed}, x_1`);
      assertClose(analysis.solution[1], 1, 1e-8, `case ${seed}, x_2`);
      checked += 1;
    }

    expect(checked).toBe(MATRIX_CASES);
  });

  it("checks 1.997 DGL cases against numerical residual invariants", () => {
    let checked = 0;

    for (let seed = 1; seed <= ODE_CASES; seed += 1) {
      const family = seed % 7;

      if (family === 0) {
        const k = -(((seed % 8) + 1) / 10);
        const solution = requireOde(`y' = ${format(k)}*y`, seed);
        checkFirstOrderResidual(solution.plot.xs, solution.plot.ys, seed, (x, y, dy) => dy - k * y);
      } else if (family === 1) {
        const a = (seed % 4) + 1;
        const b = ((seed * 3) % 7) + 1;
        const solution = requireOde(`${a}*y + y' = ${b}`, seed);
        checkFirstOrderResidual(solution.plot.xs, solution.plot.ys, seed, (x, y, dy) => dy + a * y - b);
      } else if (family === 2) {
        const slope = ((seed % 9) - 4) || 2;
        const solution = requireOde(`y' = ${slope}`, seed);
        checkFirstOrderResidual(solution.plot.xs, solution.plot.ys, seed, (x, y, dy) => dy - slope);
      } else if (family === 3) {
        const r = ((seed % 7) + 2) / 10;
        const capacity = ((seed * 5) % 9) + 6;
        const solution = requireOde(`y' = ${format(r)}*y*(1-y/${capacity})`, seed);
        checkFirstOrderResidual(solution.plot.xs, solution.plot.ys, seed, (x, y, dy) => dy - r * y * (1 - y / capacity), 0.05);
      } else if (family === 4) {
        const omega = (seed % 3) + 1;
        const solution = requireOde(`y'' + ${omega * omega}*y = 0`, seed);
        checkSecondOrderResidual(solution.plot.xs, solution.plot.ys, seed, (x, y, dy, ddy) => ddy + omega * omega * y, 0.06);
      } else if (family === 5) {
        const a = (seed % 2) + 1;
        const b = ((seed * 2) % 3) + 1;
        const solution = requireOde(`y'' + ${a}*y' + ${b}*y = 0`, seed);
        checkSecondOrderResidual(solution.plot.xs, solution.plot.ys, seed, (x, y, dy, ddy) => ddy + a * dy + b * y, 0.08);
      } else {
        const a = (seed % 2) + 1;
        const b = ((seed * 3) % 4) + 2;
        const forcing = b * (((seed * 5) % 4) + 1);
        const solution = requireOde(`y'' + ${a}*y' + ${b}*y = ${forcing}`, seed);
        checkSecondOrderResidual(solution.plot.xs, solution.plot.ys, seed, (x, y, dy, ddy) => ddy + a * dy + b * y - forcing, 0.1);
      }

      checked += 1;
    }

    expect(checked).toBe(ODE_CASES);
    expect(GRAM_SCHMIDT_CASES + MATRIX_CASES + checked).toBe(TOTAL_GENERATED_CASES);
  });
});

function requireOde(input: string, seed: number) {
  const solution = solveOde(input);
  if (!solution.ok) throw new Error(`DGL case ${seed} was rejected: ${input}`);
  return solution;
}

function checkFirstOrderResidual(
  xs: number[],
  ys: number[],
  seed: number,
  residual: (x: number, y: number, dy: number) => number,
  tolerance = 0.04
) {
  for (const index of sampleIndexes(xs.length)) {
    const dy = firstDerivative(xs, ys, index);
    const value = residual(xs[index], ys[index], dy);
    assertScaledResidual(value, [ys[index], dy], tolerance, `DGL case ${seed}, first-order residual`);
  }
}

function checkSecondOrderResidual(
  xs: number[],
  ys: number[],
  seed: number,
  residual: (x: number, y: number, dy: number, ddy: number) => number,
  tolerance = 0.08
) {
  for (const index of sampleIndexes(xs.length)) {
    const dy = firstDerivative(xs, ys, index);
    const ddy = secondDerivative(xs, ys, index);
    const value = residual(xs[index], ys[index], dy, ddy);
    assertScaledResidual(value, [ys[index], dy, ddy], tolerance, `DGL case ${seed}, second-order residual`);
  }
}

function sampleIndexes(length: number) {
  return [0.22, 0.36, 0.52, 0.68, 0.84].map((fraction) => Math.min(length - 2, Math.max(1, Math.round(fraction * (length - 1)))));
}

function firstDerivative(xs: number[], ys: number[], index: number) {
  return (ys[index + 1] - ys[index - 1]) / (xs[index + 1] - xs[index - 1]);
}

function secondDerivative(xs: number[], ys: number[], index: number) {
  const h = xs[index] - xs[index - 1];
  return (ys[index + 1] - 2 * ys[index] + ys[index - 1]) / (h * h);
}

function assertScaledResidual(value: number, scaleValues: number[], tolerance: number, label: string) {
  const scale = 1 + scaleValues.reduce((sum, item) => sum + Math.abs(item), 0);
  if (!Number.isFinite(value) || Math.abs(value) > tolerance * scale) {
    throw new Error(`${label}: residual ${value} exceeded tolerance ${tolerance * scale}.`);
  }
}

function assertClose(actual: number, expected: number, tolerance: number, label: string) {
  if (!Number.isFinite(actual) || Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label}: expected ${expected}, got ${actual}.`);
  }
}

function matrixInput(matrix: Matrix) {
  return matrix.map((row) => row.join(",")).join("; ");
}

function vectorInput(vector: number[]) {
  return vector.join("; ");
}

function format(value: number) {
  return Number(value.toFixed(5)).toString();
}
