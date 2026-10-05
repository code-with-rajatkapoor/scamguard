import { History, Trash2, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { ScanRecord } from '@/types';

interface HistoryPanelProps {
  history: ScanRecord[];
  onSelect: (record: ScanRecord) => void;
  onDelete: (id: string) => void;
}

const levelIcon = {
  safe: ShieldCheck,
  caution: AlertTriangle,
  danger: ShieldAlert,
};

const levelColor = {
  safe: 'text-emerald-400',
  caution: 'text-amber-400',
  danger: 'text-red-400',
};

const levelBg = {
  safe: 'bg-emerald-500/10 border-emerald-500/20',
  caution: 'bg-amber-500/10 border-amber-500/20',
  danger: 'bg-red-500/10 border-red-500/20',
};

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function HistoryPanel({ history, onSelect, onDelete }: HistoryPanelProps) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
        <History className="w-5 h-5 text-slate-400" />
        <h3 className="font-semibold text-white">Scan History</h3>
        <span className="text-xs text-slate-500 ml-auto">{history.length} scans</span>
      </div>

      {history.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm text-slate-500">No scans yet. Your analysis history will appear here.</p>
        </div>
      ) : (
        <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-800/60">
          {history.map((record) => {
            const Icon = levelIcon[record.risk_level];
            const color = levelColor[record.risk_level];
            const bg = levelBg[record.risk_level];
            const preview = record.input_text.length > 80
              ? record.input_text.slice(0, 80) + '...'
              : record.input_text;
            return (
              <div
                key={record.id}
                className="group flex items-start gap-3 px-5 py-3.5 hover:bg-slate-800/40 cursor-pointer transition-colors"
                onClick={() => onSelect(record)}
              >
                <div className={`shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{preview}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium ${color}`}>
                      {record.risk_level === 'safe' ? 'Safe' : record.risk_level === 'caution' ? 'Caution' : 'Danger'}
                    </span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">Score: {record.risk_score}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{timeAgo(record.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(record.id);
                  }}
                  className="shrink-0 p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Delete scan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
