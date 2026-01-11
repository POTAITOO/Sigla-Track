import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from './constants';
import SectionCard from './SectionCard';

export default function PrivacySecurity() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <SectionCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text style={styles.title}>Privacy & Security</Text>
          <Text style={styles.description}>
            Your privacy and security are important to us. Learn about how we protect your data.
          </Text>
        </View>
      </SectionCard>

      <SectionCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Data Protection</Text>
          <Text style={styles.text}>
            Your personal information is encrypted and securely stored. We never share your data with third parties without your consent.
          </Text>
        </View>
      </SectionCard>

      <SectionCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>What Data We Collect</Text>
          <Text style={styles.feature}>• Email address and account credentials</Text>
          <Text style={styles.feature}>• Profile information (name and bio)</Text>
          <Text style={styles.feature}>• Habit and event tracking data</Text>
          <Text style={styles.feature}>• App usage analytics</Text>
        </View>
      </SectionCard>

      <SectionCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Two-Factor Authentication</Text>
          <Text style={styles.text}>
            Coming soon: Enable two-factor authentication to add an extra layer of security to your account.
          </Text>
        </View>
      </SectionCard>

      <SectionCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Password Security</Text>
          <Text style={styles.feature}>• Use a strong password (8+ characters)</Text>
          <Text style={styles.feature}>• Include uppercase letters, numbers, and special characters</Text>
          <Text style={styles.feature}>• Change your password regularly</Text>
          <Text style={styles.feature}>• Never share your password with others</Text>
        </View>
      </SectionCard>

      <SectionCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <Text style={styles.text}>
            For our complete privacy policy, please visit our website or contact our support team.
          </Text>
        </View>
      </SectionCard>

      <SectionCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Report a Security Issue</Text>
          <Text style={styles.text}>
            If you discover a security vulnerability, please report it to:
          </Text>
          <Text style={styles.contact}>security@sigla-track.com</Text>
        </View>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  text: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  feature: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  contact: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
});
