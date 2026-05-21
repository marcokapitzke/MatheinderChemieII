export type Matrix = number[][];
export type LinearSystemStatus = "unique" | "none" | "infinite";

export interface MatrixAnalysis {
  ok: true;
  matrix: Matrix;
  vector: number[];
  determinant: number | null;
  rank: number;
  trace: number | null;
  inverse: Matrix | null;
  transpose: Matrix;
  rref: Matrix;
  solutionStatus: LinearSystemStatus;
  solution: number[] | null;
  rowSteps: string[];
}

export interface MatrixOnlyAnalysis {
  ok: true;
  matrix: Matrix;
  determinant: number | null;
  rank: number;
  trace: number | null;
  inverse: Matrix | null;
  transpose: Matrix;
  rref: Matrix;
}

export interface MatrixFailure {
  ok: false;
  message: string;
}

const epsilon = 1e-10;

export function parseMatrix(input: string): Matrix | null {
  const rows = input
    .trim()
    .split(/;|\n/)
    .map((row) => row.trim())
    .filter(Boolean);

  if (!rows.length) return null;
  const matrix = rows.map((row) => row.split(/,|\s+/).filter(Boolean).map((value) => Number(value.replace(",", "."))));
  const width = matrix[0]?.length ?? 0;
  if (!width || matrix.some((row) => row.length !== width || row.some((value) => !Number.isFinite(value)))) return null;
  return matrix;
}

export function parseVector(input: string): number[] | null {
  const values = input
    .trim()
    .split(/;|,|\s+/)
    .filter(Boolean)
    .map((value) => Number(value.replace(",", ".")));
  if (!values.length || values.some((value) => !Number.isFinite(value))) return null;
  return values;
}

export function analyzeMatrix(matrixInput: string, vectorInput: string): MatrixAnalysis | MatrixFailure {
  const base = analyzeMatrixOnly(matrixInput);
  const vector = parseVector(vectorInput);
  if (!base.ok) return base;
  const matrix = base.matrix;
  if (!vector) return { ok: false, message: "Bitte gib die rechte Seite b als Spalte ein, z. B. 1; 2." };
  if (matrix.length !== vector.length) return { ok: false, message: "Die Zeilenzahl von A muss zur Länge von b passen." };

  const augmented = matrix.map((row, index) => [...row, vector[index]]);
  const elimination = rrefWithSteps(augmented);
  const rankA = rank(matrix);
  const rankAugmented = rank(elimination.matrix);
  const unknowns = matrix[0].length;
  const solutionStatus: LinearSystemStatus = rankAugmented > rankA ? "none" : rankA < unknowns ? "infinite" : "unique";
  const solution = solutionStatus === "unique" ? backSolutionFromRref(elimination.matrix, unknowns) : null;

  return {
    ok: true,
    matrix,
    vector,
    determinant: base.determinant,
    rank: base.rank,
    trace: base.trace,
    inverse: base.inverse,
    transpose: base.transpose,
    rref: base.rref,
    solutionStatus,
    solution,
    rowSteps: elimination.steps
  };
}

export function analyzeMatrixOnly(matrixInput: string): MatrixOnlyAnalysis | MatrixFailure {
  const matrix = parseMatrix(matrixInput);
  if (!matrix) return { ok: false, message: "Bitte gib eine Matrix zeilenweise ein, z. B. 2,1; 1,3." };
  if (matrix.length > 4 || matrix[0].length > 4) return { ok: false, message: "Der Matrixrechner unterstützt Matrizen bis 4x4. Größere LGS bis 6x6 findest du im LGS-Modul." };

  return {
    ok: true,
    matrix,
    determinant: matrix.length === matrix[0].length ? determinant(matrix) : null,
    rank: rank(matrix),
    trace: matrix.length === matrix[0].length ? matrix.reduce((sum, row, index) => sum + row[index], 0) : null,
    inverse: matrix.length === matrix[0].length ? inverse(matrix) : null,
    transpose: transpose(matrix),
    rref: rrefWithSteps(matrix).matrix
  };
}

export function addMatrices(a: Matrix, b: Matrix): Matrix | null {
  if (a.length !== b.length || a[0].length !== b[0].length) return null;
  return a.map((row, i) => row.map((value, j) => value + b[i][j]));
}

export function subtractMatrices(a: Matrix, b: Matrix): Matrix | null {
  if (a.length !== b.length || a[0].length !== b[0].length) return null;
  return a.map((row, i) => row.map((value, j) => value - b[i][j]));
}

export function scaleMatrix(matrix: Matrix, factor: number): Matrix {
  return matrix.map((row) => row.map((value) => clean(value * factor)));
}

export function multiplyMatrices(a: Matrix, b: Matrix): Matrix | null {
  if (a[0].length !== b.length) return null;
  return a.map((row) => b[0].map((_, column) => row.reduce((sum, value, index) => sum + value * b[index][column], 0)));
}

