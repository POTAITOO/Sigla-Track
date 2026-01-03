import { usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: "Today", icon: "🏠", path: "/home" },
    { name: "Schedule", icon: "📅", path: "/schedule" },
    { name: "Productivity", icon: "📊", path: "/productivity" },
    { name: "Create", icon: "➕", path: "/create" },
    { name: "Calendar", icon: "📆", path: "/calendar" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <TouchableOpacity
              key={item.name}
              style={styles.navItem}
              onPress={() => router.push(item.path as any)}
              activeOpacity={0.7}
            >
              <Text style={[styles.icon, isActive && styles.iconActive]}>
                {item.icon}
              </Text>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {isActive(pathname, "/home") && <View style={[styles.activeIndicator, { left: "10%" }]} />}
      {isActive(pathname, "/schedule") && <View style={[styles.activeIndicator, { left: "30%" }]} />}
      {isActive(pathname, "/productivity") && <View style={[styles.activeIndicator, { left: "50%" }]} />}
      {isActive(pathname, "/create") && <View style={[styles.activeIndicator, { left: "70%" }]} />}
      {isActive(pathname, "/calendar") && <View style={[styles.activeIndicator, { left: "90%" }]} />}
    </View>
  );
}

function isActive(pathname: string, path: string) {
  return pathname === path;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1F2937",
    paddingBottom: 20,
  },
  navBar: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    paddingVertical: 12,
    paddingHorizontal: 8,
    position: "relative",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  icon: {
    fontSize: 22,
    opacity: 0.4,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: "#6B7280",
  },
  labelActive: {
    color: "#60A5FA",
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 18,
    left: "10%",
    width: "20%",
    height: 3,
    backgroundColor: "#60A5FA",
    borderRadius: 2,
  },
});
