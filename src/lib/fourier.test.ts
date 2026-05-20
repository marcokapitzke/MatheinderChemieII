import { describe, expect, it } from "vitest";
import { interferogramToSpectrum, standardFourier } from "./fourier";

describe("fourier visualizer", () => {
  it("shows broader spectra for narrower Gaussian signals", () => {
    const wide = standardFourier("wide-gaussian", 1.1);
    const narrow = standardFourier("narrow-gaussian", 1.1);
    expect(secondMoment(narrow.ks, narrow.spectrum)).toBeGreaterThan(secondMoment(wide.ks, wide.spectrum));
  });

  it("produces a Sinc-like central peak for a rectangle", () => {
    const rect = standardFourier("rect", 1.2);
    const max = Math.max(...rect.spectrum);
    const center = rect.spectrum[Math.floor(rect.spectrum.length / 2)];
    expect(center).toBeCloseTo(max, 5);
  });

  it("produces a central maximum for a Lorentz-like line", () => {
    const lorentz = standardFourier("lorentzian", 1.1);
    const max = Math.max(...lorentz.spectrum);
    const center = lorentz.spectrum[Math.floor(lorentz.spectrum.length / 2)];
    expect(center).toBeCloseTo(max, 5);
  });

  it("supports additional standard signal shapes", () => {
    const triangle = standardFourier("triangle", 1.2);
    const twoSidedExp = standardFourier("two-sided-exp", 1.2);
    const triangleCenter = triangle.spectrum[Math.floor(triangle.spectrum.length / 2)];
    const expCenter = twoSidedExp.spectrum[Math.floor(twoSidedExp.spectrum.length / 2)];
    expect(triangleCenter).toBeCloseTo(Math.max(...triangle.spectrum), 5);
    expect(expCenter).toBeCloseTo(Math.max(...twoSidedExp.spectrum), 5);
  });

  it("creates a spectral peak for a damped interferogram", () => {
    const data = interferogramToSpectrum(5, 0.2, 16);
    const peakIndex = data.spectrum.indexOf(Math.max(...data.spectrum));
    expect(data.frequency[peakIndex]).toBeCloseTo(5, 0);
  });
});

function secondMoment(xs: number[], ys: number[]) {
  const total = ys.reduce((sum, value) => sum + value, 0);
  return ys.reduce((sum, value, index) => sum + value * xs[index] * xs[index], 0) / total;
}
