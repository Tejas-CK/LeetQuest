const TIERS = [
  'Rookie',
  'Novice',
  'Apprentice',
  'Solver',
  'Analyst',
  'Expert',
  'Master',
  'Grandmaster',
  'Legend',
  'Mythic',
  'Elite',
  'Immortal',
  'Transcendent',
];

const DIVISIONS = ['V', 'IV', 'III', 'II', 'I']; // V = lowest division in a tier, I = highest

const TOTAL_RANKS = TIERS.length * DIVISIONS.length; // 65

// Maps a level (1-indexed) to a rank. Level 1 = Rookie V. Caps at Transcendent I.
function getRankForLevel(level) {
  const rankIndex = Math.min(level, TOTAL_RANKS) - 1; // 0-indexed, clamped
  const tierIndex = Math.floor(rankIndex / DIVISIONS.length);
  const divisionIndex = rankIndex % DIVISIONS.length;

  return {
    tier: TIERS[tierIndex],
    division: DIVISIONS[divisionIndex],
    rank_label: `${TIERS[tierIndex]} ${DIVISIONS[divisionIndex]}`,
    rank_number: rankIndex + 1, // 1-65
    is_max_rank: rankIndex + 1 === TOTAL_RANKS,
  };
}

module.exports = { TIERS, DIVISIONS, TOTAL_RANKS, getRankForLevel };