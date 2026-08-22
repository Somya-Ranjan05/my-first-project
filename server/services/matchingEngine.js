import { AIProvider } from './aiProvider.js';
import { MatchRepo, ReportRepo, NotificationRepo } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Tunable Matching Weights (sum to 1.0)
 */
export const MATCHING_WEIGHTS = {
  VECTOR_SIMILARITY: 0.40,
  METADATA_MATCH: 0.25,
  LOCATION_PROXIMITY: 0.20,
  TIME_PROXIMITY: 0.15,
};

export const NOTIFICATION_CONFIDENCE_THRESHOLD = 75; // Trigger alert if confidence >= 75%

/**
 * Compatible cross-category groupings
 */
const CATEGORY_COMPATIBILITY = {
  electronics: ['accessories', 'electronics'],
  accessories: ['electronics', 'clothing', 'accessories'],
  bag: ['sports', 'bag'],
  clothing: ['accessories', 'clothing'],
  keys: ['keys'],
  id_card: ['id_card', 'accessories'],
  water_bottle: ['water_bottle', 'sports'],
  books: ['books'],
  sports: ['bag', 'water_bottle', 'sports'],
  other: ['electronics', 'bag', 'id_card', 'clothing', 'keys', 'accessories', 'books', 'water_bottle', 'sports', 'other']
};

/**
 * Calculate Cosine Similarity between two numerical vectors
 */
export function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || !Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length) {
    return 0.0;
  }

  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0.0;

  const similarity = dotProduct / (normA * normB);
  return Math.max(0.0, Math.min(1.0, similarity));
}

/**
 * Calculate Haversine distance in meters between two lat/lng points
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate Location Proximity Score (0.0 to 1.0)
 */
export function calculateLocationScore(repA, repB) {
  if (repA.location_name && repB.location_name && repA.location_name.toLowerCase() === repB.location_name.toLowerCase()) {
    return 1.0;
  }

  const sameZone = repA.location_zone && repB.location_zone && repA.location_zone.toLowerCase() === repB.location_zone.toLowerCase();

  if (repA.location_lat && repA.location_lng && repB.location_lat && repB.location_lng) {
    const distanceMeters = calculateDistanceMeters(
      repA.location_lat,
      repA.location_lng,
      repB.location_lat,
      repB.location_lng
    );

    let score = 0.0;
    if (distanceMeters <= 50) score = 1.0;
    else if (distanceMeters <= 200) score = 0.9 - (distanceMeters - 50) / 750;
    else if (distanceMeters <= 600) score = 0.7 - (distanceMeters - 200) / 1333;
    else if (distanceMeters <= 1500) score = 0.4 - (distanceMeters - 600) / 3000;
    else score = 0.1;

    if (sameZone) {
      score = Math.min(1.0, score + 0.15);
    }
    return Math.max(0.0, Math.min(1.0, score));
  }

  return sameZone ? 0.75 : 0.3;
}

/**
 * Calculate Time Proximity Score (0.0 to 1.0)
 */
export function calculateTimeScore(repA, repB) {
  const timeA = new Date(repA.date_time).getTime();
  const timeB = new Date(repB.date_time).getTime();

  if (isNaN(timeA) || isNaN(timeB)) return 0.5;

  const deltaHours = Math.abs(timeA - timeB) / (1000 * 60 * 60);

  if (deltaHours <= 6) return 1.0;
  if (deltaHours <= 24) return 0.92;
  if (deltaHours <= 48) return 0.82;
  if (deltaHours <= 168) return 0.65;
  if (deltaHours <= 720) return 0.40;

  return 0.15;
}

/**
 * Calculate Metadata & Visual Attributes Similarity Score (0.0 to 1.0)
 */
export function calculateMetadataScore(repA, repB) {
  let score = 0;
  let totalWeight = 0;

  const catA = repA.category || 'other';
  const catB = repB.category || 'other';

  // 1. Category match (Weight: 45)
  totalWeight += 45;
  if (catA === catB) {
    score += 45;
  } else if (
    CATEGORY_COMPATIBILITY[catA]?.includes(catB) ||
    CATEGORY_COMPATIBILITY[catB]?.includes(catA)
  ) {
    score += 15;
  } else {
    score += 0; // Hard category mismatch
  }

  const attrA = repA.extracted_attributes || {};
  const attrB = repB.extracted_attributes || {};

  // 2. Color overlap (Weight: 25)
  totalWeight += 25;
  const colorA = (attrA.color || '').toLowerCase().trim();
  const colorB = (attrB.color || '').toLowerCase().trim();
  if (colorA && colorB) {
    if (colorA === colorB) {
      score += 25;
    } else if (colorA.includes(colorB) || colorB.includes(colorA)) {
      score += 20;
    } else {
      const wordsA = colorA.split(/\s+/);
      const wordsB = colorB.split(/\s+/);
      const common = wordsA.filter((w) => wordsB.includes(w) && w.length > 2);
      if (common.length > 0) score += 15;
    }
  } else {
    score += 8;
  }

  // 3. Brand match (Weight: 18)
  totalWeight += 18;
  const brandA = (attrA.brand || '').toLowerCase().trim();
  const brandB = (attrB.brand || '').toLowerCase().trim();
  if (brandA && brandB) {
    if (brandA === brandB || brandA.includes(brandB) || brandB.includes(brandA)) {
      score += 18;
    } else {
      score += 0; // Distinct conflicting brands
    }
  } else {
    score += 7;
  }

  // 4. Unique marks (Weight: 12)
  totalWeight += 12;
  const marksA = (attrA.unique_marks || '').toLowerCase().trim();
  const marksB = (attrB.unique_marks || '').toLowerCase().trim();
  if (marksA && marksB) {
    if (marksA === marksB || marksA.includes(marksB) || marksB.includes(marksA)) {
      score += 12;
    } else {
      const wordsMarksA = marksA.split(/\s+/);
      const wordsMarksB = marksB.split(/\s+/);
      const commonMarks = wordsMarksA.filter((w) => wordsMarksB.includes(w) && w.length > 3);
      if (commonMarks.length > 0) score += 8;
      else score += 2;
    }
  } else {
    score += 4;
  }

  return score / totalWeight;
}

