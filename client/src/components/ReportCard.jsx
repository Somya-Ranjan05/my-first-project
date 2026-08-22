import React from 'react';
import {
  MapPin,
  Calendar,
  Sparkles,
  Tag,
  CheckCircle,
  Eye,
  ArrowUpRight,
  ShieldAlert,
  User,
  Mail
} from 'lucide-react';
import { api } from '../api';

export function ReportCard({ report, onSelect, onFindMatches }) {
  const isLost = report.type === 'lost';
  const isMatched = report.status === 'matched' || report.status === 'resolved';
  const attributes = report.extracted_attributes || {};

  const formattedDate = (() => {
    try {
      const d = new Date(report.date_time);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return report.date_time;
    }
  })();

  const imageUrl = report.photo_url ? api.getImageUrl(report.photo_url) : null;

  return (
    <div className="group relative flex flex-col bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
      {/* Top Banner Badges */}
      <div className="relative aspect-[16/10] w-full bg-slate-950/80 overflow-hidden border-b border-slate-850">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-950 to-slate-900 text-slate-600">
            <Tag className="w-12 h-12 stroke-[1.5]" />
            <span className="text-xs mt-1 font-medium">No photo provided</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

        {/* Top Floating Pills */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Type Badge */}
          <span
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${
              isLost
                ? 'bg-rose-600/90 text-white ring-1 ring-rose-400/40 shadow-rose-600/20'
                : 'bg-emerald-600/90 text-white ring-1 ring-emerald-400/40 shadow-emerald-600/20'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>{isLost ? 'Lost Item' : 'Found Item'}</span>
          </span>

          {/* Status or Semantic Similarity Badge */}
          {report.similarity_score !== undefined ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{report.similarity_score}% Match</span>
            </span>
          ) : isMatched ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 backdrop-blur-md">
              <CheckCircle className="w-3 h-3" />
              <span>Matched</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-700/80 backdrop-blur-md">
              Open
            </span>
          )}
        </div>

        {/* Bottom Floating Location on Image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center text-xs text-slate-300 font-medium truncate pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-indigo-400 mr-1.5 flex-shrink-0" />
          <span className="truncate">
            {report.location_name}
            {report.location_spot ? ` • ${report.location_spot}` : ''}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3
            onClick={() => onSelect(report)}
            className="font-display font-bold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-1 cursor-pointer"
          >
            {report.title}
          </h3>

          {/* Description Excerpt */}
          <p className="mt-1.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {report.description}
          </p>

          {/* AI Extracted Attributes Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {attributes.color && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                🎨 {attributes.color}
              </span>
            )}
            {attributes.brand && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                🏷️ {attributes.brand}
              </span>
            )}
            {attributes.unique_marks && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 truncate max-w-[200px]">
                ✨ {attributes.unique_marks}
              </span>
            )}
          </div>
        </div>

        {/* Footer Meta & Action */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px]">{formattedDate}</span>
          </div>

          <button
            onClick={() => onSelect(report)}
            className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            <span>View Matches</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
