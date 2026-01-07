import { useAuth } from "@/context/authContext";
import { habitServices } from "@/services/habitServices";
import { AnalyticsData, DetailData, HabitWithStatus } from "@/types/habitAnalytics";
import { Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Divider, Modal, Provider as PaperProvider, Portal, Subheading, Surface, Title } from 'react-native-paper';
import Svg, { Circle, Line } from 'react-native-svg';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HabitCreateModal from '../../components/HabitCreateModal';

import { FontAwesome6 } from '@expo/vector-icons';

export default function Productivity() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const NAVBAR_HEIGHT = 72;

  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalHabits: 0,
    completedToday: 0,
    pendingToday: 0,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyCompletion: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
    // Pull-to-refresh handler
    const onRefresh = async () => {
      setRefreshing(true);
      await loadHabitsAndAnalytics();
      setRefreshing(false);
    };
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [showAllHabits, setShowAllHabits] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedCard, setSelectedCard] = useState<null | 'streak' | 'weekly' | 'completed' | 'total'>(null);

  // Helper to get detail data for each card
  const getDetailData = (): DetailData | null => {
    switch (selectedCard) {
      case 'streak':
        return {
          title: 'Streak',
          value: analytics.currentStreak,
          unit: 'days',
          barData: habits.slice(0, 7).map((h: HabitWithStatus) => h.streak),
          related: habits.length > 0 ? habits.reduce((a: HabitWithStatus, b: HabitWithStatus) => a.streak > b.streak ? a : b).title : '-',
          suggestion: 'Keep your streak alive by completing at least one habit daily!',
        };
      case 'weekly':
        return {
          title: 'Weekly %',
          value: Math.round(analytics.weeklyCompletion),
          unit: '%',
          barData: habits.slice(0, 7).map((h: HabitWithStatus) => h.completionRate),
          related: habits.length > 0 ? habits.reduce((a: HabitWithStatus, b: HabitWithStatus) => a.completionRate > b.completionRate ? a : b).title : '-',
          suggestion: 'Aim for 100% weekly completion for best results!',
        };
      case 'completed':
        return {
          title: 'Completed',
          value: analytics.completedToday,
          unit: `of ${analytics.totalHabits}`,
          barData: [habits.filter((h: HabitWithStatus) => h.completedToday).length],
          related: habits.filter((h: HabitWithStatus) => h.completedToday).map((h: HabitWithStatus) => h.title).join(', ') || '-',
          suggestion: `Completion: ${analytics.completedToday}/${analytics.totalHabits} habits — ${analytics.totalHabits > 0 ? Math.round((analytics.completedToday / analytics.totalHabits) * 100) : 0}%`,
        };
      case 'total':
        return {
          title: 'Total Habits',
          value: analytics.totalHabits,
          unit: 'tracked',
          barData: habits.slice(-7).map(() => 24),
          related: habits.length > 0 ? habits[habits.length-1].title : '-',
          suggestion: 'Add more habits to improve your productivity!',
        };
      default:
        return null;
    }
  };

  const loadHabitsAndAnalytics = useCallback(async () => {
    if (!user) return;

    try {
      const userHabits = await habitServices.getUserHabits(user.uid, true);
      
      // Get today's start and end
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Process each habit with its completion status and streaks
      const habitsWithStatus: HabitWithStatus[] = await Promise.all(
        userHabits.map(async (habit) => {
          const logs = await habitServices.getHabitLogs(habit.id);
          const todayLogs = logs.filter(
            (log) =>
              new Date(log.completedAt) >= today &&
              new Date(log.completedAt) < tomorrow
          );

          // Calculate streak
          let streak = 0;
          const sortedLogs = logs.sort(
            (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
          );

          if (sortedLogs.length > 0) {
            const checkDate = new Date();
            checkDate.setHours(0, 0, 0, 0);

            for (const log of sortedLogs) {
              const logDate = new Date(log.completedAt);
              logDate.setHours(0, 0, 0, 0);

              if (logDate.getTime() === checkDate.getTime()) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
              } else if (logDate < checkDate) {
                break;
              }
            }
          }

          // Calculate completion rate (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const recentLogs = logs.filter(
            (log) => new Date(log.completedAt) >= thirtyDaysAgo
          );
          const completionRate = habit.frequency === 'daily' 
            ? (recentLogs.length / 30) * 100 
            : (recentLogs.length / 4) * 100; // Approximate for weekly/monthly

          return {
            ...habit,
            completedToday: todayLogs.length > 0,
            streak,
            completionRate: Math.min(completionRate, 100),
            lastCompleted: sortedLogs[0]?.completedAt,
          };
        })
      );

      // Calculate analytics
      const completedToday = habitsWithStatus.filter((h) => h.completedToday).length;
      const pendingToday = habitsWithStatus.filter((h) => !h.completedToday).length;
      // Points: 10 per completion, streak multipliers (1.5x for 3+, 2x for 7+ days)
      // Streak resets if not completed today
      const totalPoints = habitsWithStatus.reduce((sum, h) => {
        let base = h.completedToday ? 10 : 0;
        let streakMultiplier = 1;
        if (h.streak >= 7) streakMultiplier = 2;
        else if (h.streak >= 3) streakMultiplier = 1.5;
        return sum + base * streakMultiplier;
      }, 0);

      // Leveling up: every 500 points
      // Level calculation is already handled by getLevel(totalPoints)
      const currentStreak = habitsWithStatus.length > 0 
        ? Math.max(...habitsWithStatus.map((h) => h.streak))
        : 0;
      const longestStreak = currentStreak; // Can be enhanced to track historically
      const weeklyCompletion = habitsWithStatus.length > 0
        ? habitsWithStatus.reduce((sum, h) => sum + h.completionRate, 0) / habitsWithStatus.length
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
      });
    } catch (error) {
      console.error("Error loading habits and analytics:", error);
    } finally {
      setLoading(false);
      // Removed unused: setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadHabitsAndAnalytics();
  }, [loadHabitsAndAnalytics]);

  // Removed unused: onRefresh

  const handleCompleteHabit = async (habitId: string) => {
    if (!user) return;

    try {
      await habitServices.logHabitCompletion(habitId, user.uid);
      await loadHabitsAndAnalytics(); // Refresh data
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  // Level and badge system
  const BADGE_THRESHOLD = 250;
  const MAX_LEVEL = 5;
  const MAX_POINTS = BADGE_THRESHOLD * MAX_LEVEL; // 1250
  const getLevel = (totalPoints: number): number => {
    const level = Math.floor(totalPoints / BADGE_THRESHOLD) + 1;
    return Math.min(level, MAX_LEVEL);
  };
  const getBadge = (level: number): string => {
    if (level === 1) return 'Newbie';
    if (level === 2) return 'Rising Star';
    if (level === 3) return 'Achiever';
    if (level === 4) return 'Pro';
    return 'Master'; // Level 5 only
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'health': return { name: 'heart-pulse', color: '#ef4444' }; // Red heart
      case 'fitness': return { name: 'dumbbell', color: '#f97316' }; // Orange dumbbell
      case 'learning': return { name: 'book', color: '#3b82f6' }; // Blue book
      case 'productivity': return { name: 'bolt', color: '#eab308' }; // Yellow bolt
      default: return { name: 'sparkles', color: '#a855f7' }; // Purple sparkles
    }
  };

  // Dynamic header style to access insets
  // Removed unused: headerStyle

  // Calculate level and progress for gamification
  // Removed unused: level, pointsToNext, levelProgress

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </>
    );
  }

  // Format current date for header
  const dateObj = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${days[dateObj.getDay()]}, ${months[dateObj.getMonth()]} ${dateObj.getDate()}`;

  // Use real analytics points only
  let displayPoints = analytics.totalPoints;
  if (displayPoints > MAX_POINTS) displayPoints = MAX_POINTS;

  return (
    <PaperProvider>
      <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        {/* ...existing code... */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + NAVBAR_HEIGHT + 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6366f1"]}
              tintColor="#6366f1"
            />
          }
        >
          {/* Header with Help Icon */}
          <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 24, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Title style={{ color: '#18181b', fontSize: 32, fontWeight: 'bold', letterSpacing: 0.5 }}>Summary</Title>
              <TouchableOpacity onPress={() => setShowHelp(true)} style={{ marginLeft: 10, padding: 4 }}>
                <FontAwesome6 name="circle-question" size={26} color="#6366f1" />
              </TouchableOpacity>
            </View>
            <Subheading style={{ color: '#6b7280', fontWeight: '600', marginTop: 2 }}>{formattedDate}</Subheading>
          </View>
          {/* Help Modal */}
          <Portal>
            <Modal visible={showHelp} onDismiss={() => setShowHelp(false)} contentContainerStyle={{ backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 20 }}>
              <View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#6366f1', marginBottom: 12 }}>Productivity Dashboard Help</Text>
                <Text style={{ fontSize: 16, color: '#18181b', marginBottom: 10 }}>
                  This page helps you track and gamify your daily habits. Here are the rules and features:
                </Text>
                <Text style={{ fontSize: 15, color: '#18181b', marginBottom: 8 }}>
                  • <Text style={{ fontWeight: 'bold' }}>Points:</Text> Earn 10 points for each habit completed today. Streak multipliers: 1.5x for 3+ days, 2x for 7+ days.
                </Text>
                <Text style={{ fontSize: 15, color: '#18181b', marginBottom: 8 }}>
                  • <Text style={{ fontWeight: 'bold' }}>Streaks:</Text> Keep your streak alive by completing habits daily. Streak resets if not completed.
                </Text>
                <Text style={{ fontSize: 15, color: '#18181b', marginBottom: 8 }}>
                  • <Text style={{ fontWeight: 'bold' }}>Levels & Badges:</Text> Level up every 250 points, up to Level 5 (Master). Badges change as you progress.
                </Text>
                <Text style={{ fontSize: 15, color: '#18181b', marginBottom: 8 }}>
                  • <Text style={{ fontWeight: 'bold' }}>Progress Ring:</Text> Shows your points progress toward the next badge.
                </Text>
                <Text style={{ fontSize: 15, color: '#18181b', marginBottom: 8 }}>
                  • <Text style={{ fontWeight: 'bold' }}>Analytics Cards:</Text> View streaks, weekly completion, today&apos;s completed habits, and total habits. Tap a card for details.
                </Text>
                <Text style={{ fontSize: 15, color: '#18181b', marginBottom: 8 }}>
                  • <Text style={{ fontWeight: 'bold' }}>Today&apos;s Habits:</Text> All unfinished habits are shown. Complete each only once per day.
                </Text>
                <Text style={{ fontSize: 15, color: '#18181b', marginBottom: 8 }}>
                  • <Text style={{ fontWeight: 'bold' }}>View All Habits:</Text> Tap to see a full list of all your habits.
                </Text>
                <Text style={{ fontSize: 15, color: '#6366f1', marginTop: 12 }}>
                  Stay consistent to level up and earn badges. Refresh the page by pulling down. For questions, tap this help icon anytime.
                </Text>
                <TouchableOpacity onPress={() => setShowHelp(false)} style={{ marginTop: 18, alignSelf: 'flex-end', backgroundColor: '#6366f1', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </Portal>

          {/* Activity Ring Section */}
          <Surface style={{ backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 16, marginBottom: 20, padding: 20, alignItems: 'center', elevation: 2 }}>
            <View style={{ width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
              <Svg width={120} height={120}>
                <Circle
                  cx={60}
                  cy={60}
                  r={48}
                  stroke="#fde4ea"
                  strokeWidth={12}
                  fill="none"
                />
                <Circle
                  cx={60}
                  cy={60}
                  r={48}
                  stroke="#f43f5e"
                  strokeWidth={12}
                  fill="none"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - Math.min((displayPoints % BADGE_THRESHOLD) / BADGE_THRESHOLD, 1))}
                  strokeLinecap="round"
                  rotation={-90}
                  origin="60,60"
                />
              </Svg>
              <View style={{ position: 'absolute', top: 0, left: 0, width: 120, height: 120, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#f43f5e', fontWeight: 'bold', fontSize: 28 }}>{displayPoints}</Text>
              </View>
            </View>
            <Text style={{ color: '#18181b', fontWeight: 'bold', fontSize: 18 }}>Points</Text>
            <Text style={{ color: '#f43f5e', fontWeight: '600', fontSize: 16 }}>
              {getLevel(displayPoints) === MAX_LEVEL
                ? `Progress: ${displayPoints}/${MAX_POINTS} (100%)`
                : `Progress: ${displayPoints}/${Math.ceil(displayPoints / BADGE_THRESHOLD) * BADGE_THRESHOLD || BADGE_THRESHOLD} (${Math.floor(((displayPoints % BADGE_THRESHOLD) / BADGE_THRESHOLD) * 100)}%)`}
            </Text>
          </Surface>

          {/* Grid of Analytics Cards - Apple Health Style */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginHorizontal: 12 }}>
            {/* Streak Card - Line Graph */}
            <TouchableOpacity style={{ width: '48%' }} activeOpacity={0.8} onPress={() => setSelectedCard('streak')}>
              <Surface style={{ backgroundColor: '#fff', borderRadius: 18, marginBottom: 16, padding: 16, elevation: 1, borderColor: '#e5e7eb', borderWidth: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#18181b', fontWeight: 'bold', fontSize: 16 }}>Streak</Text>
                  <Text style={{ color: '#a3e635', fontWeight: 'bold', fontSize: 18 }}>{'>'}</Text>
                </View>
                <Text style={{ color: '#a78bfa', fontWeight: 'bold', fontSize: 28, marginTop: 8 }}>{analytics.currentStreak}</Text>
                <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>days</Text>
                {/* Line graph for streaks over last 7 days */}
                <View style={{ marginTop: 8, height: 32, width: '100%' }}>
                  <Svg width="100%" height={32} viewBox={`0 0 112 32`}>
                    {habits.slice(0, 7).map((h, i, arr) => {
                      if (i === 0) return null;
                      const prev = arr[i - 1];
                      return (
                        <Line
                          key={i}
                          x1={16 * (i - 1) + 8}
                          y1={32 - Math.max(8, Math.min(32, prev.streak * 4))}
                          x2={16 * i + 8}
                          y2={32 - Math.max(8, Math.min(32, h.streak * 4))}
                          stroke="#a78bfa"
                          strokeWidth={2}
                        />
                      );
                    })}
                    {habits.slice(0, 7).map((h, i) => (
                      <Circle
                        key={i}
                        cx={16 * i + 8}
                        cy={32 - Math.max(8, Math.min(32, h.streak * 4))}
                        r={3}
                        fill="#a78bfa"
                      />
                    ))}
                  </Svg>
                </View>
              </Surface>
            </TouchableOpacity>

            {/* Weekly Completion Card - Progress Bar */}
            <TouchableOpacity style={{ width: '48%' }} activeOpacity={0.8} onPress={() => setSelectedCard('weekly')}>
              <Surface style={{ backgroundColor: '#fff', borderRadius: 18, marginBottom: 16, padding: 16, elevation: 1, borderColor: '#e5e7eb', borderWidth: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#18181b', fontWeight: 'bold', fontSize: 16 }}>Weekly %</Text>
                  <Text style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: 18 }}>{'>'}</Text>
                </View>
                <Text style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: 28, marginTop: 8 }}>{Math.round(analytics.weeklyCompletion)}%</Text>
                <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>completion</Text>
                {/* Progress bar for weekly completion */}
                <View style={{ marginTop: 8, height: 16, width: '100%', backgroundColor: '#e0f2fe', borderRadius: 8 }}>
                  <View style={{ height: 16, width: `${Math.round(analytics.weeklyCompletion)}%`, backgroundColor: '#38bdf8', borderRadius: 8 }} />
                </View>
              </Surface>
            </TouchableOpacity>

            {/* Completed Today Card - Count with Icons */}
            <TouchableOpacity style={{ width: '48%' }} activeOpacity={0.8} onPress={() => setSelectedCard('completed')}>
              <Surface style={{ backgroundColor: '#fff', borderRadius: 18, marginBottom: 16, padding: 16, elevation: 1, borderColor: '#e5e7eb', borderWidth: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#18181b', fontWeight: 'bold', fontSize: 16 }}>Completed</Text>
                  <Text style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 18 }}>{'>'}</Text>
                </View>
                <Text style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 28, marginTop: 8 }}>
                  {analytics.completedToday}/{analytics.totalHabits}
                  <Text style={{ fontSize: 18, color: '#6b7280' }}> habits</Text>
                </Text>
                <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                  {analytics.totalHabits > 0 ? Math.round((analytics.completedToday / analytics.totalHabits) * 100) : 0}% completed
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, minHeight: 32 }}>
                  {habits.filter(h => h.completedToday).map((h, i) => (
                    <FontAwesome6 key={i} name="circle-check" size={24} color="#f59e0b" style={{ marginHorizontal: 2 }} />
                  ))}
                  {habits.filter(h => h.completedToday).length === 0 && (
                    <Text style={{ color: '#f59e0b', fontSize: 16 }}>No habits completed yet</Text>
                  )}
                </View>
              </Surface>
            </TouchableOpacity>

            {/* Total Habits Card - Simple Count */}
            <TouchableOpacity style={{ width: '48%' }} activeOpacity={0.8} onPress={() => setSelectedCard('total')}>
              <Surface style={{ backgroundColor: '#fff', borderRadius: 18, marginBottom: 16, padding: 16, elevation: 1, borderColor: '#e5e7eb', borderWidth: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#18181b', fontWeight: 'bold', fontSize: 16 }}>Total Habits</Text>
                  <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 18 }}>{'>'}</Text>
                </View>
                <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 28, marginTop: 8 }}>{analytics.totalHabits}</Text>
                <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>tracked</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, minHeight: 32 }}>
                  <FontAwesome6 name="list-check" size={24} color="#10b981" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 16 }}>{analytics.totalHabits} habits</Text>
                </View>
              </Surface>
            </TouchableOpacity>
                    {/* Detail Modal for Analytics Card */}
                    <Portal>
                      <Modal visible={!!selectedCard} onDismiss={() => setSelectedCard(null)} contentContainerStyle={{ backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 20 }}>
                        {(() => {
                          const detail = getDetailData();
                          if (!detail) return null;
                          return (
                            <View>
                              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#18181b', marginBottom: 8 }}>{detail.title}</Text>
                              <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#6366f1', marginBottom: 4 }}>{detail.value} <Text style={{ fontSize: 18, color: '#6b7280' }}>{detail.unit}</Text></Text>
                              {/* Streak: Line graph, Weekly: Progress bar */}
                              {selectedCard === 'streak' && (
                                <View style={{ marginTop: 12, marginBottom: 16, height: 32, width: '100%' }}>
                                  <Svg width="100%" height={32} viewBox={`0 0 112 32`}>
                                    {habits.slice(0, 7).map((h, i, arr) => {
                                      if (i === 0) return null;
                                      const prev = arr[i - 1];
                                      return (
                                        <Line
                                          key={i}
                                          x1={16 * (i - 1) + 8}
                                          y1={32 - Math.max(8, Math.min(32, prev.streak * 4))}
                                          x2={16 * i + 8}
                                          y2={32 - Math.max(8, Math.min(32, h.streak * 4))}
                                          stroke="#a78bfa"
                                          strokeWidth={2}
                                        />
                                      );
                                    })}
                                    {habits.slice(0, 7).map((h, i) => (
                                      <Circle
                                        key={i}
                                        cx={16 * i + 8}
                                        cy={32 - Math.max(8, Math.min(32, h.streak * 4))}
                                        r={3}
                                        fill="#a78bfa"
                                      />
                                    ))}
                                  </Svg>
                                </View>
                              )}
                              {selectedCard === 'weekly' && (
                                <View style={{ marginTop: 12, marginBottom: 16, height: 16, width: '100%', backgroundColor: '#e0f2fe', borderRadius: 8 }}>
                                  <View style={{ height: 16, width: `${Math.round(analytics.weeklyCompletion)}%`, backgroundColor: '#38bdf8', borderRadius: 8 }} />
                                </View>
                              )}
                              {/* Related Habits */}
                              <Text style={{ color: '#18181b', fontSize: 14, fontWeight: 'bold', marginBottom: 2 }}>Related:</Text>
                              <Text style={{ color: '#18181b', fontSize: 14, marginBottom: 8 }}>{detail.related}</Text>
                              {/* Suggestion */}
                              <Text style={{ color: '#10b981', fontSize: 13 }}>{detail.suggestion}</Text>
                            </View>
                          );
                        })()}
                      </Modal>
                    </Portal>
          </View>

          <Divider style={{ backgroundColor: '#e5e7eb', marginVertical: 8, marginHorizontal: 16 }} />

          {/* Level and Badge Section */}
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <Surface style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1 }}>
              <View>
                <Text style={{ color: '#6366f1', fontWeight: 'bold', fontSize: 18 }}>Level {getLevel(displayPoints)}</Text>
                <Text style={{ color: '#18181b', fontSize: 16 }}>Badge: {getBadge(getLevel(displayPoints))}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <FontAwesome6 name="medal" size={32} color="#f59e0b" />
              </View>
            </Surface>
          </View>

          {/* Habits List Section - Show all unfinished habits */}
          <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
            <Text style={{ color: '#18181b', fontWeight: 'bold', fontSize: 20, marginBottom: 8 }}>Today&apos;s Habits</Text>
            {habits.length === 0 ? (
              <Surface style={{ backgroundColor: '#f3f4f6', borderRadius: 16, padding: 24, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#6b7280', fontSize: 16 }}>No habits yet. Create one to get started!</Text>
              </Surface>
            ) : (
              <>
                {habits.filter((habit: HabitWithStatus) => !habit.completedToday).map((habit: HabitWithStatus) => (
                  <Surface key={habit.id} style={{ backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: habit.color || '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <FontAwesome6 name={getCategoryIcon(habit.category).name} size={28} color={getCategoryIcon(habit.category).color} />
                      </View>
                      <View>
                        <Text style={{ color: '#18181b', fontWeight: 'bold', fontSize: 16 }}>{habit.title}</Text>
                        <Text style={{ color: '#6b7280', fontSize: 12 }}>{habit.frequency} • {habit.streak > 0 ? `${habit.streak}d streak` : 'No streak'}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={{ width: 40, height: 40, backgroundColor: habit.completedToday ? '#10b981' : '#6366f1', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                      onPress={() => !habit.completedToday && handleCompleteHabit(habit.id)}
                      activeOpacity={0.7}
                      disabled={habit.completedToday}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>✓</Text>
                    </TouchableOpacity>
                  </Surface>
                ))}
              </>
            )}
            {habits.length > 0 && (
              <TouchableOpacity
                style={{ backgroundColor: '#e5e7eb', borderRadius: 20, paddingVertical: 10, alignItems: 'center', marginTop: 8 }}
                onPress={() => setShowAllHabits(true)}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#6366f1', fontWeight: 'bold', fontSize: 16 }}>View All Habits</Text>
              </TouchableOpacity>
            )}
            {/* Full Page Modal for All Habits */}
            <Portal>
              <Modal visible={showAllHabits} onDismiss={() => setShowAllHabits(false)} contentContainerStyle={{ backgroundColor: '#fff', flex: 1, borderRadius: 0, paddingTop: 32, paddingHorizontal: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#18181b' }}>All Habits</Text>
                  <TouchableOpacity onPress={() => setShowAllHabits(false)} style={{ padding: 8 }}>
                    <Text style={{ color: '#6366f1', fontWeight: 'bold', fontSize: 18 }}>Close</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={{ flex: 1 }}>
                  {habits.map((habit) => (
                    <Surface key={habit.id} style={{ backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: habit.color || '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                          <FontAwesome6 name={getCategoryIcon(habit.category).name} size={28} color={getCategoryIcon(habit.category).color} />
                        </View>
                        <View>
                          <Text style={{ color: '#18181b', fontWeight: 'bold', fontSize: 16 }}>{habit.title}</Text>
                          <Text style={{ color: '#6b7280', fontSize: 12 }}>{habit.frequency} • {habit.streak > 0 ? `${habit.streak}d streak` : 'No streak'}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={{ width: 40, height: 40, backgroundColor: habit.completedToday ? '#10b981' : '#6366f1', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => !habit.completedToday && handleCompleteHabit(habit.id)}
                        activeOpacity={0.7}
                        disabled={habit.completedToday}
                      >
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>✓</Text>
                      </TouchableOpacity>
                    </Surface>
                  ))}
                </ScrollView>
              </Modal>
            </Portal>
          </View>

          {/* Create Habit CTA */}
          <TouchableOpacity
            style={{ backgroundColor: '#6366f1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 32, marginHorizontal: 32, marginBottom: 24 }}
            onPress={() => setShowCreateHabit(true)}
            activeOpacity={0.9}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Create New Habit</Text>
            <View style={{ marginLeft: 12, backgroundColor: '#a7f3d0', borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#18181b', fontWeight: 'bold', fontSize: 24 }}>+</Text>
            </View>
          </TouchableOpacity>

          <HabitCreateModal
            visible={showCreateHabit}
            onDismiss={() => setShowCreateHabit(false)}
            onSuccess={loadHabitsAndAnalytics}
          />
        </ScrollView>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  gradientCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#E9D5FF",
    opacity: 0.5,
    top: -50,
    right: -50,
    zIndex: 0,
  },
  gradientCircle2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#D4FC79",
    opacity: 0.4,
    bottom: 200,
    left: -50,
    zIndex: 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    zIndex: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  headerEmoji: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    paddingHorizontal: 16,
  },
  scrollContent: {
    flex: 1,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  cardNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000000",
    marginVertical: 6,
  },
  cardSubtext: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  cardIcon: {
    fontSize: 20,
    color: "#000000",
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  progressCircle: {
    width: 48,
    height: 48,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressArc: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 6,
    borderColor: "#E5E7EB",
    borderTopColor: "#A78BFA",
    borderRightColor: "#A78BFA",
    transform: [{ rotate: "-90deg" }],
  },
  progressInner: {
    alignItems: "center",
  },
  progressNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000000",
  },
  progressLabel: {
    fontSize: 8,
    color: "#9CA3AF",
    marginTop: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D9F99D",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 4,
    alignSelf: "stretch",
  },
  badgeIcon: {
    fontSize: 10,
    color: "#000000",
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    lineHeight: 10,
  },
  statsNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 2,
    lineHeight: 20,
  },
  statsLabel: {
    fontSize: 8,
    color: "#9CA3AF",
    marginBottom: 6,
    lineHeight: 10,
    textAlign: "center",
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    height: 32,
    width: "100%",
  },
  bar: {
    flex: 1,
    backgroundColor: "#C4B5FD",
    borderRadius: 4,
  },
  waveChart: {
    height: 140,
    position: "relative",
    width: "100%",
  },
  waveRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "100%",
  },
  waveDot: {
    width: 12,
    height: 12,
    backgroundColor: "#8B5CF6",
    borderRadius: 6,
    position: "absolute",
  },
  ctaButton: {
    backgroundColor: "#000000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 32,
    position: "relative",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  ctaArrow: {
    position: "absolute",
    right: 18,
    width: 40,
    height: 40,
    backgroundColor: "#D9F99D",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowIcon: {
    fontSize: 20,
    color: "#000000",
    fontWeight: "700",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F59E0B",
    marginTop: 4,
  },
  streakLabel: {
    fontSize: 8,
    color: "#92400E",
    marginTop: 2,
    marginBottom: 4,
    textAlign: "center",
  },
  streakBadge: {
    backgroundColor: "#FCD34D",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  streakBadgeText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#92400E",
    textAlign: "center",
  },
  summarySection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 16,
  },
  summaryCards: {
    flexDirection: "row",
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    position: "relative",
    minHeight: 120,
    justifyContent: "center",
  },
  summaryNumber: {
    fontSize: 40,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
  summaryIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryEmoji: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  habitsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  habitsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  viewAllText: {
    color: '#6366f1',
    fontWeight: '700',
    fontSize: 13,
  },
  habitCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  completedHabitCard: {
    opacity: 0.8,
  },
  habitLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  habitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  habitEmoji: {
    fontSize: 24,
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  habitMeta: {
    fontSize: 12,
    color: "#6B7280",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#6B7280",
  },
  completeButton: {
    width: 40,
    height: 40,
    backgroundColor: "#6366f1",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  completeButtonText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  completedBadge: {
    width: 40,
    height: 40,
    backgroundColor: "#10b981",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  completedBadgeText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  motivationSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  motivationCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  motivationEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: "#1E3A8A",
    textAlign: "center",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 32,
    minHeight: 300,
    maxHeight: '80%',
  },
  fullListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  fullListContent: {
    flex: 1,
  },
});
