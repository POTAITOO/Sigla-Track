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

const getResponsiveDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

export default function PrivacyPolicy() {
  const router = useRouter();
  const [dimensions, setDimensions] = useState(getResponsiveDimensions());

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setDimensions(getResponsiveDimensions());
    });
    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[
        styles.container,
        { paddingTop: Platform.OS === 'ios' ? 44 : Platform.OS === 'android' ? StatusBar.currentHeight : 0 }
      ]}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Last Updated */}
          <Text style={styles.lastUpdated}>Last updated: January 3, 2026</Text>

          {/* Introduction */}
          <View style={styles.section}>
            <Text style={styles.paragraph}>
              Welcome to our Schedule Management App. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it.
            </Text>
          </View>

          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.paragraph}>
              We collect information that you provide directly to us when you:
            </Text>
            <Text style={styles.bulletPoint}>• Create an account</Text>
            <Text style={styles.bulletPoint}>• Use our services</Text>
            <Text style={styles.bulletPoint}>• Contact customer support</Text>
            <Text style={styles.bulletPoint}>• Participate in surveys or promotions</Text>
            <Text style={styles.paragraph}>
              This may include your name, email address, phone number, profile picture, and any other information you choose to provide.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              We use the information we collect to:
            </Text>
            <Text style={styles.bulletPoint}>• Provide, maintain, and improve our services</Text>
            <Text style={styles.bulletPoint}>• Process transactions and send related information</Text>
            <Text style={styles.bulletPoint}>• Send technical notices and support messages</Text>
            <Text style={styles.bulletPoint}>• Respond to your comments and questions</Text>
            <Text style={styles.bulletPoint}>• Monitor and analyze trends and usage</Text>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Information Sharing</Text>
            <Text style={styles.paragraph}>
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </Text>
            <Text style={styles.bulletPoint}>• With your consent</Text>
            <Text style={styles.bulletPoint}>• To comply with legal obligations</Text>
            <Text style={styles.bulletPoint}>• To protect our rights and safety</Text>
            <Text style={styles.bulletPoint}>• With service providers who assist our operations</Text>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.paragraph}>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Your Rights</Text>
            <Text style={styles.paragraph}>
              You have the right to:
            </Text>
            <Text style={styles.bulletPoint}>• Access your personal information</Text>
            <Text style={styles.bulletPoint}>• Correct inaccurate information</Text>
            <Text style={styles.bulletPoint}>• Request deletion of your information</Text>
            <Text style={styles.bulletPoint}>• Object to processing of your information</Text>
            <Text style={styles.bulletPoint}>• Export your data</Text>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Data Retention</Text>
            <Text style={styles.paragraph}>
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete your information within 30 days, except where we are required to retain it by law.
            </Text>
          </View>

          {/* Section 7 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
            <Text style={styles.paragraph}>
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child, please contact us immediately.
            </Text>
          </View>

          {/* Section 8 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </Text>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have any questions about this Privacy Policy, please contact us at:
            </Text>
            <Text style={styles.contactInfo}>Email: privacy@yourapp.com</Text>
            <Text style={styles.contactInfo}>Phone: +1 (800) 123-4567</Text>
            <Text style={styles.contactInfo}>Address: 123 Main St, City, State 12345</Text>
          </View>

        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingVertical: '2%',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 50,
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: '5%',
    paddingVertical: '2%',
    paddingBottom: '5%',
  },

  // Content
  lastUpdated: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: '2%',
    fontStyle: 'italic',
  },

  section: {
    marginBottom: '2.5%',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '1.2%',
  },

  paragraph: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: '1.5%',
  },

  bulletPoint: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    paddingLeft: '3%',
    marginBottom: '0.8%',
  },

  contactInfo: {
    fontSize: 14,
    color: '#3B82F6',
    lineHeight: 22,
    marginBottom: '0.8%',
  },
});