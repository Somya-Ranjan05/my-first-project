import { MatchingEngine, calculateCosineSimilarity, calculateMetadataScore, calculateLocationScore, calculateTimeScore } from '../services/matchingEngine.js';
import { SAMPLE_REPORTS } from './seedData.js';
import { AIProvider } from '../services/aiProvider.js';

async function runMatchingEngineTests() {
  console.log('===========================================================');
  console.log('🧪 SMART CAMPUS LOST & FOUND - AI MATCHING ENGINE BENCHMARK');
  console.log('===========================================================\n');

  // Compute embeddings for sample reports
  const embeddedReports = [];
  for (const rep of SAMPLE_REPORTS) {
    const attrText = Object.entries(rep.extracted_attributes || {})
      .map(([k, v]) => (v ? `${k}: ${v}` : ''))
      .join(', ');
    const textToEmbed = `${rep.title}. ${rep.description}. Category: ${rep.category}. Attributes: ${attrText}. Location: ${rep.location_name}.`;
    const embedding = await AIProvider.generateEmbedding(textToEmbed);
    embeddedReports.push({ ...rep, embedding });
  }

  const lostAirPods = embeddedReports.find((r) => r.id === 'rep_lost_airpods_01');
  const foundAirPods = embeddedReports.find((r) => r.id === 'rep_found_airpods_01');
  const lostBottle = embeddedReports.find((r) => r.id === 'rep_lost_bottle_02');
  const foundBottle = embeddedReports.find((r) => r.id === 'rep_found_bottle_02');
  const lostMacBook = embeddedReports.find((r) => r.id === 'rep_lost_macbook_04');
  const foundMacBook = embeddedReports.find((r) => r.id === 'rep_found_macbook_04');
  const foundKeys = embeddedReports.find((r) => r.id === 'rep_found_keys_05');

  const testCases = [
    {
      name: 'AirPods Pro Pair (True Match)',
      lost: lostAirPods,
      found: foundAirPods,
      expectedMinConfidence: 80
    },
    {
      name: 'Hydro Flask Pair (True Match)',
      lost: lostBottle,
      found: foundBottle,
      expectedMinConfidence: 80
    },
    {
      name: 'MacBook Air Pair (True Match)',
      lost: lostMacBook,
      found: foundMacBook,
      expectedMinConfidence: 80
    },
    {
      name: 'AirPods vs Found Keys (Negative / Cross-Category Mismatch)',
      lost: lostAirPods,
      found: foundKeys,
      expectedMaxConfidence: 35
    },
    {
      name: 'Hydro Flask vs Found MacBook (Negative / Mismatch)',
      lost: lostBottle,
      found: foundMacBook,
      expectedMaxConfidence: 35
    }
  ];

  let passedCount = 0;

  for (const tc of testCases) {
    const match = await MatchingEngine.computeMatch(tc.lost, tc.found);

    console.log(`📋 Test: ${tc.name}`);
    console.log(`   - Lost: "${tc.lost.title}" (${tc.lost.location_name})`);
    console.log(`   - Found: "${tc.found.title}" (${tc.found.location_name})`);
    console.log(`   - Scores: Vector ${(match.vector_score * 100).toFixed(0)}% | Meta ${(match.metadata_score * 100).toFixed(0)}% | Loc ${(match.location_score * 100).toFixed(0)}% | Time ${(match.time_score * 100).toFixed(0)}%`);
    console.log(`   - Total Confidence: ${match.confidence_score}%`);
    console.log(`   - AI Explanation: "${match.explanation}"`);

    let passed = true;
    if (tc.expectedMinConfidence && match.confidence_score < tc.expectedMinConfidence) {
      passed = false;
      console.log(`   ❌ FAIL: Confidence ${match.confidence_score}% is lower than expected min ${tc.expectedMinConfidence}%`);
    } else if (tc.expectedMaxConfidence && match.confidence_score > tc.expectedMaxConfidence) {
      passed = false;
      console.log(`   ❌ FAIL: Confidence ${match.confidence_score}% is higher than expected max ${tc.expectedMaxConfidence}%`);
    } else {
      console.log(`   ✅ PASS`);
      passedCount++;
    }
    console.log('-----------------------------------------------------------');
  }

  console.log(`\n🎉 Results: ${passedCount} / ${testCases.length} test cases passed.`);

  if (passedCount === testCases.length) {
    console.log('🌟 Matching Engine is performing optimally with multi-signal calibration.\n');
  }
}

runMatchingEngineTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
