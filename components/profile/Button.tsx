import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, SPACING } from './constants';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'secondary';
  style?: ViewStyle;
  disabled?: boolean;
}

export default function Button({ label, onPress, variant = 'primary', style, disabled = false }: ButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.button, styles[variant], disabled && styles.disabled, style]} 
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`] as any, disabled && styles.disabledText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  primaryText: {
    color: COLORS.white,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  dangerText: {
    color: COLORS.white,
  },
  secondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryText: {
    color: COLORS.primary,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
  disabledText: {
    color: '#6B7280',
  },
});