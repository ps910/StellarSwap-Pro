/**
 * StellarSwap+ RPC Resilience Service
 *
 * Provides exponential backoff retry wrapper for Soroban RPC calls,
 * request timeout handling, and network health check utilities.
 */

import { analytics } from './analytics';

// ---------- Types ----------

interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in ms before first retry (default: 500) */
  initialDelayMs?: number;
  /** Maximum delay cap in ms (default: 8000) */
  maxDelayMs?: number;
  /** Request timeout in ms (default: 15000) */
  timeoutMs?: number;
  /** Operation label for analytics tracking */
  operationName?: string;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 500,
  maxDelayMs: 8000,
  timeoutMs: 15000,
  operationName: 'rpc_call',
};

// ---------- Core Retry Logic ----------

/**
 * Execute an async operation with exponential backoff retry.
 * Applies jitter to prevent thundering herd on retries.
 */
export async function withRetry<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), opts.timeoutMs);

    try {
      const result = await operation(controller.signal);
      clearTimeout(timeoutId);

      // Track successful retry recovery
      if (attempt > 0) {
        analytics.track('rpc_retry_success', {
          operation: opts.operationName,
          attempt,
          totalRetries: opts.maxRetries,
        });
      }

      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on user-cancelled or auth errors
      if (isNonRetryableError(lastError)) {
        throw lastError;
      }

      // Don't retry if we've exhausted attempts
      if (attempt >= opts.maxRetries) {
        analytics.track('rpc_retry_exhausted', {
          operation: opts.operationName,
          totalAttempts: attempt + 1,
          finalError: lastError.message,
        });
        break;
      }

      // Calculate delay with exponential backoff + jitter
      const baseDelay = opts.initialDelayMs * Math.pow(2, attempt);
      const jitter = Math.random() * opts.initialDelayMs;
      const delay = Math.min(baseDelay + jitter, opts.maxDelayMs);

      analytics.track('rpc_retry_attempt', {
        operation: opts.operationName,
        attempt: attempt + 1,
        delayMs: Math.round(delay),
        error: lastError.message,
      });

      await sleep(delay);
    }
  }

  throw lastError || new Error(`${opts.operationName} failed after ${opts.maxRetries} retries`);
}

// ---------- Network Health Check ----------

/**
 * Check if Soroban RPC endpoint is reachable and responsive.
 */
export async function checkRpcHealth(rpcUrl: string): Promise<{ healthy: boolean; latencyMs: number }> {
  const start = performance.now();

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getHealth',
      }),
      signal: AbortSignal.timeout(5000),
    });

    const latencyMs = Math.round(performance.now() - start);
    const data = await response.json();

    return {
      healthy: data?.result?.status === 'healthy',
      latencyMs,
    };
  } catch {
    return {
      healthy: false,
      latencyMs: Math.round(performance.now() - start),
    };
  }
}

// ---------- Helpers ----------

function isNonRetryableError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return (
    msg.includes('user_cancelled') ||
    msg.includes('user rejected') ||
    msg.includes('user denied') ||
    msg.includes('cancelled') ||
    msg.includes('not_installed') ||
    msg.includes('insufficient_balance')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
