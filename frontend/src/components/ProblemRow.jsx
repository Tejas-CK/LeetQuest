const difficultyStyles = {
  Easy: 'bg-green-500/10 text-green-400',
  Medium: 'bg-yellow-500/10 text-yellow-400',
  Hard: 'bg-red-500/10 text-red-400',
};

export default function ProblemRow({ problem, onToggle }) {
  const topics = problem.topics ? problem.topics.split(',').filter(Boolean) : [];

  return (
    <div
      className={`neon-hover flex items-center gap-4 px-4 py-3 border border-transparent border-b theme-border ${
        problem.solved ? 'opacity-50' : ''
      }`}
      style={{ color: 'var(--text-primary)' }}
    >
      <input
        type="checkbox"
        checked={!!problem.solved}
        onChange={(e) => onToggle(problem.id, e.target.checked)}
        className="w-5 h-5 rounded cursor-pointer accent-current"
        style={{ accentColor: 'var(--accent)' }}
      />

      <span className="text-sm w-12 theme-text-secondary">#{problem.frontend_id}</span>

      <span
        className={`flex-1 text-sm font-medium ${
          problem.solved ? 'line-through theme-text-secondary' : ''
        }`}
      >
        {problem.title}
      </span>

      <div className="hidden md:flex gap-1 flex-wrap max-w-xs justify-end">
        {topics.slice(0, 3).map((t) => (
          <span
            key={t}
            className="text-xs px-2 py-0.5 rounded-full theme-text-secondary"
            style={{ backgroundColor: 'var(--border-color)' }}
          >
            {t}
          </span>
        ))}
      </div>

      <span
        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          difficultyStyles[problem.difficulty] || ''
        }`}
      >
        {problem.difficulty}
      </span>
    </div>
  );
}