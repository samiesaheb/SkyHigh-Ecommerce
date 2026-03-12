import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HelpSupportScreenProps {
  navigation: any;
}

const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({ navigation }) => {
  const handleContactPress = (method: string, value: string) => {
    switch (method) {
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'phone':
        Linking.openURL(`tel:${value}`);
        break;
      case 'website':
        Linking.openURL(value);
        break;
      default:
        Alert.alert('Info', value);
    }
  };

  const ContactItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress 
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.contactItem} onPress={onPress}>
      <View style={styles.contactIcon}>
        <Ionicons name={icon} size={24} color="#007AFF" />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
    <View style={styles.faqItem}>
      <Text style={styles.faqQuestion}>{question}</Text>
      <Text style={styles.faqAnswer}>{answer}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="help-circle" size={40} color="#007AFF" />
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>
            We're here to help you with any questions or issues
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          
          <ContactItem
            icon="mail"
            title="Email Support"
            subtitle="support@skyhigh.com"
            onPress={() => handleContactPress('email', 'support@skyhigh.com')}
          />
          
          <ContactItem
            icon="call"
            title="Phone Support"
            subtitle="+66 2 123 4567"
            onPress={() => handleContactPress('phone', '+6621234567')}
          />
          
          <ContactItem
            icon="globe"
            title="Website"
            subtitle="Visit our website for more information"
            onPress={() => handleContactPress('website', 'https://skyhigh.com')}
          />
          
          <ContactItem
            icon="chatbubbles"
            title="Live Chat"
            subtitle="Chat with our support team"
            onPress={() => Alert.alert('Live Chat', 'Live chat feature coming soon!')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <FAQItem
            question="How do I track my order?"
            answer="You can track your order by going to your Profile > Orders section. You'll see the current status of all your orders there."
          />
          
          <FAQItem
            question="What is your return policy?"
            answer="We accept returns within 30 days of purchase. Items must be in original condition. Contact our support team to initiate a return."
          />
          
          <FAQItem
            question="How long does shipping take?"
            answer="Standard shipping takes 3-5 business days within Thailand. Express shipping is available and takes 1-2 business days."
          />
          
          <FAQItem
            question="Do you offer international shipping?"
            answer="Currently, we only ship within Thailand. International shipping will be available soon."
          />
          
          <FAQItem
            question="How can I change my account information?"
            answer="Go to your Profile > Edit Profile to update your name, email, and other account details."
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.appInfo}>
            <Text style={styles.appInfoItem}>Version: 1.0.0</Text>
            <Text style={styles.appInfoItem}>Last Updated: January 2025</Text>
            <Text style={styles.appInfoItem}>© 2025 Sky High. All rights reserved.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  faqItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  appInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  appInfoItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default HelpSupportScreen;