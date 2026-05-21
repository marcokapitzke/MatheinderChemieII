export type LinearSystemStatus = "unique" | "none" | "infinite";
export type LgsDisplayMode = "fraction" | "decimal";
export type LgsMethod = "ref" | "rref";

export interface Fraction {
  n: bigint;
  d: bigint;
}

export interface ParsedAugmentedSystem {
  ok: true;
  matrix: Fraction[][];
  equations: number;
  unknowns: number;
}

export interface LgsFailure {
  ok: false;
  message: string;
}

export interface LgsStep {
  title: string;
  text: string;
  operationTex: string;
  matrix: Fraction[][];
}

export interface LgsAnalysis {
  ok: true;
  original: Fraction[][];
  ref: Fraction[][];
  rref: Fraction[][];
  refSteps: LgsStep[];
  rrefSteps: LgsStep[];
  equations: number;
  unknowns: number;
  rankA: number;
  rankAugmented: number;
  pivotColumns: number[];
  freeVariables: number[];
  solutionStatus: LinearSystemStatus;
  solution: Fraction[] | null;
  solutionTex: string;
  contradictionTex: string | null;
}

const zero: Fraction = { n: 0n, d: 1n };
const one: Fraction = { n: 1n, d: 1n };

export function analyzeLgs(input: string): LgsAnalysis | LgsFailure {
  const parsed = parseAugmentedSystem(input);
  if (!parsed.ok) return parsed;

  const refRun = eliminate(parsed.matrix, false, parsed.unknowns);
  const rrefRun = eliminate(parsed.matrix, true, parsed.unknowns);
  const rankA = rankOf(rrefRun.matrix.map((row) => row.slice(0, parsed.unknowns)));
  const rankAugmented = rankOf(rrefRun.matrix);
  const solutionStatus: LinearSystemStatus = rankAugmented > rankA ? "none" : rankA < parsed.unknowns ? "infinite" : "unique";
  const pivotColumns = pivotColumnsFromRref(rrefRun.matrix, parsed.unknowns);
  const freeVariables = Array.from({ length: parsed.unknowns }, (_, index) => index).filter((index) => !pivotColumns.includes(index));
  const solution = solutionStatus === "unique" ? solutionFromRref(rrefRun.matrix, parsed.unknowns) : null;
  const contradictionTex = solutionStatus === "none" ? contradictionFromRref(rrefRun.matrix, parsed.unknowns) : null;

  return {
    ok: true,
    original: cloneMatrix(parsed.matrix),
    ref: refRun.matrix,
    rref: rrefRun.matrix,
    refSteps: refRun.steps,
    rrefSteps: rrefRun.steps,
    equations: parsed.equations,
    unknowns: parsed.unknowns,
    rankA,
    rankAugmented,
    pivotColumns,
    freeVariables,
    solutionStatus,
    solution,
    solutionTex: solutionTex(rrefRun.matrix, parsed.unknowns, solutionStatus, pivotColumns, freeVariables),
    contradictionTex
  };
}

export function parseAugmentedSystem(input: string): ParsedAugmentedSystem | LgsFailure {
  const rows = input
    .trim()
    .split(/;|\n/)
    .map((row) => row.trim())
    .filter(Boolean);

  if (!rows.length) {
    return { ok: false, message: "Bitte gib eine erweiterte Matrix ein, z. B. 2, 1 | 1; 1, 3 | 2." };
  }

  const matrix: Fraction[][] = [];
  let unknowns: number | null = null;

  for (const row of rows) {
    const parts = row.split("|");
    let tokens: string[];

    if (parts.length === 2) {
      const left = tokenize(parts[0]);
      const right = tokenize(parts[1]);
      if (right.length !== 1) {
        return { ok: false, message: "Rechts vom Trennstrich darf pro Zeile genau ein Wert stehen." };
      }
      tokens = [...left, right[0]];
    } else if (parts.length === 1) {
      tokens = tokenize(parts[0]);
      if (tokens.length < 2) {
        return { ok: false, message: "Jede Zeile braucht mindestens einen Koeffizienten und eine rechte Seite." };
      }
    } else {
      return { ok: false, message: "Bitte verwende pro Zeile höchstens einen Trennstrich: Koeffizienten | rechte Seite." };
    }

    if (unknowns === null) unknowns = tokens.length - 1;
    if (tokens.length !== unknowns + 1) {
      return { ok: false, message: "Alle Zeilen müssen dieselbe Anzahl an Koeffizienten besitzen." };
    }

    const parsedRow = tokens.map(parseFractionToken);
    if (parsedRow.some((value) => value === null)) {
      return { ok: false, message: "Bitte verwende Zahlen oder Brüche wie 3, -2.5 oder 1/3." };
    }
    matrix.push(parsedRow as Fraction[]);
  }

  if (matrix.length > 6 || (unknowns ?? 0) > 6) {
    return { ok: false, message: "Der LGS-Rechner unterstützt bewusst Systeme bis 6 Gleichungen und 6 Variablen." };
  }
  if (matrix.length < 2 || (unknowns ?? 0) < 2) {
    return { ok: false, message: "Bitte gib mindestens ein 2x2-System ein." };
  }

  return { ok: true, matrix, equations: matrix.length, unknowns: unknowns ?? 0 };
}

