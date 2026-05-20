import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { vectorExamples, type RouteId } from "../data/modules";
import { analyzeVectors, formatNumber, formatVector, type Vector } from "../lib/vectorMath";
import { CalculatorLayout, DetailedSteps } from "./CalculatorLayout";
import { MathFormula } from "./MathFormula";
import { PlotPanel, type Trace } from "./PlotPanel";
import { AdvancedPlotPanel } from "./AdvancedPlotPanel";

interface Props {
  onNavigate: (route: RouteId) => void;
}

export function VectorModule({ onNavigate }: Props) {
  const [input, setInput] = useState("v1=(1,1,0), v2=(1,0,1), v3=(0,1,1)");
  const result = useMemo(() => analyzeVectors(input), [input]);

  return (
    <CalculatorLayout
      route="vectors"
      title="Vektorrechnung & Gram-Schmidt"
      eyebrow="Vektorräume"
      chapter="Band II: Vektoren und Skalarprodukte"
      description="Berechnet Vektoroperationen, Projektionen und Gram-Schmidt-Orthonormalisierung für 2D- und 3D-Vektoren."
      onNavigate={onNavigate}
      supported={[
        "(1, 2) und (1, 2, 3)",
        "mehrere Vektoren als v1=(...), v2=(...)",
        "Skalarprodukt, Kreuzprodukt in 3D, Norm und Winkel",
        "Projektion und Gram-Schmidt mit linearen Abhängigkeiten"
      ]}
      aside={
        <details className="examples" open>
          <summary>Beispielaufgaben</summary>
          <div className="example-grid">
            {vectorExamples.map((example) => (
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
        <label htmlFor="vector-input">Vektoren</label>
        <div className="input-row">
          <input id="vector-input" value={input} onChange={(event) => setInput(event.target.value)} />
          <button type="button" className="icon-button" onClick={() => setInput("v1=(1,1,0), v2=(1,0,1), v3=(0,1,1)")} title="Zurücksetzen">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {result.ok ? (
        <>
          <section className="analysis-grid">
            <article className="result-card">
              <p className="eyebrow">Operationen</p>
              {result.sum ? <MathFormula block tex={`v_1+v_2=${formatVector(result.sum)}`} /> : null}
              {result.difference ? <MathFormula block tex={`v_1-v_2=${formatVector(result.difference)}`} /> : null}
              {result.dot !== null ? <MathFormula block tex={`v_1\\cdot v_2=${formatNumber(result.dot)}`} /> : null}
              {result.cross ? <MathFormula block tex={`v_1\\times v_2=${formatVector(result.cross)}`} /> : null}
            </article>
            <article className="result-card">
              <p className="eyebrow">Geometrie</p>
              {result.norms.map((norm, index) => (
                <MathFormula key={index} block tex={`\\left\\|v_${index + 1}\\right\\|=${formatNumber(norm)}`} />
              ))}
              {result.angle !== null ? <MathFormula block tex={`\\angle(v_1,v_2)\\approx ${formatNumber((result.angle * 180) / Math.PI)}^\\circ`} /> : null}
              {result.projection ? <MathFormula block tex={`\\operatorname{proj}_{v_2}(v_1)=${formatVector(result.projection)}`} /> : null}
            </article>
            <article className="result-card">
              <p className="eyebrow">Lineare Unabhängigkeit</p>
              <MathFormula block tex={result.independent ? "\\text{linear unabhängig}" : "\\text{linear abhängig}"} />
              <p>{result.independent ? "Alle eingegebenen Vektoren tragen zur Basis bei." : "Mindestens ein Vektor liegt im Spann der vorherigen Vektoren."}</p>
            </article>
          </section>

          <section className="result-card result-card--wide">
            <p className="eyebrow">Visualisierung</p>
            {result.dimension === 2 ? <VectorPlot2D vectors={result.vectors} projection={result.projection} /> : <VectorPlot3D vectors={result.vectors} />}
          </section>

          <section className="result-card result-card--wide">
            <p className="eyebrow">Gram-Schmidt</p>
            <div className="formula-list">
              {result.basis.map((vector, index) => (
                <MathFormula key={index} block tex={`e_${index + 1}=${formatVector(vector)}`} />
              ))}
            </div>
            <DetailedSteps
              steps={result.gramSchmidt.map((step) => ({
                title: `Schritt ${step.index}`,
                text: step.skipped
                  ? "Der orthogonale Rest ist numerisch null; der Vektor ist linear abhängig und wird übersprungen."
                  : "Projektionen auf die bereits gebildeten orthogonalen Vektoren werden abgezogen und danach normiert.",
                tex: `u_${step.index}=${formatVector(step.orthogonal)}${step.normalized ? `,\\quad e_${step.index}=${formatVector(step.normalized)}` : ""}`
              }))}
            />
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

function VectorPlot2D({ vectors, projection }: { vectors: Vector[]; projection: Vector | null }) {
  const colors = ["#09213f", "#8b1e3f", "#0f6b5c", "#b45a3c"];
  const traces: Trace[] = vectors.map((vector, index) => ({
    x: [0, vector[0]],
    y: [0, vector[1]],
    name: `v${index + 1}`,
    color: colors[index % colors.length],
    mode: "lines+markers",
    width: 3
  }));
  if (projection) {
    traces.push({ x: [0, projection[0]], y: [0, projection[1]], name: "Projektion", color: "#b45a3c", mode: "lines+markers", dash: "dash" });
  }
  return <PlotPanel traces={traces} xTitle="x" yTitle="y" equalAspect height={430} showEndLabels />;
}

function VectorPlot3D({ vectors }: { vectors: Vector[] }) {
  const colors = ["#09213f", "#8b1e3f", "#0f6b5c", "#b45a3c"];
  return (
    <AdvancedPlotPanel
      height={450}
      title="Vektoren im Raum"
      data={vectors.map((vector, index) => ({
        type: "scatter3d",
        mode: "lines+markers",
        name: `v${index + 1}`,
        x: [0, vector[0]],
        y: [0, vector[1]],
        z: [0, vector[2]],
        line: { color: colors[index % colors.length], width: 7 },
        marker: { color: colors[index % colors.length], size: 4 }
      }))}
      layout={{
        scene: {
          bgcolor: "rgba(0,0,0,0)",
          xaxis: { title: "x", gridcolor: "rgba(167,181,202,0.35)", zerolinecolor: "#8b1e3f" },
          yaxis: { title: "y", gridcolor: "rgba(167,181,202,0.35)", zerolinecolor: "#8b1e3f" },
          zaxis: { title: "z", gridcolor: "rgba(167,181,202,0.35)", zerolinecolor: "#8b1e3f" },
          aspectmode: "cube"
        }
      }}
    />
  );
}
