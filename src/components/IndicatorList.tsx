import { AlertTriangle, ShieldAlert, Info, ShieldCheck } from 'lucide-react';
import type { DetectedIndicator } from '@/types';

interface IndicatorListProps {
  indicators: DetectedIndicator[];
}

const severityConfig = {
  high: {
    icon: ShieldAlert,
    color: 'text-red-400',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    label: 'High',
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    label: 'Medium',
  },
  low: {
    icon: Info,
    color: 'text-sky-400',
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/10',
    label: 'Low',
  },
};

export default function IndicatorList({ indicators }: IndicatorListProps) {
  if (indicators.length === 0) {
    return (
      <div className="flex items-center gap-3 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
        <div>
          <p className="font-semibold text-emerald-300">No Threats Detected</p>
          <p className="text-sm text-slate-400 mt-0.5">
            Our engine found no common phishing or scam indicators in this text.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {indicators.map((indicator, index) => {
        const config = severityConfig[indicator.severity];
        const Icon = config.icon;
        return (
          <div
            key={`${indicator.type}-${index}`}
            className={`flex gap-4 p-4 rounded-xl ${config.bg} ${config.border} border transition-all duration-300 hover:scale-[1.01]`}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className={`shrink-0 w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-white text-sm">{indicator.label}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`}>
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">{indicator.description}</p>
              {indicator.match && (
                <p className="text-xs text-slate-500 mt-2 font-mono bg-slate-900/60 px-3 py-1.5 rounded-md inline-block">
                  &ldquo;{indicator.match}&rdquo;
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
