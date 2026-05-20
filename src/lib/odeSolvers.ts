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

export function solveOde(input: string): OdeSolution | OdeFailure {
  const normalized = input.replace(/\s+/g, "").replace(/−/g, "-");

  const firstOrder = normalized.match(/^y'=([+-]?\d*\.?\d+)\*?y$/);
  if (firstOrder) return exponentialSolution(Number(firstOrder[1]));

  const firstOrderImplicit = normalized.match(/^y'\+([+-]?\d*\.?\d+)\*?y=([+-]?\d*\.?\d+)$/);
  if (firstOrderImplicit) return linearConstantSolution(Number(firstOrderImplicit[1]), Number(firstOrderImplicit[2]));

  const logistic = normalized.match(/^y'=([+-]?\d*\.?\d+)\*?y\*\(1-y\/([+-]?\d*\.?\d+)\)$/);
  if (logistic) return logisticSolution(Number(logistic[1]), Number(logistic[2]));

  const homogeneousSecond = normalized.match(/^y''\+([+-]?(?:\d*\.?\d+)?)\*?y'\+([+-]?(?:\d*\.?\d+)?)\*?y=0$/);
  if (homogeneousSecond) return secondOrderHomogeneous(parseCoefficient(homogeneousSecond[1]), parseCoefficient(homogeneousSecond[2]));

  if (normalized === "y''+y=sin(x)") return resonantOscillator();

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

function linearConstantSolution(a: number, b: number): OdeSolution | OdeFailure {
  if (Math.abs(a) < 1e-10) return { ok: false, message: "Diese lineare Gleichung benötigt a ≠ 0." };
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

function range(min: number, max: number, points: number) {
  return Array.from({ length: points }, (_, index) => min + ((max - min) * index) / (points - 1));
}

function parseCoefficient(value: string) {
  if (value === "" || value === "+") return 1;
  if (value === "-") return -1;
  return Number(value);
}

function format(value: number) {
  if (Math.abs(value) < 1e-10) return "0";
  return Number(value.toFixed(5)).toString();
}
