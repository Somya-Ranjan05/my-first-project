import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  Camera,
  Search,
  CheckCircle2,
  Bell,
  Cpu,
  Layers,
  Compass,
  Play,
  RotateCcw,
  Sliders,
  TrendingUp,
  Activity,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ROTATING_ITEMS = [
  { name: 'AirPods Pro 2', color: 'from-blue-400 to-indigo-400', icon: '🎧', location: 'Central Library' },
  { name: 'MacBook Air M2', color: 'from-purple-400 to-pink-400', icon: '💻', location: 'Engineering Hall' },
  { name: 'Hydro Flask 32oz', color: 'from-cyan-400 to-teal-400', icon: '🚰', location: 'Athletic Gym' },
  { name: 'Toyota Smart Key', color: 'from-amber-400 to-orange-400', icon: '🔑', location: 'The Memorial Oval' },
  { name: 'Ray-Ban Sunglasses', color: 'from-rose-400 to-red-400', icon: '👓', location: 'Science Complex' }
];

const LIVE_PULSE_EVENTS = [
  { text: '🎯 AI Paired: Silver MacBook Air in Engineering Hall (96% Match)', time: '2m ago', color: 'text-purple-400' },
  { text: '📍 New Found Item: Pacific Blue Hydro Flask with Stickers at Gym', time: '5m ago', color: 'text-cyan-400' },
  { text: '🔔 Owner Notified: Apple AirPods Pro in Navy Case at Library', time: '11m ago', color: 'text-emerald-400' },
  { text: '✨ Auto-Extracted Attributes: Toyota Key Fob on Blue Stanford Lanyard', time: '18m ago', color: 'text-amber-400' },
  { text: '🎉 Match Resolved: Ray-Ban Tortoise Eyeglasses in Chem 101', time: '24m ago', color: 'text-indigo-400' }
];

