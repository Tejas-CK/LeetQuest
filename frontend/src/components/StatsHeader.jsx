export default function StatsHeader({ stats }) {
  if (!stats) return null;

  const { total, solved, by_difficulty } = stats;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  const diffColors = {
    Easy: 'text-green-400',
    Medium: 'text-yellow-400',
    Hard: 'text-red-400',
  };

  return (
    <div
      className="theme-card rounded-xl shadow-sm border p-6 mb-6"
      style={{ color: 'var(--text-primary)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
          LeetQuest
        </h1>
        <span className="text-sm theme-text-secondary">
          {solved} / {total} solved ({pct}%)
        </span>
      </div>

      <div
        className="w-full rounded-full h-2.5 mb-4"
        style={{ backgroundColor: 'var(--border-color)' }}
      >
        <div
          className="h-2.5 rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: 'var(--accent)',
            boxShadow: '0 0 8px var(--accent)',
          }}
        />
      </div>

      <div className="flex gap-6 text-sm">
        {Object.entries(by_difficulty || {}).map(([diff, counts]) => (
          <div key={diff} className={`font-medium ${diffColors[diff] || ''}`}>
            {diff}: {counts.solved}/{counts.total}
          </div>
        ))}
      </div>
    </div>
  );
}