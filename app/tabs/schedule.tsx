import { useAuth } from '@/context/authContext';
import { eventServices } from '@/services/eventServices';
import { useFocusEffect } from '@react-navigation/native';
import * as Calendar from 'expo-calendar';
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color?: string;
}

export default function Schedule() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const NAVBAR_HEIGHT = 72;

  // Dynamic header style to access insets
  const headerStyle = {
    ...styles.header,
    paddingTop: insets.top + 16,
  };

  const today = new Date();
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay()); // Start from Sunday
    return d;
  });
  const [selectedDate, setSelectedDate] = useState(new Date(today));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get the 7 days of the current week
  const getWeekDays = useCallback(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  }, [weekStartDate]);

  // Fetch both Firestore and device calendar events for the week
  const fetchAllEvents = useCallback(async () => {
    try {
      const weekDays = getWeekDays();
      const startDate = new Date(weekDays[0]);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(weekDays[6]);
      endDate.setHours(23, 59, 59, 999);

      // 1. Fetch device calendar events
      let deviceEvents: CalendarEvent[] = [];
      try {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        for (const calendar of calendars) {
          const calendarEvents = await Calendar.getEventsAsync(
            [calendar.id],
            startDate,
            endDate
          );
          const mappedEvents = calendarEvents.map((event: any) => ({
            id: `device-${event.id}`,
            title: event.title,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            color: calendar.color || '#8B5CF6',
          }));
          deviceEvents = [...deviceEvents, ...mappedEvents];
        }
      } catch (err) {
        console.error('Error fetching device calendar events:', err);
      }

      // 2. Fetch Firestore events for the user
      let firestoreEvents: CalendarEvent[] = [];
      if (user?.uid) {
        try {
          const eventsFromFirestore = await eventServices.getEventsByDateRange(user.uid, startDate, endDate);
          firestoreEvents = eventsFromFirestore.map((event: any) => ({
            id: `firestore-${event.id}`,
            title: event.title,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            color: event.color || '#60A5FA',
          }));
        } catch (err) {
          console.error('Error fetching Firestore events:', err);
        }
      }

      // 3. Merge and sort
      const allEvents = [...deviceEvents, ...firestoreEvents];
      allEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching all events:', error);
    }
  }, [getWeekDays, user]);


  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        fetchAllEvents();
      } else {
        Alert.alert('Permission required', 'Calendar permission is needed to display your events.');
      }
    })();
  }, [fetchAllEvents]);

  // Refresh events every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchAllEvents();
    }, [fetchAllEvents])
  );

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      return (
        event.startDate.getDate() === day.getDate() &&
        event.startDate.getMonth() === day.getMonth() &&
        event.startDate.getFullYear() === day.getFullYear()
      );
    });
  };

  // Get time slots for the selected day
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push({
        hour,
        label: `${String(hour).padStart(2, '0')}:00`,
      });
    }
    return slots;
  };

  const getEventsForTimeSlot = (hour: number) => {
    return getEventsForDay(selectedDate).filter(event => {
      const eventHour = event.startDate.getHours();
      return eventHour === hour;
    });
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const goToPreviousWeek = () => {
    const prev = new Date(weekStartDate);
    prev.setDate(prev.getDate() - 7);
    setWeekStartDate(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(weekStartDate);
    next.setDate(next.getDate() + 7);
    setWeekStartDate(next);
  };

  const goToToday = () => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay());
    setWeekStartDate(d);
    setSelectedDate(new Date(today));
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isToday = (date: Date) => isSameDay(date, today);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header with Month/Year and Navigation */}
        <View style={headerStyle}>
          <TouchableOpacity
            style={styles.monthDropdownButton}
            onPress={() => {
              setShowYearPicker((v) => !v);
              setShowMonthPicker(false);
            }}
          >
            <Text style={styles.headerMonth}>
              {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </Text>
            <Text style={styles.monthDropdownIcon}>{showYearPicker || showMonthPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </View>

        {/* Year Picker Dropdown */}
        {showYearPicker && (
          <View style={{ backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
            <ScrollView
              style={styles.yearPickerScroll}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {Array.from({ length: 11 }, (_, i) => today.getFullYear() - 1 + i).map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearItem,
                    selectedYear === year && styles.yearItemActive,
                  ]}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                    setShowMonthPicker(true);
                  }}
                >
                  <Text
                    style={[
                      styles.yearItemText,
                      selectedYear === year && styles.yearItemTextActive,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Month Picker Dropdown */}
        {showMonthPicker && (
          <View style={{ backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
            <View style={styles.monthPickerHeader}>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <Text style={styles.monthPickerBackButton}>‹ Back</Text>
              </TouchableOpacity>
              <Text style={styles.monthPickerYearDisplay}>{selectedYear}</Text>
              <View style={{ width: 40 }} />
            </View>
            <ScrollView
              style={styles.monthPickerScroll}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {months.map((month, idx) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthItem,
                    selectedDate.getMonth() === idx && selectedDate.getFullYear() === selectedYear && styles.monthItemActive,
                  ]}
                  onPress={() => {
                    // Set selectedDate to first day of selected month with selectedYear
                    const newDate = new Date(selectedYear, idx, 1);
                    // Set weekStartDate to the week containing the 1st of the month
                    const weekStart = new Date(newDate);
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    setSelectedDate(newDate);
                    setWeekStartDate(weekStart);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.monthItemText,
                      selectedDate.getMonth() === idx && styles.monthItemTextActive,
                    ]}
                  >
                    {month.substring(0, 3)} &apos;{String(selectedYear).slice(-2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Week Days Grid (Samsung style) */}
        <View style={styles.weekContainer}>
          <View style={styles.weekDaysGrid}>
            {getWeekDays().map((day, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayCell,
                  isSameDay(day, selectedDate) && styles.dayCellSelected,
                  isToday(day) && styles.dayCellToday,
                ]}
                onPress={() => setSelectedDate(new Date(day))}
              >
                <Text style={styles.dayOfWeek}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][day.getDay()]}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    isSameDay(day, selectedDate) && styles.dayNumberSelected,
                  ]}
                >
                  {day.getDate()}
                </Text>
                {isToday(day) && <View style={styles.todayDot} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Week Navigation */}
          <View style={styles.weekNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={goToPreviousWeek}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.weekRange}>
              {weekStartDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}{' '}
              -{' '}
              {new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString(
                'en-US',
                { month: 'short', day: 'numeric' }
              )}
            </Text>
            <TouchableOpacity
              style={styles.navButton}
              onPress={goToNextWeek}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Timeline View for Selected Day */}
        <ScrollView
          style={styles.timelineContainer}
          contentContainerStyle={[
            styles.timelineContent,
            { paddingBottom: insets.bottom + NAVBAR_HEIGHT },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {getTimeSlots().map((slot, slotIndex) => {
            const slotEvents = getEventsForTimeSlot(slot.hour);
            const isLastSlot = slotIndex === 23;

            return (
              <View key={slot.hour} style={styles.timeSlotRow}>
                {/* Time Label */}
                <View style={styles.timeColumn}>
                  <Text style={styles.timeLabel}>{slot.label}</Text>
                </View>

                {/* Events or Empty Space */}
                <View
                  style={[
                    styles.eventsColumn,
                    !isLastSlot && styles.slotDivider,
                  ]}
                >
                  {slotEvents.length > 0 ? (
                    slotEvents.map((event) => {
                      const startTime = formatTime(event.startDate);
                      const endTime = formatTime(event.endDate);

                      return (
                        <View
                          key={event.id}
                          style={[
                            styles.eventCard,
                            { backgroundColor: event.color },
                          ]}
                        >
                          <View
                            style={[
                              styles.eventBorder,
                              { backgroundColor: event.color },
                            ]}
                          />

                          <View style={styles.eventContent}>
                            <Text style={styles.eventTitle} numberOfLines={2}>
                              {event.title}
                            </Text>
                            <Text style={styles.eventTime}>
                              {startTime} - {endTime}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <View style={styles.emptySlot} />
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
}

// StyleSheet with all component styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 18,
    marginTop: 0,
  },
  headerMonth: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0E6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  yearPickerScroll: {
    marginTop: 6,
    marginBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FAFAFA',
    paddingVertical: 8,
  },
  yearItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 3,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  yearItemActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  yearItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  yearItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  monthPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  monthPickerBackButton: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  monthPickerYearDisplay: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  weekContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  weekDaysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: 'transparent',
    marginHorizontal: 2,
  },
  dayCellSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  dayCellToday: {
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  dayOfWeek: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
    marginTop: 4,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  weekRange: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  timelineContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  timelineContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  timeSlotRow: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timeColumn: {
    width: 50,
    paddingTop: 8,
    paddingRight: 12,
    justifyContent: 'flex-start',
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'center',
    minWidth: 44,
    paddingVertical: 2,
  },
  eventsColumn: {
    flex: 1,
    paddingVertical: 8,
  },
  slotDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  eventBorder: {
    width: 3,
  },
  eventContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
    lineHeight: 16,
  },
  eventTime: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  emptySlot: {
    height: 30,
  },
  // Month dropdown styles
  monthDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthDropdownIcon: {
    fontSize: 12,
    color: '#8B5CF6',
    marginLeft: 8,
    fontWeight: '600',
  },
  monthPickerScroll: {
    marginTop: 6,
    marginBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FAFAFA',
    paddingVertical: 8,
  },
  monthItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 3,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  monthItemActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  monthItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  monthItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});