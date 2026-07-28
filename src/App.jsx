import { useState, useCallback } from 'react';
import WalletConnect from './components/WalletConnect';
import SwapInterface from './components/SwapInterface';
import OrderBook from './components/OrderBook';
import TransactionStatus from './components/TransactionStatus';
import ContractPanel from './components/ContractPanel';
import { ToastContainer, useToast } from './components/Toast';
import { ASSET_LIST, getBalances } from './lib/stellar';
import { recordSwap } from './lib/contract';
import { classifyError, getErrorToast } from './lib/errors';

/**
 * App — Main application layout
 * Assembles all components with shared wallet state
 */
export default function App() {
  // ── Wallet State ──
  const [publicKey, setPublicKey] = useState(null);
  const [walletId, setWalletId] = useState(null);
  const [balances, setBalances] = useState({});

  // ── Transaction History ──
  const [transactions, setTransactions] = useState([]);

  // ── Active trading pair ──
  const [sellAsset, setSellAsset] = useState('XLM');
  const [buyAsset, setBuyAsset] = useState('USDC');

  // ── Toast notifications ──
  const { toasts, addToast, removeToast } = useToast();

  // ── Handlers ──
  const handleConnect = useCallback((address, wId, bal) => {
    setPublicKey(address);
    setWalletId(wId);
    setBalances(bal);
    addToast({
      type: 'success',
      title: '🔗 Wallet Connected',
      message: `Connected to ${address.slice(0, 8)}...${address.slice(-4)}`,
    });
  }, [addToast]);

  const handleDisconnect = useCallback(() => {
    setPublicKey(null);
    setWalletId(null);
    setBalances({});
    addToast({
      type: 'info',
      title: '👋 Disconnected',
      message: 'Wallet has been disconnected.',
    });
  }, [addToast]);

  const handleTxUpdate = useCallback((tx) => {
    setTransactions(prev => {
      const existing = prev.findIndex(t => t.id === tx.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = tx;
        return updated;
      }
      return [...prev, tx];
    });
  }, []);

  const handleError = useCallback((toast) => {
    addToast(toast);
  }, [addToast]);

  // After a successful swap, record it on the contract
  const handleSwapSuccess = useCallback(async (swapData) => {
    if (!publicKey) return;

    try {
      const amountInStroops = Math.floor(parseFloat(swapData.amount) * 10000000);
      await recordSwap(publicKey, swapData.sellAsset, swapData.buyAsset, amountInStroops);
    } catch (err) {
      // Don't block user experience if contract call fails
      console.warn('Failed to record swap on contract:', err);
    }

    // Refresh balances
    try {
      const newBalances = await getBalances(publicKey);
      setBalances(newBalances);
    } catch (err) {
      console.warn('Balance refresh failed:', err);
    }
  }, [publicKey]);

  return (
    <div className="app">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <header className="header">
        <div className="header__logo">
          <div className="header__logo-icon">⚡</div>
          <div>
            <div className="header__title">StellarSwap</div>
            <div className="header__subtitle">Token Swap Interface</div>
          </div>
        </div>

        <div className="header__network-badge">
          <span className="header__network-dot" />
          Testnet
        </div>

        <WalletConnect
          publicKey={publicKey}
          balances={balances}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onError={handleError}
        />
      </header>

      {/* Main Grid: Orderbook | Swap | Contract */}
      <div className="main-grid">
        {/* Left: Orderbook */}
        <OrderBook sellAsset={sellAsset} buyAsset={buyAsset} />

        {/* Center: Swap Interface */}
        <SwapInterface
          publicKey={publicKey}
          balances={balances}
          onTxUpdate={handleTxUpdate}
          onError={handleError}
          onSwapSuccess={handleSwapSuccess}
        />

        {/* Right: Contract Panel */}
        <ContractPanel
          publicKey={publicKey}
          onError={handleError}
          onTxUpdate={handleTxUpdate}
        />
      </div>

      {/* Bottom Row: Transaction History */}
      <div className="bottom-row">
        <TransactionStatus transactions={transactions} />

        {/* Info Panel */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">ℹ️ About</span>
          </div>
          <div className="card__body">
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              <p style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>StellarSwap</strong> is a token swap interface
                built on the Stellar DEX with Soroban smart contract integration.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                <div style={{
                  padding: '8px 12px',
                  background: 'var(--bg-glass)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wallets</div>
                  <div style={{ color: 'var(--text-accent)', fontWeight: 600, marginTop: '4px' }}>Freighter, xBull, LOBSTR</div>
                </div>
                <div style={{
                  padding: '8px 12px',
                  background: 'var(--bg-glass)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Network</div>
                  <div style={{ color: 'var(--color-success)', fontWeight: 600, marginTop: '4px' }}>Stellar Testnet</div>
                </div>
                <div style={{
                  padding: '8px 12px',
                  background: 'var(--bg-glass)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Errors Handled</div>
                  <div style={{ color: 'var(--color-warning)', fontWeight: 600, marginTop: '4px' }}>3 Types</div>
                </div>
                <div style={{
                  padding: '8px 12px',
                  background: 'var(--bg-glass)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contract</div>
                  <div style={{ color: 'var(--text-accent)', fontWeight: 600, marginTop: '4px' }}>SwapTracker</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        Built with ⚡ on{' '}
        <a href="https://stellar.org" target="_blank" rel="noopener noreferrer">
          Stellar
        </a>{' '}
        &{' '}
        <a href="https://soroban.stellar.org" target="_blank" rel="noopener noreferrer">
          Soroban
        </a>{' '}
        | Level 2 Submission
      </footer>
    </div>
  );
}
