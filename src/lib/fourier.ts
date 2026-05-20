export type FourierPreset = "gaussian" | "wide-gaussian" | "narrow-gaussian" | "rect" | "damped" | "twofreq";

export interface FourierData {
  xs: number[];
  signal: number[];
  ks: number[];
  spectrum: number[];
  phase: number[];
  description: string;
}

export interface InterferogramData {
  time: number[];
  signal: number[];
  frequency: number[];
  spectrum: number[];
}

export function standardFourier(preset: FourierPreset, width = 1.1, frequency = 3, damping = 0.35): FourierData {
  const xs = range(-10, 10, 512);
  const signal = xs.map((x) => signalValue(preset, x, width, frequency, damping));
  const transformed = dft(signal, 20 / xs.length);
  const center = transformed.length / 2;
  const ks = transformed.map((_, index) => ((index - center) * 2 * Math.PI) / 20);
  const spectrum = transformed.map((value) => Math.hypot(value.re, value.im));
  const phase = transformed.map((value) => Math.atan2(value.im, value.re));

  return {
    xs,
    signal,
    ks,
    spectrum,
    phase,
    description: descriptionFor(preset)
  };
}

export function interferogramToSpectrum(centerFrequency = 5, damping = 0.18, duration = 16, noise = 0): InterferogramData {
  const points = 512;
  const dt = duration / points;
  const time = Array.from({ length: points }, (_, index) => index * dt);
  const signal = time.map((t, index) => {
    const deterministicNoise = noise * 0.12 * Math.sin(index * 12.9898) * Math.cos(index * 78.233);
    return Math.exp(-damping * t) * Math.cos(2 * Math.PI * centerFrequency * t) + deterministicNoise;
  });
  const transformed = positiveDft(signal, dt);
  const frequency = transformed.map((_, index) => index / duration);
  const spectrum = transformed.map((value) => Math.hypot(value.re, value.im));
  return { time, signal, frequency, spectrum };
}

export function signalValue(preset: FourierPreset, x: number, width: number, frequency: number, damping: number) {
  if (preset === "gaussian" || preset === "wide-gaussian" || preset === "narrow-gaussian") {
    const sigma = preset === "wide-gaussian" ? width * 1.8 : preset === "narrow-gaussian" ? width * 0.45 : width;
    return Math.exp(-(x * x) / (2 * sigma * sigma));
  }
  if (preset === "rect") return Math.abs(x) <= width ? 1 : 0;
  if (preset === "damped") return x >= 0 ? Math.exp(-damping * x) * Math.cos(frequency * x) : 0;
  if (preset === "twofreq") return Math.cos(frequency * x) + 0.75 * Math.cos((frequency + 0.75) * x);
  return 0;
}

export function dft(signal: number[], spacing = 1): Array<{ re: number; im: number }> {
  const n = signal.length;
  const raw = Array.from({ length: n }, (_, k) => {
    let re = 0;
    let im = 0;
    for (let j = 0; j < n; j += 1) {
      const angle = (-2 * Math.PI * (k - n / 2) * j) / n;
      re += signal[j] * Math.cos(angle) * spacing;
      im += signal[j] * Math.sin(angle) * spacing;
    }
    return { re, im };
  });
  return raw;
}

function positiveDft(signal: number[], spacing = 1): Array<{ re: number; im: number }> {
  const n = signal.length;
  return Array.from({ length: n / 2 }, (_, k) => {
    let re = 0;
    let im = 0;
    for (let j = 0; j < n; j += 1) {
      const angle = (-2 * Math.PI * k * j) / n;
      re += signal[j] * Math.cos(angle) * spacing;
      im += signal[j] * Math.sin(angle) * spacing;
    }
    return { re, im };
  });
}

function descriptionFor(preset: FourierPreset) {
  if (preset === "rect") return "Rechteckfunktionen erzeugen eine Sinc-artige Spektralstruktur mit Nebenmaxima.";
  if (preset === "damped") return "Eine gedämpfte Schwingung erzeugt einen verbreiterten Peak im Frequenzbereich.";
  if (preset === "twofreq") return "Zwei nahe Frequenzen zeigen, wie Messdauer und Dämpfung die Auflösung bestimmen.";
  if (preset === "wide-gaussian") return "Eine breite Gaußfunktion besitzt eine schmale Fourier-Verteilung.";
  if (preset === "narrow-gaussian") return "Eine schmale Gaußfunktion besitzt eine breite Fourier-Verteilung.";
  return "Die Gaußfunktion bleibt unter Fourier-Transformation wieder gaußförmig.";
}

function range(min: number, max: number, points: number) {
  return Array.from({ length: points }, (_, index) => min + ((max - min) * index) / (points - 1));
}
