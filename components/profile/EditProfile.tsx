import { toastService } from '@/services/toastService';
import { userServices } from '@/services/userServices';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from './Button';
import { COLORS, SPACING } from './constants';

interface EditProfileProps {
  user: User | null;
  onClose: () => void;
}

export default function EditProfile({ user, onClose }: EditProfileProps) {
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [originalName, setOriginalName] = useState('');
  const [originalBio, setOriginalBio] = useState('');

  // Check if there are any changes
  const hasChanges = displayName !== originalName || bio !== originalBio;

  // Load user data on component mount
  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const userData = await userServices.getUserProfile(user.uid);
        if (isMounted && userData) {
          const name = userData.displayName || userData.name || '';
          const userBio = userData.bio || '';
          setDisplayName(name);
          setBio(userBio);
          setOriginalName(name);
          setOriginalBio(userBio);
          setIsLoaded(true);
        }
      } catch {
        toastService.error('Failed to load profile data');
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    if (!isLoaded) {
      loadUserData();
    }

    return () => {
      isMounted = false;
    };
  }, [user, isLoaded]);

  const handleSaveChanges = async () => {
    if (!user) {
      toastService.error('No user found');
      return;
    }

    if (!displayName.trim()) {
      toastService.error('Please enter your name');
      return;
    }

    try {
      setLoading(true);
      await userServices.updateUserProfile(user.uid, {
        name: displayName,
        bio: bio,
      });
      toastService.success('Profile updated successfully');
      onClose();
    } catch (error: any) {
      toastService.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    return (displayName || user?.email)?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.formSection}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={displayName}
            onChangeText={setDisplayName}
            editable={!loading}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.emailContainer}>
            <TextInput
              style={styles.emailInput}
              value={user?.email || ''}
              editable={false}
              placeholderTextColor={COLORS.textMuted}
            />
            <Text style={styles.emailCheck}>✓</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Tell us about yourself"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            editable={!loading}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <Button
          label="Save changes"
          onPress={handleSaveChanges}
          variant="primary"
          style={styles.saveButton}
          disabled={!hasChanges || loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  avatarSection: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  avatarContainer: {
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: '#1F2937',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.white,
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  formGroup: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bioInput: {
    textAlignVertical: 'top',
    paddingTop: SPACING.md,
    minHeight: 100,
  },
  emailContainer: {
    position: 'relative',
  },
  emailInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingRight: SPACING.xl + SPACING.lg,
  },
  emailCheck: {
    position: 'absolute',
    right: SPACING.lg,
    top: '50%',
    marginTop: -12,
    fontSize: 20,
    color: '#10B981',
  },
  saveButton: {
    marginTop: SPACING.xl,
  },
});
