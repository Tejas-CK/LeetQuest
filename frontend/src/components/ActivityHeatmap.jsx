// Shows a 52-week GitHub/LeetCode-style contribution heatmap.
// Weeks run left (oldest) to right (today). Days run Sun→Sat top to bottom.

const CELL = 11;   // px per cell
const GAP  = 3;    // px gap between cells
const STEP = CELL + GAP;

function buildWeekGrid(heatmapData) {
  // heatmapData: [{ date: 'YYYY-MM-DD', count: N }]
  const byDate = {};
  for (const { date, count } of heatmapData) byDate[date] = count;

  // Anchor to today and go back 52 full weeks + partial current week
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from the most recent Sunday >= 52 weeks ago
  const start = new Date(today);
  start.setDate(start.getDate() - 364 - start.getDay()); // go back 364 days, then snap to Sunday

  const weeks = [];
  let week = [];
  const cursor = new Date(start);

  while (cursor <= today) {
    const iso = cursor.toISOString().slice(0, 10);
    week.push({ date: iso, count: byDate[iso] || 0 });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  // push trailing partial week (today's week)
  if (week.length > 0) {
    // pad remaining days as null so the column height stays consistent
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
}

// Month label positions
function getMonthLabels(weeks) {
  const labels = [];
  let lastMonth = null;
  weeks.forEach((week, wi) => {
    const firstReal = week.find(Boolean);
    if (!firstReal) return;
    const month = firstReal.date.slice(0, 7); // YYYY-MM
    if (month !== lastMonth) {
      lastMonth = month;
      labels.push({
        text: new Date(firstReal.date + 'T00:00:00').toLocaleString('default', { month: 'short' }),
        x: wi * STEP,
      });
    }
  });
  return labels;
}

function cellColor(count, accent) {
  if (!count) return 'var(--heatmap-empty)';
  if (count === 1) return accent + '55';
  if (count <= 3) return accent + '99';
  if (count <= 6) return accent + 'cc';
  return accent;
}

export default function ActivityHeatmap({ heatmapData = [], accent = 'var(--accent)' }) {
  const weeks = buildWeekGrid(heatmapData);
  const monthLabels = getMonthLabels(weeks);

  const totalSolved = heatmapData.reduce((s, d) => s + d.count, 0);

  const svgW = weeks.length * STEP;
  const svgH = 7 * STEP;
  const MONTH_ROW_H = 16;

  return (
    <div
      className="theme-card rounded-xl border p-4 flex flex-col gap-2"
      style={{ color: 'var(--text-primary)' }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Activity
        </span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {totalSolved} solved total
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg
          width={svgW}
          height={MONTH_ROW_H + svgH}
          style={{ display: 'block' }}
        >
          {/* Month labels */}
          {monthLabels.map(({ text, x }) => (
            <text
              key={text + x}
              x={x}
              y={MONTH_ROW_H - 4}
              fontSize={10}
              fill="var(--text-secondary)"
              fontFamily="inherit"
            >
              {text}
            </text>
          ))}

          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              if (!day) return null;
              return (
                <rect
                  key={day.date}
                  x={wi * STEP}
                  y={MONTH_ROW_H + di * STEP}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill={cellColor(day.count, accent)}
                  style={{ cursor: 'default' }}
                >
                  <title>{day.date}: {day.count} solved</title>
                </rect>
              );
            })
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-1" style={{ color: 'var(--text-secondary)' }}>
        <span className="text-xs">Less</span>
        {[0, 1, 3, 5, 7].map((v) => (
          <div
            key={v}
            style={{
              width: CELL,
              height: CELL,
              borderRadius: 2,
              backgroundColor: cellColor(v, accent),
              flexShrink: 0,
            }}
          />
        ))}
        <span className="text-xs">More</span>
      </div>
    </div>
  );
}