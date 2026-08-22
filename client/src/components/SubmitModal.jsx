import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Sparkles,
  MapPin,
  Tag,
  Calendar,
  User,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileText,
  Scan,
  RefreshCw,
  Plus,
  Compass,
  Building2,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../api';
import { CATEGORY_OPTIONS } from './SemanticSearch';
import confetti from 'canvas-confetti';

export function SubmitModal({ isOpen, onClose, onSuccess, campusLocations = [], onLocationAdded }) {
  if (!isOpen) return null;

  const [type, setType] = useState('lost'); // 'lost' | 'found'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('electronics');
  const [locationName, setLocationName] = useState(campusLocations[0]?.name || 'Central Library (Main Commons & 2nd Floor)');
  const [locationSpot, setLocationSpot] = useState('');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Location Selector View Mode: 'dropdown' | 'map'
  const [locationViewMode, setLocationViewMode] = useState('map');
  const [showAddCustomLocation, setShowAddCustomLocation] = useState(false);
  const [customLocName, setCustomLocName] = useState('');
  const [customLocZone, setCustomLocZone] = useState('Central Campus');
  const [customLocDescription, setCustomLocDescription] = useState('');
  const [isAddingLocation, setIsAddingLocation] = useState(false);

  // Photo & Vision State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [extractedAttributes, setExtractedAttributes] = useState({
    color: '',
    brand: '',
    material: '',
    unique_marks: '',
    item_type: ''
  });
  const [isVisionExtracted, setIsVisionExtracted] = useState(false);

  // Form Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Current selected location object
  const selectedLocationObj =
    campusLocations.find((l) => l.name === locationName || l.shortName === locationName) ||
    campusLocations[0];

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Run Instant AI Vision Analysis
    setIsAnalyzingPhoto(true);
    setError(null);

    try {
      const res = await api.analyzePhoto(file, description || title);
      if (res.attributes) {
        setExtractedAttributes(res.attributes);
        setIsVisionExtracted(true);

        // Pre-fill category & title if empty
        if (res.attributes.category && res.attributes.category !== 'other') {
          setCategory(res.attributes.category);
        }
        if (!title && res.attributes.item_type) {
          const prefix = type === 'lost' ? 'Lost' : 'Found';
          const brand = res.attributes.brand ? `${res.attributes.brand} ` : '';
          const color = res.attributes.color ? `${res.attributes.color} ` : '';
          setTitle(`${prefix} ${color}${brand}${res.attributes.item_type}`.trim());
        }
      }
    } catch (err) {
      console.warn('Vision analysis error:', err);
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const handleAttributeChange = (field, val) => {
    setExtractedAttributes((prev) => ({
      ...prev,
      [field]: val
    }));
  };

  // Add Custom Location
  const handleSaveCustomLocation = async (e) => {
    e.preventDefault();
    if (!customLocName.trim()) return;

    setIsAddingLocation(true);
    try {
      const newLoc = {
        name: customLocName.trim(),
        shortName: customLocName.trim(),
        lat: 37.4280 + (Math.random() - 0.5) * 0.008,
        lng: -122.1680 + (Math.random() - 0.5) * 0.008,
        zone: customLocZone,
        color: '#8b5cf6',
        description: customLocDescription || 'Custom campus location',
        popular_spots: ['Main Entrance', 'Front Lounge']
      };

      const res = await api.createCampusLocation(newLoc);
      if (onLocationAdded) onLocationAdded(res.location);
      setLocationName(res.location.name);
      setShowAddCustomLocation(false);
      setCustomLocName('');
      setCustomLocDescription('');
    } catch (err) {
      console.error('Error creating custom location:', err);
      setError('Could not add custom location');
    } finally {
      setIsAddingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and detailed description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedLoc = selectedLocationObj || campusLocations[0];

      const formData = new FormData();
      formData.append('type', type);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('location_name', locationName);
      formData.append('location_spot', locationSpot);
      formData.append('location_lat', selectedLoc?.lat || 37.4275);
      formData.append('location_lng', selectedLoc?.lng || -122.1697);
      formData.append('location_zone', selectedLoc?.zone || 'North Academic');
      formData.append('date_time', new Date(dateTime).toISOString());
      formData.append('contact_name', contactName || 'Campus Member');
      formData.append('contact_email', contactEmail || 'student@campus.edu');
      formData.append('contact_phone', contactPhone || '');
      formData.append('extracted_attributes', JSON.stringify(extractedAttributes));

      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      const res = await api.createReport(formData);

      // Trigger Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onSuccess(res.report, res.top_matches);
      onClose();
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Submit Campus Item Report
              </h2>
              <p className="text-xs text-slate-400">
                AI will extract attributes and automatically search for potential matches
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Report Type Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Report Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('lost')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center space-x-2 font-semibold text-sm transition-all ${
                  type === 'lost'
                    ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/25 ring-2 ring-rose-500/20'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-200"></span>
                <span>I Lost Something</span>
              </button>

              <button
                type="button"
                onClick={() => setType('found')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center space-x-2 font-semibold text-sm transition-all ${
                  type === 'found'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/20'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-200"></span>
                <span>I Found Something</span>
              </button>
            </div>
          </div>

          {/* 2. Photo Upload & Real-Time AI Vision Scanner */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Photo & AI Vision Scanner
              </label>
              <span className="text-[11px] text-indigo-400 font-medium flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Auto-detects color, brand & unique marks</span>
              </span>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer text-center overflow-hidden ${
                previewUrl
                  ? 'border-indigo-500/50 bg-slate-950/90'
                  : 'border-slate-750 hover:border-indigo-500/50 bg-slate-950/40 hover:bg-slate-950/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="relative flex flex-col items-center">
                  <div className="relative max-h-48 rounded-xl overflow-hidden shadow-lg border border-slate-800">
                    <img src={previewUrl} alt="Uploaded item" className="max-h-48 object-contain" />
                    {isAnalyzingPhoto && (
                      <div className="absolute inset-0 bg-indigo-950/75 backdrop-blur-xs flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-2" />
                        <div className="scanner-line absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                        <span className="text-xs font-bold text-white tracking-wide">
                          AI Vision Analyzing...
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-indigo-300 hover:underline">
                    Click to replace photo
                  </p>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-white">
                    Drop item photo or click to upload
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports JPEG, PNG, WebP (Max 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Extracted Attributes Suggestion Confirmation Box */}
            {(isVisionExtracted || extractedAttributes.color || extractedAttributes.brand) && (
              <div className="mt-3 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI-Extracted Attributes (Editable)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Review & confirm</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Color</label>
                    <input
                      type="text"
                      value={extractedAttributes.color || ''}
                      onChange={(e) => handleAttributeChange('color', e.target.value)}
                      placeholder="e.g. Navy Blue"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Brand</label>
                    <input
                      type="text"
                      value={extractedAttributes.brand || ''}
                      onChange={(e) => handleAttributeChange('brand', e.target.value)}
                      placeholder="e.g. Apple / Nike"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Material</label>
                    <input
                      type="text"
                      value={extractedAttributes.material || ''}
                      onChange={(e) => handleAttributeChange('material', e.target.value)}
                      placeholder="e.g. Aluminum / Canvas"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-3">
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Distinguishing / Unique Marks
                    </label>
                    <input
                      type="text"
                      value={extractedAttributes.unique_marks || ''}
                      onChange={(e) => handleAttributeChange('unique_marks', e.target.value)}
                      placeholder="e.g. Broken zipper pull, GitHub sticker on top-right, scratched corner"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-750 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Item Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midnight Blue AirPods Pro in Navy Case"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {CATEGORY_OPTIONS.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Detailed Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe where it was lost/found, specific marks, stickers, color nuances, serial numbers or tags..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 5. Campus Location & Interactive Map Pinpoint */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>Campus Location & Specific Spot *</span>
              </label>

              {/* View Switcher: Interactive Map vs Dropdown */}
              <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setLocationViewMode('map')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    locationViewMode === 'map'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Interactive Map
                </button>
                <button
                  type="button"
                  onClick={() => setLocationViewMode('dropdown')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    locationViewMode === 'dropdown'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dropdown
                </button>
              </div>
            </div>

            {/* Interactive Campus Mini-Map Selector Grid */}
            {locationViewMode === 'map' ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 p-1 bg-slate-950 rounded-xl border border-slate-850">
                  {campusLocations.map((loc) => {
                    const isSelected =
                      locationName === loc.name || locationName === loc.shortName;

                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setLocationName(loc.name);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-950/80 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Building2
                            className="w-3.5 h-3.5"
                            style={{ color: loc.color || '#6366f1' }}
                          />
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            {loc.zone}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-white line-clamp-1 block">
                          {loc.shortName || loc.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Popular spots suggestions for selected location */}
                {selectedLocationObj?.popular_spots?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">
                      Quick Spot Tags:
                    </span>
                    {selectedLocationObj.popular_spots.map((spot, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLocationSpot(spot)}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 hover:bg-indigo-950/80 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/40 transition-colors"
                      >
                        📍 {spot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Dropdown Mode */
              <div className="relative">
                <select
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none truncate"
                >
                  {campusLocations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name} ({loc.zone})
                    </option>
                  ))}
                </select>
                <MapPin className="w-4 h-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Specific Spot / Room / Floor Detail Input */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
              <div className="sm:col-span-8">
                <input
                  type="text"
                  value={locationSpot}
                  onChange={(e) => setLocationSpot(e.target.value)}
                  placeholder="Specific room / floor / spot (e.g. 'Room 104', '2nd Floor Table 14', 'Bench outside')"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
                />
              </div>

              {/* Add Custom Campus Location Button */}
              <div className="sm:col-span-4">
                <button
                  type="button"
                  onClick={() => setShowAddCustomLocation(!showAddCustomLocation)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-indigo-400 hover:text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Location</span>
                </button>
              </div>
            </div>

            {/* Expandable Add Custom Location Form */}
            {showAddCustomLocation && (
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2.5 mt-2">
                <span className="text-xs font-bold text-indigo-300 block">
                  Add Custom Campus Facility / Location
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    required
                    value={customLocName}
                    onChange={(e) => setCustomLocName(e.target.value)}
                    placeholder="Location / Building Name (e.g. Student Health Center)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                  <select
                    value={customLocZone}
                    onChange={(e) => setCustomLocZone(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  >
                    <option value="North Academic">North Academic</option>
                    <option value="Central Campus">Central Campus</option>
                    <option value="Central Quad">Central Quad</option>
                    <option value="East Recreation">East Recreation</option>
                    <option value="South Residential">South Residential</option>
                    <option value="Northwest Medical">Northwest Medical</option>
                    <option value="East Perimeter">East Perimeter</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomLocation(false)}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCustomLocation}
                    disabled={isAddingLocation || !customLocName.trim()}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    {isAddingLocation ? 'Adding...' : 'Save Location'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 6. Date & Time */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Date & Approximate Time *
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                required
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Calendar className="w-4 h-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 7. Contact Information */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Contact Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your Name (e.g. Alex R.)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Email (e.g. alex@campus.edu)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Phone (optional)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit & Run AI Match</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
