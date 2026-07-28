import { useState, useEffect, useRef, useMemo } from 'react';
import { fetchOrderbook, streamOrderbook, ASSETS } from '../lib/stellar';

/**
 * OrderBook — Real-time DEX orderbook display
 * Fetches and streams bids/asks from Horizon API
 */
export default function OrderBook({ sellAsset, buyAsset }) {
  const [orderbook, setOrderbook] = useState({ bids: [], asks: [] });
  const [loading, setLoading] = useState(true);
  const closeStreamRef = useRef(null);

  const sellingAsset = ASSETS[sellAsset] || ASSETS.XLM;
  const buyingAsset = ASSETS[buyAsset] || ASSETS.USDC;

  // Initial fetch + streaming
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      const data = await fetchOrderbook(sellingAsset, buyingAsset, 10);
      if (mounted) {
        setOrderbook(data);
        setLoading(false);
      }
    };

    init();

    // Start streaming
    try {
      closeStreamRef.current = streamOrderbook(sellingAsset, buyingAsset, (update) => {
        if (mounted) setOrderbook(update);
      });
    } catch (err) {
      console.warn('Streaming not supported, falling back to polling');
      // Poll every 5 seconds as fallback
      const interval = setInterval(async () => {
        const data = await fetchOrderbook(sellingAsset, buyingAsset, 10);
        if (mounted) setOrderbook(data);
      }, 5000);
      closeStreamRef.current = () => clearInterval(interval);
    }

    return () => {
      mounted = false;
      if (closeStreamRef.current) {
        closeStreamRef.current();
      }
    };
  }, [sellAsset, buyAsset]);

  // Calculate max amounts for depth bars
  const maxAskAmount = useMemo(() => {
    return Math.max(...orderbook.asks.map(a => a.amount), 1);
  }, [orderbook.asks]);

  const maxBidAmount = useMemo(() => {
    return Math.max(...orderbook.bids.map(b => b.amount), 1);
  }, [orderbook.bids]);

  // Calculate spread
  const spread = useMemo(() => {
    if (orderbook.asks.length && orderbook.bids.length) {
      const lowestAsk = orderbook.asks[0]?.price || 0;
      const highestBid = orderbook.bids[0]?.price || 0;
      if (highestBid > 0) {
        return ((lowestAsk - highestBid) / highestBid * 100).toFixed(3);
      }
    }
    return '—';
  }, [orderbook]);

  return (
    <div className="card" id="orderbook-panel">
      <div className="card__header">
        <span className="card__title">
          📊 Order Book
        </span>
        <span className="card__badge card__badge--live">● LIVE</span>
      </div>
      <div className="card__body orderbook" style={{ padding: '0' }}>
        {/* Header */}
        <div className="orderbook__header">
          <span>Price ({buyAsset})</span>
          <span style={{ textAlign: 'right' }}>Amount ({sellAsset})</span>
          <span style={{ textAlign: 'right' }}>Total</span>
        </div>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading orderbook...
          </div>
        ) : (
          <>
            {/* Asks (sells) - reversed so highest is at top */}
            <div style={{ maxHeight: '180px', overflow: 'auto' }}>
              {[...orderbook.asks].reverse().slice(0, 8).map((ask, i) => (
                <div key={`ask-${i}`} className="orderbook__row orderbook__row--ask">
                  <div
                    className="orderbook__depth orderbook__depth--ask"
                    style={{ width: `${(ask.amount / maxAskAmount) * 100}%` }}
                  />
                  <span className="orderbook__cell">{ask.price.toFixed(7)}</span>
                  <span className="orderbook__cell orderbook__cell--right">{ask.amount.toFixed(2)}</span>
                  <span className="orderbook__cell orderbook__cell--right">
                    {(ask.price * ask.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Spread */}
            <div className="orderbook__spread">
              Spread: {spread}%
              {orderbook.asks[0] && (
                <span style={{ marginLeft: '12px' }}>
                  Best Ask: {orderbook.asks[0].price.toFixed(7)}
                </span>
              )}
            </div>

            {/* Bids (buys) */}
            <div style={{ maxHeight: '180px', overflow: 'auto' }}>
              {orderbook.bids.slice(0, 8).map((bid, i) => (
                <div key={`bid-${i}`} className="orderbook__row orderbook__row--bid">
                  <div
                    className="orderbook__depth orderbook__depth--bid"
                    style={{ width: `${(bid.amount / maxBidAmount) * 100}%` }}
                  />
                  <span className="orderbook__cell">{bid.price.toFixed(7)}</span>
                  <span className="orderbook__cell orderbook__cell--right">{bid.amount.toFixed(2)}</span>
                  <span className="orderbook__cell orderbook__cell--right">
                    {(bid.price * bid.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {orderbook.bids.length === 0 && orderbook.asks.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No orders found for this pair on testnet
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