function eliminate(input: Fraction[][], reduceAbove: boolean, unknowns: number): { matrix: Fraction[][]; steps: LgsStep[] } {
  const matrix = cloneMatrix(input);
  const steps: LgsStep[] = [
    {
      title: "Ausgangsmatrix",
      text: "Das lineare Gleichungssystem wird als erweiterte Koeffizientenmatrix geschrieben.",
      operationTex: "(\\mathbf{A}\\mid\\vec b)",
      matrix: cloneMatrix(matrix)
    }
  ];
  const pivots: Array<{ row: number; column: number }> = [];
  let pivotRow = 0;

  for (let column = 0; column < unknowns && pivotRow < matrix.length; column += 1) {
    let pivot = pivotRow;
    while (pivot < matrix.length && isZero(matrix[pivot][column])) pivot += 1;
    if (pivot === matrix.length) continue;

    if (pivot !== pivotRow) {
      [matrix[pivot], matrix[pivotRow]] = [matrix[pivotRow], matrix[pivot]];
      steps.push({
        title: `Pivot in Spalte ${column + 1} vorbereiten`,
        text: "Eine Zeile mit von null verschiedenem Eintrag wird nach oben getauscht.",
        operationTex: `Z_{${pivotRow + 1}}\\leftrightarrow Z_{${pivot + 1}}`,
        matrix: cloneMatrix(matrix)
      });
    }

    const pivotValue = matrix[pivotRow][column];
    if (!equals(pivotValue, one)) {
      const factor = div(one, pivotValue);
      matrix[pivotRow] = matrix[pivotRow].map((value) => mul(value, factor));
      steps.push({
        title: `Pivot in Spalte ${column + 1} normieren`,
        text: "Die Pivotzeile wird so skaliert, dass der führende Eintrag gleich 1 ist.",
        operationTex: `Z_{${pivotRow + 1}}\\leftarrow ${fractionToTex(factor)}\\,Z_{${pivotRow + 1}}`,
        matrix: cloneMatrix(matrix)
      });
    }

    for (let row = pivotRow + 1; row < matrix.length; row += 1) {
      const factor = matrix[row][column];
      if (isZero(factor)) continue;
      matrix[row] = matrix[row].map((value, index) => sub(value, mul(factor, matrix[pivotRow][index])));
      steps.push({
        title: `Eintrag unter dem Pivot entfernen`,
        text: `Der Eintrag in Zeile ${row + 1}, Spalte ${column + 1} wird durch eine elementare Zeilenumformung zu null.`,
        operationTex: replacementTex(row + 1, pivotRow + 1, factor),
        matrix: cloneMatrix(matrix)
      });
    }

    pivots.push({ row: pivotRow, column });
    pivotRow += 1;
  }

  if (reduceAbove) {
    [...pivots].reverse().forEach((pivot) => {
      for (let row = pivot.row - 1; row >= 0; row -= 1) {
        const factor = matrix[row][pivot.column];
        if (isZero(factor)) continue;
        matrix[row] = matrix[row].map((value, index) => sub(value, mul(factor, matrix[pivot.row][index])));
        steps.push({
          title: `Eintrag über dem Pivot entfernen`,
          text: `Die Pivotspalte ${pivot.column + 1} wird oberhalb des Pivots ebenfalls reduziert.`,
          operationTex: replacementTex(row + 1, pivot.row + 1, factor),
          matrix: cloneMatrix(matrix)
        });
      }
    });
  }

  return { matrix, steps };
}

