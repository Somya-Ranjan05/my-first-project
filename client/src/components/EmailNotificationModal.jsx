import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  MailCheck,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Key,
  RefreshCw,
  Sparkles,
  Info,
  Clock,
  User,
  HelpCircle
} from 'lucide-react';
import { api } from '../api';

export function EmailNotificationModal({
  isOpen,
  onClose,
  latestDispatch, // { match, email, lostRep, foundRep }
  onToast
}) {
  const [activeTab, setActiveTab] = useState('dispatch'); // 'dispatch' | 'settings' | 'logs'
  const [config, setConfig] = useState({ isConfigured: false, user: null });
  const [gmailUser, setGmailUser] = useState('');
  const [gmailPass, setGmailPass] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Load config on open
  useEffect(() => {
    if (isOpen) {
      loadConfig();
      if (latestDispatch) {
        setActiveTab('dispatch');
      }
    }
  }, [isOpen, latestDispatch]);

  const loadConfig = async () => {
    try {
      const res = await api.getEmailConfig();
      setConfig(res);
      if (res.user) {
        setGmailUser(res.user);
        setTestEmail(res.user);
      }
    } catch (err) {
      console.error('Error reading email config:', err);
    }
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await api.getEmailLogs();
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!gmailUser || !gmailPass) return;
    setIsSaving(true);
    try {
      await api.saveEmailConfig(gmailUser, gmailPass);
      await loadConfig();
      onToast?.('✅ Gmail SMTP credentials saved and active!', 'success');
      setGmailPass('');
    } catch (err) {
      onToast?.('Failed to save Gmail configuration', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) return;
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await api.sendTestEmail(testEmail);
      setTestResult(res);
      if (res.success) {
        onToast?.(`Test email delivered to ${testEmail}!`, 'success');
      } else {
        onToast?.(res.error || 'Failed to send test email', 'error');
      }
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">
                Gmail Notification Dispatcher
              </h2>
              <p className="text-xs text-slate-400">
                Automated email alerts for lost &amp; found submitters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800/80 space-x-2 bg-slate-950/40">
          {latestDispatch && (
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
                activeTab === 'dispatch'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Latest Match Dispatch</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Gmail SMTP Setup</span>
            <span
              className={`w-2 h-2 rounded-full ${
                config.isConfigured ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          </button>

          <button
            onClick={() => {
              setActiveTab('logs');
              loadLogs();
            }}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'logs'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Dispatch History</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* TAB 1: LATEST DISPATCH NOTIFICATION */}
          {activeTab === 'dispatch' && latestDispatch && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Match Confirmed! Notifications Generated
                    </h4>
                    <p className="text-xs text-indigo-200">
                      Both the owner and finder have been linked and pre-addressed.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                  {latestDispatch.match?.confidence_score}% Match
                </span>
              </div>

              {/* Action Cards for Both Recipients */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Lost Item Owner */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        LOST ITEM OWNER
                      </span>
                      <span className="text-xs text-slate-400">Recipient</span>
                    </div>

                    <h5 className="font-bold text-white text-sm">
                      {latestDispatch.lostRep?.contact_name || 'Item Owner'}
                    </h5>
                    <p className="text-xs text-indigo-400 font-mono mt-0.5">
                      {latestDispatch.lostRep?.contact_email || 'No email provided'}
                    </p>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="text-[11px] text-slate-400">Subject:</div>
                      <div className="font-semibold text-white">
                        🎉 Match Confirmed: Your Lost "{latestDispatch.lostRep?.title}" has been found!
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Launch Gmail */}
                  {latestDispatch.email?.directGmailLinks?.find((l) => l.role === 'lost_person') && (
                    <a
                      href={
                        latestDispatch.email.directGmailLinks.find(
                          (l) => l.role === 'lost_person'
                        ).url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Pre-Filled Gmail to Owner</span>
                    </a>
                  )}
                </div>

                {/* 2. Item Finder */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ITEM FINDER
                      </span>
                      <span className="text-xs text-slate-400">Recipient</span>
                    </div>

                    <h5 className="font-bold text-white text-sm">
                      {latestDispatch.foundRep?.contact_name || 'Finder'}
                    </h5>
                    <p className="text-xs text-emerald-400 font-mono mt-0.5">
                      {latestDispatch.foundRep?.contact_email || 'No email provided'}
                    </p>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="text-[11px] text-slate-400">Subject:</div>
                      <div className="font-semibold text-white">
                        🌟 Thank You! Your Found Item Report Matched "{latestDispatch.lostRep?.title}"
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Launch Gmail */}
                  {latestDispatch.email?.directGmailLinks?.find((l) => l.role === 'finder') && (
                    <a
                      href={
                        latestDispatch.email.directGmailLinks.find(
                          (l) => l.role === 'finder'
                        ).url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Pre-Filled Gmail to Finder</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Status footer */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MailCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    {config.isConfigured
                      ? `Automated background dispatch via ${config.user}`
                      : 'Background simulator mode (Configure Gmail SMTP below for 100% automated delivery)'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="text-indigo-400 hover:underline font-semibold"
                >
                  Configure SMTP
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GMAIL SMTP SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  config.isConfigured
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <Mail className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      {config.isConfigured
                        ? `Connected: ${config.user}`
                        : 'Gmail SMTP Not Yet Configured'}
                    </h4>
                    <p className="text-xs opacity-80">
                      {config.isConfigured
                        ? 'Automated background emails will be delivered directly from your Gmail account.'
                        : 'Enter your Gmail address & Google App Password below to enable live email delivery.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Setup Form */}
              <form onSubmit={handleSaveConfig} className="space-y-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Key className="w-4 h-4 text-indigo-400" />
                  <span>Set Up Sender Gmail Account</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Sender Gmail Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. campuslostfound@gmail.com"
                    value={gmailUser}
                    onChange={(e) => setGmailUser(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Google 16-Character App Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. abcd efgh ijkl mnop"
                    value={gmailPass}
                    onChange={(e) => setGmailPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white placeholder-slate-500 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                    <Info className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                    <span>
                      Generate an App Password at:{' '}
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline font-semibold"
                      >
                        myaccount.google.com/apppasswords
                      </a>
                    </span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Saving & Verifying...' : 'Save & Connect Gmail'}</span>
                </button>
              </form>

              {/* Test Sender */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Send a Test Verification Email</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Verify that your Gmail account can deliver messages to your inbox.
                </p>

                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your personal Gmail to test"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-white placeholder-slate-500 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleSendTest}
                    disabled={isSendingTest || !testEmail}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isSendingTest ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Send Test</span>
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium border ${
                      testResult.success
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    {testResult.success
                      ? `✅ Test email successfully sent! Message ID: ${testResult.messageId}`
                      : `❌ Error: ${testResult.error}`}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DISPATCH HISTORY LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Recent Notification History</h4>
                <button
                  onClick={loadLogs}
                  className="flex items-center space-x-1 text-xs text-indigo-400 hover:underline"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No emails dispatched yet in this session. Confirm a match to see records here.
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.role === 'lost_person'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {log.role === 'lost_person' ? 'Owner' : 'Finder'}
                          </span>
                          <span className="font-semibold text-white truncate max-w-[200px]">
                            {log.to}
                          </span>
                        </div>
                        <p className="text-slate-400 truncate max-w-sm">{log.subject}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {log.directGmailUrl && (
                          <a
                            href={log.directGmailUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-indigo-300 hover:text-white transition-colors"
                            title="Open in Gmail Web"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'sent'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {log.status === 'sent' ? 'Delivered' : 'Ready / Logged'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
