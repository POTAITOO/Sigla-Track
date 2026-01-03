import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';


// Define nav items, omitting 'create' for now
const navItems = [
  { name: 'Home', icon: 'home' },
  { name: 'Schedule', icon: 'calendar' },
  { name: 'Create', icon: 'add' },
  { name: 'Productivity', icon: 'bar-chart' },
  { name: 'Profile', icon: 'person' },
];

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  // Insert the create tab in the center
  const tabOrder = [0, 1, 'create', 2, 3];
  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { paddingBottom: insets.bottom }]}> 
      <View style={styles.navBar}>
        {tabOrder.map((tabIdx, idx) => {
          if (tabIdx === 'create') {
            // Center create tab
            return (
              <TouchableOpacity
                key="create"
                accessibilityRole="button"
                onPress={() => navigation.navigate('events/create')}
                style={styles.createTab}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={28} color="#1F2937" />
              </TouchableOpacity>
            );
          }
          const route = state.routes[tabIdx as number];
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;
          const isActive = state.index === (tabIdx as number);
          const iconName = navItems[tabIdx as number < 2 ? tabIdx as number : (tabIdx as number) + 1]?.icon || 'home';
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isActive ? { selected: true } : {}}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.navItem, isActive && styles.navItemActive]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconName as any}
                size={24}
                color={isActive ? '#60A5FA' : '#6B7280'}
                style={[styles.icon, isActive && styles.iconActive]}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {typeof label === "string" ? label : route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
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
    backgroundColor: '#fff',
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
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 12,
    backgroundColor: 'transparent',
    minHeight: 56,
    justifyContent: 'flex-end',
  },
    createTab: {
      width: 64,
      height: 64,
      borderRadius: 18,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 4,
      marginTop: -40, // Float higher above navbar
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.10,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 2,
      borderColor: '#E5E7EB',
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
  },

});
