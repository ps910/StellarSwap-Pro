import React, { useState, useEffect } from 'react';
import { PriceAlert, AlertCondition } from '../types';
import { priceAlertsService } from '../services/priceAlerts';
import { SUPPORTED_TOKENS, TokenInfo } from '../config/stellar';
import {
  Bell,
  X,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';

interface PriceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol?: string;
}

export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({
  isOpen,
  onClose,
  defaultSymbol = 'XLM',
}) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [tab, setTab] = useState<'create' | 'list'>('create');

  // Form State
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [condition, setCondition] = useState<AlertCondition>('ABOVE');
  const [targetPrice, setTargetPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [createdSuccess, setCreatedSuccess] = useState(false);

  const currentToken: TokenInfo =
    SUPPORTED_TOKENS.find((t) => t.symbol === symbol) || SUPPORTED_TOKENS[0];

  useEffect(() => {
    setAlerts(priceAlertsService.getAlerts());
    const unsub = priceAlertsService.subscribe(setAlerts);
    return unsub;
  }, []);

  useEffect(() => {
    if (defaultSymbol) {
      setSymbol(defaultSymbol);
      const token = SUPPORTED_TOKENS.find((t) => t.symbol === defaultSymbol);
      if (token) {
        setTargetPrice((token.priceUsd * 1.05).toFixed(token.priceUsd < 1 ? 5 : 2));
      }
    }
  }, [defaultSymbol, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (pct: number) => {
    const newTarget = currentToken.priceUsd * (1 + pct / 100);
    setTargetPrice(newTarget.toFixed(currentToken.priceUsd < 1 ? 5 : 2));
    setCondition(pct >= 0 ? 'ABOVE' : 'BELOW');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(targetPrice);
    if (isNaN(numPrice) || numPrice <= 0) return;

    priceAlertsService.createAlert(symbol, numPrice, condition, notes, soundEnabled);
    setCreatedSuccess(true);
    setTimeout(() => {
      setCreatedSuccess(false);
      setTab('list');
    }, 900);
  };

  const activeCount = alerts.filter((a) => a.active && !a.triggered).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/85 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-lg bg-surface border border-b-border rounded-2xl p-6 shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-b-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gold/10 text-gold border border-gold/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary">StellEx Price Alerts</h3>
                <span className="badge-gold text-[10px]">Real-Time RPC</span>
              </div>
              <p className="text-[11px] text-text-tertiary">
                Institutional market monitoring & instant threshold notifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 my-4 rounded-xl bg-canvas border border-b-border text-xs">
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'create' ? 'bg-gold text-black shadow-sm' : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            CREATE ALERT
          </button>
          <button
            onClick={() => setTab('list')}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'list' ? 'bg-gold text-black shadow-sm' : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            ACTIVE ALERTS ({activeCount})
          </button>
        </div>

        {tab === 'create' ? (
          /* ── CREATE ALERT FORM ── */
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {/* Asset Selector */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Target Token / Asset
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {SUPPORTED_TOKENS.slice(0, 5).map((t) => (
                  <button
                    key={t.symbol}
                    type="button"
                    onClick={() => {
                      setSymbol(t.symbol);
                      setTargetPrice((t.priceUsd * 1.05).toFixed(t.priceUsd < 1 ? 5 : 2));
                    }}
                    className={`py-2 px-1.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 transition-all ${
                      symbol === t.symbol
                        ? 'bg-gold/15 text-gold border-gold'
                        : 'bg-elevated text-text-secondary border-b-border hover:border-b-border-light'
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.symbol}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Price Banner */}
            <div className="p-3 rounded-xl bg-canvas border border-b-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-text-tertiary">Current {symbol} Price:</span>
                <span className="font-mono font-bold text-text-primary">
                  ${currentToken.priceUsd.toLocaleString(undefined, { minimumFractionDigits: currentToken.priceUsd < 1 ? 5 : 2 })}
                </span>
              </div>
              <span
                className={`font-semibold tabular-nums ${
                  currentToken.change24h >= 0 ? 'text-bullish' : 'text-bearish'
                }`}
              >
                {currentToken.change24h >= 0 ? '+' : ''}
                {currentToken.change24h}% (24h)
              </span>
            </div>

            {/* Condition & Target Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Condition Trigger
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as AlertCondition)}
                  className="w-full bg-elevated border border-b-border text-text-primary text-xs font-semibold rounded-xl p-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="ABOVE">Price Rises Above (≥)</option>
                  <option value="BELOW">Price Drops Below (≤)</option>
                  <option value="PCT_CHANGE_UP">% Gain Target (+%)</option>
                  <option value="PCT_CHANGE_DOWN">% Drop Target (-%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Target Price (USD)
                </label>
                <input
                  type="number"
                  step="any"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full bg-elevated border border-b-border text-text-primary text-sm font-bold rounded-xl p-2.5 font-mono focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* Quick Price Delta Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-text-disabled">Presets:</span>
              {[2, 5, 10, 20].map((pct) => (
                <button
                  key={`up-${pct}`}
                  type="button"
                  onClick={() => handleApplyPreset(pct)}
                  className="px-2 py-1 rounded-lg bg-bullish/10 text-bullish border border-bullish/20 text-[10px] font-bold hover:bg-bullish/20 transition-all"
                >
                  +{pct}%
                </button>
              ))}
              {[-5, -10, -20].map((pct) => (
                <button
                  key={`down-${pct}`}
                  type="button"
                  onClick={() => handleApplyPreset(pct)}
                  className="px-2 py-1 rounded-lg bg-bearish/10 text-bearish border border-bearish/20 text-[10px] font-bold hover:bg-bearish/20 transition-all"
                >
                  {pct}%
                </button>
              ))}
            </div>

            {/* Memo & Sound Option */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional alert memo / trading strategy..."
                className="flex-1 bg-elevated border border-b-border text-text-primary text-xs rounded-xl p-2.5 focus:outline-none focus:border-gold"
              />
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2.5 rounded-xl border transition-all ${
                  soundEnabled
                    ? 'bg-gold/15 text-gold border-gold/40'
                    : 'bg-elevated text-text-disabled border-b-border'
                }`}
                title={soundEnabled ? 'Chime Sound Enabled' : 'Muted'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={createdSuccess}
              className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-hover text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/15"
            >
              {createdSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>ALERT ACTIVATED!</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-black" />
                  <span>ACTIVATE PRICE ALERT</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* ── ALERTS LIST VIEW ── */
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="py-12 text-center text-text-tertiary">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-gold" />
                <p className="text-xs font-semibold">No price alerts created yet.</p>
                <p className="text-[11px] text-text-disabled mt-1">
                  Create your first alert to receive instant notifications when market targets are met.
                </p>
              </div>
            ) : (
              alerts.map((alert) => {
                const token = SUPPORTED_TOKENS.find((t) => t.symbol === alert.tokenSymbol);
                const currentPrice = token?.priceUsd || 0.1;
                return (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      alert.triggered
                        ? 'bg-canvas/50 border-b-border/40 opacity-75'
                        : alert.active
                        ? 'bg-elevated border-b-border hover:border-gold/40'
                        : 'bg-canvas border-b-border opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-text-primary text-sm font-mono">
                          {alert.tokenSymbol}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                            alert.condition === 'ABOVE' || alert.condition === 'PCT_CHANGE_UP'
                              ? 'bg-bullish/10 text-bullish'
                              : 'bg-bearish/10 text-bearish'
                          }`}
                        >
                          {alert.condition === 'ABOVE'
                            ? '≥'
                            : alert.condition === 'BELOW'
                            ? '≤'
                            : '+%'}
                          ${alert.targetPrice.toLocaleString(undefined, { minimumFractionDigits: alert.targetPrice < 1 ? 4 : 2 })}
                        </span>
                        {alert.triggered ? (
                          <span className="badge-gold text-[9px] py-0">TRIGGERED</span>
                        ) : alert.active ? (
                          <span className="badge-bullish text-[9px] py-0">LIVE</span>
                        ) : (
                          <span className="text-[9px] text-text-disabled">PAUSED</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => priceAlertsService.testTriggerAlert(alert.id)}
                          className="px-2 py-0.5 rounded bg-gold/10 hover:bg-gold/20 text-gold text-[10px] font-bold border border-gold/20 transition-all"
                          title="Simulate immediate alert trigger & audio chime"
                        >
                          Test
                        </button>
                        <button
                          onClick={() => priceAlertsService.toggleAlert(alert.id)}
                          className="px-2 py-0.5 rounded bg-canvas hover:bg-elevated text-text-tertiary text-[10px] border border-b-border"
                        >
                          {alert.active ? 'Pause' : 'Resume'}
                        </button>
                        <button
                          onClick={() => priceAlertsService.deleteAlert(alert.id)}
                          className="p-1 rounded text-bearish hover:bg-bearish/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-tertiary font-mono">
                      <span>Live: ${currentPrice.toLocaleString()}</span>
                      {alert.notes && <span className="text-text-disabled truncate max-w-[200px] italic">{alert.notes}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-b-border flex items-center justify-between text-[10px] text-text-tertiary">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-gold" />
            Background RPC Heartbeat Active
          </span>
          <span className="font-mono text-bullish">Audio & Notification API Ready</span>
        </div>
      </div>
    </div>
  );
};
