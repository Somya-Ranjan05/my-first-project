import React from 'react';
import { Search, Sparkles, HelpCircle, CheckCircle2, TrendingUp, Cpu, ShieldCheck } from 'lucide-react';

export function HeroStats({
  reports = [],
  matches = [],
  activeTypeFilter,
  setActiveTypeFilter,
  onOpenSubmitModal
}) {
  const lostCount = reports.filter((r) => r.type === 'lost' && r.status === 'open').length;
  const foundCount = reports.filter((r) => r.type === 'found' && r.status === 'open').length;
  const matchedCount = reports.filter((r) => r.status === 'matched' || r.status === 'resolved').length;
  const highConfidenceMatches = matches.filter((m) => m.confidence_score >= 75).length;

  return (
    <div className="relative overflow-hidden pt-8 pb-6 border-b border-slate-850 bg-gradient-to-b from-indigo-950/20 via-slate-950/40 to-transparent">
      {/* Background ambient decorative glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Main Title & Subhead */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Multi-Signal Multimodal AI Matching</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Reconnecting lost items with their owners in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">minutes</span>.
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Upload photos, let Vision AI extract distinguishing attributes, and our vector-similarity engine pairs lost and found reports automatically with human-readable rationale.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Open Lost */}
            <div
              onClick={() => setActiveTypeFilter(activeTypeFilter === 'lost' ? 'all' : 'lost')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                activeTypeFilter === 'lost'
                  ? 'bg-rose-500/15 border-rose-500/40 shadow-md shadow-rose-500/10 ring-1 ring-rose-500/30'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-400">Open Lost</span>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              </div>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-2xl font-bold font-display text-white">{lostCount}</span>
                <span className="text-[11px] text-slate-400">reports</span>
              </div>
            </div>

            {/* Open Found */}
            <div
              onClick={() => setActiveTypeFilter(activeTypeFilter === 'found' ? 'all' : 'found')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                activeTypeFilter === 'found'
                  ? 'bg-emerald-500/15 border-emerald-500/40 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400">Open Found</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-2xl font-bold font-display text-white">{foundCount}</span>
                <span className="text-[11px] text-slate-400">items</span>
              </div>
            </div>

            {/* High AI Matches */}
            <div className="p-3.5 rounded-xl border bg-slate-900/60 border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-400">AI Matches</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-2xl font-bold font-display text-white">{matches.length}</span>
                <span className="text-[10px] text-purple-300 font-medium">({highConfidenceMatches} top)</span>
              </div>
            </div>

            {/* Resolved */}
            <div className="p-3.5 rounded-xl border bg-slate-900/60 border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-400">Matched</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-2xl font-bold font-display text-white">{matchedCount}</span>
                <span className="text-[11px] text-slate-400">resolved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
