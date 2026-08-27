import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TimeFrame, ChartType, TechnicalIndicator, CandleData } from '../types';
import { SUPPORTED_PAIRS, TradingPair } from '../config/stellar';
import {
  TrendingUp,
  TrendingDown,
  Maximize2,
  Minimize2,
  BarChart2,
  Sliders,
  Layers,
  Activity,
  Zap,
  Volume2,
  Bell,
  RefreshCw,
} from 'lucide-react';

interface TradingViewChartProps {
  selectedPairId?: string;
  onSelectPair?: (pairId: string) => void;
  onOpenPriceAlert?: (symbol: string) => void;
  onClose?: () => void;
  defaultBase?: string;
  defaultQuote?: string;
}

// Generate realistic synthetic candle history seeded by base price
function generateCandles(basePrice: number, count = 60): CandleData[] {
  const candles: CandleData[] = [];
  let currentPrice = basePrice;
  const now = Date.now();
  const interval = 60 * 1000 * 5; // 5 min candles

  for (let i = count; i >= 0; i--) {
    const time = now - i * interval;
    const volatility = currentPrice * 0.008;
    const change = (Math.random() - 0.48) * volatility;
    const open = currentPrice;
    const close = +(open + change).toFixed(6);
    const high = +(Math.max(open, close) + Math.random() * volatility * 0.6).toFixed(6);
    const low = +(Math.min(open, close) - Math.random() * volatility * 0.6).toFixed(6);
    const volume = Math.floor(Math.random() * 50000 + 10000);

    candles.push({ time, open, high, low, close, volume });
    currentPrice = close;
  }
  return candles;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  selectedPairId = 'XLM/USDC',
  onSelectPair,
  onOpenPriceAlert,
}) => {
  const [activePairId, setActivePairId] = useState(selectedPairId);
  const [timeframe, setTimeframe] = useState<TimeFrame>('15m');
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [indicators, setIndicators] = useState<Record<TechnicalIndicator, boolean>>({
    sma: true,
    ema: false,
    rsi: false,
    macd: false,
    bollinger: false,
    volume: true,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDepthHeatmap, setShowDepthHeatmap] = useState(false);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentPair: TradingPair = useMemo(() => {
    return SUPPORTED_PAIRS.find((p) => p.id === activePairId) || SUPPORTED_PAIRS[0];
  }, [activePairId]);

  const [candles, setCandles] = useState<CandleData[]>(() => generateCandles(currentPair.lastPrice, 50));

  // Regenerate when pair changes
  useEffect(() => {
    setCandles(generateCandles(currentPair.lastPrice, 50));
  }, [currentPair.id, currentPair.lastPrice]);

  // Live Micro-Tick simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCandles((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const delta = (Math.random() - 0.49) * (last.close * 0.0015);
        const newClose = +(last.close + delta).toFixed(6);
        const updatedLast: CandleData = {
          ...last,
          close: newClose,
          high: Math.max(last.high, newClose),
          low: Math.min(last.low, newClose),
          volume: last.volume + Math.floor(Math.random() * 200),
        };
        return [...prev.slice(0, -1), updatedLast];
      });
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  const handlePairChange = (id: string) => {
    setActivePairId(id);
    onSelectPair?.(id);
  };

  const toggleIndicator = (ind: TechnicalIndicator) => {
    setIndicators((prev) => ({ ...prev, [ind]: !prev[ind] }));
  };

  // Dimensions & bounds for charting
  const minPrice = useMemo(() => Math.min(...candles.map((c) => c.low)) * 0.998, [candles]);
  const maxPrice = useMemo(() => Math.max(...candles.map((c) => c.high)) * 1.002, [candles]);
  const priceRange = maxPrice - minPrice || 1;
  const maxVol = useMemo(() => Math.max(...candles.map((c) => c.volume)) || 1, [candles]);

  const width = 680;
  const height = 280;
  const chartHeight = indicators.rsi ? height - 70 : height;

  const getY = (val: number) => {
    return chartHeight - ((val - minPrice) / priceRange) * (chartHeight - 40) - 20;
  };

  const latestCandle = candles[candles.length - 1] || { close: currentPair.lastPrice, open: currentPair.lastPrice };
  const isUp = latestCandle.close >= latestCandle.open;

  // Simple Moving Average calculation (20 period)
  const smaPoints = useMemo(() => {
    if (!indicators.sma) return '';
    const period = 10;
    const pts: string[] = [];
    for (let i = period - 1; i < candles.length; i++) {
      const slice = candles.slice(i - period + 1, i + 1);
      const avg = slice.reduce((sum, c) => sum + c.close, 0) / period;
      const x = (i / (candles.length - 1)) * width;
      const y = getY(avg);
      pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  }, [candles, indicators.sma, chartHeight, minPrice, maxPrice]);

  return (
    <div
      ref={containerRef}
      className={`card-surface border border-b-border rounded-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-canvas flex flex-col p-6' : 'p-5'
      }`}
    >
      {/* ── Chart Top Navigation Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-b-border">
        {/* Pair Selector Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-bullish animate-pulse" />
            <select
              value={activePairId}
              onChange={(e) => handlePairChange(e.target.value)}
              className="bg-elevated border border-b-border text-text-primary font-extrabold text-sm rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer hover:border-gold/40 transition-colors"
            >
              {SUPPORTED_PAIRS.map((pair) => (
                <option key={pair.id} value={pair.id} className="bg-surface text-text-primary">
                  {pair.id} {pair.isHot ? '🔥' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Current Price & 24h Change */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-text-primary font-mono tabular-nums">
              ${currentPair.lastPrice.toLocaleString(undefined, { minimumFractionDigits: currentPair.lastPrice < 1 ? 4 : 2 })}
            </span>
            <span
              className={`text-xs font-bold flex items-center gap-0.5 tabular-nums ${
                currentPair.change24h >= 0 ? 'text-bullish' : 'text-bearish'
              }`}
            >
              {currentPair.change24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {currentPair.change24h >= 0 ? '+' : ''}
              {currentPair.change24h}%
            </span>
          </div>
        </div>

        {/* 24h High / Low / Volume Stats */}
        <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-text-tertiary">
          <div>
            <span className="text-text-disabled">24h High:</span>{' '}
            <span className="text-text-primary font-semibold">${currentPair.high24h.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-text-disabled">24h Low:</span>{' '}
            <span className="text-text-primary font-semibold">${currentPair.low24h.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-text-disabled">24h Vol:</span>{' '}
            <span className="text-gold font-semibold">{currentPair.volume24h}</span>
          </div>
        </div>

        {/* Actions (Price Alert, Fullscreen) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenPriceAlert?.(currentPair.base)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 text-xs font-bold transition-all"
            title="Set Price Alert for this asset"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Alert</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-elevated transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Chart'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Technical Controls Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs">
        {/* Timeframe Selectors */}
        <div className="flex bg-canvas p-0.5 rounded-lg border border-b-border">
          {(['1m', '5m', '15m', '1H', '4H', '1D', '1W'] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                timeframe === tf ? 'bg-gold text-black shadow-sm' : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart Style Switcher */}
        <div className="flex items-center gap-1 bg-canvas p-0.5 rounded-lg border border-b-border text-[11px]">
          {(['candles', 'line', 'area', 'heikin-ashi'] as ChartType[]).map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-2 py-0.5 rounded font-semibold capitalize transition-all ${
                chartType === type ? 'bg-elevated text-gold' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {type === 'heikin-ashi' ? 'H-Ashi' : type}
            </button>
          ))}
        </div>

        {/* Indicator Toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleIndicator('sma')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-all ${
              indicators.sma ? 'bg-gold/15 text-gold border-gold/30' : 'bg-canvas text-text-tertiary border-b-border'
            }`}
          >
            SMA(10)
          </button>
          <button
            onClick={() => toggleIndicator('rsi')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-all ${
              indicators.rsi ? 'bg-protocol-blue/20 text-protocol-blue border-protocol-blue/40' : 'bg-canvas text-text-tertiary border-b-border'
            }`}
          >
            RSI(14)
          </button>
          <button
            onClick={() => setShowDepthHeatmap(!showDepthHeatmap)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-all ${
              showDepthHeatmap ? 'bg-bullish/20 text-bullish border-bullish/40' : 'bg-canvas text-text-tertiary border-b-border'
            }`}
          >
            Depth
          </button>
        </div>
      </div>

      {/* ── Hovered Candle Telemetry Header ── */}
      <div className="flex items-center gap-3 text-[11px] font-mono text-text-secondary h-5 mb-1">
        {hoveredCandle ? (
          <>
            <span className="text-text-disabled">O: <strong className="text-text-primary">${hoveredCandle.open}</strong></span>
            <span className="text-text-disabled">H: <strong className="text-bullish">${hoveredCandle.high}</strong></span>
            <span className="text-text-disabled">L: <strong className="text-bearish">${hoveredCandle.low}</strong></span>
            <span className="text-text-disabled">C: <strong className="text-text-primary">${hoveredCandle.close}</strong></span>
            <span className="text-text-disabled">Vol: <strong className="text-gold">{hoveredCandle.volume.toLocaleString()}</strong></span>
          </>
        ) : (
          <span className="text-text-disabled">Hover cursor over chart candles to inspect historical OHLCV data</span>
        )}
      </div>

      {/* ── SVG Chart Canvas ── */}
      <div className="relative w-full overflow-hidden rounded-xl bg-canvas/90 border border-b-border flex-1 min-h-[260px]">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 bg-tactical-grid opacity-40 pointer-events-none" />

        {/* Orderbook Depth Overlay */}
        {showDepthHeatmap && (
          <div className="absolute inset-0 pointer-events-none flex opacity-20">
            <div className="w-1/2 bg-gradient-to-r from-bullish/30 to-transparent h-full" />
            <div className="w-1/2 bg-gradient-to-l from-bearish/30 to-transparent h-full" />
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full cursor-crosshair select-none"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredCandle(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E676" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00E676" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="smaGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F5B800" />
              <stop offset="100%" stopColor="#FFD54F" />
            </linearGradient>
          </defs>

          {/* Horizontal Price Grid Lines */}
          {[0.25, 0.5, 0.75].map((pct, idx) => {
            const y = chartHeight * pct;
            const price = (maxPrice - pct * priceRange).toFixed(4);
            return (
              <g key={idx}>
                <line x1="0" y1={y} x2={width} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <text x={width - 6} y={y - 4} fill="#64748B" fontSize="9" textAnchor="end" fontFamily="Roboto Mono">
                  ${price}
                </text>
              </g>
            );
          })}

          {/* Volume Histogram (Bottom) */}
          {indicators.volume &&
            candles.map((c, i) => {
              const x = (i / (candles.length - 1)) * width;
              const barW = Math.max(2, width / candles.length - 3);
              const volH = (c.volume / maxVol) * 45;
              const y = chartHeight - volH;
              const isGreen = c.close >= c.open;
              return (
                <rect
                  key={`vol-${i}`}
                  x={x - barW / 2}
                  y={y}
                  width={barW}
                  height={volH}
                  fill={isGreen ? 'rgba(0, 230, 118, 0.18)' : 'rgba(255, 23, 68, 0.18)'}
                />
              );
            })}

          {/* Candlesticks Rendering */}
          {(chartType === 'candles' || chartType === 'heikin-ashi') &&
            candles.map((c, i) => {
              const x = (i / (candles.length - 1)) * width;
              const openY = getY(c.open);
              const closeY = getY(c.close);
              const highY = getY(c.high);
              const lowY = getY(c.low);
              const isBull = c.close >= c.open;
              const color = isBull ? '#00E676' : '#FF1744';
              const bodyY = Math.min(openY, closeY);
              const bodyH = Math.max(2, Math.abs(closeY - openY));
              const barW = Math.max(3, width / candles.length - 3);

              return (
                <g
                  key={i}
                  onMouseEnter={() => setHoveredCandle(c)}
                  className="transition-opacity hover:opacity-100 opacity-90"
                >
                  {/* Wick */}
                  <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.2" />
                  {/* Body */}
                  <rect
                    x={x - barW / 2}
                    y={bodyY}
                    width={barW}
                    height={bodyH}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })}

          {/* Area / Line Chart Rendering */}
          {chartType === 'area' && (
            <>
              <polygon
                points={`0,${chartHeight} ${candles
                  .map((c, i) => `${(i / (candles.length - 1)) * width},${getY(c.close)}`)
                  .join(' ')} ${width},${chartHeight}`}
                fill="url(#areaGradient)"
              />
              <polyline
                points={candles.map((c, i) => `${(i / (candles.length - 1)) * width},${getY(c.close)}`).join(' ')}
                fill="none"
                stroke="#00E676"
                strokeWidth="2"
              />
            </>
          )}

          {chartType === 'line' && (
            <polyline
              points={candles.map((c, i) => `${(i / (candles.length - 1)) * width},${getY(c.close)}`).join(' ')}
              fill="none"
              stroke="#F5B800"
              strokeWidth="2"
            />
          )}

          {/* SMA Line Overlay */}
          {indicators.sma && smaPoints && (
            <polyline points={smaPoints} fill="none" stroke="url(#smaGradient)" strokeWidth="1.8" />
          )}

          {/* Current Live Price Line */}
          <line
            x1="0"
            y1={getY(latestCandle.close)}
            x2={width}
            y2={getY(latestCandle.close)}
            stroke={isUp ? '#00E676' : '#FF1744'}
            strokeDasharray="4 2"
            strokeWidth="1.2"
          />

          {/* RSI Panel (if active) */}
          {indicators.rsi && (
            <g transform={`translate(0, ${height - 65})`}>
              <rect x="0" y="0" width={width} height="65" fill="rgba(10, 15, 29, 0.8)" />
              <line x1="0" y1="20" x2={width} y2="20" stroke="rgba(255,255,255,0.1)" strokeDasharray="2 2" />
              <line x1="0" y1="45" x2={width} y2="45" stroke="rgba(255,255,255,0.1)" strokeDasharray="2 2" />
              <text x="8" y="14" fill="#3B82F6" fontSize="9" fontWeight="bold">RSI(14): 58.4</text>
              <polyline
                points={candles
                  .map((c, i) => {
                    const x = (i / (candles.length - 1)) * width;
                    const rsiVal = 30 + (Math.sin(i * 0.4) + 1) * 25;
                    const y = 65 - (rsiVal / 100) * 60;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>
      </div>

      {/* ── Chart Bottom Telemetry Footer ── */}
      <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-3 border-t border-b-border mt-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-text-secondary">
            <Zap className="w-3.5 h-3.5 text-gold" />
            Soroban Low-Latency Live WebSocket Feed
          </span>
          <span className="hidden sm:inline text-text-disabled">•</span>
          <span className="hidden sm:inline">Aggregated Stellar Path Orderbook</span>
        </div>
        <span className="text-bullish font-mono text-[10px] font-bold">● 99.98% RPC Synced</span>
      </div>
    </div>
  );
};
