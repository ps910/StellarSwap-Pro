import React, { useState, useEffect } from 'react';
import { BarChart3, Users, ArrowUpRight, TrendingUp, Activity, Star, Clock, Download, Shield } from 'lucide-react';
import { analytics } from '../services/analytics';
import { PlatformStats } from '../types';

export const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [animatedValues, setAnimatedValues] = useState({
    swaps: 0,
    escrows: 0,
    users: 0,
    feedback: 0,
  });

  useEffect(() => {
    const platformStats = analytics.getPlatformStats();
    setStats(platformStats);

    // Animate counters on mount
    const duration = 1200;
    const steps = 40;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setAnimatedValues({
        swaps: Math.round(platformStats.totalSwaps * eased),
        escrows: Math.round(platformStats.totalEscrows * eased),
        users: Math.round(platformStats.uniqueUsers * eased),
        feedback: Math.round(platformStats.totalFeedback * eased),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handleExportProof = () => {
    const proof = analytics.exportAnalyticsProof();
    const blob = new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stellarswap-analytics-proof-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    analytics.track('analytics_proof_exported');
  };

  if (!stats) return null;

  const statCards = [
    {
      label: 'TOTAL SWAPS',
      value: animatedValues.swaps.toLocaleString(),
      icon: <Activity className="w-5 h-5" />,
      color: 'lime',
      change: '+18%',
    },
    {
      label: 'TOTAL ESCROWS',
      value: animatedValues.escrows.toLocaleString(),
      icon: <Shield className="w-5 h-5" />,
      color: 'cyan',
      change: '+12%',
    },
    {
      label: 'UNIQUE USERS',
      value: animatedValues.users.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      color: 'blue',
      change: '+24%',
    },
    {
      label: 'FEEDBACK RESPONSES',
      value: animatedValues.feedback.toLocaleString(),
      icon: <Star className="w-5 h-5" />,
      color: 'amber',
      change: '+31%',
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    lime: { bg: 'bg-lime-400/10', border: 'border-lime-400/30', text: 'text-lime-400', glow: 'shadow-lime-400/10' },
    cyan: { bg: 'bg-cyan-400/10', border: 'border-cyan-400/30', text: 'text-cyan-400', glow: 'shadow-cyan-400/10' },
    blue: { bg: 'bg-blue-400/10', border: 'border-blue-400/30', text: 'text-blue-400', glow: 'shadow-blue-400/10' },
    amber: { bg: 'bg-amber-400/10', border: 'border-amber-400/30', text: 'text-amber-400', glow: 'shadow-amber-400/10' },
  };

  // Calculate bar heights for chart
  const maxSwaps = Math.max(...stats.dailyActivity.map(d => d.swaps));
  const maxEscrows = Math.max(...stats.dailyActivity.map(d => d.escrows));
  const maxVal = Math.max(maxSwaps, maxEscrows);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-sans">Platform Analytics</h2>
            <p className="text-[11px] text-slate-400 font-mono">Real-time metrics & growth data for Level 5 submission</p>
          </div>
        </div>
        <button
          onClick={handleExportProof}
          className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-slate-300 hover:text-lime-400 hover:border-lime-400/40 font-bold text-xs flex items-center gap-2 transition-all font-mono"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">EXPORT PROOF</span>
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const c = colorMap[card.color];
          return (
            <div key={card.label} className={`p-5 rounded-2xl bg-[#09090b] border border-neutral-800 space-y-3 hover:shadow-lg ${c.glow} transition-all group`}>
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.text} border ${c.border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <span className="text-lime-400 text-[10px] font-bold font-mono flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {card.change}
                </span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white font-mono">{card.value}</div>
                <span className="text-[10px] text-slate-400 font-mono">{card.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Chart + Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#09090b] border border-neutral-800 font-mono text-xs">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lime-400 font-bold">7-DAY TRANSACTION ACTIVITY</span>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-lime-400"></span> Swaps</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Escrows</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {stats.dailyActivity.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-1" style={{ height: '120px' }}>
                  <div
                    className="w-3 bg-lime-400/80 rounded-t-sm transition-all hover:bg-lime-400"
                    style={{ height: `${(day.swaps / maxVal) * 100}%`, minHeight: '4px' }}
                    title={`${day.swaps} swaps`}
                  />
                  <div
                    className="w-3 bg-cyan-400/80 rounded-t-sm transition-all hover:bg-cyan-400"
                    style={{ height: `${(day.escrows / maxVal) * 100}%`, minHeight: '4px' }}
                    title={`${day.escrows} escrows`}
                  />
                </div>
                <span className="text-[9px] text-slate-500">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Rating Card */}
          <div className="p-5 rounded-2xl bg-[#09090b] border border-neutral-800 font-mono text-xs">
            <span className="text-slate-400 text-[10px] block mb-2">AVG USER SATISFACTION</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-amber-400">{stats.avgRating}</span>
              <span className="text-slate-400">/ 5.0</span>
            </div>
            <div className="flex items-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(stats.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
              ))}
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">{stats.totalFeedback} total reviews</span>
          </div>

          {/* Volume Card */}
          <div className="p-5 rounded-2xl bg-[#09090b] border border-neutral-800 font-mono text-xs">
            <span className="text-slate-400 text-[10px] block mb-2">TOTAL VOLUME PROCESSED</span>
            <div className="text-2xl font-extrabold text-white">${stats.totalVolume}</div>
            <span className="text-lime-400 text-[10px] flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Stellar Testnet
            </span>
          </div>

          {/* Uptime Card */}
          <div className="p-5 rounded-2xl bg-[#09090b] border border-neutral-800 font-mono text-xs">
            <span className="text-slate-400 text-[10px] block mb-2">PLATFORM UPTIME</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-lime-400">{stats.uptimePercent}%</span>
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-neutral-800 mt-3 overflow-hidden">
              <div className="h-full bg-lime-400 rounded-full" style={{ width: `${stats.uptimePercent}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
