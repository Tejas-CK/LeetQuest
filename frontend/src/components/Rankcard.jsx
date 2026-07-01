const tierColors = {
  Rookie: '#9ca3af',
  Novice: '#60a5fa',
  Apprentice: '#34d399',
  Solver: '#a3e635',
  Analyst: '#facc15',
  Expert: '#fb923c',
  Master: '#f87171',
  Grandmaster: '#f472b6',
  Legend: '#c084fc',
  Mythic: '#818cf8',
  Elite: '#22d3ee',
  Immortal: '#2dd4bf',
  Transcendent: '#ffffff',
};

export default function RankCard({ userStats, compact = false }) {
  if (!userStats) return null;

  const {
    level,
    total_xp,
    xp_into_level,
    xp_needed_for_next_level,
    progress_pct,
    rank_label,
    tier,
    is_max_rank,
  } = userStats;

  const rc = tierColors[tier] || 'var(--accent)';

  if (compact) {
    return (
      <div
        className="theme-card rounded-xl border p-4 flex flex-col gap-3"
        style={{ color: 'var(--text-primary)', borderColor: `${rc}33` }}
      >
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-sm font-bold px-3 py-1 rounded-full text-center"
            style={{
              color: rc,
              backgroundColor: `${rc}1a`,
              border: `1px solid ${rc}66`,
              boxShadow: `0 0 12px -2px ${rc}`,
            }}
          >
            {rank_label}
          </span>
          <span className="text-xs mt-0.5" style={{ color: rc, opacity: 0.7 }}>
            Level {level}
          </span>
        </div>

        <div>
          <div
            className="w-full rounded-full h-1.5 overflow-hidden"
            style={{ backgroundColor: 'var(--border-color)' }}
          >
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                width: `${is_max_rank ? 100 : progress_pct}%`,
                backgroundColor: rc,
                boxShadow: `0 0 8px ${rc}`,
              }}
            />
          </div>
          <div className="text-xs mt-1 text-center" style={{ color: rc, opacity: 0.7 }}>
            {is_max_rank ? 'Max rank' : `${xp_into_level} / ${xp_needed_for_next_level} XP`}
          </div>
        </div>

        <div
          className="text-center text-xs font-semibold rounded-lg py-1"
          style={{
            backgroundColor: `${rc}11`,
            color: rc,
            border: `1px solid ${rc}33`,
          }}
        >
          {total_xp} XP total
        </div>
      </div>
    );
  }

  // Full card
  return (
    <div
      className="theme-card rounded-xl shadow-sm border p-6 mb-4"
      style={{ color: 'var(--text-primary)', borderColor: `${rc}33` }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{
              color: rc,
              backgroundColor: `${rc}1a`,
              border: `1px solid ${rc}66`,
              boxShadow: `0 0 10px -2px ${rc}`,
            }}
          >
            {rank_label}
          </span>
          <span className="text-sm" style={{ color: rc, opacity: 0.7 }}>Level {level}</span>
        </div>
        <span className="text-sm theme-text-secondary">{total_xp} XP total</span>
      </div>

      <div
        className="w-full rounded-full h-2 mt-3 overflow-hidden"
        style={{ backgroundColor: 'var(--border-color)' }}
      >
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${is_max_rank ? 100 : progress_pct}%`,
            backgroundColor: rc,
            boxShadow: `0 0 8px ${rc}`,
          }}
        />
      </div>

      <div className="flex justify-between text-xs theme-text-secondary mt-1">
        <span>
          {is_max_rank
            ? 'Max rank reached'
            : `${xp_into_level} / ${xp_needed_for_next_level} XP to next level`}
        </span>
      </div>
    </div>
  );
}