import { useAuth } from '@/context/authContext';
import { eventServices } from '@/services/eventServices';
import EventCreateModal from '@/components/EventCreateModal';
import CustomAlert from '@/components/CustomAlert';
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Dimensions, Image, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export default function Home() {
  useRouter();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sortFilter, setSortFilter] = useState('time');
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const insets = useSafeAreaInsets();

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
      const now = new Date();
      
      let eventsToDisplay = allEvents;
      
      // Only filter to today's events when sorting by time
      if (sortFilter === 'time') {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        eventsToDisplay = allEvents.filter((event: any) => {
          const eventStart = new Date(event.startDate);
          const eventEnd = new Date(event.endDate);
          // Show only tasks that haven't ended yet and are within today
          return eventStart >= startOfDay && eventStart <= endOfDay && eventEnd > now;
        });
      }
      
      // Apply sorting based on selected filter
      if (sortFilter === 'time') {
        eventsToDisplay.sort((a: any, b: any) => {
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        });
      } else if (sortFilter === 'alphabetical') {
        eventsToDisplay.sort((a: any, b: any) => {
          return a.title.localeCompare(b.title);
        });
      } else if (sortFilter === 'category') {
        eventsToDisplay.sort((a: any, b: any) => {
          return (a.category || 'other').localeCompare(b.category || 'other');
        });
      }
      
      setEvents(eventsToDisplay);
    } catch {
    }
  }, [user, sortFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents().finally(() => setRefreshing(false));
  }, [fetchEvents]);

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleDeleteEvent = (event: any) => {
    setDeleteConfirmEvent(event);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmEvent || !user?.uid) return;
    
    try {
      setIsDeleting(true);
      await eventServices.deleteEvent(deleteConfirmEvent.id);
      setDeleteConfirmEvent(null);
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert('Error', 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    // Refresh events when modal closes (after create/edit)
    fetchEvents();
  };

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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={{ flex: 1, backgroundColor: "#FFF" }}>
        {/* Gradient Background Circles */}
        <View style={[styles.gradientCircle1, {
          width: scale(300),
          height: scale(300),
          borderRadius: scale(175),
          top: verticalScale(60),
          left: scale(-80),
        }]} />
        <View style={[styles.gradientCircle2, {
          width: scale(280),
          height: scale(280),
          borderRadius: scale(140),
          top: verticalScale(100),
          right: scale(-40),
        }]} />

        {/* Header - Fixed at top */}
        <View style={{
          paddingTop: Math.max(insets.top, 0) + verticalScale(8),
          paddingHorizontal: scale(20),
          paddingBottom: verticalScale(6),
          zIndex: 1,
          backgroundColor: "transparent",
        }}>
          <Text style={{ fontSize: moderateScale(24), fontWeight: 'bold', color: '#222' }}>
            Welcome!
          </Text>
        </View>

        {/* Date Card - Fixed at top */}
        <View style={{ 
          paddingHorizontal: scale(20), 
          paddingBottom: verticalScale(12),
          zIndex: 1,
          backgroundColor: "transparent",
        }}>
          {/* Day Number and Day Name Row */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: scale(10), marginBottom: verticalScale(6) }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: moderateScale(32), fontWeight: '900', color: '#000', lineHeight: moderateScale(34) }}>
                {day}
              </Text>
              <Text style={{ fontSize: moderateScale(14), color: '#888', fontWeight: '700', marginTop: -verticalScale(4) }}>
                Day
              </Text>
            </View>
            <Text style={{ fontSize: moderateScale(22), color: "#000", fontWeight: "800", marginTop: verticalScale(2) }}>
              {getDayName()}
            </Text>
          </View>

          {/* Time and Timezone Row - Reduced sizes */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: isSmallScreen ? scale(15) : scale(40) }}>
            {/* Large Time Display */}
            <View style={{ flex: 1.2 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: verticalScale(2) }}>
                <Text style={{
                  fontSize: isSmallScreen ? moderateScale(60) : moderateScale(75),
                  fontWeight: "700",
                  color: "#000",
                  letterSpacing: -4,
                  lineHeight: isSmallScreen ? moderateScale(60) : moderateScale(75),
                }}>
                  {dayPart}
                </Text>
                <Text style={{
                  fontSize: isSmallScreen ? moderateScale(60) : moderateScale(75),
                  fontWeight: "700",
                  color: "#000",
                }}>
                  :
                </Text>
                <Text style={{
                  fontSize: isSmallScreen ? moderateScale(60) : moderateScale(75),
                  fontWeight: "700",
                  color: "#000",
                  letterSpacing: -4,
                  lineHeight: isSmallScreen ? moderateScale(60) : moderateScale(75),
                }}>
                  {timePart}
                </Text>
              </View>
              <Text style={{
                fontSize: isSmallScreen ? moderateScale(45) : moderateScale(58),
                fontWeight: "900",
                color: "#000",
                letterSpacing: 2,
                marginTop: isSmallScreen ? -moderateScale(12) : -moderateScale(16),
                textTransform: "uppercase",
              }}>
                {getMonth()}
              </Text>
            </View>

            {/* Timezone Column */}
            <View style={{ 
              flex: 1,
              paddingLeft: isSmallScreen ? scale(15) : scale(25),
            }}>
              <View style={{
                gap: isSmallScreen ? scale(12) : scale(18),
                paddingLeft: isSmallScreen ? scale(12) : scale(16),
                borderLeftWidth: 2,
                borderLeftColor: "#000",
                paddingTop: verticalScale(4),
              }}>
                <View>
                  <Text style={{ fontSize: moderateScale(16), fontWeight: "700", color: "#000", marginBottom: verticalScale(2) }}>
                    {getTimeInTimezone("America/New_York")}
                  </Text>
                  <Text style={{ fontSize: moderateScale(12), color: "#000", fontWeight: "400" }}>
                    New York
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: moderateScale(16), fontWeight: "700", color: "#000", marginBottom: verticalScale(2) }}>
                    {getTimeInTimezone("Europe/London")}
                  </Text>
                  <Text style={{ fontSize: moderateScale(12), color: "#000", fontWeight: "400" }}>
                    United Kingdom
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Tasks Section - Single Scrollable Container */}
        <ScrollView
          scrollEnabled={true}
          contentContainerStyle={{ paddingBottom: verticalScale(20) }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6366f1"]} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={{
            paddingHorizontal: scale(24),
            paddingTop: verticalScale(12),
            paddingBottom: 0,
            backgroundColor: "#FFF",
            borderTopLeftRadius: moderateScale(20),
            borderTopRightRadius: moderateScale(20),
          }}>
          {/* Header with Filter Buttons and Dropdown */}
          <View style={{ marginBottom: verticalScale(20), marginTop: verticalScale(12) }}>
            {/* Title and Filter Icon Row */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: verticalScale(16),
              paddingHorizontal: scale(4),
            }}>
              <Text style={{ fontSize: moderateScale(24), fontWeight: "700", color: "#000" }}>
                {sortFilter === 'time' && "Today's Tasks"}
                {sortFilter === 'alphabetical' && "Tasks (A-Z)"}
                {sortFilter === 'category' && "Tasks by Category"}
              </Text>
              
              {/* Filter Icon Button with Dropdown */}
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#F5F5F5',
                    borderRadius: moderateScale(22),
                    width: scale(44),
                    height: scale(44),
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                  }}
                  onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                  activeOpacity={0.7}
                >
                  <Image 
                    source={require('@/assets/images/filter.png')}
                    style={{
                      width: scale(24),
                      height: scale(24),
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <View style={{
                    position: 'absolute',
                    top: verticalScale(50),
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    borderRadius: moderateScale(16),
                    minWidth: scale(180),
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 8,
                    zIndex: 1000,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                  }}>
                    {[
                      { label: 'Sort by Time', value: 'time' },
                      { label: 'Sort Alphabetical (A-Z)', value: 'alphabetical' },
                      { label: 'Sort by Category', value: 'category' },
                    ].map((option, index, arr) => (
                      <TouchableOpacity
                        key={option.value}
                        style={{
                          paddingHorizontal: scale(16),
                          paddingVertical: verticalScale(12),
                          borderBottomWidth: index < arr.length - 1 ? 1 : 0,
                          borderBottomColor: '#F0F0F0',
                          backgroundColor: sortFilter === option.value ? '#F8F8F8' : 'transparent',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        onPress={() => {
                          setSortFilter(option.value);
                          setIsDropdownOpen(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={{
                          fontSize: moderateScale(14),
                          color: '#333',
                          fontWeight: sortFilter === option.value ? '600' : '400',
                        }}>
                          {option.label}
                        </Text>
                        {sortFilter === option.value && (
                          <Text style={{
                            fontSize: moderateScale(16),
                            color: '#2ecc71',
                          }}>
                            ✓
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Centered Filter Buttons - Removed */}
            {/* Filter functionality moved to dropdown menu above */}
          </View>

          {/* Tasks Map */}
          {events.length === 0 ? (
            <Text style={{ color: '#888', textAlign: 'center', marginTop: verticalScale(16), fontSize: moderateScale(16) }}>
              No tasks available.
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
                      borderRadius: moderateScale(24),
                      padding: scale(24),
                      marginBottom: verticalScale(16),
                    }}
                  >
                    {/* Card Header with Title and Action Buttons */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: verticalScale(20) }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          fontSize: moderateScale(20), 
                          fontWeight: "700", 
                          color: "#000", 
                          flexShrink: 1,
                        }}>
                          {event.title}
                        </Text>
                        <Text style={{ 
                          fontSize: moderateScale(12), 
                          color: "#333", 
                          fontWeight: "500",
                          marginTop: verticalScale(4),
                          textTransform: 'capitalize',
                        }}>
                          {event.category || 'other'}
                        </Text>
                      </View>
                      {/* Edit and Delete Buttons */}
                      <View style={{ flexDirection: 'row', gap: scale(8), marginLeft: scale(12), pointerEvents: 'auto' }}>
                        <TouchableOpacity
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            borderRadius: moderateScale(12),
                            width: scale(44),
                            height: scale(44),
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                          onPress={() => {
                            console.log('Edit button pressed');
                            handleEditEvent(event);
                          }}
                          activeOpacity={0.6}
                        >
                          <Text style={{ fontSize: moderateScale(20), color: '#000' }}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            borderRadius: moderateScale(12),
                            width: scale(44),
                            height: scale(44),
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                          onPress={() => {
                            console.log('Delete button pressed');
                            handleDeleteEvent(event);
                          }}
                          activeOpacity={0.6}
                        >
                          <Text style={{ fontSize: moderateScale(18), color: '#000' }}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={{ 
                      flexDirection: "row", 
                      alignItems: "center", 
                      justifyContent: "space-between",
                      gap: scale(8),
                    }}>
                      <View style={{ flex: 1, minWidth: scale(70) }}>
                        <Text style={{ 
                          fontSize: moderateScale(17), 
                          fontWeight: "700", 
                          color: "#000", 
                          marginBottom: verticalScale(4) 
                        }}>
                          {formatTime(start)}
                        </Text>
                        <Text style={{ 
                          fontSize: moderateScale(12), 
                          color: "#333", 
                          fontWeight: "500" 
                        }}>
                          Start
                        </Text>
                      </View>
                      <View style={{
                        backgroundColor: "#5A5A5A",
                        paddingHorizontal: scale(14),
                        paddingVertical: verticalScale(10),
                        borderRadius: moderateScale(14),
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Text style={{ 
                          fontSize: moderateScale(13), 
                          fontWeight: "600", 
                          color: "#FFF",
                          textAlign: "center",
                        }}>
                          {durationStr}
                        </Text>
                      </View>
                      <View style={{ flex: 1, alignItems: "flex-end", minWidth: scale(70) }}>
                        <Text style={{ 
                          fontSize: moderateScale(17), 
                          fontWeight: "700", 
                          color: "#000", 
                          marginBottom: verticalScale(4) 
                        }}>
                          {formatTime(end)}
                        </Text>
                        <Text style={{ 
                          fontSize: moderateScale(12), 
                          color: "#333", 
                          fontWeight: "500" 
                        }}>
                          End
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      {/* Event Modal for Editing */}
      <EventCreateModal
        visible={showEventModal}
        onDismiss={handleCloseModal}
        event={editingEvent}
        onError={(message) => {
          console.error('Event operation error:', message);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmEvent && (
        <CustomAlert
          visible={!!deleteConfirmEvent}
          type="warning"
          title="Delete Event"
          message={`Are you sure you want to delete "${deleteConfirmEvent.title}"? This action cannot be undone.`}
          onDismiss={() => setDeleteConfirmEvent(null)}
          buttons={[
            {
              text: 'Cancel',
              onPress: () => setDeleteConfirmEvent(null),
              style: 'cancel',
            },
            {
              text: 'Delete',
              onPress: handleConfirmDelete,
              style: 'destructive',
            },
          ]}
        />
      )}
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
    opacity: 0.6,
    zIndex: 0,
  },
  gradientCircle2: {
    position: "absolute",
    backgroundColor: "#D4FC79",
    opacity: 0.5,
    zIndex: 0,
  },
});