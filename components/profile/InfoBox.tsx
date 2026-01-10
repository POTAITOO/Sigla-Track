import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { COLORS, SPACING } from './constants';

interface InfoBoxProps {
  label: string;
  value: string;
  style?: ViewStyle;
}

export default function InfoBox({ label, value, style }: InfoBoxProps) {
  return (
    <View style={[styles.infoBox, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});