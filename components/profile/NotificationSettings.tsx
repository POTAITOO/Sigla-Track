import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Switch } from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/context/authContext';
import { userServices } from '@/services/userServices';
import { habitServices } from '@/services/habitServices';
import { eventServices } from '@/services/eventServices';
import CustomAlert from '@/components/CustomAlert';

interface NotificationPreferences {
  pushNotificationsEnabled: boolean;
  habitRemindersEnabled: boolean;
  eventRemindersEnabled: boolean;
}

const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    pushNotificationsEnabled: false,
    habitRemindersEnabled: true,
    eventRemindersEnabled: true,
  });
  const [alert, setAlert] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });
  const [loading, setLoading] = useState(false);

  // Load notification preferences on mount
  useEffect(() => {
    if (user?.uid) {
      loadNotificationPreferences();
    }
  }, [user?.uid]);

  const loadNotificationPreferences = async () => {
    try {
      if (!user?.uid) return;
      const userProfile = await userServices.getUserProfile(user.uid);
      if (userProfile?.notificationPreferences) {
        setPreferences(userProfile.notificationPreferences);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      setLoading(true);
      if (!user?.uid) return;

      await userServices.updateUserProfile(user.uid, {
        notificationPreferences: newPreferences,
      });

      setAlert({
        visible: true,
        message: 'Notification settings updated successfully!',
      });
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setAlert({
        visible: true,
        message: 'Failed to save notification settings',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePushNotifications = async (value: boolean) => {
    const newPreferences = { ...preferences, pushNotificationsEnabled: value };
    setPreferences(newPreferences);

    if (value) {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          console.log('✅ Push notifications enabled');
          await savePreferences(newPreferences);
          // Reschedule all notifications
          if (user?.uid) {
            await habitServices.rescheduleAllHabitNotifications(user.uid);
            await eventServices.rescheduleAllEventNotifications(user.uid);
          }
        } else {
          setPreferences({ ...preferences, pushNotificationsEnabled: false });
          setAlert({
            visible: true,
            message: 'Push notification permission was not granted.',
          });
        }
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        setPreferences({ ...preferences, pushNotificationsEnabled: false });
      }
    } else {
      console.log('❌ Push notifications disabled');
      await savePreferences(newPreferences);
      // Cancel all notifications
      if (user?.uid) {
        await habitServices.cancelAllHabitNotifications(user.uid);
        await eventServices.cancelAllEventNotifications(user.uid);
      }
    }
  };

  const handleToggleHabitReminders = async (value: boolean) => {
    const newPreferences = { ...preferences, habitRemindersEnabled: value };
    setPreferences(newPreferences);

    if (preferences.pushNotificationsEnabled) {
      await savePreferences(newPreferences);
      if (value) {
        console.log('✅ Habit reminders enabled');
        if (user?.uid) {
          await habitServices.rescheduleAllHabitNotifications(user.uid);
        }
      } else {
        console.log('❌ Habit reminders disabled');
        if (user?.uid) {
          await habitServices.cancelAllHabitNotifications(user.uid);
        }
      }
    } else {
      setAlert({
        visible: true,
        message: 'Enable push notifications first to receive habit reminders.',
      });
      setPreferences({ ...preferences, habitRemindersEnabled: false });
    }
  };

  const handleToggleEventReminders = async (value: boolean) => {
    const newPreferences = { ...preferences, eventRemindersEnabled: value };
    setPreferences(newPreferences);

    if (preferences.pushNotificationsEnabled) {
      await savePreferences(newPreferences);
      if (value) {
        console.log('✅ Event reminders enabled');
        if (user?.uid) {
          await eventServices.rescheduleAllEventNotifications(user.uid);
        }
      } else {
        console.log('❌ Event reminders disabled');
        if (user?.uid) {
          await eventServices.cancelAllEventNotifications(user.uid);
        }
      }
    } else {
      setAlert({
        visible: true,
        message: 'Enable push notifications first to receive event reminders.',
      });
      setPreferences({ ...preferences, eventRemindersEnabled: false });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Push Notifications</Text>
      <View style={styles.settingItem}>
        <View style={styles.settingText}>
          <Text style={styles.label}>Enable Push Notifications</Text>
          <Text style={styles.description}>Allow app to send notifications</Text>
        </View>
        <Switch
          value={preferences.pushNotificationsEnabled}
          onValueChange={handleTogglePushNotifications}
          disabled={loading}
        />
      </View>

      {preferences.pushNotificationsEnabled && (
        <>
          <Text style={styles.sectionTitle}>Notification Types</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.label}>🎯 Habit Reminders</Text>
              <Text style={styles.description}>Receive daily habit reminders</Text>
            </View>
            <Switch
              value={preferences.habitRemindersEnabled}
              onValueChange={handleToggleHabitReminders}
              disabled={loading}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.label}>📋 Event Reminders</Text>
              <Text style={styles.description}>Get notified before your events</Text>
            </View>
            <Switch
              value={preferences.eventRemindersEnabled}
              onValueChange={handleToggleEventReminders}
              disabled={loading}
            />
          </View>
        </>
      )}

      <CustomAlert
        visible={alert.visible}
        type="info"
        title="Notification Settings"
        message={alert.message}
        onDismiss={() => setAlert({ ...alert, visible: false })}
        buttons={[{ text: 'OK', style: 'default', onPress: () => setAlert({ ...alert, visible: false }) }]}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginTop: 20,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  settingText: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#666',
  },
});

export default NotificationSettings;
