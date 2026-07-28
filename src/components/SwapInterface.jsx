import { useState, useEffect, useRef } from 'react';
import {
  ASSET_LIST,
  buildSwapTransaction,
  submitTransaction,
  fetchOrderbook,
  ASSETS,
  formatAmount,
} from '../lib/stellar';
import { signTransaction } from '../lib/walletKit';
import { InsufficientBalanceError, classifyError, getErrorToast } from '../lib/errors';

/**
 * SwapInterface — Token swap UI with live pricing
 * Builds manageSellOffer transactions on the Stellar DEX
 */
export default function SwapInterface({ publicKey, balances, onTxUpdate, onError, onSwapSuccess }) {
  const [sellAssetIndex, setSellAssetIndex] = useState(0);
  const [buyAssetIndex, setBuyAssetIndex] = useState(1);
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSellDropdown, setShowSellDropdown] = useState(false);
  const [showBuyDropdown, setShowBuyDropdown] = useState(false);
  const priceIntervalRef = useRef(null);

  const sellAsset = ASSET_LIST[sellAssetIndex];
  const buyAsset = ASSET_LIST[buyAssetIndex];

  // Fetch best price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const ob = await fetchOrderbook(ASSETS[sellAsset.code], ASSETS[buyAsset.code], 1);
        if (ob.bids.length > 0) {
          setPrice(ob.bids[0].price);
        } else if (ob.asks.length > 0) {
          setPrice(ob.asks[0].price);
        }
      } catch (err) {
        console.warn('Price fetch failed:', err);
      }
    };

    fetchPrice();
    priceIntervalRef.current = setInterval(fetchPrice, 10000);

    return () => clearInterval(priceIntervalRef.current);
  }, [sellAssetIndex, buyAssetIndex]);

  // Update estimated receive amount
  useEffect(() => {
    if (sellAmount && price) {
      const estimated = parseFloat(sellAmount) * price;
      setBuyAmount(estimated.toFixed(7));
    } else {
      setBuyAmount('');
    }
  }, [sellAmount, price]);

  // Swap direction
  const handleSwapDirection = () => {
    setSellAssetIndex(buyAssetIndex);
    setBuyAssetIndex(sellAssetIndex);
    setSellAmount('');
    setBuyAmount('');
  };

  // Set max balance
  const handleMaxClick = () => {
    const bal = balances?.[sellAsset.code] || 0;
    // Reserve 2 XLM for fees if selling XLM
    const maxAmount = sellAsset.code === 'XLM' ? Math.max(0, bal - 2) : bal;
    setSellAmount(maxAmount.toFixed(7));
  };

  // Execute swap
  const handleSwap = async () => {
    if (!publicKey) {
      onError({ type: 'warning', title: '🔗 Connect Wallet', message: 'Please connect your wallet first.' });
      return;
    }

    const amount = parseFloat(sellAmount);
    if (!amount || amount <= 0) {
      onError({ type: 'warning', title: '⚠️ Invalid Amount', message: 'Please enter a valid amount to swap.' });
      return;
    }

    // Check balance
    const available = balances?.[sellAsset.code] || 0;
    const minReserve = sellAsset.code === 'XLM' ? 2 : 0;
    if (amount > available - minReserve) {
      const err = new InsufficientBalanceError(sellAsset.code, amount, available);
      onError(getErrorToast(err));
      return;
    }

    if (!price || price <= 0) {
      onError({ type: 'warning', title: '⚠️ No Price', message: 'Unable to determine market price. Try again.' });
      return;
    }

    setLoading(true);
    const txId = Date.now().toString();

    onTxUpdate({
      id: txId,
      type: `Swap ${sellAsset.code} → ${buyAsset.code}`,
      status: 'pending',
      hash: null,
      timestamp: new Date().toISOString(),
    });

    try {
      // Build transaction
      const tx = await buildSwapTransaction(
        publicKey,
        ASSETS[sellAsset.code],
        ASSETS[buyAsset.code],
        sellAmount,
        price.toString()
      );

      // Sign via wallet
      const signedXdr = await signTransaction(tx.toXDR());

      // Submit
      const result = await submitTransaction(signedXdr);

      onTxUpdate({
        id: txId,
        type: `Swap ${sellAsset.code} → ${buyAsset.code}`,
        status: 'success',
        hash: result.hash,
        timestamp: new Date().toISOString(),
      });

      onError({
        type: 'success',
        title: '✅ Swap Successful!',
        message: `Swapped ${sellAmount} ${sellAsset.code} for ~${buyAmount} ${buyAsset.code}`,
      });

      // Notify parent of successful swap for contract recording
      if (onSwapSuccess) {
        onSwapSuccess({
          sellAsset: sellAsset.code,
          buyAsset: buyAsset.code,
          amount: sellAmount,
          hash: result.hash,
        });
      }

      setSellAmount('');
      setBuyAmount('');
    } catch (err) {
      console.error('Swap error:', err);
      const classified = classifyError(err);
      const toast = getErrorToast(classified);

      onTxUpdate({
        id: txId,
        type: `Swap ${sellAsset.code} → ${buyAsset.code}`,
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
    <div className="card swap-card" id="swap-panel">
      <div className="card__header">
        <span className="card__title">⚡ Swap</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Stellar DEX
        </span>
      </div>
      <div className="card__body">
        {/* Sell Input */}
        <div className="swap-input-group">
          <div className="swap-input-group__label">
            <span>You Pay</span>
            <span
              className="swap-input-group__balance"
              onClick={handleMaxClick}
              title="Click to use max"
            >
              Balance: {formatAmount(balances?.[sellAsset.code] || 0, 4)} {sellAsset.code}
            </span>
          </div>
          <div className="swap-input-group__row">
            <input
              type="number"
              className="swap-input"
              placeholder="0.00"
              value={sellAmount}
              onChange={e => setSellAmount(e.target.value)}
              min="0"
              step="any"
              id="sell-amount-input"
            />
            <div className="asset-dropdown">
              <button
                className="asset-selector"
                onClick={() => setShowSellDropdown(!showSellDropdown)}
                id="sell-asset-selector"
              >
                <span className={`asset-selector__icon asset-icon--${sellAsset.color}`}>
                  {sellAsset.icon}
                </span>
                {sellAsset.code}
                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>▼</span>
              </button>
              {showSellDropdown && (
                <div className="asset-dropdown__menu">
                  {ASSET_LIST.map((asset, i) => (
                    <button
                      key={asset.code}
                      className={`asset-dropdown__item ${i === sellAssetIndex ? 'asset-dropdown__item--active' : ''}`}
                      onClick={() => {
                        if (i === buyAssetIndex) handleSwapDirection();
                        else setSellAssetIndex(i);
                        setShowSellDropdown(false);
                      }}
                    >
                      <span className={`asset-selector__icon asset-icon--${asset.color}`}>
                        {asset.icon}
                      </span>
                      {asset.code}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asset.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Direction Toggle */}
        <div className="swap-direction">
          <button className="swap-direction__btn" onClick={handleSwapDirection} title="Switch direction" id="swap-direction-btn">
            ↕
          </button>
        </div>

        {/* Buy Input */}
        <div className="swap-input-group">
          <div className="swap-input-group__label">
            <span>You Receive (est.)</span>
            <span className="swap-input-group__balance">
              Balance: {formatAmount(balances?.[buyAsset.code] || 0, 4)} {buyAsset.code}
            </span>
          </div>
          <div className="swap-input-group__row">
            <input
              type="number"
              className="swap-input"
              placeholder="0.00"
              value={buyAmount}
              readOnly
              id="buy-amount-input"
            />
            <div className="asset-dropdown">
              <button
                className="asset-selector"
                onClick={() => setShowBuyDropdown(!showBuyDropdown)}
                id="buy-asset-selector"
              >
                <span className={`asset-selector__icon asset-icon--${buyAsset.color}`}>
                  {buyAsset.icon}
                </span>
                {buyAsset.code}
                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>▼</span>
              </button>
              {showBuyDropdown && (
                <div className="asset-dropdown__menu">
                  {ASSET_LIST.map((asset, i) => (
                    <button
                      key={asset.code}
                      className={`asset-dropdown__item ${i === buyAssetIndex ? 'asset-dropdown__item--active' : ''}`}
                      onClick={() => {
                        if (i === sellAssetIndex) handleSwapDirection();
                        else setBuyAssetIndex(i);
                        setShowBuyDropdown(false);
                      }}
                    >
                      <span className={`asset-selector__icon asset-icon--${asset.color}`}>
                        {asset.icon}
                      </span>
                      {asset.code}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asset.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price Info */}
        {price && (
          <div className="swap-price-info">
            <span>Rate</span>
            <span className="swap-price-info__value">
              1 {sellAsset.code} ≈ {price.toFixed(7)} {buyAsset.code}
            </span>
          </div>
        )}

        {/* Submit */}
        <button
          className="swap-submit-btn"
          onClick={handleSwap}
          disabled={loading || !sellAmount || !publicKey}
          id="swap-submit-btn"
        >
          {loading ? '⏳ Processing...' : !publicKey ? '🔗 Connect Wallet to Swap' : `Swap ${sellAsset.code} for ${buyAsset.code}`}
        </button>
      </div>
    </div>
  );
}
