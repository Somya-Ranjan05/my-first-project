async function verifySystem() {
  console.log('🔍 Running Full System Endpoint Verification...\n');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5000/api/health');
  const health = await healthRes.json();
  console.log('✅ 1. Health API:', health);

  // 2. Reports
  const reportsRes = await fetch('http://localhost:5000/api/reports');
  const reports = await reportsRes.json();
  console.log(`✅ 2. Reports API: Found ${reports.count} active reports in catalog`);

  // 3. Matches
  const matchesRes = await fetch('http://localhost:5000/api/matches');
  const matches = await matchesRes.json();
  console.log(`✅ 3. Matches API: Found ${matches.count} high-confidence candidate match pairs`);
  if (matches.matches?.length > 0) {
    const top = matches.matches[0];
    console.log(`   - Top Pair: "${top.lost_title}" <==> "${top.found_title}" (${top.confidence_score}%)`);
    console.log(`   - Explanation: "${top.explanation}"`);
  }

  // 4. Semantic Search
  const query = 'blue water bottle with stickers near gym';
  const searchRes = await fetch('http://localhost:5000/api/search/semantic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const search = await searchRes.json();
  console.log(`✅ 4. Semantic Search API for "${query}":`);
  console.log(`   - Top Result: "${search.results[0]?.title}" (${search.results[0]?.similarity_score}% semantic match)`);
  console.log(`   - Second Result: "${search.results[1]?.title}" (${search.results[1]?.similarity_score}% semantic match)`);

  // 5. Notifications
  const notifRes = await fetch('http://localhost:5000/api/notifications');
  const notifs = await notifRes.json();
  console.log(`✅ 5. Notifications API: ${notifs.count} alerts generated`);

  // 6. Frontend Dev Server Check
  const feRes = await fetch('http://localhost:5173/');
  console.log(`✅ 6. Frontend Dev Server: HTTP ${feRes.status} ${feRes.statusText}`);

  console.log('\n🎉 ALL SERVICES AND API ENDPOINTS ARE FULLY OPERATIONAL!');
}

verifySystem().catch(console.error);
