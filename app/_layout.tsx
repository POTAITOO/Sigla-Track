import EventCreateModal from '@/components/EventCreateModal';
import { AuthProvider } from '@/context/authContext';
import { EventModalProvider, useEventModal } from '@/context/eventModalContext';
import { Stack } from 'expo-router';
import { Alert } from 'react-native';
import { PaperProvider } from 'react-native-paper';

function RootLayoutContent() {
  const { isVisible, selectedEvent, closeModal } = useEventModal();

  const handleSuccess = (message: string) => {
    Alert.alert('Success', message, [
      {
        text: 'OK',
        onPress: () => closeModal(),
      },
    ]);
  };

  const handleError = (message: string) => {
    Alert.alert('Error', message);
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
    </>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <EventModalProvider>
          <RootLayoutContent />
        </EventModalProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
