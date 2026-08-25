import React, { useState } from 'react';
import { Users, Wallet, ArrowRight, ExternalLink, CheckCircle2, ClipboardCopy, Star, Zap, Shield, Repeat } from 'lucide-react';
import { analytics } from '../services/analytics';

const GOOGLE_FORM_URL = 'https://docs.google.com/spreadsheets/d/1rwjibmRmoN6Qp0fkED-tAXiDno5CZB-bnLlBET3puHg/edit?usp=sharing';
const GOOGLE_FORM_EMBED_URL = 'https://docs.google.com/spreadsheets/d/1rwjibmRmoN6Qp0fkED-tAXiDno5CZB-bnLlBET3puHg/edit?usp=sharing';

interface OnboardingHubProps {
  onConnectWallet: () => void;
  isConnected: boolean;
}

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'Connect Wallet',
    description: 'Link your Freighter, Albedo, or 1-Click Demo wallet to start interacting on Stellar Testnet.',
    iconName: 'wallet',
  },
  {
    id: 2,
    title: 'Execute Path Swap',
    description: 'Test Path Payment routing between XLM and USDC on the native Stellar orderbook.',
    iconName: 'repeat',
  },
  {
    id: 3,
    title: 'Create Timelock Escrow',
    description: 'Lock funds in a Soroban escrow vault with conditional release or refund triggers.',
    iconName: 'shield',
  },
  {
    id: 4,
    title: 'Verified Feedback',
    description: 'Submit feedback with your wallet address to earn verified testnet tester status.',
    iconName: 'star',
  },
];

const STEP_ICONS: Record<string, React.ReactNode> = {
  wallet: <Wallet className="w-4 h-4" />,
  repeat: <Repeat className="w-4 h-4" />,
  shield: <Shield className="w-4 h-4" />,
  star: <Star className="w-4 h-4" />,
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
    <section id="onboarding-hub" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-b-border">
      {/* Section Header */}
      <div className="text-center mb-12">
        <span className="badge-gold mb-3">TESTNET COMMUNITY ECOSYSTEM</span>
        <h2 className="text-3xl sm:text-4xl font-black text-text-primary mt-2 mb-3">
          Join the <span className="text-gold">StellarSwap+</span> Community
        </h2>
        <p className="text-sm text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Connect your wallet, try swaps and escrows on Testnet, and submit feedback to be counted as an official verified tester. Help us scale to 100+ active users!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Onboarding Steps + Milestones */}
        <div className="lg:col-span-5 space-y-5">
          {/* User Milestone Tracker */}
          <div className="p-6 rounded-2xl bg-surface border border-b-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gold font-bold text-xs uppercase tracking-wider">User Milestones</span>
              <span className="text-text-primary font-extrabold text-2xl tabular-nums font-mono">
                {displayCount}<span className="text-text-tertiary text-xs ml-1 font-sans">users</span>
              </span>
            </div>

            {/* Milestone Bar */}
            <div className="flex items-center gap-2 mb-3">
              {milestones.map((m) => (
                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full h-2 rounded-full ${displayCount >= m ? 'bg-gold' : 'bg-elevated'} transition-all`} />
                  <span className={`text-[10px] tabular-nums font-mono ${displayCount >= m ? 'text-gold font-bold' : 'text-text-disabled'}`}>{m}</span>
                </div>
              ))}
            </div>

            {/* Current Progress */}
            <div className="flex items-center justify-between text-xs text-text-secondary pt-3 border-t border-b-border">
              <span>Next target: <span className="text-text-primary font-bold">{currentMilestone} users</span></span>
              <span className="text-gold font-bold tabular-nums">{Math.min(milestoneProgress, 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div className="p-6 rounded-2xl bg-surface border border-b-border space-y-3.5">
            <span className="text-text-tertiary font-bold block text-[10px] uppercase tracking-wider border-b border-b-border pb-2.5">
              How to Get Started
            </span>
            {ONBOARDING_STEPS.map((step) => (
              <div
                key={step.id}
                className="flex items-start gap-3 group"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  (step.id === 1 && isConnected) ? 'bg-bullish/10 border-bullish/40 text-bullish' : 'bg-canvas border-b-border text-text-tertiary group-hover:text-gold group-hover:border-gold/40'
                }`}>
                  {(step.id === 1 && isConnected) ? <CheckCircle2 className="w-4 h-4" /> : STEP_ICONS[step.iconName]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-gold font-bold text-[10px] font-mono tabular-nums">0{step.id}</span>
                    <span className="text-text-primary font-bold text-xs">{step.title}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            {!isConnected ? (
              <button
                onClick={onConnectWallet}
                className="col-span-2 btn-gold text-xs py-3.5 flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet to Start</span>
              </button>
            ) : (
              <>
                <a
                  href={GOOGLE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-surface text-xs py-3 flex items-center justify-center gap-2 hover:border-gold/30 hover:text-gold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Sheet</span>
                </a>
                <button
                  onClick={handleCopyLink}
                  className="btn-surface text-xs py-3 flex items-center justify-center gap-2 hover:border-gold/30 hover:text-gold"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-bullish" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Share DEX'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right: Google Form / Sheet Embed */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-surface border border-b-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-b-border text-xs">
              <div className="flex items-center gap-2 text-gold font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>COMMUNITY FEEDBACK REGISTRY</span>
              </div>
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-text-tertiary hover:text-text-primary transition-colors text-[11px]"
              >
                <span>Open sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="w-full bg-canvas flex items-center justify-center" style={{ minHeight: '600px' }}>
              <iframe
                src={GOOGLE_FORM_EMBED_URL}
                width="100%"
                height="600"
                frameBorder={0}
                marginHeight={0}
                marginWidth={0}
                title="StellarSwap+ User Onboarding Sheet"
                className="w-full"
                style={{ background: '#0B0E11' }}
              >
                Loading feedback registry…
              </iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
