import { useMemo, useState } from "react";
import { fourierExamples, type RouteId } from "../data/modules";
import { interferogramToSpectrum, standardFourier, type FourierPreset } from "../lib/fourier";
import { CalculatorLayout } from "./CalculatorLayout";
import { MathFormula } from "./MathFormula";
import { PlotPanel } from "./PlotPanel";

interface Props {
  onNavigate: (route: RouteId) => void;
}

export function FourierModule({ onNavigate }: Props) {
  const [mode, setMode] = useState<"standard" | "interferogram">("standard");
  const [preset, setPreset] = useState<FourierPreset>("gaussian");
  const [width, setWidth] = useState(1.1);
  const [frequency, setFrequency] = useState(3);
  const [damping, setDamping] = useState(0.35);
  const standard = useMemo(() => standardFourier(preset, width, frequency, damping), [preset, width, frequency, damping]);
  const interferogram = useMemo(() => interferogramToSpectrum(frequency, damping, 16), [frequency, damping]);

  return (
    <CalculatorLayout
      route="fourier"
      title="Fourier-Transformation & Spektren"
      eyebrow="Spektralanalyse"
      chapter="Band II: Fourier-Transformation"
      description="Visualisiert Fourier-Paare, Breite-Frequenz-Beziehungen und Interferogramm-zu-Spektrum-Simulationen."
      onNavigate={onNavigate}
      supported={[
        "Standardfunktionen mit numerischer Fourier-Darstellung",
        "Gauß, Rechteck, Dreieck, beidseitiger Exponentialabfall, Lorentz-Linie, Cosinus und gedämpfte Schwingung",
        "Interferogramm zu Spektrum als didaktische DFT-Simulation",
        "Konvention F(k)=∫ f(x) exp(-ikx) dx",
        "freie symbolische Fourier-Transformation nicht Teil dieses Rechners"
      ]}
      aside={
        <details className="examples" open>
          <summary>Beispielaufgaben</summary>
          <div className="example-grid">
            {fourierExamples.map((example) => (
              <button
                type="button"
                key={example.label}
                onClick={() => {
                  setPreset(example.value as FourierPreset);
                  setMode(example.value === "twofreq" ? "interferogram" : "standard");
                }}
              >
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
        <div className="segmented" role="tablist" aria-label="Fourier-Modus">
          <button type="button" className={mode === "standard" ? "is-active" : ""} onClick={() => setMode("standard")}>
            Standardpaare
          </button>
          <button type="button" className={mode === "interferogram" ? "is-active" : ""} onClick={() => setMode("interferogram")}>
            Interferogramm
          </button>
        </div>
        <label htmlFor="preset-select">Funktion</label>
        <select id="preset-select" value={preset} onChange={(event) => setPreset(event.target.value as FourierPreset)}>
          <option value="gaussian">Gaußfunktion</option>
          <option value="rect">Rechteckfunktion</option>
          <option value="triangle">Dreiecksignal</option>
          <option value="two-sided-exp">Beidseitiger Exponentialabfall</option>
          <option value="lorentzian">Lorentz-Linie</option>
          <option value="cosine">Cosinus-Schwingung</option>
          <option value="damped">Gedämpfte Schwingung</option>
          <option value="twofreq">Zwei nahe Frequenzen</option>
          <option value="wide-gaussian">Breites Signal</option>
          <option value="narrow-gaussian">Schmales Signal</option>
        </select>
        <label htmlFor="width-slider">Breite</label>
        <input id="width-slider" type="range" min={0.35} max={3} step={0.05} value={width} onChange={(event) => setWidth(Number(event.target.value))} />
        <span className="range-label">{width.toFixed(2)}</span>
        <label htmlFor="frequency-slider">Frequenz</label>
        <input id="frequency-slider" type="range" min={1} max={8} step={0.1} value={frequency} onChange={(event) => setFrequency(Number(event.target.value))} />
        <span className="range-label">{frequency.toFixed(1)}</span>
        <label htmlFor="damping-slider">Dämpfung / Linienbreite</label>
        <input id="damping-slider" type="range" min={0.05} max={1.2} step={0.05} value={damping} onChange={(event) => setDamping(Number(event.target.value))} />
        <span className="range-label">{damping.toFixed(2)}</span>
      </div>

      <section className="result-card">
        <p className="eyebrow">Fourier-Konvention</p>
        <MathFormula block tex={`F(k)=\\int_{-\\infty}^{\\infty} f(x)\\,\\operatorname{exp}(-\\mathrm{i}kx)\\,\\mathrm{d}x`} />
        <p>{mode === "standard" ? standard.description : "Das Interferogramm wird diskret abgetastet und numerisch transformiert."}</p>
      </section>

      {mode === "standard" ? (
        <section className="result-card result-card--wide">
          <p className="eyebrow">Standardfunktion und Fourier-Bereich</p>
          <div className="dual-plot-grid">
            <PlotPanel traces={[{ x: standard.xs, y: standard.signal, name: "f(x)", color: "#09213f" }]} xTitle="x" yTitle="f(x)" height={400} />
            <PlotPanel traces={[{ x: standard.ks, y: standard.spectrum, name: "|F(k)|", color: "#8b1e3f" }]} xTitle="k" yTitle="|F(k)|" height={400} />
          </div>
        </section>
      ) : (
        <section className="result-card result-card--wide">
          <p className="eyebrow">Interferogramm → Spektrum</p>
          <div className="dual-plot-grid">
            <PlotPanel traces={[{ x: interferogram.time, y: interferogram.signal, name: "Interferogramm", color: "#09213f" }]} xTitle="t" yTitle="I(t)" height={400} />
            <PlotPanel traces={[{ x: interferogram.frequency, y: interferogram.spectrum, name: "Spektrum", color: "#8b1e3f" }]} xTitle="ν" yTitle="Intensität" height={400} />
          </div>
        </section>
      )}

    </CalculatorLayout>
  );
}
