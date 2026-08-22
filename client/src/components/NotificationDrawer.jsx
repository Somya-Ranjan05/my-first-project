import React from 'react';
import { Bell, CheckCheck, Sparkles, X, Mail, ShieldAlert, ArrowRight } from 'lucide-react';

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  onOpenMatchReview
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Match Notifications
              </h3>
              <p className="text-xs text-slate-400">
                High-confidence AI alerts ({notifications.length})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {notifications.length > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold p-1 hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No New Notifications</p>
              <p className="text-xs text-slate-400 mt-1">
                You'll receive instant alerts when submitted items match above the 75% confidence threshold.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = notif.is_read === 0;

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (isUnread) onMarkRead(notif.id);
                    onOpenMatchReview();
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative ${
                    isUnread
                      ? 'bg-indigo-950/40 border-indigo-500/40 hover:border-indigo-400 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isUnread && (
                    <div className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  )}

                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <Sparkles className="w-3 h-3" />
                      <span>{notif.confidence_score}% Confidence Match</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-xs sm:text-sm text-white">
                    {notif.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="pt-1.5 flex items-center justify-between text-[11px] text-indigo-400 font-semibold">
                    <span>Recipient: {notif.recipient_email}</span>
                    <span className="flex items-center space-x-1 hover:underline">
                      <span>Review Pair</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
