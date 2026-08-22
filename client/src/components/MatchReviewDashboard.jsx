import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  Zap,
  Info,
  RefreshCw,
  Clock,
  Crosshair,
  Mail,
  MailCheck,
  AlertTriangle,
  Send
} from 'lucide-react';
import { api } from '../api';
import confetti from 'canvas-confetti';

export function MatchReviewDashboard({
  matches = [],
  onConfirmMatch,
  onDismissMatch,
  onRecalculateMatches,
  isRecalculating
}) {
  const [filterConfidence, setFilterConfidence] = useState(40);
  const [selectedMatchForDetail, setSelectedMatchForDetail] = useState(null);
  const [emailStatusByMatch, setEmailStatusByMatch] = useState({});
  const [confirmingId, setConfirmingId] = useState(null);

  const filteredMatches = matches.filter(
    (m) => m.confidence_score >= filterConfidence && m.status !== 'dismissed'
  );

  const handleConfirm = async (matchId) => {
    setConfirmingId(matchId);
    try {
      const result = await onConfirmMatch(matchId);
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });

      // Store email result from API response
      if (result?.email) {
        setEmailStatusByMatch((prev) => ({ ...prev, [matchId]: result.email }));
      }
    } catch (err) {
      console.error('Error confirming match:', err);
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                AI Match Review Dashboard
              </h2>
              <p className="text-xs text-slate-400">
                Automated multi-signal pair candidates with confidence scoring & AI rationale
              </p>
            </div>
          </div>
        </div>

        {/* Filter Slider & Recalculate CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Min Confidence:</span>
            <select
              value={filterConfidence}
              onChange={(e) => setFilterConfidence(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-indigo-400 focus:outline-none cursor-pointer"
            >
              <option value={40} className="bg-slate-900">40% & Above</option>
              <option value={60} className="bg-slate-900">60% & Above</option>
              <option value={75} className="bg-slate-900">75% (High Match)</option>
              <option value={90} className="bg-slate-900">90% (Ultra Match)</option>
            </select>
          </div>

          <button
            onClick={onRecalculateMatches}
            disabled={isRecalculating}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin text-purple-400' : ''}`} />
            <span>{isRecalculating ? 'Calculating...' : 'Recalculate All'}</span>
          </button>
        </div>
      </div>

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800">
          <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Match Candidates at This Threshold</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Try lowering the minimum confidence filter or submit new lost/found reports to trigger the matching engine.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMatches.map((match) => {
            const isConfirmed = match.status === 'confirmed' || (match.lost_status === 'matched' && match.found_status === 'matched');
            const lostImg = match.lost_photo ? api.getImageUrl(match.lost_photo) : null;
            const foundImg = match.found_photo ? api.getImageUrl(match.found_photo) : null;

            // Score formatting
            const vectorScorePct = Math.round((match.vector_score || 0) * 100);
            const metadataScorePct = Math.round((match.metadata_score || 0) * 100);
            const locationScorePct = Math.round((match.location_score || 0) * 100);
            const timeScorePct = Math.round((match.time_score || 0) * 100);

            // Confidence tier badge
            const isUltra = match.confidence_score >= 90;
            const isHigh = match.confidence_score >= 75 && match.confidence_score < 90;

            return (
              <div
                key={match.id}
                className={`relative rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isConfirmed
                    ? 'bg-purple-950/20 border-purple-500/40 shadow-xl shadow-purple-500/5'
                    : isUltra
                    ? 'bg-slate-900/80 border-indigo-500/40 shadow-xl shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* AI Explanation Top Banner */}
                <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-950 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 flex-shrink-0 mt-0.5 sm:mt-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                          AI Match Explanation
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                          Multi-Signal Fusion
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-0.5 leading-relaxed italic">
                        "{match.explanation}"
                      </p>
                    </div>
                  </div>

                  {/* Confidence Score Pill */}
                  <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                    <div
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl font-display font-extrabold text-sm shadow-md ${
                        isUltra
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/25'
                          : isHigh
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25'
                          : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>{match.confidence_score}% Match</span>
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Comparison Columns */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left Column: Lost Item */}
                  <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-950/60 border border-rose-500/20 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          <span>LOST REPORT</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium capitalize">
                          {match.lost_category?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 mb-2.5">
                        {lostImg ? (
                          <img src={lostImg} alt={match.lost_title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                            No Photo
                          </div>
                        )}
                      </div>

                      <h4 className="font-display font-bold text-sm text-white line-clamp-1">
                        {match.lost_title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {match.lost_desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                      <div className="flex items-center truncate">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 mr-1 flex-shrink-0" />
                        <span className="truncate">{match.lost_location}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 mr-1 flex-shrink-0" />
                        <span>{new Date(match.lost_date).toLocaleDateString()}</span>
                      </div>
                      {match.lost_contact && (
                        <div className="text-[10px] text-slate-500">
                          Reported by: {match.lost_contact} ({match.lost_email})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center Column: Multi-Signal Score Breakdown */}
                  <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex flex-col justify-center space-y-3.5">
                    <div className="text-center">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Scoring Breakdown
                      </span>
                    </div>

                    {/* Vector Cosine Similarity */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300 flex items-center">
                          <Zap className="w-3 h-3 text-indigo-400 mr-1" /> Vector Similarity (40%)
                        </span>
                        <span className="text-indigo-400">{vectorScorePct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${vectorScorePct}%` }}
                        />
                      </div>
                    </div>

                    {/* Metadata & Attributes */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300 flex items-center">
                          <Tag className="w-3 h-3 text-cyan-400 mr-1" /> Attribute Match (25%)
                        </span>
                        <span className="text-cyan-400">{metadataScorePct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          style={{ width: `${metadataScorePct}%` }}
                        />
                      </div>
                    </div>

                    {/* Campus Location Proximity */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300 flex items-center">
                          <MapPin className="w-3 h-3 text-emerald-400 mr-1" /> Location Proximity (20%)
                        </span>
                        <span className="text-emerald-400">{locationScorePct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                          style={{ width: `${locationScorePct}%` }}
                        />
                      </div>
                    </div>

                    {/* Time Delta Proximity */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-300 flex items-center">
                          <Clock className="w-3 h-3 text-amber-400 mr-1" /> Time Proximity (15%)
                        </span>
                        <span className="text-amber-400">{timeScorePct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          style={{ width: `${timeScorePct}%` }}
                        />
                      </div>
                    </div>

                    {/* Confirmation / Dismiss Action Bar */}
                    <div className="pt-2 flex flex-col items-center space-y-2">
                      <div className="flex items-center justify-center space-x-2 w-full">
                        {isConfirmed ? (
                          <div className="flex flex-col items-center space-y-1">
                            <div className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4 text-purple-400" />
                              <span>Match Confirmed</span>
                            </div>
                            <div className="flex items-center space-x-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                              <MailCheck className="w-3.5 h-3.5" />
                              <span>Emails sent to owner & finder</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleConfirm(match.id)}
                              disabled={confirmingId === match.id}
                              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                            >
                              {confirmingId === match.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Mail className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {confirmingId === match.id
                                  ? 'Confirming & Emailing...'
                                  : 'Confirm & Send Email Requests'}
                              </span>
                            </button>

                            <button
                              onClick={() => onDismissMatch(match.id)}
                              disabled={confirmingId === match.id}
                              className="flex items-center space-x-1 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-rose-400 text-xs font-semibold border border-slate-700 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Dismiss</span>
                            </button>
                          </>
                        )}
                      </div>

                      {/* Recipient preview */}
                      <div className="text-[10px] text-slate-400 text-center flex items-center justify-center space-x-1">
                        <Send className="w-3 h-3 text-indigo-400" />
                        <span>Dispatches request to:</span>
                        <span className="text-slate-300 font-mono truncate max-w-[120px]">{match.lost_email}</span>
                        <span>&amp;</span>
                        <span className="text-slate-300 font-mono truncate max-w-[120px]">{match.found_email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Found Item */}
                  <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/20 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>FOUND REPORT</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium capitalize">
                          {match.found_category?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 mb-2.5">
                        {foundImg ? (
                          <img src={foundImg} alt={match.found_title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                            No Photo
                          </div>
                        )}
                      </div>

                      <h4 className="font-display font-bold text-sm text-white line-clamp-1">
                        {match.found_title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {match.found_desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                      <div className="flex items-center truncate">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 mr-1 flex-shrink-0" />
                        <span className="truncate">{match.found_location}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 mr-1 flex-shrink-0" />
                        <span>{new Date(match.found_date).toLocaleDateString()}</span>
                      </div>
                      {match.found_contact && (
                        <div className="text-[10px] text-slate-500">
                          Found by: {match.found_contact} ({match.found_email})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
