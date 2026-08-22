import express from 'express';
import { seedDatabase } from '../scripts/seedData.js';
import { LocationRepo } from '../db/database.js';
import { CAMPUS_LOCATIONS } from '../db/campusLocations.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * POST /api/seed
 * 1-Click re-seed endpoint to reset & reload the rich demo dataset
 */
router.post('/', async (req, res) => {
  try {
    const result = await seedDatabase();
    res.json({
      success: true,
      message: 'Demo dataset successfully seeded and matches computed',
      result
    });
  } catch (err) {
    console.error('Error in seed route:', err);
    res.status(500).json({ error: 'Failed to seed database', details: err.message });
  }
});

/**
 * GET /api/locations
 * Returns list of campus buildings with coordinates, popular spots, and zones
 */
router.get('/locations', (req, res) => {
  try {
    const locations = LocationRepo.findAll();
    res.json({ success: true, locations: locations.length > 0 ? locations : CAMPUS_LOCATIONS });
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.json({ success: true, locations: CAMPUS_LOCATIONS });
  }
});

/**
 * POST /api/locations
 * Add a new campus building or hotspot location
 */
router.post('/locations', (req, res) => {
  try {
    const { name, shortName, lat, lng, zone, color, description, popular_spots } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Location name is required' });
    }

    const newLoc = LocationRepo.create({
      id: `loc_${Date.now()}_${Math.round(Math.random() * 1000)}`,
      name,
      shortName: shortName || name,
      lat: parseFloat(lat) || 37.4275,
      lng: parseFloat(lng) || -122.1697,
      zone: zone || 'Central Campus',
      color: color || '#6366f1',
      description: description || 'Campus facility',
      popular_spots: popular_spots || []
    });

    res.status(201).json({
      success: true,
      message: 'Campus location added successfully',
      location: newLoc
    });
  } catch (err) {
    console.error('Error adding location:', err);
    res.status(500).json({ error: 'Failed to add location', details: err.message });
  }
});

export default router;
