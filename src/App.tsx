import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  WalletState,
  WalletType,
  AppError,
  TxStatus,
  ContractEvent,
  PoolReserves,
  EscrowItem,
  AppTab,
  NetworkMode,
} from './types';
import { SUPPORTED_WALLETS, checkInstalledWallets, connectWallet, parseWalletError } from './services/wallet';
import { fetchPoolReserves, executeContractSwap, executeContractDeposit } from './services/contract';
import {
  INITIAL_ESCROWS,
  executeCreateEscrow,
  executeFundEscrow,
  executeApproveEscrow,
  executeReleaseEscrow,
  executeRefundEscrow,
  executeDisputeEscrow,
  executeResolveDispute,
  executeBatchFundEscrows,
  executeBatchApproveEscrows,
  executeBatchReleaseEscrows,
  executeBatchCreateEscrows,
} from './services/escrow';
import { eventStreamService, INITIAL_EVENTS } from './services/events';
import { analytics } from './services/analytics';
import { PriceAlertService } from './services/priceAlerts';
import { STELLAR_CONFIG, NETWORKS } from './config/stellar';
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
import { TradingViewChart } from './components/TradingViewChart';
import { PriceAlertsModal } from './components/PriceAlertsModal';

// Direct static imports for critical landing experience (prevents blank screen)
import { LandingHero } from './components/LandingHero';
import { LandingFeatures } from './components/LandingFeatures';
import { OnboardingHub } from './components/OnboardingHub';
import { SwapInterface } from './components/SwapInterface';
import { EscrowInterface } from './components/EscrowInterface';
import { ActivityTable } from './components/ActivityTable';

// Lazy load analytics tab
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard').then((m) => ({ default: m.AnalyticsDashboard })));

