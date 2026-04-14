import React, { useEffect, useRef } from "react";
import * as $3Dmol from "3dmol";

const colorLegend = [
  { color: "#0000ff", label: "N-terminus (start)" },
  { color: "#00ffff", label: "Early chain" },
  { color: "#00ff00", label: "Mid chain" },
  { color: "#ffff00", label: "Late chain" },
  { color: "#ff7700", label: "Near end" },
  { color: "#ff0000", label: "C-terminus (end)" },
];

const StructureViewer = ({ pdbData }) => {
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!pdbData || !viewerRef.current) return;

    const container = viewerRef.current;
    container.innerHTML = "";

    const viewer = $3Dmol.createViewer(container, {
      backgroundColor: "white",
    });

    viewer.addModel(pdbData, "pdb");
    viewer.setStyle({}, { cartoon: { color: "spectrum" } });
    viewer.zoomTo();
    viewer.render();

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [pdbData]);

  return (
    <div className="glass-card p-8">
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        Protein Structure
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        3D visualization of predicted protein structure. Colors represent position along the chain.
      </p>

      <div className="relative rounded-xl overflow-hidden" style={{ height: "500px" }}>
        <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-200 rounded-full opacity-20 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-2xl pointer-events-none"></div>
        <div
          ref={viewerRef}
          style={{
            width: "100%",
            height: "100%",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
          }}
        />
      </div>

      {/* Color Legend */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Color Legend
        </p>
        <div className="flex flex-wrap gap-4">
          {colorLegend.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StructureViewer;