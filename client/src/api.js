const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Reports
  async getReports(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await fetch(`${API_BASE}/reports?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  async getReportById(id) {
    const res = await fetch(`${API_BASE}/reports/${id}`);
    if (!res.ok) throw new Error('Failed to fetch report details');
    return res.json();
  },

  async analyzePhoto(file, description = '') {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('description', description);
    const res = await fetch(`${API_BASE}/reports/analyze-photo`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to analyze photo');
    return res.json();
  },

  async createReport(formData) {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      body: formData // FormData containing fields + photo file
    });
    if (!res.ok) throw new Error('Failed to create report');
    return res.json();
  },

  async updateReportStatus(id, status) {
    const res = await fetch(`${API_BASE}/reports/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async deleteReport(id) {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete report');
    return res.json();
  },

  // Matches
  async getMatches(minConfidence = 40) {
    const res = await fetch(`${API_BASE}/matches?minConfidence=${minConfidence}`);
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  },

  async confirmMatch(matchId) {
    const res = await fetch(`${API_BASE}/matches/${matchId}/confirm`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to confirm match');
    return res.json();
  },

  async dismissMatch(matchId) {
    const res = await fetch(`${API_BASE}/matches/${matchId}/dismiss`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to dismiss match');
    return res.json();
  },

  async recalculateMatches() {
    const res = await fetch(`${API_BASE}/matches/recalculate`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to recalculate matches');
    return res.json();
  },

  // Semantic Search
  async semanticSearch(payload) {
    const res = await fetch(`${API_BASE}/search/semantic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Semantic search failed');
    return res.json();
  },

  // Notifications
  async getNotifications(unreadOnly = false) {
    const res = await fetch(`${API_BASE}/notifications?unread=${unreadOnly}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH'
    });
    if (!res.ok) throw new Error('Failed to update notification');
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to update notifications');
    return res.json();
  },

  // Campus Locations & Demo Seed
  async getCampusLocations() {
    const res = await fetch(`${API_BASE}/locations`);
    if (!res.ok) throw new Error('Failed to fetch campus locations');
    return res.json();
  },

  async createCampusLocation(loc) {
    const res = await fetch(`${API_BASE}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loc)
    });
    if (!res.ok) throw new Error('Failed to add campus location');
    return res.json();
  },

  async seedDatabase() {
    const res = await fetch(`${API_BASE}/seed`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to seed database');
    return res.json();
  },

  // Gmail SMTP & Dispatch Service
  async getEmailConfig() {
    const res = await fetch(`${API_BASE}/notifications/email-config`);
    if (!res.ok) throw new Error('Failed to fetch email config');
    return res.json();
  },

  async saveEmailConfig(user, pass) {
    const res = await fetch(`${API_BASE}/notifications/email-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass })
    });
    if (!res.ok) throw new Error('Failed to save email config');
    return res.json();
  },

  async sendTestEmail(email) {
    const res = await fetch(`${API_BASE}/notifications/test-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  async getEmailLogs() {
    const res = await fetch(`${API_BASE}/notifications/email-logs`);
    if (!res.ok) throw new Error('Failed to fetch email logs');
    return res.json();
  },

  async checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Server unreachable');
    return res.json();
  },

  getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://localhost:5000${cleanPath}`;
  }
};
