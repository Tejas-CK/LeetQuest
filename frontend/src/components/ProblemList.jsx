import ProblemRow from './ProblemRow';

export default function ProblemList({ problems, loading, onToggle }) {
  if (loading) {
    return (
      <div className="text-center py-12 text-sm theme-text-secondary">
        Loading problems...
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="text-center py-12 text-sm theme-text-secondary">
        No problems match your filters.
      </div>
    );
  }

  return (
    <div className="theme-card rounded-xl shadow-sm border overflow-hidden">
      {problems.map((problem) => (
        <ProblemRow key={problem.id} problem={problem} onToggle={onToggle} />
      ))}
    </div>
  );
}