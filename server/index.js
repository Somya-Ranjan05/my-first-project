import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import reportsRouter from './routes/reports.js';
import matchesRouter from './routes/matches.js';
import searchRouter from './routes/search.js';
import notificationsRouter from './routes/notifications.js';
import seedRouter from './routes/seed.js';
import { UPLOADS_DIR } from './services/storageService.js';
import { seedDatabase } from './scripts/seedData.js';
import { ReportRepo } from './db/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory
app.use('/uploads', express.static(UPLOADS_DIR));

// API Routes
app.use('/api/reports', reportsRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/search', searchRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/seed', seedRouter);
app.use('/api', seedRouter); // For /api/locations

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Smart Campus Lost & Found API'
  });
});

// Auto-seed if database is empty on initial boot
const existing = ReportRepo.findAll();
if (existing.length === 0) {
  console.log('⚡ First run detected: Initializing database with seed data...');
  seedDatabase().catch((err) => console.error('Seed error:', err));
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Smart Campus Lost & Found Server running on http://localhost:${PORT} and http://127.0.0.1:${PORT}`);
  console.log(`📁 Uploads served from: ${UPLOADS_DIR}`);
});
