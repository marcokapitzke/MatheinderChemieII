import type { MathNode } from "mathjs";
import { math } from "./mathCore";

export interface OdeSolution {
  ok: true;
  type: string;
  general: string;
  particular: string | null;
  steps: Array<{ title: string; text: string; tex?: string }>;
  plot: { xs: number[]; ys: number[] };
}

export interface OdeFailure {
  ok: false;
  message: string;
}

const defaultInitial = { x0: 0, y0: 1 };
const epsilon = 1e-10;

export function solveOde(input: string): OdeSolution | OdeFailure {
  const normalized = input.replace(/\s+/g, "").replace(/−/g, "-");

  const logistic = normalized.match(/^y'=([+-]?\d*\.?\d+)\*?y\*\(1-y\/([+-]?\d*\.?\d+)\)$/);
  if (logistic) return logisticSolution(Number(logistic[1]), Number(logistic[2]));

  const coefficients = equationCoefficients(normalized);
  if (coefficients) {
    if (nearZero(coefficients.ypp) && !nearZero(coefficients.yp)) {
      const a = coefficients.y / coefficients.yp;
      const b = -coefficients.constant / coefficients.yp;
      if (nearZero(a)) return constantSlopeSolution(b);
      if (nearZero(b)) return exponentialSolution(-a);
      return linearConstantSolution(a, b);
    }

    if (!nearZero(coefficients.ypp)) {
      const a = coefficients.yp / coefficients.ypp;
      const b = coefficients.y / coefficients.ypp;
      const forcing = -coefficients.constant / coefficients.ypp;
      if (nearZero(forcing)) return secondOrderHomogeneous(a, b);
      return secondOrderConstantForcing(a, b, forcing);
    }
  }

  if (normalized === "y''+y=sin(x)") return resonantOscillator();
  if (normalized === "y''+y=cos(x)") return resonantCosineOscillator();

  return { ok: false, message: "Diese Differentialgleichung liegt außerhalb der unterstützten Standardfälle." };
}

function exponentialSolution(k: number): OdeSolution {
  const xs = range(-2, 6, 240);
  const ys = xs.map((x) => Math.exp(k * (x - defaultInitial.x0)) * defaultInitial.y0);
  return {
    ok: true,
    type: "Exponentielles Wachstum/Zerfall",
    general: `y(x)=C\\,\\operatorname{exp}(${format(k)}x)`,
    particular: `y(0)=1\\Rightarrow y(x)=\\operatorname{exp}(${format(k)}x)`,
    plot: { xs, ys },
    steps: [
      { title: "Struktur erkennen", text: "Die rechte Seite ist proportional zu y.", tex: `y'=${format(k)}y` },
      { title: "Trennung", text: "Alle y-Terme werden auf eine Seite gebracht.", tex: `\\frac{1}{y}\\,\\mathrm{d}y=${format(k)}\\,\\mathrm{d}x` },
      { title: "Integration", text: "Nach Integration und Exponentiation entsteht die Standardlösung.", tex: `y=C\\,\\operatorname{exp}(${format(k)}x)` }
    ]
  };
}

function constantSlopeSolution(slope: number): OdeSolution {
  const xs = range(-2, 6, 240);
  const ys = xs.map((x) => defaultInitial.y0 + slope * (x - defaultInitial.x0));
  return {
    ok: true,
    type: "Direkt integrierbare DGL erster Ordnung",
    general: `y(x)=C+${format(slope)}x`,
    particular: `y(0)=1\\Rightarrow y(x)=1+${format(slope)}x`,
    plot: { xs, ys },
    steps: [
      { title: "Standardform", text: "Die Gleichung wird zu y'=c umgestellt.", tex: `y'=${format(slope)}` },
      { title: "Integration", text: "Eine konstante Ableitung liefert eine lineare Funktion.", tex: `y=C+${format(slope)}x` }
    ]
  };
}

function linearConstantSolution(a: number, b: number): OdeSolution | OdeFailure {
  if (Math.abs(a) < 1e-10) return constantSlopeSolution(b);
  const steady = b / a;
  const c = defaultInitial.y0 - steady;
  const xs = range(0, 8, 240);
  const ys = xs.map((x) => steady + c * Math.exp(-a * x));
  return {
    ok: true,
    type: "Lineare DGL erster Ordnung mit konstanten Koeffizienten",
    general: `y(x)=\\frac{${format(b)}}{${format(a)}}+C\\,\\operatorname{exp}(-${format(a)}x)`,
    particular: `y(0)=1\\Rightarrow y(x)=${format(steady)}+${format(c)}\\operatorname{exp}(-${format(a)}x)`,
    plot: { xs, ys },
    steps: [
      { title: "Standardform", text: "Die Gleichung hat konstante Koeffizienten.", tex: `y'+${format(a)}y=${format(b)}` },
      { title: "Stationäre Lösung", text: "Für y'=0 folgt der stationäre Wert.", tex: `y_\\infty=\\frac{${format(b)}}{${format(a)}}=${format(steady)}` },
      { title: "Homogener Anteil", text: "Die Abweichung vom stationären Wert zerfällt exponentiell.", tex: `y-y_\\infty=C\\,\\operatorname{exp}(-${format(a)}x)` }
    ]
  };
}

function logisticSolution(r: number, capacity: number): OdeSolution {
  const y0 = defaultInitial.y0;
  const c = (capacity - y0) / y0;
  const xs = range(0, 12, 260);
  const ys = xs.map((x) => capacity / (1 + c * Math.exp(-r * x)));
  return {
    ok: true,
    type: "Logistisches Wachstum",
    general: `y(x)=\\frac{K}{1+C\\operatorname{exp}(-rx)}`,
    particular: `y(0)=1,\\ K=${format(capacity)},\\ r=${format(r)}\\Rightarrow y(x)=\\frac{${format(capacity)}}{1+${format(c)}\\operatorname{exp}(-${format(r)}x)}`,
    plot: { xs, ys },
    steps: [
      { title: "Autonome Struktur", text: "Wachstum ist bei kleinen y fast exponentiell und sättigt bei K.", tex: `y'=r y\\left(1-\\frac{y}{K}\\right)` },
      { title: "Standardlösung", text: "Die trennbare Gleichung führt auf die logistische Kurve.", tex: `y(x)=\\frac{K}{1+C\\operatorname{exp}(-rx)}` },
      { title: "Anfangswert", text: "Aus y(0)=1 wird C=(K-y_0)/y_0 bestimmt." }
    ]
  };
}

function secondOrderConstantForcing(a: number, b: number, forcing: number): OdeSolution | OdeFailure {
  if (nearZero(b)) {
    return { ok: false, message: "Diese Differentialgleichung liegt außerhalb der unterstützten Standardfälle." };
  }
  const homogeneous = secondOrderHomogeneous(a, b);
  const steady = forcing / b;
  return {
    ok: true,
    type: "Lineare inhomogene DGL zweiter Ordnung mit konstantem Term",
    general: `${homogeneous.general}+${format(steady)}`,
    particular: `y_p=${format(steady)}`,
    plot: { xs: homogeneous.plot.xs, ys: homogeneous.plot.ys.map((value) => value + steady) },
    steps: [
      { title: "Standardform", text: "Die Gleichung wird auf konstante Koeffizienten normiert.", tex: `y''+${format(a)}y'+${format(b)}y=${format(forcing)}` },
      { title: "Konstante Partikulärlösung", text: "Für einen konstanten rechten Term wird y_p als Konstante angesetzt.", tex: `y_p=\\frac{${format(forcing)}}{${format(b)}}=${format(steady)}` },
      { title: "Homogener Anteil", text: "Der Rest wird über das charakteristische Polynom gelöst.", tex: `r^2+${format(a)}r+${format(b)}=0` }
    ]
  };
}

function secondOrderHomogeneous(a: number, b: number): OdeSolution {
  const discriminant = a * a - 4 * b;
  const xs = range(0, 8, 260);
  let general: string;
  let ys: number[];

  if (discriminant > 1e-10) {
    const r1 = (-a + Math.sqrt(discriminant)) / 2;
    const r2 = (-a - Math.sqrt(discriminant)) / 2;
    general = `y=C_1\\operatorname{exp}(${format(r1)}x)+C_2\\operatorname{exp}(${format(r2)}x)`;
    ys = xs.map((x) => 0.5 * Math.exp(r1 * x) + 0.5 * Math.exp(r2 * x));
  } else if (Math.abs(discriminant) <= 1e-10) {
    const r = -a / 2;
    general = `y=(C_1+C_2x)\\operatorname{exp}(${format(r)}x)`;
    ys = xs.map((x) => (1 + x) * Math.exp(r * x));
  } else {
    const alpha = -a / 2;
    const beta = Math.sqrt(-discriminant) / 2;
    general = `y=\\operatorname{exp}(${format(alpha)}x)\\left(C_1\\cos(${format(beta)}x)+C_2\\sin(${format(beta)}x)\\right)`;
    ys = xs.map((x) => Math.exp(alpha * x) * Math.cos(beta * x));
  }

  return {
    ok: true,
    type: "Lineare homogene DGL zweiter Ordnung",
    general,
    particular: null,
    plot: { xs, ys },
    steps: [
      { title: "Charakteristisches Polynom", text: "Für konstante Koeffizienten wird y=exp(rx) eingesetzt.", tex: `r^2+${format(a)}r+${format(b)}=0` },
      { title: "Diskriminante", text: "Die Nullstellen bestimmen die Form der Lösung.", tex: `\\Delta=${format(discriminant)}` }
    ]
  };
}

function resonantOscillator(): OdeSolution {
  const xs = range(0, 16, 320);
  const ys = xs.map((x) => -0.5 * x * Math.cos(x));
  return {
    ok: true,
    type: "Lineare inhomogene DGL zweiter Ordnung",
    general: `y=C_1\\cos(x)+C_2\\sin(x)-\\frac{x}{2}\\cos(x)`,
    particular: `y_p(x)=-\\frac{x}{2}\\cos(x)`,
    plot: { xs, ys },
    steps: [
      { title: "Homogene Lösung", text: "Die Gleichung y''+y=0 hat Sinus- und Cosinuslösungen.", tex: `y_h=C_1\\cos(x)+C_2\\sin(x)` },
      { title: "Resonanter Ansatz", text: "Da sin(x) bereits zur homogenen Struktur gehört, wird der Ansatz mit x multipliziert.", tex: `y_p=-\\frac{x}{2}\\cos(x)` }
    ]
  };
}

function resonantCosineOscillator(): OdeSolution {
  const xs = range(0, 16, 320);
  const ys = xs.map((x) => 0.5 * x * Math.sin(x));
  return {
    ok: true,
    type: "Lineare inhomogene DGL zweiter Ordnung",
    general: `y=C_1\\cos(x)+C_2\\sin(x)+\\frac{x}{2}\\sin(x)`,
    particular: `y_p(x)=\\frac{x}{2}\\sin(x)`,
    plot: { xs, ys },
    steps: [
      { title: "Homogene Lösung", text: "Die Gleichung y''+y=0 hat Sinus- und Cosinuslösungen.", tex: `y_h=C_1\\cos(x)+C_2\\sin(x)` },
      { title: "Resonanter Ansatz", text: "Da cos(x) bereits zur homogenen Struktur gehört, wird der Ansatz mit x multipliziert.", tex: `y_p=\\frac{x}{2}\\sin(x)` }
    ]
  };
}

interface LinearCoefficients {
  ypp: number;
  yp: number;
  y: number;
  constant: number;
}

function equationCoefficients(normalized: string): LinearCoefficients | null {
  const parts = normalized.split("=");
  if (parts.length !== 2) return null;
  try {
    const left = prepareOdeExpression(parts[0]);
    const right = prepareOdeExpression(parts[1]);
    const node = math.parse(`(${left})-(${right})`);
    return cleanCoefficients(extractLinearCoefficients(node));
  } catch {
    return null;
  }
}

function prepareOdeExpression(expression: string) {
  return expression
    .replace(/y''/g, "ypp")
    .replace(/y'/g, "yp")
    .replace(/(\d|\))(?=(ypp|yp|y)\b)/g, "$1*")
    .replace(/(ypp|yp|y)(?=\()/g, "$1*");
}

function extractLinearCoefficients(node: MathNode): LinearCoefficients | null {
  const raw = node as unknown as {
    type?: string;
    op?: string;
    args?: MathNode[];
    content?: MathNode;
    name?: string;
    value?: string | number;
  };

  if (raw.type === "ParenthesisNode" && raw.content) return extractLinearCoefficients(raw.content);
  if (raw.type === "ConstantNode") return coefficients(0, 0, 0, Number(raw.value));
  if (raw.type === "SymbolNode") {
    if (raw.name === "ypp") return coefficients(1, 0, 0, 0);
    if (raw.name === "yp") return coefficients(0, 1, 0, 0);
    if (raw.name === "y") return coefficients(0, 0, 1, 0);
    return null;
  }

  if (raw.type === "OperatorNode" && raw.args) {
    if (raw.op === "-" && raw.args.length === 1) return scaleCoefficients(extractLinearCoefficients(raw.args[0]), -1);

    if ((raw.op === "+" || raw.op === "-") && raw.args.length === 2) {
      const left = extractLinearCoefficients(raw.args[0]);
      const right = extractLinearCoefficients(raw.args[1]);
      return addCoefficients(left, raw.op === "-" ? scaleCoefficients(right, -1) : right);
    }

    if (raw.op === "*" && raw.args.length === 2) {
      const leftConstant = extractConstant(raw.args[0]);
      if (leftConstant !== null) return scaleCoefficients(extractLinearCoefficients(raw.args[1]), leftConstant);
      const rightConstant = extractConstant(raw.args[1]);
      if (rightConstant !== null) return scaleCoefficients(extractLinearCoefficients(raw.args[0]), rightConstant);
      return null;
    }

    if (raw.op === "/" && raw.args.length === 2) {
      const denominator = extractConstant(raw.args[1]);
      if (denominator === null || nearZero(denominator)) return null;
      return scaleCoefficients(extractLinearCoefficients(raw.args[0]), 1 / denominator);
    }
  }

  return null;
}

function extractConstant(node: MathNode): number | null {
  const linear = extractLinearCoefficients(node);
  if (!linear) return null;
  if (!nearZero(linear.ypp) || !nearZero(linear.yp) || !nearZero(linear.y)) return null;
  return linear.constant;
}

function coefficients(ypp: number, yp: number, y: number, constant: number): LinearCoefficients {
  return { ypp, yp, y, constant };
}

function addCoefficients(a: LinearCoefficients | null, b: LinearCoefficients | null): LinearCoefficients | null {
  if (!a || !b) return null;
  return coefficients(a.ypp + b.ypp, a.yp + b.yp, a.y + b.y, a.constant + b.constant);
}

function scaleCoefficients(value: LinearCoefficients | null, factor: number): LinearCoefficients | null {
  if (!value) return null;
  return coefficients(value.ypp * factor, value.yp * factor, value.y * factor, value.constant * factor);
}

function cleanCoefficients(value: LinearCoefficients | null): LinearCoefficients | null {
  if (!value) return null;
  return coefficients(clean(value.ypp), clean(value.yp), clean(value.y), clean(value.constant));
}

function range(min: number, max: number, points: number) {
  return Array.from({ length: points }, (_, index) => min + ((max - min) * index) / (points - 1));
}

function nearZero(value: number) {
  return Math.abs(value) < epsilon;
}

function clean(value: number) {
  return nearZero(value) ? 0 : Number(value.toFixed(10));
}

function format(value: number) {
  if (Math.abs(value) < 1e-10) return "0";
  return Number(value.toFixed(5)).toString();
}
