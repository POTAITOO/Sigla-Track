import { Habit } from "./event";

export interface HabitWithStatus extends Habit {
  completedToday: boolean;
  streak: number;
  completionRate: number;
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
}

export interface DetailData {
  title: string;
  value: number;
  unit: string;
  barData: number[];
  related: string;
  suggestion: string;
}
