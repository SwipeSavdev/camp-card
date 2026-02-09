import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../utils/api';
import { useTheme } from '../config/ThemeContext';

interface Offer {
  id: number;
  merchantName: string;
  title: string;
  description: string;
  discountPercentage: number;
  imageUrl?: string;
  expiresAt: string;
  termsAndConditions: string;
  category: string;
}

export default function OfferDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { offer, fromScanner } = route.params as { offer: Offer; fromScanner?: boolean };
  const { theme } = useTheme();
  const { colors } = theme;

  const [redeeming, setRedeeming] = useState(false);

  const handleRedeem = async () => {
    Alert.alert(
      'Redeem Offer',
      `Are you sure you want to redeem this ${offer.discountPercentage}% discount at ${offer.merchantName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            setRedeeming(true);
            try {
              const response = await apiClient.post('/redemptions', {
                offerId: offer.id,
                timestamp: new Date().toISOString()
              });
              
              // Navigate to redemption success screen with QR code
              navigation.navigate('RedemptionSuccess', {
                redemption: response.data,
                offer: offer
              });
            } catch (error: any) {
              Alert.alert(
                'Redemption Failed',
                error.response?.data?.error || error.response?.data?.message || 'Unable to redeem offer. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setRedeeming(false);
            }
          }
        }
      ]
    );
  };

  const handleShareOffer = () => {
    navigation.navigate('ShareOffer', { offer });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {offer.imageUrl ? (
            <Image
              source={{ uri: offer.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, styles.placeholderImage, { backgroundColor: colors.background }]}>
              <Ionicons name="gift" size={64} color={colors.textSecondary} />
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Offer Details */}
        <View style={styles.content}>
          <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.discountText, { color: colors.white }]}>{offer.discountPercentage}% OFF</Text>
          </View>

          <Text style={[styles.merchantName, { color: colors.textSecondary }]}>{offer.merchantName}</Text>
          <Text style={[styles.title, { color: colors.secondary }]}>{offer.title}</Text>

          <View style={styles.categoryContainer}>
            <Ionicons name="pricetag" size={16} color={colors.textSecondary} />
            <Text style={[styles.category, { color: colors.textSecondary }]}>{offer.category}</Text>
          </View>

          <View style={styles.expiryContainer}>
            <Ionicons name="calendar" size={16} color={colors.textSecondary} />
            <Text style={[styles.expiry, { color: colors.textSecondary }]}>Expires: {formatDate(offer.expiresAt)}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Description</Text>
          <Text style={[styles.description, { color: colors.text }]}>{offer.description}</Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Terms & Conditions</Text>
          <Text style={[styles.terms, { color: colors.textSecondary }]}>{offer.termsAndConditions}</Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: colors.surface, borderColor: colors.secondary }]}
          onPress={handleShareOffer}
          accessibilityLabel="Share Offer"
          accessibilityRole="button"
        >
          <Ionicons name="share-social" size={20} color={colors.secondary} />
          <Text style={[styles.shareButtonText, { color: colors.secondary }]}>Share Offer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.redeemButton, { backgroundColor: colors.primary }, redeeming && styles.redeemButtonDisabled]}
          onPress={handleRedeem}
          disabled={redeeming}
          accessibilityLabel="Redeem Offer"
          accessibilityRole="button"
        >
          {redeeming ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
              <Text style={[styles.redeemButtonText, { color: colors.white }]}>Redeem Offer</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 250,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ce1126',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
  },
  discountText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  merchantName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003f87',
    marginBottom: 15,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
    textTransform: 'capitalize',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  expiry: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f87',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  terms: {
    fontSize: 14,
    color: '#666',
  },
  shareButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#003f87',
  },
  shareButtonText: {
    color: '#003f87',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  redeemButton: {
    backgroundColor: '#ce1126',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  redeemButtonDisabled: {
    opacity: 0.6,
  },
  redeemButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
