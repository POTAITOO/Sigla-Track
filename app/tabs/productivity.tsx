import { useAuth } from "@/context/authContext";
import { useUserPoints } from "@/context/userPointsContext";
import { habitServices } from "@/services/habitServices";
import { HabitWithStatus } from "@/types/habitAnalytics";
import * as Haptics from 'expo-haptics';
import { Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Modal, Provider as PaperProvider, Portal, Snackbar, Subheading, Surface, Title } from 'react-native-paper';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnalyticsCard from "@/components/productivity/AnalyticsCard";
import EmptyState from "@/components/productivity/EmptyState";
import HabitListItem from "@/components/productivity/HabitListItem";
import ProgressRing from "@/components/productivity/ProgressRing";
import { useHabitAnalytics } from "@/hooks/useHabitAnalytics";
import { BADGE_THRESHOLD, MAX_LEVEL, MAX_POINTS, getBadge, getCategoryIcon, getLevel } from "@/utils/productivityUtils";
import { FontAwesome6 } from '@expo/vector-icons';
import HabitCreateModalCollapsible from "../../components/HabitCreateModalCollapsible";

export default function Productivity() {
  
  // State for editing habit
  const [editingHabit, setEditingHabit] = useState<HabitWithStatus | null>(null);
  // State for delete confirmation
  const [deletingHabit, setDeletingHabit] = useState<HabitWithStatus | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handler for Edit button
  const handleEditHabit = (habit: HabitWithStatus) => {
    setEditingHabit(habit);
    setShowCreateHabit(true);
  };

  // Handler for Delete button
  const handleDeleteHabit = (habit: HabitWithStatus) => {
    setDeletingHabit(habit);
  };

  // Confirm delete
  const confirmDeleteHabit = async () => {
    if (!deletingHabit) return;
    setIsDeleting(true);
    try {
      await habitServices.deleteHabit(deletingHabit.id);
      setSnackbar({ 
        visible: true, 
        message: `"${deletingHabit.title}" deleted`, 
        type: 'success' 
      });
      await loadHabitsAndAnalytics(true);
    } catch (error) {
      console.error("Error deleting habit:", error);
      setSnackbar({ visible: true, message: 'Failed to delete habit.', type: 'error' });
    } finally {
      setIsDeleting(false);
      setDeletingHabit(null);
    }
  };
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; type?: 'error'|'success' }>({ visible: false, message: '' });
  const [completingHabitId, setCompletingHabitId] = useState<string | null>(null);
  const { points, refresh: refreshPoints } = useUserPoints();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const NAVBAR_HEIGHT = 72;

  const { habits, analytics, loading, refreshing, loadHabitsAndAnalytics } = useHabitAnalytics();
  
  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    await loadHabitsAndAnalytics(true);
  }, [loadHabitsAndAnalytics]);

  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [showAllHabits, setShowAllHabits] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedCard, setSelectedCard] = useState<null | 'streak' | 'weekly' | 'completed' | 'total'>(null);

  // Helper to get detail data for each card
  const getDetailData = () => {
    switch (selectedCard) {
      case 'streak':
        return {
          title: 'Top Streaks',
          description: 'Your habits ranked by longest streak',
          data: analytics.topHabitsByStreak,
          type: 'streaks'
        };
      case 'weekly':
        return {
          title: 'Weekly Completion Rate',
          value: `${Math.round(analytics.weeklyCompletion)}%`,
          unit: 'accuracy',
          related: `${analytics.completedToday} completed today`,
          suggestion: 'Aim for consistency across all your habits!',
          type: 'single'
        };
      case 'completed':
        return {
          title: 'Habits Completed Today',
          value: analytics.completedToday,
          unit: 'habits',
          related: `${analytics.pendingToday} pending`,
          suggestion: 'Great job! Finish the rest to make today a success.',
          type: 'single'
        };
      case 'total':
        return {
          title: 'Total Active Habits',
          value: analytics.totalHabits,
          unit: 'habits',
          related: 'View all in the "View All" list.',
          suggestion: 'Focus on a few key habits to avoid feeling overwhelmed.',
          type: 'single'
        };
      default:
        return null;
    }
  };

  // Helper to format due dates for habits
  const formatDueDates = (habit: HabitWithStatus): string => {
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    if (habit.frequency === 'daily') {
      return 'Every day';
    } else if (habit.frequency === 'weekly') {
      const daysText = habit.daysOfWeek?.map(d => DAYS[d]).join(', ') || 'No days selected';
      return `Weekly: ${daysText}`;
    } else if (habit.frequency === 'monthly') {
      const date = new Date(habit.startDate).getDate();
      return `Monthly: ${date}${date === 1 ? 'st' : date === 2 ? 'nd' : date === 3 ? 'rd' : 'th'}`;
    }
    return habit.frequency;
  };

  useEffect(() => {
    loadHabitsAndAnalytics();
  }, [loadHabitsAndAnalytics]);

  const handleCompleteHabit = async (habitId: string) => {
    if (!user) return;
    setCompletingHabitId(habitId);
    try {
      await habitServices.logHabitCompletion(habitId, user.uid);
      // Haptic feedback on success
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      await refreshPoints();
      await loadHabitsAndAnalytics();
      setSnackbar({ visible: true, message: 'Habit completed!', type: 'success' });
    } catch (error: any) {
      console.error("Error completing habit:", error);
      let msg = 'Failed to complete habit. Please try again.';
      if (typeof error?.message === 'string' && error.message.includes('already')) {
        msg = error.message;
      }
      setSnackbar({ visible: true, message: msg, type: 'error' });
    } finally {
      setCompletingHabitId(null);
    }
  };

  const uncompletedHabits = useMemo(() => {
    return habits.filter(h => h.isDueToday && !h.completedToday);
  }, [habits]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
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
  let displayPoints = points;
  if (displayPoints > MAX_POINTS) displayPoints = MAX_POINTS;

  return (
    <PaperProvider>
      <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
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

          {habits.length === 0 ? (
            <EmptyState onPress={() => setShowCreateHabit(true)} />
          ) : (
            <>
              {/* Activity Ring Section */}
              <Surface style={{ backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 16, marginBottom: 20, padding: 20, alignItems: 'center', elevation: 2 }}>
                <ProgressRing points={points} badgeThreshold={BADGE_THRESHOLD} maxPoints={MAX_POINTS} />
                <Text style={{ color: '#18181b', fontWeight: 'bold', fontSize: 18 }}>Points</Text>
                <Text style={{ color: '#f43f5e', fontWeight: '600', fontSize: 16 }}>
                  {getLevel(displayPoints) === MAX_LEVEL
                    ? `Progress: ${displayPoints}/${MAX_POINTS} (100%)`
                    : `Progress: ${displayPoints}/${Math.ceil(displayPoints / BADGE_THRESHOLD) * BADGE_THRESHOLD || BADGE_THRESHOLD} (${Math.floor(((displayPoints % BADGE_THRESHOLD) / BADGE_THRESHOLD) * 100)}%)`}
                </Text>
                <View style={{ marginTop: 12, backgroundColor: '#fef3c7', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 }}>
                  <Text style={{ color: '#92400e', fontWeight: 'bold', fontSize: 14 }}>🏆 {getBadge(getLevel(displayPoints))}</Text>
                </View>
              </Surface>

              {/* Analytics Cards Grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 20 }}>
                <AnalyticsCard
                  title="Best Active Streak"
                  value={analytics.currentStreak}
                  subtext="longest streak among habits 🔥"
                  icon="fire"
                  color="#a78bfa"
                  bgColor="#f3e8ff"
                  onPress={() => setSelectedCard('streak')}
                />
                <AnalyticsCard
                  title="Weekly Rate"
                  value={`${Math.round(analytics.weeklyCompletion)}%`}
                  subtext=""
                  icon="chart-line"
                  color="#38bdf8"
                  bgColor="#e0f2fe"
                  onPress={() => setSelectedCard('weekly')}
                >
                  <View style={{ marginTop: 6, height: 6, width: '100%', backgroundColor: '#e0f2fe', borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ height: 6, width: `${Math.round(analytics.weeklyCompletion)}%`, backgroundColor: '#38bdf8', borderRadius: 3 }} />
                  </View>
                </AnalyticsCard>
                <AnalyticsCard
                  title="Today's Progress"
                  value={`${analytics.completedToday}/${analytics.completedToday + analytics.pendingToday}`}
                  subtext={`${analytics.completedToday + analytics.pendingToday > 0 ? Math.round((analytics.completedToday / (analytics.completedToday + analytics.pendingToday)) * 100) : 0}% done ✓`}
                  icon="circle-check"
                  color="#f59e0b"
                  bgColor="#fef3c7"
                  onPress={() => setSelectedCard('completed')}
                />
                <AnalyticsCard
                  title="Total Habits"
                  value={analytics.totalHabits}
                  subtext="habits tracked 📋"
                  icon="list-check"
                  color="#10b981"
                  bgColor="#d1fae5"
                  onPress={() => setSelectedCard('total')}
                />
              </View>

              {/* Today's Habits Section */}
              <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#18181b' }}>Today&apos;s Habits</Text>
                  {habits.length > 0 && (
                    <TouchableOpacity onPress={() => setShowAllHabits(true)}>
                      <Text style={{ color: '#6366f1', fontWeight: 'bold', fontSize: 16 }}>View All</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {uncompletedHabits.length === 0 ? (
                  <View style={{ padding: 24, alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, color: '#6b7280' }}>All habits completed for today! 🎉</Text>
                  </View>
                ) : (
                  uncompletedHabits.map((habit) => (
                    <HabitListItem
                      key={habit.id}
                      habit={habit}
                      onComplete={handleCompleteHabit}
                      completingHabitId={completingHabitId}
                    />
                  ))
                )}
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
            </>
          )}
        </ScrollView>

        {/* All Modals - Outside ScrollView */}
        <Portal>
          <Modal visible={!!selectedCard} onDismiss={() => setSelectedCard(null)} contentContainerStyle={{ backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 20, maxHeight: '85%' }}>
            {getDetailData() && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {getDetailData()?.type === 'streaks' ? (
                  <View>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#6366f1', marginBottom: 4 }}>{getDetailData()!.title}</Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>Your habits ranked by longest streak</Text>
                    {getDetailData()!.data && (getDetailData()!.data as HabitWithStatus[]).length > 0 ? (
                      <View>
                        {(getDetailData()!.data as HabitWithStatus[]).map((habit, idx) => (
                          <View key={habit.id} style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#6366f1', marginRight: 12 }}>#{idx + 1}</Text>
                              <View>
                                <Text style={{ color: '#18181b', fontWeight: 'bold', fontSize: 15 }}>{habit.title}</Text>
                                <Text style={{ color: '#6b7280', fontSize: 12 }}>{habit.category}</Text>
                              </View>
                            </View>
                            <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                              <Text style={{ color: '#92400e', fontWeight: 'bold', fontSize: 16 }}>{habit.longestStreak}d</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginVertical: 20 }}>No habit streaks yet. Start completing habits to build streaks!</Text>
                    )}
                  </View>
                ) : selectedCard === 'weekly' ? (
                  <View>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#6366f1', marginBottom: 8 }}>{getDetailData()!.title}</Text>
                    <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#18181b', marginBottom: 20 }}>
                      {getDetailData()!.value}
                    </Text>
                    <View style={{ marginBottom: 20, height: 16, width: '100%', backgroundColor: '#e0f2fe', borderRadius: 8, overflow: 'hidden' }}>
                      <View style={{ height: 16, width: `${Math.round(analytics.weeklyCompletion)}%`, backgroundColor: '#38bdf8', borderRadius: 8 }} />
                    </View>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 6 }}>Related: {getDetailData()!.related}</Text>
                    <Text style={{ fontSize: 14, color: '#6366f1', marginBottom: 16 }}>{getDetailData()!.suggestion}</Text>
                    <Text style={{ fontSize: 15, color: '#18181b', fontWeight: 'bold', marginBottom: 12 }}>Top Habit This Week:</Text>
                    {habits.length > 0 ? (() => {
                      const topHabit = [...habits].sort((a, b) => {
                        const aRate = a.opportunitiesLast7Days > 0 ? (a.completionsLast7Days / a.opportunitiesLast7Days) * 100 : 0;
                        const bRate = b.opportunitiesLast7Days > 0 ? (b.completionsLast7Days / b.opportunitiesLast7Days) * 100 : 0;
                        return bRate - aRate;
                      })[0];
                      return (
                        <View style={{ backgroundColor: '#f0f9ff', padding: 14, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#38bdf8' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ color: '#18181b', fontWeight: 'bold', fontSize: 16 }}>{topHabit.title}</Text>
                            <Text style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: 14 }}>
                              {topHabit.opportunitiesLast7Days > 0 ? Math.round((topHabit.completionsLast7Days / topHabit.opportunitiesLast7Days) * 100) : 0}%
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: '#6b7280', fontSize: 13 }}>{formatDueDates(topHabit)}</Text>
                            <Text style={{ color: '#6b7280', fontSize: 13, fontWeight: '600' }}>{topHabit.completionsLast7Days}/{topHabit.opportunitiesLast7Days} completions</Text>
                          </View>
                        </View>
                      );
                    })() : (
                      <Text style={{ fontSize: 14, color: '#6b7280' }}>No habits yet</Text>
                    )}
                  </View>
                ) : selectedCard === 'total' ? (
                  <View>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#6366f1', marginBottom: 8 }}>{getDetailData()!.title}</Text>
                    <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#18181b', marginBottom: 4 }}>
                      {getDetailData()!.value} <Text style={{ fontSize: 18, color: '#6b7280' }}>{getDetailData()!.unit}</Text>
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Related: {getDetailData()!.related}</Text>
                    <Text style={{ fontSize: 14, color: '#6366f1', marginBottom: 16 }}>{getDetailData()!.suggestion}</Text>
                    <Text style={{ fontSize: 15, color: '#18181b', fontWeight: 'bold', marginBottom: 12 }}>Your Habits:</Text>
                    {habits.length > 0 ? (
                      <View>
                        {habits.map((habit) => (
                          <View key={habit.id} style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 12, marginBottom: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <Text style={{ color: '#18181b', fontWeight: 'bold', fontSize: 14 }}>{habit.title}</Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={{ color: '#6b7280', fontSize: 12, backgroundColor: habit.isDueToday ? '#d1fae5' : '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                  {habit.isDueToday ? 'Due Today' : 'Not Due'}
                                </Text>
                                <Text style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 12 }}>{habit.streak}d 🔥</Text>
                              </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Text style={{ color: '#6b7280', fontSize: 12 }}>{formatDueDates(habit)}</Text>
                              <Text style={{ color: '#6b7280', fontSize: 11 }}>Completion: {habit.completionsLast7Days}/{habit.opportunitiesLast7Days}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={{ fontSize: 14, color: '#6b7280' }}>No habits yet</Text>
                    )}
                  </View>                ) : selectedCard === 'completed' ? (
                  <View>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#6366f1', marginBottom: 8 }}>{getDetailData()!.title}</Text>
                    <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#18181b', marginBottom: 6 }}>
                      {getDetailData()!.value}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
                      <Text style={{ fontWeight: 'bold' }}>{getDetailData()!.unit}</Text> • {getDetailData()!.related}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6366f1', marginBottom: 16 }}>{getDetailData()!.suggestion}</Text>
                    {analytics.completedToday > 0 ? (
                      <>
                        <Text style={{ fontSize: 15, color: '#18181b', fontWeight: 'bold', marginBottom: 12 }}>Top Completed Today:</Text>
                        {(() => {
                          const completedHabitsToday = habits.filter(h => h.isDueToday && h.completedToday);
                          const topCompleted = completedHabitsToday.length > 0 ? completedHabitsToday[0] : null;
                          return topCompleted ? (
                            <View style={{ backgroundColor: '#f0fdf4', padding: 14, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#10b981' }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text style={{ color: '#18181b', fontWeight: 'bold', fontSize: 16 }}>{topCompleted.title}</Text>
                                <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 14 }}>✓ Done</Text>
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ color: '#6b7280', fontSize: 13 }}>{formatDueDates(topCompleted)}</Text>
                                <Text style={{ color: '#6b7280', fontSize: 13, fontWeight: '600' }}>{topCompleted.streak}d streak 🔥</Text>
                              </View>
                            </View>
                          ) : null;
                        })()}
                      </>
                    ) : (
                      <Text style={{ fontSize: 14, color: '#6b7280', fontStyle: 'italic' }}>No habits completed yet today. Get started!</Text>
                    )}
                  </View>                ) : (
                  <View>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#6366f1', marginBottom: 8 }}>{getDetailData()!.title}</Text>
                    <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#18181b', marginBottom: 4 }}>
                      {getDetailData()!.value} <Text style={{ fontSize: 18, color: '#6b7280' }}>{getDetailData()!.unit}</Text>
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>Related: {getDetailData()!.related}</Text>
                    <Text style={{ fontSize: 14, color: '#6366f1', marginBottom: 16 }}>{getDetailData()!.suggestion}</Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => setSelectedCard(null)} style={{ alignSelf: 'flex-end', backgroundColor: '#6366f1', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 8, marginTop: 16 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </Modal>
          
          <Modal visible={showHelp} onDismiss={() => setShowHelp(false)} contentContainerStyle={{ backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 20 }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#6366f1', marginBottom: 12 }}>How Productivity Works</Text>
              <Text style={{ fontSize: 16, color: '#18181b', marginBottom: 10 }}>
                Track, gamify, and grow your habits! Here’s how everything works:
              </Text>
              <Text style={{ fontSize: 15, color: '#18181b', marginBottom: 8 }}>
                • <Text style={{ fontWeight: 'bold' }}>Per-Habit Streaks:</Text> Each habit has its own streak. Your streak increases by 1 for every consecutive day you complete that habit. If you miss a day, the streak resets <Text style={{ fontWeight: 'bold' }}>the next day</Text> (not immediately).
              </Text>
              <Text style={{ fontSize: 15, color: '#18181b', marginBottom: 8 }}>
                • <Text style={{ fontWeight: 'bold' }}>Points:</Text> Earn 10 points for every habit you complete. Streak multipliers: 1.5× for 3+ days, 2× for 7+ days.
              </Text>
              <Text style={{ fontSize: 15, color: '#18181b', marginBottom: 8 }}>
                • <Text style={{ fontWeight: 'bold' }}>Badges & Levels:</Text> Level up every 250 points. Badges: Newbie, Rising Star, Achiever, Pro, Master.
              </Text>
              <Text style={{ fontSize: 15, color: '#18181b', marginBottom: 8 }}>
                • <Text style={{ fontWeight: 'bold' }}>Progress Ring:</Text> Shows your points progress toward the next badge.
              </Text>
              <Text style={{ fontSize: 15, color: '#18181b', marginBottom: 8 }}>
                • <Text style={{ fontWeight: 'bold' }}>Analytics Cards:</Text> Tap cards to see your longest streak, weekly completion %, today’s completions, and total habits.
              </Text>
              <Text style={{ fontSize: 15, color: '#18181b', marginBottom: 8 }}>
                • <Text style={{ fontWeight: 'bold' }}>Today’s Habits:</Text> Only unfinished habits are shown. Complete each habit once per day to keep its streak.
              </Text>
              <Text style={{ fontSize: 15, color: '#18181b', marginBottom: 8 }}>
                • <Text style={{ fontWeight: 'bold' }}>View All Habits:</Text> See and manage all your habits, edit or delete as needed.
              </Text>
              <Text style={{ fontSize: 15, color: '#6366f1', marginTop: 12 }}>
                Stay consistent to level up, earn badges, and build lasting habits! Pull down to refresh. Tap this help icon anytime for guidance.
              </Text>
              <TouchableOpacity onPress={() => setShowHelp(false)} style={{ marginTop: 18, alignSelf: 'flex-end', backgroundColor: '#6366f1', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 8 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <Modal visible={showAllHabits} onDismiss={() => setShowAllHabits(false)} contentContainerStyle={{ backgroundColor: '#fff', flex: 1, borderRadius: 0, paddingHorizontal: 16, paddingTop: 16, paddingBottom: insets.bottom + 72 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#18181b' }}>All Habits</Text>
              <TouchableOpacity onPress={() => setShowAllHabits(false)} style={{ padding: 8 }}>
                <Text style={{ color: '#6366f1', fontWeight: 'bold', fontSize: 18 }}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }}>
              {habits.map((habit) => (
                <Surface 
                  key={habit.id} 
                  style={styles.allHabitsItem}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={[styles.habitIconContainer, { backgroundColor: habit.color || '#6366f1' }]}>
                      {habit.completedToday ? (
                        <FontAwesome6 name="check" size={28} color="#fff" />
                      ) : (
                        <FontAwesome6 name={getCategoryIcon(habit.category).name} size={28} color={getCategoryIcon(habit.category).color} />
                      )}
                    </View>
                    <View>
                      <Text style={styles.allHabitsTitle}>{habit.title}</Text>
                      <Text style={styles.allHabitsSubtext}>
                        {habit.frequency} • {habit.streak > 0 ? `${habit.streak}d streak` : 'No streak'}
                        {!habit.isDueToday && ' (Not due)'}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        handleEditHabit(habit);
                        setShowAllHabits(false);
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => {
                        handleDeleteHabit(habit);
                        setShowAllHabits(false);
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </Surface>
              ))}
            </ScrollView>
          </Modal>

          <Modal visible={!!deletingHabit} onDismiss={() => !isDeleting && setDeletingHabit(null)} contentContainerStyle={{ backgroundColor: '#fff', margin: 32, borderRadius: 16, padding: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#ef4444', marginBottom: 12 }}>Delete Habit?</Text>
            <Text style={{ fontSize: 15, color: '#6b7280', marginBottom: 8 }}>Are you sure you want to delete:</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#18181b', marginBottom: 20 }}>&quot;{deletingHabit?.title}&quot;</Text>
            <Text style={{ fontSize: 14, color: '#f59e0b', marginBottom: 24 }}>⚠️ This will hide the habit and all its history.</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity 
                onPress={() => setDeletingHabit(null)} 
                style={{ paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#f3f4f6', borderRadius: 10 }}
                disabled={isDeleting}
              >
                <Text style={{ color: '#6b7280', fontWeight: '600', fontSize: 15 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={confirmDeleteHabit} 
                style={{ paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 80, alignItems: 'center' }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>

        {/* Habit Create/Edit Modal - Collapsible Design */}
        <HabitCreateModalCollapsible
          visible={showCreateHabit}
          onDismiss={() => {
            setShowCreateHabit(false);
            setEditingHabit(null);
          }}
          onSuccess={(message) => {
            loadHabitsAndAnalytics();
            setShowCreateHabit(false);
            setSnackbar({ visible: true, message, type: 'success' });
          }}
          onError={(message) => {
            setShowCreateHabit(false);
            setSnackbar({ visible: true, message, type: 'error' });
          }}
          habit={editingHabit}
        />

        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={3000}
          style={{ backgroundColor: snackbar.type === 'error' ? '#ef4444' : '#22c55e' }}
        >
          {snackbar.message}
        </Snackbar>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  allHabitsItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  allHabitsTitle: {
    color: '#18181b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  allHabitsSubtext: {
    color: '#6b7280',
    fontSize: 12,
  },
  editButton: {
    padding: 6,
    marginRight: 4,
    backgroundColor: '#fbbf24',
    borderRadius: 8,
  },
  deleteButton: {
    padding: 6,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
});
