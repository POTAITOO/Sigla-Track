import CustomAlert from '@/components/CustomAlert';
import { useAuth } from '@/context/authContext';
import { habitServices } from '@/services/habitServices';
import { toastService } from '@/services/toastService';
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

const HabitCreateModalCollapsible = ({ visible, onDismiss, onSuccess, onError, habit }: HabitCreateModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    schedule: true,
    custom: false,
  });

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
  const [reminderTime, setReminderTime] = useState('');
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [originalHabit, setOriginalHabit] = useState<HabitWithStatus | null>(null);
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);
  const [showLoadingAlert, setShowLoadingAlert] = useState(false);

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
      setReminderTime(habit.reminderTime || '');
      setOriginalHabit(habit);
      setErrors({});
    } else {
      resetForm();
      setOriginalHabit(null);
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

  const toggleSection = (section: keyof typeof expandedSections) => {
    triggerHaptic();
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
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
    setReminderTime('');
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
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Compare only dates, not time
    if (startDate < now) newErrors.startDate = 'Habit must start today or in the future.';
    if (hasEndDate && endDate && startDate > endDate) {
      newErrors.endDate = 'End date must be after start date.';
    }
    if (!reminderTime || !/^\d{2}:\d{2}$/.test(reminderTime)) {
      newErrors.reminderTime = 'Please set a valid reminder time (HH:MM format).';
    }
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === null);
  };

  const hasChanges = () => {
    if (!originalHabit) return true; // Creating new habit, allow dismiss
    return (
      title !== originalHabit.title ||
      description !== originalHabit.description ||
      selectedCategory !== originalHabit.category ||
      selectedFrequency !== originalHabit.frequency ||
      JSON.stringify(selectedDays) !== JSON.stringify(originalHabit.daysOfWeek || []) ||
      startDate.getTime() !== new Date(originalHabit.startDate).getTime() ||
      (hasEndDate && endDate ? endDate.getTime() : null) !== (originalHabit.endDate ? new Date(originalHabit.endDate).getTime() : null) ||
      selectedColor !== originalHabit.color ||
      reminderTime !== originalHabit.reminderTime
    );
  };

  const handleDismiss = () => {
    if (hasChanges()) {
      setShowDiscardAlert(true);
    } else {
      onDismiss();
    }
  };

  const handleCreateHabit = async () => {
    if (!validateForm()) return;
    if (!user?.uid) {
      if (onError) onError('User not authenticated.');
      return;
    }

    setLoading(true);
    setShowLoadingAlert(true);
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
        reminderTime: reminderTime,
      };

      if (habit?.id) {
        const wasUpdated = await habitServices.updateHabit(habit.id, habitData);
        if (!wasUpdated) {
          onDismiss();
          return;
        }
      } else {
        await habitServices.createHabit(user.uid, habitData);
      }
      resetForm();
      onDismiss();
    } catch (error: any) {
      let msg = habit?.id ? 'Failed to update habit.' : 'Failed to create habit.';
      if (typeof error?.message === 'string' && error.message.includes('already exists')) {
        msg = 'A habit with this name and category already exists.';
      }
      toastService.error(msg);
    } finally {
      setLoading(false);
      setShowLoadingAlert(false);
    }
  };

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const SectionHeader = ({ title, section }: { title: string; section: keyof typeof expandedSections }) => (
    <TouchableOpacity
      onPress={() => toggleSection(section)}
      style={styles.sectionHeader}
    >
      <Text style={styles.sectionHeaderTitle}>{title}</Text>
      <Text style={styles.sectionToggle}>{expandedSections[section] ? '−' : '+'}</Text>
    </TouchableOpacity>
  );

  const getSummary = () => {
    const parts = [];
    if (title) parts.push(title);
    if (selectedCategory) parts.push(selectedCategory);
    if (selectedFrequency) parts.push(selectedFrequency);
    return parts.join(' • ');
  };

  return (
    <Portal>
      <CustomAlert
        visible={showDiscardAlert}
        type="warning"
        title="Discard Changes?"
        message="You have unsaved changes. Do you want to discard them?"
        buttons={[
          { text: 'Keep Editing', onPress: () => setShowDiscardAlert(false), style: 'cancel' },
          { text: 'Discard', onPress: () => { setShowDiscardAlert(false); onDismiss(); }, style: 'destructive' },
        ]}
        onDismiss={() => setShowDiscardAlert(false)}
      />
      <CustomAlert
        visible={showLoadingAlert}
        type="info"
        title={habit?.id ? 'Updating Habit...' : 'Creating Habit...'}
        message="Please wait while we save your habit."
        buttons={[]}
        onDismiss={() => {}}
      />
      <Modal visible={visible} onDismiss={handleDismiss} dismissable={true} contentContainerStyle={styles.modal}>
        <View style={styles.header}>
          <Title style={styles.title}>{habit?.id ? 'Edit Habit' : 'Create Habit'}</Title>
          <Text style={styles.subtitle}>{habit?.id ? 'Update your habit' : 'Build a new habit'}</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information Section */}
          <View style={styles.section}>
            <SectionHeader title="ℹ️ Basic Information" section="basic" />
            {expandedSections.basic && (
              <View style={styles.sectionContent}>
                <TextInput
                  label="Habit Title *"
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (text.trim()) setErrors(prev => ({ ...prev, title: null }));
                  }}
                  style={[styles.input, errors.title && styles.inputError]}
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

                <Text style={styles.label}>Category *</Text>
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
          </View>

          {/* Schedule Section */}
          <View style={styles.section}>
            <SectionHeader title="📅 Schedule" section="schedule" />
            {expandedSections.schedule && (
              <View style={styles.sectionContent}>
                <Text style={styles.label}>Frequency *</Text>
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
                    <Text style={styles.label}>Select Days *</Text>
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
                  <DateTimePicker value={startDate} mode="date" display="default" onChange={handleStartDateChange} minimumDate={new Date()} />
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
          </View>

          {/* Customization Section */}
          <View style={styles.section}>
            <SectionHeader title="🎨 Customization" section="custom" />
            {expandedSections.custom && (
              <View style={styles.sectionContent}>
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

                <Text style={styles.label}>Reminder Time *</Text>
                <TouchableOpacity
                  onPress={() => setShowReminderTimePicker(true)}
                  style={[styles.input, { justifyContent: 'center', paddingHorizontal: 12, height: 56 }]}
                >
                  <Text style={{ fontSize: 16, color: reminderTime ? '#000' : '#9ca3af' }}>
                    {reminderTime || 'Select reminder time'}
                  </Text>
                </TouchableOpacity>
                {errors.reminderTime && <Text style={styles.errorText}>{errors.reminderTime}</Text>}
                
                {showReminderTimePicker && (
                  <DateTimePicker
                    value={new Date(`2000-01-01T${reminderTime}:00`)}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedTime) => {
                      setShowReminderTimePicker(false);
                      if (selectedTime) {
                        const hours = String(selectedTime.getHours()).padStart(2, '0');
                        const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
                        setReminderTime(`${hours}:${minutes}`);
                        setErrors(prev => ({ ...prev, reminderTime: null }));
                      }
                    }}
                  />
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {getSummary() && (
            <Text style={styles.summary}>{getSummary()}</Text>
          )}
          {(() => {
            const isDisabled = loading || (habit?.id ? !hasChanges() : false);
            return (
              <Button
                mode="contained"
                onPress={handleCreateHabit}
                loading={loading}
                disabled={isDisabled}
                style={[styles.submitButton, isDisabled && styles.submitButtonDisabled]}
                labelStyle={{ fontSize: 16, fontWeight: 'bold', color: isDisabled ? '#9ca3af' : '#fff' }}
              >
                {habit?.id ? '✎ Update Habit' : '+ Create Habit'}
              </Button>
            );
          })()}
        </View>
      </Modal>
    </Portal>
  );
};

export default HabitCreateModalCollapsible;

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
    paddingTop: 18,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  section: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6366f1',
    letterSpacing: 0.3,
  },
  sectionToggle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
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
    backgroundColor: '#fff',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
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
  summary: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  submitButton: {
    paddingVertical: 8,
    backgroundColor: '#6366f1',
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
});
