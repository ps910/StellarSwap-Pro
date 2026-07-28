import { EXPLORER_URL } from '../lib/stellar';

/**
 * TransactionStatus — Tracks transaction states (pending/success/fail)
 * Shows history of recent transactions with links to Stellar Explorer
 */
export default function TransactionStatus({ transactions }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'success': return '✅';
      case 'failed': return '❌';
      default: return '•';
    }
  };

  const getTimeSince = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="card" id="transaction-status-panel">
      <div className="card__header">
        <span className="card__title">📜 Transactions</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {transactions.length} total
        </span>
      </div>
      <div className="card__body">
        {transactions.length === 0 ? (
          <div className="tx-empty">
            <div style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.3 }}>📋</div>
            <div>No transactions yet</div>
            <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              Make a swap to see transaction history
            </div>
          </div>
        ) : (
          <div className="tx-status">
            {[...transactions].reverse().map(tx => (
              <div key={tx.id} className="tx-item animate-in">
                <div className={`tx-item__icon tx-item__icon--${tx.status}`}>
                  {getStatusIcon(tx.status)}
                </div>
                <div className="tx-item__info">
                  <div className="tx-item__type">{tx.type}</div>
                  {tx.hash ? (
                    <a
                      className="tx-item__hash"
                      href={`${EXPLORER_URL}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={tx.hash}
                    >
                      {tx.hash.slice(0, 12)}...{tx.hash.slice(-8)}
                    </a>
                  ) : (
                    <span className="tx-item__hash">
                      {tx.status === 'pending' ? 'Awaiting confirmation...' : tx.error || 'Transaction failed'}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className={`tx-item__status tx-item__status--${tx.status}`}>
                    {tx.status.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {getTimeSince(tx.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
