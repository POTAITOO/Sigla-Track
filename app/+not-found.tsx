import { useRootNavigationState, useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { auth } from '../firebaseConfig.js';

export default function NotFound() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(true);
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated, go to home
        router.replace('/tabs/home');
      } else {
        // User is not authenticated, go to login
        router.replace('/auth/login');
      }
      setRedirecting(false);
    });

    return () => unsubscribe();
  }, [navigationState?.key, router]);

  if (redirecting) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Redirecting...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.subtitle}>
        This page doesn&apos;t exist. You&apos;re being redirected...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 16,
    color: '#667085',
  },
});
