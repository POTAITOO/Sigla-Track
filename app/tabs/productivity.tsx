import { Stack, useRouter } from "expo-router";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Productivity() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const NAVBAR_HEIGHT = 72; // Adjust if your navbar is taller/shorter

  // Dynamic header style to access insets
  const headerStyle = {
    ...styles.header,
    paddingTop: insets.top + 16,
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Gradient Background Circles */}
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />

        {/* Header */}
        <View style={headerStyle}>
          <View style={styles.headerTop}>
            <View style={styles.titleSection}>
              <View style={styles.titleRow}>
                <Text style={styles.headerTitle}>Take</Text>
                <View style={styles.iconsRow}>
                  <View style={styles.headerIconLeft}>
                    <Text style={styles.iconShape}>📊</Text>
                  </View>
                  <View style={styles.headerIconRight}>
                    <Text style={styles.iconShape}>✓</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.headerTitle}>Charge Of</Text>
              <Text style={styles.headerTitle}>This Productivity</Text>
            </View>
            <View style={styles.decorativeIcon}>
              <View style={styles.chartBar1} />
              <View style={styles.chartBar2} />
              <View style={styles.chartBar3} />
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Prioritise and set deadlines so you don&apos;t miss anything important
          </Text>
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + NAVBAR_HEIGHT }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Horizontal ScrollView for Cards */}
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsScrollContent}
            style={styles.cardsScroll}
          >
            {/* Productivity Card - Left */}
            <View style={styles.productivityCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>✱</Text>
                <Text style={styles.cardLabel}>Your productivity</Text>
              </View>
              
              {/* Progress Circle */}
              <View style={styles.progressContainer}>
                <View style={styles.progressCircle}>
                  <View style={styles.progressArc} />
                  <View style={styles.progressInner}>
                    <Text style={styles.progressNumber}>876</Text>
                    <Text style={styles.progressLabel}>Points</Text>
                  </View>
                </View>
              </View>

              {/* Badge */}
              <View style={styles.badge}>
                <Text style={styles.badgeIcon}>✱</Text>
                <Text style={styles.badgeText}>You&apos;re productive than 89% teams</Text>
              </View>
            </View>

            {/* Stats Card - Right */}
            <View style={styles.statsCard}>
              <Text style={styles.statsNumber}>98%</Text>
              <Text style={styles.statsLabel}>Increases user productivity</Text>
              
              {/* Mini Bar Chart */}
              <View style={styles.barChart}>
                <View style={[styles.bar, { height: 60 }]} />
                <View style={[styles.bar, { height: 95 }]} />
                <View style={[styles.bar, { height: 130 }]} />
              </View>
            </View>

            {/* Additional Card with Wave Chart */}
            <View style={styles.statsCard}>
              <Text style={styles.statsNumber}>75%</Text>
              <Text style={styles.statsLabel}>Goal achievement</Text>
              
              {/* Wave Chart Representation */}
              <View style={styles.waveChart}>
                <View style={[styles.waveDot, { left: '5%', bottom: 20 }]} />
                <View style={[styles.waveDot, { left: '22%', bottom: 50 }]} />
                <View style={[styles.waveDot, { left: '39%', bottom: 35 }]} />
                <View style={[styles.waveDot, { left: '56%', bottom: 70 }]} />
                <View style={[styles.waveDot, { left: '73%', bottom: 60 }]} />
                <View style={[styles.waveDot, { left: '90%', bottom: 90 }]} />
              </View>
            </View>
          </ScrollView>

          {/* CTA Button */}
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push("/home")}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaText}>Let&apos;s get started!</Text>
            <View style={styles.ctaArrow}>
              <Text style={styles.arrowIcon}>→</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  gradientCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#E9D5FF",
    opacity: 0.5,
    top: -50,
    right: -50,
    zIndex: 0,
  },
  gradientCircle2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#D4FC79",
    opacity: 0.4,
    bottom: 200,
    left: -50,
    zIndex: 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    zIndex: 1,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    paddingRight: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  iconsRow: {
    flexDirection: "row",
    gap: 6,
  },
  headerIconLeft: {
    width: 28,
    height: 28,
    backgroundColor: "#C4F54D",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconRight: {
    width: 28,
    height: 28,
    backgroundColor: "#C4F54D",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconShape: {
    fontSize: 14,
  },
  decorativeIcon: {
    width: 80,
    height: 80,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 4,
  },
  chartBar1: {
    width: 12,
    height: 20,
    backgroundColor: "#DDD6FE",
    borderRadius: 6,
  },
  chartBar2: {
    width: 12,
    height: 35,
    backgroundColor: "#C4B5FD",
    borderRadius: 6,
  },
  chartBar3: {
    width: 12,
    height: 48,
    backgroundColor: "#A78BFA",
    borderRadius: 6,
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: "800",
    color: "#000000",
    lineHeight: 48,
  },
  headerSubtitle: {
    fontSize: 19,
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 28,
  },
  content: {
    flex: 1,
    paddingTop: 24,
    zIndex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  cardsScroll: {
    marginBottom: 32,
  },
  cardsScrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  productivityCard: {
    width: 280,
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
    alignSelf: "flex-start",
  },
  cardIcon: {
    fontSize: 14,
    color: "#000000",
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  progressCircle: {
    width: 160,
    height: 160,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressArc: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 18,
    borderColor: "#E5E7EB",
    borderTopColor: "#A78BFA",
    borderRightColor: "#A78BFA",
    transform: [{ rotate: "-90deg" }],
  },
  progressInner: {
    alignItems: "center",
  },
  progressNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: "#000000",
  },
  progressLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D9F99D",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    gap: 8,
    alignSelf: "stretch",
  },
  badgeIcon: {
    fontSize: 14,
    color: "#000000",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    lineHeight: 16,
  },
  statsCard: {
    width: 240,
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    padding: 24,
    justifyContent: "space-between",
  },
  statsNumber: {
    fontSize: 64,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 8,
    lineHeight: 72,
  },
  statsLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 30,
    lineHeight: 18,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
    height: 140,
  },
  bar: {
    flex: 1,
    backgroundColor: "#C4B5FD",
    borderRadius: 10,
  },
  waveChart: {
    height: 140,
    position: "relative",
    width: "100%",
  },
  waveRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "100%",
  },
  waveDot: {
    width: 12,
    height: 12,
    backgroundColor: "#8B5CF6",
    borderRadius: 6,
    position: "absolute",
  },
  ctaButton: {
    backgroundColor: "#000000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 32,
    position: "relative",
    marginHorizontal: 24,
    marginBottom: 24,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  ctaArrow: {
    position: "absolute",
    right: 18,
    width: 40,
    height: 40,
    backgroundColor: "#D9F99D",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowIcon: {
    fontSize: 20,
    color: "#000000",
    fontWeight: "700",
  },
});
