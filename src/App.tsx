import { useEffect, useState } from "react";
import { Header } from "./components/Layout";
import { HomePage } from "./components/HomePage";
import { VectorModule } from "./components/VectorModule";
import { MatrixModule } from "./components/MatrixModule";
import { LgsModule } from "./components/LgsModule";
import { MultivariableModule } from "./components/MultivariableModule";
import { OdeModule } from "./components/OdeModule";
import { FourierModule } from "./components/FourierModule";
import type { RouteId } from "./data/modules";

const routeIds: RouteId[] = ["home", "vectors", "matrices", "lgs", "multivar", "odes", "fourier"];

function routeFromHash(): RouteId {
  const hash = window.location.hash.replace("#", "") as RouteId;
  return routeIds.includes(hash) ? hash : "home";
}

export default function App() {
  const [route, setRoute] = useState<RouteId>(routeFromHash);

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const onHashChange = () => {
      setRoute(routeFromHash());
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (next: RouteId) => {
    window.location.hash = next === "home" ? "" : next;
    setRoute(next);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  return (
    <>
      <Header route={route} onNavigate={navigate} />
      {route === "home" ? <HomePage onNavigate={navigate} /> : null}
      {route === "vectors" ? <VectorModule onNavigate={navigate} /> : null}
      {route === "matrices" ? <MatrixModule onNavigate={navigate} /> : null}
      {route === "lgs" ? <LgsModule onNavigate={navigate} /> : null}
      {route === "multivar" ? <MultivariableModule onNavigate={navigate} /> : null}
      {route === "odes" ? <OdeModule onNavigate={navigate} /> : null}
      {route === "fourier" ? <FourierModule onNavigate={navigate} /> : null}
      <footer className="site-footer">
        <div className="section-shell footer-inner">
          <span>Mathe in der (Bio-)Chemie II</span>
          <a href="https://marcokapitzke.github.io/MatheinderChemie/" target="_blank" rel="noreferrer">
            Band I öffnen
          </a>
        </div>
      </footer>
    </>
  );
}
