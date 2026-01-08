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
        await habitServices.updateHabit(habit.id, habitData);
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
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <Title style={styles.title}>{habit?.id ? 'Edit Habit' : 'Create New Habit'}</Title>
          
          <TextInput 
            label="Habit Title *" 
            value={title} 
            onChangeText={(text) => {
              setTitle(text);
              if (text.trim()) setErrors(prev => ({ ...prev, title: null }));
            }} 
            style={styles.input} 
            mode="outlined"
            error={!!errors.title}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

          <TextInput label="Description" value={description} onChangeText={setDescription} style={styles.input} mode="outlined" multiline />

          <Text style={styles.label}>Category *</Text>
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
                style={styles.chip}
                mode="outlined"
              >
                {cat}
              </Chip>
            ))}
          </View>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

          <Text style={styles.label}>Frequency *</Text>
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
                style={styles.chip}
                mode="outlined"
              >
                {freq}
              </Chip>
            ))}
          </View>
          {errors.frequency && <Text style={styles.errorText}>{errors.frequency}</Text>}

          {selectedFrequency === 'weekly' && (
            <View style={{ marginVertical: 8 }}>
              <Text style={styles.label}>Select Days *</Text>
              <View style={styles.rowWrap}>
                {DAYS_OF_WEEK.map((day, idx) => (
                  <Chip key={day} selected={selectedDays.includes(idx)} onPress={() => toggleDay(idx)} style={styles.chip} mode="outlined">{day}</Chip>
                ))}
              </View>
              {errors.days && <Text style={styles.errorText}>{errors.days}</Text>}
            </View>
          )}

          <Text style={styles.label}>Start Date *</Text>
          <Button mode="outlined" onPress={() => setShowStartPicker(true)} style={{ marginBottom: 8 }}>{formatDate(startDate)}</Button>
          {showStartPicker && (
            <DateTimePicker value={startDate} mode="date" display="default" onChange={handleStartDateChange} />
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={styles.label}>End Date (Optional)</Text>
            <Switch value={hasEndDate} onValueChange={setHasEndDate} />
          </View>
          {hasEndDate && (
            <>
              <Button mode="outlined" onPress={() => setShowEndPicker(true)} style={{ marginBottom: 8 }}>
                {endDate ? formatDate(endDate) : 'Select date'}
              </Button>
              {showEndPicker && (
                <DateTimePicker value={endDate || new Date()} mode="date" display="default" onChange={handleEndDateChange} minimumDate={startDate} />
              )}
              {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
            </>
          )}

          <Text style={styles.label}>Color</Text>
          <View style={styles.rowWrap}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => {
                  triggerHaptic();
                  setSelectedColor(color);
                }}
                style={[styles.colorButton, { backgroundColor: color, borderWidth: selectedColor === color ? 2 : 0 }]}
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
          />
          {errors.reminder && <Text style={styles.errorText}>{errors.reminder}</Text>}

          <Button mode="contained" onPress={handleCreateHabit} loading={loading} disabled={loading} style={{ marginTop: 24, paddingVertical: 6 }}>
            {habit?.id ? 'Update Habit' : 'Create Habit'}
          </Button>
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    maxHeight: '90%',
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#18181b',
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: 4,
    borderColor: '#6366f1',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 8,
    marginTop: -4,
  },
});