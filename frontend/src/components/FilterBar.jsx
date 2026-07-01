const fieldStyle = {
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-primary)',
  borderColor: 'var(--border-color)',
};

export default function FilterBar({ filters, setFilters }) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <input
        type="text"
        placeholder="Search problems..."
        value={filters.search || ''}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        className="neon-focus px-3 py-2 border rounded-lg text-sm flex-1 min-w-[200px]"
        style={fieldStyle}
      />

      <select
        value={filters.difficulty || ''}
        onChange={(e) =>
          setFilters({ ...filters, difficulty: e.target.value || undefined })
        }
        className="neon-focus px-3 py-2 border rounded-lg text-sm"
        style={fieldStyle}
      >
        <option value="">All Difficulties</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>

      <select
        value={
          filters.solved === undefined ? '' : filters.solved ? 'true' : 'false'
        }
        onChange={(e) => {
          const val = e.target.value;
          setFilters({
            ...filters,
            solved: val === '' ? undefined : val === 'true',
          });
        }}
        className="neon-focus px-3 py-2 border rounded-lg text-sm"
        style={fieldStyle}
      >
        <option value="">All</option>
        <option value="true">Solved</option>
        <option value="false">Unsolved</option>
      </select>
    </div>
  );
}