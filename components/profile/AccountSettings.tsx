import { userServices } from '@/services/userServices';
import CustomAlert from '@/components/CustomAlert';
import { toastService } from '@/services/toastService';
import { User, deleteUser } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import { COLORS, SPACING } from './constants';
import InfoBox from './InfoBox';
import SectionCard from './SectionCard';

interface AccountSettingsProps {
  user: User | null;
  onLogout: () => void;
  onAutoLogout?: () => void;
  onEditProfile: () => void;
}

export default function AccountSettings({ user, onLogout, onAutoLogout, onEditProfile }: AccountSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      userServices.getUserProfile(user.uid).then(setUserData);
    }
  }, [user]);

  const handleDeleteAccount = async () => {
    if (!user) {
      toastService.error('No user found');
      return;
    }

    setDeleteAlert(true);
  };

  const confirmDeleteAccount = async () => {
    if (!user) {
      toastService.error('No user found');
      return;
    }

    try {
      setLoading(true);
      setDeleteAlert(false);
      
      // Delete user data from Firestore first
      await userServices.deleteUserAccount(user.uid);
      
      // Then delete from Firebase Authentication
      // This requires recent authentication
      await deleteUser(user);
      
      // Show success toast and auto-logout
      toastService.success('Account deleted successfully');
      
      // Auto-logout after a brief delay to show the toast
      setTimeout(() => {
        onAutoLogout?.() || onLogout();
      }, 1500);
    } catch (error: any) {
      setLoading(false);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/requires-recent-login') {
        setErrorMessage('Please re-login and try again. For security, account deletion requires recent authentication.');
      } else if (error.code === 'auth/user-token-expired') {
        setErrorMessage('Your session expired. Please logout and login again to delete your account.');
      } else {
        setErrorMessage(error.message || 'Failed to delete account');
      }
      
      setErrorAlert(true);
    }
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

      <CustomAlert
        visible={deleteAlert}
        type="error"
        title="Delete Account?"
        message="This action cannot be undone. All your data will be permanently deleted."
        onDismiss={() => setDeleteAlert(false)}
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
          { text: 'Delete', style: 'destructive', onPress: confirmDeleteAccount },
        ]}
      />



      <CustomAlert
        visible={errorAlert}
        type="error"
        title="Error"
        message={errorMessage}
        onDismiss={() => setErrorAlert(false)}
        buttons={[
          { text: 'OK', style: 'default', onPress: () => {} },
        ]}
      />
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
