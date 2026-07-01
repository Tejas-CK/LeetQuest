// Run with: node seed.js
const fs = require('fs');
const path = require('path');
const db = require('./db');

const DATA_PATH = path.join(__dirname, 'data', 'merged_problems.json');
const MAX_FRONTEND_ID = 2000; // set to null if you want ALL problems, not just #1-2000

function seed() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`ERROR: ${DATA_PATH} not found.`);
    console.error('Make sure merged_problems.json is in backend/data/');
    return;
  }
  const rawData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const rawProblems = rawData.questions; // dataset wraps the array in a "questions" key

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO problems (frontend_id, title, slug, difficulty, topics, solved)
    VALUES (?, ?, ?, ?, ?, 0)
  `);

  let inserted = 0;
  let skipped = 0;

  const insertMany = db.transaction((problems) => {
    for (const p of problems) {
      const frontendId = parseInt(p.frontend_id, 10);

      if (isNaN(frontendId)) {
        skipped++;
        continue;
      }
      if (MAX_FRONTEND_ID && frontendId > MAX_FRONTEND_ID) {
        continue;
      }
      if (!p.difficulty || !p.title || !p.problem_slug) {
        skipped++;
        continue;
      }

      const topicsStr = Array.isArray(p.topics) ? p.topics.join(',') : '';

      const result = insertStmt.run(
        frontendId,
        p.title,
        p.problem_slug,
        p.difficulty,
        topicsStr
      );

      if (result.changes > 0) inserted++;
    }
  });

  insertMany(rawProblems);

  console.log(`Done. Inserted: ${inserted}, Skipped (bad/duplicate data): ${skipped}`);
}

seed();