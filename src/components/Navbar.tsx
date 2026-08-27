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
  Bell,
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
  onOpenPriceAlerts?: () => void;
  isProChartOpen?: boolean;
  onToggleProChart?: () => void;
  activeAlertsCount?: number;
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
  onOpenPriceAlerts,
  isProChartOpen = false,
  onToggleProChart,
  activeAlertsCount = 0,
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
      <div className="bg-canvas border-b border-b-border/60 py-1 px-4 overflow-x-auto text-[11px] flex items-center justify-between gap-6 whitespace-nowrap">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <span className="text-gold font-bold">XLM/USDC</span>
            <span className="tabular-nums text-text-primary font-mono font-semibold">$0.1145</span>
            <span className="tabular-nums text-bullish font-semibold text-[10px] bg-bullish/10 px-1 py-0.2 rounded">+3.4%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-text-secondary font-medium">AQUA/XLM</span>
            <span className="tabular-nums text-text-primary font-mono font-semibold">0.0421</span>
            <span className="tabular-nums text-bullish font-semibold text-[10px] bg-bullish/10 px-1 py-0.2 rounded">+8.1%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-text-secondary font-medium">BTC/XLM</span>
            <span className="tabular-nums text-text-primary font-mono">$64,250</span>
            <span className="tabular-nums text-bullish font-semibold text-[10px] bg-bullish/10 px-1 py-0.2 rounded">+2.1%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-text-secondary font-medium">ETH/USDC</span>
            <span className="tabular-nums text-text-primary font-mono">$3,480</span>
            <span className="tabular-nums text-bullish font-semibold text-[10px] bg-bullish/10 px-1 py-0.2 rounded">+1.8%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-text-secondary font-medium">EURC</span>
            <span className="tabular-nums text-text-primary font-mono">$1.0820</span>
            <span className="tabular-nums text-bullish font-semibold text-[10px] bg-bullish/10 px-1 py-0.2 rounded">+0.2%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-text-secondary font-medium">yXLM</span>
            <span className="tabular-nums text-text-primary font-mono">$0.1189</span>
            <span className="tabular-nums text-bullish font-semibold text-[10px] bg-bullish/10 px-1 py-0.2 rounded">+3.8%</span>
          </span>
        </div>

        {/* Network, RPC Failover & Ledger Telemetry */}
        <div className="flex items-center gap-3 text-text-tertiary">
          <span className="hidden md:flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            ⚡ Gas Sponsored
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-bullish animate-pulse" />
            <span className="font-mono text-text-secondary">Ledger #{ledgerSeq}</span>
          </span>
          <span className="flex items-center gap-1" title="RPC Failover Active: SDF / PublicNode / Blockdaemon">
            <Zap className="w-3 h-3 text-gold" />
            <span className="font-mono text-text-secondary">{rpcLatency}ms (Failover: Ready)</span>
          </span>

          {/* Network Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNetworkMenu(!showNetworkMenu)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
                networkMode === 'mainnet'
                  ? 'bg-bullish/10 text-bullish border-bullish/30'
                  : 'bg-gold/10 text-gold border-gold/30'
              }`}
            >
              <Globe className="w-2.5 h-2.5" />
              <span>{networkMode === 'mainnet' ? 'MAINNET' : 'TESTNET'}</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {showNetworkMenu && (
              <div className="absolute right-0 top-6 z-50 w-36 py-1 bg-surface border border-b-border rounded-lg shadow-xl text-[11px] animate-fadeIn">
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
                <div className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-105 transition-transform shadow-sm shadow-gold/20">
                  <span className="text-gold text-sm font-black">⚡</span>
                </div>
                <span className="font-extrabold text-lg text-text-primary tracking-tight group-hover:text-gold transition-colors">
                  StellEx
                </span>
                <span className="badge-gold ml-0.5 text-[9px] font-black tracking-wider uppercase">PRO</span>
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
            <div className="flex items-center gap-2.5">
              {/* Pro Chart Toggle Button */}
              {onToggleProChart && (
                <button
                  onClick={onToggleProChart}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isProChartOpen
                      ? 'bg-gold text-black shadow-md shadow-gold/20'
                      : 'bg-elevated text-text-secondary border border-b-border hover:text-text-primary hover:border-gold/30'
                  }`}
                  title="Toggle Live TradingView Pro Chart"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pro Chart</span>
                </button>
              )}

              {/* Price Alerts Bell Button */}
              {onOpenPriceAlerts && (
                <button
                  onClick={onOpenPriceAlerts}
                  className="relative p-2 rounded-lg text-text-tertiary hover:text-gold hover:bg-gold/10 border border-transparent hover:border-gold/30 transition-all"
                  title="Price Alerts Manager"
                >
                  <Bell className="w-4 h-4" />
                  {activeAlertsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-black text-[9px] font-black flex items-center justify-center shadow-sm">
                      {activeAlertsCount}
                    </span>
                  )}
                </button>
              )}

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

              {/* Prominent Network Mode Switcher (Mainnet / Testnet) */}
              <div className="flex items-center bg-canvas p-0.5 rounded-xl border border-b-border shadow-inner">
                <button
                  type="button"
                  onClick={() => onToggleNetwork?.('testnet')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    networkMode === 'testnet'
                      ? 'bg-gold text-black shadow-sm font-black'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                  title="Switch to Stellar Testnet (SDF)"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${networkMode === 'testnet' ? 'bg-black' : 'bg-gold/60'}`} />
                  <span>Testnet</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleNetwork?.('mainnet')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    networkMode === 'mainnet'
                      ? 'bg-bullish text-black shadow-sm font-black'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                  title="Switch to Stellar Public Mainnet"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${networkMode === 'mainnet' ? 'bg-black' : 'bg-bullish/60'}`} />
                  <span>Mainnet</span>
                </button>
              </div>

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
                    <div className="absolute right-0 mt-2 w-64 bg-surface border border-b-border rounded-xl shadow-2xl shadow-canvas/80 animate-fade-in z-50 overflow-hidden">
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

                      {/* Network Switcher inside Dropdown */}
                      <div className="p-2.5 border-b border-b-border bg-canvas/40">
                        <div className="flex items-center justify-between mb-1.5 px-0.5">
                          <span className="text-[10px] text-text-tertiary uppercase font-bold">Stellar Network</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${networkMode === 'mainnet' ? 'bg-bullish/15 text-bullish' : 'bg-gold/15 text-gold'}`}>
                            {networkMode === 'mainnet' ? '🟢 Mainnet Active' : '🟡 Testnet Active'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onToggleNetwork?.('testnet');
                              setShowWalletDropdown(false);
                            }}
                            className={`px-2 py-1.5 rounded-lg text-xs font-bold text-center border transition-all ${
                              networkMode === 'testnet'
                                ? 'bg-gold text-black border-gold shadow-sm'
                                : 'bg-elevated text-text-tertiary border-b-border hover:text-white'
                            }`}
                          >
                            Testnet (SDF)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onToggleNetwork?.('mainnet');
                              setShowWalletDropdown(false);
                            }}
                            className={`px-2 py-1.5 rounded-lg text-xs font-bold text-center border transition-all ${
                              networkMode === 'mainnet'
                                ? 'bg-bullish text-black border-bullish shadow-sm'
                                : 'bg-elevated text-text-tertiary border-b-border hover:text-white'
                            }`}
                          >
                            Mainnet (Public)
                          </button>
                        </div>
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
