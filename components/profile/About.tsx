import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from './constants';
import SectionCard from './SectionCard';

export default function About() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <SectionCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text style={styles.title}>About Sigla-Track</Text>
          <Text style={styles.description}>
            Sigla-Track is a productivity and habit tracking application designed to help you achieve your goals and build positive habits.
          </Text>
        </View>
      </SectionCard>

      <SectionCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>App Version</Text>
          <Text style={styles.text}>1.0.0</Text>
        </View>
      </SectionCard>

      <SectionCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Features</Text>
          <Text style={styles.feature}>• Track daily habits and goals</Text>
          <Text style={styles.feature}>• Monitor productivity and progress</Text>
          <Text style={styles.feature}>• View event schedules</Text>
          <Text style={styles.feature}>• Manage your profile and settings</Text>
          <Text style={styles.feature}>• Track points and achievements</Text>
        </View>
      </SectionCard>

      <SectionCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Developer</Text>
          <Text style={styles.text}>Sigla-Track Development Team</Text>
        </View>
      </SectionCard>

      <SectionCard style={styles.section}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Contact & Support</Text>
          <Text style={styles.text}>For support or feedback, please contact us at:</Text>
          <Text style={styles.contact}>support@sigla-track.com</Text>
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
