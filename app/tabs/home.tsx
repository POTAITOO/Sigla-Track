import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

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
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const insets = useSafeAreaInsets();
  const NAVBAR_HEIGHT = 72;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => {
      clearInterval(timer);
      subscription?.remove();
    };
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

  const isSmallScreen = dimensions.width < 375;
  const isLargeScreen = dimensions.width > 428;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#E0E0E0" />
      <View style={styles.container}>
        {/* Gradient Background Circles */}
        <View style={[
          styles.gradientCircle1,
          {
            width: scale(300),
            height: scale(300),
            borderRadius: scale(150),
            top: -scale(50),
            right: -scale(50),
          }
        ]} />
        <View style={[
          styles.gradientCircle2,
          {
            width: scale(250),
            height: scale(250),
            borderRadius: scale(125),
            bottom: verticalScale(200),
            left: -scale(50),
          }
        ]} />

        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, verticalScale(40)) }]} />

        <View style={styles.content}>
          {/* Date Card */}
          <View style={styles.dateCard}>
            <Text style={[styles.dayLabel, { fontSize: moderateScale(24) }]}>
              {getDayName()}
            </Text>
            <View style={[styles.dateRow, { gap: isSmallScreen ? scale(20) : scale(50) }]}>
              <View style={styles.dateLeft}>
                <View style={styles.dateNumberRow}>
                  <Text style={[styles.dateNumber, { 
                    fontSize: isSmallScreen ? moderateScale(70) : moderateScale(90),
                    lineHeight: isSmallScreen ? moderateScale(70) : moderateScale(90),
                  }]}>
                    {dayPart}
                  </Text>
                  <Text style={[styles.dateSeparator, { 
                    fontSize: isSmallScreen ? moderateScale(70) : moderateScale(90),
                  }]}>
                    :
                  </Text>
                  <Text style={[styles.dateNumber, { 
                    fontSize: isSmallScreen ? moderateScale(70) : moderateScale(90),
                    lineHeight: isSmallScreen ? moderateScale(70) : moderateScale(90),
                  }]}>
                    {timePart}
                  </Text>
                </View>
                <Text style={[styles.monthLabel, { 
                  fontSize: isSmallScreen ? moderateScale(55) : moderateScale(70),
                  marginTop: isSmallScreen ? -moderateScale(15) : -moderateScale(20),
                }]}>
                  {getMonth()}
                </Text>
              </View>
              <View style={[styles.timeColumn, { 
                paddingLeft: scale(28),
                gap: isSmallScreen ? scale(16) : scale(24),
              }]}>
                <View style={styles.timeBlock}>
                  <Text style={[styles.timeLabel, { fontSize: moderateScale(18) }]}>
                    {getTimeInTimezone("America/New_York")}
                  </Text>
                  <Text style={[styles.timeSubLabel, { fontSize: moderateScale(14) }]}>
                    New York
                  </Text>
                </View>
                <View style={styles.timeBlock}>
                  <Text style={[styles.timeLabel, { fontSize: moderateScale(18) }]}>
                    {getTimeInTimezone("Europe/London")}
                  </Text>
                  <Text style={[styles.timeSubLabel, { fontSize: moderateScale(14) }]}>
                    United Kingdom
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Tasks Section */}
        <View style={[styles.tasksContainer, { 
          paddingHorizontal: scale(24),
          paddingTop: verticalScale(28),
          borderTopLeftRadius: moderateScale(32),
          borderTopRightRadius: moderateScale(32),
        }]}>
          <View style={[styles.sectionHeader, { marginBottom: verticalScale(20) }]}>
            <Text style={[styles.sectionTitle, { fontSize: moderateScale(20) }]}>
              Todays tasks
            </Text>
            <Text style={[styles.sectionLink, { 
              fontSize: moderateScale(14),
              paddingHorizontal: scale(24),
              paddingVertical: verticalScale(10),
              borderRadius: moderateScale(24),
            }]}>
              Reminders
            </Text>
          </View>

          <ScrollView
            style={styles.tasksScrollView}
            contentContainerStyle={[
              styles.tasksScrollContent, 
              { paddingBottom: insets.bottom + NAVBAR_HEIGHT + verticalScale(20) }
            ]}
            showsVerticalScrollIndicator={false}
          >
            {MOCK_TASKS.map((task) => (
              <View
                key={task.id}
                style={[styles.taskCard, { 
                  backgroundColor: task.color,
                  borderRadius: moderateScale(28),
                  padding: scale(28),
                  marginBottom: verticalScale(20),
                }]}
              >
                <Text style={[styles.taskTitle, { 
                  fontSize: moderateScale(22),
                  marginBottom: verticalScale(24),
                }]}>
                  {task.title}
                </Text>
                <View style={styles.taskDetails}>
                  <View style={styles.taskTime}>
                    <Text style={[styles.taskTimeLabel, { fontSize: moderateScale(18) }]}>
                      {task.startTime}
                    </Text>
                    <Text style={[styles.taskTimeSubLabel, { fontSize: moderateScale(13) }]}>
                      Start
                    </Text>
                  </View>
                  <View style={[styles.durationBadge, {
                    paddingHorizontal: scale(18),
                    paddingVertical: verticalScale(10),
                    borderRadius: moderateScale(14),
                    minWidth: scale(80),
                  }]}>
                    <Text style={[styles.durationText, { fontSize: moderateScale(14) }]}>
                      {task.duration}
                    </Text>
                  </View>
                  <View style={styles.taskTimeEnd}>
                    <Text style={[styles.taskTimeLabel, { fontSize: moderateScale(18) }]}>
                      {task.endTime}
                    </Text>
                    <Text style={[styles.taskTimeSubLabel, { fontSize: moderateScale(13) }]}>
                      End
                    </Text>
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
    backgroundColor: "#E9D5FF",
    opacity: 0.5,
    zIndex: 0,
  },
  gradientCircle2: {
    position: "absolute",
    backgroundColor: "#D4FC79",
    opacity: 0.4,
    zIndex: 0,
  },
  header: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(16),
    zIndex: 1,
  },
  content: {
    paddingBottom: verticalScale(20),
    paddingTop: 0,
    zIndex: 1,
  },
  dateCard: {
    marginHorizontal: scale(20),
    marginTop: 0,
    marginBottom: 0,
    padding: 0,
    borderRadius: 0,
    shadowColor: "transparent",
  },
  dayLabel: {
    color: "#000000",
    marginBottom: 0,
    fontWeight: "800",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 0,
  },
  dateLeft: {
    justifyContent: "flex-start",
    flex: 1.2,
  },
  dateNumberRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: verticalScale(4),
  },
  dateNumber: {
    fontWeight: "700",
    color: "#000000",
    letterSpacing: -4,
  },
  dateSeparator: {
    fontWeight: "700",
    color: "#000000",
    marginHorizontal: -scale(8),
  },
  monthLabel: {
    fontWeight: "900",
    color: "#000000",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  timeColumn: {
    justifyContent: "flex-start",
    borderLeftWidth: 2,
    borderLeftColor: "#000000",
    flex: 1,
    paddingTop: verticalScale(8),
  },
  timeBlock: {
    alignItems: "flex-start",
  },
  timeLabel: {
    fontWeight: "700",
    color: "#000000",
    marginBottom: verticalScale(4),
  },
  timeSubLabel: {
    color: "#000000",
    fontWeight: "400",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#000000",
  },
  sectionLink: {
    color: "#000000",
    fontWeight: "500",
    backgroundColor: "#E8E8E8",
  },
  tasksContainer: {
    flex: 1,
    marginHorizontal: 0,
    backgroundColor: "#FFFFFF",
    marginTop: 0,
  },
  tasksScrollView: {
    flex: 1,
  },
  tasksScrollContent: {
    paddingBottom: 120,
  },
  taskCard: {
    shadowColor: "transparent",
  },
  taskTitle: {
    fontWeight: "700",
    color: "#000000",
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
    fontWeight: "700",
    color: "#000000",
    marginBottom: verticalScale(4),
  },
  taskTimeSubLabel: {
    color: "#000000",
    fontWeight: "500",
  },
  durationBadge: {
    backgroundColor: "#5A5A5A",
    alignItems: "center",
  },
  durationText: {
    fontWeight: "600",
    color: "#FFFFFF",
  },
});