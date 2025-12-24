import { Stack } from "expo-router";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import BottomNav from "../components/BottomNav";

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MAIN PAGE - TODAY</Text>
          <View style={styles.statusBar}>
            <Text style={styles.statusTime}>9:41</Text>
            <View style={styles.statusIcons}>
              <Text style={styles.statusIcon}>📶</Text>
              <Text style={styles.statusIcon}>📱</Text>
              <Text style={styles.statusIcon}>🔋</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Date Card */}
          <View style={styles.dateCard}>
            <Text style={styles.dayLabel}>Tuesday</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateLeft}>
                <Text style={styles.dateNumber}>13.17</Text>
                <Text style={styles.monthLabel}>DEC</Text>
              </View>
              <View style={styles.timeColumn}>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>1:20 PM</Text>
                  <Text style={styles.timeSubLabel}>New York</Text>
                </View>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>6:20 PM</Text>
                  <Text style={styles.timeSubLabel}>United Kingdom</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tasks Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Todays tasks</Text>
              <Text style={styles.sectionLink}>Reminders</Text>
            </View>

            {/* Task Card 1 - Orange */}
            <View style={[styles.taskCard, styles.taskCardOrange]}>
              <Text style={styles.taskTitle}>You Have A Meeting</Text>
              <View style={styles.taskDetails}>
                <View style={styles.taskTime}>
                  <Text style={styles.taskTimeLabel}>3:00 PM</Text>
                  <Text style={styles.taskTimeSubLabel}>Start</Text>
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>30 Min</Text>
                </View>
                <View style={styles.taskTime}>
                  <Text style={styles.taskTimeLabel}>3:30 PM</Text>
                  <Text style={styles.taskTimeSubLabel}>End</Text>
                </View>
              </View>
            </View>

            {/* Task Card 2 - Blue */}
            <View style={[styles.taskCard, styles.taskCardBlue]}>
              <Text style={styles.taskTitle}>Call Migo for Update</Text>
              <View style={styles.taskDetails}>
                <View style={styles.taskTime}>
                  <Text style={styles.taskTimeLabel}>5:00 PM</Text>
                  <Text style={styles.taskTimeSubLabel}>Start</Text>
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>30 Min</Text>
                </View>
                <View style={styles.taskTime}>
                  <Text style={styles.taskTimeLabel}>5:30 PM</Text>
                  <Text style={styles.taskTimeSubLabel}>End</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        <BottomNav />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F2937",
  },
  header: {
    backgroundColor: "#1F2937",
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 12,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusTime: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statusIcons: {
    flexDirection: "row",
    gap: 4,
  },
  statusIcon: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  dateCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  dayLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateLeft: {
    justifyContent: "center",
  },
  dateNumber: {
    fontSize: 52,
    fontWeight: "300",
    color: "#111827",
    letterSpacing: -1,
    lineHeight: 56,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 3,
  },
  timeColumn: {
    gap: 12,
    justifyContent: "center",
  },
  timeBlock: {
    alignItems: "flex-end",
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  timeSubLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  sectionLink: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  taskCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  taskCardOrange: {
    backgroundColor: "#FDB97F",
  },
  taskCardBlue: {
    backgroundColor: "#A0B8D0",
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  taskDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  taskTime: {
    flex: 1,
  },
  taskTimeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  taskTimeSubLabel: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "500",
  },
  durationBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  durationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
  bottomSpacing: {
    height: 100,
  },
});
