import express from 'express';
import { AIProvider } from '../services/aiProvider.js';
import { calculateCosineSimilarity } from '../services/matchingEngine.js';
import { ReportRepo } from '../db/database.js';

const router = express.Router();

/**
 * POST /api/search/semantic
 * Semantic search using vector cosine similarity on natural language queries
 */
router.post('/semantic', async (req, res) => {
  try {
    const { query, type, category, status } = req.body;

    if (!query || !query.trim()) {
      const allReports = ReportRepo.findAll({ type, category, status });
      return res.json({ success: true, results: allReports.map((r) => ({ ...r, similarity_score: 100 })) });
    }

    // Generate query embedding
    const queryEmbedding = await AIProvider.generateEmbedding(query);

    // Fetch candidate reports
    const reports = ReportRepo.findAll({ type, category, status });

    // Calculate semantic similarity for each report
    const scoredReports = reports.map((report) => {
      let similarity = 0;
      if (report.embedding && Array.isArray(report.embedding)) {
        similarity = calculateCosineSimilarity(queryEmbedding, report.embedding);
      } else {
        // Keyword fallback similarity
        const combined = `${report.title} ${report.description} ${report.category} ${report.location_name}`.toLowerCase();
        const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
        const matched = queryWords.filter((w) => combined.includes(w));
        similarity = queryWords.length > 0 ? matched.length / queryWords.length : 0.2;
      }

      // Percentage score 0 - 100
      const scorePct = Math.min(100, Math.max(0, Math.round(similarity * 100)));

      return {
        ...report,
        similarity_score: scorePct
      };
    });

    // Sort descending by semantic similarity score
    scoredReports.sort((a, b) => b.similarity_score - a.similarity_score);

    res.json({
      success: true,
      query,
      count: scoredReports.length,
      results: scoredReports
    });
  } catch (err) {
    console.error('Error in semantic search:', err);
    res.status(500).json({ error: 'Semantic search failed', details: err.message });
  }
});

export default router;