export const AppContent: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<AppTab>('swap');
  const [networkMode, setNetworkMode] = useState<NetworkMode>('testnet');

  // Wallet State
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    walletId: null,
    walletName: null,
    balanceXlm: '1,500.00',
    balanceUsdc: '250.00',
    balanceEurc: '100.00',
    balanceYxlm: '500.00',
  });

  const [installedWallets, setInstalledWallets] = useState<Record<WalletType, boolean>>({
    albedo: true,
    demo: true,
    freighter: false,
    lobstr: false,
    xbull: false,
    rabet: false,
    ledger: true,
    trezor: true,
    keystone: true,
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

  // Pro Suite States
  const [isProChartOpen, setIsProChartOpen] = useState(true);
  const [isPriceAlertsOpen, setIsPriceAlertsOpen] = useState(false);
  const [selectedAlertSymbol, setSelectedAlertSymbol] = useState('XLM');
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const [alertToast, setAlertToast] = useState<string | null>(null);

  // Escrows State (Level 6 Multi-Sig & Dispute items)
  const [escrows, setEscrows] = useState<EscrowItem[]>(INITIAL_ESCROWS);

  // Live Horizon Account Balances State
  const [balancesData, setBalancesData] = useState<AccountBalancesData | null>(null);

  const handleRefreshBalances = async (addressOverride?: string, modeOverride?: NetworkMode) => {
    const targetAddr = addressOverride || walletState.address;
    const targetMode = modeOverride || networkMode;
    if (!targetAddr) return;
    const data = await fetchAccountBalances(targetAddr, true, targetMode);
    setBalancesData(data);
    setWalletState((prev) => ({
      ...prev,
      balanceXlm: data.funded ? data.xlmSpendable : '0.00',
      balanceUsdc: data.funded && data.usdcBalance !== '0' ? data.usdcBalance : prev.balanceUsdc,
    }));
  };

  const handleToggleNetwork = (mode: NetworkMode) => {
    setNetworkMode(mode);
    analytics.track('network_switched', { network: mode });
    if (walletState.address) {
      handleRefreshBalances(walletState.address, mode);
    }
  };

  // 1. Initial Load & Alert Subscriptions
  useEffect(() => {
    checkInstalledWallets().then(setInstalledWallets);
    const activeConfig = NETWORKS[networkMode] || STELLAR_CONFIG;
    fetchPoolReserves(activeConfig.contractId).then(setReserves);
    analytics.track('app_initialized', { network: networkMode });

    // Price Alerts listener
    setActiveAlertsCount(PriceAlertService.getActiveAlerts().length);
    const unlistenAlerts = PriceAlertService.onAlertTriggered((alert) => {
      setAlertToast(`🚨 Price Alert: ${alert.tokenSymbol} reached target of $${alert.targetPrice.toFixed(4)} (${alert.condition})!`);
      setActiveAlertsCount(PriceAlertService.getActiveAlerts().length);
      setTimeout(() => setAlertToast(null), 6000);
    });

    const unsubscribe = eventStreamService.subscribe((newEvent) => {
      setEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
    });

    eventStreamService.startMockEventStream();

    return () => {
      unlistenAlerts();
      unsubscribe();
      eventStreamService.stop();
    };
  }, [networkMode]);

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
        balanceEurc: '100.00',
        balanceYxlm: '500.00',
      });

      handleRefreshBalances(address);
      analytics.identifyUser(address);
      analytics.trackUserOnboarded(address);
      analytics.track('wallet_connected', { walletId, address, network: networkMode });
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

    const currentBalance =
      tokenIn === 'XLM'
        ? parseFloat(walletState.balanceXlm.replace(/,/g, ''))
        : parseFloat(walletState.balanceUsdc.replace(/,/g, ''));

    if (parseFloat(amountIn) > currentBalance) {
      setActiveError({
        type: 'INSUFFICIENT_BALANCE',
        title: 'Insufficient Token Balance',
        message: `Your balance of ${currentBalance} ${tokenIn} is less than requested swap amount of ${amountIn} ${tokenIn}.`,
        actionHint: 'Use Stellar Friendbot or fund your account with sufficient balance.',
      });
      return;
    }

    setIsProcessingTx(true);
    try {
      const currentContractId = NETWORKS[networkMode]?.contractId || STELLAR_CONFIG.contractId;
      const txHash = await executeContractSwap(
        currentContractId,
        walletState.address,
        walletState.walletId,
        tokenIn,
        tokenOut,
        amountIn,
        minAmountOut,
        setTxStatus,
        networkMode
      );

      analytics.track('swap_executed', { tokenIn, tokenOut, amountIn, txHash, network: networkMode });

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
      const currentContractId = NETWORKS[networkMode]?.contractId || STELLAR_CONFIG.contractId;
      const txHash = await executeContractDeposit(
        currentContractId,
        walletState.address,
        walletState.walletId,
        token,
        amount,
        setTxStatus,
        networkMode
      );

      analytics.track('deposit_executed', { token, amount, txHash, network: networkMode });

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

  // ── Multi-Sig Escrow Operations ──

  const handleCreateEscrow = async (
    payee: string,
    arbiter: string | undefined,
    token: string,
    amount: string,
    lockupHours: number,
    description: string
  ) => {
    if (!walletState.address) return;
    setIsProcessingTx(true);
    try {
      const currentEscrowContractId = NETWORKS[networkMode]?.escrowContractId || STELLAR_CONFIG.escrowContractId;
      const { escrowId, txHash } = await executeCreateEscrow(
        currentEscrowContractId,
        walletState.address,
        payee,
        arbiter,
        token,
        amount,
        lockupHours,
        description,
        setTxStatus,
        networkMode
      );

      analytics.track('escrow_created', { escrowId, payee, arbiter, token, amount, network: networkMode });

      const feeAmount = (parseFloat(amount) * 0.005).toFixed(2);

      const newEscrow: EscrowItem = {
        id: escrowId,
        payer: walletState.address,
        payee,
        arbiter,
        token,
        amount,
        feeAmount,
        state: 'Created',
        timeoutLedger: 590000,
        createdAt: 'Just now',
        txHash,
        payerApproved: false,
        payeeApproved: false,
        arbiterApproved: false,
        description,
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
      const txHash = await executeFundEscrow(escrowId, walletState.address, setTxStatus, networkMode);
      analytics.track('escrow_funded', { escrowId, txHash, network: networkMode });

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

  const handleApproveEscrow = async (escrowId: number, role: 'payer' | 'payee' | 'arbiter') => {
    if (!walletState.address) return;
    setIsProcessingTx(true);
    try {
      const { txHash, autoReleased } = await executeApproveEscrow(escrowId, role, setTxStatus, networkMode);
      analytics.track('escrow_approved', { escrowId, role, autoReleased, network: networkMode });

      setEscrows((prev) =>
        prev.map((e) => {
          if (e.id !== escrowId) return e;
          const updated = {
            ...e,
            payerApproved: role === 'payer' ? true : e.payerApproved,
            payeeApproved: role === 'payee' ? true : e.payeeApproved,
            arbiterApproved: role === 'arbiter' ? true : e.arbiterApproved,
            state: autoReleased ? ('Released' as const) : e.state,
            txHash,
          };
          return updated;
        })
      );

      const newEvt: ContractEvent = {
        id: `evt-${Date.now()}`,
        type: 'escrow_approve',
        user: `${walletState.address.slice(0, 5)}...${walletState.address.slice(-4)}`,
        escrowId,
        timestamp: 'Just now',
        txHash,
      };
      setEvents((prev) => [newEvt, ...prev]);
    } catch (err: any) {
      analytics.captureError(err, { operation: 'approve_escrow' });
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
      const txHash = await executeReleaseEscrow(escrowId, walletState.address, setTxStatus, networkMode);
      analytics.track('escrow_released', { escrowId, txHash, network: networkMode });

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

  const handleDisputeEscrow = async (escrowId: number) => {
    if (!walletState.address) return;
    setIsProcessingTx(true);
    try {
      const txHash = await executeDisputeEscrow(escrowId, setTxStatus, networkMode);
      analytics.track('escrow_disputed', { escrowId, txHash, network: networkMode });

      setEscrows((prev) =>
        prev.map((e) => (e.id === escrowId ? { ...e, state: 'Disputed', txHash } : e))
      );

      const newEvt: ContractEvent = {
        id: `evt-${Date.now()}`,
        type: 'escrow_dispute',
        user: `${walletState.address.slice(0, 5)}...${walletState.address.slice(-4)}`,
        escrowId,
        timestamp: 'Just now',
        txHash,
      };
      setEvents((prev) => [newEvt, ...prev]);
    } catch (err: any) {
      analytics.captureError(err, { operation: 'dispute_escrow' });
      const parsed = parseWalletError(err);
      setActiveError(parsed);
    } finally {
      setIsProcessingTx(false);
    }
  };

  const handleResolveDispute = async (escrowId: number, payeeShareBps: number) => {
    if (!walletState.address) return;
    setIsProcessingTx(true);
    try {
      const txHash = await executeResolveDispute(escrowId, payeeShareBps, setTxStatus, networkMode);
      analytics.track('escrow_dispute_resolved', { escrowId, payeeShareBps, txHash, network: networkMode });

      setEscrows((prev) =>
        prev.map((e) => (e.id === escrowId ? { ...e, state: 'Resolved', txHash } : e))
      );

      const newEvt: ContractEvent = {
        id: `evt-${Date.now()}`,
        type: 'escrow_resolve',
        user: `${walletState.address.slice(0, 5)}...${walletState.address.slice(-4)}`,
        escrowId,
        timestamp: 'Just now',
        txHash,
      };
      setEvents((prev) => [newEvt, ...prev]);
    } catch (err: any) {
      analytics.captureError(err, { operation: 'resolve_dispute' });
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
      const txHash = await executeRefundEscrow(escrowId, walletState.address, setTxStatus, networkMode);
      analytics.track('escrow_refunded', { escrowId, txHash, network: networkMode });

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

  // ── Batch Escrow Handlers (Level 6 Institutional Suite) ──
  const handleBatchFund = async (escrowIds: number[]) => {
    if (!walletState.address) return;
    setIsProcessingTx(true);
    try {
      const txHashes = await executeBatchFundEscrows(escrowIds, walletState.address, undefined, setTxStatus, networkMode);
      analytics.track('batch_escrow_funded', { count: escrowIds.length, network: networkMode });
      setEscrows((prev) =>
        prev.map((e) => {
          const idx = escrowIds.indexOf(e.id);
          return idx >= 0 ? { ...e, state: 'Funded', txHash: txHashes[idx] || txHashes[0] } : e;
        })
      );
    } catch (err: any) {
      analytics.captureError(err, { operation: 'batch_fund_escrows' });
      setActiveError(parseWalletError(err));
    } finally {
      setIsProcessingTx(false);
    }
  };

  const handleBatchApprove = async (escrowIds: number[], role: 'payer' | 'payee' | 'arbiter') => {
    if (!walletState.address) return;
    setIsProcessingTx(true);
    try {
      const txHashes = await executeBatchApproveEscrows(escrowIds, role, undefined, setTxStatus, networkMode);
      analytics.track('batch_escrow_approved', { count: escrowIds.length, role, network: networkMode });
      setEscrows((prev) =>
        prev.map((e) => {
          const idx = escrowIds.indexOf(e.id);
          if (idx < 0) return e;
          return {
            ...e,
            payerApproved: role === 'payer' ? true : e.payerApproved,
            payeeApproved: role === 'payee' ? true : e.payeeApproved,
            arbiterApproved: role === 'arbiter' ? true : e.arbiterApproved,
            txHash: txHashes[idx] || txHashes[0],
          };
        })
      );
    } catch (err: any) {
      analytics.captureError(err, { operation: 'batch_approve_escrows' });
      setActiveError(parseWalletError(err));
    } finally {
      setIsProcessingTx(false);
    }
  };

  const handleBatchRelease = async (escrowIds: number[]) => {
    if (!walletState.address) return;
    setIsProcessingTx(true);
    try {
      const txHashes = await executeBatchReleaseEscrows(escrowIds, undefined, setTxStatus, networkMode);
      analytics.track('batch_escrow_released', { count: escrowIds.length, network: networkMode });
      setEscrows((prev) =>
        prev.map((e) => {
          const idx = escrowIds.indexOf(e.id);
          return idx >= 0 ? { ...e, state: 'Released', txHash: txHashes[idx] || txHashes[0] } : e;
        })
      );
    } catch (err: any) {
      analytics.captureError(err, { operation: 'batch_release_escrows' });
      setActiveError(parseWalletError(err));
    } finally {
      setIsProcessingTx(false);
    }
  };

  const handleBatchCreate = async (items: { payee: string; amount: string; token: string; lockupHours: number; description: string }[]) => {
    if (!walletState.address) return;
    setIsProcessingTx(true);
    try {
      const currentEscrowContractId = NETWORKS[networkMode]?.escrowContractId || STELLAR_CONFIG.escrowContractId;
      const { escrowIds, txHash } = await executeBatchCreateEscrows(
        currentEscrowContractId,
        walletState.address,
        items,
        undefined,
        setTxStatus,
        networkMode
      );
      analytics.track('batch_escrow_created', { count: items.length, network: networkMode });
      const newItems: EscrowItem[] = escrowIds.map((id, idx) => {
        const src = items[idx] || items[0];
        return {
          id,
          payer: walletState.address || 'G...',
          payee: src.payee,
          token: src.token,
          amount: src.amount,
          state: 'Created',
          createdAt: 'Just now',
          timeoutLedger: 585000 + src.lockupHours * 720,
          unlockTime: Date.now() + src.lockupHours * 3600 * 1000,
          lockupHours: src.lockupHours,
          description: src.description,
          payerApproved: false,
          payeeApproved: false,
          arbiterApproved: false,
          txHash,
        };
      });
      setEscrows((prev) => [...newItems, ...prev]);
    } catch (err: any) {
      analytics.captureError(err, { operation: 'batch_create_escrows' });
      setActiveError(parseWalletError(err));
    } finally {
      setIsProcessingTx(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary font-sans selection:bg-gold selection:text-black bg-tactical-grid">
      {/* Background Radial Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-protocol-blue/5 rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10">
        {/* Real-time Alert Toast Notification */}
        {alertToast && (
          <div className="fixed top-16 right-4 z-50 p-4 rounded-xl bg-gold/95 text-black font-extrabold text-xs shadow-2xl flex items-center gap-3 border border-gold animate-slide-up">
            <span className="text-base">🔔</span>
            <span>{alertToast}</span>
            <button
              onClick={() => setAlertToast(null)}
              className="ml-2 text-black/70 hover:text-black font-mono font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Navbar */}
        <Navbar
          walletState={walletState}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenWalletModal={() => setIsWalletModalOpen(true)}
          onDisconnect={handleDisconnect}
          onOpenFeedback={() => setIsFeedbackModalOpen(true)}
          networkMode={networkMode}
          onToggleNetwork={handleToggleNetwork}
          onOpenPriceAlerts={() => setIsPriceAlertsOpen(true)}
          isProChartOpen={isProChartOpen}
          onToggleProChart={() => setIsProChartOpen(!isProChartOpen)}
          activeAlertsCount={activeAlertsCount}
        />

        {/* Main Content Area */}
        {!walletState.isConnected ? (
          /* Disconnected State: Landing Page + Onboarding Hub (rendered directly without blank fallback) */
          <main>
            <LandingHero onConnectWallet={() => setIsWalletModalOpen(true)} />
            <LandingFeatures />
            <OnboardingHub
              onConnectWallet={() => setIsWalletModalOpen(true)}
              isConnected={false}
            />
          </main>
        ) : (
          /* Connected State: Dashboard with Swap / Escrow / Multisig / Analytics tabs */
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* 01 Portfolio Banner */}
            <PortfolioBanner
              walletState={walletState}
              balancesData={balancesData}
              onRefreshBalances={() => handleRefreshBalances()}
              networkMode={networkMode}
              onToggleNetwork={handleToggleNetwork}
            />

            {/* Tab Content */}
            {activeTab === 'analytics' ? (
              <Suspense fallback={<LoadingSkeleton lines={8} />}>
                <AnalyticsDashboard />
              </Suspense>
            ) : (
              <>
                {/* Institutional TradingView Pro Candlestick Chart */}
                {isProChartOpen && (
                  <TradingViewChart
                    defaultBase="XLM"
                    defaultQuote="USDC"
                    onClose={() => setIsProChartOpen(false)}
                  />
                )}

                {/* Main Grid: Swap (Left) + Escrow / Multi-Sig (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-6">
                    <SwapInterface
                      walletState={walletState}
                      reserves={reserves}
                      balancesData={balancesData}
                      onOpenWalletModal={() => setIsWalletModalOpen(true)}
                      onExecuteSwap={handleExecuteSwap}
                      onExecuteDeposit={handleExecuteDeposit}
                      isProcessing={isProcessingTx}
                      onOpenPriceAlert={(symbol) => {
                        setSelectedAlertSymbol(symbol);
                        setIsPriceAlertsOpen(true);
                      }}
                      onToggleProChart={() => setIsProChartOpen(!isProChartOpen)}
                      isProChartOpen={isProChartOpen}
                      networkMode={networkMode}
                    />
                  </div>

                  <div className="lg:col-span-6">
                    <EscrowInterface
                      walletState={walletState}
                      escrows={escrows}
                      onOpenWalletModal={() => setIsWalletModalOpen(true)}
                      onCreateEscrow={handleCreateEscrow}
                      onFundEscrow={handleFundEscrow}
                      onApproveEscrow={handleApproveEscrow}
                      onReleaseEscrow={handleReleaseEscrow}
                      onRefundEscrow={handleRefundEscrow}
                      onDisputeEscrow={handleDisputeEscrow}
                      onResolveDispute={handleResolveDispute}
                      onBatchFund={handleBatchFund}
                      onBatchApprove={handleBatchApprove}
                      onBatchRelease={handleBatchRelease}
                      onBatchCreate={handleBatchCreate}
                      isProcessing={isProcessingTx}
                      networkMode={networkMode}
                    />
                  </div>
                </div>

                {/* On-Chain Activity Table */}
                <ActivityTable events={events} networkMode={networkMode} />
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
        networkMode={networkMode}
        onToggleNetwork={handleToggleNetwork}
      />

      <PriceAlertsModal
        isOpen={isPriceAlertsOpen}
        onClose={() => {
          setIsPriceAlertsOpen(false);
          setActiveAlertsCount(PriceAlertService.getActiveAlerts().length);
        }}
        defaultSymbol={selectedAlertSymbol}
      />

      <TransactionTracker
        status={txStatus}
        onClose={() => setTxStatus({ step: 'idle', message: '' })}
        networkMode={networkMode}
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
