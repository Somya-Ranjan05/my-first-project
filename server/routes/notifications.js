import express from 'express';
import { NotificationRepo } from '../db/database.js';
import { EmailService } from '../services/emailService.js';

const router = express.Router();

/**
 * GET /api/notifications
 */
router.get('/', (req, res) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const limit = parseInt(req.query.limit || '50', 10);
    const notifications = NotificationRepo.findAll({ unreadOnly, limit });
    res.json({ success: true, count: notifications.length, notifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 */
router.patch('/:id/read', (req, res) => {
  try {
    const updated = NotificationRepo.markAsRead(req.params.id);
    res.json({ success: true, notification: updated });
  } catch (err) {
    console.error('Error marking notification read:', err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

/**
 * POST /api/notifications/read-all
 */
router.post('/read-all', (req, res) => {
  try {
    NotificationRepo.markAllAsRead();
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications read:', err);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

/**
 * GET /api/notifications/email-config
 * Check if Gmail SMTP is configured
 */
router.get('/email-config', (req, res) => {
  try {
    const status = EmailService.getConfigStatus();
    res.json({ success: true, ...status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read email config' });
  }
});

/**
 * POST /api/notifications/email-config
 * Update Gmail credentials at runtime
 */
router.post('/email-config', (req, res) => {
  try {
    const { user, pass } = req.body;
    if (!user || !pass) {
      return res.status(400).json({ error: 'Both Gmail address and Google App Password are required' });
    }
    const result = EmailService.updateCredentials({ user, pass });
    res.json({ success: true, message: 'Gmail SMTP credentials saved and active!', ...result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save email config' });
  }
});

/**
 * POST /api/notifications/test-email
 * Send a verification email to any submitted address
 */
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Target email address required' });
    }
    const result = await EmailService.sendTestEmail(email);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/notifications/email-logs
 * List recent email dispatch logs
 */
router.get('/email-logs', (req, res) => {
  try {
    const logs = EmailService.getEmailLogs();
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch email logs' });
  }
});

export default router;
