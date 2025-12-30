import { Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomNav from "../components/BottomNav";

const { width, height } = Dimensions.get('window');

export default function Schedule() {
  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth() + 1;
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

  const monthsShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

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

  // Generate time slots in 30-minute intervals
  const timeSlots = [];
  for (let h = 0; h < 24; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  const events = [
    {
      id: 1,
      title: 'Project Discussion',
      description: '09:00AM - 10:00AM',
      color: '#FFE4CC',
      textColor: '#D97706',
      startTime: '09:00',
      endTime: '10:00',
      date: 30,
      month: 12,
      year: 2025,
    },
    {
      id: 2,
      title: 'Lunch Time',
      description: 'Kain na 11-12pm',
      color: '#D1F2EB',
      textColor: '#0F766E',
      startTime: '11:00',
      endTime: '12:00',
      date: 30,
      month: 12,
      year: 2025,
    },
    {
      id: 3,
      title: 'Maligo Time',
      description: 'dasdasdassd',
      color: '#FFE4CC',
      textColor: '#D97706',
      startTime: '13:30',
      endTime: '14:30',
      date: 30,
      month: 12,
      year: 2025,
    },
    {
      id: 4,
      title: 'gawa assignments',
      description: 'Softeng/COSC 80/Lunes',
      color: '#D1F2EB',
      textColor: '#0F766E',
      startTime: '15:00',
      endTime: '16:00',
      date: 30,
      month: 12,
      year: 2025,
    },
  ];

  // Helper function to convert time string to slot index
  const timeToSlot = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 2) + (minutes >= 30 ? 1 : 0);
  };

  // Helper function to calculate duration in slots
  const calculateDuration = (startTime: string, endTime: string) => {
    return timeToSlot(endTime) - timeToSlot(startTime);
  };

  const eventsForSelectedDate = events.filter(
    event => 
      event.date === selectedDate && 
      event.month === selectedMonth && 
      event.year === selectedYear
  );

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex + 1);
    setShowMonthPicker(false);
    setSelectedDate(1);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setShowYearPicker(false);
    setSelectedDate(1);
  };

  const handleMonthButtonPress = () => {
    setShowMonthPicker(true);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.yearButton}
              onPress={() => setShowYearPicker(true)}
            >
              <Text style={styles.yearText}>{selectedYear}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.monthButton}
              onPress={handleMonthButtonPress}
            >
              <Text style={styles.monthText}>
                {monthsShort[selectedMonth - 1]}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Days Horizontal Scroll */}
        <View style={styles.daysContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
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
                    isSelected && styles.dayItemActive,
                  ]}
                  onPress={() => setSelectedDate(item.date)}
                >
                  <Text style={[styles.dayLetter, isSelected && styles.dayTextActive]}>
                    {item.day}
                  </Text>
                  <Text style={[styles.dayNumber, isSelected && styles.dayTextActive]}>
                    {item.date}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Schedule */}
        <ScrollView
          style={styles.scheduleContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scheduleContent}
        >
          {timeSlots.map((time, index) => {
            const hasEvent = eventsForSelectedDate.some(
              event => {
                const startSlot = timeToSlot(event.startTime);
                const duration = calculateDuration(event.startTime, event.endTime);
                return index >= startSlot && index < startSlot + duration;
              }
            );
            
            return (
              <View key={index} style={styles.timeSlotRow}>
                <View style={styles.timeColumn}>
                  {time.endsWith(':00') && (
                    <Text style={styles.timeText}>{time}</Text>
                  )}
                </View>
                
                <View style={styles.eventColumnWrapper}>
                  <View style={styles.verticalLine} />
                  
                  <View style={styles.eventColumn}>
                    {eventsForSelectedDate
                      .filter((event) => timeToSlot(event.startTime) === index)
                      .map((event) => {
                        const duration = calculateDuration(event.startTime, event.endTime);
                        return (
                          <View
                            key={event.id}
                            style={[
                              styles.eventCard,
                              { 
                                backgroundColor: event.color,
                                minHeight: duration * 35,
                              },
                            ]}
                          >
                            <View style={[styles.colorBar, { backgroundColor: event.textColor }]} />
                            <View style={styles.eventContent}>
                              <Text 
                                style={[styles.eventTitle, { color: event.textColor }]}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                              >
                                {event.title}
                              </Text>
                              <Text 
                                style={[styles.eventDescription, { color: event.textColor }]}
                                numberOfLines={3}
                                ellipsizeMode="tail"
                              >
                                {event.description}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                  </View>
                </View>
              </View>
            );
          })}
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
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
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
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
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
          </TouchableOpacity>
        </Modal>
        <BottomNav />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 44 : Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  yearText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  monthText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#6B7280',
  },
  daysContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  daysContentContainer: {
    paddingHorizontal: 12,
    gap: 8,
  },
  dayItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 50,
  },
  dayItemActive: {
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  dayLetter: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  scheduleContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scheduleContent: {
    paddingBottom: 30,
  },
  timeSlotRow: {
    flexDirection: 'row',
    minHeight: 35,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  timeColumn: {
    width: 60,
    paddingLeft: 16,
    paddingTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  eventColumnWrapper: {
    flex: 1,
    position: 'relative',
    paddingLeft: 16,
  },
  verticalLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E5E7EB',
  },
  eventColumn: {
    flex: 1,
    paddingRight: 16,
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 2,
  },
  colorBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'flex-start',
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 16,
  },
  eventDescription: {
    fontSize: 11,
    lineHeight: 14,
    flexShrink: 1,
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
    width: width * 0.85,
    maxHeight: height * 0.7,
    padding: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerScroll: {
    maxHeight: height * 0.55,
  },
  pickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  pickerItemActive: {
    backgroundColor: '#000000',
  },
  pickerItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  pickerItemTextActive: {
    color: '#FFFFFF',
  },
});