import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { upload, StorageService } from '../services/storageService.js';
import { AIProvider } from '../services/aiProvider.js';
import { MatchingEngine } from '../services/matchingEngine.js';
import { ReportRepo, MatchRepo } from '../db/database.js';
import { findLocationByName } from '../db/campusLocations.js';

const router = express.Router();

/**
 * POST /api/reports/analyze-photo
 * Pre-flight vision analysis of an uploaded photo to prefill / suggest attributes in UI
 */
router.post('/analyze-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded for analysis' });
    }

    const localPath = req.file.path;
    const userDescription = req.body.description || req.body.title || '';

    // Run Vision Attribute Extraction
    const extractedAttributes = await AIProvider.extractAttributesFromImage(localPath, userDescription);
    const photoUrl = StorageService.getPublicUrl(req.file.filename);

    res.json({
      success: true,
      photo_url: photoUrl,
      attributes: extractedAttributes
    });
  } catch (err) {
    console.error('Error analyzing photo:', err);
    res.status(500).json({ error: 'Failed to analyze photo', details: err.message });
  }
});

/**
 * POST /api/reports
 * Create a new lost or found report
 */
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      category,
      location_name,
      location_spot,
      location_lat,
      location_lng,
      location_zone,
      date_time,
      contact_name,
      contact_email,
      contact_phone
    } = req.body;

    if (!type || !title || !description || !category) {
      return res.status(400).json({ error: 'Missing required report fields (type, title, description, category)' });
    }

    let photoUrl = req.body.photo_url || null;
    let photoPath = null;

    if (req.file) {
      photoUrl = StorageService.getPublicUrl(req.file.filename);
      photoPath = req.file.path;
    } else if (photoUrl && !photoUrl.startsWith('http')) {
      photoPath = StorageService.getLocalPath(photoUrl);
    }

    // Parse or extract attributes
    let extractedAttributes = {};
    if (req.body.extracted_attributes) {
      try {
        extractedAttributes = typeof req.body.extracted_attributes === 'string'
          ? JSON.parse(req.body.extracted_attributes)
          : req.body.extracted_attributes;
      } catch {
        extractedAttributes = {};
      }
    } else if (photoPath) {
      extractedAttributes = await AIProvider.extractAttributesFromImage(photoPath, description);
    } else {
      extractedAttributes = AIProvider.localExtractAttributes(null, `${title} ${description} ${category}`);
    }

    // Geolocation resolution
    let lat = parseFloat(location_lat);
    let lng = parseFloat(location_lng);
    let zone = location_zone || null;

    if (isNaN(lat) || isNaN(lng)) {
      const matchedLoc = findLocationByName(location_name);
      lat = matchedLoc.lat;
      lng = matchedLoc.lng;
      zone = zone || matchedLoc.zone;
    }

    // Generate semantic text embedding from combined title + description + extracted attributes + location & spot
    const attrText = Object.entries(extractedAttributes)
      .map(([k, v]) => (v ? `${k}: ${v}` : ''))
      .filter(Boolean)
      .join(', ');

    const spotText = location_spot ? ` Specific spot: ${location_spot}.` : '';
    const textToEmbed = `${title}. ${description}. Category: ${category}. Attributes: ${attrText}. Location: ${location_name}.${spotText}`;
    const embedding = await AIProvider.generateEmbedding(textToEmbed);

    const reportId = uuidv4();

    const newReport = ReportRepo.create({
      id: reportId,
      type,
      title,
      description,
      category,
      photo_url: photoUrl,
      extracted_attributes: extractedAttributes,
      location_name: location_name || 'Campus Grounds',
      location_spot: location_spot || null,
      location_lat: lat,
      location_lng: lng,
      location_zone: zone,
      date_time: date_time || new Date().toISOString(),
      contact_name: contact_name || 'Campus Member',
      contact_email: contact_email || 'student@campus.edu',
      contact_phone: contact_phone || '',
      status: 'open',
      embedding: embedding
    });

    // Run AI Matching Engine against all opposite reports
    const matches = await MatchingEngine.processMatchesForReport(reportId);

    res.status(201).json({
      success: true,
      report: newReport,
      matches_found: matches.length,
      top_matches: matches.slice(0, 5)
    });
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ error: 'Failed to create report', details: err.message });
  }
});

/**
 * GET /api/reports
 * Get list of reports with optional filters
 */
router.get('/', (req, res) => {
  try {
    const { type, category, status, search, location } = req.query;
    const reports = ReportRepo.findAll({ type, category, status, search, location });
    res.json({ success: true, count: reports.length, reports });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/**
 * GET /api/reports/:id
 * Get single report + its matches
 */
router.get('/:id', async (req, res) => {
  try {
    const report = ReportRepo.findById(req.params.id);
    if (!report) {
      return res.status(400).json({ error: 'Report not found' });
    }

    const matches = MatchRepo.findForReport(req.params.id);

    res.json({
      success: true,
      report,
      matches
    });
  } catch (err) {
    console.error('Error fetching report details:', err);
    res.status(500).json({ error: 'Failed to fetch report details' });
  }
});

/**
 * PATCH /api/reports/:id/status
 * Update report status
 */
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'matched', 'resolved', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updated = ReportRepo.updateStatus(req.params.id, status);
    res.json({ success: true, report: updated });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update report status' });
  }
});

/**
 * DELETE /api/reports/:id
 */
router.delete('/:id', (req, res) => {
  try {
    ReportRepo.delete(req.params.id);
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

export default router;
