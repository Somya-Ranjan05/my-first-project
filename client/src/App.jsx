import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  Sparkles,
  MapPin,
  PlusCircle,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers
} from 'lucide-react';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { CoverLandingPage } from './components/CoverLandingPage';
import { HeroStats } from './components/HeroStats';
import { SemanticSearch } from './components/SemanticSearch';
import { ReportCard } from './components/ReportCard';
import { SubmitModal } from './components/SubmitModal';
import { MatchReviewDashboard } from './components/MatchReviewDashboard';
import { ReportDetailModal } from './components/ReportDetailModal';
import { CampusMapModal } from './components/CampusMapModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { EmailNotificationModal } from './components/EmailNotificationModal';

export default function App() {
  // Navigation & View Tabs ('home' | 'explore' | 'matches' | 'map')
  const [activeTab, setActiveTab] = useState('home');

  // Data State
  const [reports, setReports] = useState([]);
  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [campusLocations, setCampusLocations] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'lost' | 'found'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Drawers
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedReportForDetail, setSelectedReportForDetail] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [latestEmailDispatch, setLatestEmailDispatch] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Toast helper
  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoadingReports(true);
      const [reportsData, matchesData, notifsData, locsData] = await Promise.all([
        api.getReports(),
        api.getMatches(40),
        api.getNotifications(),
        api.getCampusLocations()
      ]);

      setReports(reportsData.reports || []);
      setMatches(matchesData.matches || []);
      setNotifications(notifsData.notifications || []);
      setCampusLocations(locsData.locations || []);
    } catch (err) {
      console.error('Error loading initial data:', err);
      showToast('Could not connect to API server. Ensure server is running on port 5000.', 'error');
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Execute Search (Semantic AI or Filtered)
  const handleSearch = async (overrideQuery) => {
    const q = overrideQuery !== undefined ? overrideQuery : searchQuery;
    setIsSearching(true);

    try {
      if (q.trim()) {
        const res = await api.semanticSearch({
          query: q,
          type: typeFilter === 'all' ? undefined : typeFilter,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          status: statusFilter === 'all' ? undefined : statusFilter
        });
        setReports(res.results || []);
        showToast(`AI Semantic Search found ${res.results?.length || 0} matching items`);
      } else {
        const res = await api.getReports({
          type: typeFilter === 'all' ? undefined : typeFilter,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          location: locationFilter === 'all' ? undefined : locationFilter,
          status: statusFilter === 'all' ? undefined : statusFilter
        });
        setReports(res.reports || []);
      }
    } catch (err) {
      console.error('Search error:', err);
      showToast('Search failed, falling back to local list', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // Filter effect when filter dropdowns change without query
  useEffect(() => {
    if (!searchQuery.trim()) {
      api
        .getReports({
          type: typeFilter === 'all' ? undefined : typeFilter,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          location: locationFilter === 'all' ? undefined : locationFilter,
          status: statusFilter === 'all' ? undefined : statusFilter
        })
        .then((res) => setReports(res.reports || []))
        .catch((err) => console.error(err));
    }
  }, [typeFilter, categoryFilter, locationFilter, statusFilter, searchQuery]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setLocationFilter('all');
    setStatusFilter('all');
    api.getReports().then((res) => setReports(res.reports || []));
  };

  // Seed / Reset Demo Data
  const handleResetSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await api.seedDatabase();
      showToast(`Demo Data Reloaded! ${res.result?.reportsCount} items & ${res.result?.matchesCount} pairs computed.`);
      await loadInitialData();
    } catch (err) {
      console.error('Seed error:', err);
      showToast('Failed to reset demo data', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Recalculate Matches
  const handleRecalculateMatches = async () => {
    setIsRecalculating(true);
    try {
      const res = await api.recalculateMatches();
      setMatches(res.matches || []);
      showToast(res.message || 'Matches updated successfully!');
      const notifs = await api.getNotifications();
      setNotifications(notifs.notifications || []);
    } catch (err) {
      console.error('Recalculate error:', err);
      showToast('Failed to recalculate matches', 'error');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Confirm Match Action
  const handleConfirmMatch = async (matchId) => {
    try {
      const matchObj = matches.find((m) => m.id === matchId);
      const result = await api.confirmMatch(matchId);
      const emailSentCount = result?.email?.sent?.length || 0;

      // Find reports for the dispatch popup
      const lostRep = reports.find((r) => r.id === matchObj?.lost_report_id) || {
        title: matchObj?.lost_title,
        contact_name: matchObj?.lost_contact,
        contact_email: matchObj?.lost_email,
        location_name: matchObj?.lost_location
      };
      const foundRep = reports.find((r) => r.id === matchObj?.found_report_id) || {
        title: matchObj?.found_title,
        contact_name: matchObj?.found_contact,
        contact_email: matchObj?.found_email,
        location_name: matchObj?.found_location
      };

      setLatestEmailDispatch({
        match: matchObj || result.match,
        email: result.email,
        lostRep,
        foundRep
      });
      setIsEmailModalOpen(true);

      if (emailSentCount > 0) {
        showToast(`🎉 Match Confirmed! Notification emails sent to ${emailSentCount} recipients.`, 'success');
      } else {
        showToast('🎉 Match Confirmed! Email dispatch ready for owner & finder.', 'success');
      }
      await loadInitialData();
      return result;
    } catch (err) {
      console.error('Error confirming match:', err);
      showToast('Failed to confirm match', 'error');
      throw err;
    }
  };

  // Dismiss Match Action
  const handleDismissMatch = async (matchId) => {
    try {
      await api.dismissMatch(matchId);
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
      showToast('Match candidate dismissed');
    } catch (err) {
      console.error('Error dismissing match:', err);
    }
  };

  // Notification Actions
  const handleMarkNotifRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      console.error('Error updating notification:', err);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      showToast('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  // Unread notification count
  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center space-x-2.5 transition-all animate-bounce ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500 text-rose-200'
              : 'bg-indigo-950/90 border-indigo-500 text-indigo-100'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          ) : (
            <Sparkles className="w-5 h-5 text-indigo-400" />
          )}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        unreadCount={unreadCount}
        onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        onResetSeed={handleResetSeed}
        isSeeding={isSeeding}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Cover / Home Landing Tab */}
        {activeTab === 'home' && (
          <CoverLandingPage
            onEnterPortal={() => setActiveTab('explore')}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            onOpenMatches={() => setActiveTab('matches')}
            onOpenMap={() => setActiveTab('map')}
            reportsCount={reports.length}
            matchesCount={matches.length}
          />
        )}

        {/* Explore Feed Tab */}
        {activeTab === 'explore' && (
          <>
            {/* Dynamic Hero & Metrics */}
            <HeroStats
              reports={reports}
              matches={matches}
              activeTypeFilter={typeFilter}
              setActiveTypeFilter={setTypeFilter}
              onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            />

            {/* Semantic AI Search & Filter Panel */}
            <SemanticSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
              isSearching={isSearching}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              campusLocations={campusLocations}
              onResetFilters={handleResetFilters}
            />

            {/* Report Cards Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <span>
                    {searchQuery.trim()
                      ? `Semantic Search Results (${reports.length})`
                      : `Active Campus Reports (${reports.length})`}
                  </span>
                </h2>
                <span className="text-xs text-slate-400">
                  Showing {reports.length} item{reports.length === 1 ? '' : 's'}
                </span>
              </div>

              {loadingReports ? (
                <div className="py-20 text-center">
                  <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white">Loading Campus Catalog...</p>
                  <p className="text-xs text-slate-400 mt-1">Connecting to intelligent vector indexer</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800">
                  <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">No Matching Reports Found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    No items match your active search terms or filters. Try adjusting your search query or reset filters.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {reports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onSelect={(r) => setSelectedReportForDetail(r)}
                      onFindMatches={(r) => setSelectedReportForDetail(r)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* AI Match Review Dashboard Tab */}
        {activeTab === 'matches' && (
          <MatchReviewDashboard
            matches={matches}
            onConfirmMatch={handleConfirmMatch}
            onDismissMatch={handleDismissMatch}
            onRecalculateMatches={handleRecalculateMatches}
            isRecalculating={isRecalculating}
          />
        )}

        {/* Interactive Campus Map Tab */}
        {activeTab === 'map' && (
          <CampusMapModal
            campusLocations={campusLocations}
            reports={reports}
            onSelectLocation={(locName) => {
              setLocationFilter(locName);
              setActiveTab('explore');
            }}
            onSelectReport={(r) => setSelectedReportForDetail(r)}
            onLocationAdded={(newLoc) => {
              setCampusLocations((prev) => [...prev, newLoc]);
              showToast(`Added campus location "${newLoc.name}"!`);
            }}
          />
        )}
      </main>

      {/* Modals & Slide-overs */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={async (newReport, topMatches) => {
          showToast(`Report "${newReport.title}" created! Found ${topMatches?.length || 0} candidate matches.`);
          await loadInitialData();
          if (topMatches && topMatches.length > 0 && topMatches[0].confidence_score >= 75) {
            setActiveTab('matches');
          }
        }}
        campusLocations={campusLocations}
        onLocationAdded={(newLoc) => {
          setCampusLocations((prev) => [...prev, newLoc]);
          showToast(`Added campus location "${newLoc.name}"!`);
        }}
      />

      <ReportDetailModal
        report={selectedReportForDetail}
        isOpen={Boolean(selectedReportForDetail)}
        onClose={() => setSelectedReportForDetail(null)}
        onConfirmMatch={handleConfirmMatch}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotifRead}
        onMarkAllRead={handleMarkAllNotifsRead}
        onOpenMatchReview={() => setActiveTab('matches')}
      />

      <EmailNotificationModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setLatestEmailDispatch(null);
        }}
        latestDispatch={latestEmailDispatch}
        onToast={showToast}
      />

      {/* Modern Footer */}
      <footer className="mt-12 border-t border-slate-850 bg-slate-950/60 py-8 text-center text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-display font-bold text-white">Smart Campus Lost & Found</span>
            <span className="text-slate-400">•</span>
            <span>AI Multi-Signal Matching System</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span>Cosine Vector Embeddings</span>
            <span>•</span>
            <span>Vision Attribute Extraction</span>
            <span>•</span>
            <span>Campus Geo-Decay Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
