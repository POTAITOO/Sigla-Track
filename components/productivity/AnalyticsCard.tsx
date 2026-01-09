import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Surface } from 'react-native-paper';

type AnalyticsCardProps = {
  title: string;
  value: string | number;
  subtext: string;
  icon: string;
  color: string;
  bgColor: string;
  onPress: () => void;
  children?: React.ReactNode;
};

const AnalyticsCard = ({ title, value, subtext, icon, color, bgColor, onPress, children }: AnalyticsCardProps) => {
  return (
    <TouchableOpacity style={{ width: '48%' }} activeOpacity={0.7} onPress={onPress}>
      <Surface style={{ backgroundColor: '#fff', borderRadius: 20, marginBottom: 16, padding: 18, elevation: 3, shadowColor: color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ backgroundColor: bgColor, width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesome6 name={icon} size={20} color={color} />
          </View>
          <View style={{ backgroundColor: bgColor, width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesome6 name="chevron-right" size={12} color={color} />
          </View>
        </View>
        <Text style={{ color: '#6b7280', fontSize: 13, fontWeight: '600', marginBottom: 4 }}>{title}</Text>
        <Text style={{ color: '#18181b', fontWeight: 'bold', fontSize: 32, marginBottom: 2 }}>{value}</Text>
        {children || <Text style={{ color: color, fontSize: 12, fontWeight: '600' }}>{subtext}</Text>}
      </Surface>
    </TouchableOpacity>
  );
};

export default AnalyticsCard;
