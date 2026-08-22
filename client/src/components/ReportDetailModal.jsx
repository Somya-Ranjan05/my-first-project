import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle2,
  Tag,
  User,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';
import { api } from '../api';

export function ReportDetailModal({ report, isOpen, onClose, onConfirmMatch }) {
  if (!isOpen || !report) return null;

  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  const isLost = report.type === 'lost';
  const isMatched = report.status === 'matched' || report.status === 'resolved';
  const attributes = report.extracted_attributes || {};
  const imageUrl = report.photo_url ? api.getImageUrl(report.photo_url) : null;

  useEffect(() => {
    let isMounted = true;
    setLoadingMatches(true);
    api
      .getReportById(report.id)
      .then((data) => {
        if (isMounted) {
          setMatches(data.matches || []);
          setLoadingMatches(false);
        }
      })
      .catch((err) => {
        console.error('Error loading matches for report:', err);
        if (isMounted) setLoadingMatches(false);
      });

    return () => {
      isMounted = false;
    };
  }, [report.id]);

  const handleConfirm = async (matchId) => {
    await onConfirmMatch(matchId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <span
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isLost
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isLost ? 'bg-rose-400' : 'bg-emerald-400'}`}
              />
              <span>{isLost ? 'Lost Item Report' : 'Found Item Report'}</span>
            </span>

            {isMatched && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                <CheckCircle2 className="w-3 h-3" />
                <span>Matched & Resolved</span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Item Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
            {/* Image Box */}
            <div className="sm:col-span-5 aspect-[4/3] rounded-2xl bg-slate-950 overflow-hidden border border-slate-800">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={report.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                  <Tag className="w-10 h-10" />
                  <span className="text-xs mt-1">No Image</span>
                </div>
              )}
            </div>

            {/* Core Info */}
            <div className="sm:col-span-7 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-display font-extrabold text-xl text-white">
                  {report.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {report.description}
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-white">{report.location_name}</span>
                    {report.location_spot && (
                      <span className="text-indigo-400 block text-[11px]">
                        Specific Spot: {report.location_spot}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                  <span>{new Date(report.date_time).toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                  <span>
                    {report.contact_name || 'Anonymous'} ({report.contact_email || 'No email provided'})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Extracted Attributes Details */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Vision Attributes</span>
              </span>
              <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Multimodal Feature Extractor
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Color</span>
                <span className="text-xs font-semibold text-white truncate block">
                  {attributes.color || 'Not specified'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Brand</span>
                <span className="text-xs font-semibold text-white truncate block">
                  {attributes.brand || 'Unbranded / Unknown'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Material</span>
                <span className="text-xs font-semibold text-white truncate block">
                  {attributes.material || 'Standard'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Condition</span>
                <span className="text-xs font-semibold text-white truncate block">
                  {attributes.estimated_condition || 'Good'}
                </span>
              </div>
            </div>

            {attributes.unique_marks && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <span className="font-bold">✨ Distinguishing Marks:</span> {attributes.unique_marks}
              </div>
            )}
          </div>

          {/* AI Potential Matches for this Item */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>AI Candidate Matches for this Item</span>
              </h4>
              <span className="text-xs text-slate-400">
                {matches.length} opposite report(s) evaluated
              </span>
            </div>

            {loadingMatches ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Evaluating candidate vectors...</span>
              </div>
            ) : matches.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
                No matching opposite reports found yet. The system will automatically evaluate future submissions.
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => {
                  const oppTitle = isLost ? m.found_title : m.lost_title;
                  const oppLoc = isLost ? m.found_location : m.lost_location;
                  const oppPhoto = isLost ? m.found_photo : m.lost_photo;
                  const isHighMatch = m.confidence_score >= 75;

                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 space-y-3 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          {oppPhoto && (
                            <img
                              src={api.getImageUrl(oppPhoto)}
                              alt={oppTitle}
                              className="w-14 h-14 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                            />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-white">{oppTitle}</span>
                              <span className="text-[10px] text-slate-400">📍 {oppLoc}</span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1 italic leading-relaxed">
                              "{m.explanation}"
                            </p>
                          </div>
                        </div>

                        {/* Confidence Badge */}
                        <div
                          className={`px-3 py-1 rounded-xl text-xs font-extrabold flex-shrink-0 ${
                            isHighMatch
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {m.confidence_score}% Match
                        </div>
                      </div>

                      {/* Confirm CTA */}
                      <div className="pt-2 border-t border-slate-850 flex items-center justify-end">
                        <button
                          onClick={() => handleConfirm(m.id)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm This Match</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
