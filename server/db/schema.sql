-- Schema for Smart Campus Lost & Found Database (SQLite with vector/JSON embedding compatibility)

CREATE TABLE IF NOT EXISTS campus_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  shortName TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  zone TEXT NOT NULL,
  color TEXT,
  description TEXT,
  popular_spots TEXT, -- JSON array of common spots in this building e.g. ["2nd Floor Quiet Stacks", "Main Lobby Desk"]
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  photo_url TEXT,
  extracted_attributes TEXT, -- JSON string: { item_type, color, brand, material, unique_marks, condition }
  location_name TEXT NOT NULL,
  location_spot TEXT, -- Specific spot e.g. "Room 204", "Table 14 by reference desks", "Locker room B"
  location_lat REAL NOT NULL,
  location_lng REAL NOT NULL,
  location_zone TEXT,
  date_time TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'resolved', 'cancelled')),
  embedding TEXT, -- JSON string representation of float array vector
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  lost_report_id TEXT NOT NULL,
  found_report_id TEXT NOT NULL,
  confidence_score INTEGER NOT NULL, -- 0 to 100
  vector_score REAL NOT NULL,
  metadata_score REAL NOT NULL,
  location_score REAL NOT NULL,
  time_score REAL NOT NULL,
  explanation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'confirmed', 'dismissed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (lost_report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (found_report_id) REFERENCES reports(id) ON DELETE CASCADE,
  UNIQUE(lost_report_id, found_report_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_lost ON matches(lost_report_id);
CREATE INDEX IF NOT EXISTS idx_matches_found ON matches(found_report_id);
CREATE INDEX IF NOT EXISTS idx_matches_confidence ON matches(confidence_score);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  match_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  confidence_score INTEGER NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_email);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
