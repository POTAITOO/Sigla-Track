import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../firebaseConfig.js";

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state:", currentUser ? currentUser.uid : "no user");
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={user ? styles.container : styles.landingContainerWrapper}>
        {user ? (
          <View style={styles.userContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Sigla-Track</Text>
              <Text style={styles.subtitle}>Welcome back!</Text>
            </View>

            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.email?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.emailText}>{user.email}</Text>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.landingContainer} showsVerticalScrollIndicator={false}>
            {/* Gradient Background Circles */}
            <View style={styles.gradientCircle1} />
            <View style={styles.gradientCircle2} />
            
            {/* Header */}
            <View style={styles.landingHeader}>
              <View style={styles.brandContainer}>
                <Image
                  source={require("../assets/images/logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.brandText}>Sigla-Track</Text>
              </View>
            </View>

            <Animated.View 
              style={[
                styles.contentWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Main Hero */}
              <View style={styles.heroSection}>
                <Text style={styles.heroTitle}>
                  Your Goals,{"\n"}
                  <Text style={styles.heroTitleHighlight}>Simplified</Text>
                </Text>

                <Text style={styles.heroDescription}>
                  Transform the way you achieve your goals with intelligent tracking and beautiful analytics
                </Text>
              </View>

              {/* Features Grid */}
              <View style={styles.featuresGrid}>
                <View style={styles.featureCardLarge}>
                  <View style={styles.featureIconLarge}>
                    <Text style={styles.featureIconText}>🎯</Text>
                  </View>
                  <Text style={styles.featureCardTitle}>Smart Goals</Text>
                  <Text style={styles.featureCardDescription}>
                    Set, organize, and achieve your goals with AI-powered insights
                  </Text>
                </View>

                <View style={styles.featureRow}>
                  <View style={styles.featureCardSmall}>
                    <Text style={styles.featureIconSmall}>🏆</Text>
                    <Text style={styles.featureSmallTitle}>Leaderboard</Text>
                  </View>
                  <View style={styles.featureCardSmall}>
                    <Text style={styles.featureIconSmall}>🔥</Text>
                    <Text style={styles.featureSmallTitle}>Streaks</Text>
                  </View>
                </View>

                <View style={styles.featureRow}>
                  <View style={styles.featureCardInfo}>
                    <Text style={styles.featureInfoIcon}>✅</Text>
                    <View style={styles.featureInfoContent}>
                      <Text style={styles.featureInfoTitle}>Track</Text>
                      <Text style={styles.featureInfoDescription}>
                        Monitor your daily progress
                      </Text>
                    </View>
                  </View>
                  <View style={styles.featureCardInfo}>
                    <Text style={styles.featureInfoIcon}>📈</Text>
                    <View style={styles.featureInfoContent}>
                      <Text style={styles.featureInfoTitle}>Analytics</Text>
                      <Text style={styles.featureInfoDescription}>
                        Visualize your journey
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Trust Badges */}
              <View style={styles.trustSection}>
                <View style={styles.trustBadge}>
                  <Text style={styles.trustIcon}>✓</Text>
                  <Text style={styles.trustText}>Free Forever</Text>
                </View>
                <View style={styles.trustBadge}>
                  <Text style={styles.trustIcon}>✓</Text>
                  <Text style={styles.trustText}>No Ads</Text>
                </View>
                <View style={styles.trustBadge}>
                  <Text style={styles.trustIcon}>✓</Text>
                  <Text style={styles.trustText}>Private & Secure</Text>
                </View>
              </View>

              {/* CTA */}
              <View style={styles.ctaSection}>
                <TouchableOpacity
                  style={styles.ctaButtonPrimary}
                  onPress={() => router.push("/register")}
                  activeOpacity={0.9}
                >
                  <Text style={styles.ctaButtonPrimaryText}>Start Your Journey</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.ctaButtonSecondary}
                  onPress={() => router.push("/login")}
                  activeOpacity={0.9}
                >
                  <Text style={styles.ctaButtonSecondaryText}>I have an account</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Join thousands achieving their goals daily
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: "#667085",
    textAlign: "center",
  },
  welcomeContainer: {
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#0A1E42",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#667085",
    textAlign: "center",
  },
  authContainer: {
    width: "100%",
    maxWidth: 320,
  },
  loginButton: {
    backgroundColor: "#0A1E42",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  signupButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#A78BFA",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  signupButtonText: {
    color: "#A78BFA",
    fontSize: 16,
    fontWeight: "600",
  },
  userContainer: {
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#A78BFA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  emailText: {
    fontSize: 16,
    color: "#667085",
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  landingContainerWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  landingContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  gradientCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#E9D5FF",
    opacity: 0.3,
    top: -100,
    right: -100,
    zIndex: 0,
  },
  gradientCircle2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#D4FC79",
    opacity: 0.2,
    bottom: 100,
    left: -80,
    zIndex: 0,
  },
  landingHeader: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    zIndex: 1,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
  brandText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  contentWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    zIndex: 1,
  },
  heroSection: {
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
    lineHeight: 52,
  },
  heroTitleHighlight: {
    color: "#8B5CF6",
  },
  heroDescription: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  featuresGrid: {
    gap: 16,
    marginBottom: 32,
  },
  featureCardLarge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  featureIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  featureIconText: {
    fontSize: 28,
  },
  featureCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  featureCardDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  featureRow: {
    flexDirection: "row",
    gap: 16,
  },
  featureCardSmall: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  featureIconSmall: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureSmallTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  featureCardInfo: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
  },
  featureInfoIcon: {
    fontSize: 28,
  },
  featureInfoContent: {
    flex: 1,
  },
  featureInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  featureInfoDescription: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 14,
  },
  trustSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
    justifyContent: "center",
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 6,
  },
  trustIcon: {
    fontSize: 12,
    color: "#10B981",
  },
  trustText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
  },
  ctaSection: {
    gap: 12,
    marginBottom: 24,
  },
  ctaButtonPrimary: {
    backgroundColor: "#8B5CF6",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaButtonPrimaryText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  ctaButtonSecondary: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  ctaButtonSecondaryText: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
  },
});
