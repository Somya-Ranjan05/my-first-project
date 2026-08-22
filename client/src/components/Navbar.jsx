import React from 'react';
import {
  Compass,
  Sparkles,
  Bell,
  PlusCircle,
  MapPin,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Database,
  Home,
  Mail
} from 'lucide-react';

export function Navbar({
  activeTab,
  setActiveTab,
  onOpenSubmitModal,
  unreadCount,
  onToggleNotifications,
  onResetSeed,
  isSeeding,
  onOpenEmailModal
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name (Clicks to Home Cover Page) */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-lg text-white tracking-tight">
                  Apex<span className="text-indigo-400">Match</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI Campus v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Smart Lost & Found Intelligence System
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/70 p-1.5 rounded-2xl border border-slate-800/70">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'home'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'explore'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore Items</span>
            </button>

            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'matches'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>AI Match Review</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Campus Map</span>
            </button>
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center space-x-2.5">
            {/* Quick Demo Seed */}
            <button
              onClick={onResetSeed}
              disabled={isSeeding}
              title="Reset sample data and re-run matching engine"
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-indigo-300 border border-slate-800 transition-colors"
            >
              <Database className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isSeeding ? 'Seeding...' : 'Reload Demo'}</span>
            </button>

            {/* Email Notification & Gmail Dispatcher Settings */}
            <button
              onClick={onOpenEmailModal}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-indigo-300 border border-slate-800 transition-colors flex items-center space-x-1"
              title="Gmail Notification Settings & Dispatch Log"
            >
              <Mail className="w-4 h-4 text-indigo-400" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={onToggleNotifications}
              className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              title="Match Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-rose-500 text-white font-bold text-[10px] rounded-full ring-2 ring-slate-950 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Report Item Primary CTA */}
            <button
              onClick={onOpenSubmitModal}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Report Item</span>
              <span className="sm:hidden">Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Subnavigation */}
      <div className="flex md:hidden border-t border-slate-800/60 bg-slate-950/95 px-3 py-2 justify-around">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center space-x-1 py-1 px-2.5 rounded-lg text-xs font-medium ${
            activeTab === 'home' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex items-center space-x-1 py-1 px-2.5 rounded-lg text-xs font-medium ${
            activeTab === 'explore' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Explore</span>
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex items-center space-x-1 py-1 px-2.5 rounded-lg text-xs font-medium ${
            activeTab === 'matches' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>Matches</span>
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center space-x-1 py-1 px-2.5 rounded-lg text-xs font-medium ${
            activeTab === 'map' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Map</span>
        </button>
      </div>
    </header>
  );
}
