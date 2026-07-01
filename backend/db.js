const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'leetquest.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    frontend_id INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    difficulty TEXT NOT NULL,
    topics TEXT DEFAULT '',
    solved INTEGER DEFAULT 0
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_stats (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    total_xp INTEGER DEFAULT 0
  )
`);

db.prepare(`INSERT OR IGNORE INTO user_stats (id, total_xp) VALUES (1, 0)`).run();

// reviews table: one row per (problem, interval_day) pair that has been completed
db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id INTEGER NOT NULL,
    interval_day INTEGER NOT NULL,
    reviewed_at TEXT NOT NULL,
    UNIQUE(problem_id, interval_day)
  )
`);

function columnExists(table, column) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  return cols.some((c) => c.name === column);
}

if (!columnExists('problems', 'solved_at')) {
  db.exec(`ALTER TABLE problems ADD COLUMN solved_at TEXT`);
}
if (!columnExists('user_stats', 'current_streak')) {
  db.exec(`ALTER TABLE user_stats ADD COLUMN current_streak INTEGER DEFAULT 0`);
}
if (!columnExists('user_stats', 'longest_streak')) {
  db.exec(`ALTER TABLE user_stats ADD COLUMN longest_streak INTEGER DEFAULT 0`);
}
if (!columnExists('user_stats', 'last_solve_date')) {
  db.exec(`ALTER TABLE user_stats ADD COLUMN last_solve_date TEXT`);
}

module.exports = db;