import React, { useState, useEffect } from 'react';
import { WalletState, AppTab, NetworkMode } from '../types';
import {
  Wallet,
  ExternalLink,
  MessageSquare,
  BarChart3,
  Users,
  Zap,
  Lock,
  ChevronDown,
  LogOut,
  Copy,
  Check,
  Shield,
  Layers,
  Globe,
} from 'lucide-react';
import { STELLAR_CONFIG, NETWORKS } from '../config/stellar';

interface NavbarProps {
  walletState: WalletState;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenWalletModal: () => void;
  onDisconnect: () => void;
  onOpenFeedback: () => void;
  networkMode?: NetworkMode;
  onToggleNetwork?: (mode: NetworkMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  walletState,
  activeTab,
  onSelectTab,
  onOpenWalletModal,
  onDisconnect,
  onOpenFeedback,
  networkMode = 'testnet',
  onToggleNetwork,
}) => {
  const [ledgerSeq, setLedgerSeq] = useState(584210);
  const [rpcLatency, setRpcLatency] = useState(38);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLedgerSeq((prev) => prev + 1);
      setRpcLatency(30 + Math.floor(Math.random() * 25));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const tabs: { id: AppTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'swap', label: 'DEX Swap', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'escrow', label: 'Escrow Vaults', icon: <Lock className="w-3.5 h-3.5" /> },
    { id: 'multisig', label: 'Multi-Sig & Arbiter', icon: <Shield className="w-3.5 h-3.5" />, badge: 'L6' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  ];

  const truncateAddr = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  const handleCopy = () => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeConfig = NETWORKS[networkMode] || STELLAR_CONFIG;

  return (
    <header className="sticky top-0 z-50 w-full select-none">
      {/* ── Level 6 Institutional Price & Telemetry Strip ── */}
      <div className="bg-canvas border-b border-b-border/60 py-1 px-4 overflow-x-auto text-[11px] flex items-center justify-between gap-6 whitespace-nowrap">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <span className="text-gold font-bold">XLM/USDC</span>
            <span className="tabular-nums text-text-primary font-mono font-semibold">$0.1145</span>
            <span className="tabular-nums text-bullish font-semibold text-[10px] bg-bullish/10 px-1 py-0.2 rounded">+2.4%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-text-secondary font-medium">USDC</span>
            <span className="tabular-nums text-text-primary font-mono">$1.0000</span>
            <span className="tabular-nums text-text-tertiary text-[10px]">0.0%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-text-secondary font-medium">EURC</span>
            <span className="tabular-nums text-text-primary font-mono">$1.0820</span>
            <span className="tabular-nums text-bullish font-semibold text-[10px] bg-bullish/10 px-1 py-0.2 rounded">+0.1%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-text-secondary font-medium">yXLM</span>
            <span className="tabular-nums text-text-primary font-mono">$0.1189</span>
            <span className="tabular-nums text-bullish font-semibold text-[10px] bg-bullish/10 px-1 py-0.2 rounded">+3.1%</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          {/* Level 6 Black Belt Badge */}
          <span className="flex items-center gap-1 text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full font-bold">
            <span className="text-[9px]">⚫</span>
            <span>LEVEL 6 BLACK BELT</span>
          </span>

          <span className="flex items-center gap-1.5 text-text-tertiary">
            <Users className="w-3 h-3 text-gold" />
            <span className="font-semibold text-text-secondary tabular-nums">52 Active Users</span>
          </span>

          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-bullish animate-pulse" />
            <span className="text-bullish font-mono font-medium">
              Ledger #{ledgerSeq.toLocaleString()} · {rpcLatency}ms
            </span>
          </span>

          {/* Network Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setShowNetworkMenu(!showNetworkMenu)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                networkMode === 'mainnet'
                  ? 'bg-bullish/15 border-bullish/40 text-bullish'
                  : 'bg-gold/10 border-gold/30 text-gold'
              }`}
            >
              <Globe className="w-2.5 h-2.5" />
              <span>{networkMode === 'mainnet' ? 'MAINNET' : 'TESTNET'}</span>
              <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
            </button>

            {showNetworkMenu && (
              <div className="absolute right-0 mt-1.5 w-44 bg-surface border border-b-border rounded-lg shadow-xl py-1 z-50 text-[11px]">
                <button
                  onClick={() => {
                    onToggleNetwork?.('testnet');
                    setShowNetworkMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-elevated ${
                    networkMode === 'testnet' ? 'text-gold font-bold' : 'text-text-secondary'
                  }`}
                >
                  <span>Stellar Testnet</span>
                  {networkMode === 'testnet' && <Check className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => {
                    onToggleNetwork?.('mainnet');
                    setShowNetworkMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-elevated ${
                    networkMode === 'mainnet' ? 'text-bullish font-bold' : 'text-text-secondary'
                  }`}
                >
                  <span>Stellar Mainnet</span>
                  {networkMode === 'mainnet' && <Check className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Navigation Bar ── */}
      <div className="bg-surface/95 backdrop-blur-xl border-b border-b-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center justify-between gap-4">
            {/* Left: Logo + Navigation Tabs */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <div
                onClick={() => onSelectTab('swap')}
                className="flex items-center gap-1.5 cursor-pointer select-none group"
              >
                <span className="text-gold text-base font-black">★</span>
                <span className="font-extrabold text-lg text-text-primary tracking-tight group-hover:text-gold transition-colors">
                  StellarSwap
                </span>
                <span className="badge-gold ml-1.5 text-[9px] font-black tracking-wider uppercase">PRIME</span>
              </div>

              {/* Nav Tabs — displayed when wallet is connected */}
              {walletState.isConnected && (
                <nav className="hidden md:flex items-center gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => onSelectTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'text-gold bg-gold/10 shadow-sm shadow-gold/5'
                          : 'text-text-tertiary hover:text-text-primary hover:bg-elevated'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span className="text-[9px] bg-gold/20 text-gold px-1.5 py-0.2 rounded-full font-bold">
                          {tab.badge}
                        </span>
                      )}
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
                href={activeConfig.explorerUrl}
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
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-elevated border border-b-border hover:border-gold/40 transition-all shadow-inner"
                  >
                    <div className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
                    <span className="text-xs font-semibold text-text-primary font-mono tabular-nums">
                      {truncateAddr(walletState.address || '')}
                    </span>
                    <span className="text-[10px] text-gold font-bold font-mono tabular-nums">
                      {walletState.balanceXlm} XLM
                    </span>
                    <ChevronDown className="w-3 h-3 text-text-tertiary" />
                  </button>

                  {/* Wallet Dropdown */}
                  {showWalletDropdown && (
                    <div className="absolute right-0 mt-2 w-60 bg-surface border border-b-border rounded-xl shadow-2xl shadow-canvas/80 animate-fade-in z-50">
                      <div className="p-3 border-b border-b-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-text-tertiary uppercase font-bold">
                            Connected Wallet
                          </span>
                          <span className="text-[10px] bg-gold/15 text-gold font-bold px-1.5 py-0.2 rounded">
                            {walletState.walletName}
                          </span>
                        </div>
                        <p className="text-xs text-text-primary font-mono tabular-nums truncate">
                          {walletState.address}
                        </p>
                      </div>
                      <div className="p-2 space-y-1">
                        <button
                          onClick={handleCopy}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-text-secondary hover:bg-elevated hover:text-text-primary transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Address</span>
                          </span>
                          {copied && <span className="text-[10px] text-bullish font-bold">Copied!</span>}
                        </button>
                        <a
                          href={`${activeConfig.explorerUrl}/account/${walletState.address}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-secondary hover:bg-elevated hover:text-text-primary transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View on Explorer</span>
                        </a>
                        <button
                          onClick={() => {
                            onDisconnect();
                            setShowWalletDropdown(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-bearish hover:bg-bearish/10 transition-colors font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Disconnect Wallet</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenWalletModal}
                  className="btn-gold text-xs py-2 px-4 shadow-lg shadow-gold/10"
                >
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Connect Wallet</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Tab Navigation Bar ── */}
      {walletState.isConnected && (
        <div className="md:hidden bg-surface border-b border-b-border">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-[10px] font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'text-gold border-b-2 border-gold bg-gold/5'
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
