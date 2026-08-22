import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CAMPUS_LOCATIONS } from './campusLocations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'lost_and_found.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Ensure db directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);

// Initialize schema
const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schemaSql);

// Initialize campus locations in database if empty
function initCampusLocations() {
  try {
    const countRow = db.prepare(`SELECT COUNT(*) as count FROM campus_locations`).get();
    if (!countRow || countRow.count === 0) {
      const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO campus_locations (
          id, name, shortName, lat, lng, zone, color, description, popular_spots, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      for (const loc of CAMPUS_LOCATIONS) {
        insertStmt.run(
          loc.id,
          loc.name,
          loc.shortName,
          loc.lat,
          loc.lng,
          loc.zone,
          loc.color || '#6366f1',
          loc.description || '',
          JSON.stringify(loc.popular_spots || [])
        );
      }
      console.log(`📍 Seeded ${CAMPUS_LOCATIONS.length} campus locations into database.`);
    }
  } catch (err) {
    console.warn('Error initializing campus locations table:', err.message);
  }
}
initCampusLocations();

// Campus Location Repository
export const LocationRepo = {
  findAll() {
    const rows = db.prepare(`SELECT * FROM campus_locations ORDER BY name ASC`).all();
    return rows.map((r) => ({
      ...r,
      popular_spots: r.popular_spots ? JSON.parse(r.popular_spots) : []
    }));
  },

  findById(id) {
    const row = db.prepare(`SELECT * FROM campus_locations WHERE id = ?`).get(id);
    if (!row) return null;
    return {
      ...row,
      popular_spots: row.popular_spots ? JSON.parse(row.popular_spots) : []
    };
  },

  create(loc) {
    const stmt = db.prepare(`
      INSERT INTO campus_locations (
        id, name, shortName, lat, lng, zone, color, description, popular_spots, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')))
    `);

    stmt.run(
      loc.id,
      loc.name,
      loc.shortName || loc.name,
      loc.lat || 37.4275,
      loc.lng || -122.1697,
      loc.zone || 'Central Campus',
      loc.color || '#6366f1',
      loc.description || '',
      Array.isArray(loc.popular_spots) ? JSON.stringify(loc.popular_spots) : (loc.popular_spots || '[]'),
      loc.created_at || null
    );

    return this.findById(loc.id);
  }
};

// Report Repository Helpers
export const ReportRepo = {
  create(report) {
    const stmt = db.prepare(`
      INSERT INTO reports (
        id, type, title, description, category, photo_url,
        extracted_attributes, location_name, location_spot, location_lat, location_lng, location_zone,
        date_time, contact_name, contact_email, contact_phone, status, embedding, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')))
    `);

    const extractedAttr =
      typeof report.extracted_attributes === 'object'
        ? JSON.stringify(report.extracted_attributes)
        : report.extracted_attributes || null;

    const embeddingStr = Array.isArray(report.embedding)
      ? JSON.stringify(report.embedding)
      : report.embedding || null;

    stmt.run(
      report.id,
      report.type,
      report.title,
      report.description,
      report.category,
      report.photo_url || null,
      extractedAttr,
      report.location_name,
      report.location_spot || null,
      report.location_lat || 0,
      report.location_lng || 0,
      report.location_zone || null,
      report.date_time || new Date().toISOString(),
      report.contact_name || null,
      report.contact_email || null,
      report.contact_phone || null,
      report.status || 'open',
      embeddingStr,
      report.created_at || null
    );

    return this.findById(report.id);
  },

  findById(id) {
    const row = db.prepare(`SELECT * FROM reports WHERE id = ?`).get(id);
    if (!row) return null;
    return this.formatRow(row);
  },

  findAll({ type, category, status, search, location } = {}) {
    let sql = `SELECT * FROM reports WHERE 1=1`;
    const params = [];

    if (type) {
      sql += ` AND type = ?`;
      params.push(type);
    }
    if (category && category !== 'all') {
      sql += ` AND category = ?`;
      params.push(category);
    }
    if (status && status !== 'all') {
      sql += ` AND status = ?`;
      params.push(status);
    }
    if (location && location !== 'all') {
      sql += ` AND (location_name LIKE ? OR location_spot LIKE ?)`;
      params.push(`%${location}%`, `%${location}%`);
    }
    if (search) {
      sql += ` AND (title LIKE ? OR description LIKE ? OR location_name LIKE ? OR location_spot LIKE ? OR extracted_attributes LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    sql += ` ORDER BY datetime(created_at) DESC`;

    const rows = db.prepare(sql).all(...params);
    return rows.map((r) => this.formatRow(r));
  },

  findCandidatesForReport(reportId, targetType) {
    const rows = db
      .prepare(`SELECT * FROM reports WHERE id != ? AND type = ? AND status != 'cancelled'`)
      .all(reportId, targetType);
    return rows.map((r) => this.formatRow(r));
  },

  updateStatus(id, status) {
    db.prepare(`UPDATE reports SET status = ? WHERE id = ?`).run(status, id);
    return this.findById(id);
  },

  updateEmbeddingAndAttributes(id, embedding, attributes) {
    db.prepare(
      `UPDATE reports SET embedding = ?, extracted_attributes = ? WHERE id = ?`
    ).run(
      Array.isArray(embedding) ? JSON.stringify(embedding) : embedding,
      typeof attributes === 'object' ? JSON.stringify(attributes) : attributes,
      id
    );
    return this.findById(id);
  },

  delete(id) {
    return db.prepare(`DELETE FROM reports WHERE id = ?`).run(id);
  },

  clearAll() {
    db.exec(`DELETE FROM notifications; DELETE FROM matches; DELETE FROM reports;`);
  },

  formatRow(row) {
    return {
      ...row,
      extracted_attributes: row.extracted_attributes
        ? JSON.parse(row.extracted_attributes)
        : {},
      embedding: row.embedding ? JSON.parse(row.embedding) : null
    };
  }
};

// Match Repository Helpers
export const MatchRepo = {
  upsert(match) {
    const existing = db
      .prepare(`SELECT id FROM matches WHERE lost_report_id = ? AND found_report_id = ?`)
      .get(match.lost_report_id, match.found_report_id);

    if (existing) {
      db.prepare(`
        UPDATE matches SET
          confidence_score = ?,
          vector_score = ?,
          metadata_score = ?,
          location_score = ?,
          time_score = ?,
          explanation = ?,
          status = CASE WHEN status = 'dismissed' THEN status ELSE ? END,
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        match.confidence_score,
        match.vector_score,
        match.metadata_score,
        match.location_score,
        match.time_score,
        match.explanation,
        match.status || 'suggested',
        existing.id
      );
      return this.findById(existing.id);
    } else {
      db.prepare(`
        INSERT INTO matches (
          id, lost_report_id, found_report_id, confidence_score,
          vector_score, metadata_score, location_score, time_score,
          explanation, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')), datetime('now'))
      `).run(
        match.id,
        match.lost_report_id,
        match.found_report_id,
        match.confidence_score,
        match.vector_score,
        match.metadata_score,
        match.location_score,
        match.time_score,
        match.explanation,
        match.status || 'suggested',
        match.created_at || null
      );
      return this.findById(match.id);
    }
  },

  findById(id) {
    const row = db.prepare(`SELECT * FROM matches WHERE id = ?`).get(id);
    return row || null;
  },

  findByPair(lostId, foundId) {
    const row = db
      .prepare(`SELECT * FROM matches WHERE lost_report_id = ? AND found_report_id = ?`)
      .get(lostId, foundId);
    return row || null;
  },

  findForReport(reportId, minConfidence = 0) {
    const rows = db.prepare(`
      SELECT m.*,
        r_lost.title as lost_title, r_lost.category as lost_category, r_lost.photo_url as lost_photo,
        r_lost.location_name as lost_location, r_lost.location_spot as lost_spot, r_lost.date_time as lost_date, r_lost.status as lost_status,
        r_found.title as found_title, r_found.category as found_category, r_found.photo_url as found_photo,
        r_found.location_name as found_location, r_found.location_spot as found_spot, r_found.date_time as found_date, r_found.status as found_status
      FROM matches m
      JOIN reports r_lost ON m.lost_report_id = r_lost.id
      JOIN reports r_found ON m.found_report_id = r_found.id
      WHERE (m.lost_report_id = ? OR m.found_report_id = ?)
        AND m.confidence_score >= ?
        AND m.status != 'dismissed'
      ORDER BY m.confidence_score DESC
    `).all(reportId, reportId, minConfidence);

    return rows;
  },

  findAllHighConfidence(minConfidence = 60) {
    const rows = db.prepare(`
      SELECT m.*,
        r_lost.title as lost_title, r_lost.description as lost_desc, r_lost.category as lost_category,
        r_lost.photo_url as lost_photo, r_lost.location_name as lost_location, r_lost.location_spot as lost_spot, r_lost.date_time as lost_date,
        r_lost.contact_email as lost_email, r_lost.contact_name as lost_contact, r_lost.status as lost_status,
        r_found.title as found_title, r_found.description as found_desc, r_found.category as found_category,
        r_found.photo_url as found_photo, r_found.location_name as found_location, r_found.location_spot as found_spot, r_found.date_time as found_date,
        r_found.contact_email as found_email, r_found.contact_name as found_contact, r_found.status as found_status
      FROM matches m
      JOIN reports r_lost ON m.lost_report_id = r_lost.id
      JOIN reports r_found ON m.found_report_id = r_found.id
      WHERE m.confidence_score >= ?
      ORDER BY m.confidence_score DESC, datetime(m.created_at) DESC
    `).all(minConfidence);

    return rows;
  },

  updateStatus(id, status) {
    db.prepare(`UPDATE matches SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(
      status,
      id
    );
    return this.findById(id);
  }
};

// Notification Repository Helpers
export const NotificationRepo = {
  create(notif) {
    db.prepare(`
      INSERT INTO notifications (
        id, report_id, match_id, recipient_email, recipient_name,
        title, message, confidence_score, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')))
    `).run(
      notif.id,
      notif.report_id,
      notif.match_id,
      notif.recipient_email,
      notif.recipient_name || null,
      notif.title,
      notif.message,
      notif.confidence_score,
      notif.is_read ? 1 : 0,
      notif.created_at || null
    );

    return db.prepare(`SELECT * FROM notifications WHERE id = ?`).get(notif.id);
  },

  findAll({ limit = 50, unreadOnly = false } = {}) {
    let sql = `SELECT * FROM notifications WHERE 1=1`;
    const params = [];
    if (unreadOnly) {
      sql += ` AND is_read = 0`;
    }
    sql += ` ORDER BY datetime(created_at) DESC LIMIT ?`;
    params.push(limit);
    return db.prepare(sql).all(...params);
  },

  markAsRead(id) {
    db.prepare(`UPDATE notifications SET is_read = 1 WHERE id = ?`).run(id);
    return db.prepare(`SELECT * FROM notifications WHERE id = ?`).get(id);
  },

  markAllAsRead() {
    db.prepare(`UPDATE notifications SET is_read = 1`).run();
  }
};
