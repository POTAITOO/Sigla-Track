
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs, router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Only real tabs, no 'create'
const navItems = [
  { name: 'Home', icon: 'home' },
  { name: 'Schedule', icon: 'calendar' },
  { name: 'Productivity', icon: 'bar-chart' },
  { name: 'Profile', icon: 'person' },
];

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <RNSafeAreaView edges={['bottom']} style={{ backgroundColor: '#232B39' }}>
      <View style={[styles.navBar, { paddingBottom: Math.max(insets.bottom, 8) }]}> 
        {state.routes.map((route, index) => {
          // Insert the floating + button after the second tab (index 1)
          if (index === 2) {
            return [
              // Floating + button
              <TouchableOpacity
                key="create"
                accessibilityRole="button"
                onPress={() => router.push('/events/create')}
                style={[
                  styles.createTab,
                  { marginBottom: insets.bottom > 0 ? insets.bottom : 8 },
                ]}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={28} color="#fff" />
              </TouchableOpacity>,
              // The actual tab
              <TabButton key={route.key} route={route} index={index} state={state} descriptors={descriptors} navigation={navigation} />
            ];
          }
          return (
            <TabButton key={route.key} route={route} index={index} state={state} descriptors={descriptors} navigation={navigation} />
          );
        })}
      </View>
    </RNSafeAreaView>
  );
}

function TabButton({ route, index, state, descriptors, navigation }: any) {
  const isActive = state.index === index;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isActive ? { selected: true } : {}}
      onPress={() => navigation.navigate(route.name)}
      style={[styles.navItem, isActive && styles.navItemActive]}
      activeOpacity={0.7}
    >
      <Ionicons
        name={((navItems[index]?.icon ?? 'home') as any)}
        size={24}
        color={isActive ? '#60A5FA' : '#6B7280'}
        style={[styles.icon, isActive && styles.iconActive]}
      />
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {descriptors[route.key]?.options.title ?? route.name}
      </Text>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="schedule" options={{ title: 'Schedule' }} />
        <Tabs.Screen name="productivity" options={{ title: 'Productivity' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#232B39',
    paddingVertical: 8,
    paddingHorizontal: 8,
    position: 'relative',
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 64,
    paddingTop: 0,
    paddingBottom: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 12,
    backgroundColor: 'transparent',
    minHeight: 56,
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  createTab: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#232B39',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    marginTop: -20, 
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 2,
  },
  navItemActive: {
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
  },
  icon: {
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    borderTopWidth: 0,
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  labelActive: {
    color: '#60A5FA',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 18,
    width: '25%',
    height: 3,
    backgroundColor: '#60A5FA',
    borderRadius: 2,
    display: 'none',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.10)',
  },

});
