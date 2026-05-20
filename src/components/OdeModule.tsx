import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { odeExamples, type RouteId } from "../data/modules";
import { solveOde } from "../lib/odeSolvers";
import { CalculatorLayout, DetailedSteps } from "./CalculatorLayout";
import { MathFormula } from "./MathFormula";
import { PlotPanel } from "./PlotPanel";

interface Props {
  onNavigate: (route: RouteId) => void;
}

export function OdeModule({ onNavigate }: Props) {
  const [input, setInput] = useState("y' = -0.5*y");
  const result = useMemo(() => solveOde(input), [input]);

  return (
    <CalculatorLayout
      route="odes"
      title="Gewöhnliche Differentialgleichungen"
      eyebrow="Dynamische Systeme"
      chapter="Band II: Differentialgleichungen"
      description="Löst ausgewählte Standard-DGLs mit nachvollziehbarem Ansatz und Lösungskurve."
      onNavigate={onNavigate}
      supported={[
        "lineare DGL erster Ordnung mit konstanten Koeffizienten, auch umgestellt",
        "y' = k y, y' = c und y' + a y = b",
        "logistisches Wachstum y' = r y (1-y/K)",
        "lineare homogene DGL zweiter Ordnung mit konstanten Koeffizienten",
        "konstant erzwungene DGLs zweiter Ordnung und einzelne Resonanzfälle"
      ]}
      aside={
        <details className="examples" open>
          <summary>Beispielaufgaben</summary>
          <div className="example-grid">
            {odeExamples.map((example) => (
              <button type="button" key={example.label} onClick={() => setInput(example.value)}>
                <strong>{example.label}</strong>
                <span>{example.value}</span>
                <small>{example.note}</small>
              </button>
            ))}
          </div>
        </details>
      }
    >
      <div className="input-card">
        <label htmlFor="ode-input">Differentialgleichung</label>
        <div className="input-row">
          <input id="ode-input" value={input} onChange={(event) => setInput(event.target.value)} />
          <button type="button" className="icon-button" onClick={() => setInput("y' = -0.5*y")} title="Zurücksetzen">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {result.ok ? (
        <>
          <section className="analysis-grid">
            <article className="result-card">
              <p className="eyebrow">Erkannter Typ</p>
              <h3>{result.type}</h3>
            </article>
            <article className="result-card">
              <p className="eyebrow">Allgemeine Lösung</p>
              <MathFormula block tex={result.general} />
            </article>
            <article className="result-card">
              <p className="eyebrow">Anfangswertbeispiel</p>
              {result.particular ? <MathFormula block tex={result.particular} /> : <p>Für diese Standardform wird nur die allgemeine Lösung gezeigt.</p>}
            </article>
          </section>

          <section className="result-card result-card--wide">
            <p className="eyebrow">Lösungskurve</p>
            <PlotPanel traces={[{ x: result.plot.xs, y: result.plot.ys, name: "y(x)", color: "#09213f" }]} xTitle="x" yTitle="y" height={430} />
          </section>

          <section className="result-card">
            <p className="eyebrow">Lösungsweg</p>
            <DetailedSteps steps={result.steps} />
          </section>
        </>
      ) : (
        <section className="message-card message-card--warning">
          <h2>Nicht unterstützt</h2>
          <p>{result.message}</p>
        </section>
      )}
    </CalculatorLayout>
  );
}
