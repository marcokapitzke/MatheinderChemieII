import { ArrowRight, Atom, BookMarked, BrainCircuit, Cpu, ShieldCheck } from "lucide-react";
import { modules, type RouteId } from "../data/modules";
import { FourierHeroScene } from "./FourierHeroScene";
import { MathFormula } from "./MathFormula";

interface HomePageProps {
  onNavigate: (route: RouteId) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <main>
      <section className="home-hero">
        <div className="section-shell hero-grid">
          <div className="hero-text">
            <p className="eyebrow">Begleitplattform zum zweiten Band</p>
            <h1 className="hero-title hero-title--chem">
              <span className="title-line title-line--keep">Interaktive Mathematik</span>
              <span className="title-line title-line--keep">für die (Bio-)Chemie II</span>
            </h1>
            <p className="hero-subtitle">Der interaktive Rechner zum zweiten Band.</p>
            <p className="hero-copy">
              Ein digitales Mathematik-Labor für Standardaufgaben aus dem naturwissenschaftlichen Grundstudium: Vektoren, Matrizen,
              lineare Gleichungssysteme, Differentialgleichungen, mehrdimensionale Analysis und Fourier-Transformation.
            </p>
            <div className="hero-actions">
              <button type="button" className="button button-primary" onClick={() => onNavigate("vectors")}>
                Vektorlabor öffnen
                <ArrowRight size={17} />
              </button>
              <button type="button" className="button button-secondary" onClick={() => onNavigate("fourier")}>
                Fourier-Visualizer starten
              </button>
            </div>
          </div>

          <FourierHeroScene />
        </div>
      </section>

      <section className="section-shell purpose-band">
        <div className="purpose-heading">
          <BookMarked size={24} />
          <div>
            <h2>Der interaktive Rechner zum zweiten Band.</h2>
          <p>Lineare Algebra, Gauß-Verfahren, Analysis im Raum, Differentialgleichungen und Spektren in einem konsistenten digitalen Lernraum.</p>
          </div>
        </div>
        <div className="book-panel book-panel--disabled" aria-label="Buch erscheint bald">
          <span className="book-placeholder">
            <Atom size={28} />
          </span>
          <span>
            <strong>Buch erscheint bald</strong>
            <small>Interaktive Begleitplattform im Aufbau</small>
          </span>
        </div>
      </section>

      <section className="section-shell module-section" aria-labelledby="module-title">
        <div className="section-heading">
          <p className="eyebrow">Module</p>
          <h2 id="module-title">Sechs Rechner, ein zweiter mathematischer Lernraum.</h2>
        </div>
        <div className="module-grid">
          {modules.map((module, index) => (
            <button className={`module-card module-card--${module.id}`} type="button" key={module.id} onClick={() => onNavigate(module.id)}>
              <span className="card-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="module-eyebrow">{module.eyebrow}</span>
              <h3>{renderModuleTitle(module.id, module.title)}</h3>
              <p>{module.description}</p>
              <div className="module-mini-formula">
                <MathFormula tex={module.formula} />
              </div>
              <span className="module-card-action">Modul öffnen</span>
              <small>{module.chapter}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="section-shell quality-section">
        <details className="quality-disclosure">
          <summary>
            <span>
              <span className="eyebrow">Engineering-Qualität</span>
              <strong>Gebaut wie ein wissenschaftliches Werkzeug.</strong>
            </span>
          </summary>
          <div className="quality-grid">
            <article>
              <ShieldCheck size={22} />
              <strong>5.995 generierte Prüffälle</strong>
              <span>Gram-Schmidt, Matrixrechner und DGL-Rechner werden gegen unabhängige mathematische Invarianten geprüft.</span>
            </article>
            <article>
              <BrainCircuit size={22} />
              <strong>Didaktische Rechenwege</strong>
              <span>Ergebnisse werden mit nachvollziehbaren Methoden, Formeldarstellung und klar markierten numerischen Näherungen ausgegeben.</span>
            </article>
            <article>
              <Cpu size={22} />
              <strong>Statisch auf GitHub Pages</strong>
              <span>React, TypeScript, KaTeX, Plotly und Three.js laufen vollständig im Browser.</span>
            </article>
          </div>
        </details>
      </section>
    </main>
  );
}

function renderModuleTitle(id: RouteId, title: string) {
  if (id === "vectors") {
    return (
      <>
        <span className="title-line title-line--keep">Vektorrechnung &</span>
        <span className="title-line">Gram-Schmidt</span>
      </>
    );
  }
  if (id === "matrices") {
    return (
      <>
        <span className="title-line">Matrizen</span>
      </>
    );
  }
  if (id === "lgs") {
    return (
      <>
        <span className="title-line title-line--keep">Lineare</span>
        <span className="title-line">Gleichungssysteme</span>
      </>
    );
  }
  if (id === "fourier") {
    return (
      <>
        <span className="title-line title-line--keep">Fourier-Transformation &</span>
        <span className="title-line">Spektren</span>
      </>
    );
  }
  return title;
}