/**
 * Matching Engine Service
 */
export const MatchingEngine = {
  /**
   * Compare two reports and compute full score breakdown and weighted confidence
   */
  async computeMatch(repA, repB) {
    const lostRep = repA.type === 'lost' ? repA : repB;
    const foundRep = repA.type === 'found' ? repA : repB;

    // 1. Vector Cosine Similarity
    const vectorScore = calculateCosineSimilarity(lostRep.embedding, foundRep.embedding);

    // 2. Metadata & Attribute Score
    const metadataScore = calculateMetadataScore(lostRep, foundRep);

    // 3. Location Proximity Score
    const locationScore = calculateLocationScore(lostRep, foundRep);

    // 4. Time Proximity Score
    const timeScore = calculateTimeScore(lostRep, foundRep);

    // Category compatibility gating factor:
    // If two items have completely incompatible categories (e.g. keys vs electronics),
    // time/location proximity cannot make them a match.
    const catA = lostRep.category || 'other';
    const catB = foundRep.category || 'other';
    let categoryMultiplier = 1.0;
    if (catA !== catB && !CATEGORY_COMPATIBILITY[catA]?.includes(catB) && !CATEGORY_COMPATIBILITY[catB]?.includes(catA)) {
      categoryMultiplier = 0.35; // Strict category gating
    }

    // Weighted confidence calculation
    let weightedScore =
      (vectorScore * MATCHING_WEIGHTS.VECTOR_SIMILARITY +
        metadataScore * MATCHING_WEIGHTS.METADATA_MATCH +
        locationScore * MATCHING_WEIGHTS.LOCATION_PROXIMITY +
        timeScore * MATCHING_WEIGHTS.TIME_PROXIMITY) *
      categoryMultiplier;

    // Normalized to 0 - 100 percentage
    const confidence = Math.min(100, Math.max(0, Math.round(weightedScore * 100)));

    const breakdown = {
      confidence,
      weightedScore,
      vectorScore: parseFloat(vectorScore.toFixed(3)),
      metadataScore: parseFloat(metadataScore.toFixed(3)),
      locationScore: parseFloat(locationScore.toFixed(3)),
      timeScore: parseFloat(timeScore.toFixed(3))
    };

    // Generate LLM explanation if confidence is relevant (e.g. >= 40)
    let explanation = '';
    if (confidence >= 40) {
      explanation = await AIProvider.generateMatchExplanation(lostRep, foundRep, breakdown);
    } else {
      explanation = `Low similarity detected between ${lostRep.title} and ${foundRep.title}. Category or physical attributes do not sufficiently align.`;
    }

    return {
      id: uuidv4(),
      lost_report_id: lostRep.id,
      found_report_id: foundRep.id,
      confidence_score: confidence,
      vector_score: breakdown.vectorScore,
      metadata_score: breakdown.metadataScore,
      location_score: breakdown.locationScore,
      time_score: breakdown.timeScore,
      explanation,
      status: 'suggested'
    };
  },

  /**
   * Run matching engine for a newly created or updated report against all opposite-type reports
   */
  async processMatchesForReport(reportId) {
    const report = ReportRepo.findById(reportId);
    if (!report) return [];

    const targetType = report.type === 'lost' ? 'found' : 'lost';
    const candidates = ReportRepo.findCandidatesForReport(reportId, targetType);

    const generatedMatches = [];

    for (const candidate of candidates) {
      const matchResult = await this.computeMatch(report, candidate);

      const savedMatch = MatchRepo.upsert(matchResult);
      generatedMatches.push(savedMatch);

      if (savedMatch.confidence_score >= NOTIFICATION_CONFIDENCE_THRESHOLD) {
        await this.triggerMatchNotification(report, candidate, savedMatch);
      }
    }

    return generatedMatches.sort((a, b) => b.confidence_score - a.confidence_score);
  },

  /**
   * Trigger in-app notification & alert stubs for high confidence matches
   */
  async triggerMatchNotification(repA, repB, match) {
    const lostRep = repA.type === 'lost' ? repA : repB;
    const foundRep = repA.type === 'found' ? repA : repB;

    if (lostRep.contact_email) {
      NotificationRepo.create({
        id: uuidv4(),
        report_id: lostRep.id,
        match_id: match.id,
        recipient_email: lostRep.contact_email,
        recipient_name: lostRep.contact_name || 'Student',
        title: `🎯 High Confidence Match Found (${match.confidence_score}%)!`,
        message: `An item matching your lost "${lostRep.title}" was reported found at ${foundRep.location_name}. "${match.explanation}"`,
        confidence_score: match.confidence_score,
        is_read: 0
      });
    }

    if (foundRep.contact_email) {
      NotificationRepo.create({
        id: uuidv4(),
        report_id: foundRep.id,
        match_id: match.id,
        recipient_email: foundRep.contact_email,
        recipient_name: foundRep.contact_name || 'Finder',
        title: `🔔 Potential Owner Found (${match.confidence_score}%)!`,
        message: `A lost report matching "${foundRep.title}" was submitted: "${lostRep.title}". AI Match: "${match.explanation}"`,
        confidence_score: match.confidence_score,
        is_read: 0
      });
    }
  }
};
