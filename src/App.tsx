import React, { useState, useEffect, Suspense, lazy } from 'react';
import { WalletState, WalletType, AppError, TxStatus, ContractEvent, PoolReserves, EscrowItem, AppTab } from './types';
import { SUPPORTED_WALLETS, checkInstalledWallets, connectWallet, parseWalletError } from './services/wallet';
import { fetchPoolReserves, executeContractSwap, executeContractDeposit } from './services/contract';
import { INITIAL_ESCROWS, executeCreateEscrow, executeFundEscrow, executeReleaseEscrow, executeRefundEscrow } from './services/escrow';
import { eventStreamService, INITIAL_EVENTS } from './services/events';
import { analytics } from './services/analytics';
import { STELLAR_CONFIG } from './config/stellar';
import { fetchAccountBalances, AccountBalancesData } from './services/accountBalances';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { Navbar } from './components/Navbar';
import { PortfolioBanner } from './components/PortfolioBanner';
import { Footer } from './components/Footer';
import { WalletModal } from './components/WalletModal';
import { TransactionTracker } from './components/TransactionTracker';
import { ErrorModal } from './components/ErrorModal';
import { FeedbackModal } from './components/FeedbackModal';

// Helper to handle dynamic chunk loading errors caused by fresh deployments / stale browser cache
function lazyRetry<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  name: string
) {
  return lazy(async () => {
    const hasReloaded = sessionStorage.getItem(`retry_lazy_${name}`);
    try {
      const component = await importFn();
      sessionStorage.removeItem(`retry_lazy_${name}`);
      return component;
    } catch (error: any) {
      console.warn(`[LazyLoad] Failed to load chunk for ${name}:`, error);
      if (!hasReloaded) {
        sessionStorage.setItem(`retry_lazy_${name}`, 'true');
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      sessionStorage.removeItem(`retry_lazy_${name}`);
      throw error;
    }
  });
}

// Code-split heavy components with resilient chunk loading
const LandingHero = lazyRetry(() => import('./components/LandingHero').then(m => ({ default: m.LandingHero })), 'LandingHero');
const LandingFeatures = lazyRetry(() => import('./components/LandingFeatures').then(m => ({ default: m.LandingFeatures })), 'LandingFeatures');
const SwapInterface = lazyRetry(() => import('./components/SwapInterface').then(m => ({ default: m.SwapInterface })), 'SwapInterface');
const EscrowInterface = lazyRetry(() => import('./components/EscrowInterface').then(m => ({ default: m.EscrowInterface })), 'EscrowInterface');
const ActivityTable = lazyRetry(() => import('./components/ActivityTable').then(m => ({ default: m.ActivityTable })), 'ActivityTable');

// Level 5: New lazy-loaded components
const AnalyticsDashboard = lazyRetry(() => import('./components/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })), 'AnalyticsDashboard');
const OnboardingHub = lazyRetry(() => import('./components/OnboardingHub').then(m => ({ default: m.OnboardingHub })), 'OnboardingHub');

export const AppContent: React.FC = () => {
  // Navigation State — Level 5: extended with 'analytics' tab
  const [activeTab, setActiveTab] = useState<AppTab>('swap');

  // Wallet State
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    walletId: null,
    walletName: null,
    balanceXlm: '1,500.00',
    balanceUsdc: '250.00',
  });

  const [installedWallets, setInstalledWallets] = useState<Record<WalletType, boolean>>({
    albedo: true,
    demo: true,
    freighter: false,
    lobstr: false,
    xbull: false,
    rabet: false,
  });

  // Modals & Overlay Controls
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [activeError, setActiveError] = useState<AppError | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessingTx, setIsProcessingTx] = useState(false);

  // Transaction Progress Pipeline Tracker
  const [txStatus, setTxStatus] = useState<TxStatus>({
    step: 'idle',
    message: '',
  });

  // Soroban Real-Time Events State
  const [events, setEvents] = useState<ContractEvent[]>(INITIAL_EVENTS);

  // Pool Reserves State
  const [reserves, setReserves] = useState<PoolReserves>({
    xlm: '100,500.00',
    usdc: '9,950.25',
    feeBps: 30,
  });

  // Escrows State
  const [escrows, setEscrows] = useState<EscrowItem[]>(INITIAL_ESCROWS);

  // Live Horizon Account Balances State
  const [balancesData, setBalancesData] = useState<AccountBalancesData | null>(null);

  const handleRefreshBalances = async (addressOverride?: string) => {
    const targetAddr = addressOverride || walletState.address;
    if (!targetAddr) return;
    const data = await fetchAccountBalances(targetAddr, true);
    setBalancesData(data);
    setWalletState((prev) => ({
      ...prev,
      balanceXlm: data.funded ? data.xlmSpendable : '0.00',
      balanceUsdc: data.funded && data.usdcBalance !== '0' ? data.usdcBalance : prev.balanceUsdc,
    }));
  };

  // 1. Initial Load: Check installed extensions & load pool reserves
  useEffect(() => {
    checkInstalledWallets().then(setInstalledWallets);
    fetchPoolReserves(STELLAR_CONFIG.contractId).then(setReserves);
    analytics.track('app_initialized', { network: STELLAR_CONFIG.network });

    // Subscribe to live Soroban RPC contract event stream
    const unsubscribe = eventStreamService.subscribe((newEvent) => {
      setEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
    });

    eventStreamService.startMockEventStream();

    return () => {
      unsubscribe();
      eventStreamService.stop();
    };
  }, []);

  // Poll balances every 15s when wallet is connected
  useEffect(() => {
    if (!walletState.isConnected || !walletState.address) return;

    handleRefreshBalances(walletState.address);
    const interval = setInterval(() => {
      handleRefreshBalances(walletState.address!);
    }, 15000);

    return () => clearInterval(interval);
  }, [walletState.isConnected, walletState.address]);

  // Handle Multi-Wallet Selection & Connection
  const handleSelectWallet = async (walletId: WalletType) => {
    setIsConnecting(true);
    try {
      const address = await connectWallet(walletId);
      const selectedWallet = SUPPORTED_WALLETS.find((w) => w.id === walletId);

      setWalletState({
        isConnected: true,
        address,
        walletId,
        walletName: selectedWallet?.name || walletId,
        balanceXlm: '1,500.00',
        balanceUsdc: '250.00',
      });

      handleRefreshBalances(address);
      analytics.identifyUser(address);
      analytics.trackUserOnboarded(address); // Level 5: Track user growth
      analytics.track('wallet_connected', { walletId, address });
      setIsWalletModalOpen(false);
    } catch (err: any) {
      analytics.captureError(err, { walletId });
      const parsed = parseWalletError(err, 'connect');
      setActiveError(parsed);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    analytics.track('wallet_disconnected', { address: walletState.address });
    setWalletState({
      isConnected: false,
      address: null,
      walletId: null,
      walletName: null,
      balanceXlm: '0.00',
      balanceUsdc: '0.00',
    });
  };

  // Handle Soroban Token Swap Execution
  const handleExecuteSwap = async (
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    minAmountOut: string
  ) => {
    if (!walletState.address || !walletState.walletId) {
      setIsWalletModalOpen(true);
      return;
    }

    const currentBalance = tokenIn === 'XLM' ? parseFloat(walletState.balanceXlm.replace(/,/g, '')) : parseFloat(walletState.balanceUsdc.replace(/,/g, ''));
    if (parseFloat(amountIn) > currentBalance) {
      setActiveError({
        type: 'INSUFFICIENT_BALANCE',
        title: 'Insufficient Token Balance',
        message: `Your balance of ${currentBalance} ${tokenIn} is less than requested swap amount of ${amountIn} ${tokenIn}.`,
        actionHint: 'Use Stellar Friendbot to fund your testnet balance or enter a smaller amount.',
      });
      return;
    }

    setIsProcessingTx(true);
    try {
      const txHash = await executeContractSwap(
        STELLAR_CONFIG.contractId,
        walletState.address,
        walletState.walletId,
        tokenIn,
        tokenOut,
        amountIn,
        minAmountOut,
        setTxStatus
      );

      analytics.track('swap_executed', { tokenIn, tokenOut, amountIn, txHash });

      const newEvt: ContractEvent = {
        id: `evt-${Date.now()}`,
        type: 'swap',
        user: `${walletState.address.slice(0, 5)}...${walletState.address.slice(-4)}`,
        tokenIn,
        tokenOut,
        amountIn,
        amountOut: minAmountOut,
        timestamp: 'Just now',
        txHash,
      };
      setEvents((prev) => [newEvt, ...prev]);

      if (tokenIn === 'XLM') {
        const newBal = (currentBalance - parseFloat(amountIn)).toFixed(2);
        setWalletState((prev) => ({ ...prev, balanceXlm: newBal }));
      }

      setTimeout(() => setIsFeedbackModalOpen(true), 2000);
    } catch (err: any) {
      analytics.captureError(err, { operation: 'swap' });
      setTxStatus({ step: 'failed', message: 'Transaction Failed', error: err.message });
      const parsed = parseWalletError(err);
      setActiveError(parsed);
    } finally {
      setIsProcessingTx(false);
    }
  };

  // Handle Reserve Deposit Execution
  const handleExecuteDeposit = async (token: string, amount: string) => {
    if (!walletState.address || !walletState.walletId) {
      setIsWalletModalOpen(true);
      return;
    }

    setIsProcessingTx(true);
    try {
      const txHash = await executeContractDeposit(
        STELLAR_CONFIG.contractId,
        walletState.address,
        walletState.walletId,
        token,
        amount,
        setTxStatus
      );

      analytics.track('deposit_executed', { token, amount, txHash });

      const newEvt: ContractEvent = {
        id: `evt-${Date.now()}`,
        type: 'deposit',
        user: `${walletState.address.slice(0, 5)}...${walletState.address.slice(-4)}`,
        token,
        amount,
        timestamp: 'Just now',
        txHash,
      };
      setEvents((prev) => [newEvt, ...prev]);

      setReserves((prev) => ({
        ...prev,
        xlm: token === 'XLM' ? (parseFloat(prev.xlm.replace(/,/g, '')) + parseFloat(amount)).toLocaleString() : prev.xlm,
      }));
    } catch (err: any) {
      analytics.captureError(err, { operation: 'deposit' });
      const parsed = parseWalletError(err);
      setActiveError(parsed);
    } finally {
      setIsProcessingTx(false);
    }
  };

  // Escrow Operations
  const handleCreateEscrow = async (payee: string, token: string, amount: string, lockupHours: number) => {
    if (!walletState.address) return;
    setIsProcessingTx(true);
    try {
      const { escrowId, txHash } = await executeCreateEscrow(
        STELLAR_CONFIG.escrowContractId,
        walletState.address,
        payee,
        token,
        amount,
        lockupHours,
        setTxStatus
      );

      analytics.track('escrow_created', { escrowId, payee, token, amount });

      const newEscrow: EscrowItem = {
        id: escrowId,
        payer: `${walletState.address.slice(0, 5)}...${walletState.address.slice(-4)}`,
        payee: payee.length > 12 ? `${payee.slice(0, 5)}...${payee.slice(-4)}` : payee,
        token,
        amount,
        state: 'Created',
        timeoutLedger: 54000,
        createdAt: 'Just now',
        txHash,
      };

      setEscrows((prev) => [newEscrow, ...prev]);

      const newEvt: ContractEvent = {
        id: `evt-${Date.now()}`,
        type: 'escrow_create',
        user: `${walletState.address.slice(0, 5)}...${walletState.address.slice(-4)}`,
        token,
        amount,
        escrowId,
        timestamp: 'Just now',
        txHash,
      };
      setEvents((prev) => [newEvt, ...prev]);
    } catch (err: any) {
      analytics.captureError(err, { operation: 'create_escrow' });
      const parsed = parseWalletError(err);
      setActiveError(parsed);
    } finally {
      setIsProcessingTx(false);
    }
  };

  const handleFundEscrow = async (escrowId: number) => {
    if (!walletState.address) return;
    setIsProcessingTx(true);
    try {
      const txHash = await executeFundEscrow(escrowId, walletState.address, setTxStatus);
      analytics.track('escrow_funded', { escrowId, txHash });

      setEscrows((prev) =>
        prev.map((e) => (e.id === escrowId ? { ...e, state: 'Funded', txHash } : e))
      );

      const newEvt: ContractEvent = {
        id: `evt-${Date.now()}`,
        type: 'escrow_fund',
        user: `${walletState.address.slice(0, 5)}...${walletState.address.slice(-4)}`,
        escrowId,
        timestamp: 'Just now',
        txHash,
      };
      setEvents((prev) => [newEvt, ...prev]);
    } catch (err: any) {
      analytics.captureError(err, { operation: 'fund_escrow' });
      const parsed = parseWalletError(err);
      setActiveError(parsed);
    } finally {
      setIsProcessingTx(false);
    }
  };

  const handleReleaseEscrow = async (escrowId: number) => {
    if (!walletState.address) return;
    setIsProcessingTx(true);
    try {
      const txHash = await executeReleaseEscrow(escrowId, walletState.address, setTxStatus);
      analytics.track('escrow_released', { escrowId, txHash });

      setEscrows((prev) =>
        prev.map((e) => (e.id === escrowId ? { ...e, state: 'Released', txHash } : e))
      );

      const newEvt: ContractEvent = {
        id: `evt-${Date.now()}`,
        type: 'escrow_release',
        user: `${walletState.address.slice(0, 5)}...${walletState.address.slice(-4)}`,
        escrowId,
        timestamp: 'Just now',
        txHash,
      };
      setEvents((prev) => [newEvt, ...prev]);
    } catch (err: any) {
      analytics.captureError(err, { operation: 'release_escrow' });
      const parsed = parseWalletError(err);
      setActiveError(parsed);
    } finally {
      setIsProcessingTx(false);
    }
  };

  const handleRefundEscrow = async (escrowId: number) => {
    if (!walletState.address) return;
    setIsProcessingTx(true);
    try {
      const txHash = await executeRefundEscrow(escrowId, walletState.address, setTxStatus);
      analytics.track('escrow_refunded', { escrowId, txHash });

      setEscrows((prev) =>
        prev.map((e) => (e.id === escrowId ? { ...e, state: 'Refunded', txHash } : e))
      );

      const newEvt: ContractEvent = {
        id: `evt-${Date.now()}`,
        type: 'escrow_refund',
        user: `${walletState.address.slice(0, 5)}...${walletState.address.slice(-4)}`,
        escrowId,
        timestamp: 'Just now',
        txHash,
      };
      setEvents((prev) => [newEvt, ...prev]);
    } catch (err: any) {
      analytics.captureError(err, { operation: 'refund_escrow' });
      const parsed = parseWalletError(err);
      setActiveError(parsed);
    } finally {
      setIsProcessingTx(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 bg-tactical-grid">
      {/* Background Radial Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10">
        {/* Top Navbar */}
        <Navbar
          walletState={walletState}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenWalletModal={() => setIsWalletModalOpen(true)}
          onDisconnect={handleDisconnect}
          onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        />

        {/* Main Content Area */}
        {!walletState.isConnected ? (
          /* Disconnected State: Landing Page + Onboarding Hub */
          <main>
            <Suspense fallback={<div className="min-h-screen" />}>
              <LandingHero onConnectWallet={() => setIsWalletModalOpen(true)} />
              <LandingFeatures />
              {/* Level 5: Onboarding Hub on landing page */}
              <OnboardingHub
                onConnectWallet={() => setIsWalletModalOpen(true)}
                isConnected={false}
              />
            </Suspense>
          </main>
        ) : (
          /* Connected State: Dashboard with Swap / Escrow / Analytics tabs */
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* 01 Portfolio Banner */}
            <PortfolioBanner
              walletState={walletState}
              balancesData={balancesData}
              onRefreshBalances={() => handleRefreshBalances()}
            />

            {/* Tab Content */}
            {activeTab === 'analytics' ? (
              /* Level 5: Analytics Dashboard */
              <Suspense fallback={<LoadingSkeleton lines={8} />}>
                <AnalyticsDashboard />
              </Suspense>
            ) : (
              <>
                {/* Main Grid: Swap (Left) + Escrow (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-6">
                    <Suspense fallback={<LoadingSkeleton lines={6} />}>
                      <SwapInterface
                        walletState={walletState}
                        reserves={reserves}
                        onOpenWalletModal={() => setIsWalletModalOpen(true)}
                        onExecuteSwap={handleExecuteSwap}
                        onExecuteDeposit={handleExecuteDeposit}
                        isProcessing={isProcessingTx}
                      />
                    </Suspense>
                  </div>

                  <div className="lg:col-span-6">
                    <Suspense fallback={<LoadingSkeleton lines={6} />}>
                      <EscrowInterface
                        walletState={walletState}
                        escrows={escrows}
                        onOpenWalletModal={() => setIsWalletModalOpen(true)}
                        onCreateEscrow={handleCreateEscrow}
                        onFundEscrow={handleFundEscrow}
                        onReleaseEscrow={handleReleaseEscrow}
                        onRefundEscrow={handleRefundEscrow}
                        isProcessing={isProcessingTx}
                      />
                    </Suspense>
                  </div>
                </div>

                {/* On-Chain Activity Table */}
                <Suspense fallback={<LoadingSkeleton lines={8} />}>
                  <ActivityTable events={events} />
                </Suspense>
              </>
            )}
          </main>
        )}

        {/* Footer */}
        <Footer />
      </div>

      {/* Overlays & Modals */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallets={SUPPORTED_WALLETS}
        installedState={installedWallets}
        onSelectWallet={handleSelectWallet}
        isLoading={isConnecting}
      />

      <TransactionTracker
        status={txStatus}
        onClose={() => setTxStatus({ step: 'idle', message: '' })}
      />

      <ErrorModal
        error={activeError}
        onClose={() => setActiveError(null)}
        onSelectAlbedo={() => handleSelectWallet('albedo')}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={(rating, comment) => {
          analytics.persistFeedback(rating, comment, walletState.address || undefined);
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};