function replacementTex(targetRow: number, pivotRow: number, factor: Fraction) {
  if (factor.n > 0n) return `Z_{${targetRow}}\\leftarrow Z_{${targetRow}}-${fractionToTex(factor)}\\,Z_{${pivotRow}}`;
  return `Z_{${targetRow}}\\leftarrow Z_{${targetRow}}+${fractionToTex(absFraction(factor))}\\,Z_{${pivotRow}}`;
}

export function augmentedMatrixToTex(matrix: Fraction[][], unknowns: number, mode: LgsDisplayMode = "fraction") {
  const columns = `${"r".repeat(unknowns)}|r`;
  return `\\left(\\begin{array}{${columns}}${matrix
    .map((row) => row.map((value) => fractionToTex(value, mode)).join(" & "))
    .join("\\\\")}\\end{array}\\right)`;
}

export function coefficientMatrixToTex(matrix: Fraction[][], unknowns: number, mode: LgsDisplayMode = "fraction") {
  return `\\begin{pmatrix}${matrix
    .map((row) => row.slice(0, unknowns).map((value) => fractionToTex(value, mode)).join(" & "))
    .join("\\\\")}\\end{pmatrix}`;
}

export function rhsVectorToTex(matrix: Fraction[][], unknowns: number, mode: LgsDisplayMode = "fraction") {
  return `\\begin{pmatrix}${matrix.map((row) => fractionToTex(row[unknowns], mode)).join("\\\\")}\\end{pmatrix}`;
}

export function linearEquationsToTex(matrix: Fraction[][], unknowns: number, mode: LgsDisplayMode = "fraction") {
  const lines = matrix.map((row) => {
    const terms = row.slice(0, unknowns).map((coefficient, index) => coefficientTerm(coefficient, `x_{${index + 1}}`, mode)).filter(Boolean);
    return `${joinTerms(terms)}&=${fractionToTex(row[unknowns], mode)}`;
  });
  return `\\begin{aligned}${lines.join("\\\\")}\\end{aligned}`;
}

function solutionTex(matrix: Fraction[][], unknowns: number, status: LinearSystemStatus, pivotColumns: number[], freeVariables: number[]) {
  if (status === "none") return "\\text{keine Lösung}";

  if (status === "unique") {
    const solution = solutionFromRref(matrix, unknowns);
    return `\\vec{x}=\\begin{pmatrix}${solution.map((value) => fractionToTex(value)).join("\\\\")}\\end{pmatrix}`;
  }

  const parameterNames = freeVariables.map((_, index) => `t_{${index + 1}}`);
  const parameterByColumn = new Map(freeVariables.map((column, index) => [column, parameterNames[index]]));
  const lines: string[] = [];

  freeVariables.forEach((column, index) => {
    lines.push(`x_{${column + 1}}&=${parameterNames[index]}`);
  });

  pivotColumns.forEach((column) => {
    const row = matrix.find((candidate) => candidate.findIndex((value, index) => index < unknowns && !isZero(value)) === column);
    if (!row) return;
    const parts = [`${fractionToTex(row[unknowns])}`];
    freeVariables.forEach((freeColumn) => {
      const coefficient = row[freeColumn];
      if (isZero(coefficient)) return;
      const parameter = parameterByColumn.get(freeColumn);
      const signed = coefficient.n > 0n ? `-${fractionToTex(coefficient)}${parameter}` : `+${fractionToTex(absFraction(coefficient))}${parameter}`;
      parts.push(signed);
    });
    lines.push(`x_{${column + 1}}&=${parts.join("")}`);
  });

  const parameterText = parameterNames.length ? `,\\quad ${parameterNames.join(",")}\\in\\mathbb{R}` : "";
  return `\\begin{aligned}${lines.sort().join("\\\\")}\\end{aligned}${parameterText}`;
}

function contradictionFromRref(matrix: Fraction[][], unknowns: number) {
  const row = matrix.find((candidate) => candidate.slice(0, unknowns).every(isZero) && !isZero(candidate[unknowns]));
  return row ? `0=${fractionToTex(row[unknowns])}` : null;
}

