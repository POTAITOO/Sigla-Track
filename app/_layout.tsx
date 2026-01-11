import CustomAlert from '@/components/CustomAlert';
import EventCreateModal from '@/components/EventCreateModal';
import { AuthProvider } from '@/context/authContext';
import { EventModalProvider, useEventModal } from '@/context/eventModalContext';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { LogBox, View } from 'react-native';
import { PaperProvider, Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';


// Suppress Expo Go push notification warning and calendar permission errors
LogBox.ignoreLogs([
  'Android Push notifications',
  'expo-notifications',
  /expo-notifications.*Android Push/,
  'CALENDAR permission is required',
  'Error fetching device calendar events',
]);
export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertState {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  buttons?: {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
}

const toastConfig = {
  success: (props: any) => (
    <View
      style={{
        height: 60,
        width: '90%',
        backgroundColor: '#f0fdf4',
        borderLeftWidth: 5,
        borderLeftColor: '#22c55e',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginHorizontal: 12,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#15803d',
        }}
      >
        {props.text1}
      </Text>
    </View>
  ),
  error: (props: any) => (
    <View
      style={{
        height: 60,
        width: '90%',
        backgroundColor: '#fef2f2',
        borderLeftWidth: 5,
        borderLeftColor: '#ef4444',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginHorizontal: 12,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#991b1b',
        }}
      >
        {props.text1}
      </Text>
    </View>
  ),
  warning: (props: any) => (
    <View
      style={{
        height: 60,
        width: '90%',
        backgroundColor: '#7f1d1d',
        borderLeftWidth: 5,
        borderLeftColor: '#dc2626',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginHorizontal: 12,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#fecaca',
        }}
      >
        {props.text1}
      </Text>
    </View>
  ),
  info: (props: any) => (
    <View
      style={{
        height: 60,
        width: '90%',
        backgroundColor: '#eff6ff',
        borderLeftWidth: 5,
        borderLeftColor: '#3b82f6',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginHorizontal: 12,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: '#1e40af',
        }}
      >
        {props.text1}
      </Text>
    </View>
  ),
};

function RootLayoutContent() {
  const { isVisible, selectedEvent, closeModal } = useEventModal();
  const [alertState, setAlertState] = useState<AlertState>({ visible: false, type: 'info', title: '', message: '' });

  // Setup notification handler
  useEffect(() => {
    // Set notification handler for when notifications arrive
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Listen for notifications received
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('📲 NOTIFICATION RECEIVED:');
      console.log('Title:', notification.request.content.title);
      console.log('Body:', notification.request.content.body);
      console.log('Data:', notification.request.content.data);
      console.log('Timestamp:', new Date().toLocaleTimeString());
    });

    // Cleanup subscription on unmount
    return () => subscription.remove();
  }, []);

  const handleSuccess = (message: string) => {
    setAlertState({
      visible: true,
      type: 'success',
      title: 'Success',
      message,
      buttons: [{ text: 'OK', onPress: closeModal, style: 'default' }],
    });
  };

  const handleError = (message: string) => {
    setAlertState({
      visible: true,
      type: 'error',
      title: 'Error',
      message,
      buttons: [{ text: 'OK', onPress: () => {}, style: 'default' }],
    });
  };

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <EventCreateModal
        visible={isVisible}
        onDismiss={closeModal}
        onSuccess={handleSuccess}
        onError={handleError}
        event={selectedEvent}
      />
      <CustomAlert
        visible={alertState.visible}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onDismiss={() => setAlertState({ ...alertState, visible: false })}
        buttons={alertState.buttons}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <EventModalProvider>
          <RootLayoutContent />
          <Toast config={toastConfig} />
        </EventModalProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
