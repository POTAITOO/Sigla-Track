import { useAuth } from '@/context/authContext';
import { eventServices } from '@/services/eventServices';
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const insets = useSafeAreaInsets();
  const NAVBAR_HEIGHT = 72;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => {
      clearInterval(timer);
      subscription?.remove();
    };
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const allEvents = await eventServices.getUserEvents(user.uid);
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      const todaysEvents = allEvents.filter((event: any) => {
        const eventStart = new Date(event.startDate);
        return eventStart >= startOfDay && eventStart <= endOfDay;
      });
      setEvents(todaysEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getDayName = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[currentTime.getDay()];
  };

  const getFormattedDate = () => {
    const day = currentTime.getDate().toString().padStart(2, "0");
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    return { day, time: `${hours}:${minutes}` };
  };

  const getMonth = () => {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return months[currentTime.getMonth()];
  };

  const getTimeInTimezone = (timezone: string) => {
    return currentTime.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const { day, time } = getFormattedDate();
  const [dayPart, timePart] = time.split(":");
  const isSmallScreen = dimensions.width < 375;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#E0E0E0" />
      <View style={styles.container}>
        {/* Gradient Background Circles */}
        <View style={[styles.gradientCircle1, {
          width: scale(300),
          height: scale(300),
          borderRadius: scale(150),
          top: -scale(50),
          right: -scale(50),
        }]} />
        <View style={[styles.gradientCircle2, {
          width: scale(250),
          height: scale(250),
          borderRadius: scale(125),
          bottom: verticalScale(200),
          left: -scale(50),
        }]} />

        {/* Header */}
        <View style={{
          paddingTop: Math.max(insets.top, 0) + verticalScale(16),
          paddingHorizontal: scale(20),
          paddingBottom: verticalScale(12),
          zIndex: 1,
        }}>
          <Text style={{ fontSize: moderateScale(28), fontWeight: 'bold', color: '#222' }}>
            Welcome!
          </Text>
        </View>

        {/* Date Card */}
        <View style={{ 
          paddingHorizontal: scale(20), 
          paddingBottom: verticalScale(20),
          zIndex: 1 
        }}>
          {/* Day Number and Day Name Row */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: scale(12), marginBottom: verticalScale(8) }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: moderateScale(36), fontWeight: '900', color: '#000', lineHeight: moderateScale(38) }}>
                {day}
              </Text>
              <Text style={{ fontSize: moderateScale(16), color: '#888', fontWeight: '700', marginTop: -verticalScale(4) }}>
                Day
              </Text>
            </View>
            <Text style={{ fontSize: moderateScale(24), color: "#000", fontWeight: "800", marginTop: verticalScale(4) }}>
              {getDayName()}
            </Text>
          </View>

          {/* Time and Timezone Row */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: isSmallScreen ? scale(20) : scale(50) }}>
            {/* Large Time Display */}
            <View style={{ flex: 1.2 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: verticalScale(4) }}>
                <Text style={{
                  fontSize: isSmallScreen ? moderateScale(70) : moderateScale(90),
                  fontWeight: "700",
                  color: "#000",
                  letterSpacing: -4,
                  lineHeight: isSmallScreen ? moderateScale(70) : moderateScale(90),
                }}>
                  {dayPart}
                </Text>
                <Text style={{
                  fontSize: isSmallScreen ? moderateScale(70) : moderateScale(90),
                  fontWeight: "700",
                  color: "#000",
                  marginHorizontal: -scale(8),
                }}>
                  :
                </Text>
                <Text style={{
                  fontSize: isSmallScreen ? moderateScale(70) : moderateScale(90),
                  fontWeight: "700",
                  color: "#000",
                  letterSpacing: -4,
                  lineHeight: isSmallScreen ? moderateScale(70) : moderateScale(90),
                }}>
                  {timePart}
                </Text>
              </View>
              <Text style={{
                fontSize: isSmallScreen ? moderateScale(55) : moderateScale(70),
                fontWeight: "900",
                color: "#000",
                letterSpacing: 2,
                marginTop: isSmallScreen ? -moderateScale(15) : -moderateScale(20),
                textTransform: "uppercase",
              }}>
                {getMonth()}
              </Text>
            </View>

            {/* Timezone Column */}
            {/* Timezone Column */}
