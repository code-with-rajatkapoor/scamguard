import { Landmark, Gift, Briefcase, BadgeCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DemoPreset {
  id: string;
  label: string;
  icon: LucideIcon;
  accent: string;
  text: string;
}

export const demoPresets: DemoPreset[] = [
  {
    id: 'bank-phishing',
    label: '🏦 Bank Phishing Alert',
    icon: Landmark,
    accent:
      'border-red-500/30 bg-red-500/10 text-red-200 hover:border-red-400/60 hover:bg-red-500/20 hover:text-white',
    text: `URGENT: HDFC Bank Security Alert

Dear Customer, your HDFC account has been locked due to suspicious activity. Immediate verification is required within 2 hours or your account will be suspended.

Verify your identity now at http://hdfc-bank-verify.xyz/login and confirm your password, OTP, and debit card CVV to restore access.

If you fail to act now, legal action may follow. Do not reply to this email — click the secure link immediately.`,
  },
  {
    id: 'lottery',
    label: '🎁 Lottery / Prize Scam',
    icon: Gift,
    accent:
      'border-amber-500/30 bg-amber-500/10 text-amber-200 hover:border-amber-400/60 hover:bg-amber-500/20 hover:text-white',
    text: `CONGRATULATIONS! You have been selected as the winner of a $5,000 Amazon gift card in our Flipkart Mega Lottery!

Claim your prize tonight before it expires. Visit http://amazon-prize-claim.top/win and send your full name, home address, and credit card number plus a small processing fee.

You have been chosen — this is a guaranteed 100% free reward. Act now or you will lose the prize!`,
  },
  {
    id: 'fake-job',
    label: '💼 Fake Job Offer',
    icon: Briefcase,
    accent:
      'border-violet-500/30 bg-violet-500/10 text-violet-200 hover:border-violet-400/60 hover:bg-violet-500/20 hover:text-white',
    text: `We saw your resume and you have been hired for a remote personal assistant / mystery shopper position. Work from home and earn $4500 this week with no experience required.

To get started, deposit this check and wire the remaining balance to our Bitcoin wallet. Also send your bank account, routing number, and SSN to complete onboarding at http://google-jobs-offer.online/apply

Urgent — last chance to confirm today before the offer expires.`,
  },
  {
    id: 'safe-email',
    label: '✅ Safe Work Email',
    icon: BadgeCheck,
    accent:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400/60 hover:bg-emerald-500/20 hover:text-white',
    text: `Hi Priya,

Thanks for circulating the Q3 project notes after yesterday's standup. The timeline looks solid, and I agree we can keep the Thursday morning review.

I've booked the 10:30 AM slot on the team calendar. Please bring the latest design mockups if you have them. No action needed on the vendor invoice until next week.

Best,
Amit`,
  },
];

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
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${preset.accent} ${
                isActive ? 'ring-2 ring-teal-400/70 shadow-lg shadow-teal-500/10' : ''
              }`}
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
