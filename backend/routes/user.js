const express = require('express');
const router = express.Router();
const db = require('../db');
const { getLevelInfo } = require('../leveling');
const { getRankForLevel } = require('../ranks');

router.get('/stats', (req, res) => {
  const row = db
    .prepare('SELECT total_xp, current_streak, longest_streak, last_solve_date FROM user_stats WHERE id = 1')
    .get();
  const totalXp = row ? row.total_xp : 0;
  const levelInfo = getLevelInfo(totalXp);
  const rankInfo = getRankForLevel(levelInfo.level);

  res.json({
    ...levelInfo,
    ...rankInfo,
    current_streak: row ? row.current_streak || 0 : 0,
    longest_streak: row ? row.longest_streak || 0 : 0,
    last_solve_date: row ? row.last_solve_date : null,
  });
});

router.post('/reset', (req, res) => {
  const { resetXp, resetStreak } = req.body || {};

  if (!resetXp && !resetStreak) {
    return res.status(400).json({ error: 'Specify resetXp and/or resetStreak' });
  }

  const resetTxn = db.transaction(() => {
    if (resetXp) {
      db.prepare('UPDATE user_stats SET total_xp = 0 WHERE id = 1').run();
      db.prepare('UPDATE problems SET solved = 0, solved_at = NULL WHERE solved = 1').run();
    }
    if (resetStreak) {
      db.prepare(
        'UPDATE user_stats SET current_streak = 0, longest_streak = 0, last_solve_date = NULL WHERE id = 1'
      ).run();
    }
  });

  resetTxn();

  const row = db
    .prepare('SELECT total_xp, current_streak, longest_streak, last_solve_date FROM user_stats WHERE id = 1')
    .get();
  const levelInfo = getLevelInfo(row.total_xp);
  const rankInfo = getRankForLevel(levelInfo.level);

  res.json({
    ...levelInfo,
    ...rankInfo,
    current_streak: row.current_streak || 0,
    longest_streak: row.longest_streak || 0,
    last_solve_date: row.last_solve_date,
  });
});

module.exports = router;