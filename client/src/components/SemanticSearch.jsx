import React from 'react';
import { Search, Sparkles, Filter, X, MapPin, Tag, SlidersHorizontal, Check } from 'lucide-react';

export const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All Categories', icon: '🌟' },
  { id: 'electronics', label: 'Electronics', icon: '💻' },
  { id: 'bag', label: 'Bags & Backpacks', icon: '🎒' },
  { id: 'water_bottle', label: 'Water Bottles', icon: '🚰' },
  { id: 'keys', label: 'Keys & Fobs', icon: '🔑' },
  { id: 'id_card', label: 'ID Cards & Badges', icon: '🪪' },
  { id: 'accessories', label: 'Glasses & Accessories', icon: '👓' },
  { id: 'clothing', label: 'Clothing & Jackets', icon: '🧥' },
  { id: 'books', label: 'Books & Notes', icon: '📚' },
  { id: 'sports', label: 'Sports & Gym Gear', icon: '⚽' },
  { id: 'other', label: 'Other Items', icon: '📦' }
];

export function SemanticSearch({
  searchQuery,
  setSearchQuery,
  onSearch,
  isSearching,
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
  locationFilter,
  setLocationFilter,
  statusFilter,
  setStatusFilter,
  campusLocations = [],
  onResetFilters
}) {
  const hasActiveFilters =
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    locationFilter !== 'all' ||
    statusFilter !== 'all' ||
    Boolean(searchQuery.trim());

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-950/40 backdrop-blur-xl">
      {/* Search Input Bar */}
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Natural AI search: e.g. 'blue water bottle with stickers near the gym' or 'silver laptop'..."
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-950/90 border border-slate-750 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTimeout(() => onSearch(''), 0);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Action Button */}
        <button
          onClick={() => onSearch()}
          disabled={isSearching}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all whitespace-nowrap"
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span>{isSearching ? 'Embedding...' : 'AI Semantic Search'}</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Type Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/60">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setTypeFilter('lost')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'lost'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                : 'text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
            <span>Lost Only</span>
          </button>
          <button
            onClick={() => setTypeFilter('found')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'found'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                : 'text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
            <span>Found Only</span>
          </button>
        </div>

        {/* Right Side: Category, Location, Status Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950/90 border border-slate-800 text-slate-200 text-xs font-medium rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
            <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Location Dropdown */}
          <div className="relative">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-slate-950/90 border border-slate-800 text-slate-200 text-xs font-medium rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none max-w-[170px] truncate"
            >
              <option value="all">📍 All Campus Locations</option>
              {campusLocations.map((loc) => (
                <option key={loc.id} value={loc.shortName || loc.name}>
                  {loc.shortName || loc.name}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950/90 border border-slate-800 text-slate-200 text-xs font-medium rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none"
            >
              <option value="all">Status: All</option>
              <option value="open">Open</option>
              <option value="matched">Matched</option>
              <option value="resolved">Resolved</option>
            </select>
            <SlidersHorizontal className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
