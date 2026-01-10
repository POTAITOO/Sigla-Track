import { useAuth } from '@/context/authContext';
import { eventServices } from '@/services/eventServices';
import { toastService } from '@/services/toastService';
import { EventCreateInput } from '@/types/event';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Chip, Modal, Portal, Text, TextInput, Title } from 'react-native-paper';

const CATEGORIES = ['work', 'personal', 'meeting', 'deadline', 'other'] as const;
const COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'];

type EventWithId = {
  id: string;
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  location?: string;
  category: typeof CATEGORIES[number];
  color: string;
  reminder: number;
};

type EventCreateModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  event?: EventWithId | null;
};

const EventCreateModal = ({ visible, onDismiss, onSuccess, onError, event }: EventCreateModalProps) => {
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
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 3600000));
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>('personal');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [reminder, setReminder] = useState('15');

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setLocation(event.location || '');
      setStartDate(event.startDate instanceof Date ? event.startDate : new Date(event.startDate));
      setEndDate(event.endDate instanceof Date ? event.endDate : new Date(event.endDate));
      setSelectedCategory(event.category || 'personal');
      setSelectedColor(event.color || COLORS[0]);
      setReminder(event.reminder?.toString() || '15');
      setErrors({});
      setExpandedSections({ basic: true, schedule: true, custom: false });
    } else {
      resetForm();
    }
  }, [event, visible]);

  const handleStartDateChange = (_: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
      setStartDate(newDate);
    }
  };

  const handleStartTimeChange = (_: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const newTime = new Date(startDate);
      newTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      setStartDate(newTime);
    }
  };

  const handleEndDateChange = (_: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);
      setEndDate(newDate);
    }
  };

  const handleEndTimeChange = (_: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const newTime = new Date(endDate);
      newTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      setEndDate(newTime);
    }
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
    setLocation('');
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 3600000));
    setSelectedCategory('personal');
    setSelectedColor(COLORS[0]);
    setReminder('15');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string | null } = {};
    if (!title.trim()) newErrors.title = 'Please enter an event title.';
    if (startDate >= endDate) newErrors.endDate = 'End date must be after start date.';
    const reminderInt = parseInt(reminder, 10);
    if (isNaN(reminderInt) || reminderInt < 0) {
      newErrors.reminder = 'Reminder must be a non-negative number.';
    }
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === null);
  };

  const handleCreateEvent = async () => {
    if (!validateForm()) return;
    if (!user?.uid) {
      if (onError) onError('User not authenticated.');
      return;
    }

    setLoading(true);
    try {
      const eventData: EventCreateInput = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startDate,
        endDate,
        category: selectedCategory,
        color: selectedColor,
        reminder: parseInt(reminder, 10),
      };

      if (event?.id) {
        await eventServices.updateEvent(event.id, eventData);
        if (onSuccess) onSuccess(`"${eventData.title}" updated successfully!`);
      } else {
        await eventServices.createEvent(user.uid, eventData);
        if (onSuccess) onSuccess(`"${eventData.title}" created successfully!`);
      }
      resetForm();
      onDismiss();
    } catch (error: any) {
      let msg = event?.id ? 'Failed to update event.' : 'Failed to create event.';
      if (typeof error?.message === 'string') {
        msg = error.message;
      }
      toastService.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
    return parts.join(' • ');
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <View style={styles.header}>
          <Title style={styles.title}>{event?.id ? 'Edit Event' : 'Create Event'}</Title>
          <Text style={styles.subtitle}>{event?.id ? 'Update your event' : 'Plan a new event'}</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information Section */}
          <View style={styles.section}>
            <SectionHeader title="ℹ️ Basic Information" section="basic" />
            {expandedSections.basic && (
              <View style={styles.sectionContent}>
                <TextInput
                  label="Event Title"
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

                <TextInput
                  label="Location (optional)"
                  value={location}
                  onChangeText={setLocation}
                  style={styles.input}
                  mode="outlined"
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
                        setSelectedCategory(cat);
                      }}
                      style={[styles.chip, selectedCategory === cat && styles.chipSelected]}
                      mode="outlined"
                    >
                      {cat}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Schedule Section */}
          <View style={styles.section}>
            <SectionHeader title="📅 Schedule" section="schedule" />
            {expandedSections.schedule && (
              <View style={styles.sectionContent}>
                <Text style={styles.label}>Start Date</Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowStartDatePicker(true)}
                  style={styles.dateButton}
                  labelStyle={{ fontSize: 14, color: '#6366f1' }}
                >
                  📅 {formatDate(startDate)}
                </Button>
                {showStartDatePicker && (
                  <DateTimePicker value={startDate} mode="date" display="default" onChange={handleStartDateChange} />
                )}

                <Text style={styles.label}>Start Time</Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowStartTimePicker(true)}
                  style={styles.dateButton}
                  labelStyle={{ fontSize: 14, color: '#6366f1' }}
                >
                  🕐 {formatTime(startDate)}
                </Button>
                {showStartTimePicker && (
                  <DateTimePicker value={startDate} mode="time" display="default" onChange={handleStartTimeChange} />
                )}

                <Text style={styles.label}>End Date</Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowEndDatePicker(true)}
                  style={styles.dateButton}
                  labelStyle={{ fontSize: 14, color: '#6366f1' }}
                >
                  📅 {formatDate(endDate)}
                </Button>
                {showEndDatePicker && (
                  <DateTimePicker value={endDate} mode="date" display="default" onChange={handleEndDateChange} minimumDate={startDate} />
                )}

                <Text style={styles.label}>End Time</Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowEndTimePicker(true)}
                  style={styles.dateButton}
                  labelStyle={{ fontSize: 14, color: '#6366f1' }}
                >
                  🕐 {formatTime(endDate)}
                </Button>
                {showEndTimePicker && (
                  <DateTimePicker value={endDate} mode="time" display="default" onChange={handleEndTimeChange} />
                )}
                {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}

                <Text style={styles.label}>Reminder (minutes before)</Text>
                <TextInput
                  label="Minutes"
                  value={reminder}
                  onChangeText={(text) => {
                    setReminder(text);
                    const num = parseInt(text, 10);
                    if (!isNaN(num) && num >= 0) setErrors(prev => ({ ...prev, reminder: null }));
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
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {getSummary() && (
            <Text style={styles.summary}>{getSummary()}</Text>
          )}
          <Button
            mode="contained"
            onPress={handleCreateEvent}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
          >
            {event?.id ? '✎ Update Event' : '+ Create Event'}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default EventCreateModal;

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
});
