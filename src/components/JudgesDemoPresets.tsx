import { demoPresets, type DemoPreset } from './demoPresets';

interface JudgesDemoPresetsProps {
  activeId: string | null;
  disabled?: boolean;
  onSelect: (preset: DemoPreset) => void;
}

export default function JudgesDemoPresets({ activeId, disabled, onSelect }: JudgesDemoPresetsProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Judges Demo Presets</p>
        <p className="text-[10px] text-slate-600 hidden sm:block">One click fills the message and runs the scan</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {demoPresets.map((preset) => {
          const Icon = preset.icon;
          const isActive = activeId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(preset)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${preset.accent} ${isActive ? 'ring-2 ring-teal-400/70 shadow-lg shadow-teal-500/10' : ''}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
