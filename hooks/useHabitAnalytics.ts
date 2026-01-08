import { useAuth } from '@/context/authContext';
import { habitServices } from '@/services/habitServices';
import { AnalyticsData, HabitWithStatus } from '@/types/habitAnalytics';
import { useCallback, useState } from 'react';

export const useHabitAnalytics = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalHabits: 0,
    completedToday: 0,
    pendingToday: 0,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyCompletion: 0,
    topHabitsByStreak: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHabitsAndAnalytics = useCallback(async (isRefresh = false) => {
    if (!user) {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const habitsWithStatus = await habitServices.getHabitsWithStatus(user.uid);

      let completedToday = 0;
      let pendingToday = 0;
      let totalPoints = 0;
      let currentStreak = 0;
      let longestStreak = 0;
      let totalCompletions = 0;
      let totalOpportunities = 0;

      habitsWithStatus.forEach(habit => {
        if (habit.completedToday) {
          completedToday++;
        }
        if (habit.isDueToday && !habit.completedToday) {
          pendingToday++;
        }
        totalPoints += habit.points;
        if (habit.streak > currentStreak) {
          currentStreak = habit.streak;
        }
        if (habit.longestStreak > longestStreak) {
          longestStreak = habit.longestStreak;
        }
        totalCompletions += habit.completionsLast7Days;
        totalOpportunities += habit.opportunitiesLast7Days;
      });

      const weeklyCompletion = totalOpportunities > 0
        ? (totalCompletions / totalOpportunities) * 100
        : 0;

      setHabits(habitsWithStatus);
      setAnalytics({
        totalHabits: habitsWithStatus.length,
        completedToday,
        pendingToday,
        totalPoints,
        currentStreak,
        longestStreak,
        weeklyCompletion,
        topHabitsByStreak: habitsWithStatus.sort((a, b) => b.longestStreak - a.longestStreak).slice(0, 5),
      });
    } catch (error) {
      console.error("Error loading habits and analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  return { habits, analytics, loading, refreshing, loadHabitsAndAnalytics };
};
