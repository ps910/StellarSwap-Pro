/**
 * StellEx Pro — Real-Time Price Alerts Engine
 * Monitors active trading pairs against user-defined price thresholds with audio/visual triggers.
 */
import { PriceAlert, AlertCondition } from '../types';
import { SUPPORTED_TOKENS } from '../config/stellar';

const ALERTS_STORAGE_KEY = 'stellex_price_alerts';

class PriceAlertsService {
  private alerts: PriceAlert[] = [];
  private listeners: Array<(alerts: PriceAlert[]) => void> = [];
  private triggerListeners: Array<(alert: PriceAlert, currentPrice: number) => void> = [];
  private checkInterval: any = null;

  constructor() {
    this.loadAlerts();
    this.startMonitoring();
  }

  private loadAlerts(): void {
    try {
      const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (stored) {
        this.alerts = JSON.parse(stored);
      } else {
        // Seed some initial smart alerts
        this.alerts = [
          {
            id: 'alert-1',
            tokenSymbol: 'XLM',
            targetPrice: 0.1250,
            condition: 'ABOVE',
            currentPriceAtCreation: 0.1145,
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            triggered: false,
            active: true,
            soundEnabled: true,
            notes: 'Take profit target on XLM breakout',
          },
          {
            id: 'alert-2',
            tokenSymbol: 'AQUA',
            targetPrice: 0.0040,
            condition: 'BELOW',
            currentPriceAtCreation: 0.00482,
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            triggered: false,
            active: true,
            soundEnabled: true,
            notes: 'Buy dip zone for liquidity provisioning',
          },
        ];
        this.saveAlerts();
      }
    } catch {
      this.alerts = [];
    }
  }

  private saveAlerts(): void {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(this.alerts));
      this.notifyListeners();
    } catch (e) {
      console.warn('[StellEx Pro] Could not persist price alerts:', e);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => fn([...this.alerts]));
  }

  public getAlerts(): PriceAlert[] {
    return [...this.alerts];
  }

  public getActiveAlerts(): PriceAlert[] {
    return this.alerts.filter((a) => a.active && !a.triggered);
  }

  public onAlertTriggered(listener: (alert: PriceAlert) => void): () => void {
    return this.onTrigger((alert) => listener(alert));
  }

  public subscribe(listener: (alerts: PriceAlert[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.alerts]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public onTrigger(listener: (alert: PriceAlert, currentPrice: number) => void): () => void {
    this.triggerListeners.push(listener);
    return () => {
      this.triggerListeners = this.triggerListeners.filter((l) => l !== listener);
    };
  }

  public createAlert(
    tokenSymbol: string,
    targetPrice: number,
    condition: AlertCondition,
    notes?: string,
    soundEnabled: boolean = true
  ): PriceAlert {
    const token = SUPPORTED_TOKENS.find((t) => t.symbol === tokenSymbol);
    const currentPrice = token?.priceUsd || 0.1;

    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tokenSymbol,
      targetPrice,
      condition,
      currentPriceAtCreation: currentPrice,
      createdAt: new Date().toISOString(),
      triggered: false,
      active: true,
      soundEnabled,
      notes,
    };

    this.alerts.unshift(newAlert);
    this.saveAlerts();

    // Check immediately in case condition is already met
    this.evaluateAlert(newAlert, currentPrice);

    return newAlert;
  }

  public toggleAlert(id: string): void {
    this.alerts = this.alerts.map((a) =>
      a.id === id ? { ...a, active: !a.active } : a
    );
    this.saveAlerts();
  }

  public deleteAlert(id: string): void {
    this.alerts = this.alerts.filter((a) => a.id !== id);
    this.saveAlerts();
  }

  public testTriggerAlert(id: string): void {
    const alert = this.alerts.find((a) => a.id === id);
    if (!alert) return;
    const token = SUPPORTED_TOKENS.find((t) => t.symbol === alert.tokenSymbol);
    const currentPrice = token?.priceUsd || alert.targetPrice;
    this.triggerAlert(alert, currentPrice);
  }

  private triggerAlert(alert: PriceAlert, currentPrice: number): void {
    // Play audio chime if enabled
    if (alert.soundEnabled && typeof window !== 'undefined') {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15); // E6
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch {
        /* audio blocked */
      }
    }

    // Update alert status
    this.alerts = this.alerts.map((a) =>
      a.id === alert.id
        ? { ...a, triggered: true, triggeredAt: new Date().toISOString(), active: false }
        : a
    );
    this.saveAlerts();

    // Notify trigger listeners
    this.triggerListeners.forEach((fn) => fn(alert, currentPrice));
  }

  public evaluateAlert(alert: PriceAlert, currentPrice: number): void {
    if (!alert.active || alert.triggered) return;

    let shouldTrigger = false;
    if (alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) {
      shouldTrigger = true;
    } else if (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice) {
      shouldTrigger = true;
    } else if (alert.condition === 'PCT_CHANGE_UP') {
      const pct = ((currentPrice - alert.currentPriceAtCreation) / alert.currentPriceAtCreation) * 100;
      if (pct >= alert.targetPrice) shouldTrigger = true;
    } else if (alert.condition === 'PCT_CHANGE_DOWN') {
      const pct = ((alert.currentPriceAtCreation - currentPrice) / alert.currentPriceAtCreation) * 100;
      if (pct >= alert.targetPrice) shouldTrigger = true;
    }

    if (shouldTrigger) {
      this.triggerAlert(alert, currentPrice);
    }
  }

  private startMonitoring(): void {
    if (this.checkInterval) return;
    this.checkInterval = setInterval(() => {
      // Small simulated live micro-fluctuations to test real-time monitoring
      SUPPORTED_TOKENS.forEach((token) => {
        const delta = (Math.random() - 0.49) * 0.002 * token.priceUsd;
        const livePrice = +(token.priceUsd + delta).toFixed(6);
        this.alerts
          .filter((a) => a.active && !a.triggered && a.tokenSymbol === token.symbol)
          .forEach((alert) => this.evaluateAlert(alert, livePrice));
      });
    }, 5000);
  }
}

export const priceAlertsService = new PriceAlertsService();
export { priceAlertsService as PriceAlertService };
