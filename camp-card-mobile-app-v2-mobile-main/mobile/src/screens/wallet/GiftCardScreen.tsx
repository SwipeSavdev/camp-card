// Gift Card Screen - Send a Camp Card as a gift
// Part of the Multi-Card Purchase & Gifting System

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS } from '../../config/constants';
import { useTheme } from '../../config/ThemeContext';
import { apiClient } from '../../services/apiClient';

type GiftCardScreenRouteProp = RouteProp<{ GiftCard: { cardId: number } }, 'GiftCard'>;

export default function GiftCardScreen() {
  const navigation = useNavigation();
  const route = useRoute<GiftCardScreenRouteProp>();
  const { cardId } = route.params;
  const { theme } = useTheme();
  const { colors } = theme;

  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [sending, setSending] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const messageRef = useRef<TextInput>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendGift = async () => {
    // Validation
    if (!recipientEmail.trim()) {
      Alert.alert('Email Required', 'Please enter the recipient\'s email address.');
      return;
    }

    if (!validateEmail(recipientEmail.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setSending(true);

    try {
      await apiClient.post(`/api/v1/cards/${cardId}/gift`, {
        recipientEmail: recipientEmail.trim(),
        recipientName: recipientName.trim() || null,
        giftMessage: giftMessage.trim() || null,
      });

      Alert.alert(
        'Gift Sent!',
        `Your Camp Card gift has been sent to ${recipientEmail}. They will receive an email with instructions to claim their gift.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to send gift. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Send as Gift</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Gift Icon */}
          <View style={styles.giftIconContainer}>
            <View style={styles.giftIconCircle}>
              <Ionicons name="gift" size={48} color="#9C27B0" />
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Send this Camp Card as a gift! The recipient will receive an email with a link to
            claim their card and start enjoying exclusive offers.
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Recipient's Email *</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="friend@example.com"
                  placeholderTextColor={colors.textSecondary}
                  value={recipientEmail}
                  onChangeText={setRecipientEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => nameRef.current?.focus()}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Recipient's Name (Optional)</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  ref={nameRef}
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Their name"
                  placeholderTextColor={colors.textSecondary}
                  value={recipientName}
                  onChangeText={setRecipientName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => messageRef.current?.focus()}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Gift Message (Optional)</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  ref={messageRef}
                  style={[styles.input, styles.textArea, { color: colors.text }]}
                  placeholder="Add a personal message..."
                  placeholderTextColor={colors.textSecondary}
                  value={giftMessage}
                  onChangeText={setGiftMessage}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
              </View>
              <Text style={[styles.charCount, { color: colors.textSecondary }]}>{giftMessage.length}/500</Text>
            </View>
          </View>

          {/* Info Box */}
          <View style={[styles.infoBox, { backgroundColor: colors.info + '15' }]}>
            <Ionicons name="information-circle" size={24} color={colors.secondary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>How it works</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                • The recipient will receive an email with your gift{'\n'}
                • They can claim the card by creating an account or logging in{'\n'}
                • Once claimed, the card will be added to their wallet{'\n'}
                • You can cancel the gift anytime before it's claimed
              </Text>
            </View>
          </View>

          {/* Expiry Warning */}
          <View style={[styles.warningBox, { backgroundColor: colors.warning + '15' }]}>
            <Ionicons name="time-outline" size={20} color={colors.warning} />
            <Text style={[styles.warningText, { color: colors.warning }]}>
              Remember: All Camp Cards expire on December 31st. Make sure your recipient has time
              to enjoy their gift!
            </Text>
          </View>
        </ScrollView>

        {/* Send Button */}
        <View style={[styles.bottomSection, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={handleSendGift}
            disabled={sending}
            accessibilityLabel="Send gift"
            accessibilityRole="button"
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="send" size={20} color={colors.white} />
                <Text style={[styles.sendButtonText, { color: colors.white }]}>Send Gift</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  giftIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  giftIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    gap: 10,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    paddingTop: 0,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    height: 52,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
