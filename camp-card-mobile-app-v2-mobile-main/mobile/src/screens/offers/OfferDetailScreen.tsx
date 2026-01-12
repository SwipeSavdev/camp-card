import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../utils/api';

interface Offer {
  id: number;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  minPurchaseAmount?: number;
  category: string;
  terms: string;
  imageUrl?: string;
  validFrom: string;
  validUntil: string;
  featured: boolean;
  scoutExclusive: boolean;
  merchantName?: string;
  isValid: boolean;
}

export default function OfferDetailScreen() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const { offerId } = route.params as { offerId: number };

  useEffect(() => {
    loadOffer();
  }, [offerId]);

  const loadOffer = async () => {
    try {
      const response = await apiClient.get(`/api/v1/offers/${offerId}`);
      setOffer(response.data);
    } catch (error) {
      console.error('Error loading offer:', error);
      Alert.alert('Error', 'Failed to load offer');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = () => {
    if (!offer?.isValid) {
      Alert.alert('Unavailable', 'This offer is no longer available');
      return;
    }
    Alert.alert(
      'Redeem Offer',
      `Show this screen to the merchant to redeem your "${offer.title}" offer.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Got it!', style: 'default' }
      ]
    );
  };

  const getDiscountText = () => {
    if (!offer) return '';
    switch (offer.discountType) {
      case 'PERCENTAGE': return `${offer.discountValue}% OFF`;
      case 'FIXED_AMOUNT': return `$${offer.discountValue} OFF`;
      case 'BUY_ONE_GET_ONE': return 'BOGO';
      default: return 'DISCOUNT';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003f87" />
      </View>
    );
  }

  if (!offer) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#003f87" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offer Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        <View style={styles.imageContainer}>
          {offer.imageUrl ? (
            <Image source={{ uri: offer.imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.imagePlaceholder]}>
              <Ionicons name="pricetag" size={80} color="#ccc" />
            </View>
          )}
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{getDiscountText()}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {offer.featured && (
            <View style={styles.featuredTag}>
              <Ionicons name="star" size={14} color="#fff" />
              <Text style={styles.tagText}>Featured</Text>
            </View>
          )}

          <Text style={styles.title}>{offer.title}</Text>
          <Text style={styles.description}>{offer.description}</Text>

          {offer.terms && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Terms & Conditions</Text>
              <Text style={styles.termsText}>{offer.terms}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.redeemButton, !offer.isValid && styles.buttonDisabled]}
          onPress={handleRedeem}
          disabled={!offer.isValid}
        >
          <Text style={styles.redeemButtonText}>
            {offer.isValid ? 'Redeem Offer' : 'Offer Unavailable'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f87',
  },
  imageContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#ce1126',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  discountText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  featuredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f87',
    marginBottom: 12,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  redeemButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  redeemButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
