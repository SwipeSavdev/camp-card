import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { merchantsApi } from '../utils/api';

interface MerchantLocation {
  id: number;
  locationName: string;
  streetAddress: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  hours?: string;
  primaryLocation: boolean;
}

interface Merchant {
  id: number;
  uuid: string;
  businessName: string;
  dbaName?: string;
  description: string;
  category: string;
  contactPhone?: string;
  websiteUrl?: string;
  logoUrl?: string;
  activeOffers: number;
  totalRedemptions: number;
  locations: MerchantLocation[];
}

interface Offer {
  id: number;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  category: string;
  validUntil: string;
  featured: boolean;
  imageUrl?: string;
}

export default function MerchantDetailScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MerchantLocation | null>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { merchantId } = route.params as { merchantId: number };

  useEffect(() => {
    loadMerchantData();
  }, [merchantId]);

  const loadMerchantData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Load merchant and offers in parallel
      const [merchantResponse, offersResponse] = await Promise.all([
        merchantsApi.getMerchantById(merchantId),
        merchantsApi.getMerchantOffers(merchantId)
      ]);

      setMerchant(merchantResponse.data);
      setOffers(offersResponse.data.content || offersResponse.data || []);

      // Set primary location or first location as selected
      const primaryLoc = merchantResponse.data.locations?.find((l: MerchantLocation) => l.primaryLocation);
      setSelectedLocation(primaryLoc || merchantResponse.data.locations?.[0] || null);
    } catch (error) {
      console.error('Error loading merchant:', error);
      Alert.alert('Error', 'Failed to load merchant details');
      if (!isRefresh) {
        navigation.goBack();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadMerchantData(true);
  };

  const handleCall = () => {
    const phone = selectedLocation?.phone || merchant?.contactPhone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleDirections = () => {
    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      const url = `https://maps.google.com/?q=${selectedLocation.latitude},${selectedLocation.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleWebsite = () => {
    if (merchant?.websiteUrl) {
      Linking.openURL(merchant.websiteUrl);
    }
  };

  const handleOfferPress = (offerId: number) => {
    navigation.navigate('OfferDetail', { offerId });
  };

  const getDiscountText = (offer: Offer) => {
    switch (offer.discountType) {
      case 'PERCENTAGE':
        return `${offer.discountValue}% OFF`;
      case 'FIXED_AMOUNT':
        return `$${offer.discountValue} OFF`;
      case 'BUY_ONE_GET_ONE':
        return 'BOGO';
      case 'FREE_ITEM':
        return 'FREE ITEM';
      default:
        return 'DISCOUNT';
    }
  };

  const getDaysRemaining = (validUntil: string) => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Expired';
    if (diff === 0) return 'Ends today';
    if (diff === 1) return '1 day left';
    return `${diff} days left`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003f87" />
      </View>
    );
  }

  if (!merchant) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#003f87" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {merchant.businessName}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#003f87']}
            tintColor="#003f87"
          />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {merchant.logoUrl ? (
            <Image source={{ uri: merchant.logoUrl }} style={styles.heroLogo} />
          ) : (
            <View style={[styles.heroLogo, styles.logoPlaceholder]}>
              <Ionicons name="business-outline" size={64} color="#ccc" />
            </View>
          )}
          
          <Text style={styles.businessName}>{merchant.businessName}</Text>
          {merchant.dbaName && (
            <Text style={styles.dbaName}>{merchant.dbaName}</Text>
          )}
          <Text style={styles.category}>{merchant.category}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <View style={styles.actionButton}>
            <Ionicons name="pricetag" size={24} color="#ce1126" />
            <Text style={styles.actionButtonText}>
              {offers.length} Offers
            </Text>
          </View>

          {(selectedLocation?.phone || merchant.contactPhone) && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCall}
            >
              <Ionicons name="call" size={24} color="#003f87" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
          )}

          {selectedLocation?.latitude && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleDirections}
            >
              <Ionicons name="navigate" size={24} color="#003f87" />
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
          )}

          {merchant.websiteUrl && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleWebsite}
            >
              <Ionicons name="globe" size={24} color="#003f87" />
              <Text style={styles.actionButtonText}>Website</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        {merchant.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{merchant.description}</Text>
          </View>
        )}

        {/* Offers */}
        {offers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Offers</Text>
            {offers.map((offer) => (
              <TouchableOpacity
                key={offer.id}
                style={styles.offerCard}
                onPress={() => handleOfferPress(offer.id)}
              >
                <View style={styles.offerHeader}>
                  <View style={styles.offerInfo}>
                    <Text style={styles.offerTitle} numberOfLines={1}>{offer.title}</Text>
                    {offer.description && (
                      <Text style={styles.offerDescription} numberOfLines={2}>
                        {offer.description}
                      </Text>
                    )}
                  </View>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{getDiscountText(offer)}</Text>
                  </View>
                </View>
                <View style={styles.offerFooter}>
                  <View style={styles.offerMeta}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.offerMetaText}>{getDaysRemaining(offer.validUntil)}</Text>
                  </View>
                  {offer.featured && (
                    <View style={styles.featuredBadge}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.featuredText}>Featured</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* No Offers Message */}
        {offers.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Offers</Text>
            <View style={styles.noOffersContainer}>
              <Ionicons name="pricetag-outline" size={48} color="#ccc" />
              <Text style={styles.noOffersText}>No active offers</Text>
              <Text style={styles.noOffersSubtext}>Check back soon for new deals!</Text>
            </View>
          </View>
        )}

        {/* Map */}
        {selectedLocation?.latitude && selectedLocation?.longitude && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <MapView
              style={styles.map}
              region={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
                title={selectedLocation.locationName}
              />
            </MapView>
          </View>
        )}

        {/* Locations */}
        {merchant.locations && merchant.locations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {merchant.locations.length === 1 ? 'Location' : 'Locations'}
            </Text>
            {merchant.locations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.locationCard,
                  selectedLocation?.id === location.id && styles.locationCardActive
                ]}
                onPress={() => setSelectedLocation(location)}
              >
                <View style={styles.locationHeader}>
                  <Ionicons 
                    name={location.primaryLocation ? "star" : "location"} 
                    size={20} 
                    color={location.primaryLocation ? "#ce1126" : "#003f87"} 
                  />
                  <Text style={styles.locationName}>{location.locationName}</Text>
                </View>
                
                <Text style={styles.locationAddress}>
                  {location.streetAddress}
                  {location.addressLine2 && `\n${location.addressLine2}`}
                </Text>
                <Text style={styles.locationAddress}>
                  {location.city}, {location.state} {location.zipCode}
                </Text>

                {location.phone && (
                  <View style={styles.locationDetail}>
                    <Ionicons name="call-outline" size={16} color="#666" />
                    <Text style={styles.locationDetailText}>{location.phone}</Text>
                  </View>
                )}

                {location.hours && (
                  <View style={styles.locationDetail}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.locationDetailText}>{location.hours}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Ionicons name="pricetag-outline" size={32} color="#ce1126" />
              <Text style={styles.statValue}>{merchant.activeOffers}</Text>
              <Text style={styles.statLabel}>Active Offers</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="checkmark-circle-outline" size={32} color="#4CAF50" />
              <Text style={styles.statValue}>{merchant.totalRedemptions}</Text>
              <Text style={styles.statLabel}>Total Redemptions</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="location-outline" size={32} color="#003f87" />
              <Text style={styles.statValue}>{merchant.locations?.length || 0}</Text>
              <Text style={styles.statLabel}>Locations</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f87',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  heroSection: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  heroLogo: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 16,
  },
  logoPlaceholder: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  dbaName: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: '#999',
    textTransform: 'capitalize',
  },
  actionsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f87',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  map: {
    height: 200,
    borderRadius: 8,
  },
  locationCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  locationCardActive: {
    borderColor: '#003f87',
    borderWidth: 2,
    backgroundColor: '#f0f7ff',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  locationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  // Offer styles
  offerCard: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  offerInfo: {
    flex: 1,
    marginRight: 12,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  discountBadge: {
    backgroundColor: '#ce1126',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  offerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  offerMetaText: {
    fontSize: 13,
    color: '#666',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
  noOffersContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noOffersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  noOffersSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});
