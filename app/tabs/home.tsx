import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock task data
const MOCK_TASKS = [
  {
    id: 1,
    title: "You Have A Meeting",
    startTime: "3:00 PM",
    endTime: "3:30 PM",
    duration: "30 Min",
    color: "#D4A375",
  },
  {
    id: 2,
    title: "Call Migo for Update",
    startTime: "5:00 PM",
    endTime: "5:30 PM",
    duration: "30 Min",
    color: "#A8B5C0",
  },
  {
    id: 3,
    title: "Team Standup",
    startTime: "9:00 AM",
    endTime: "9:15 AM",
    duration: "15 Min",
    color: "#B8A8D4",
  },
  {
    id: 4,
    title: "Review Project Proposal",
    startTime: "1:00 PM",
    endTime: "2:00 PM",
    duration: "1 Hour",
    color: "#A8D4C0",
  },
  {
    id: 5,
    title: "Coffee Break",
    startTime: "10:30 AM",
    endTime: "11:00 AM",
    duration: "30 Min",
    color: "#D4C0A8",
  },
];

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const insets = useSafeAreaInsets();
  const NAVBAR_HEIGHT = 72;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getDayName = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[currentTime.getDay()];
  };

  const getFormattedDate = () => {
    const day = currentTime.getDate().toString().padStart(2, "0");
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    return { day, time: `${hours}:${minutes}` };
  };

  const getMonth = () => {
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    return months[currentTime.getMonth()];
  };

  const getTimeInTimezone = (timezone: string) => {
    const timeString = currentTime.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return timeString;
  };

  const { day, time } = getFormattedDate();
  const [dayPart, timePart] = time.split(":");

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#E0E0E0" />
      <View style={styles.container}>
        {/* Gradient Background Circles */}
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />

        {/* Header */}
        <View style={styles.header} />

        <View style={styles.content}>
          {/* Date Card */}
          <View style={styles.dateCard}>
            <Text style={styles.dayLabel}>{getDayName()}</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateLeft}>
                <View style={styles.dateNumberRow}>
                  <Text style={styles.dateNumber}>{dayPart}</Text>
                  <Text style={styles.dateSeparator}>:</Text>
                  <Text style={styles.dateNumber}>{timePart}</Text>
                </View>
                <Text style={styles.monthLabel}>{getMonth()}</Text>
              </View>
              <View style={styles.timeColumn}>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>
                    {getTimeInTimezone("America/New_York")}
                  </Text>
                  <Text style={styles.timeSubLabel}>New York</Text>
                </View>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>
                    {getTimeInTimezone("Europe/London")}
                  </Text>
                  <Text style={styles.timeSubLabel}>United Kingdom</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Todays tasks</Text>
            <Text style={styles.sectionLink}>Reminders</Text>
          </View>

          <ScrollView
            style={styles.tasksScrollView}
            contentContainerStyle={[styles.tasksScrollContent, { paddingBottom: insets.bottom + NAVBAR_HEIGHT }]}
            showsVerticalScrollIndicator={false}
          >
            {MOCK_TASKS.map((task) => (
              <View
                key={task.id}
                style={[styles.taskCard, { backgroundColor: task.color }]}
              >
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.taskDetails}>
                  <View style={styles.taskTime}>
                    <Text style={styles.taskTimeLabel}>{task.startTime}</Text>
                    <Text style={styles.taskTimeSubLabel}>Start</Text>
                  </View>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{task.duration}</Text>
                  </View>
                  <View style={styles.taskTimeEnd}>
                    <Text style={styles.taskTimeLabel}>{task.endTime}</Text>
                    <Text style={styles.taskTimeSubLabel}>End</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0E0E0",
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
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 1,
  },
  content: {
    paddingBottom: 20,
    paddingTop: 0,
    zIndex: 1,
  },
  dateCard: {
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 0,
    padding: 0,
    borderRadius: 0,
    shadowColor: "transparent",
  },
  dayLabel: {
    fontSize: 24,
    color: "#000000",
    marginBottom: 0,
    fontWeight: "800",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 50,
    marginTop: 0,
  },
  dateLeft: {
    justifyContent: "flex-start",
    flex: 1.2,
  },
  dateNumberRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 90,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: -4,
    lineHeight: 90,
  },
  dateSeparator: {
    fontSize: 90,
    fontWeight: "700",
    color: "#000000",
    marginHorizontal: -8,
  },
  monthLabel: {
    fontSize: 70,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 2,
    marginTop: -20,
    textTransform: "uppercase",
  },
  timeColumn: {
    gap: 24,
    justifyContent: "flex-start",
    paddingLeft: 28,
    borderLeftWidth: 2,
    borderLeftColor: "#000000",
    flex: 1,
    paddingTop: 8,
  },
  timeBlock: {
    alignItems: "flex-start",
  },
  timeLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 4,
  },
  timeSubLabel: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "400",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  sectionLink: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "500",
    backgroundColor: "#E8E8E8",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  tasksContainer: {
    flex: 1,
    marginHorizontal: 0,
    paddingHorizontal: 24,
    paddingTop: 28,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 0,
  },
  tasksScrollView: {
    flex: 1,
  },
  tasksScrollContent: {
    paddingBottom: 120,
  },
  taskCard: {
    borderRadius: 28,
    padding: 28,
    marginBottom: 20,
    shadowColor: "transparent",
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 24,
  },
  taskDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  taskTime: {
    flex: 1,
  },
  taskTimeEnd: {
    flex: 1,
    alignItems: "flex-end",
  },
  taskTimeLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 4,
  },
  taskTimeSubLabel: {
    fontSize: 13,
    color: "#000000",
    fontWeight: "500",
  },
  durationBadge: {
    backgroundColor: "#5A5A5A",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    minWidth: 80,
    alignItems: "center",
  },
  durationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});