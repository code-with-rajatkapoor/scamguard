import { useState } from 'react';
import { History, Trash2, ShieldCheck, AlertTriangle, ShieldAlert, Clock, Download, Loader2 } from 'lucide-react';
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
  const [exportingFiltered, setExportingFiltered] = useState(false);

  const filtered = history.filter((h) => h.risk_level === 'danger' || h.risk_level === 'caution');

  const handleExportFiltered = async () => {
    if (filtered.length === 0) return;

    setExportingFiltered(true);
    try {
      // Export as JSON
      const jsonBlob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json;charset=utf-8;' });
      const jsonLink = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[^0-9]/g, '');
      jsonLink.href = URL.createObjectURL(jsonBlob);
      jsonLink.download = `scamguard-filtered-${timestamp}.json`;
      jsonLink.click();
      URL.revokeObjectURL(jsonLink.href);

      // Export as CSV
      const headers = ['Timestamp', 'Risk Score', 'Risk Level', 'Indicators', 'Summary'];
      const rows = filtered.map((h) => [
        h.created_at || '',
        h.risk_score?.toString() || '',
        h.risk_level || '',
        `${h.detected_indicators?.length || 0}`,
        `${h.summary?.replace(/"/g, '""') || ''}"`,
      ]);
      const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
      const csvBlob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const csvLink = document.createElement('a');
      csvLink.href = URL.createObjectURL(csvBlob);
      csvLink.download = `scamguard-filtered-${timestamp}.csv`;
      csvLink.click();
      URL.revokeObjectURL(csvLink.href);
    } finally {
      setExportingFiltered(false);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden card-hover">
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
        <div className="max-h-[600px] overflow-y-auto">
          {history.map((record, idx) => {
            const Icon = levelIcon[record.risk_level];
            const color = levelColor[record.risk_level];
            const bg = levelBg[record.risk_level];
            const preview = record.input_text.length > 80
              ? record.input_text.slice(0, 80) + '...'
              : record.input_text;
            return (
              <div
                key={record.id}
                className="group flex items-start gap-3 px-5 py-3.5 hover:bg-slate-800/40 cursor-pointer transition-colors card-hover"
                style={{ animationDelay: `${idx * 40}ms` }}
                onClick={() => onSelect(record)}
              >
                <div className={`shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${bg}`}>
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
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(record.created_at)}
                    </span>
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
      <div className="border-t border-slate-800 px-5 py-4">
        <button
          onClick={handleExportFiltered}
          disabled={filtered.length === 0 || exportingFiltered}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-white transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exportingFiltered ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 text-indigo-400" />
              Export danger&amp;caution only (JSON + CSV)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
