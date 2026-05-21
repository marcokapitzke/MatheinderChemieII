import { useEffect, useMemo, useState } from "react";

const pointCount = 260;
const width = 720;
const height = 430;
const xPad = 30;
const yCenter = 222;
const amplitude = 126;

export function FourierHeroScene() {
  const [active, setActive] = useState(false);
  const [blend, setBlend] = useState(0);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      setBlend((current) => {
        const target = active ? 1 : 0;
        if (Math.abs(current - target) < 0.002) return target;
        return current + (target - current) * 0.085;
      });
      frame = window.requestAnimationFrame(tick);
    };
    tick();
    return () => window.cancelAnimationFrame(frame);
  }, [active]);

  const paths = useMemo(() => buildHeroPaths(blend), [blend]);
  const spectrumOpacity = 0.18 + blend * 0.72;
  const interferogramOpacity = 0.92 - blend * 0.62;

  return (
    <div
      className="fourier-hero-scene"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onPointerDown={() => setActive(true)}
      onClick={() => setActive(true)}
      aria-label="Interaktive Fourier-Visualisierung: Interferogramm verwandelt sich bei Berührung in ein Spektrum"
    >
      <svg className="fourier-hero-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden="true">
        <defs>
          <linearGradient id="hero-line-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d8e9ff" stopOpacity="0.34" />
            <stop offset="48%" stopColor="#f8fbff" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#ffced8" stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id="hero-fill-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffced8" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#d8e9ff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#071a32" stopOpacity="0" />
          </linearGradient>
          <filter id="hero-glow" x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="hero-spectral-bloom" cx="66%" cy="45%" r="52%">
            <stop offset="0%" stopColor="#8b1e3f" stopOpacity="0.22" />
            <stop offset="48%" stopColor="#bdd7f3" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#071a32" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={width} height={height} fill="url(#hero-spectral-bloom)" opacity={0.9} />
        <g className="fourier-hero-grid" opacity={0.28}>
          {Array.from({ length: 12 }, (_, index) => (
            <path key={`v-${index}`} d={`M ${74 + index * 52} 54 L ${74 + index * 52} 374`} />
          ))}
          {Array.from({ length: 7 }, (_, index) => (
            <path key={`h-${index}`} d={`M 46 ${78 + index * 44} L 674 ${78 + index * 44}`} />
          ))}
        </g>

        <path className="fourier-area" d={paths.area} opacity={0.12 + blend * 0.15} />
        <path className="fourier-shadow-line" d={paths.mixed} opacity={0.34} />
        <path className="fourier-main-line" d={paths.mixed} filter="url(#hero-glow)" />
        <path className="fourier-interferogram-ghost" d={paths.interferogram} opacity={interferogramOpacity} />
        <path className="fourier-spectrum-ghost" d={paths.spectrum} opacity={spectrumOpacity} />

        <g className="fourier-peak-markers" opacity={blend}>
          {paths.peaks.map((peak) => (
            <circle key={peak.x} cx={peak.x} cy={peak.y} r={3.8 + peak.weight * 2.6} />
          ))}
        </g>
      </svg>
      <div className="fourier-scene-state" aria-hidden="true">
        <span style={{ opacity: 1 - blend * 0.74 }}>Interferogramm</span>
        <span style={{ opacity: 0.2 + blend * 0.8 }}>Spektrum</span>
      </div>
    </div>
  );
}

function buildHeroPaths(blend: number) {
  const interferogram: Array<{ x: number; y: number }> = [];
  const spectrum: Array<{ x: number; y: number }> = [];
  const mixed: Array<{ x: number; y: number }> = [];
  const peaks = [
    { center: 0.22, width: 0.018, weight: 0.54 },
    { center: 0.39, width: 0.024, weight: 0.82 },
    { center: 0.58, width: 0.019, weight: 1 },
    { center: 0.75, width: 0.026, weight: 0.68 }
  ];

  for (let index = 0; index < pointCount; index += 1) {
    const t = index / (pointCount - 1);
    const x = xPad + t * (width - xPad * 2);
    const decay = Math.exp(-2.35 * t);
    const timeSignal =
      decay *
      (0.66 * Math.cos(2 * Math.PI * 8.2 * t) +
        0.36 * Math.cos(2 * Math.PI * 13.6 * t + 0.7) +
        0.2 * Math.cos(2 * Math.PI * 21 * t - 0.45));
    const spectralSignal = peaks.reduce((sum, peak) => sum + peak.weight * gaussian(t, peak.center, peak.width), 0);
    const spectralEnvelope = Math.min(1.18, spectralSignal);
    const interferenceY = yCenter - timeSignal * amplitude;
    const spectrumY = yCenter + 86 - spectralEnvelope * 248;
    const y = interferenceY * (1 - blend) + spectrumY * blend;
    interferogram.push({ x, y: interferenceY });
    spectrum.push({ x, y: spectrumY });
    mixed.push({ x, y });
  }

  const bottom = height - 50;
  const area = `${pointsToPath(mixed)} L ${width - xPad} ${bottom} L ${xPad} ${bottom} Z`;

  return {
    interferogram: pointsToPath(interferogram),
    spectrum: pointsToPath(spectrum),
    mixed: pointsToPath(mixed),
    area,
    peaks: peaks.map((peak) => {
      const x = xPad + peak.center * (width - xPad * 2);
      const y = yCenter + 86 - peak.weight * 248;
      return { x, y, weight: peak.weight };
    })
  };
}

function pointsToPath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
}

function gaussian(x: number, center: number, sigma: number) {
  const scaled = (x - center) / sigma;
  return Math.exp(-0.5 * scaled * scaled);
}
