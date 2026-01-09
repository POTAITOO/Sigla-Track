// Gamification Constants
export const BADGE_THRESHOLD = 250;
export const MAX_LEVEL = 5;
export const MAX_POINTS = BADGE_THRESHOLD * MAX_LEVEL; // 1250

// Level and Badge Logic
export const getLevel = (totalPoints: number): number => {
  const level = Math.floor(totalPoints / BADGE_THRESHOLD) + 1;
  return Math.min(level, MAX_LEVEL);
};

export const getBadge = (level: number): string => {
  if (level === 1) return 'Newbie';
  if (level === 2) return 'Rising Star';
  if (level === 3) return 'Achiever';
  if (level === 4) return 'Pro';
  return 'Master';
};

// Icon Logic
export const getCategoryIcon = (category?: string) => {
  switch (category) {
    case 'health': return { name: 'heart-pulse', color: '#ef4444' }; // Red heart
    case 'fitness': return { name: 'dumbbell', color: '#f97316' }; // Orange dumbbell
    case 'learning': return { name: 'book-open', color: '#3b82f6' }; // Blue book
    case 'productivity': return { name: 'bolt', color: '#f59e0b' }; // Yellow bolt
    default: return { name: 'sparkles', color: '#a855f7' }; // Purple sparkles
  }
};
