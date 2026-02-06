// Client-side progress manager using localStorage
// All keys prefixed with 'docker-learn-'

const PREFIX = 'docker-learn-';

export interface ModuleProgress {
  completed: boolean;
  completedAt?: string;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
}

export interface UserProgress {
  modules: Record<string, ModuleProgress>;
  quizBestScore: QuizResult | null;
  xp: number;
  level: number;
}

export const XP_PER_MODULE = 100;
export const TOTAL_MODULES = 14;

export const LEVELS = [
  { name: 'Debutant', minXp: 0 },
  { name: 'Apprenti', minXp: 300 },
  { name: 'Pratiquant', minXp: 800 },
  { name: 'Expert', minXp: 1500 },
  { name: 'Maitre Docker', minXp: 2500 },
  { name: 'Architecte', minXp: 3500 },
] as const;

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable
  }
}

export function getProgress(): UserProgress {
  return {
    modules: getItem<Record<string, ModuleProgress>>('modules', {}),
    quizBestScore: getItem<QuizResult | null>('quiz-best', null),
    xp: getItem<number>('xp', 0),
    level: getItem<number>('level', 0),
  };
}

export function isModuleCompleted(slug: string): boolean {
  const modules = getItem<Record<string, ModuleProgress>>('modules', {});
  return modules[slug]?.completed ?? false;
}

export function completeModule(slug: string): number {
  const modules = getItem<Record<string, ModuleProgress>>('modules', {});

  if (modules[slug]?.completed) return 0;

  modules[slug] = {
    completed: true,
    completedAt: new Date().toISOString(),
  };
  setItem('modules', modules);

  const xpGained = XP_PER_MODULE;
  addXp(xpGained);
  return xpGained;
}

export function getCompletedCount(): number {
  const modules = getItem<Record<string, ModuleProgress>>('modules', {});
  return Object.values(modules).filter((m) => m.completed).length;
}

export function getCompletionPercentage(): number {
  return Math.round((getCompletedCount() / TOTAL_MODULES) * 100);
}

export function saveQuizScore(score: number, total: number): QuizResult {
  const percentage = Math.round((score / total) * 100);
  const result: QuizResult = {
    score,
    total,
    percentage,
    completedAt: new Date().toISOString(),
  };

  const bestScore = getItem<QuizResult | null>('quiz-best', null);

  if (!bestScore || percentage > bestScore.percentage) {
    setItem('quiz-best', result);

    // Award bonus XP for quiz improvement
    const bonusXp = Math.round(percentage * 5);
    const previousBonus = bestScore ? Math.round(bestScore.percentage * 5) : 0;
    const xpGained = bonusXp - previousBonus;
    if (xpGained > 0) {
      addXp(xpGained);
    }
  }

  return result;
}

export function getQuizBestScore(): QuizResult | null {
  return getItem<QuizResult | null>('quiz-best', null);
}

function addXp(amount: number): void {
  const currentXp = getItem<number>('xp', 0);
  const newXp = currentXp + amount;
  setItem('xp', newXp);
  updateLevel(newXp);
}

export function getXp(): number {
  return getItem<number>('xp', 0);
}

function updateLevel(xp: number): void {
  let newLevel = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      newLevel = i;
      break;
    }
  }
  setItem('level', newLevel);
}

export function getLevel(): { index: number; name: string; nextLevel: typeof LEVELS[number] | null; xpToNext: number } {
  const xp = getXp();
  let levelIndex = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      levelIndex = i;
      break;
    }
  }

  const nextLevel = levelIndex < LEVELS.length - 1 ? LEVELS[levelIndex + 1] : null;
  const xpToNext = nextLevel ? nextLevel.minXp - xp : 0;

  return {
    index: levelIndex,
    name: LEVELS[levelIndex].name,
    nextLevel,
    xpToNext,
  };
}

export function getNextIncompleteModule(slugs: string[]): string | null {
  const modules = getItem<Record<string, ModuleProgress>>('modules', {});
  for (const slug of slugs) {
    if (!modules[slug]?.completed) return slug;
  }
  return null;
}

// Badge system
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: () => boolean;
}

export const BADGES: Badge[] = [
  {
    id: 'first-module',
    name: 'Premier Pas',
    description: 'Terminer son premier module',
    icon: '🎯',
    condition: () => getCompletedCount() >= 1,
  },
  {
    id: 'half-way',
    name: 'Mi-Parcours',
    description: 'Terminer 7 modules',
    icon: '⭐',
    condition: () => getCompletedCount() >= 7,
  },
  {
    id: 'all-modules',
    name: 'Completiste',
    description: 'Terminer tous les modules',
    icon: '🏆',
    condition: () => getCompletedCount() >= TOTAL_MODULES,
  },
  {
    id: 'quiz-pass',
    name: 'QCM Reussi',
    description: 'Obtenir 70%+ au QCM',
    icon: '📝',
    condition: () => {
      const best = getQuizBestScore();
      return best !== null && best.percentage >= 70;
    },
  },
  {
    id: 'quiz-perfect',
    name: 'Score Parfait',
    description: 'Obtenir 100% au QCM',
    icon: '💎',
    condition: () => {
      const best = getQuizBestScore();
      return best !== null && best.percentage === 100;
    },
  },
  {
    id: 'xp-500',
    name: 'Assidu',
    description: 'Atteindre 500 XP',
    icon: '🔥',
    condition: () => getXp() >= 500,
  },
  {
    id: 'xp-1000',
    name: 'Determine',
    description: 'Atteindre 1000 XP',
    icon: '💪',
    condition: () => getXp() >= 1000,
  },
  {
    id: 'xp-2000',
    name: 'Acharne',
    description: 'Atteindre 2000 XP',
    icon: '⚡',
    condition: () => getXp() >= 2000,
  },
  {
    id: 'security-expert',
    name: 'Expert Securite',
    description: 'Terminer le module securite',
    icon: '🔒',
    condition: () => isModuleCompleted('08-env-and-security'),
  },
  {
    id: 'cicd-master',
    name: 'Maitre CI/CD',
    description: 'Terminer le module CI/CD',
    icon: '🚀',
    condition: () => isModuleCompleted('11-ci-cd-github-actions'),
  },
  {
    id: 'fullstack-dev',
    name: 'Developpeur Full-Stack',
    description: 'Terminer le projet full-stack',
    icon: '🎯',
    condition: () => isModuleCompleted('12-fullstack-project'),
  },
];

export function getEarnedBadges(): Badge[] {
  return BADGES.filter((badge) => badge.condition());
}

export function getNewBadges(): Badge[] {
  const earned = getEarnedBadges();
  const seen = getItem<string[]>('badges-seen', []);
  return earned.filter((b) => !seen.includes(b.id));
}

export function markBadgesSeen(): void {
  const earned = getEarnedBadges();
  setItem('badges-seen', earned.map((b) => b.id));
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  const keys = ['modules', 'quiz-best', 'xp', 'level', 'badges-seen'];
  keys.forEach((key) => localStorage.removeItem(PREFIX + key));
}
