import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { matrixExamples, type RouteId } from "../data/modules";
import {
  addMatrices,
  analyzeMatrixOnly,
  formatNumber,
  matrixToTex,
  multiplyMatrices,
  parseMatrix,
  scaleMatrix,
  subtractMatrices
} from "../lib/matrixMath";
import { CalculatorLayout } from "./CalculatorLayout";
import { MathFormula } from "./MathFormula";

const matrixATex = "\\mathbf{A}";
const matrixBTex = "\\mathbf{B}";

interface Props {
  onNavigate: (route: RouteId) => void;
}

export function MatrixModule({ onNavigate }: Props) {
  const [matrixInput, setMatrixInput] = useState("2,1; 1,3");
  const [matrixBInput, setMatrixBInput] = useState("1,0; 0,1");
  const [matrixScalar, setMatrixScalar] = useState(2);
  const result = useMemo(() => analyzeMatrixOnly(matrixInput), [matrixInput]);
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
      title="Matrizen"
      eyebrow="Lineare Algebra"
      chapter="Band II: Matrizen und lineare Abbildungen"
      description="Matrixrechner für Determinanten, Rang, inverse Matrizen, Transposition und Matrixoperationen."
      onNavigate={onNavigate}
      supported={[
        "Matrizen bis 4x4, Zeilen durch Semikolon trennen",
        "Determinante, Rang, Spur, Transposition und inverse Matrix",
        "Addition, Subtraktion, Multiplikation und Skalarmultiplikation",
        "Reduzierte Zeilenstufenform der Matrix",
        "LGS und Gauß-Verfahren im eigenen LGS-Modul",
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
        <label htmlFor="matrix-scalar">Skalar μ für μA</label>
        <div className="input-row">
          <input id="matrix-scalar" type="number" step={0.25} value={matrixScalar} onChange={(event) => setMatrixScalar(Number(event.target.value))} />
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
              <MathFormula block tex={`${matrixATex}=${matrixToTex(result.matrix)}`} />
              <MathFormula block tex={`\\operatorname{rang}(${matrixATex})=${result.rank}`} />
              {result.determinant !== null ? <MathFormula block tex={`\\det(${matrixATex})=${formatNumber(result.determinant)}`} /> : null}
              {result.trace !== null ? <MathFormula block tex={`\\operatorname{tr}(${matrixATex})=${formatNumber(result.trace)}`} /> : null}
            </article>
            <article className="result-card">
              <p className="eyebrow">Inverse / Transposition</p>
              <MathFormula block tex={`${matrixATex}^{\\mathsf{T}}=${matrixToTex(result.transpose)}`} />
              {result.inverse ? <MathFormula block tex={`${matrixATex}^{-1}=${matrixToTex(result.inverse)}`} /> : <p>Diese Matrix besitzt keine inverse Matrix.</p>}
            </article>
            <article className="result-card">
              <p className="eyebrow">Zeilenstufenform</p>
              <MathFormula block tex={`\\operatorname{rref}(${matrixATex})=${matrixToTex(result.rref)}`} />
              <p>Für vollständige Gauß-Schritte mit rechter Seite bitte das LGS-Modul verwenden.</p>
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
