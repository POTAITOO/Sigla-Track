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

export default function HelpSupport() {
  const router = useRouter();
  const [dimensions, setDimensions] = useState(getResponsiveDimensions());
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setDimensions(getResponsiveDimensions());
    });
    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;

  const faqs = [
    {
      question: 'How do I create a new task?',
      answer: 'To create a new task, go to the Schedule page and tap the "+" button. Fill in the task details including title, time, and description, then save.',
    },
    {
      question: 'How do I edit my profile?',
      answer: 'Navigate to the Profile page, tap "Edit profile information", make your changes, and tap "Save Changes" when done.',
    },
    {
      question: 'Can I sync with other calendars?',
      answer: 'Yes! Go to Settings > Integrations to connect your Google Calendar, Outlook, or other calendar services.',
    },
    {
      question: 'How do I change the app theme?',
      answer: 'Go to Profile > Theme and select either Light mode or Dark mode according to your preference.',
    },
    {
      question: 'How do I delete a task?',
      answer: 'Swipe left on any task to reveal the delete option, or tap on the task to open details and select delete.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity 
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(index)}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Text style={styles.faqIcon}>
                    {expandedFAQ === index ? '−' : '+'}
                  </Text>
                </TouchableOpacity>
                
                {expandedFAQ === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Contact Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Support</Text>
            
            <TouchableOpacity style={styles.contactCard}>
              <View style={styles.contactIcon}>
                <Text style={styles.contactIconText}>📧</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactDescription}>support@yourapp.com</Text>
              </View>
            </TouchableOpacity>

            
            <TouchableOpacity style={styles.contactCard}>
              <View style={styles.contactIcon}>
                <Text style={styles.contactIconText}>📱</Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Phone Support</Text>
                <Text style={styles.contactDescription}>+1 (800) 123-4567</Text>
              </View>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingVertical: '2%',
    backgroundColor: '#FFFFFF',
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
    paddingBottom: '5%',
  },

  // Section
  section: {
    paddingHorizontal: '5%',
    marginTop: '3%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '1.5%',
  },

  // FAQ
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: '1.2%',
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4%',
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    paddingRight: '2%',
  },
  faqIcon: {
    fontSize: 22,
    color: '#3B82F6',
    fontWeight: '300',
  },
  faqAnswer: {
    paddingHorizontal: '4%',
    paddingBottom: '4%',
    paddingTop: 0,
  },
  faqAnswerText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Contact Cards
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: '4%',
    marginBottom: '1.2%',
  },
  contactIcon: {
    width: '12%',
    aspectRatio: 1,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '3%',
  },
  contactIconText: {
    fontSize: 22,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
});