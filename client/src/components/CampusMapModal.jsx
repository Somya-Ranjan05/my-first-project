import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Building2,
  Eye,
  Tag,
  Sparkles,
  Filter,
  Search,
  Plus,
  PlusCircle,
  X,
  Compass,
  Layers
} from 'lucide-react';
import { api } from '../api';

export function CampusMapModal({
  campusLocations = [],
  reports = [],
  onSelectLocation,
  onSelectReport,
  onOpenReportModalWithLocation,
  onLocationAdded
}) {
  const [selectedBuilding, setSelectedBuilding] = useState(campusLocations[0] || null);
  const [zoneFilter, setZoneFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New location form
  const [newLocName, setNewLocName] = useState('');
  const [newLocShortName, setNewLocShortName] = useState('');
  const [newLocZone, setNewLocZone] = useState('North Academic');
  const [newLocDesc, setNewLocDesc] = useState('');
  const [newLocColor, setNewLocColor] = useState('#6366f1');
  const [newLocSpots, setNewLocSpots] = useState('');
  const [isSubmittingLoc, setIsSubmittingLoc] = useState(false);

  // Group reports by location name
  const reportsByLocation = {};
  campusLocations.forEach((loc) => {
    reportsByLocation[loc.name] = reports.filter(
      (r) =>
        r.location_name.toLowerCase().includes(loc.shortName.toLowerCase()) ||
        r.location_name === loc.name
    );
  });

  // Filter campus locations by zone and search query
  const filteredLocations = campusLocations.filter((loc) => {
    const matchesZone = zoneFilter === 'all' || loc.zone === zoneFilter;
    const matchesQuery =
      !searchQuery.trim() ||
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesQuery;
  });

  const activeBuildingReports = selectedBuilding
    ? reportsByLocation[selectedBuilding.name] || []
    : [];

  const zonesList = [
    'all',
    'North Academic',
    'Central Campus',
    'Central Quad',
    'East Recreation',
    'South Residential',
    'Northwest Medical',
    'East Academic',
    'East Perimeter',
    'North Arts'
  ];

  const handleAddLocationSubmit = async (e) => {
    e.preventDefault();
    if (!newLocName.trim()) return;

    setIsSubmittingLoc(true);
    try {
      const spotsArray = newLocSpots
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const locPayload = {
        name: newLocName.trim(),
        shortName: newLocShortName.trim() || newLocName.trim(),
        lat: 37.4280 + (Math.random() - 0.5) * 0.01,
        lng: -122.1680 + (Math.random() - 0.5) * 0.01,
        zone: newLocZone,
        color: newLocColor,
        description: newLocDesc || 'Campus academic & social facility',
        popular_spots: spotsArray.length > 0 ? spotsArray : ['Main Entrance', 'Lobby Lounge']
      };

      const res = await api.createCampusLocation(locPayload);
      if (onLocationAdded) onLocationAdded(res.location);
      setSelectedBuilding(res.location);
      setShowAddModal(false);
      setNewLocName('');
      setNewLocShortName('');
      setNewLocDesc('');
      setNewLocSpots('');
    } catch (err) {
      console.error('Error adding campus location:', err);
    } finally {
      setIsSubmittingLoc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Header & Controls */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Interactive Campus Geolocation Map
              </h2>
              <p className="text-xs text-slate-400">
                Explore {campusLocations.length} campus landmarks, pin lost/found spots & inspect item clusters
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Search, Zone, + Add Location */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campus buildings..."
              className="px-3 py-1.5 pl-8 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 w-44"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Zone Selector */}
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-slate-950/90 border border-slate-800 text-slate-200 text-xs font-medium rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {zonesList.map((zone) => (
              <option key={zone} value={zone}>
                {zone === 'all' ? 'All Zones' : zone}
              </option>
            ))}
          </select>

          {/* Add Campus Location CTA */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Location</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas & Building Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Campus Map Visual Grid */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-between">
          {/* Subtle Grid Lines and Campus Layout Background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, rgba(99,102,241,0.4) 1px, transparent 0)',
              backgroundSize: '28px 28px'
            }}
          />

          {/* Compass & Ambient Zones */}
          <div className="relative z-10 flex items-center justify-between text-[10px] font-bold text-indigo-400/70 uppercase tracking-widest pointer-events-none pb-2 border-b border-slate-900">
            <span>North Academic Quad & Medical</span>
            <div className="flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Campus Coordinates Grid</span>
            </div>
            <span>East Recreation & Transit</span>
          </div>

          {/* Interactive Campus Buildings Grid */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 my-4 max-h-[380px] overflow-y-auto pr-1">
            {filteredLocations.map((loc) => {
              const locReports = reportsByLocation[loc.name] || [];
              const isSelected = selectedBuilding?.id === loc.id;
              const lostCount = locReports.filter((r) => r.type === 'lost').length;
              const foundCount = locReports.filter((r) => r.type === 'found').length;

              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedBuilding(loc)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 group relative ${
                    isSelected
                      ? 'bg-indigo-950/80 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/30'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: `${loc.color || '#6366f1'}22`,
                        color: loc.color || '#6366f1'
                      }}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>

                    {/* Report Counts Badge */}
                    <div className="flex items-center space-x-1 text-[10px] font-bold">
                      {lostCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {lostCount}L
                        </span>
                      )}
                      {foundCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {foundCount}F
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-display font-bold text-xs text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {loc.shortName || loc.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{loc.zone}</p>
                </button>
              );
            })}
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-850">
            <span>Click any building to inspect logged lost & found reports</span>
            <span className="text-[11px] text-indigo-400 font-mono">
              GPS Haversine Engine Active
            </span>
          </div>
        </div>

        {/* Selected Building Sidebar Inspector */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          {selectedBuilding ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    Building Inspector
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                    {selectedBuilding.zone}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-white">
                  {selectedBuilding.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedBuilding.description}
                </p>

                {/* Popular spots */}
                {selectedBuilding.popular_spots?.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {selectedBuilding.popular_spots.map((spot, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800"
                      >
                        📍 {spot}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  Coordinates: {selectedBuilding.lat.toFixed(4)}, {selectedBuilding.lng.toFixed(4)}
                </div>
              </div>

              {/* Items at this location list */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Active Reports Here ({activeBuildingReports.length})
                </h4>

                {activeBuildingReports.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    No active reports logged at this location.
                  </p>
                ) : (
                  activeBuildingReports.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectReport(item)}
                      className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between space-x-2"
                    >
                      <div className="truncate">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.type === 'lost' ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                          />
                          <span className="text-xs font-bold text-white truncate">
                            {item.title}
                          </span>
                        </div>
                        {item.location_spot && (
                          <span className="text-[10px] text-indigo-400 block truncate">
                            📍 Spot: {item.location_spot}
                          </span>
                        )}
                      </div>
                      <Eye className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    </div>
                  ))
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => onSelectLocation(selectedBuilding.shortName || selectedBuilding.name)}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
                >
                  Filter Main Feed by this Building
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs my-auto">
              Select a campus building from the map to inspect
            </div>
          )}
        </div>
      </div>

      {/* Add New Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-display font-bold text-base text-white">
                  Add New Campus Location
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLocationSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Building / Landmark Name *
                </label>
                <input
                  type="text"
                  required
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  placeholder="e.g. Li Ka Shing Center for Learning"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Short Display Name
                  </label>
                  <input
                    type="text"
                    value={newLocShortName}
                    onChange={(e) => setNewLocShortName(e.target.value)}
                    placeholder="e.g. LKSC Learning Center"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Campus Zone *</label>
                  <select
                    value={newLocZone}
                    onChange={(e) => setNewLocZone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="North Academic">North Academic</option>
                    <option value="Central Campus">Central Campus</option>
                    <option value="Central Quad">Central Quad</option>
                    <option value="East Recreation">East Recreation</option>
                    <option value="South Residential">South Residential</option>
                    <option value="Northwest Medical">Northwest Medical</option>
                    <option value="East Academic">East Academic</option>
                    <option value="East Perimeter">East Perimeter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Description / Facility Type
                </label>
                <input
                  type="text"
                  value={newLocDesc}
                  onChange={(e) => setNewLocDesc(e.target.value)}
                  placeholder="e.g. Medical auditoriums, student lounge, cafe"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Popular Sub-Spots (Comma separated)
                </label>
                <input
                  type="text"
                  value={newLocSpots}
                  onChange={(e) => setNewLocSpots(e.target.value)}
                  placeholder="e.g. 2nd Floor Lounge, Cafe Patio, Main Entrance"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLoc || !newLocName.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  {isSubmittingLoc ? 'Saving...' : 'Add Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
