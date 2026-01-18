import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { apiClient } from '../utils/api';

interface Offer {
  id: number;
  merchantName: string;
  title: string;
  description: string;
  discountPercentage: number;
}

export default function ShareOfferScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { offer } = route.params as { offer: Offer };
  
  const [loading, setLoading] = useState(true);
  const [shareableLink, setShareableLink] = useState('');
  const [qrData, setQrData] = useState<any>(null);

  useEffect(() => {
    generateShareableLink();
  }, []);

  const generateShareableLink = async () => {
    try {
      // Generate unique shareable link for this offer
      const response = await apiClient.post('/offers/generate-link', {
        offerId: offer.id
      });
      
      // Use shareable link from backend API response
      // Fallback to offers page on bsa.swipesavvy.com if not provided
      const uniqueCode = response.data.uniqueCode;
      const link = response.data.shareableLink || `https://bsa.swipesavvy.com/campcard/offers/?offer=${uniqueCode}`;

      setShareableLink(link);
      setQrData({
        type: 'campcard_offer',
        offerId: offer.id,
        uniqueCode: uniqueCode,
        merchantName: offer.merchantName,
        discount: offer.discountPercentage
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to generate shareable link');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${offer.discountPercentage}% discount at ${offer.merchantName}! ${offer.title}\n\n${shareableLink}`,
        url: shareableLink,
        title: `${offer.discountPercentage}% OFF at ${offer.merchantName}`
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to share offer');
    }
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(shareableLink);
    Alert.alert('Copied!', 'Offer link copied to clipboard');
  };

  const handleShareViaEmail = () => {
    const subject = encodeURIComponent(`${offer.discountPercentage}% OFF at ${offer.merchantName}`);
    const body = encodeURIComponent(
      `${offer.title}\n\n${offer.description}\n\nGet ${offer.discountPercentage}% off at ${offer.merchantName}!\n\n${shareableLink}`
    );
    // This would open the email app
    Alert.alert('Email', `mailto:?subject=${subject}&body=${body}`);
  };

  const handleShareViaSMS = () => {
    const message = encodeURIComponent(
      `Check out this ${offer.discountPercentage}% discount at ${offer.merchantName}! ${shareableLink}`
    );
    Alert.alert('SMS', `sms:?body=${message}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003f87" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#003f87" />
      </TouchableOpacity>

      <Text style={styles.title}>Share Offer</Text>
      <Text style={styles.subtitle}>
        Share this exclusive discount with friends and family
      </Text>

      {/* Offer Details */}
      <View style={styles.offerCard}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{offer.discountPercentage}% OFF</Text>
        </View>
        <Text style={styles.merchantName}>{offer.merchantName}</Text>
        <Text style={styles.offerTitle}>{offer.title}</Text>
      </View>

      {/* QR Code */}
      <View style={styles.qrContainer}>
        <QRCode
          value={JSON.stringify(qrData)}
          size={220}
          backgroundColor="white"
          color="#003f87"
        />
        <Text style={styles.qrLabel}>Scan to claim offer</Text>
      </View>

      {/* Shareable Link */}
      <View style={styles.linkSection}>
        <Text style={styles.sectionTitle}>Shareable Link</Text>
        <View style={styles.linkContainer}>
          <Text style={styles.linkText} numberOfLines={1}>
            {shareableLink}
          </Text>
        </View>
      </View>

      {/* Share Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleShare}
        >
          <Ionicons name="share-social" size={24} color="white" />
          <Text style={styles.primaryButtonText}>Share</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleCopyLink}
          >
            <Ionicons name="copy-outline" size={20} color="#003f87" />
            <Text style={styles.secondaryButtonText}>Copy Link</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleShareViaEmail}
          >
            <Ionicons name="mail-outline" size={20} color="#003f87" />
            <Text style={styles.secondaryButtonText}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleShareViaSMS}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#003f87" />
            <Text style={styles.secondaryButtonText}>SMS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#666" />
        <Text style={styles.infoBoxText}>
          Anyone with this link can view the offer. They'll need a Camp Card subscription to redeem it.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003f87',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  offerCard: {
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
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ce1126',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  discountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  merchantName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f87',
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
    elevation: 3,
  },
  qrLabel: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
  },
  linkSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003f87',
    marginBottom: 10,
  },
  linkContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  linkText: {
    fontSize: 14,
    color: '#003f87',
    fontFamily: 'monospace',
  },
  actionsSection: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#ce1126',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 15,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#003f87',
  },
  secondaryButtonText: {
    color: '#003f87',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
    marginLeft: 10,
    lineHeight: 18,
  },
});
