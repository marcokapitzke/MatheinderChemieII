import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { matrixExamples, type RouteId } from "../data/modules";
import { analyzeMatrix, formatNumber, matrixToTex, vectorToColumnTex } from "../lib/matrixMath";
import { CalculatorLayout, DetailedSteps } from "./CalculatorLayout";
import { MathFormula } from "./MathFormula";
import { PlotPanel, type Trace } from "./PlotPanel";

interface Props {
  onNavigate: (route: RouteId) => void;
}

export function MatrixModule({ onNavigate }: Props) {
  const [matrixInput, setMatrixInput] = useState("2,1; 1,3");
  const [vectorInput, setVectorInput] = useState("1; 2");
  const result = useMemo(() => analyzeMatrix(matrixInput, vectorInput), [matrixInput, vectorInput]);

  return (
    <CalculatorLayout
      route="matrices"
      title="Matrizen & lineare Gleichungssysteme"
      eyebrow="Lineare Algebra"
      chapter="Band II: Matrizen und lineare Systeme"
      description="Matrixrechner und LGS-Rechner mit Gauß-Elimination, Rang, Determinante und Visualisierung für 2x2-Systeme."
      onNavigate={onNavigate}
      supported={[
        "Matrizen bis 4x4, Zeilen durch Semikolon trennen",
        "A x = b mit passender rechter Seite",
        "Determinante, Rang, Spur, Transposition und inverse Matrix",
        "Gauß-Elimination mit Zeilenumformungen",
        "Eigenwerte nur als zukünftige Erweiterung, wenn zuverlässig"
      ]}
      aside={
        <details className="examples" open>
          <summary>Beispielaufgaben</summary>
          <div className="example-grid">
            {matrixExamples.map((example) => (
              <button
                type="button"
                key={example.label}
                onClick={() => {
                  setMatrixInput(example.matrix);
                  setVectorInput(example.vector);
                }}
              >
                <strong>{example.label}</strong>
                <span>{example.matrix}</span>
                <small>{example.note}</small>
              </button>
            ))}
          </div>
        </details>
      }
    >
      <div className="input-card">
        <label htmlFor="matrix-input">Koeffizientenmatrix A</label>
        <textarea id="matrix-input" value={matrixInput} onChange={(event) => setMatrixInput(event.target.value)} />
        <label htmlFor="rhs-input">Rechte Seite b</label>
        <div className="input-row">
          <input id="rhs-input" value={vectorInput} onChange={(event) => setVectorInput(event.target.value)} />
          <button type="button" className="icon-button" onClick={() => setMatrixInput("2,1; 1,3")} title="Matrix zurücksetzen">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {result.ok ? (
        <>
          <section className="analysis-grid">
            <article className="result-card">
              <p className="eyebrow">Matrix A</p>
              <MathFormula block tex={`A=${matrixToTex(result.matrix)}`} />
              <MathFormula block tex={`\\operatorname{rang}(A)=${result.rank}`} />
              {result.determinant !== null ? <MathFormula block tex={`\\det(A)=${formatNumber(result.determinant)}`} /> : null}
              {result.trace !== null ? <MathFormula block tex={`\\operatorname{tr}(A)=${formatNumber(result.trace)}`} /> : null}
            </article>
            <article className="result-card">
              <p className="eyebrow">Lösung von A x = b</p>
              <MathFormula block tex={`b=${vectorToColumnTex(result.vector)}`} />
              {result.solutionStatus === "unique" && result.solution ? <MathFormula block tex={`x=${vectorToColumnTex(result.solution)}`} /> : null}
              {result.solutionStatus === "none" ? <p>Das System ist inkonsistent und besitzt keine Lösung.</p> : null}
              {result.solutionStatus === "infinite" ? <p>Das System besitzt unendlich viele Lösungen.</p> : null}
            </article>
            <article className="result-card">
              <p className="eyebrow">Inverse / Transposition</p>
              <MathFormula block tex={`A^T=${matrixToTex(result.transpose)}`} />
              {result.inverse ? <MathFormula block tex={`A^{-1}=${matrixToTex(result.inverse)}`} /> : <p>Diese Matrix besitzt keine inverse Matrix.</p>}
            </article>
          </section>

          {result.matrix.length === 2 && result.matrix[0].length === 2 ? (
            <section className="result-card result-card--wide">
              <p className="eyebrow">Geometrische Deutung</p>
              <SystemPlot matrix={result.matrix} vector={result.vector} />
            </section>
          ) : null}

          <section className="result-card result-card--wide">
            <p className="eyebrow">Gauß-Elimination</p>
            <MathFormula block tex={`\\operatorname{rref}(A)=${matrixToTex(result.rref)}`} />
            <DetailedSteps
              steps={result.rowSteps.map((step, index) => ({
                title: `Zeilenumformung ${index + 1}`,
                text: "Elementare Zeilenumformung im Gauß-Jordan-Verfahren.",
                tex: step
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

function SystemPlot({ matrix, vector }: { matrix: number[][]; vector: number[] }) {
  const xs = Array.from({ length: 201 }, (_, index) => -6 + (12 * index) / 200);
  const traces: Trace[] = matrix.map((row, index) => {
    const [a, b] = row;
    const y = Math.abs(b) < 1e-10 ? xs.map(() => null) : xs.map((x) => (vector[index] - a * x) / b);
    return { x: xs, y, name: `Gleichung ${index + 1}`, color: index === 0 ? "#09213f" : "#8b1e3f" };
  });
  return <PlotPanel traces={traces} height={420} xTitle="x_1" yTitle="x_2" equalAspect />;
}
