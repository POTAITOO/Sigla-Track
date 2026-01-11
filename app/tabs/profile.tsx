import About from '@/components/profile/About';
import AccountSettings from '@/components/profile/AccountSettings';
import BackButton from '@/components/profile/BackButton';
import { COLORS, NAVBAR_HEIGHT, SPACING } from '@/components/profile/constants';
import EditProfile from '@/components/profile/EditProfile';
import NotificationSettings from '@/components/profile/NotificationSettings';
import PrivacySecurity from '@/components/profile/PrivacySecurity';
import SectionCard from '@/components/profile/SectionCard';
import SettingItem from '@/components/profile/SettingItem';
import CustomAlert from '@/components/CustomAlert';
import { userServices } from '@/services/userServices';
import { Stack, useRouter } from 'expo-router';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../../firebaseConfig.js';

type TabType = 'profile' | 'account' | 'editProfile' | 'notifications' | 'privacy' | 'about';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [logoutAlert, setLogoutAlert] = useState(false);
  const [logoutErrorAlert, setLogoutErrorAlert] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const headerStyle = {
    paddingTop: insets.top + SPACING.lg,
    paddingBottom: SPACING.xl,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Fetch full user profile data
      if (currentUser) {
        userServices.getUserProfile(currentUser.uid).then(setUserData);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch {
      setLogoutErrorAlert(true);
    }
  };

  const confirmLogout = () => {
    setLogoutAlert(true);
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Fetch updated user profile data
      if (currentUser) {
        userServices.getUserProfile(currentUser.uid).then(setUserData);
      }
      setRefreshing(false);
    });
    setTimeout(() => {
      unsubscribe();
      setRefreshing(false);
    }, 1000);
  }, []);

  if (activeTab !== 'profile') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <View style={[styles.tabHeader, headerStyle]}>
            <BackButton onPress={() => setActiveTab('profile')} />
            <View style={styles.titleContainer}>
              <Text style={styles.tabTitle}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')}
              </Text>
            </View>
          </View>
          
          {activeTab === 'account' && (
            <AccountSettings user={user} onLogout={confirmLogout} onAutoLogout={handleLogout} onEditProfile={() => setActiveTab('editProfile')} />
          )}
          
          {activeTab === 'editProfile' && (
            <EditProfile user={user} onClose={() => setActiveTab('account')} />
          )}
          
          {activeTab === 'notifications' && user && (
            <NotificationSettings userId={user.uid} />
          )}
          
          {activeTab === 'privacy' && (
            <PrivacySecurity />
          )}
          
          {activeTab === 'about' && (
            <About />
          )}
          
          {activeTab !== 'account' && activeTab !== 'editProfile' && activeTab !== 'notifications' && activeTab !== 'privacy' && activeTab !== 'about' && (
            <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
              <Text style={styles.placeholderText}>{activeTab} Tab Content</Text>
            </ScrollView>
          )}
        </View>
        <CustomAlert
          visible={logoutAlert}
          type="warning"
          title="Logout?"
          message="Are you sure you want to logout from your account?"
          onDismiss={() => setLogoutAlert(false)}
          buttons={[
            { text: 'Cancel', style: 'cancel', onPress: () => {} },
            { text: 'Logout', style: 'destructive', onPress: handleLogout },
          ]}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + NAVBAR_HEIGHT }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[COLORS.primary]} 
          />
        }
      >
        <View style={[styles.header, headerStyle]}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(userData?.displayName || userData?.name || user?.email)?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>
            {userData?.displayName || userData?.name || 'User'}
          </Text>
          <Text style={styles.email}>{user?.email || 'No email'}</Text>
        </View>

        <SectionCard>
          <SettingItem 
            label="Account Settings" 
            onPress={() => setActiveTab('account')} 
          />
          <SettingItem 
            label="Notifications" 
            onPress={() => setActiveTab('notifications')} 
          />
          <SettingItem 
            label="Privacy & Security" 
            onPress={() => setActiveTab('privacy')} 
          />
          <SettingItem 
            label="About" 
            onPress={() => setActiveTab('about')} 
          />
        </SectionCard>
      </ScrollView>
      <CustomAlert
        visible={logoutAlert}
        type="warning"
        title="Logout?"
        message="Are you sure you want to logout from your account?"
        onDismiss={() => setLogoutAlert(false)}
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
          { text: 'Logout', style: 'destructive', onPress: handleLogout },
        ]}
      />
      <CustomAlert
        visible={logoutErrorAlert}
        type="error"
        title="Logout Failed"
        message="Unable to logout. Please try again."
        onDismiss={() => setLogoutErrorAlert(false)}
        buttons={[
          { text: 'OK', style: 'default', onPress: () => {} },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    alignItems: 'flex-start',
  },
  tabHeader: {
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: SPACING.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  buttonContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: 40,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  tabContentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
});