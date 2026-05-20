import { useEffect, useRef } from "react";

interface AdvancedPlotPanelProps {
  data: any[];
  layout?: Record<string, unknown>;
  height?: number;
  title?: string;
  ariaLabel?: string;
}

export function AdvancedPlotPanel({ data, layout = {}, height = 420, title, ariaLabel }: AdvancedPlotPanelProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    async function render() {
      if (!ref.current) return;
      const { default: Plotly } = await import("plotly.js-dist-min");
      if (!active || !ref.current) return;
      await Plotly.react(
        ref.current,
        data,
        {
          title: title ? { text: title, font: { size: 15, color: "#132033", family: "Georgia, 'Times New Roman', serif" }, x: 0.02 } : undefined,
          height,
          margin: { l: 58, r: 32, t: title ? 58 : 30, b: 58 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          font: { family: "Inter, system-ui, sans-serif", color: "#263247" },
          hovermode: "closest",
          uirevision: "mathchem-ii-plot",
          ...layout
        },
        {
          responsive: true,
          displaylogo: false,
          scrollZoom: true,
          modeBarButtonsToRemove: ["lasso2d", "select2d", "autoScale2d", "toggleSpikelines"]
        }
      );
    }
    render();
    return () => {
      active = false;
      const element = ref.current;
      if (element) {
        import("plotly.js-dist-min").then(({ default: Plotly }) => Plotly.purge(element));
      }
    };
  }, [data, height, layout, title]);

  return <div className="plot-panel plot-panel--advanced" ref={ref} aria-label={ariaLabel ?? title ?? "Interaktiver Plot"} />;
}

export const scientificAxis = {
  showgrid: true,
  zeroline: false,
  gridcolor: "rgba(167, 181, 202, 0.54)",
  griddash: "dot",
  tickfont: { size: 11, color: "#607086" },
  titlefont: { size: 12, color: "#344256" }
};
