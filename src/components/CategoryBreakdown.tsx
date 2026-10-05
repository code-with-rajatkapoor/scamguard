import type { ScanResult } from '@/types';

interface CategoryBreakdownProps {
  breakdown: ScanResult['breakdown'];
}

const barColors = [
  'bg-red-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-cyan-500',
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