export function transpose(matrix: Matrix): Matrix {
  return matrix[0].map((_, column) => matrix.map((row) => row[column]));
}

export function determinant(matrix: Matrix): number | null {
  if (matrix.length !== matrix[0].length) return null;
  const n = matrix.length;
  const copy = matrix.map((row) => [...row]);
  let det = 1;
  let sign = 1;

  for (let column = 0; column < n; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < n; row += 1) {
      if (Math.abs(copy[row][column]) > Math.abs(copy[pivot][column])) pivot = row;
    }
    if (Math.abs(copy[pivot][column]) < epsilon) return 0;
    if (pivot !== column) {
      [copy[pivot], copy[column]] = [copy[column], copy[pivot]];
      sign *= -1;
    }
    const pivotValue = copy[column][column];
    det *= pivotValue;
    for (let row = column + 1; row < n; row += 1) {
      const factor = copy[row][column] / pivotValue;
      for (let j = column; j < n; j += 1) copy[row][j] -= factor * copy[column][j];
    }
  }

  return clean(det * sign);
}

export function rank(matrix: Matrix): number {
  return rrefWithSteps(matrix).matrix.filter((row) => row.some((value) => Math.abs(value) > 1e-8)).length;
}

export function inverse(matrix: Matrix): Matrix | null {
  if (matrix.length !== matrix[0].length) return null;
  const n = matrix.length;
  const augmented = matrix.map((row, index) => [...row, ...Array.from({ length: n }, (_, j) => (j === index ? 1 : 0))]);
  const reduced = rrefWithSteps(augmented).matrix;
  const left = reduced.map((row) => row.slice(0, n));
  const isIdentity = left.every((row, i) => row.every((value, j) => Math.abs(value - (i === j ? 1 : 0)) < 1e-8));
  if (!isIdentity) return null;
  return reduced.map((row) => row.slice(n).map(clean));
}

export function rrefWithSteps(input: Matrix): { matrix: Matrix; steps: string[] } {
  const matrix = input.map((row) => row.map(clean));
  const steps: string[] = [];
  let lead = 0;

  for (let row = 0; row < matrix.length; row += 1) {
    if (lead >= matrix[0].length) break;
    let pivot = row;
    while (Math.abs(matrix[pivot][lead]) < epsilon) {
      pivot += 1;
      if (pivot === matrix.length) {
        pivot = row;
        lead += 1;
        if (lead === matrix[0].length) return { matrix: cleanMatrix(matrix), steps };
      }
    }

    if (pivot !== row) {
      [matrix[pivot], matrix[row]] = [matrix[row], matrix[pivot]];
      steps.push(`Z_${row + 1} \\leftrightarrow Z_${pivot + 1}`);
    }

    const pivotValue = matrix[row][lead];
    if (Math.abs(pivotValue - 1) > epsilon) {
      for (let column = 0; column < matrix[row].length; column += 1) matrix[row][column] /= pivotValue;
      steps.push(`Z_${row + 1} \\leftarrow ${formatNumber(1 / pivotValue)}\\,Z_${row + 1}`);
    }

    for (let other = 0; other < matrix.length; other += 1) {
      if (other === row) continue;
      const factor = matrix[other][lead];
      if (Math.abs(factor) > epsilon) {
        for (let column = 0; column < matrix[other].length; column += 1) matrix[other][column] -= factor * matrix[row][column];
        steps.push(`Z_${other + 1} \\leftarrow Z_${other + 1} - ${formatNumber(factor)}\\,Z_${row + 1}`);
      }
    }

    lead += 1;
  }

  return { matrix: cleanMatrix(matrix), steps };
}

function backSolutionFromRref(augmentedRref: Matrix, unknowns: number): number[] {
  const solution = Array.from({ length: unknowns }, () => 0);
  augmentedRref.forEach((row) => {
    const pivot = row.findIndex((value, index) => index < unknowns && Math.abs(value) > 1e-8);
    if (pivot >= 0) solution[pivot] = clean(row[unknowns]);
  });
  return solution;
}

function cleanMatrix(matrix: Matrix) {
  return matrix.map((row) => row.map(clean));
}

function clean(value: number) {
  return Math.abs(value) < epsilon ? 0 : Number(value.toFixed(10));
}

export function formatNumber(value: number, precision = 5) {
  if (Math.abs(value) < 1e-10) return "0";
  return Number(value.toFixed(precision)).toString();
}

export function matrixToTex(matrix: Matrix) {
  return `\\begin{pmatrix}${matrix.map((row) => row.map((value) => formatNumber(value)).join(" & ")).join("\\\\")}\\end{pmatrix}`;
}

export function vectorToColumnTex(vector: number[]) {
  return `\\begin{pmatrix}${vector.map((value) => formatNumber(value)).join("\\\\")}\\end{pmatrix}`;
}
