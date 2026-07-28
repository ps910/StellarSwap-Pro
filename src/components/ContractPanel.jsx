import { useState, useEffect, useCallback } from 'react';
import { SWAP_TRACKER_CONTRACT_ID, EXPLORER_URL, truncateAddress } from '../lib/stellar';
import { getSwapCount, getLastSwap, recordSwap, getContractEvents } from '../lib/contract';
import { classifyError, getErrorToast } from '../lib/errors';

/**
 * ContractPanel — Displays Soroban contract state and allows interaction
 * Shows swap count, last swap, and allows recording new swaps
 */
export default function ContractPanel({ publicKey, onError, onTxUpdate }) {
  const [swapCount, setSwapCount] = useState(0);
  const [lastSwap, setLastSwap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);

  // Fetch contract state
  const fetchContractState = useCallback(async () => {
    setRefreshing(true);
    try {
      const [count, last, evts] = await Promise.all([
        getSwapCount(),
        getLastSwap(),
        getContractEvents(),
      ]);
      setSwapCount(count);
      setLastSwap(last);
      setEvents(evts);
    } catch (err) {
      console.warn('Contract state fetch error:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchContractState();
    const interval = setInterval(fetchContractState, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [fetchContractState]);

  // Manual record swap
  const handleRecordSwap = async () => {
    if (!publicKey) {
      onError({ type: 'warning', title: '🔗 Connect Wallet', message: 'Connect your wallet to record a swap.' });
      return;
    }

    setLoading(true);
    const txId = `contract-${Date.now()}`;

    onTxUpdate({
      id: txId,
      type: 'Record Swap (Contract)',
      status: 'pending',
      hash: null,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await recordSwap(publicKey, 'XLM', 'USDC', 1000000);

      onTxUpdate({
        id: txId,
        type: 'Record Swap (Contract)',
        status: 'success',
        hash: result.hash,
        timestamp: new Date().toISOString(),
      });

      onError({
        type: 'success',
        title: '✅ Contract Call Successful',
        message: `Swap recorded on-chain! Hash: ${result.hash.slice(0, 16)}...`,
      });

      // Refresh state
      await fetchContractState();
    } catch (err) {
      console.error('Record swap error:', err);
      const classified = classifyError(err);
      const toast = getErrorToast(classified);

      onTxUpdate({
        id: txId,
        type: 'Record Swap (Contract)',
        status: 'failed',
        hash: null,
        timestamp: new Date().toISOString(),
        error: classified.message,
      });

      onError(toast);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" id="contract-panel">
      <div className="card__header">
        <span className="card__title">📄 Smart Contract</span>
        <button
          onClick={fetchContractState}
          disabled={refreshing}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'transform 0.3s',
            transform: refreshing ? 'rotate(360deg)' : 'none',
          }}
          title="Refresh"
        >
          🔄
        </button>
      </div>
      <div className="card__body">
        {/* Stats Grid */}
        <div className="contract-stats">
          <div className="contract-stat">
            <div className="contract-stat__value">{swapCount}</div>
            <div className="contract-stat__label">Total Swaps</div>
          </div>
          <div className="contract-stat">
            <div className="contract-stat__value">{events.length}</div>
            <div className="contract-stat__label">Events</div>
          </div>
        </div>

        {/* Last Swap Details */}
        {lastSwap && (
          <div className="contract-last-swap">
            <div className="contract-last-swap__title">Last Recorded Swap</div>
            <div className="contract-last-swap__detail">
              <span>Pair</span>
              <span>{lastSwap.sell_asset || '—'} → {lastSwap.buy_asset || '—'}</span>
            </div>
            <div className="contract-last-swap__detail">
              <span>User</span>
              <span>{truncateAddress(lastSwap.user, 4, 4)}</span>
            </div>
            <div className="contract-last-swap__detail">
              <span>Amount</span>
              <span>{lastSwap.amount?.toString() || '—'}</span>
            </div>
          </div>
        )}

        {/* Record Swap Button */}
        <button
          className="contract-btn"
          onClick={handleRecordSwap}
          disabled={loading || !publicKey}
          id="record-swap-btn"
        >
          {loading ? '⏳ Recording...' : '📝 Record Swap On-Chain'}
        </button>

        {/* Contract Address */}
        <div className="contract-address">
          <div className="contract-address__label">Contract ID</div>
          <a
            href={`${EXPLORER_URL}/contract/${SWAP_TRACKER_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-muted)', textDecoration: 'none', wordBreak: 'break-all' }}
            title="View on Stellar Explorer"
          >
            {SWAP_TRACKER_CONTRACT_ID}
          </a>
        </div>
      </div>
    </div>
  );
}
