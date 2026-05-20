import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { matrixExamples, type RouteId } from "../data/modules";
import {
  addMatrices,
  analyzeMatrix,
  formatNumber,
  matrixToTex,
  multiplyMatrices,
  parseMatrix,
  scaleMatrix,
  subtractMatrices,
  vectorToColumnTex
} from "../lib/matrixMath";
import { CalculatorLayout, DetailedSteps } from "./CalculatorLayout";
import { MathFormula } from "./MathFormula";
import { PlotPanel, type Trace } from "./PlotPanel";

const matrixATex = "\\mathbf{A}";
const matrixBTex = "\\mathbf{B}";
const vectorXTex = "\\mathbf{x}";
const vectorBTex = "\\mathbf{b}";

interface Props {
  onNavigate: (route: RouteId) => void;
}

export function MatrixModule({ onNavigate }: Props) {
  const [matrixInput, setMatrixInput] = useState("2,1; 1,3");
  const [matrixBInput, setMatrixBInput] = useState("1,0; 0,1");
  const [vectorInput, setVectorInput] = useState("1; 2");
  const [matrixScalar, setMatrixScalar] = useState(2);
  const result = useMemo(() => analyzeMatrix(matrixInput, vectorInput), [matrixInput, vectorInput]);
  const matrixB = useMemo(() => parseMatrix(matrixBInput), [matrixBInput]);
  const matrixOperations = useMemo(() => {
    if (!result.ok || !matrixB) return null;
    return {
      sum: addMatrices(result.matrix, matrixB),
      difference: subtractMatrices(result.matrix, matrixB),
      product: multiplyMatrices(result.matrix, matrixB),
      scaled: scaleMatrix(result.matrix, matrixScalar)
    };
  }, [matrixB, matrixScalar, result]);

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
                  setMatrixBInput(example.matrixB);
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
        <label htmlFor="matrix-b-input">Matrix B für Operationen</label>
        <textarea id="matrix-b-input" value={matrixBInput} onChange={(event) => setMatrixBInput(event.target.value)} />
        <label htmlFor="rhs-input">Rechte Seite b</label>
        <div className="input-row">
          <input id="rhs-input" value={vectorInput} onChange={(event) => setVectorInput(event.target.value)} />
          <button type="button" className="icon-button" onClick={() => setMatrixInput("2,1; 1,3")} title="Matrix zurücksetzen">
            <RotateCcw size={18} />
          </button>
        </div>
        <label htmlFor="matrix-scalar">Skalar μ für μA</label>
        <input id="matrix-scalar" type="number" step={0.25} value={matrixScalar} onChange={(event) => setMatrixScalar(Number(event.target.value))} />
      </div>

      {result.ok ? (
        <>
          <section className="analysis-grid">
            <article className="result-card">
              <p className="eyebrow">Matrix A</p>
              <MathFormula block tex={`${matrixATex}=${matrixToTex(result.matrix)}`} />
              <MathFormula block tex={`\\operatorname{rang}(${matrixATex})=${result.rank}`} />
              {result.determinant !== null ? <MathFormula block tex={`\\det(${matrixATex})=${formatNumber(result.determinant)}`} /> : null}
              {result.trace !== null ? <MathFormula block tex={`\\operatorname{tr}(${matrixATex})=${formatNumber(result.trace)}`} /> : null}
            </article>
            <article className="result-card">
              <p className="eyebrow">Lösung des linearen Systems</p>
              <MathFormula block tex={`${vectorBTex}=${vectorToColumnTex(result.vector)}`} />
              {result.solutionStatus === "unique" && result.solution ? <MathFormula block tex={`${vectorXTex}=${vectorToColumnTex(result.solution)}`} /> : null}
              {result.solutionStatus === "none" ? <p>Das System ist inkonsistent und besitzt keine Lösung.</p> : null}
              {result.solutionStatus === "infinite" ? <p>Das System besitzt unendlich viele Lösungen.</p> : null}
            </article>
            <article className="result-card">
              <p className="eyebrow">Inverse / Transposition</p>
              <MathFormula block tex={`${matrixATex}^{\\mathsf{T}}=${matrixToTex(result.transpose)}`} />
              {result.inverse ? <MathFormula block tex={`${matrixATex}^{-1}=${matrixToTex(result.inverse)}`} /> : <p>Diese Matrix besitzt keine inverse Matrix.</p>}
            </article>
          </section>

          <section className="result-card result-card--wide">
            <p className="eyebrow">Matrixoperationen mit B</p>
            {matrixB && matrixOperations ? (
              <div className="formula-list">
                <MathFormula block tex={`${matrixBTex}=${matrixToTex(matrixB)}`} />
                {matrixOperations.sum ? <MathFormula block tex={`${matrixATex}+${matrixBTex}=${matrixToTex(matrixOperations.sum)}`} /> : <p>Die Summe ist nur für gleich große Matrizen definiert.</p>}
                {matrixOperations.difference ? <MathFormula block tex={`${matrixATex}-${matrixBTex}=${matrixToTex(matrixOperations.difference)}`} /> : <p>Die Differenz ist nur für gleich große Matrizen definiert.</p>}
                {matrixOperations.product ? <MathFormula block tex={`${matrixATex}${matrixBTex}=${matrixToTex(matrixOperations.product)}`} /> : <p>Das Produkt ist nur definiert, wenn die Spaltenzahl der ersten Matrix zur Zeilenzahl der zweiten Matrix passt.</p>}
                <MathFormula block tex={`${formatNumber(matrixScalar)}${matrixATex}=${matrixToTex(matrixOperations.scaled)}`} />
              </div>
            ) : (
              <p>Bitte gib B als Matrix mit Zahlen ein, z. B. 1,0; 0,1.</p>
            )}
          </section>

          {result.matrix.length === 2 && result.matrix[0].length === 2 ? (
            <section className="result-card result-card--wide">
              <p className="eyebrow">Geometrische Deutung</p>
              <SystemPlot matrix={result.matrix} vector={result.vector} />
            </section>
          ) : null}

          <section className="result-card result-card--wide">
            <p className="eyebrow">Gauß-Elimination</p>
            <MathFormula block tex={`\\operatorname{rref}(${matrixATex})=${matrixToTex(result.rref)}`} />
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
