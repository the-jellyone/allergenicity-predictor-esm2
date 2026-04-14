import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell,
} from "recharts";

export default function MotifChart({ saliency = [], topResidues = [], sequence = "" }) {
  if (!saliency.length) return null;

  const data = saliency.map((score, i) => ({
    position: i + 1,
    score: parseFloat(score.toFixed(4)),
    aa: sequence[i] || "",
  }));

  const topSet = new Set(topResidues.map((r) => r.position));

  const getColor = (value) => {
    if (value > 0.7) return "#ef4444";
    if (value > 0.4) return "#f97316";
    return "#3b82f6";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          className="px-3 py-2 text-sm"
        >
          <p className="font-semibold text-slate-700">Position {d.position}</p>
          <p className="text-slate-500">
            Amino acid:{" "}
            <span className="font-mono font-bold">{d.aa}</span>
          </p>
          <p className="text-slate-500">
            Score: <span className="font-semibold">{d.score}</span>
          </p>
          {topSet.has(d.position - 1) && (
            <p className="text-red-500 font-semibold mt-1">★ Top residue</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-8">
      <h3 className="text-lg font-semibold text-slate-700 mb-1">
        Motif Analysis
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        Per-residue importance scores. Highlighted bars are top contributing residues.
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="position"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
            label={{
              value: "Saliency Score",
              angle: -90,
              position: "insideLeft",
              fill: "#64748b",
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="score" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  topSet.has(entry.position - 1)
                    ? "#ef4444"
                    : getColor(entry.score)
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Top Residues Grid */}
      {topResidues.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Top Residues
          </p>
          <div className="grid grid-cols-5 gap-2">
            {topResidues.slice(0, 10).map((r) => (
              <div
                key={r.position}
                className="bg-red-50 border border-red-100 rounded-lg p-2 text-center"
              >
                <p className="font-mono font-bold text-red-600 text-sm">
                  {r.amino_acid}
                </p>
                <p className="text-xs text-slate-500">pos {r.position}</p>
                <p className="text-xs font-semibold text-slate-600">{r.score}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}