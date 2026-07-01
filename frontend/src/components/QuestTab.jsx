import { useState, useEffect, useCallback } from 'react';
import { fetchTodaysQuest, submitReview } from '../api';

const INTERVAL_LABELS = {
  1:  'Day 1 review',
  3:  'Day 3 review',
  7:  'Day 7 review',
  14: 'Day 14 review',
};

const DIFFICULTY_COLORS = {
  Easy:   '#34d399',
  Medium: '#facc15',
  Hard:   '#f87171',
};

const REVIEW_XP = { Easy: 5, Medium: 10, Hard: 20 };

function XPPopup({ xp, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{
        color: 'var(--accent)',
        backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)',
        border: '1px solid var(--accent)',
        boxShadow: '0 0 8px var(--accent)',
        animation: 'fadeUp 1.2s ease forwards',
      }}
    >
      +{xp} XP
    </span>
  );
}

function ProblemRow({ problem, onReviewed }) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showXp, setShowXp] = useState(false);

  const dc = DIFFICULTY_COLORS[problem.difficulty] || 'var(--accent)';
  const xpBonus = REVIEW_XP[problem.difficulty] || 0;

  const handleMark = async () => {
    if (done || loading) return;
    setLoading(true);
    try {
      await submitReview(problem.id, problem.due_interval);
      setDone(true);
      setShowXp(true);
      onReviewed(problem.id);
    } catch (err) {
      console.error('Review failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-lg neon-hover border transition-all"
      style={{
        backgroundColor: done ? 'color-mix(in srgb, var(--accent) 5%, transparent)' : 'transparent',
        borderColor: done ? 'var(--accent)' : 'var(--border-color)',
        opacity: done ? 0.6 : 1,
      }}
    >
      {/* Left: title + meta */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-sm font-medium truncate"
            style={{ color: done ? 'var(--text-secondary)' : 'var(--text-primary)' }}
          >
            {problem.title}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
            style={{ color: dc, backgroundColor: `${dc}18`, border: `1px solid ${dc}44` }}
          >
            {problem.difficulty}
          </span>
          <span
            className="text-xs flex-shrink-0"
            style={{ color: 'var(--text-secondary)' }}
          >
            {INTERVAL_LABELS[problem.due_interval]}
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Solved {problem.days_since_solve}d ago
        </span>
      </div>

      {/* Right: XP badge + mark button */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {showXp && <XPPopup xp={xpBonus} onDone={() => setShowXp(false)} />}
        {!done ? (
          <button
            onClick={handleMark}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all neon-hover"
            style={{
              color: 'var(--accent)',
              borderColor: 'var(--accent)',
              backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? '…' : 'Mark reviewed'}
          </button>
        ) : (
          <span className="text-xs" style={{ color: 'var(--accent)' }}>✓ Done</span>
        )}
      </div>
    </div>
  );
}

export default function QuestTab({ onXpChanged }) {
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewedIds, setReviewedIds] = useState(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTodaysQuest();
      setQuest(data);
    } catch (err) {
      console.error('Failed to load quest:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleReviewed = (id) => {
    setReviewedIds((prev) => new Set([...prev, id]));
    onXpChanged?.(); // tell App to reload userStats so XP/rank updates live
  };

  const problems = quest?.problems ?? [];
  const remaining = problems.filter((p) => !reviewedIds.has(p.id)).length;
  const total = problems.length;
  const allDone = total > 0 && remaining === 0;

  // Group by interval for display
  const grouped = INTERVALS_ORDER.reduce((acc, iv) => {
    const group = problems.filter((p) => p.due_interval === iv);
    if (group.length) acc.push({ interval: iv, problems: group });
    return acc;
  }, []);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">

      {/* Header card */}
      <div
        className="theme-card rounded-xl border p-5 flex flex-col gap-2"
        style={{ color: 'var(--text-primary)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
              Daily Revision Quest
            </div>
            <div className="text-xs theme-text-secondary mt-0.5">
              {new Date().toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
          {!loading && total > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: allDone ? '#34d399' : 'var(--accent)' }}>
                {total - remaining}/{total}
              </div>
              <div className="text-xs theme-text-secondary">reviewed</div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {!loading && total > 0 && (
          <div
            className="w-full rounded-full h-1.5 overflow-hidden mt-1"
            style={{ backgroundColor: 'var(--border-color)' }}
          >
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                width: `${Math.round(((total - remaining) / total) * 100)}%`,
                backgroundColor: allDone ? '#34d399' : 'var(--accent)',
                boxShadow: `0 0 8px ${allDone ? '#34d399' : 'var(--accent)'}`,
              }}
            />
          </div>
        )}
      </div>

      {/* States */}
      {loading && (
        <div className="theme-card rounded-xl border p-8 text-center theme-text-secondary text-sm">
          Loading today's quest…
        </div>
      )}

      {!loading && total === 0 && (
        <div className="theme-card rounded-xl border p-8 text-center flex flex-col gap-2">
          <div className="text-3xl">🎉</div>
          <div className="font-semibold" style={{ color: 'var(--accent)' }}>
            Nothing due today!
          </div>
          <div className="text-sm theme-text-secondary">
            Solve more problems to start building your revision queue.
          </div>
        </div>
      )}

      {!loading && allDone && (
        <div className="theme-card rounded-xl border p-6 text-center flex flex-col gap-2"
          style={{ borderColor: '#34d39944' }}>
          <div className="text-3xl">⚔️</div>
          <div className="font-semibold" style={{ color: '#34d399' }}>
            Quest complete!
          </div>
          <div className="text-sm theme-text-secondary">
            All {total} problems reviewed. Come back tomorrow for more.
          </div>
        </div>
      )}

      {/* Grouped problem rows */}
      {!loading && !allDone && grouped.map(({ interval, problems: grpProblems }) => (
        <div key={interval} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
              style={{
                color: 'var(--accent)',
                backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
              }}
            >
              {INTERVAL_LABELS[interval]}
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
          </div>
          <div
            className="theme-card rounded-xl border overflow-hidden flex flex-col divide-y"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {grpProblems.map((p) => (
              <ProblemRow key={p.id} problem={p} onReviewed={handleReviewed} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const INTERVALS_ORDER = [1, 3, 7, 14];