import { ContractEvent } from '../types';

export const INITIAL_EVENTS: ContractEvent[] = [
  {
    id: 'evt-101',
    type: 'swap',
    user: 'GBJ4CD...W4UWO',
    tokenIn: 'XLM',
    tokenOut: 'USDC',
    amountIn: '500.00',
    amountOut: '49.85',
    timestamp: '2 mins ago',
    txHash: 'a7b3c9d1e2f4a5b6c7d8e9f0123456789abcdef0123456789abcdef0123456789',
  },
  {
    id: 'evt-100',
    type: 'deposit',
    user: 'GAAZI4...JGG4A',
    token: 'XLM',
    amount: '10,000.00',
    timestamp: '14 mins ago',
    txHash: '9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
  },
  {
    id: 'evt-99',
    type: 'swap',
    user: 'GC3K8V...9PL2M',
    tokenIn: 'USDC',
    tokenOut: 'XLM',
    amountIn: '100.00',
    amountOut: '1,003.20',
    timestamp: '28 mins ago',
    txHash: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
  },
];

/**
 * Event Synchronization Service for Soroban Contract Events
 */
export class SorobanEventSubscriber {
  private listeners: ((event: ContractEvent) => void)[] = [];
  private timer: any = null;

  public subscribe(callback: (event: ContractEvent) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public emitNewEvent(event: ContractEvent) {
    this.listeners.forEach((listener) => listener(event));
  }

  public startMockEventStream() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      const isSwap = Math.random() > 0.3;
      const id = `evt-${Date.now()}`;
      const hashBytes = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join('');

      let newEvt: ContractEvent;
      if (isSwap) {
        const amountIn = (Math.random() * 200 + 10).toFixed(2);
        const amountOut = (parseFloat(amountIn) * 0.0995).toFixed(2);
        newEvt = {
          id,
          type: 'swap',
          user: `G${Math.random().toString(36).substring(2, 7).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          tokenIn: 'XLM',
          tokenOut: 'USDC',
          amountIn,
          amountOut,
          timestamp: 'Just now',
          txHash: hashBytes + hashBytes,
        };
      } else {
        const amount = (Math.random() * 1000 + 100).toFixed(2);
        newEvt = {
          id,
          type: 'deposit',
          user: `G${Math.random().toString(36).substring(2, 7).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          token: 'XLM',
          amount,
          timestamp: 'Just now',
          txHash: hashBytes + hashBytes,
        };
      }

      this.emitNewEvent(newEvt);
    }, 15000); // New event every 15s
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const eventStreamService = new SorobanEventSubscriber();
