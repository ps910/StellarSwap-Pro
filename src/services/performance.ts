/**
 * StellarSwap+ Web Vitals & Performance Monitoring Service
 *
 * Tracks Core Web Vitals (LCP, FID, CLS, TTFB, INP) via PerformanceObserver,
 * monitors network online/offline status, and records page load timing.
 * All metrics are forwarded to the analytics service for telemetry aggregation.
 */

import { analytics } from './analytics';

// ---------- Types ----------

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: string;
}

interface PageLoadTiming {
  domContentLoaded: number;
  fullLoad: number;
  ttfb: number;
  domInteractive: number;
}

// ---------- Thresholds (Google-recommended) ----------

const THRESHOLDS: Record<string, [number, number]> = {
  LCP:  [2500, 4000],
  FID:  [100,  300],
  CLS:  [0.1,  0.25],
  TTFB: [800,  1800],
  INP:  [200,  500],
};

function rateMetric(name: string, value: number): WebVitalMetric['rating'] {
  const [good, poor] = THRESHOLDS[name] || [Infinity, Infinity];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

// ---------- Core Web Vitals Observers ----------

function observeLCP(): void {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as any;
      if (last) {
        const metric: WebVitalMetric = {
          name: 'LCP',
          value: Math.round(last.startTime),
          rating: rateMetric('LCP', last.startTime),
          timestamp: new Date().toISOString(),
        };
        analytics.track('web_vital', metric);
      }
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch { /* PerformanceObserver not supported */ }
}

function observeFID(): void {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as any;
        const delay = fidEntry.processingStart - fidEntry.startTime;
        const metric: WebVitalMetric = {
          name: 'FID',
          value: Math.round(delay),
          rating: rateMetric('FID', delay),
          timestamp: new Date().toISOString(),
        };
        analytics.track('web_vital', metric);
      }
    });
    observer.observe({ type: 'first-input', buffered: true });
  } catch { /* PerformanceObserver not supported */ }
}

function observeCLS(): void {
  try {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as any;
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
        }
      }
    });
    observer.observe({ type: 'layout-shift', buffered: true });

    // Report CLS when user leaves the page
    addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        const metric: WebVitalMetric = {
          name: 'CLS',
          value: parseFloat(clsValue.toFixed(4)),
          rating: rateMetric('CLS', clsValue),
          timestamp: new Date().toISOString(),
        };
        analytics.track('web_vital', metric);
      }
    }, { once: true });
  } catch { /* PerformanceObserver not supported */ }
}

// ---------- Page Load Timing ----------

function capturePageLoadTiming(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    // Delay to ensure all timing entries are populated
    setTimeout(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (!nav) return;

      const timing: PageLoadTiming = {
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
        fullLoad: Math.round(nav.loadEventEnd - nav.startTime),
        ttfb: Math.round(nav.responseStart - nav.requestStart),
        domInteractive: Math.round(nav.domInteractive - nav.startTime),
      };

      analytics.track('page_load_timing', timing);

      // Also report TTFB as a Web Vital
      const ttfbMetric: WebVitalMetric = {
        name: 'TTFB',
        value: timing.ttfb,
        rating: rateMetric('TTFB', timing.ttfb),
        timestamp: new Date().toISOString(),
      };
      analytics.track('web_vital', ttfbMetric);
    }, 100);
  });
}

// ---------- Network Status Monitor ----------

export class NetworkStatusMonitor {
  private _isOnline: boolean = navigator.onLine;
  private listeners: ((online: boolean) => void)[] = [];

  constructor() {
    window.addEventListener('online', () => this.setStatus(true));
    window.addEventListener('offline', () => this.setStatus(false));
  }

  private setStatus(online: boolean) {
    const wasOffline = !this._isOnline;
    this._isOnline = online;

    analytics.track('network_status_change', { online, wasOffline });

    this.listeners.forEach((cb) => cb(online));
  }

  get isOnline(): boolean {
    return this._isOnline;
  }

  public onStatusChange(callback: (online: boolean) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }
}

// ---------- Singleton ----------

export const networkMonitor = new NetworkStatusMonitor();

// ---------- Initialization ----------

export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  observeLCP();
  observeFID();
  observeCLS();
  capturePageLoadTiming();

  analytics.track('performance_monitoring_initialized', {
    userAgent: navigator.userAgent,
    connectionType: (navigator as any).connection?.effectiveType || 'unknown',
    deviceMemory: (navigator as any).deviceMemory || 'unknown',
  });
}
