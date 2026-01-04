import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomNav from "../components/BottomNav";

const getResponsiveDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

export default function Profile() {
  const router = useRouter();
  const [dimensions, setDimensions] = useState(getResponsiveDimensions());
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setDimensions(getResponsiveDimensions());
    });
    return () => subscription?.remove();
  }, []);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const { width, height } = dimensions;
  
  // State
  const [userName, setUserName] = useState('Sigla Track');
  const [userEmail, setUserEmail] = useState('youremail@gmail.com');
  const [userPhone, setUserPhone] = useState('0912 345 678');

  // Navigation Functions
  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

 const handleTheme = () => {
  setIsDarkMode(!isDarkMode);
  console.log('Theme toggled to:', !isDarkMode ? 'Dark mode' : 'Light mode');
  // Here you can add logic to actually apply the theme to your app
};

  const handleHelpSupport = () => {
    router.push('/help');
  };

  const handlePrivacyPolicy = () => {
    router.push('/policy');
  };

  const handleLogout = () => {
    // Add any logout logic here (clear tokens, etc.)
    console.log('Logging out...');
    router.push('/');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <View style={[
        styles.container,
        { paddingTop: Platform.OS === 'ios' ? 44 : Platform.OS === 'android' ? StatusBar.currentHeight : 0 }
      ]}>
        
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          {/* Profile Picture */}
          <View style={styles.profilePictureContainer}>
            <View style={[
              styles.profilePicture,
              {
                width: width * 0.25,
                height: width * 0.25,
                borderRadius: (width * 0.25) / 2,
              }
            ]}>
              {/* Replace with your Image component */}
              <View style={styles.avatarPlaceholder}>
                <Text style={[styles.avatarText, { fontSize: width * 0.08 }]}>ST</Text>
              </View>
            </View>
            
          </View>

          {/* User Info */}
          <Text style={[styles.userName, { fontSize: width * 0.05 }]}>{userName}</Text>
          <Text style={[styles.userContact, { fontSize: width * 0.032 }]}>{userEmail} | {userPhone}</Text>
        </View>

        {/* Menu Section */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: height * 0.02,
              paddingHorizontal: width * 0.05,
              paddingBottom: height * 0.15,
            }
          ]}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Edit Profile */}
          <TouchableOpacity 
            style={[styles.menuItem, { paddingVertical: height * 0.018 }]}
            onPress={handleEditProfile}
          >
            <View style={styles.menuItemLeft}>
              <View style={[
                styles.iconContainer,
                {
                  width: width * 0.1,
                  height: width * 0.1,
                  marginRight: width * 0.03,
                }
              ]}>
                <Text style={[styles.menuIcon, { fontSize: width * 0.05 }]}>📝</Text>
              </View>
              <Text style={[styles.menuItemText, { fontSize: width * 0.04 }]}>Edit profile information</Text>
            </View>
            <Text style={[styles.menuArrow, { fontSize: width * 0.06 }]}>›</Text>
          </TouchableOpacity>

          {/* Theme */}
          <TouchableOpacity 
            style={[styles.menuItem, { paddingVertical: height * 0.018 }]}
            onPress={handleTheme}
          >
            <View style={styles.menuItemLeft}>
              <View style={[
                styles.iconContainer,
                {
                  width: width * 0.1,
                  height: width * 0.1,
                  marginRight: width * 0.03,
                }
              ]}>
                <Text style={[styles.menuIcon, { fontSize: width * 0.05 }]}>
                  {isDarkMode ? '🌙' : '☀️'}
                </Text>
              </View>
              <Text style={[styles.menuItemText, { fontSize: width * 0.04 }]}>Theme</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={[styles.menuItemValue, { fontSize: width * 0.035 }]}>
                {isDarkMode ? 'Dark mode' : 'Light mode'}
              </Text>
              <Text style={[styles.menuArrow, { fontSize: width * 0.06 }]}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View style={[styles.divider, { marginVertical: height * 0.01 }]} />

          {/* Help & Support */}
          <TouchableOpacity 
            style={[styles.menuItem, { paddingVertical: height * 0.018 }]}
            onPress={handleHelpSupport}
          >
            <View style={styles.menuItemLeft}>
              <View style={[
                styles.iconContainer,
                {
                  width: width * 0.1,
                  height: width * 0.1,
                  marginRight: width * 0.03,
                }
              ]}>
                <Text style={[styles.menuIcon, { fontSize: width * 0.05 }]}>❓</Text>
              </View>
              <Text style={[styles.menuItemText, { fontSize: width * 0.04 }]}>Help & Support</Text>
            </View>
            <Text style={[styles.menuArrow, { fontSize: width * 0.06 }]}>›</Text>
          </TouchableOpacity>

          {/* Privacy policy */}
          <TouchableOpacity 
            style={[styles.menuItem, { paddingVertical: height * 0.018 }]}
            onPress={handlePrivacyPolicy}
          >
            <View style={styles.menuItemLeft}>
              <View style={[
                styles.iconContainer,
                {
                  width: width * 0.1,
                  height: width * 0.1,
                  marginRight: width * 0.03,
                }
              ]}>
                <Text style={[styles.menuIcon, { fontSize: width * 0.05 }]}>🔒</Text>
              </View>
              <Text style={[styles.menuItemText, { fontSize: width * 0.04 }]}>Privacy policy</Text>
            </View>
            <Text style={[styles.menuArrow, { fontSize: width * 0.06 }]}>›</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity 
            style={[
              styles.logoutButton,
              {
                marginTop: height * 0.03,
                paddingVertical: height * 0.018,
              }
            ]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutText, { fontSize: width * 0.04 }]}>Logout</Text>
          </TouchableOpacity>

        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNav />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  // Profile Header
  profileHeader: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    paddingTop: '3%',
    paddingBottom: '2.5%',
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: '1.5%',
  },
  profilePicture: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#93C5FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontWeight: '700',
    color: '#1E40AF',
  },
  editIconButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  editIcon: {},
  userName: {
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userContact: {
    color: '#6B7280',
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {},

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {},
  menuItemText: {
    color: '#1F2937',
    fontWeight: '400',
  },
  menuItemValue: {
    color: '#3B82F6',
    fontWeight: '400',
  },
  menuArrow: {
    color: '#9CA3AF',
    fontWeight: '300',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fc4e4eff',
    borderRadius: 12,
    paddingHorizontal: '5%',
    gap: 8,
  },
  logoutText: {
    color: '#fefbfbff',
    fontWeight: '600',
  },
});