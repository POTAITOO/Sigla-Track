import EventCreateModal from '@/components/EventCreateModal';
import { eventServices } from '@/services/eventServices';
import { toastService } from '@/services/toastService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export default function EditEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!id) {
      toastService.error('Event ID is required');
      router.back();
      return;
    }

    const loadEvent = async () => {
      try {
        setLoading(true);
        // Fetch the event from the database
        const eventData = await eventServices.getEventById(id);
        if (eventData) {
          setEvent(eventData as Event);
          setModalVisible(true);
        } else {
          toastService.error('Event not found');
          router.back();
        }
      } catch {
        toastService.error('Failed to load event');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, router]);

  useEffect(() => {
    if (successMessage) {
      toastService.success(successMessage);
      setSuccessMessage('');
      router.back();
    }
  }, [successMessage, router]);

  const handleModalSuccess = (message: string) => {
    setSuccessMessage(message);
  };

  const handleModalError = (message: string) => {
    toastService.error(message);
  };

  const handleModalDismiss = () => {
    setModalVisible(false);
    // Don't navigate back if just dismissing without saving
  };

  if (loading) {
    return (
      <RNSafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </RNSafeAreaView>
    );
  }

  return (
    <RNSafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Event</Text>
      </View>

      {/* Event Edit Modal */}
      {event && (
        <EventCreateModal
          visible={modalVisible}
          onDismiss={handleModalDismiss}
          onSuccess={handleModalSuccess}
          onError={handleModalError}
          event={event}
        />
      )}
    </RNSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    paddingRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
});
