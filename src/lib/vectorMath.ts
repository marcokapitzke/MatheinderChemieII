export type Vector = number[];

export interface ParsedVectors {
  ok: true;
  vectors: Vector[];
}

export interface MathFailure {
  ok: false;
  message: string;
}

export interface GramSchmidtStep {
  index: number;
  original: Vector;
  projections: Array<{ onto: Vector; coefficient: number; projection: Vector }>;
  orthogonal: Vector;
  normalized: Vector | null;
  skipped: boolean;
}

export interface VectorAnalysis {
  ok: true;
  vectors: Vector[];
  dimension: number;
  sum: Vector | null;
  difference: Vector | null;
  dot: number | null;
  cross: Vector | null;
  norms: number[];
  unitVectors: Vector[];
  angle: number | null;
  projection: Vector | null;
  independent: boolean;
  gramSchmidt: GramSchmidtStep[];
  basis: Vector[];
  steps: string[];
}

const epsilon = 1e-9;

export function parseVectors(input: string): ParsedVectors | MathFailure {
  const matches = input.match(/\(([^()]+)\)/g);
  if (!matches?.length) {
    return { ok: false, message: "Bitte gib Vektoren in der Form (1, 2) oder v1 = (1, 2, 3) ein." };
  }

  const vectors = matches.map((match) =>
    match
      .slice(1, -1)
      .split(/[,;]/)
      .map((part) => Number(part.trim().replace(",", ".")))
  );

  if (vectors.some((vector) => vector.some((value) => !Number.isFinite(value)))) {
    return { ok: false, message: "Mindestens eine Vektorkomponente ist keine Zahl." };
  }

  const dimension = vectors[0]?.length ?? 0;
  if (![2, 3].includes(dimension) || vectors.some((vector) => vector.length !== dimension)) {
    return { ok: false, message: "Bitte verwende ausschließlich 2D- oder ausschließlich 3D-Vektoren." };
  }

  return { ok: true, vectors };
}

export function analyzeVectors(input: string): VectorAnalysis | MathFailure {
  const parsed = parseVectors(input);
  if (!parsed.ok) return parsed;

  const vectors = parsed.vectors;
  const dimension = vectors[0].length;
  const first = vectors[0];
  const second = vectors[1] ?? null;
  const norms = vectors.map(norm);
  const unitVectors = vectors.map((vector) => scale(vector, 1 / Math.max(norm(vector), epsilon)));
  const gramSchmidt = gramSchmidtProcess(vectors);
  const basis = gramSchmidt.flatMap((step) => (step.normalized ? [step.normalized] : []));
  const dotValue = second ? dot(first, second) : null;
  const angleValue = second ? angle(first, second) : null;
  const projection = second ? project(first, second) : null;
  const crossValue = second && dimension === 3 ? cross(first, second) : null;
  const independent = basis.length === vectors.length;

  return {
    ok: true,
    vectors,
    dimension,
    sum: second ? add(first, second) : null,
    difference: second ? subtract(first, second) : null,
    dot: dotValue,
    cross: crossValue,
    norms,
    unitVectors,
    angle: angleValue,
    projection,
    independent,
    gramSchmidt,
    basis,
    steps: [
      `${vectors.length} Vektor(en) in ${dimension}D erkannt.`,
      second ? "Skalarprodukt, Winkel und Projektion wurden für v1 und v2 berechnet." : "Für Winkel und Projektion werden mindestens zwei Vektoren benötigt.",
      independent ? "Gram-Schmidt liefert eine Orthonormalbasis." : "Mindestens ein Vektor ist linear abhängig und wird im Gram-Schmidt-Verfahren übersprungen."
    ]
  };
}

export function add(a: Vector, b: Vector) {
  return a.map((value, index) => value + b[index]);
}

export function subtract(a: Vector, b: Vector) {
  return a.map((value, index) => value - b[index]);
}

export function scale(vector: Vector, factor: number) {
  return vector.map((value) => value * factor);
}

export function dot(a: Vector, b: Vector) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

export function cross(a: Vector, b: Vector): Vector {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

export function norm(vector: Vector) {
  return Math.sqrt(dot(vector, vector));
}

export function angle(a: Vector, b: Vector) {
  const denominator = norm(a) * norm(b);
  if (denominator < epsilon) return null;
  const cosine = Math.min(1, Math.max(-1, dot(a, b) / denominator));
  return Math.acos(cosine);
}

export function project(vector: Vector, onto: Vector) {
  const denominator = dot(onto, onto);
  if (Math.abs(denominator) < epsilon) return null;
  return scale(onto, dot(vector, onto) / denominator);
}

export function gramSchmidtProcess(vectors: Vector[]): GramSchmidtStep[] {
  const orthogonalBasis: Vector[] = [];
  const steps: GramSchmidtStep[] = [];

  vectors.forEach((original, index) => {
    let orthogonal = [...original];
    const projections: GramSchmidtStep["projections"] = [];

    orthogonalBasis.forEach((onto) => {
      const denominator = dot(onto, onto);
      const coefficient = denominator < epsilon ? 0 : dot(original, onto) / denominator;
      const projection = scale(onto, coefficient);
      projections.push({ onto, coefficient, projection });
      orthogonal = subtract(orthogonal, projection);
    });

    const orthogonalNorm = norm(orthogonal);
    const skipped = orthogonalNorm < 1e-8;
    const normalized = skipped ? null : scale(orthogonal, 1 / orthogonalNorm);
    if (!skipped) orthogonalBasis.push(orthogonal);

    steps.push({ index: index + 1, original, projections, orthogonal, normalized, skipped });
  });

  return steps;
}

export function formatVector(vector: Vector, precision = 5) {
  return `\\left(${vector.map((value) => formatNumber(value, precision)).join(", ")}\\right)`;
}

export function formatNumber(value: number, precision = 5) {
  if (Math.abs(value) < 1e-10) return "0";
  return Number(value.toFixed(precision)).toString();
}
