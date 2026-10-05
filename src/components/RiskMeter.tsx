import { useEffect, useState } from 'react';
import type { RiskLevel } from '@/types';

interface RiskMeterProps {
  score: number;
  level: RiskLevel;
}

const levelConfig: Record<RiskLevel, { label: string; color: string; ringColor: string; bgColor: string; textColor: string }> = {
  safe: {
    label: 'Safe',
    color: '#10b981',
    ringColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500',
    textColor: 'text-emerald-400',
  },
  caution: {
    label: 'Caution',
    color: '#f59e0b',
    ringColor: 'text-amber-500',
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-400',
  },
  danger: {
    label: 'Danger',
    color: '#ef4444',
    ringColor: 'text-red-500',
    bgColor: 'bg-red-500',
    textColor: 'text-red-400',
  },
};

export default function RiskMeter({ score, level }: RiskMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const config = levelConfig[level];

  useEffect(() => {
    const duration = 900;
    const start = animatedScore;
    const diff = score - start;
    const startTime = performance.now();

    let frame: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(start + diff * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]); // eslint-disable-line react-hooks/exhaustive-deps

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-700/50"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke 0.4s ease',
              filter: `drop-shadow(0 0 8px ${config.color}80)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tabular-nums text-white">
            {animatedScore}
          </span>
          <span className="text-sm font-medium text-slate-400 mt-1">Risk Score</span>
        </div>
      </div>
      <div
        className={`mt-4 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${config.bgColor} bg-opacity-20 ${config.textColor}`}
        style={{ border: `1px solid ${config.color}40` }}
      >
        {config.label}
      </div>
    </div>
  );
}
