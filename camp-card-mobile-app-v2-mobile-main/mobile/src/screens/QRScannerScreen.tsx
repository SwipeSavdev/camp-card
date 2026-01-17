import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { apiClient } from '../utils/api';
import { useAuthStore } from '../store/authStore';

export default function MyQRCodeScreen() {
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState<any>(null);
  const [shareableLink, setShareableLink] = useState('');
  const navigation = useNavigation();
  const { user } = useAuthStore();

  useEffect(() => {
    loadUserQRCode();
  }, []);

  const loadUserQRCode = async () => {
    try {
      // Generate or fetch user's unique QR code data
      const response = await apiClient.get('/api/v1/users/me/qr-code');
      const data = response.data;
      
      setQrData({
        type: 'campcard_user',
        userId: data.userId,
        subscriptionId: data.subscriptionId,
        uniqueCode: data.uniqueCode,
        validUntil: data.validUntil
      });
      
      // Generate shareable link
      const link = `https://campcardapp.com/u/${data.uniqueCode}`;
      setShareableLink(link);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my BSA Camp Card! Use my link for exclusive discounts: ${shareableLink}`,
        url: shareableLink,
        title: 'Share Camp Card'
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(shareableLink);
    Alert.alert('Copied!', 'Link copied to clipboard');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003f87" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Fixed Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#003f87" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My QR Code</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>My Camp Card</Text>
      <Text style={styles.subtitle}>
        Share your unique QR code or link to earn referral rewards
      </Text>

      {/* QR Code Display */}
      <View style={styles.qrContainer}>
        <QRCode
          value={JSON.stringify(qrData)}
          size={250}
          backgroundColor="white"
          color="#003f87"
        />
      </View>

      {/* User Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={20} color="#003f87" />
          <Text style={styles.infoLabel}>Name</Text>
        </View>
        <Text style={styles.infoValue}>{user?.firstName} {user?.lastName}</Text>
        
        <View style={styles.divider} />
        
        <View style={styles.infoRow}>
          <Ionicons name="card" size={20} color="#003f87" />
          <Text style={styles.infoLabel}>Member ID</Text>
        </View>
        <Text style={styles.infoValue}>{qrData?.uniqueCode}</Text>
      </View>

      {/* Share Options */}
      <View style={styles.shareSection}>
        <Text style={styles.sectionTitle}>Share Your Link</Text>
        
        <View style={styles.linkContainer}>
          <Text style={styles.linkText} numberOfLines={1}>
            {shareableLink}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCopyLink}
          >
            <Ionicons name="copy" size={20} color="white" />
            <Text style={styles.actionButtonText}>Copy Link</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={20} color="white" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#666" />
        <Text style={styles.infoBoxText}>
          Friends who join using your link will help support your troop's fundraising goals!
        </Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#003f87',
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003f87',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  qrContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 15,
  },
  shareSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f87',
    marginBottom: 15,
  },
  linkContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  linkText: {
    fontSize: 14,
    color: '#003f87',
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#003f87',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  shareButton: {
    backgroundColor: '#ce1126',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#2e7d32',
    marginLeft: 10,
    lineHeight: 18,
  },
});
