import { AlertTriangle, ShieldAlert, Info, ShieldCheck, Zap, XCircle, Gift, Lock, User, Award, Mail, SpellCheck, Phone, ShoppingCart, TrendingUp, Briefcase, ExternalLink, IdCard, DollarSign } from 'lucide-react';
import type { DetectedIndicator } from '@/types';
import type { LucideIcon } from 'lucide-react';

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
    glow: 'shadow-red-500/20',
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    label: 'Medium',
    glow: 'shadow-amber-500/20',
  },
  low: {
    icon: Info,
    color: 'text-sky-400',
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/10',
    label: 'Low',
    glow: 'shadow-sky-500/20',
  },
};

function getIcon(type: string): LucideIcon {
  const iconMap: Record<string, LucideIcon> = {
    urgency: Zap,
    threat: AlertTriangle,
    money_request: DollarSign,
    credential_harvest: Lock,
    impersonation: User,
    suspicious_link: ExternalLink,
    personal_info: IdCard,
    too_good: Gift,
    impersonal_greeting: Mail,
    poor_grammar: SpellCheck,
    spoofed_contact: Phone,
    romance_scam: Award,
    subscription_scam: ShoppingCart,
    investment_scam: TrendingUp,
    job_scam: Briefcase,
    fake_screen: XCircle,
    typosquatting: AlertTriangle,
  };
  return iconMap[type] || Info;
}

export default function IndicatorList({ indicators }: IndicatorListProps) {
  if (indicators.length === 0) {
    return (
      <div className="flex items-center gap-3 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 card-hover">
        <ShieldCheck className="w-6 h-6 text-emerald-400" />
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
        const config = severityConfig[indicator.severity] || severityConfig.low;
        const Icon = getIcon(indicator.type);

        return (
          <div
            key={`${indicator.type}-${index}`}
            className={`flex gap-4 p-4 rounded-xl ${config.bg} ${config.border} border transition-all duration-300 hover:scale-[1.02] card-hover ${config.glow}`}
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
                {indicator.badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-semibold uppercase tracking-wide`}>
                    {indicator.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-1">{indicator.description}</p>
              {indicator.match && (
                <div className="mt-2">
                  <p className="text-xs font-mono bg-slate-900/60 px-3 py-1.5 rounded-md inline-block text-slate-300 break-all">
                    &ldquo;{indicator.match}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
