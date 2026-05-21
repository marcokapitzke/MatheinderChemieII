import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { lgsExamples, type RouteId } from "../data/modules";
import {
  analyzeLgs,
  augmentedMatrixToTex,
  fractionToNumber,
  fractionToTex,
  linearEquationsToTex,
  type LgsAnalysis,
  type LgsDisplayMode,
  type LgsMethod
} from "../lib/lgsMath";
import { CalculatorLayout, DetailedSteps } from "./CalculatorLayout";
import { MathFormula } from "./MathFormula";
import { PlotPanel, type Trace } from "./PlotPanel";

interface Props {
  onNavigate: (route: RouteId) => void;
}

export function LgsModule({ onNavigate }: Props) {
  const [input, setInput] = useState("2, 1 | 1\n1, 3 | 2");
  const [method, setMethod] = useState<LgsMethod>("rref");
  const [displayMode, setDisplayMode] = useState<LgsDisplayMode>("fraction");
  const result = useMemo(() => analyzeLgs(input), [input]);

  return (
    <CalculatorLayout
      route="lgs"
      title="Lineare Gleichungssysteme"
      eyebrow="Gauß-Verfahren"
      chapter="Band II: Lineare Gleichungssysteme"
      description="Löst lineare Gleichungssysteme über die erweiterte Matrix mit deutscher Gauß-Schreibweise und vollständigen Zeilenumformungen."
      onNavigate={onNavigate}
      supported={[
        "erweiterte Matrix in der Form 2, 1 | 1",
        "Systeme bis 6 Gleichungen und 6 Variablen",
        "REF und RREF mit elementaren Zeilenumformungen",
        "Brüche wie 1/3, Dezimalzahlen mit Punkt und ganze Zahlen",
        "eindeutige, keine und unendlich viele Lösungen"
      ]}
      aside={
        <details className="examples" open>
          <summary>Beispielaufgaben</summary>
          <div className="example-grid">
            {lgsExamples.map((example) => (
              <button type="button" key={example.label} onClick={() => setInput(example.value)}>
                <strong>{example.label}</strong>
                <span>{example.value.replace(/\n/g, " ; ")}</span>
                <small>{example.note}</small>
              </button>
            ))}
          </div>
        </details>
      }
    >
      <div className="input-card">
        <label htmlFor="lgs-input">Erweiterte Matrix (A | b)</label>
        <textarea id="lgs-input" className="lgs-input" value={input} onChange={(event) => setInput(event.target.value)} />

        <label>Verfahren</label>
        <div className="mode-toggle" role="group" aria-label="Verfahren wählen">
          <button type="button" className={method === "ref" ? "is-active" : ""} onClick={() => setMethod("ref")}>
            REF
          </button>
          <button type="button" className={method === "rref" ? "is-active" : ""} onClick={() => setMethod("rref")}>
            RREF
          </button>
        </div>

        <label>Darstellung</label>
        <div className="mode-toggle" role="group" aria-label="Zahlenformat wählen">
          <button type="button" className={displayMode === "fraction" ? "is-active" : ""} onClick={() => setDisplayMode("fraction")}>
            Brüche
          </button>
          <button type="button" className={displayMode === "decimal" ? "is-active" : ""} onClick={() => setDisplayMode("decimal")}>
            Dezimal
          </button>
        </div>

        <button type="button" className="button button-secondary" onClick={() => setInput("2, 1 | 1\n1, 3 | 2")}>
          <RotateCcw size={17} />
          Zurücksetzen
        </button>
      </div>

      {result.ok ? (
        <>
          <section className="analysis-grid">
            <article className="result-card">
              <p className="eyebrow">System</p>
              <MathFormula block tex={linearEquationsToTex(result.original, result.unknowns, displayMode)} />
            </article>
            <article className="result-card">
              <p className="eyebrow">Erweiterte Matrix</p>
              <MathFormula block tex={augmentedMatrixToTex(result.original, result.unknowns, displayMode)} />
            </article>
            <article className="result-card">
              <p className="eyebrow">Status</p>
              <p>{statusLabel(result)}</p>
              <MathFormula block tex={`\\operatorname{rang}(\\mathbf A)=${result.rankA},\\quad \\operatorname{rang}(\\mathbf A\\mid\\vec b)=${result.rankAugmented}`} />
            </article>
          </section>

          <section className="result-card result-card--wide">
            <p className="eyebrow">Lösung</p>
            {result.contradictionTex ? <MathFormula block tex={result.contradictionTex} /> : null}
            {result.solutionStatus === "none" ? <p>Das System ist inkonsistent und besitzt keine Lösung.</p> : <MathFormula block tex={solutionTexForDisplay(result, displayMode)} />}
          </section>

          <section className="result-card result-card--wide">
            <p className="eyebrow">{method === "ref" ? "Zeilenstufenform" : "Reduzierte Zeilenstufenform"}</p>
            <MathFormula block tex={augmentedMatrixToTex(method === "ref" ? result.ref : result.rref, result.unknowns, displayMode)} />
            <DetailedSteps
              summary="Zeilenumformungen Schritt für Schritt anzeigen"
              steps={(method === "ref" ? result.refSteps : result.rrefSteps).map((step, index) => ({
                title: index === 0 ? step.title : `${index}. ${step.title}`,
                text: step.text,
                tex: `${step.operationTex}\\qquad ${augmentedMatrixToTex(step.matrix, result.unknowns, displayMode)}`
              }))}
            />
          </section>

          {result.equations === 2 && result.unknowns === 2 ? (
            <section className="result-card result-card--wide">
              <p className="eyebrow">Geometrische Deutung</p>
              <SystemPlot result={result} />
            </section>
          ) : null}
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

function statusLabel(result: LgsAnalysis) {
  if (result.solutionStatus === "unique") return "Eindeutige Lösung";
  if (result.solutionStatus === "none") return "Keine Lösung";
  return "Unendlich viele Lösungen";
}

function solutionTexForDisplay(result: LgsAnalysis, displayMode: LgsDisplayMode) {
  if (result.solutionStatus !== "unique" || !result.solution) return result.solutionTex;
  return `\\vec{x}=\\begin{pmatrix}${result.solution.map((value) => fractionToTex(value, displayMode)).join("\\\\")}\\end{pmatrix}`;
}

function SystemPlot({ result }: { result: LgsAnalysis }) {
  const xs = Array.from({ length: 241 }, (_, index) => -6 + (12 * index) / 240);
  const traces: Trace[] = result.original.slice(0, 2).map((row, index) => {
    const a = fractionToNumber(row[0]);
    const b = fractionToNumber(row[1]);
    const c = fractionToNumber(row[2]);
    const y = Math.abs(b) < 1e-10 ? xs.map(() => null) : xs.map((x) => (c - a * x) / b);
    return { x: xs, y, name: `Gleichung ${index + 1}`, color: index === 0 ? "#09213f" : "#8b1e3f", width: 3 };
  });

  if (result.solutionStatus === "unique" && result.solution) {
    traces.push({
      x: [fractionToNumber(result.solution[0])],
      y: [fractionToNumber(result.solution[1])],
      name: "Schnittpunkt",
      color: "#0f6b5c",
      mode: "markers",
      width: 4
    });
  }

  return <PlotPanel traces={traces} height={430} xTitle="x_1" yTitle="x_2" equalAspect showEndLabels={false} />;
}
