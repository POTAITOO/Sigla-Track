import EventCreateModal from '@/components/EventCreateModal';
import { useAuth } from '@/context/authContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

type Event = {
  id: string;
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  location?: string;
  category: 'work' | 'personal' | 'meeting' | 'deadline' | 'other';
  color: string;
  reminder: number;
};

export default function CreateEventScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      // Keep the time from startTime
      const newDate = new Date(selectedDate);
      newDate.setHours(new Date().getHours(), new Date().getMinutes(), 0, 0);
      // this is handled by the modal
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    // handled by the modal
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    // handled by the modal
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    // handled by the modal
  };

  const handleCreateEvent = async () => {
    // Modal handles this
  };

  useEffect(() => {
    if (successMessage) {
      Alert.alert('Success', successMessage, [
        {
          text: 'OK',
          onPress: () => {
            setSuccessMessage('');
            setModalVisible(false);
            // Optionally navigate back or refresh the events list
          },
        },
      ]);
    }
  }, [successMessage]);

  const handleModalSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const handleModalError = (message: string) => {
    Alert.alert('Error', message);
  };

  const handleModalDismiss = () => {
    setModalVisible(false);
    router.back();
  };


  return (
    <RNSafeAreaView style={styles.container}>
      {/* Event Create Modal - Opens Immediately */}
      <EventCreateModal
        visible={modalVisible}
        onDismiss={handleModalDismiss}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
        event={selectedEvent}
      />
    </RNSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});