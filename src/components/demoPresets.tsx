import { Landmark, Gift, Briefcase, BadgeCheck, Phone, MessageSquare, ShieldAlert, AlertTriangle } from 'lucide-react';
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
  {
    id: 'romance-scam',
    label: '💕 Romance Scam',
    icon: MessageSquare,
    accent:
      'border-pink-500/30 bg-pink-500/10 text-pink-200 hover:border-pink-400/60 hover:bg-pink-500/20 hover:text-white',
    text: `Hello my dear, I am a US soldier deployed overseas in Afghanistan. I found $2.5 million in a cave and need your help to transfer it. I love you and want to spend my life with you.

Please send your bank account details and $500 for processing fees. I will repay you double, my darling.`,
  },
  {
    id: 'fake-domain',
    label: '🌐 Fake Domain Alert',
    icon: ShieldAlert,
    accent:
      'border-red-500/30 bg-red-500/10 text-red-200 hover:border-red-400/60 hover:bg-red-500/20 hover:text-white',
    text: `Dear customer, your Paytm wallet and SBI Yono access will be blocked in 2 hours. Verify now at http://paytm-verify.com/login and https://sbi-login.net/kyc. HDFC users must also update details at hdfc-bank-update.xyz to avoid account freeze.`,
  },
  {
    id: 'smishing',
    label: '📱 Smishing (SMS Phishing)',
    icon: Phone,
    accent:
      'border-green-500/30 bg-green-500/10 text-green-200 hover:border-green-400/60 hover:bg-green-500/20 hover:text-white',
    text: `Your package has been seized by customs. Pay $45 clearance fee within 24 hours at http://customs-fee-urgent.xyz to receive your shipment.

Delivery failed — click here to reschedule: http://reschedule-package.net

Contact: +91-98765-43210 (WhatsApp preferred)`,
  },
  {
    id: 'fake-login',
    label: '🔐 Fake Login Page',
    icon: AlertTriangle,
    accent:
      'border-orange-500/30 bg-orange-500/10 text-orange-200 hover:border-orange-400/60 hover:bg-orange-500/20 hover:text-white',
    text: `Your Google account will be deactivated in 4 hours. Click here to verify: https://google-login-verify.net/signin

Enter your email and password to continue. Your account will be permanently deleted if you don't act now.`,
  },
];
