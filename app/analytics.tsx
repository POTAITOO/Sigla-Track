import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import BottomNav from "../components/BottomNav";

export default function Analytics() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>View your progress statistics</Text>
        </View>
        <BottomNav />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
  },
});
