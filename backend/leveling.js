const XP_VALUES = {
  Easy: 10,
  Medium: 30,
  Hard: 60,
};

// Cumulative XP required to REACH a given level.
// Level 1 requires 0 XP (starting point). Level N requires 100 * N^1.5 (rounded).
function xpRequiredForLevel(level) {
  if (level <= 1) return 0;
  return Math.round(100 * Math.pow(level, 1.5));
}

// Given total XP, derive current level, progress into current level,
// and XP needed for next level.
function getLevelInfo(totalXp) {
  let level = 1;

  // Walk upward until totalXp no longer covers the next level's requirement.
  // 1000 is a safety ceiling (way more than this dataset could ever produce).
  while (level < 1000 && totalXp >= xpRequiredForLevel(level + 1)) {
    level++;
  }

  const currentLevelXp = xpRequiredForLevel(level);
  const nextLevelXp = xpRequiredForLevel(level + 1);
  const xpIntoLevel = totalXp - currentLevelXp;
  const xpNeededForNext = nextLevelXp - currentLevelXp;

  return {
    level,
    total_xp: totalXp,
    xp_into_level: xpIntoLevel,
    xp_needed_for_next_level: xpNeededForNext,
    progress_pct: xpNeededForNext > 0
      ? Math.round((xpIntoLevel / xpNeededForNext) * 100)
      : 100,
  };
}

function xpForDifficulty(difficulty) {
  return XP_VALUES[difficulty] || 0;
}

module.exports = { xpForDifficulty, getLevelInfo, xpRequiredForLevel, XP_VALUES };