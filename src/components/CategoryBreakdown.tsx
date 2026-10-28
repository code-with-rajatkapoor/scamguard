import type { ScanResult } from '@/types';

interface CategoryBreakdownProps {
  breakdown: ScanResult['breakdown'];
}

const barColors = [
  'bg-gradient-to-r from-red-500 to-red-400',
  'bg-gradient-to-r from-amber-500 to-amber-400',
  'bg-gradient-to-r from-sky-500 to-sky-400',
  'bg-gradient-to-r from-violet-500 to-violet-400',
  'bg-gradient-to-r from-teal-500 to-teal-400',
  'bg-gradient-to-r from-rose-500 to-rose-400',
  'bg-gradient-to-r from-indigo-500 to-indigo-400',
  'bg-gradient-to-r from-cyan-500 to-cyan-400',
];

export default function CategoryBreakdown({ breakdown }: CategoryBreakdownProps) {
  if (breakdown.length === 0) return null;

  const maxScore = Math.max(...breakdown.map((b) => b.score), 1);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Threat Category Breakdown</h4>
      {breakdown.map((item, index) => {
        const widthPercent = (item.score / maxScore) * 100;
        const color = barColors[index % barColors.length];
        return (
          <div key={item.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{item.category}</span>
              <span className="text-slate-500 font-mono">{item.score}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
                style={{ width: `${widthPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
