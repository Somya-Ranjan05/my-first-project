import express from 'express';
import { MatchRepo, ReportRepo, NotificationRepo } from '../db/database.js';
import { MatchingEngine } from '../services/matchingEngine.js';
import { EmailService } from '../services/emailService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * GET /api/matches
 * Get high confidence candidate matches for review
 */
router.get('/', (req, res) => {
  try {
    const minConfidence = parseInt(req.query.minConfidence || '40', 10);
    const matches = MatchRepo.findAllHighConfidence(minConfidence);
    res.json({ success: true, count: matches.length, matches });
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

/**
 * POST /api/matches/:id/confirm
 * User confirms that these two reports match.
 * Sets match status = 'confirmed', updates both reports to 'matched',
 * and sends Gmail notification emails to both parties.
 */
router.post('/:id/confirm', async (req, res) => {
  try {
    const match = MatchRepo.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match record not found' });
    }

    // Update match status
    const updatedMatch = MatchRepo.updateStatus(match.id, 'confirmed');

    // Update both reports to 'matched'
    ReportRepo.updateStatus(match.lost_report_id, 'matched');
    ReportRepo.updateStatus(match.found_report_id, 'matched');

    const lostRep = ReportRepo.findById(match.lost_report_id);
    const foundRep = ReportRepo.findById(match.found_report_id);

    // ── In-app Notification (for lost person) ──────────────────────────────
    if (lostRep?.contact_email) {
      NotificationRepo.create({
        id: uuidv4(),
        report_id: lostRep.id,
        match_id: match.id,
        recipient_email: lostRep.contact_email,
        recipient_name: lostRep.contact_name,
        title: '🎉 Match Confirmed — Retrieve Your Item!',
        message: `Your lost report for "${lostRep.title}" was confirmed matched with found item "${foundRep?.title}". Check your email for full contact details.`,
        confidence_score: match.confidence_score,
        is_read: 0
      });
    }

    // ── In-app Notification (for finder) ──────────────────────────────────
    if (foundRep?.contact_email) {
      NotificationRepo.create({
        id: uuidv4(),
        report_id: foundRep.id,
        match_id: match.id,
        recipient_email: foundRep.contact_email,
        recipient_name: foundRep.contact_name,
        title: '🌟 Thank You! Your Found Report Was Matched',
        message: `Your found item "${foundRep.title}" was matched to its rightful owner. Check your email for their contact details.`,
        confidence_score: match.confidence_score,
        is_read: 0
      });
    }

    // ── Send Gmail Emails to Both Parties ─────────────────────────────────
    let emailResult = { sent: [], skipped: [], errors: [] };
    try {
      emailResult = await EmailService.sendMatchConfirmationEmails({
        lostRep,
        foundRep,
        match: { ...updatedMatch, explanation: match.explanation }
      });
    } catch (emailErr) {
      console.error('Email dispatch error (non-fatal):', emailErr);
      emailResult.errors.push({ error: emailErr.message });
    }

    // Summarize email delivery status
    const emailStatus = emailResult.sent.length > 0
      ? `Emails sent to: ${emailResult.sent.map(e => e.to).join(', ')}`
      : emailResult.skipped.length > 0
      ? `Email credentials not configured — logged to console`
      : `Email errors: ${emailResult.errors.map(e => e.error).join('; ')}`;

    console.log(`✅ Match ${match.id} confirmed. ${emailStatus}`);

    res.json({
      success: true,
      message: 'Match successfully confirmed and both reports updated to matched',
      match: updatedMatch,
      email: {
        sent: emailResult.sent,
        skipped: emailResult.skipped,
        errors: emailResult.errors,
        summary: emailStatus
      }
    });
  } catch (err) {
    console.error('Error confirming match:', err);
    res.status(500).json({ error: 'Failed to confirm match' });
  }
});

/**
 * POST /api/matches/:id/dismiss
 * User dismisses the match suggestion.
 */
router.post('/:id/dismiss', (req, res) => {
  try {
    const match = MatchRepo.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match record not found' });
    }

    const updatedMatch = MatchRepo.updateStatus(match.id, 'dismissed');

    res.json({
      success: true,
      message: 'Match candidate dismissed',
      match: updatedMatch
    });
  } catch (err) {
    console.error('Error dismissing match:', err);
    res.status(500).json({ error: 'Failed to dismiss match' });
  }
});

/**
 * POST /api/matches/recalculate
 * Rerun matching engine on all active reports
 */
router.post('/recalculate', async (req, res) => {
  try {
    const openReports = ReportRepo.findAll({ status: 'all' });
    let totalProcessed = 0;

    for (const rep of openReports) {
      if (rep.type === 'lost') {
        await MatchingEngine.processMatchesForReport(rep.id);
        totalProcessed++;
      }
    }

    const allMatches = MatchRepo.findAllHighConfidence(40);

    res.json({
      success: true,
      message: `Recalculated matches for ${totalProcessed} lost reports`,
      total_matches: allMatches.length,
      matches: allMatches
    });
  } catch (err) {
    console.error('Error recalculating matches:', err);
    res.status(500).json({ error: 'Failed to recalculate matches' });
  }
});

/**
 * POST /api/matches/test-email
 * Send a test email to verify Gmail SMTP configuration
 */
router.post('/test-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address required in request body' });
  }

  const result = await EmailService.sendTestEmail(email);
  res.json(result);
});

export default router;
