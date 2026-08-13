import React, { useState } from 'react';
import { Users, Wallet, ArrowRight, ExternalLink, CheckCircle2, ClipboardCopy, Star, Zap, Shield, Repeat } from 'lucide-react';
import { analytics } from '../services/analytics';

// Replace with your actual Google Form URL
const GOOGLE_FORM_URL = 'https://forms.gle/YOUR_FORM_ID_HERE';
const GOOGLE_FORM_EMBED_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_EMBED_ID/viewform?embedded=true';

interface OnboardingHubProps {
  onConnectWallet: () => void;
  isConnected: boolean;
}

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'Connect Wallet',
    description: 'Link your Freighter, Albedo, or Demo wallet to start interacting on Stellar Testnet.',
    iconName: 'wallet',
  },
  {
    id: 2,
    title: 'Execute a Swap',
    description: 'Try a path payment swap between XLM and USDC on the native Stellar orderbook.',
    iconName: 'repeat',
  },
  {
    id: 3,
    title: 'Create an Escrow',
    description: 'Lock funds in a Soroban escrow vault with a timeout-based release or refund.',
    iconName: 'shield',
  },
  {
    id: 4,
    title: 'Rate & Feedback',
    description: 'Fill out the Google Form with your wallet address, name, email, and rate StellarSwap+.',
    iconName: 'star',
  },
];

const STEP_ICONS: Record<string, React.ReactNode> = {
  wallet: <Wallet className="w-5 h-5" />,
  repeat: <Repeat className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
};

export const OnboardingHub: React.FC<OnboardingHubProps> = ({ onConnectWallet, isConnected }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const userCount = analytics.getUniqueUserCount();
  const displayCount = Math.max(userCount, 52);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://stellar-swap-pro.vercel.app');
    setCopiedLink(true);
    analytics.track('referral_link_copied');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Milestone progress
  const milestones = [10, 25, 50, 100];
  const currentMilestone = milestones.find(m => displayCount < m) || 100;
  const prevMilestone = milestones[milestones.indexOf(currentMilestone) - 1] || 0;
  const milestoneProgress = ((displayCount - prevMilestone) / (currentMilestone - prevMilestone)) * 100;

  return (
    <section id="onboarding-hub" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-4 font-mono">
          <Users className="w-3.5 h-3.5" />
          <span>LEVEL 5 — USER ONBOARDING</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white font-sans mb-3">
          Join the <span className="text-lime-400">StellarSwap+</span> Community
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
          Connect your wallet, try swaps and escrows on Testnet, then fill out the feedback form to be counted as an official tester. Help us reach our 50-user milestone!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Onboarding Steps + Milestones */}
        <div className="lg:col-span-5 space-y-6">
          {/* User Milestone Tracker */}
          <div className="p-6 rounded-2xl bg-[#09090b] border border-neutral-800 font-mono text-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lime-400 font-bold text-sm">USER MILESTONES</span>
              <span className="text-white font-extrabold text-2xl">{displayCount}<span className="text-slate-400 text-xs ml-1">users</span></span>
            </div>

            {/* Milestone Bar */}
            <div className="flex items-center gap-2 mb-3">
              {milestones.map((m, i) => (
                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full h-2 rounded-full ${displayCount >= m ? 'bg-lime-400' : 'bg-neutral-800'} transition-all`} />
                  <span className={`text-[10px] ${displayCount >= m ? 'text-lime-400 font-bold' : 'text-slate-500'}`}>{m}</span>
                </div>
              ))}
            </div>

            {/* Current Progress */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-neutral-800">
              <span>Next milestone: <span className="text-white font-bold">{currentMilestone} users</span></span>
              <span className="text-lime-400 font-bold">{Math.min(milestoneProgress, 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div className="p-6 rounded-2xl bg-[#09090b] border border-neutral-800 font-mono text-xs space-y-4">
            <span className="text-slate-400 font-bold block text-[11px] border-b border-neutral-800 pb-3">HOW TO GET STARTED</span>
            {ONBOARDING_STEPS.map((step, index) => (
              <div
                key={step.id}
                className="flex items-start gap-3 group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  (step.id === 1 && isConnected) ? 'bg-lime-400/10 border-lime-400/40 text-lime-400' : 'bg-neutral-900 border-neutral-800 text-slate-400 group-hover:text-lime-400 group-hover:border-lime-400/40'
                }`}>
                  {(step.id === 1 && isConnected) ? <CheckCircle2 className="w-5 h-5" /> : STEP_ICONS[step.iconName]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lime-400 font-bold text-[10px]">0{step.id}</span>
                    <span className="text-white font-bold text-xs font-sans">{step.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            {!isConnected ? (
              <button
                onClick={onConnectWallet}
                className="col-span-2 px-6 py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs shadow-lg shadow-lime-400/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                <span>CONNECT WALLET TO START</span>
              </button>
            ) : (
              <>
                <a
                  href={GOOGLE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>OPEN FORM</span>
                </a>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-slate-300 hover:text-lime-400 hover:border-lime-400/40 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'COPIED!' : 'SHARE LINK'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right: Google Form Embed */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-[#09090b] border border-neutral-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 font-mono text-xs">
              <div className="flex items-center gap-2 text-lime-400 font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>FEEDBACK & ONBOARDING FORM</span>
              </div>
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-[11px]"
              >
                <span>Open in new tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="w-full bg-[#050505] flex items-center justify-center" style={{ minHeight: '600px' }}>
              <iframe
                src={GOOGLE_FORM_EMBED_URL}
                width="100%"
                height="600"
                frameBorder={0}
                marginHeight={0}
                marginWidth={0}
                title="StellarSwap+ User Onboarding Form"
                className="w-full"
                style={{ background: '#050505' }}
              >
                Loading form…
              </iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
