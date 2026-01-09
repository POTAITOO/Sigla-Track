import { useAuth } from '@/context/authContext';
import { habitServices } from '@/services/habitServices';
import { HabitCreateInput } from '@/types/event';
import { HabitWithStatus } from '@/types/habitAnalytics';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Chip, Modal, Portal, Switch, Text, TextInput, Title } from 'react-native-paper';


const CATEGORIES = ['health', 'fitness', 'learning', 'productivity', 'other'] as const;
const FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COLORS = ['#2ecc71', '#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'];

type HabitCreateModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  habit?: HabitWithStatus | null;
};

const HabitCreateModalTabs = ({ visible, onDismiss, onSuccess, onError, habit }: HabitCreateModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'custom'>('basic');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number] | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<typeof FREQUENCIES[number] | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [reminder, setReminder] = useState('30');

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    if (habit) {
      setTitle(habit.title || '');
      setDescription(habit.description || '');
      setSelectedCategory(habit.category || null);
      setSelectedFrequency(habit.frequency || null);
      setSelectedDays(habit.daysOfWeek || []);
      setStartDate(habit.startDate ? new Date(habit.startDate) : new Date());
      setEndDate(habit.endDate ? new Date(habit.endDate) : null);
      setHasEndDate(!!habit.endDate);
      setSelectedColor(habit.color || COLORS[0]);
      setReminder(habit.reminder?.toString() || '30');
      setErrors({});
      setActiveTab('basic');
    } else {
      resetForm();
    }
  }, [habit, visible]);

  const handleStartDateChange = (_: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (_: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const toggleDay = (dayIndex: number) => {
    triggerHaptic();
    const newSelectedDays = selectedDays.includes(dayIndex)
      ? selectedDays.filter((d) => d !== dayIndex)
      : [...selectedDays, dayIndex].sort();
    setSelectedDays(newSelectedDays);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedCategory(null);
    setSelectedFrequency(null);
    setSelectedDays([]);
    setStartDate(new Date());
    setEndDate(null);
    setHasEndDate(false);
    setSelectedColor(COLORS[0]);
    setReminder('30');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string | null } = {};
    if (!title.trim()) newErrors.title = 'Please enter a habit title.';
    if (!selectedCategory) newErrors.category = 'Please select a category.';
    if (!selectedFrequency) newErrors.frequency = 'Please select a frequency.';
    if (selectedFrequency === 'weekly' && selectedDays.length === 0) {
      newErrors.days = 'Please select at least one day for weekly habits.';
    }
    const reminderInt = parseInt(reminder, 10);
    if (isNaN(reminderInt) || reminderInt <= 0) {
      newErrors.reminder = 'Reminder must be a positive number.';
    }
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === null);
  };

  const handleCreateHabit = async () => {
    if (!validateForm()) return;
    if (!user?.uid) {
      if (onError) onError('User not authenticated.');
      return;
    }

    setLoading(true);
    try {
      const habitData: HabitCreateInput = {
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory!,
        frequency: selectedFrequency!,
        daysOfWeek: selectedFrequency === 'weekly' ? selectedDays : undefined,
        startDate,
        endDate: hasEndDate && endDate ? endDate : undefined,
        color: selectedColor,
        reminder: parseInt(reminder, 10),
      };
      
      if (habit?.id) {
        const wasUpdated = await habitServices.updateHabit(habit.id, habitData);
        if (!wasUpdated) {
          if (onSuccess) onSuccess('No changes made to the habit.');
          onDismiss();
          return;
        }
        if (onSuccess) onSuccess(`"${habitData.title}" updated successfully!`);
      } else {
        await habitServices.createHabit(user.uid, habitData);
        if (onSuccess) onSuccess(`"${habitData.title}" created successfully!`);
      }
      resetForm();
      onDismiss();
    } catch (error: any) {
      let msg = habit?.id ? 'Failed to update habit.' : 'Failed to create habit.';
      if (typeof error?.message === 'string' && error.message.includes('already exists')) {
        msg = 'A habit with this name and category already exists.';
      }
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const TabButton = ({ tab, label, icon }: { tab: typeof activeTab; label: string; icon: string }) => (
    <TouchableOpacity
      onPress={() => {
        triggerHaptic();
        setActiveTab(tab);
      }}
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
    >
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <View style={styles.header}>
          <Title style={styles.title}>{habit?.id ? 'Edit Habit' : 'Create Habit'}</Title>
          <Text style={styles.subtitle}>{habit?.id ? 'Update your habit' : 'Build a new habit'}</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabs}>
          <TabButton tab="basic" label="Basic" icon="ℹ️" />
          <TabButton tab="schedule" label="Schedule" icon="📅" />
          <TabButton tab="custom" label="Customization" icon="🎨" />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <View>
              <Text style={styles.sectionTitle}>Habit Details</Text>
              
              <TextInput
                label="Habit Title"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (text.trim()) setErrors(prev => ({ ...prev, title: null }));
                }}
                style={styles.input}
                mode="outlined"
                error={!!errors.title}
                placeholderTextColor="#9ca3af"
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

              <TextInput
                label="Description (optional)"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.rowWrap}>
                {CATEGORIES.map((cat) => (
                  <Chip
                    key={cat}
                    selected={selectedCategory === cat}
                    onPress={() => {
                      triggerHaptic();
                      setSelectedCategory(selectedCategory === cat ? null : cat);
                      if (selectedCategory !== cat) setErrors(prev => ({ ...prev, category: null }));
                    }}
                    style={[styles.chip, selectedCategory === cat && styles.chipSelected]}
                    mode="outlined"
                  >
                    {cat}
                  </Chip>
                ))}
              </View>
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            </View>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <View>
              <Text style={styles.sectionTitle}>Schedule Settings</Text>

              <Text style={styles.label}>Frequency</Text>
              <View style={styles.rowWrap}>
                {FREQUENCIES.map((freq) => (
                  <Chip
                    key={freq}
                    selected={selectedFrequency === freq}
                    onPress={() => {
                      triggerHaptic();
                      setSelectedFrequency(selectedFrequency === freq ? null : freq);
                      if (selectedFrequency !== freq) setErrors(prev => ({ ...prev, frequency: null }));
                    }}
                    style={[styles.chip, selectedFrequency === freq && styles.chipSelected]}
                    mode="outlined"
                  >
                    {freq}
                  </Chip>
                ))}
              </View>
              {errors.frequency && <Text style={styles.errorText}>{errors.frequency}</Text>}

              {selectedFrequency === 'weekly' && (
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.label}>Select Days</Text>
                  <View style={styles.rowWrap}>
                    {DAYS_OF_WEEK.map((day, idx) => (
                      <Chip
                        key={day}
                        selected={selectedDays.includes(idx)}
                        onPress={() => toggleDay(idx)}
                        style={[styles.chip, selectedDays.includes(idx) && styles.chipSelected]}
                        mode="outlined"
                      >
                        {day}
                      </Chip>
                    ))}
                  </View>
                  {errors.days && <Text style={styles.errorText}>{errors.days}</Text>}
                </View>
              )}

              <Text style={styles.label}>Start Date</Text>
              <Button
                mode="outlined"
                onPress={() => setShowStartPicker(true)}
                style={styles.dateButton}
                labelStyle={{ fontSize: 14, color: '#6366f1' }}
              >
                📅 {formatDate(startDate)}
              </Button>
              {showStartPicker && (
                <DateTimePicker value={startDate} mode="date" display="default" onChange={handleStartDateChange} />
              )}

              <View style={styles.endDateToggle}>
                <Text style={styles.label}>End Date (optional)</Text>
                <Switch value={hasEndDate} onValueChange={setHasEndDate} />
              </View>
              {hasEndDate && (
                <>
                  <Button
                    mode="outlined"
                    onPress={() => setShowEndPicker(true)}
                    style={styles.dateButton}
                    labelStyle={{ fontSize: 14, color: '#6366f1' }}
                  >
                    📅 {endDate ? formatDate(endDate) : 'Select date'}
                  </Button>
                  {showEndPicker && (
                    <DateTimePicker value={endDate || new Date()} mode="date" display="default" onChange={handleEndDateChange} minimumDate={startDate} />
                  )}
                </>
              )}
            </View>
          )}

          {/* Customization Tab */}
          {activeTab === 'custom' && (
            <View>
              <Text style={styles.sectionTitle}>Customize Appearance</Text>

              <Text style={styles.label}>Color</Text>
              <View style={styles.rowWrap}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => {
                      triggerHaptic();
                      setSelectedColor(color);
                    }}
                    style={[
                      styles.colorButton,
                      {
                        backgroundColor: color,
                        borderWidth: selectedColor === color ? 3 : 0,
                        borderColor: selectedColor === color ? '#18181b' : 'transparent',
                      },
                    ]}
                  />
                ))}
              </View>

              <Text style={styles.label}>Reminder</Text>
              <TextInput
                label="Minutes before event"
                value={reminder}
                onChangeText={(text) => {
                  setReminder(text);
                  const num = parseInt(text, 10);
                  if (!isNaN(num) && num > 0) setErrors(prev => ({ ...prev, reminder: null }));
                }}
                style={styles.input}
                mode="outlined"
                keyboardType="number-pad"
                error={!!errors.reminder}
                placeholderTextColor="#9ca3af"
              />
              {errors.reminder && <Text style={styles.errorText}>{errors.reminder}</Text>}
            </View>
          )}
        </ScrollView>

        {/* Action Button */}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleCreateHabit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
          >
            {habit?.id ? '✎ Update Habit' : '+ Create Habit'}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default HabitCreateModalTabs;

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    maxHeight: '90%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    marginBottom: 4,
    fontWeight: 'bold',
    color: '#18181b',
    fontSize: 24,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 13,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginHorizontal: 4,
  },
  tabButtonActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#38bdf8',
    borderBottomColor: '#6366f1',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: '#6366f1',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  chipSelected: {
    backgroundColor: '#e0f2fe',
    borderColor: '#38bdf8',
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  dateButton: {
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  endDateToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 8,
    marginTop: -4,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
  },
  submitButton: {
    paddingVertical: 8,
    backgroundColor: '#6366f1',
  },
});
