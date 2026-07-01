import { useState, useEffect, useCallback } from 'react';
import QuestTab from './components/QuestTab';
import StatsHeader from './components/StatsHeader';
import RankCard from './components/RankCard';
import FilterBar from './components/FilterBar';
import ProblemList from './components/ProblemList';
import ActivityHeatmap from './components/ActivityHeatmap';
import { fetchProblems, toggleSolved, fetchStats, fetchUserStats, fetchHeatmap } from './api';

const TABS = ['Problems', 'Quests', 'Ranks', 'Profile'];

// ─── Ranks Tab ───────────────────────────────────────────────────────────────
const TIERS = [
  'Rookie','Novice','Apprentice','Solver','Analyst','Expert','Master',
  'Grandmaster','Legend','Mythic','Elite','Immortal','Transcendent',
];
const DIVISIONS = ['V','IV','III','II','I'];

const tierColors = {
  Rookie:'#9ca3af', Novice:'#60a5fa', Apprentice:'#34d399', Solver:'#a3e635',
  Analyst:'#facc15', Expert:'#fb923c', Master:'#f87171', Grandmaster:'#f472b6',
  Legend:'#c084fc', Mythic:'#818cf8', Elite:'#22d3ee', Immortal:'#2dd4bf',
  Transcendent:'#ffffff',
};

function xpRequiredForLevel(level) {
  if (level <= 1) return 0;
  return Math.round(100 * Math.pow(level, 1.5));
}

// Build a flat list of all 65 ranks with the XP required to reach each one.
const ALL_RANKS = TIERS.flatMap((tier, ti) =>
  DIVISIONS.map((div, di) => {
    const level = ti * DIVISIONS.length + di + 1; // 1-indexed
    return {
      tier,
      division: div,
      label: `${tier} ${div}`,
      level,
      xp_required: xpRequiredForLevel(level),
      color: tierColors[tier],
    };
  })
);

