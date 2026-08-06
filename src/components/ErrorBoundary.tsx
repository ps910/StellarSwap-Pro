import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { analytics } from '../services/analytics';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    analytics.captureError(error, { componentStack: errorInfo.componentStack });

    // Auto-reload on dynamic import failure (stale build asset after new deployment)
    const isChunkError =
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Importing a module script failed') ||
      error.message?.includes('Loading chunk');

    if (isChunkError) {
      const hasAutoReloaded = sessionStorage.getItem('auto_reload_chunk_error');
      if (!hasAutoReloaded) {
        sessionStorage.setItem('auto_reload_chunk_error', 'true');
        console.warn('[ErrorBoundary] Chunk load failure detected due to new deployment. Auto-reloading page...');
        window.location.reload();
      }
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-red-500/40 shadow-2xl backdrop-blur-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-5">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
              this.state.error?.message?.includes('Loading chunk')
                ? 'App Update Detected'
                : 'Something went wrong'}
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              {this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
              this.state.error?.message?.includes('Loading chunk')
                ? 'A new version of StellarSwap+ was recently deployed. Reload the page to fetch the latest application updates.'
                : 'StellarSwap+ encountered an unexpected UI exception. Our automated monitoring (Sentry) has captured the stack trace.'}
            </p>

            {this.state.error && (
              <div className="p-3 mb-6 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-red-300 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
