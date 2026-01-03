import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { auth } from "../firebaseConfig.js";

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    id: 1,
    title: "Welcome to",
    subtitle: "SiglaTrack",
    description:
      "Your personal goal tracking companion that helps you stay organized, focused, and motivated to achieve your dreams",
    icon: "🎯",
  },
  {
    id: 2,
    title: "Powerful\nFeatures",
    features: [
      { icon: "🎯", title: "Goals", desc: "Set and achieve targets" },
      { icon: "🔥", title: "Streaks", desc: "Build consistency" },
      { icon: "📋", title: "Track", desc: "Monitor daily progress" },
      { icon: "📈", title: "Analytics", desc: "Visualize your journey" },
    ],
  },
  {
    id: 3,
    title: "Get Ready to\nAchieve More",
    tips: [
      "Set clear and achievable goals",
      "Track your progress daily",
      "Stay consistent with reminders",
      "Celebrate your milestones",
    ],
    trust: ["Free Forever", "No Ads", "Private & Secure"],
  },
];

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state:", currentUser ? currentUser.uid : "no user");
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

 

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      const nextPage = currentPage + 1;
      flatListRef.current?.scrollToIndex({ index: nextPage, animated: true });
      setCurrentPage(nextPage);
    } else {
      router.push("/login");
    }
  };

  const handleSkip = () => {
    router.push("/login");
  };

  const handleBack = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      flatListRef.current?.scrollToIndex({ index: prevPage, animated: true });
      setCurrentPage(prevPage);
    }
  };

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].index || 0);
    }
  }).current;

  const renderPage = ({ item }: any) => {
    if (item.id === 1) {
      return (
        <View style={styles.page}>
          <View style={styles.pageContent}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.welcomeLogo}
              resizeMode="contain"
            />
            <Text style={styles.pageTitle}>{item.title}</Text>
            <Text style={styles.pageTitleBold}>{item.subtitle}</Text>
            <Text style={styles.pageDescription}>{item.description}</Text>
          </View>
        </View>
      );
    }

    if (item.id === 2) {
      return (
        <View style={styles.page}>
          <View style={styles.pageContent}>
            <Text style={styles.pageTitle}>{item.title}</Text>
            <View style={styles.featuresGrid}>
              {item.features.map((feature: any, index: number) => (
                <View key={index} style={styles.featureCardMini}>
                  <Text style={styles.featureIconMini}>{feature.icon}</Text>
                  <Text style={styles.featureTitleMini}>{feature.title}</Text>
                  <Text style={styles.featureDescMini}>{feature.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.page}>
        <View style={styles.pageContent}>
          <Text style={styles.pageTitle}>{item.title}</Text>
          <View style={styles.tipsSection}>
            {item.tips.map((tip: string, index: number) => (
              <View key={index} style={styles.tipItem}>
                <View style={styles.tipBullet}>
                  <Text style={styles.tipBulletText}>✓</Text>
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
          <View style={styles.trustBadges}>
            {item.trust.map((trust: string, index: number) => (
              <View key={index} style={styles.trustBadge}>
                <Text style={styles.trustIcon}>✓</Text>
                <Text style={styles.trustText}>{trust}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (user) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loggedInContainer}>
          <View style={styles.userContainer}>
            <View style={styles.header2}>
              <Text style={styles.title}>SiglaTrack</Text>
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
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Gradient Background Circles */}
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <TouchableOpacity 
            onPress={handleBack}
            disabled={currentPage === 0}
            style={[
              styles.backButtonContainer,
              currentPage === 0 && styles.backButtonDisabled
            ]}
          >
            <Text style={[
              styles.backText,
              currentPage === 0 && styles.backTextDisabled
            ]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pages */}
        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={renderPage}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />

        {/* Footer */}
        <View style={styles.footer}>
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentPage === index && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <Text style={styles.nextButtonText}>
              {currentPage === onboardingData.length - 1
                ? "Get Started"
                : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 20,
    zIndex: 1,
  },
  headerSpacer: {
    flex: 1,
  },
  backButtonContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonDisabled: {
    opacity: 0.3,
  },
  backText: {
    fontSize: 16,
    color: "#8B5CF6",
    fontWeight: "600",
  },
  backTextDisabled: {
    color: "#94A3B8",
  },
  skipText: {
    fontSize: 16,
    color: "#8B5CF6",
    fontWeight: "600",
  },
  page: {
    width: width,
    flex: 1,
    paddingHorizontal: 24,
  },
  pageContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  mainIcon: {
    fontSize: 56,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 42,
  },
  pageTitleBold: {
    fontSize: 40,
    fontWeight: "900",
    color: "#8B5CF6",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 48,
    letterSpacing: -1,
  },
  pageDescription: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 32,
    justifyContent: "center",
  },
  featureCardMini: {
    width: (width - 72) / 2,
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
  featureIconMini: {
    fontSize: 40,
    marginBottom: 12,
  },
  featureTitleMini: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  featureDescMini: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  tipsSection: {
    marginTop: 32,
    width: "100%",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tipBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D4FC79",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tipBulletText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  trustBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
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
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    zIndex: 1,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#8B5CF6",
  },
  nextButton: {
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
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  loadingText: {
    fontSize: 16,
    color: "#667085",
    textAlign: "center",
  },
  loggedInContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    padding: 24,
  },
  userContainer: {
    alignItems: "center",
  },
  header2: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 40,
    fontWeight: "900",
    color: "#0A1E42",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#667085",
    textAlign: "center",
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
  welcomeLogo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  pageMainLogo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
});