function RanksTab({ userStats }) {
  const currentLevel = userStats?.level ?? 1;
  const currentXp = userStats?.total_xp ?? 0;
  const currentTier = userStats?.tier ?? null;
  const rc = tierColors[currentTier] || 'var(--accent)';

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">

      {/* Hero: current rank */}
      <div
        className="theme-card rounded-xl border p-6 flex flex-col gap-3"
        style={{ color: 'var(--text-primary)', borderColor: `${rc}44` }}
      >
        <div className="text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-1">
          Current Rank
        </div>
        {userStats ? (
          <>
            <div className="flex items-center gap-4">
              <span
                className="text-2xl font-bold px-4 py-1.5 rounded-full"
                style={{
                  color: rc,
                  backgroundColor: `${rc}1a`,
                  border: `1px solid ${rc}66`,
                  boxShadow: `0 0 20px -4px ${rc}`,
                }}
              >
                {userStats.rank_label}
              </span>
              <span className="text-sm" style={{ color: rc, opacity: 0.7 }}>
                Level {userStats.level}
              </span>
            </div>

            <div
              className="w-full rounded-full h-2 overflow-hidden"
              style={{ backgroundColor: 'var(--border-color)' }}
            >
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${userStats.is_max_rank ? 100 : userStats.progress_pct}%`,
                  backgroundColor: rc,
                  boxShadow: `0 0 10px ${rc}`,
                }}
              />
            </div>

            <div className="text-xs theme-text-secondary">
              {userStats.is_max_rank
                ? 'Max rank reached — you are a legend.'
                : `${userStats.xp_into_level} / ${userStats.xp_needed_for_next_level} XP to next level · ${currentXp.toLocaleString()} XP total`}
            </div>
          </>
        ) : (
          <span className="theme-text-secondary text-sm">Loading…</span>
        )}
      </div>

      {/* All ranks list — grouped by tier */}
      <div
        className="theme-card rounded-xl border overflow-hidden"
        style={{ color: 'var(--text-primary)' }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-xs font-semibold theme-text-secondary uppercase tracking-wider">
            All Ranks
          </span>
        </div>

        {TIERS.map((tier) => {
          const tc = tierColors[tier];
          const tierRanks = ALL_RANKS.filter((r) => r.tier === tier);
          const isCurrentTier = tier === currentTier;

          return (
            <div key={tier}>
              {/* Tier separator header */}
              <div
                className="flex items-center gap-2 px-4 py-1.5"
                style={{
                  backgroundColor: `${tc}0d`,
                  borderTop: `1px solid ${tc}22`,
                  borderBottom: `1px solid ${tc}22`,
                }}
              >
                <div
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    backgroundColor: tc,
                    boxShadow: `0 0 6px ${tc}`,
                    flexShrink: 0,
                  }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: tc }}
                >
                  {tier}
                </span>
              </div>

              {/* Ranks within tier */}
              {tierRanks.map((rank) => {
                const isCurrent = rank.level === currentLevel;
                const isUnlocked = currentXp >= rank.xp_required;

                return (
                  <div
                    key={rank.label}
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{
                      backgroundColor: isCurrent ? `${tc}12` : 'transparent',
                      borderBottom: `1px solid var(--border-color)`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 7, height: 7, borderRadius: '50%',
                          backgroundColor: isUnlocked ? tc : 'var(--border-color)',
                          boxShadow: isUnlocked ? `0 0 6px ${tc}` : 'none',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: isCurrent ? tc : isUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)',
                        }}
                      >
                        {rank.label}
                      </span>
                      {isCurrent && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            color: tc,
                            backgroundColor: `${tc}22`,
                            border: `1px solid ${tc}44`,
                          }}
                        >
                          current
                        </span>
                      )}
                    </div>
                    <span className="text-xs theme-text-secondary">
                      {rank.xp_required === 0 ? '0 XP' : `${rank.xp_required.toLocaleString()} XP`}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────
function ProfileTab({ userStats, stats, onReset }) {
  const [confirming, setConfirming] = useState(null);

  const handleReset = async (type) => {
    if (confirming !== type) { setConfirming(type); return; }
    setConfirming(null);
    await onReset(type);
  };

  const rc = tierColors[userStats?.tier] || 'var(--accent)';

  // Friendly date formatter
  function friendlyDate(iso) {
    if (!iso) return 'Never';
    const d = new Date(iso + 'T00:00:00');
    const today = new Date(); today.setHours(0,0,0,0);
    const diff = Math.round((today - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return d.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const bd = stats?.by_difficulty || {};

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4">

      {/* Compact rank card — sits above the stat grid */}
      <RankCard userStats={userStats} compact />

      {/* Stat grid — 2×3 */}
      <div className="grid grid-cols-2 gap-3">

        {/* Total XP */}
        <div className="theme-card rounded-xl border p-4 flex flex-col gap-1"
          style={{ borderColor: `${rc}33` }}>
          <span className="text-xs theme-text-secondary uppercase tracking-wider">Total XP</span>
          <span className="text-2xl font-bold" style={{ color: rc }}>
            {(userStats?.total_xp ?? 0).toLocaleString()}
          </span>
          <span className="text-xs theme-text-secondary">Level {userStats?.level ?? 1}</span>
        </div>

        {/* Day streak */}
        <div className="theme-card rounded-xl border p-4 flex flex-col gap-1">
          <span className="text-xs theme-text-secondary uppercase tracking-wider">Day Streak</span>
          <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
            {userStats?.current_streak ?? 0}d
          </span>
          <span className="text-xs theme-text-secondary">
            Best: {userStats?.longest_streak ?? 0}d
          </span>
        </div>

        {/* Last active */}
        <div className="theme-card rounded-xl border p-4 flex flex-col gap-1">
          <span className="text-xs theme-text-secondary uppercase tracking-wider">Last Active</span>
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {friendlyDate(userStats?.last_solve_date)}
          </span>
        </div>

        {/* Total solved */}
        <div className="theme-card rounded-xl border p-4 flex flex-col gap-1">
          <span className="text-xs theme-text-secondary uppercase tracking-wider">Solved</span>
          <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
            {stats?.solved ?? 0}
            <span className="text-sm font-normal theme-text-secondary"> / {stats?.total ?? 0}</span>
          </span>
          <div className="flex gap-2 text-xs mt-0.5">
            <span style={{ color: '#34d399' }}>E {bd.Easy?.solved ?? 0}</span>
            <span style={{ color: '#facc15' }}>M {bd.Medium?.solved ?? 0}</span>
            <span style={{ color: '#f87171' }}>H {bd.Hard?.solved ?? 0}</span>
          </div>
        </div>

        {/* Easy breakdown */}
        <div className="theme-card rounded-xl border p-4 flex flex-col gap-1"
          style={{ borderColor: '#34d39933' }}>
          <span className="text-xs uppercase tracking-wider" style={{ color: '#34d399' }}>Easy</span>
          <span className="text-2xl font-bold" style={{ color: '#34d399' }}>
            {bd.Easy?.solved ?? 0}
            <span className="text-sm font-normal theme-text-secondary"> / {bd.Easy?.total ?? 0}</span>
          </span>
          <div className="w-full rounded-full h-1.5 overflow-hidden mt-1"
            style={{ backgroundColor: 'var(--border-color)' }}>
            <div className="h-1.5 rounded-full" style={{
              width: `${bd.Easy?.total ? Math.round((bd.Easy.solved / bd.Easy.total) * 100) : 0}%`,
              backgroundColor: '#34d399',
            }} />
          </div>
        </div>

        {/* Medium breakdown */}
        <div className="theme-card rounded-xl border p-4 flex flex-col gap-1"
          style={{ borderColor: '#facc1533' }}>
          <span className="text-xs uppercase tracking-wider" style={{ color: '#facc15' }}>Medium</span>
          <span className="text-2xl font-bold" style={{ color: '#facc15' }}>
            {bd.Medium?.solved ?? 0}
            <span className="text-sm font-normal theme-text-secondary"> / {bd.Medium?.total ?? 0}</span>
          </span>
          <div className="w-full rounded-full h-1.5 overflow-hidden mt-1"
            style={{ backgroundColor: 'var(--border-color)' }}>
            <div className="h-1.5 rounded-full" style={{
              width: `${bd.Medium?.total ? Math.round((bd.Medium.solved / bd.Medium.total) * 100) : 0}%`,
              backgroundColor: '#facc15',
            }} />
          </div>
        </div>

        {/* Hard breakdown — full width */}
        <div className="col-span-2 theme-card rounded-xl border p-4 flex flex-col gap-1"
          style={{ borderColor: '#f8717133' }}>
          <span className="text-xs uppercase tracking-wider" style={{ color: '#f87171' }}>Hard</span>
          <span className="text-2xl font-bold" style={{ color: '#f87171' }}>
            {bd.Hard?.solved ?? 0}
            <span className="text-sm font-normal theme-text-secondary"> / {bd.Hard?.total ?? 0}</span>
          </span>
          <div className="w-full rounded-full h-1.5 overflow-hidden mt-1"
            style={{ backgroundColor: 'var(--border-color)' }}>
            <div className="h-1.5 rounded-full" style={{
              width: `${bd.Hard?.total ? Math.round((bd.Hard.solved / bd.Hard.total) * 100) : 0}%`,
              backgroundColor: '#f87171',
            }} />
          </div>
        </div>
      </div>

      {/* Debug resets */}
      <div className="theme-card rounded-xl border p-4 flex flex-col gap-3"
        style={{ borderColor: '#ef444433' }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#ef4444' }}>
          ⚠ Debug Resets
        </span>

        {[
          { key: 'xp', label: 'Reset XP & Rank', warn: 'Zeroes total XP, level, and unsolves all problems.' },
          { key: 'streak', label: 'Reset Streak', warn: 'Clears current streak, longest streak, and last solve date.' },
        ].map(({ key, label, warn }) => (
          <div key={key} className="flex flex-col gap-1">
            <button
              onClick={() => handleReset(key)}
              className="text-sm px-4 py-2 rounded-lg border font-medium transition-all"
              style={
                confirming === key
                  ? { backgroundColor: '#ef444422', borderColor: '#ef4444', color: '#ef4444' }
                  : { backgroundColor: 'transparent', borderColor: '#ef444444', color: '#ef4444', opacity: 0.7 }
              }
            >
              {confirming === key ? `Confirm: ${label}` : label}
            </button>
            {confirming === key && (
              <span className="text-xs" style={{ color: '#ef4444', opacity: 0.8 }}>{warn}</span>
            )}
          </div>
        ))}

        {confirming && (
          <button onClick={() => setConfirming(null)}
            className="text-xs theme-text-secondary underline self-start">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [tab, setTab] = useState('Problems');
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ limit: 2000 });
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const loadProblems = useCallback(async () => {
    setLoading(true);
    try { setProblems(await fetchProblems(filters)); }
    catch (err) { console.error('Failed to fetch problems:', err); }
    finally { setLoading(false); }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try { setStats(await fetchStats()); }
    catch (err) { console.error('Failed to fetch stats:', err); }
  }, []);

  const loadUserStats = useCallback(async () => {
    try { setUserStats(await fetchUserStats()); }
    catch (err) { console.error('Failed to fetch user stats:', err); }
  }, []);

  const loadHeatmap = useCallback(async () => {
    try { setHeatmap(await fetchHeatmap()); }
    catch (err) { console.error('Failed to fetch heatmap:', err); }
  }, []);

  useEffect(() => { loadProblems(); }, [loadProblems]);
  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadUserStats(); }, [loadUserStats]);
  useEffect(() => { loadHeatmap(); }, [loadHeatmap]);

  const handleToggle = async (id, solved) => {
    setProblems((prev) => prev.map((p) => (p.id === id ? { ...p, solved } : p)));
    try {
      await toggleSolved(id, solved);
      loadStats();
      loadUserStats();
      loadHeatmap();
    } catch (err) {
      console.error('Failed to update problem:', err);
      loadProblems();
    }
  };

  const handleReset = async (type) => {
    const { resetUser } = await import('./api');
    await resetUser({ resetXp: type === 'xp', resetStreak: type === 'streak' });
    loadStats();
    loadUserStats();
    loadHeatmap();
    if (type === 'xp') loadProblems(); // problems got unsolved
  };

  return (
    <div className="min-h-screen py-6 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* ── Global header ── */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          {/* Logo / title */}
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: 'var(--accent)', textShadow: '0 0 16px var(--accent)' }}
          >
            LeetQuest
          </span>

          {/* Tab nav */}
          <nav className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                className={`tab-btn${tab === t ? ' active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </nav>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="theme-card neon-hover text-sm px-3 py-1.5 rounded-lg border"
            style={{ color: 'var(--text-primary)' }}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      {/* ── Problems tab ── */}
      {tab === 'Problems' && (
        <div className="max-w-7xl mx-auto flex flex-col gap-4">

          {/* Top row: compact RankCard  |  StatsHeader  |  Heatmap */}
          <div className="grid gap-4" style={{ gridTemplateColumns: '200px 1fr 340px' }}>
            <RankCard userStats={userStats} compact />
            <StatsHeader stats={stats} />
            <ActivityHeatmap heatmapData={heatmap} />
          </div>

          {/* FilterBar: full-width strip */}
          <FilterBar filters={filters} setFilters={setFilters} />

          {/* Problem list */}
          <ProblemList problems={problems} loading={loading} onToggle={handleToggle} />
        </div>
      )}

      {tab === 'Quest' && (
        <div className="max-w-7xl mx-auto">
          <QuestTab onXpChanged={() => { loadUserStats(); loadStats(); }} />
        </div>
      )}

      {/* ── Ranks tab ── */}
      {tab === 'Ranks' && (
        <RanksTab userStats={userStats} />
      )}

      {/* ── Profile tab ── */}
      {tab === 'Profile' && (
        <ProfileTab userStats={userStats} stats={stats} onReset={handleReset} />
      )}
    </div>
  );
}

export default App;