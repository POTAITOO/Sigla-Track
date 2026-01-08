import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type EmptyStateProps = {
  onPress: () => void;
};

const EmptyState = ({ onPress }: EmptyStateProps) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, marginTop: 48 }}>
      <FontAwesome6 name="leaf" size={48} color="#a78bfa" style={{ marginBottom: 16 }} />
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#18181b', marginBottom: 8 }}>Start Your Journey</Text>
      <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
        No habits yet. Create your first habit to start tracking your progress and building a better you!
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: '#6366f1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 32 }}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Create First Habit</Text>
        <FontAwesome6 name="plus" size={16} color="#fff" style={{ marginLeft: 10 }} />
      </TouchableOpacity>
    </View>
  );
};

export default EmptyState;
