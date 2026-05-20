import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { multivarExamples, type RouteId } from "../data/modules";
import { analyzeMultivariable } from "../lib/multivariable";
import { expressionToTex } from "../lib/mathCore";
import { CalculatorLayout, DetailedSteps, FormulaPreview } from "./CalculatorLayout";
import { MathFormula } from "./MathFormula";
import { AdvancedPlotPanel, scientificAxis } from "./AdvancedPlotPanel";

interface Props {
  onNavigate: (route: RouteId) => void;
}

export function MultivariableModule({ onNavigate }: Props) {
  const [input, setInput] = useState("exp(-(x^2+y^2))");
  const [range, setRange] = useState(2.5);
  const result = useMemo(() => analyzeMultivariable(input, -range, range), [input, range]);

  return (
      <CalculatorLayout
      route="multivar"
      title="Mehrdimensionale Analysis Visualisierer"
      eyebrow="Funktionen mehrerer Variablen"
      chapter="Band II: Mehrdimensionale Analysis"
      description="Visualisiert f(x,y), Konturlinien, Gradienten, Hesse-Matrix und rechteckige Integrationsbereiche."
      onNavigate={onNavigate}
      supported={[
        "f(x,y) mit x und y",
        "einfache f(x,y,z) als z=0-Schnitt",
        "partielle Ableitungen, Gradient und Hesse-Matrix",
        "Doppelintegrale über Rechteckbereiche numerisch",
        "kritische Punkte nur für zuverlässig erkannte Standardfälle"
      ]}
      aside={
        <details className="examples" open>
          <summary>Beispielaufgaben</summary>
          <div className="example-grid">
            {multivarExamples.map((example) => (
              <button type="button" key={example.label} onClick={() => setInput(example.value)}>
                <strong>{example.label}</strong>
                <span className="example-formula">
                  <MathFormula tex={expressionToTex(example.value)} />
                </span>
                <small>{example.note}</small>
              </button>
            ))}
          </div>
        </details>
      }
    >
      <div className="input-card">
        <label htmlFor="multivar-input">Funktion f(x,y)</label>
        <div className="input-row">
          <input id="multivar-input" value={input} onChange={(event) => setInput(event.target.value)} />
          <button type="button" className="icon-button" onClick={() => setInput("exp(-(x^2+y^2))")} title="Zurücksetzen">
            <RotateCcw size={18} />
          </button>
        </div>
        <FormulaPreview tex={`f=${expressionToTex(input)}`} />
        <label htmlFor="range-slider">Darstellungsbereich</label>
        <input id="range-slider" type="range" min={1} max={5} step={0.5} value={range} onChange={(event) => setRange(Number(event.target.value))} />
        <span className="range-label">x,y von -{range} bis {range}</span>
      </div>

      {result.ok ? (
        <>
          <section className="analysis-grid">
            <article className="result-card">
              <p className="eyebrow">Partielle Ableitungen</p>
              {result.variables.map((variable) => (
                <MathFormula key={variable} block tex={`\\frac{\\partial f}{\\partial ${variable}}=${expressionToTex(result.partials[variable])}`} />
              ))}
            </article>
            <article className="result-card">
              <p className="eyebrow">Gradient</p>
              <MathFormula block tex={`\\nabla f=${result.gradientTex}`} />
              {result.directionalDerivative ? (
                <MathFormula block tex={`D_{u}f(0,0)\\approx ${result.directionalDerivative.value.toFixed(5)},\\quad u=${result.directionalDerivative.directionTex}`} />
              ) : null}
              {result.criticalPoint ? (
                <p>
                  Kritischer Punkt bei (0,0): <strong>{result.criticalPoint.type}</strong>.
                </p>
              ) : (
                <p>Kein sicher klassifizierter kritischer Punkt im Standardfall.</p>
              )}
            </article>
            <article className="result-card">
              <p className="eyebrow">Hesse-Matrix & Integral</p>
              {result.hessianTex ? <MathFormula block tex={`H_f=${result.hessianTex}`} /> : <p>Für f(x,y,z) wird hier keine vollständige Hesse-Matrix angezeigt.</p>}
              {result.integral !== null ? <MathFormula block tex={`\\iint_R f(x,y)\\,\\mathrm{d}x\\,\\mathrm{d}y\\approx ${result.integral.toFixed(5)}`} /> : null}
            </article>
          </section>

          <section className="result-card result-card--wide">
            <p className="eyebrow">Fläche und Höhenlinien</p>
            <div className="dual-plot-grid">
              <AdvancedPlotPanel
                title="3D-Fläche"
                height={430}
                data={[
                  {
                    type: "surface",
                    x: result.surface.xs,
                    y: result.surface.ys,
                    z: result.surface.z,
                    colorscale: [
                      [0, "#09213f"],
                      [0.55, "#f7f9fc"],
                      [1, "#8b1e3f"]
                    ],
                    showscale: false,
                    contours: { z: { show: true, usecolormap: true, highlightcolor: "#8b1e3f", project: { z: true } } }
                  }
                ]}
                layout={{ scene: { bgcolor: "rgba(0,0,0,0)", xaxis: { title: "x" }, yaxis: { title: "y" }, zaxis: { title: "f" } } }}
              />
              <AdvancedPlotPanel
                title="Konturplot"
                height={430}
                data={[
                  {
                    type: "contour",
                    x: result.contour.xs,
                    y: result.contour.ys,
                    z: result.contour.z,
                    colorscale: [
                      [0, "#09213f"],
                      [0.55, "#f7f9fc"],
                      [1, "#8b1e3f"]
                    ],
                    contours: { coloring: "heatmap" },
                    line: { color: "rgba(9,33,63,0.36)", width: 0.8 },
                    showscale: false
                  }
                ]}
                layout={{ xaxis: { ...scientificAxis, title: "x" }, yaxis: { ...scientificAxis, title: "y" } }}
              />
            </div>
          </section>

          <section className="result-card">
            <p className="eyebrow">Plotmethode</p>
            <DetailedSteps summary="Wie wurde der Plot bestimmt?" steps={result.steps.map((step, index) => ({ title: `Schritt ${index + 1}`, text: step }))} />
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
