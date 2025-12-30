import { Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Schedule() {
  // Get today's date
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
  const todayYear = today.getFullYear();

  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [selectedMonth, setSelectedMonth] = useState(todayMonth);
  const [selectedYear, setSelectedYear] = useState(todayYear);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // 2020 to 2030
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };


  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  // Generate all days in selected month
  const daysOfMonth = useMemo(() => {
    const days = [];
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dayIndex = (firstDay + i - 1) % 7;
      days.push({
        day: dayNames[dayIndex],
        date: i,
      });
    }
    return days;
  }, [selectedMonth, selectedYear]);


  const timeSlots = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
  ];

  // Sample events
  const events = [
    {
      id: 1,
      title: 'Project Discussion',
      time: '09:00 - 10:00',
      color: '#8B5CF6',
      slot: 9,
      date: 30,
      month: 12,
      year: 2025,
    },
    {
      id: 2,
      title: 'maglinis ng bahay',
      time: '10:00 - 11:00',
      color: '#EC4899',
      slot: 10,
      date: 29,
      month: 12,
      year: 2025,
    },
    {
      id: 3,
      title: 'Lunch time',
      time: '12:00 - 13:00',
      color: '#F59E0B',
      slot: 12,
      date: 29,
      month: 12,
      year: 2025,
    },
    {
      id: 4,
      title: 'Create color style',
      description: 'Kickoff and one page others',
      time: '15:00 - 16:00',
      color: '#10B981',
      slot: 15,
      date: 18,
      month: 9,
      year: 2025,
    },
  ];

  // Filter events for selected date, month, and year
  const eventsForSelectedDate = events.filter(
    event => 
      event.date === selectedDate && 
      event.month === selectedMonth && 
      event.year === selectedYear
  );

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex + 1);
    setShowMonthPicker(false);
    // Reset to first day of new month
    setSelectedDate(1);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setShowYearPicker(false);
    // Reset to first day
    setSelectedDate(1);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header with Dropdowns */}
        <View style={styles.header}>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowMonthPicker(true)}
            >
              <Text style={styles.dropdownText}>
                {months[selectedMonth - 1]}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowYearPicker(true)}
            >
              <Text style={styles.dropdownText}>{selectedYear}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Days Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.daysScrollContainer}
          contentContainerStyle={styles.daysContentContainer}
        >
          {daysOfMonth.map((item, index) => {
            const isToday = 
              item.date === todayDate && 
              selectedMonth === todayMonth && 
              selectedYear === todayYear;
            const isSelected = selectedDate === item.date;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayItem,
                  isToday && styles.dayItemToday,
                  isSelected && styles.dayItemActive,
                ]}
                onPress={() => setSelectedDate(item.date)}
              >
                <Text
                  style={[
                    styles.dayLetter,
                    isToday && styles.dayTextToday,
                    isSelected && styles.dayTextActive,
                  ]}
                >
                  {item.day}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    isToday && styles.dayTextToday,
                    isSelected && styles.dayTextActive,
                  ]}
                >
                  {item.date}
                </Text>
                {isToday && !isSelected && (
                  <View style={styles.todayDot} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Schedule */}
        <ScrollView
          style={styles.scheduleContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scheduleContent}
        >
          {timeSlots.map((time, index) => (
            <View key={index} style={styles.timeSlotRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>{time}</Text>
              </View>
              <View style={styles.eventColumn}>
                {eventsForSelectedDate
                  .filter((event) => event.slot === index)
                  .map((event) => (
                    <View
                      key={event.id}
                      style={[
                        styles.eventCard,
                        { backgroundColor: event.color },
                      ]}
                    >
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventTime}>{event.time}</Text>
                      {event.description && (
                        <Text style={styles.eventDescription}>
                          {event.description}
                        </Text>
                      )}
                    </View>
                  ))}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Month Picker Modal */}
        <Modal
          visible={showMonthPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMonthPicker(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMonthPicker(false)}
          >
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Select Month</Text>
              <ScrollView style={styles.pickerScroll}>
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pickerItem,
                      selectedMonth === index + 1 && styles.pickerItemActive,
                    ]}
                    onPress={() => handleMonthSelect(index)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedMonth === index + 1 && styles.pickerItemTextActive,
                      ]}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Year Picker Modal */}
        <Modal
          visible={showYearPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowYearPicker(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowYearPicker(false)}
          >
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>Select Year</Text>
              <ScrollView style={styles.pickerScroll}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.pickerItem,
                      selectedYear === year && styles.pickerItemActive,
                    ]}
                    onPress={() => handleYearSelect(year)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedYear === year && styles.pickerItemTextActive,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: width * 0.05,
    paddingTop: 60,
    paddingBottom: 20,
  },
  dropdownContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  dropdownText: {
    fontSize: width * 0.042,
    fontWeight: '700',
    color: '#0F172A',
  },
  dropdownArrow: {
    fontSize: width * 0.03,
    color: '#64748B',
  },
  daysScrollContainer: {
    maxHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  daysContentContainer: {
    paddingHorizontal: width * 0.03,
    paddingVertical: 15,
  },
  dayItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: width * 0.035,
    borderRadius: 12,
    marginHorizontal: 4,
    minWidth: width * 0.14,
    position: 'relative',
  },
  dayItemToday: {
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  dayItemActive: {
    backgroundColor: '#8B5CF6',
    borderWidth: 0,
  },
  dayLetter: {
    fontSize: width * 0.032,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '600',
  },
  dayNumber: {
    fontSize: width * 0.042,
    color: '#0F172A',
    fontWeight: '700',
  },
  dayTextToday: {
    color: '#10B981',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  todayDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  scheduleContainer: {
    flex: 1,
  },
  scheduleContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 20,
  },
  timeSlotRow: {
    flexDirection: 'row',
    minHeight: 70,
    marginBottom: 8,
  },
  timeColumn: {
    width: width * 0.15,
    paddingTop: 5,
  },
  timeText: {
    fontSize: width * 0.032,
    color: '#94A3B8',
    fontWeight: '600',
  },
  eventColumn: {
    flex: 1,
    marginLeft: width * 0.03,
  },
  eventCard: {
    borderRadius: 12,
    padding: width * 0.035,
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: width * 0.038,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: width * 0.03,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: width * 0.03,
    color: '#FFFFFF',
    opacity: 0.85,
    lineHeight: width * 0.042,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.8,
    maxHeight: width * 1.2,
    padding: 20,
  },
  pickerTitle: {
    fontSize: width * 0.05,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerScroll: {
    maxHeight: width * 0.9,
  },
  pickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  pickerItemActive: {
    backgroundColor: '#8B5CF6',
  },
  pickerItemText: {
    fontSize: width * 0.042,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  pickerItemTextActive: {
    color: '#FFFFFF',
  },
});