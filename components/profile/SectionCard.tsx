import { StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS, SPACING } from './constants';

interface SectionCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function SectionCard({ children, style }: SectionCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});