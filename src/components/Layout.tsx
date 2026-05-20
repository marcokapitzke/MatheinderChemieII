import { Atom, ExternalLink } from "lucide-react";
import type { RouteId } from "../data/modules";
import { modules } from "../data/modules";

interface LayoutProps {
  route: RouteId;
  onNavigate: (route: RouteId) => void;
}

export function Header({ route, onNavigate }: LayoutProps) {
  return (
    <header className="site-header">
      <nav className="nav section-shell" aria-label="Hauptnavigation">
        <button className="brand" type="button" onClick={() => onNavigate("home")} aria-label="Startseite">
          <Atom size={19} />
          <span>MathChem II</span>
        </button>
        <div className="nav-links">
          {modules.map((module) => (
            <button
              key={module.id}
              className={route === module.id ? "is-active" : ""}
              type="button"
              onClick={() => onNavigate(module.id)}
            >
              {shortNavTitle(module.title)}
            </button>
          ))}
        </div>
        <a className="nav-note" href="https://marcokapitzke.github.io/MatheinderChemie/" target="_blank" rel="noreferrer">
          <ExternalLink size={16} />
          Band I
        </a>
      </nav>
    </header>
  );
}

function shortNavTitle(title: string) {
  return title
    .replace("Vektorrechnung & Gram-Schmidt", "Vektoren")
    .replace("Matrizen & lineare Gleichungssysteme", "Matrizen")
    .replace("Mehrdimensionale Analysis", "Analysis")
    .replace("Gewöhnliche Differentialgleichungen", "DGL")
    .replace("Fourier-Transformation & Spektren", "Fourier");
}
