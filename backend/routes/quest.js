const express = require('express');
const router = express.Router();
const db = require('../db');

const INTERVALS = [1, 3, 7, 14]; // days after solving when a review is due
const REVIEW_XP = { Easy: 5, Medium: 10, Hard: 20 };
const DAILY_CAP = 10;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Returns how many days ago `isoStr` was (0 = today, 1 = yesterday, etc.)
function daysAgo(isoStr) {
  const solved = new Date(isoStr.slice(0, 10) + 'T00:00:00Z');
  const now = new Date(todayStr() + 'T00:00:00Z');
  return Math.round((now - solved) / 86400000);
}

// GET /quest/today
// Returns up to DAILY_CAP problems that are due for review.
// A problem is due at interval N if:
//   - it was solved >= N days ago
//   - it has NOT been reviewed at interval N yet
// If multiple intervals are due for the same problem, we pick the smallest
// pending one (so you always review in order: 1 → 3 → 7 → 14).
router.get('/today', (req, res) => {
  const today = todayStr();

  // All solved problems with a timestamp
  const solved = db
    .prepare(`SELECT id, title, slug, difficulty, topics, solved_at FROM problems WHERE solved = 1 AND solved_at IS NOT NULL`)
    .all();

  // All completed reviews
  const doneRows = db.prepare(`SELECT problem_id, interval_day FROM reviews`).all();
  const done = new Set(doneRows.map((r) => `${r.problem_id}:${r.interval_day}`));

  const due = [];

  for (const p of solved) {
    const age = daysAgo(p.solved_at);

    // Find the smallest interval that is due and not yet reviewed
    for (const interval of INTERVALS) {
      if (age >= interval && !done.has(`${p.id}:${interval}`)) {
        due.push({
          id: p.id,
          title: p.title,
          slug: p.slug,
          difficulty: p.difficulty,
          topics: p.topics,
          solved_at: p.solved_at,
          due_interval: interval, // which review phase this is (1/3/7/14)
          days_since_solve: age,
        });
        break; // only the earliest pending interval per problem
      }
    }

    if (due.length >= DAILY_CAP) break;
  }

  // Summary counts for the UI
  const totalDue = due.length; // already capped
  res.json({ problems: due, total_due: totalDue, cap: DAILY_CAP, date: today });
});

// POST /quest/review/:id
// Marks a problem as reviewed for its current due interval and awards bonus XP.
// Body: { interval_day: N }  (client sends back the due_interval from GET /quest/today)
router.post('/review/:id', (req, res) => {
  const problemId = parseInt(req.params.id, 10);
  const { interval_day } = req.body;

  if (!INTERVALS.includes(interval_day)) {
    return res.status(400).json({ error: `interval_day must be one of ${INTERVALS.join(', ')}` });
  }

  const problem = db.prepare(`SELECT * FROM problems WHERE id = ?`).get(problemId);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const alreadyDone = db
    .prepare(`SELECT id FROM reviews WHERE problem_id = ? AND interval_day = ?`)
    .get(problemId, interval_day);

  if (alreadyDone) {
    return res.status(409).json({ error: 'Already reviewed at this interval' });
  }

  const xpBonus = REVIEW_XP[problem.difficulty] || 0;
  const reviewedAt = new Date().toISOString();

  const txn = db.transaction(() => {
    db.prepare(
      `INSERT INTO reviews (problem_id, interval_day, reviewed_at) VALUES (?, ?, ?)`
    ).run(problemId, interval_day, reviewedAt);

    db.prepare(
      `UPDATE user_stats SET total_xp = total_xp + ? WHERE id = 1`
    ).run(xpBonus);
  });

  txn();

  const updatedStats = db.prepare(`SELECT total_xp FROM user_stats WHERE id = 1`).get();

  res.json({
    reviewed: true,
    problem_id: problemId,
    interval_day,
    xp_awarded: xpBonus,
    total_xp: updatedStats.total_xp,
  });
});

// GET /quest/stats
// Overall review completion stats for the Profile/Quest tab.
router.get('/stats', (req, res) => {
  const totalReviews = db.prepare(`SELECT COUNT(*) AS count FROM reviews`).get().count;
  const byInterval = {};
  for (const iv of INTERVALS) {
    byInterval[iv] = db
      .prepare(`SELECT COUNT(*) AS count FROM reviews WHERE interval_day = ?`)
      .get(iv).count;
  }
  res.json({ total_reviews: totalReviews, by_interval: byInterval });
});

module.exports = router;