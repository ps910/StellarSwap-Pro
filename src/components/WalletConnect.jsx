import { useState } from 'react';
import { WALLET_OPTIONS, connectWallet } from '../lib/walletKit';
import { getBalances, truncateAddress, formatAmount } from '../lib/stellar';
import { WalletNotFoundError, classifyError, getErrorToast } from '../lib/errors';

/**
 * WalletConnect — Multi-wallet connection component
 * Shows wallet selector modal with Freighter, xBull, LOBSTR
 */
export default function WalletConnect({ publicKey, balances, onConnect, onDisconnect, onError }) {
  const [showModal, setShowModal] = useState(false);
  const [connecting, setConnecting] = useState(null);

  const handleWalletSelect = async (wallet) => {
    setConnecting(wallet.id);
    try {
      const address = await connectWallet(wallet.id);

      // Fetch balances
      const bal = await getBalances(address);

      onConnect(address, wallet.id, bal);
      setShowModal(false);
    } catch (err) {
      console.error('Wallet connect error:', err);
      const classified = classifyError(err);
      const toast = getErrorToast(classified);
      onError(toast);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
  };

  // ── Connected State ──
  if (publicKey) {
    return (
      <div className="wallet-info">
        <span className="wallet-balance">
          {formatAmount(balances?.XLM || 0, 2)} XLM
        </span>
        <span className="wallet-address">{truncateAddress(publicKey, 6, 4)}</span>
        <button className="wallet-btn wallet-btn--disconnect" onClick={handleDisconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  // ── Disconnected State ──
  return (
    <>
      <button className="wallet-btn" onClick={() => setShowModal(true)} id="connect-wallet-btn">
        <span>🔗</span>
        Connect Wallet
      </button>

      {showModal && (
        <div className="wallet-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="wallet-modal" onClick={e => e.stopPropagation()}>
            <h2 className="wallet-modal__title">Connect Wallet</h2>
            <p className="wallet-modal__subtitle">Choose your preferred Stellar wallet</p>

            <div className="wallet-modal__options" id="wallet-options">
              {WALLET_OPTIONS.map(wallet => (
                <button
                  key={wallet.id}
                  className="wallet-option"
                  onClick={() => handleWalletSelect(wallet)}
                  disabled={connecting !== null}
                  id={`wallet-option-${wallet.id}`}
                >
                  <div className={`wallet-option__icon ${wallet.iconClass}`}>
                    {wallet.icon}
                  </div>
                  <div className="wallet-option__name">
                    <div>{wallet.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      {wallet.description}
                    </div>
                  </div>
                  <span className="wallet-option__arrow">
                    {connecting === wallet.id ? '⏳' : '→'}
                  </span>
                </button>
              ))}
            </div>

            <button className="wallet-modal__close" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