<View style={{ 
  flex: 1,
  paddingLeft: scale(30), // This moves everything including the line
}}>
  <View style={{
    gap: isSmallScreen ? scale(16) : scale(24),
    paddingLeft: scale(20), // This adds space between line and text
    borderLeftWidth: 2,
    borderLeftColor: "#000",
    paddingTop: verticalScale(8),
  }}>
    <View>
      <Text style={{ fontSize: moderateScale(18), fontWeight: "700", color: "#000", marginBottom: verticalScale(4) }}>
        {getTimeInTimezone("America/New_York")}
      </Text>
      <Text style={{ fontSize: moderateScale(14), color: "#000", fontWeight: "400" }}>
        New York
      </Text>
    </View>
    <View>
      <Text style={{ fontSize: moderateScale(18), fontWeight: "700", color: "#000", marginBottom: verticalScale(4) }}>
        {getTimeInTimezone("Europe/London")}
      </Text>
      <Text style={{ fontSize: moderateScale(14), color: "#000", fontWeight: "400" }}>
        United Kingdom
      </Text>
    </View>
  </View>
</View>
          </View>
        </View>

        {/* Add Habit Button */}
        <View style={{ alignItems: 'center', marginTop: verticalScale(16), zIndex: 1 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#2ecc71',
              paddingHorizontal: scale(32),
              paddingVertical: verticalScale(14),
              borderRadius: moderateScale(24),
              marginBottom: verticalScale(8),
            }}
            onPress={() => router.push('/habits/create')}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: moderateScale(16) }}>
              + Add Habit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tasks Section */}
        <View style={{
          flex: 1,
          marginHorizontal: 0,
          paddingHorizontal: scale(24),
          paddingTop: verticalScale(28),
          backgroundColor: "#FFF",
          borderTopLeftRadius: moderateScale(32),
          borderTopRightRadius: moderateScale(32),
          marginTop: 0,
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: verticalScale(20) }}>
            <Text style={{ fontSize: moderateScale(20), fontWeight: "700", color: "#000" }}>
              Todays tasks
            </Text>
            <Text style={{
              fontSize: moderateScale(14),
              color: "#000",
              fontWeight: "500",
              backgroundColor: "#E8E8E8",
              paddingHorizontal: scale(24),
              paddingVertical: verticalScale(10),
              borderRadius: moderateScale(24),
            }}>
              Reminders
            </Text>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: insets.bottom + NAVBAR_HEIGHT + verticalScale(20) }}
            showsVerticalScrollIndicator={false}
          >
            {events.length === 0 ? (
              <Text style={{ color: '#888', textAlign: 'center', marginTop: verticalScale(16), fontSize: moderateScale(16) }}>
                No tasks for today.
              </Text>
            ) : (
              events.map((event) => {
                const start = new Date(event.startDate);
                const end = new Date(event.endDate);
                const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const durationMs = end.getTime() - start.getTime();
                const durationMin = Math.round(durationMs / 60000);
                const durationStr = durationMin >= 60 
                  ? `${Math.floor(durationMin / 60)} Hour${durationMin >= 120 ? 's' : ''}${durationMin % 60 ? ' ' + (durationMin % 60) + ' Min' : ''}`
                  : `${durationMin} Min`;
                
                return (
                  <View
                    key={event.id}
                    style={{
                      backgroundColor: event.color || '#B8A8D4',
                      borderRadius: moderateScale(28),
                      padding: scale(28),
                      marginBottom: verticalScale(30),
                    }}
                  >
                    <Text style={{ fontSize: moderateScale(22), fontWeight: "700", color: "#000", marginBottom: verticalScale(24) }}>
                      {event.title}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: moderateScale(18), fontWeight: "700", color: "#000", marginBottom: verticalScale(4) }}>
                          {formatTime(start)}
                        </Text>
                        <Text style={{ fontSize: moderateScale(13), color: "#000", fontWeight: "500" }}>
                          Start
                        </Text>
                      </View>
                      <View style={{
                        backgroundColor: "#5A5A5A",
                        paddingHorizontal: scale(18),
                        paddingVertical: verticalScale(10),
                        borderRadius: moderateScale(14),
                        minWidth: scale(80),
                        alignItems: "center",
                      }}>
                        <Text style={{ fontSize: moderateScale(14), fontWeight: "600", color: "#FFF" }}>
                          {durationStr}
                        </Text>
                      </View>
                      <View style={{ flex: 1, alignItems: "flex-end" }}>
                        <Text style={{ fontSize: moderateScale(18), fontWeight: "700", color: "#000", marginBottom: verticalScale(4) }}>
                          {formatTime(end)}
                        </Text>
                        <Text style={{ fontSize: moderateScale(13), color: "#000", fontWeight: "500" }}>
                          End
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
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
});