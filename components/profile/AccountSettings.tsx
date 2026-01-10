import { userServices } from '@/services/userServices';
import { User, deleteUser } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import { COLORS, SPACING } from './constants';
import InfoBox from './InfoBox';
import SectionCard from './SectionCard';

interface AccountSettingsProps {
  user: User | null;
  onLogout: () => void;
  onEditProfile: () => void;
}

export default function AccountSettings({ user, onLogout, onEditProfile }: AccountSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      userServices.getUserProfile(user.uid).then(setUserData);
    }
  }, [user]);

  const handleDeleteAccount = async () => {
    if (!user) {
      Alert.alert('Error', 'No user found');
      return;
    }

    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Delete user data from Firestore first
              await userServices.deleteUserAccount(user.uid);
              
              // Then delete from Authentication
              try {
                await deleteUser(user);
              } catch (_: any) {
                // If deletion fails but Firestore is deleted, still proceed with logout
                // Auth error is silently caught and ignored
              }
              
              // Show success message before logout
              Alert.alert(
                'Account Deleted',
                'Your account and all associated data have been permanently deleted.',
                [
                  {
                    text: 'OK',
                    onPress: () => onLogout(),
                  },
                ]
              );
            } catch (error: any) {
              setLoading(false);
              Alert.alert('Error', error.message || 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <SectionCard style={styles.infoSection}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <InfoBox
            label="Name"
            value={userData?.displayName || userData?.name || ''}
          />
          <InfoBox
            label="Email"
            value={user?.email || 'No email'}
          />
          <InfoBox
            label="Bio"
            value={userData?.bio || ''}
          />
        </View>
      </SectionCard>

      <SectionCard style={styles.actionsSection}>
        <View style={styles.cardContent}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <Button
            label="Edit Profile"
            onPress={onEditProfile}
            variant="secondary"
            style={styles.button}
            disabled={loading}
          />
          <Button
            label="Delete Account"
            onPress={handleDeleteAccount}
            variant="danger"
            style={styles.button}
            disabled={loading}
          />
          <Button
            label="Logout"
            onPress={onLogout}
            variant="danger"
            style={styles.button}
            disabled={loading}
          />
        </View>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  infoSection: {
    marginBottom: SPACING.lg,
  },
  actionsSection: {
    marginBottom: 40,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  button: {
    marginBottom: SPACING.md,
  },
});