function solutionFromRref(matrix: Fraction[][], unknowns: number) {
  const solution = Array.from({ length: unknowns }, () => zero);
  matrix.forEach((row) => {
    const pivot = row.findIndex((value, index) => index < unknowns && !isZero(value));
    if (pivot >= 0 && pivot < unknowns) solution[pivot] = row[unknowns];
  });
  return solution;
}

function pivotColumnsFromRref(matrix: Fraction[][], unknowns: number) {
  return matrix
    .map((row) => row.findIndex((value, index) => index < unknowns && !isZero(value)))
    .filter((index) => index >= 0);
}

function rankOf(matrix: Fraction[][]) {
  return matrix.filter((row) => row.some((value) => !isZero(value))).length;
}

function coefficientTerm(coefficient: Fraction, variable: string, mode: LgsDisplayMode) {
  if (isZero(coefficient)) return "";
  if (equals(coefficient, one)) return `+${variable}`;
  if (equals(coefficient, neg(one))) return `-${variable}`;
  return `${coefficient.n > 0n ? "+" : ""}${fractionToTex(coefficient, mode)}${variable}`;
}

function joinTerms(terms: string[]) {
  const joined = terms.join("");
  if (!joined) return "0";
  return joined.startsWith("+") ? joined.slice(1) : joined;
}

export function fractionToTex(value: Fraction, mode: LgsDisplayMode = "fraction") {
  if (mode === "decimal") return fractionToDecimal(value);
  if (value.d === 1n) return value.n.toString();
  const sign = value.n < 0n ? "-" : "";
  return `${sign}\\frac{${absBigInt(value.n)}}{${value.d}}`;
}

export function fractionToNumber(value: Fraction) {
  return Number(value.n) / Number(value.d);
}

function fractionToDecimal(value: Fraction, precision = 5) {
  const number = Number(value.n) / Number(value.d);
  if (Math.abs(number) < 1e-10) return "0";
  return Number(number.toFixed(precision)).toString();
}

function tokenize(row: string) {
  return row.split(/,|\s+/).map((token) => token.trim()).filter(Boolean);
}

function parseFractionToken(raw: string): Fraction | null {
  const token = raw.trim().replace("−", "-");
  if (!token) return null;

  if (/^[+-]?\d+\/[+-]?\d+$/.test(token)) {
    const [n, d] = token.split("/").map((part) => BigInt(part));
    if (d === 0n) return null;
    return fraction(n, d);
  }

  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(token)) {
    if (!token.includes(".")) return fraction(BigInt(token), 1n);
    const sign = token.startsWith("-") ? -1n : 1n;
    const normalized = token.replace(/^[+-]/, "");
    const [whole, decimals] = normalized.split(".");
    const denominator = 10n ** BigInt(decimals.length);
    const numerator = BigInt(whole || "0") * denominator + BigInt(decimals);
    return fraction(sign * numerator, denominator);
  }

  return null;
}

function fraction(n: bigint, d: bigint): Fraction {
  if (d === 0n) throw new Error("Division by zero");
  const sign = d < 0n ? -1n : 1n;
  const gcdValue = gcd(absBigInt(n), absBigInt(d));
  return { n: (sign * n) / gcdValue, d: absBigInt(d) / gcdValue };
}

function add(a: Fraction, b: Fraction) {
  return fraction(a.n * b.d + b.n * a.d, a.d * b.d);
}

function sub(a: Fraction, b: Fraction) {
  return add(a, neg(b));
}

function mul(a: Fraction, b: Fraction) {
  return fraction(a.n * b.n, a.d * b.d);
}

function div(a: Fraction, b: Fraction) {
  if (b.n === 0n) throw new Error("Division by zero");
  return fraction(a.n * b.d, a.d * b.n);
}

function neg(value: Fraction) {
  return { n: -value.n, d: value.d };
}

function absFraction(value: Fraction) {
  return { n: absBigInt(value.n), d: value.d };
}

function isZero(value: Fraction) {
  return value.n === 0n;
}

function equals(a: Fraction, b: Fraction) {
  return a.n === b.n && a.d === b.d;
}

function cloneMatrix(matrix: Fraction[][]) {
  return matrix.map((row) => row.map((value) => ({ ...value })));
}

function gcd(a: bigint, b: bigint): bigint {
  let x = a;
  let y = b;
  while (y !== 0n) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1n;
}

function absBigInt(value: bigint) {
  return value < 0n ? -value : value;
}
