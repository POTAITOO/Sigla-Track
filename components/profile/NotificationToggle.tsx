import { StyleSheet, Switch, Text, View } from 'react-native';

import { COLORS, SPACING } from './constants';

interface NotificationToggleProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function NotificationToggle({
  label,
  description,
  value,
  onValueChange,
}: NotificationToggleProps) {
  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationLabel}>{label}</Text>
        <Text style={styles.notificationDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
        thumbColor={value ? COLORS.primary : COLORS.borderLight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  notificationItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  notificationDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});