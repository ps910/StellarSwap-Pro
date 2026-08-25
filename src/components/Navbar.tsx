import React, { useState, useEffect } from 'react';
import { WalletState, AppTab } from '../types';
import { Wallet, ShieldCheck, ExternalLink, MessageSquare, TrendingUp, BarChart3, Users, Zap, Lock, Activity, ChevronDown, LogOut, Copy } from 'lucide-react';
import { STELLAR_CONFIG } from '../config/stellar';

interface NavbarProps {
  walletState: WalletState;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenWalletModal: () => void;
  onDisconnect: () => void;
  onOpenFeedback: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  walletState,
  activeTab,
  onSelectTab,
  onOpenWalletModal,
  onDisconnect,
  onOpenFeedback,
}) => {
  const [ledgerSeq, setLedgerSeq] = useState(54210);
  const [rpcLatency, setRpcLatency] = useState(42);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLedgerSeq((prev) => prev + 1);
      setRpcLatency(35 + Math.floor(Math.random() * 30));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const tabs: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'swap', label: 'Swap', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'escrow', label: 'Escrow Vaults', icon: <Lock className="w-3.5 h-3.5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  ];

  const truncateAddr = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ── Price Ticker Tape ── */}
      <div className="bg-canvas border-b border-b-border/60 py-1.5 px-4 overflow-x-auto text-[11px] flex items-center justify-between gap-6 whitespace-nowrap">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <span className="text-text-primary font-semibold">XLM</span>
            <span className="tabular-nums text-text-secondary">$0.1245</span>
            <span className="tabular-nums text-bullish font-semibold">+2.4%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-text-primary font-semibold">USDC</span>
            <span className="tabular-nums text-text-secondary">$1.0000</span>
            <span className="tabular-nums text-text-tertiary">+0.0%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-text-primary font-semibold">EURC</span>
            <span className="tabular-nums text-text-secondary">$1.0820</span>
            <span className="tabular-nums text-bullish font-semibold">+0.1%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-text-primary font-semibold">AQUA</span>
            <span className="tabular-nums text-text-secondary">$0.0034</span>
            <span className="tabular-nums text-bullish font-semibold">+5.2%</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <span className="flex items-center gap-1.5 text-text-tertiary">
            <Users className="w-3 h-3" />
            <span className="font-semibold text-text-secondary">52 users</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-bullish animate-pulse" />
            <span className="text-bullish font-medium">
              Ledger #{ledgerSeq.toLocaleString()} · {rpcLatency}ms
            </span>
          </span>
          <span className="badge-bullish text-[9px]">
            ● {STELLAR_CONFIG.network}
          </span>
        </div>
      </div>

      {/* ── Main Navigation Bar ── */}
      <div className="bg-surface/95 backdrop-blur-xl border-b border-b-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center justify-between gap-4">
            {/* Left: Logo + Nav Tabs */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <div
                onClick={() => onSelectTab('swap')}
                className="flex items-center gap-1.5 cursor-pointer select-none group"
              >
                <span className="text-gold text-sm">★</span>
                <span className="font-bold text-lg text-text-primary tracking-tight group-hover:text-gold transition-colors">
                  StellarSwap
                </span>
                <span className="text-gold font-black text-lg">+</span>
                <span className="badge-gold ml-1 hidden sm:inline-flex">PRO</span>
              </div>

              {/* Nav Tabs — only show when connected */}
              {walletState.isConnected && (
                <nav className="hidden md:flex items-center gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => onSelectTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'text-gold bg-gold/10'
                          : 'text-text-tertiary hover:text-text-primary hover:bg-elevated'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Feedback Button */}
              {walletState.isConnected && (
                <button
                  onClick={onOpenFeedback}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-tertiary hover:text-gold hover:bg-gold/5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Feedback</span>
                </button>
              )}

              {/* Explorer Link */}
              <a
                href={STELLAR_CONFIG.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-tertiary hover:text-text-primary hover:bg-elevated transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Explorer</span>
              </a>

              {/* Wallet Button */}
              {walletState.isConnected ? (
                <div className="relative">
                  <button
                    onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-elevated border border-b-border hover:border-gold/30 transition-all"
                  >
                    <div className="w-2 h-2 rounded-full bg-bullish" />
                    <span className="text-xs font-semibold text-text-primary tabular-nums">
                      {truncateAddr(walletState.address || '')}
                    </span>
                    <span className="text-[10px] text-gold font-bold tabular-nums">
                      {walletState.balanceXlm} XLM
                    </span>
                    <ChevronDown className="w-3 h-3 text-text-tertiary" />
                  </button>

                  {/* Wallet Dropdown */}
                  {showWalletDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-surface border border-b-border rounded-xl shadow-2xl shadow-canvas/50 animate-fade-in z-50">
                      <div className="p-3 border-b border-b-border">
                        <p className="text-[10px] text-text-tertiary mb-1">Connected via {walletState.walletName}</p>
                        <p className="text-xs text-text-primary font-mono tabular-nums truncate">
                          {walletState.address}
                        </p>
                      </div>
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(walletState.address || '');
                            setShowWalletDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-secondary hover:bg-elevated hover:text-text-primary transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy Address
                        </button>
                        <a
                          href={`${STELLAR_CONFIG.explorerUrl}/account/${walletState.address}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-secondary hover:bg-elevated hover:text-text-primary transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View on Explorer
                        </a>
                        <button
                          onClick={() => {
                            onDisconnect();
                            setShowWalletDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-bearish hover:bg-bearish/10 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenWalletModal}
                  className="btn-gold text-xs py-2 px-4"
                >
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    Connect Wallet
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Tab Bar ── */}
      {walletState.isConnected && (
        <div className="md:hidden bg-surface border-b border-b-border">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-text-tertiary'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
