import { Habit } from "./event";

export interface HabitWithStatus extends Habit {
  completedToday: boolean;
  isDueToday: boolean;
  streak: number;
  longestStreak: number;
  points: number;
  completionsLast7Days: number;
  opportunitiesLast7Days: number;
  lastCompleted?: string;
}

export interface AnalyticsData {
  totalHabits: number;
  completedToday: number;
  pendingToday: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  weeklyCompletion: number;
  topHabitsByStreak: HabitWithStatus[];
}

export interface DetailData {
  title: string;
  value: number;
  unit: string;
  barData: number[];
  related: string;
  suggestion: string;
}
