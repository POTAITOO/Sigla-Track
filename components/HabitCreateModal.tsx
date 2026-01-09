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

const HabitCreateModal = ({ visible, onDismiss, onSuccess, onError, habit }: HabitCreateModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
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

  // Picker visibility
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  // Haptic feedback helper
  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Update form when habit prop changes (for editing)
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
    } else {
      resetForm();
    }
  }, [habit]);

  const handleStartDateChange = (_: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      if (hasEndDate && endDate && selectedDate >= endDate) {
        setErrors(prev => ({ ...prev, endDate: 'End date must be after start date.' }));
      } else {
        setErrors(prev => ({ ...prev, endDate: null }));
      }
    }
  };

  const handleEndDateChange = (_: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      if (startDate >= selectedDate) {
        setErrors(prev => ({ ...prev, endDate: 'End date must be after start date.' }));
      } else {
        setErrors(prev => ({ ...prev, endDate: null }));
      }
    }
  };

  const toggleDay = (dayIndex: number) => {
    triggerHaptic();
    const newSelectedDays = selectedDays.includes(dayIndex)
      ? selectedDays.filter((d) => d !== dayIndex)
      : [...selectedDays, dayIndex].sort();
    setSelectedDays(newSelectedDays);
    if (selectedFrequency === 'weekly' && newSelectedDays.length === 0) {
      setErrors(prev => ({ ...prev, days: 'Select at least one day for weekly habits.' }));
    } else {
      setErrors(prev => ({ ...prev, days: null }));
    }
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
    if (hasEndDate && endDate && startDate >= endDate) {
      newErrors.endDate = 'End date must be after start date.';
    }
    const reminderInt = parseInt(reminder, 10);
    if (isNaN(reminderInt) || reminderInt <= 0) {
      newErrors.reminder = 'Reminder must be a positive number of minutes.';
    }
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === null);
  };

  const handleCreateHabit = async () => {
    if (!validateForm()) return;
    if (!user?.uid) {
      if (onError) onError('User not authenticated. Please log in.');
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
          // No changes were made
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

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <View style={styles.header}>
          <Title style={styles.title}>{habit?.id ? 'Edit Habit' : 'Create New Habit'}</Title>
          <Text style={styles.subtitle}>{habit?.id ? 'Update your habit details' : 'Start building a new habit today'}</Text>
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
        >
          {/* Basic Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
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
          </View>

          {/* Category Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.rowWrap}>
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  selected={selectedCategory === cat}
                  onPress={() => {
                    triggerHaptic();
                    const newCategory = selectedCategory === cat ? null : cat;
                    setSelectedCategory(newCategory);
                    if (newCategory) setErrors(prev => ({ ...prev, category: null }));
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

          {/* Frequency Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequency</Text>
            <View style={styles.rowWrap}>
              {FREQUENCIES.map((freq) => (
                <Chip
                  key={freq}
                  selected={selectedFrequency === freq}
                  onPress={() => {
                    triggerHaptic();
                    const newFrequency = selectedFrequency === freq ? null : freq;
                    setSelectedFrequency(newFrequency);
                    if (newFrequency) setErrors(prev => ({ ...prev, frequency: null }));
                  }}
                  style={[styles.chip, selectedFrequency === freq && styles.chipSelected]}
                  mode="outlined"
                >
                  {freq}
                </Chip>
              ))}
            </View>
            {errors.frequency && <Text style={styles.errorText}>{errors.frequency}</Text>}
          </View>

          {selectedFrequency === 'weekly' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Days</Text>
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

          {/* Dates Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
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
                {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
              </>
            )}
          </View>

          {/* Action Button */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customization</Text>
            
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
                      borderColor: selectedColor === color ? '#18181b' : 'transparent'
                    }
                  ]}
                />
              ))}
            </View>

            <TextInput 
              label="Reminder (minutes before)" 
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
        </ScrollView>

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

export default HabitCreateModal;

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    maxHeight: '90%',
    minHeight: '70%',
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    marginBottom: 2,
    fontWeight: 'bold',
    color: '#18181b',
    fontSize: 24,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 13,
  },
  section: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#f9fafb',
  },
  label: {
    marginTop: 6,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  submitButton: {
    paddingVertical: 8,
    backgroundColor: '#6366f1',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#f9fafb',
  },
});