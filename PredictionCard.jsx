export default function PredictionCard({ prediction }) {
  if (!prediction) return null;

  const { probability, prediction: pred, risk_category, risk_color } = prediction;

  const colorMap = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-800',
      bar: 'bg-green-500',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      badge: 'bg-orange-100 text-orange-800',
      bar: 'bg-orange-500',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-800',
      bar: 'bg-red-500',
    },
  };

  const c = colorMap[risk_color] || colorMap.orange;

  return (
    <div className={`rounded-2xl border-2 ${c.border} ${c.bg} p-6 shadow-sm`}>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
        Prediction Result
      </h2>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-3xl font-bold text-slate-800">
            {(probability * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-slate-500 mt-1">Allergen Probability</p>
        </div>
        <div className="text-right">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${c.badge}`}>
            {risk_category}
          </span>
          <p className="text-sm text-slate-600 mt-2 font-medium">
            {pred === 1 ? '⚠ Allergen Detected' : '✓ Non-Allergen'}
          </p>
        </div>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div
          className={`${c.bar} h-2.5 rounded-full transition-all duration-700`}
          style={{ width: `${(probability * 100).toFixed(1)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}