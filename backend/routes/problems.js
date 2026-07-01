const express = require('express');
const router = express.Router();
const db = require('../db');
const { xpForDifficulty } = require('../leveling');

// GET /problems  - list problems with optional filters
// query params: difficulty, topic, solved (true/false), search, limit, offset
router.get('/', (req, res) => {
  const { difficulty, topic, solved, search } = req.query;
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const offset = parseInt(req.query.offset, 10) || 0;

  let query = 'SELECT * FROM problems WHERE 1=1';
  const params = [];

  if (difficulty) {
    query += ' AND difficulty = ?';
    params.push(difficulty);
  }
  if (topic) {
    query += ' AND topics LIKE ?';
    params.push(`%${topic}%`);
  }
  if (solved !== undefined) {
    query += ' AND solved = ?';
    params.push(solved === 'true' ? 1 : 0);
  }
  if (search) {
    query += ' AND title LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY frontend_id LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const problems = db.prepare(query).all(...params);
  res.json(problems);
});

// Helper: today's date as YYYY-MM-DD (local server date)
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const d1 = new Date(a + 'T00:00:00Z');
  const d2 = new Date(b + 'T00:00:00Z');
  return Math.round((d2 - d1) / 86400000);
}

// Bump the streak when a solve happens "today". Purely solve-event based:
// unsolving never decrements the streak.
function registerSolveForStreak() {
  const today = todayStr();
  const stats = db.prepare('SELECT * FROM user_stats WHERE id = 1').get();

  let { current_streak, longest_streak, last_solve_date } = stats;
  current_streak = current_streak || 0;
  longest_streak = longest_streak || 0;

  if (last_solve_date === today) {
    // already counted today, no change
  } else if (last_solve_date && daysBetween(last_solve_date, today) === 1) {
    // consecutive day
    current_streak += 1;
  } else {
    // gap (or first ever solve) - streak restarts at 1
    current_streak = 1;
  }

  if (current_streak > longest_streak) {
    longest_streak = current_streak;
  }

  db.prepare(
    `UPDATE user_stats SET current_streak = ?, longest_streak = ?, last_solve_date = ? WHERE id = 1`
  ).run(current_streak, longest_streak, today);
}

// PATCH /problems/:id  - toggle solved status, awards/revokes XP accordingly
// body: { solved: true/false }
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { solved } = req.body;

  if (typeof solved !== 'boolean') {
    return res.status(400).json({ error: 'solved must be a boolean' });
  }

  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(id);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  const wasSolved = !!problem.solved;
  const xpValue = xpForDifficulty(problem.difficulty);

  const updateTxn = db.transaction(() => {
    const solvedAt = solved ? new Date().toISOString() : null;
    db.prepare('UPDATE problems SET solved = ?, solved_at = ? WHERE id = ?').run(
      solved ? 1 : 0,
      solvedAt,
      id
    );

    // Only adjust XP if the solved state actually changed (avoids double-award on repeat calls)
    if (solved && !wasSolved) {
      db.prepare('UPDATE user_stats SET total_xp = total_xp + ? WHERE id = 1').run(xpValue);
      registerSolveForStreak();
    } else if (!solved && wasSolved) {
      db.prepare(
        'UPDATE user_stats SET total_xp = MAX(0, total_xp - ?) WHERE id = 1'
      ).run(xpValue);
      // streak is purely solve-event based - unsolving does NOT touch the streak
    }
  });

  updateTxn();

  const updated = db.prepare('SELECT * FROM problems WHERE id = ?').get(id);
  res.json(updated);
});

// GET /problems/stats/summary  - overall + per-difficulty solve counts
router.get('/stats/summary', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS count FROM problems').get().count;
  const solved = db
    .prepare('SELECT COUNT(*) AS count FROM problems WHERE solved = 1')
    .get().count;

  const byDifficulty = {};
  for (const diff of ['Easy', 'Medium', 'Hard']) {
    const totalD = db
      .prepare('SELECT COUNT(*) AS count FROM problems WHERE difficulty = ?')
      .get(diff).count;
    const solvedD = db
      .prepare('SELECT COUNT(*) AS count FROM problems WHERE difficulty = ? AND solved = 1')
      .get(diff).count;
    byDifficulty[diff] = { total: totalD, solved: solvedD };
  }

  res.json({ total, solved, by_difficulty: byDifficulty });
});

// GET /problems/stats/heatmap  - solve counts per day, for the activity calendar
// returns: [{ date: 'YYYY-MM-DD', count: N }, ...]
router.get('/stats/heatmap', (req, res) => {
  const rows = db
    .prepare(
      `SELECT substr(solved_at, 1, 10) AS date, COUNT(*) AS count
       FROM problems
       WHERE solved_at IS NOT NULL
       GROUP BY date
       ORDER BY date`
    )
    .all();
  res.json(rows);
});

module.exports = router;