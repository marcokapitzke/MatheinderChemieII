import { derivative } from "mathjs";
import { expressionToTex, makeScopedEvaluator, math, normalizeExpression, parseExpression } from "./mathCore";

export interface MultivarAnalysis {
  ok: true;
  expression: string;
  variables: string[];
  partials: Record<string, string>;
  gradientTex: string;
  hessianTex: string | null;
  criticalPoint: { x: number; y: number; type: string } | null;
  integral: number | null;
  surface: { xs: number[]; ys: number[]; z: number[][] };
  contour: { xs: number[]; ys: number[]; z: number[][] };
  steps: string[];
}

export interface MultivarFailure {
  ok: false;
  message: string;
}

export function analyzeMultivariable(input: string, min = -2.5, max = 2.5): MultivarAnalysis | MultivarFailure {
  try {
    const normalized = normalizeExpression(input);
    const variables = normalized.includes("z") ? ["x", "y", "z"] : ["x", "y"];
    const node = parseExpression(input);
    const evaluator = makeScopedEvaluator(input, variables);
    const partials: Record<string, string> = {};
    variables.forEach((variable) => {
      partials[variable] = derivative(node, variable).toString({ parenthesis: "keep", implicit: "hide" });
    });

    const secondX = derivative(partials.x, "x").toString({ parenthesis: "keep", implicit: "hide" });
    const secondY = derivative(partials.y, "y").toString({ parenthesis: "keep", implicit: "hide" });
    const mixed = derivative(partials.x, "y").toString({ parenthesis: "keep", implicit: "hide" });
    const hessianTex =
      variables.length === 2
        ? `\\begin{pmatrix}${expressionToTex(secondX)} & ${expressionToTex(mixed)}\\\\${expressionToTex(mixed)} & ${expressionToTex(secondY)}\\end{pmatrix}`
        : null;

    const surface = sampleSurface(evaluator, variables, min, max, 45);
    const criticalPoint = variables.length === 2 ? classifyOriginCriticalPoint(partials, secondX, secondY, mixed) : null;
    const integral = variables.length === 2 ? integrateRectangle(evaluator, min, max, min, max, 80) : null;

    return {
      ok: true,
      expression: normalized,
      variables,
      partials,
      gradientTex: `\\left(${variables.map((variable) => expressionToTex(partials[variable])).join(", ")}\\right)`,
      hessianTex,
      criticalPoint,
      integral,
      surface,
      contour: surface,
      steps: [
        `Funktion mit Variablen ${variables.join(", ")} erkannt.`,
        "Partielle Ableitungen werden symbolisch mit mathjs gebildet.",
        variables.length === 2
          ? "Das Doppelintegral über dem angezeigten Rechteck wird numerisch mit zusammengesetzter Trapezregel berechnet."
          : "Für f(x,y,z) wird ein z=0-Schnitt visualisiert; keine 4D-Darstellung."
      ]
    };
  } catch {
    return { ok: false, message: "Dieser Fall liegt außerhalb der unterstützten Standardfälle der mehrdimensionalen Analysis." };
  }
}

function sampleSurface(
  evaluator: (scope: Record<string, number>) => number | null,
  variables: string[],
  min: number,
  max: number,
  points: number
) {
  const xs = Array.from({ length: points }, (_, index) => min + ((max - min) * index) / (points - 1));
  const ys = [...xs];
  const z = ys.map((y) =>
    xs.map((x) => {
      const value = evaluator({ x, y, z: 0 });
      return value === null || !Number.isFinite(value) ? Number.NaN : value;
    })
  );
  return { xs, ys, z };
}

export function integrateRectangle(
  evaluator: (scope: Record<string, number>) => number | null,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  n = 80
) {
  let sum = 0;
  const dx = (xMax - xMin) / n;
  const dy = (yMax - yMin) / n;

  for (let i = 0; i <= n; i += 1) {
    for (let j = 0; j <= n; j += 1) {
      const x = xMin + i * dx;
      const y = yMin + j * dy;
      const value = evaluator({ x, y, z: 0 });
      if (value === null) return null;
      const weightX = i === 0 || i === n ? 0.5 : 1;
      const weightY = j === 0 || j === n ? 0.5 : 1;
      sum += value * weightX * weightY;
    }
  }

  return sum * dx * dy;
}

function classifyOriginCriticalPoint(
  partials: Record<string, string>,
  secondX: string,
  secondY: string,
  mixed: string
): { x: number; y: number; type: string } | null {
  try {
    const fx0 = Number(math.evaluate(normalizeExpression(partials.x), { x: 0, y: 0, pi: Math.PI, e: Math.E }));
    const fy0 = Number(math.evaluate(normalizeExpression(partials.y), { x: 0, y: 0, pi: Math.PI, e: Math.E }));
    if (Math.abs(fx0) > 1e-8 || Math.abs(fy0) > 1e-8) return null;
    const a = Number(math.evaluate(normalizeExpression(secondX), { x: 0, y: 0, pi: Math.PI, e: Math.E }));
    const b = Number(math.evaluate(normalizeExpression(mixed), { x: 0, y: 0, pi: Math.PI, e: Math.E }));
    const c = Number(math.evaluate(normalizeExpression(secondY), { x: 0, y: 0, pi: Math.PI, e: Math.E }));
    const determinant = a * c - b * b;
    if (determinant > 1e-8 && a > 0) return { x: 0, y: 0, type: "lokales Minimum" };
    if (determinant > 1e-8 && a < 0) return { x: 0, y: 0, type: "lokales Maximum" };
    if (determinant < -1e-8) return { x: 0, y: 0, type: "Sattelpunkt" };
    return { x: 0, y: 0, type: "nicht eindeutig klassifizierbar" };
  } catch {
    return null;
  }
}
