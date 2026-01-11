import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, SPACING } from './constants';

interface SettingItemProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}

export default function SettingItem({ label, onPress, style }: SettingItemProps) {
  return (
    <TouchableOpacity style={[styles.settingItem, style]} onPress={onPress}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.borderLight,
  },
});