const SHOWCASE_GALLERY = [
  {
    id: 'rep_lost_airpods_01',
    title: 'Apple AirPods Pro 2 in Navy Case',
    category: 'Electronics',
    location: 'Central Library (2nd Floor)',
    image: 'http://localhost:5000/uploads/lost_airpods.jpg',
    matchScore: 97,
    status: 'High Match',
    statusColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
  },
  {
    id: 'rep_lost_bottle_02',
    title: 'Pacific Blue 32oz Hydro Flask with Stickers',
    category: 'Water Bottle',
    location: 'Athletic Center & Gym',
    image: 'http://localhost:5000/uploads/lost_hydroflask.jpg',
    matchScore: 94,
    status: 'High Match',
    statusColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  },
  {
    id: 'rep_lost_macbook_04',
    title: 'Silver Apple M2 MacBook Air',
    category: 'Electronics',
    location: 'Packard Engineering Hall',
    image: 'http://localhost:5000/uploads/lost_macbook.jpg',
    matchScore: 96,
    status: 'Ultra Match',
    statusColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  {
    id: 'rep_lost_bag_03',
    title: 'Black Nike Brasilia Backpack',
    category: 'Bags & Backpacks',
    location: 'Student Union Dining Area',
    image: 'http://localhost:5000/uploads/lost_nike_bag.jpg',
    matchScore: 91,
    status: 'High Match',
    statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  {
    id: 'rep_lost_keys_05',
    title: 'Toyota Remote Key on Blue Lanyard',
    category: 'Keys & Fobs',
    location: 'Memorial Oval Lawn',
    image: 'http://localhost:5000/uploads/lost_keys.jpg',
    matchScore: 89,
    status: 'High Match',
    statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  {
    id: 'rep_lost_glasses_06',
    title: 'Ray-Ban Clubmaster Tortoise Glasses',
    category: 'Accessories',
    location: 'Science Complex Chem 101',
    image: 'http://localhost:5000/uploads/lost_glasses.jpg',
    matchScore: 88,
    status: 'High Match',
    statusColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  }
];

export function CoverLandingPage({
  onEnterPortal,
  onOpenSubmitModal,
  onOpenMatches,
  onOpenMap,
  reportsCount = 14,
  matchesCount = 10
}) {
  const [rotatingIndex, setRotatingIndex] = useState(0);
  const [activePulseIndex, setActivePulseIndex] = useState(0);

  // Interactive AI Match Simulator State
  const [simStep, setSimStep] = useState('idle'); // 'idle' | 'scanning' | 'computing' | 'matched'
  const [simScore, setSimScore] = useState(0);

  // Rotate items in headline
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingIndex((prev) => (prev + 1) % ROTATING_ITEMS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Rotate live ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePulseIndex((prev) => (prev + 1) % LIVE_PULSE_EVENTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const currentItem = ROTATING_ITEMS[rotatingIndex];
  const currentPulse = LIVE_PULSE_EVENTS[activePulseIndex];

  // Run Interactive Simulator
  const handleRunSimulator = () => {
    setSimStep('scanning');
    setSimScore(0);

    setTimeout(() => {
      setSimStep('computing');
      let current = 0;
      const scoreInterval = setInterval(() => {
        current += 7;
        if (current >= 98) {
          clearInterval(scoreInterval);
          setSimScore(98);
          setSimStep('matched');
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else {
          setSimScore(current);
        }
      }, 45);
    }, 1200);
  };

  const handleResetSimulator = () => {
    setSimStep('idle');
    setSimScore(0);
  };

  return (
    <div className="relative overflow-hidden pt-4 pb-16 space-y-16">
      {/* Dynamic Animated Ambient Background Glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-500/10 blur-[130px] rounded-full pointer-events-none -z-10 animate-pulse-subtle" />
      <div className="absolute top-80 -left-40 w-96 h-96 bg-blue-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-96 -right-40 w-96 h-96 bg-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Top Live Campus Ticker Bar */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between p-2.5 px-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <span className="flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex-shrink-0">
              Live AI Dispatch
            </span>
            <p className={`text-xs font-medium truncate transition-all duration-300 ${currentPulse.color}`}>
              {currentPulse.text}
            </p>
          </div>
          <span className="text-[10px] text-slate-400 flex-shrink-0 pl-2 font-mono hidden sm:inline">
            {currentPulse.time}
          </span>
        </div>
      </div>

      {/* Main Hero Stage */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Floating Top Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-semibold shadow-inner shadow-indigo-500/20 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>Next-Generation Autonomous Campus Lost & Found</span>
        </div>

        {/* Dynamic Rotating Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] font-display">
            Never Lose Your{' '}
            <span className="relative inline-block transition-all duration-500 transform">
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentItem.color}`}>
                {currentItem.name}
              </span>
              <span className="text-3xl sm:text-5xl ml-2 inline-block animate-bounce">
                {currentItem.icon}
              </span>
            </span>{' '}
            on Campus Again.
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Our multi-signal multimodal AI matches lost and found reports in seconds using{' '}
            <span className="text-white font-semibold">Vision Attribute Extraction</span>,{' '}
            <span className="text-indigo-400 font-semibold">Vector Cosine Similarity</span>, and{' '}
            <span className="text-purple-400 font-semibold">Campus GPS Proximity Decay</span>.
          </p>
        </div>

        {/* Primary Call-To-Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center space-x-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-base font-bold shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Camera className="w-5 h-5" />
            <span>Report Lost or Found Item</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onEnterPortal}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-850 text-white text-base font-bold border border-slate-750 hover:border-indigo-500/50 shadow-lg transition-all backdrop-blur-md"
          >
            <Compass className="w-5 h-5 text-indigo-400" />
            <span>Enter Live Catalog ({reportsCount} Items)</span>
          </button>

          <button
            onClick={onOpenMatches}
            className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 text-sm font-bold border border-purple-500/40 shadow-lg shadow-purple-500/10 transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Matches ({matchesCount})</span>
          </button>
        </div>

        {/* Live Metrics Ribbons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-4 text-left">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-white">98.4%</div>
            <div className="text-xs text-indigo-400 font-semibold mt-0.5">Top Match Accuracy</div>
            <div className="text-[11px] text-slate-400 mt-1">Multi-signal vector fusion</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-white">&lt; 1.2s</div>
            <div className="text-xs text-purple-400 font-semibold mt-0.5">Vector Search Speed</div>
            <div className="text-[11px] text-slate-400 mt-1">Dense 128-dim embeddings</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-white">16 Locs</div>
            <div className="text-xs text-emerald-400 font-semibold mt-0.5">Campus Geofenced</div>
            <div className="text-[11px] text-slate-400 mt-1">Haversine GPS decay</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-white">100%</div>
            <div className="text-xs text-rose-400 font-semibold mt-0.5">Autonomous Alerts</div>
            <div className="text-[11px] text-slate-400 mt-1">Instant threshold trigger</div>
          </div>
        </div>
      </div>

      {/* Interactive Live AI Matching Simulator Showcase */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-indigo-500/40 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl overflow-hidden">
          {/* Background decorative circuits */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Simulator Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                <Cpu className="w-4 h-4" />
                <span>Interactive AI Simulator</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                Test the Multi-Signal Matching Engine Live
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Click "Simulate AI Match" below to see how our vision model and vector embeddings cross-analyze lost and found items.
              </p>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              {simStep !== 'idle' && (
                <button
                  onClick={handleResetSimulator}
                  className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              <button
                onClick={handleRunSimulator}
                disabled={simStep === 'scanning' || simStep === 'computing'}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{simStep === 'idle' ? 'Simulate AI Match' : 'Re-Run Match'}</span>
              </button>
            </div>
          </div>

          {/* Simulator Visual Body with Real Photos */}
          <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Lost Item Card in Simulator */}
            <div className="md:col-span-4 p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 relative overflow-hidden">
              {simStep === 'scanning' && (
                <div className="absolute inset-0 bg-indigo-950/70 backdrop-blur-xs flex flex-col items-center justify-center z-20">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2" />
                  <div className="scanner-line absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                  <span className="text-[11px] font-bold text-white tracking-wide">
                    Vision Scanning Photo...
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  LOST REPORT
                </span>
                <span className="text-[10px] text-slate-400">Alex R. • 2h ago</span>
              </div>

              {/* Real Photograph */}
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 my-2 relative">
                <img
                  src="http://localhost:5000/uploads/lost_airpods.jpg"
                  alt="AirPods Pro in navy case"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1.5 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-white">
                  📸 Lost on Study Table
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white">Apple AirPods Pro 2</h4>
                <p className="text-[11px] text-slate-300">Midnight Navy Silicone Case with Carabiner</p>
              </div>

              <div className="space-y-1 text-[10px] text-slate-400 pt-2 border-t border-slate-850 mt-2">
                <div>📍 Central Library (2nd Floor Stacks)</div>
                <div>✨ Mark: Metal ring clip attached</div>
              </div>
            </div>

            {/* Center: Live Fusion Computation Meter */}
            <div className="md:col-span-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Multi-Signal Neural Fusion
              </span>

              {/* Confidence Big Dial */}
              <div className="py-2">
                <div
                  className={`text-4xl sm:text-5xl font-extrabold font-display transition-all duration-300 ${
                    simScore >= 90
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 scale-105'
                      : 'text-slate-400'
                  }`}
                >
                  {simScore}%
                </div>
                <div className="text-[11px] text-slate-300 font-semibold mt-1">
                  {simStep === 'idle'
                    ? 'Engine Ready'
                    : simStep === 'scanning'
                    ? 'AI Vision Parsing...'
                    : simStep === 'computing'
                    ? 'Synthesizing Signals...'
                    : '🎯 Confirmed Ultra Match!'}
                </div>
              </div>

              {/* Mini Breakdown Indicators */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-left pt-2 border-t border-slate-850">
                <div className="text-indigo-300">Vector Cosine: 98%</div>
                <div className="text-cyan-300">Attributes: 97%</div>
                <div className="text-emerald-300">Location GPS: 100%</div>
                <div className="text-amber-300">Time Delta: 100%</div>
              </div>
            </div>

            {/* Right: Found Item Card in Simulator */}
            <div className="md:col-span-4 p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 relative overflow-hidden">
              {simStep === 'scanning' && (
                <div className="absolute inset-0 bg-indigo-950/70 backdrop-blur-xs flex flex-col items-center justify-center z-20">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2" />
                  <div className="scanner-line absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                  <span className="text-[11px] font-bold text-white tracking-wide">
                    Vision Scanning Photo...
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  FOUND REPORT
                </span>
                <span className="text-[10px] text-slate-400">Front Desk • 30m ago</span>
              </div>

              {/* Real Photograph */}
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 my-2 relative">
                <img
                  src="http://localhost:5000/uploads/found_airpods.jpg"
                  alt="Found AirPods Pro in navy case"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1.5 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-white">
                  📸 Turned in to Desk
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white">Found Apple AirPods</h4>
                <p className="text-[11px] text-slate-300">Navy Rubber Sleeve Cover with Ring</p>
              </div>

              <div className="space-y-1 text-[10px] text-slate-400 pt-2 border-t border-slate-850 mt-2">
                <div>📍 Central Library (Ref Table 14)</div>
                <div>✨ Mark: Attached silver ring</div>
              </div>
            </div>
          </div>

          {/* AI Explanation Result Bar */}
          {simStep === 'matched' && (
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-start space-x-2.5 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-purple-200 leading-relaxed">
                <span className="font-bold">Generated AI Match Rationale: </span>
                "Both reports describe Apple wireless earbuds in navy silicone sleeve with metal ring clip, both reported at Central Library within 2 hours of loss (98% confidence)."
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent AI Recoveries & Photo Showcase Gallery */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center space-x-1.5">
              <Camera className="w-4 h-4" />
              <span>Campus Visual Catalog</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
              Active Items & AI-Matched Photos
            </h2>
          </div>
          <button
            onClick={onEnterPortal}
            className="flex items-center space-x-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
          >
            <span>View All Catalog Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pictures Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SHOWCASE_GALLERY.map((item) => (
            <div
              key={item.id}
              onClick={onOpenMatches}
              className="group relative rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-950 relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'http://localhost:5000/uploads/lost_airpods.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Floating Score Badge on Photo */}
                <div className="absolute top-3 right-3 flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-xs font-extrabold text-white border border-slate-750">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>{item.matchScore}% Match</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                    {item.category}
                  </span>
                  <h4 className="font-display font-bold text-sm text-white line-clamp-1">
                    {item.title}
                  </h4>
                </div>
              </div>

              <div className="p-3.5 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 border-t border-slate-850">
                <div className="flex items-center truncate">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 mr-1 flex-shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
                <span className="text-indigo-400 font-semibold flex items-center space-x-1">
                  <span>Match View</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Step Interactive Process Guide */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            Simple, Intelligent Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
            How ApexMatch Reconnects Your Items
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-display font-black text-xl mb-4 group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              Drop Photo or Describe
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Upload a snapshot or type details. Our Vision AI immediately parses the image to extract color nuances, brand names, material, and unique marks.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-purple-500/40 transition-all hover:shadow-xl hover:shadow-purple-500/5 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-display font-black text-xl mb-4 group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              Multi-Signal AI Matching
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              The engine evaluates 4 distinct signals: semantic vector cosine similarity, metadata attribute overlap, campus Haversine distance, and temporal decay.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-emerald-500/40 transition-all hover:shadow-xl hover:shadow-emerald-500/5 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-display font-black text-xl mb-4 group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              Instant Alert & Resolution
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              High-confidence pairs (&gt;75%) automatically notify both parties with human-readable rationale. Confirm the match and retrieve your item safely.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Launch Cards Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={onEnterPortal}
            className="p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-white group-hover:text-indigo-300">
                  Semantic AI Search
                </h4>
                <p className="text-xs text-slate-400">Query in plain natural English</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>

          <div
            onClick={onOpenMatches}
            className="p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-white group-hover:text-purple-300">
                  Match Review Dashboard
                </h4>
                <p className="text-xs text-slate-400">Side-by-side comparison & resolve</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>

          <div
            onClick={onOpenMap}
            className="p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-white group-hover:text-emerald-300">
                  Interactive Campus Map
                </h4>
                <p className="text-xs text-slate-400">16 buildings with GPS coordinates</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}
