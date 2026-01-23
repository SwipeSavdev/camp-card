// Invite Scouts screen for Troop Leaders to invite new scouts to their troop

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { COLORS } from '../../config/constants';
import { useAuthStore } from '../../store/authStore';

export default function InviteScoutsScreen() {
  const { user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  // Generate a unique invite code (mock - will come from API)
  const inviteCode = `TROOP-${user?.troopId || '101'}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const inviteLink = `https://campcard.org/join/${inviteCode}`;

  const handleSendInvite = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setSending(true);
    try {
      // TODO: Call API to send invite email
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Success', `Invitation sent to ${email}`);
      setEmail('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send invitation. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(inviteLink);
    Alert.alert('Copied!', 'Invite link copied to clipboard');
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Join our BSA Troop on Camp Card! Use this link to sign up: ${inviteLink}`,
        title: 'Join Camp Card',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content}>
        {/* Email Invite Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invite by Email</Text>
          <Text style={styles.sectionDescription}>
            Send a direct invitation to a scout or parent's email address
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={COLORS.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={handleSendInvite}
            disabled={sending}
          >
            {sending ? (
              <Text style={styles.sendButtonText}>Sending...</Text>
            ) : (
              <>
                <Ionicons name="send" size={18} color={COLORS.surface} />
                <Text style={styles.sendButtonText}>Send Invitation</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Invite Link Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Invite Link</Text>
          <Text style={styles.sectionDescription}>
            Share this unique link with scouts to join your troop
          </Text>

          <View style={styles.linkCard}>
            <View style={styles.linkHeader}>
              <Ionicons name="link" size={20} color={COLORS.secondary} />
              <Text style={styles.linkLabel}>Your Troop Invite Link</Text>
            </View>
            <Text style={styles.linkText} numberOfLines={1}>
              {inviteLink}
            </Text>
            <View style={styles.linkActions}>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={handleCopyLink}
              >
                <Ionicons name="copy-outline" size={18} color={COLORS.secondary} />
                <Text style={styles.linkButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.linkButton, styles.shareButton]}
                onPress={handleShareLink}
              >
                <Ionicons name="share-outline" size={18} color={COLORS.surface} />
                <Text style={[styles.linkButtonText, styles.shareButtonText]}>
                  Share
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Invite Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invite Code</Text>
          <Text style={styles.sectionDescription}>
            Scouts can enter this code during registration
          </Text>

          <View style={styles.codeCard}>
            <Text style={styles.codeText}>{inviteCode}</Text>
            <TouchableOpacity
              onPress={async () => {
                await Clipboard.setStringAsync(inviteCode);
                Alert.alert('Copied!', 'Invite code copied to clipboard');
              }}
            >
              <Ionicons name="copy" size={24} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <Ionicons
              name="bulb-outline"
              size={24}
              color={COLORS.warning}
              style={styles.tipIcon}
            />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Tips for inviting scouts</Text>
              <Text style={styles.tipText}>
                • Share the invite link at your next troop meeting{'\n'}
                • Email parents with the registration link{'\n'}
                • Post the invite code on your troop's communication board
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  sectionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    gap: 6,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.surface,
  },
  linkCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  linkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  linkLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  linkText: {
    fontSize: 13,
    color: COLORS.secondary,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  linkActions: {
    flexDirection: 'row',
    gap: 10,
  },
  linkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 6,
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  linkButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  shareButton: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  shareButtonText: {
    color: COLORS.surface,
  },
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
  },
  codeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
