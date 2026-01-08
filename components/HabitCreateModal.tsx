import { useAuth } from '@/context/authContext';
import { habitServices } from '@/services/habitServices';
import { HabitCreateInput } from '@/types/event';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Modal, Portal, Switch, Text, TextInput } from 'react-native-paper';

const CATEGORIES = ['health', 'fitness', 'learning', 'productivity', 'other'] as const;
const FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COLORS = ['#2ecc71', '#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'];

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onSuccess?: () => void;
};

export default function HabitCreateModal({ visible, onDismiss, onSuccess }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>('health');
  const [selectedFrequency, setSelectedFrequency] = useState<typeof FREQUENCIES[number]>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([0,1,2,3,4,5,6]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [reminder, setReminder] = useState('30');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleStartDateChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) setStartDate(selectedDate);
    setShowStartPicker(false);
  };
  const handleEndDateChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) setEndDate(selectedDate);
    setShowEndPicker(false);
  };
  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) => prev.includes(dayIndex)
      ? prev.filter((d) => d !== dayIndex)
      : [...prev, dayIndex].sort()
    );
  };
  const resetForm = () => {
    setTitle(''); setDescription(''); setSelectedCategory('health'); setSelectedFrequency('daily');
    setSelectedDays([0,1,2,3,4,5,6]); setStartDate(new Date()); setEndDate(null); setHasEndDate(false);
    setSelectedColor(COLORS[0]); setReminder('30');
  };
  const handleCreateHabit = async () => {
    if (!title.trim()) { Alert.alert('Error', 'Please enter a habit title'); return; }
    if (selectedFrequency === 'weekly' && selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day for weekly habits'); return; }
    if (hasEndDate && endDate && startDate >= endDate) {
      Alert.alert('Error', 'End date must be after start date'); return; }
    if (!user?.uid) { Alert.alert('Error', 'User not authenticated'); return; }
    setLoading(true);
    try {
      const habitData: HabitCreateInput = {
        title: title.trim(), description: description.trim(), category: selectedCategory,
        frequency: selectedFrequency, daysOfWeek: selectedFrequency === 'weekly' ? selectedDays : undefined,
        startDate, endDate: hasEndDate && endDate ? endDate : undefined, color: selectedColor,
        reminder: parseInt(reminder) || 30,
      };
      await habitServices.createHabit(user.uid, habitData);
      resetForm();
      onDismiss();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    } finally { setLoading(false); }
  };
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <ScrollView contentContainerStyle={{paddingBottom:24}}>
          <Text variant="titleLarge" style={{marginBottom:12}}>Create New Habit</Text>
          <TextInput label="Habit Title *" value={title} onChangeText={setTitle} style={styles.input} mode="outlined" />
          <TextInput label="Description" value={description} onChangeText={setDescription} style={styles.input} mode="outlined" multiline />
          <Text style={styles.label}>Category</Text>
          <View style={styles.rowWrap}>
            {CATEGORIES.map((cat) => (
              <Chip key={cat} selected={selectedCategory===cat} onPress={()=>setSelectedCategory(cat)} style={{margin:2}}>{cat}</Chip>
            ))}
          </View>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.rowWrap}>
            {FREQUENCIES.map((freq) => (
              <Chip key={freq} selected={selectedFrequency===freq} onPress={()=>setSelectedFrequency(freq)} style={{margin:2}}>{freq}</Chip>
            ))}
          </View>
          {selectedFrequency==='weekly' && (
            <View style={{marginVertical:8}}>
              <Text style={styles.label}>Select Days</Text>
              <View style={styles.rowWrap}>
                {DAYS_OF_WEEK.map((day, idx) => (
                  <Chip key={day} selected={selectedDays.includes(idx)} onPress={()=>toggleDay(idx)} style={{margin:2}}>{day}</Chip>
                ))}
              </View>
            </View>
          )}
          <Text style={styles.label}>Start Date *</Text>
          <Button mode="outlined" onPress={()=>setShowStartPicker(true)} style={{marginBottom:8}}>{formatDate(startDate)}</Button>
          {showStartPicker && (
            <DateTimePicker value={startDate} mode="date" display="default" onChange={handleStartDateChange} />
          )}
          <View style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
            <Text style={styles.label}>End Date (Optional)</Text>
            <Switch value={hasEndDate} onValueChange={setHasEndDate} style={{marginLeft:8}} />
          </View>
          {hasEndDate && (
            <>
              <Button mode="outlined" onPress={()=>setShowEndPicker(true)} style={{marginBottom:8}}>{endDate?formatDate(endDate):'Select date'}</Button>
              {showEndPicker && (
                <DateTimePicker value={endDate||new Date()} mode="date" display="default" onChange={handleEndDateChange} />
              )}
            </>
          )}
          <Text style={styles.label}>Color</Text>
          <View style={styles.rowWrap}>
            {COLORS.map((color) => (
              <Button
                key={color}
                mode={selectedColor===color?'contained':'outlined'}
                onPress={()=>setSelectedColor(color)}
                style={{margin:2,backgroundColor:color}}
              >
                {/* Add a non-breaking space or a colored circle for accessibility */}
                <Text style={{opacity:0}}>&nbsp;</Text>
              </Button>
            ))}
          </View>
          <TextInput label="Reminder (minutes before)" value={reminder} onChangeText={setReminder} style={styles.input} mode="outlined" keyboardType="number-pad" />
          <Button mode="contained" onPress={handleCreateHabit} loading={loading} disabled={loading} style={{marginTop:16}}>
            Save Habit
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    maxHeight: '90%',
  },
  input: {
    marginBottom: 8,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
});
