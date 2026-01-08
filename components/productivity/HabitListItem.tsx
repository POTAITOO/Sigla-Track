import { HabitWithStatus } from '@/types/habitAnalytics';
import { getCategoryIcon } from '@/utils/productivityUtils';
import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Surface } from 'react-native-paper';

type HabitListItemProps = {
  habit: HabitWithStatus;
  onComplete: (habitId: string) => void;
  completingHabitId: string | null;
};

const HabitListItem = ({ habit, onComplete, completingHabitId }: HabitListItemProps) => {
  const categoryIcon = getCategoryIcon(habit.category);

  return (
    <Surface key={habit.id} style={{ backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: habit.color || '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <FontAwesome6 name={categoryIcon.name} size={24} color={categoryIcon.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#18181b' }}>{habit.title}</Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>{habit.frequency} • {habit.streak > 0 ? `${habit.streak}d streak` : 'No streak'}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={{ width: 40, height: 40, backgroundColor: '#6366f1', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
        onPress={() => onComplete(habit.id)}
        disabled={completingHabitId === habit.id}
      >
        {completingHabitId === habit.id ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={{ fontSize: 20, color: '#fff', fontWeight: 'bold' }}>✓</Text>
        )}
      </TouchableOpacity>
    </Surface>
  );
};

export default HabitListItem;
