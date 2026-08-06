import React from 'react';

/**
 * Lightweight animated loading skeleton placeholder.
 * Used as Suspense fallback for React.lazy() code-split components.
 */
export const LoadingSkeleton: React.FC<{ lines?: number; className?: string }> = ({
  lines = 4,
  className = '',
}) => {
  return (
    <div className={`animate-pulse space-y-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/60 ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-800/80" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-800/80 rounded-full w-3/5" />
          <div className="h-3 bg-slate-800/60 rounded-full w-2/5" />
        </div>
      </div>

      {/* Content lines skeleton */}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-slate-800/60 rounded-full"
          style={{ width: `${70 + Math.random() * 25}%` }}
        />
      ))}

      {/* Action button skeleton */}
      <div className="h-12 bg-slate-800/50 rounded-2xl w-full mt-2" />
    </div>
  );
};

/**
 * Full-page loading state used during initial app hydration.
 */
export const PageLoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-mono">Loading StellarSwap+...</p>
      </div>
    </div>
  );
};
